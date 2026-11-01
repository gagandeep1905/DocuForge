-- Harden the guest-auth database surface and address Supabase advisor findings.

-- The profile trigger is invoked by Postgres when auth.users rows are inserted.
-- It must not be exposed as a callable PostgREST RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Cover foreign keys identified by the Supabase Performance Advisor.
create index if not exists exports_document_id_idx on public.exports(document_id);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists projects_template_id_idx on public.projects(template_id);

-- Evaluate auth.uid() once per statement rather than once per candidate row.
drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles
  for select using (id = (select auth.uid()));

drop policy if exists own_projects on public.projects;
create policy own_projects on public.projects
  for select using (user_id = (select auth.uid()));

drop policy if exists own_files on public.project_files;
create policy own_files on public.project_files
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_models on public.project_models;
create policy own_models on public.project_models
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_docs on public.documents;
create policy own_docs on public.documents
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_exports on public.exports;
create policy own_exports on public.exports
  for select using (
    exists (
      select 1
      from public.documents d
      join public.projects p on p.id = d.project_id
      where d.id = document_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_payments on public.payments;
create policy own_payments on public.payments
  for select using (user_id = (select auth.uid()));