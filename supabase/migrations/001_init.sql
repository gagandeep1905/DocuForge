-- DocuForge Week 1 schema. Run in the Supabase SQL editor or via \`supabase db push\`.
create extension if not exists pgcrypto;

create table university_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  config jsonb not null,
  is_public boolean not null default true
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  college text,
  plan text not null default 'free' check (plan in ('free','pay_per_project','monthly')),
  credits int not null default 1,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('zip','github')),
  source_ref text not null,
  status text not null default 'uploaded'
    check (status in ('uploaded','ingesting','ingested','modeling','needs_input','ready','generating','done','failed')),
  error text,
  user_notes text,
  coverage jsonb,
  template_id uuid references university_templates(id),
  created_at timestamptz not null default now()
);
create index projects_user_idx on projects(user_id, created_at desc);

create table project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  path text not null,
  language text,
  size_bytes int not null,
  content text not null,            -- redacted, size-capped at ingest
  role text,
  score int not null default 0,
  analyze boolean not null default false,
  summary text,                     -- filled in Week 2
  unique (project_id, path)
);
create index project_files_project_idx on project_files(project_id, analyze);

create table project_models (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version int not null default 1,
  model jsonb not null,
  missing_fields jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (project_id, version)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  doc_type text not null,
  content jsonb not null default '{}',
  status text not null default 'pending',
  model_version int not null default 1,
  updated_at timestamptz not null default now(),
  unique (project_id, doc_type)
);

create table exports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  format text not null check (format in ('docx','pdf','pptx')),
  storage_key text not null,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  amount_paise int not null,
  kind text not null check (kind in ('project','subscription')),
  status text not null default 'created',
  created_at timestamptz not null default now()
);

-- Auto-create a profile for every new auth user
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- RLS: clients may only READ their own rows. All writes go through API routes
-- using the service-role key, which bypasses RLS.
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table project_models enable row level security;
alter table documents enable row level security;
alter table exports enable row level security;
alter table payments enable row level security;
alter table university_templates enable row level security;

create policy own_profile on profiles for select using (id = auth.uid());
create policy own_projects on projects for select using (user_id = auth.uid());
create policy own_files on project_files for select using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy own_models on project_models for select using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy own_docs on documents for select using (
  exists (select 1 from projects p where p.id = project_id and p.user_id = auth.uid()));
create policy own_exports on exports for select using (
  exists (select 1 from documents d join projects p on p.id = d.project_id
          where d.id = document_id and p.user_id = auth.uid()));
create policy own_payments on payments for select using (user_id = auth.uid());
create policy public_templates on university_templates for select using (is_public);

insert into university_templates (name, config) values
('Generic B.Tech Report', '{
  "page": {"size":"A4","margins_cm":{"top":2.5,"bottom":2.5,"left":3.75,"right":2.5}},
  "font": {"body":"Times New Roman","size_pt":12,"line_spacing":1.5},
  "headings": {"h1":{"size_pt":16,"bold":true,"caps":true},"h2":{"size_pt":14,"bold":true}},
  "chapters": ["Introduction","System Analysis","System Design","Implementation","Testing","Conclusion"],
  "front_matter": ["cover","certificate","declaration","acknowledgement","abstract","toc","list_of_figures"],
  "page_numbers": {"front":"roman","body":"arabic"},
  "cover_fields": ["title","team","guide","course","university","session"]
}');
