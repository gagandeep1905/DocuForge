-- Guest sessions created by Supabase Anonymous Sign-Ins use the
-- authenticated Postgres role. Scope all workspace policies to that role
-- instead of PUBLIC/anon while preserving per-user auth.uid() checks.

drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists own_projects on public.projects;
create policy own_projects on public.projects
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists own_files on public.project_files;
create policy own_files on public.project_files
  for select to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_models on public.project_models;
create policy own_models on public.project_models
  for select to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_docs on public.documents;
create policy own_docs on public.documents
  for select to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_exports on public.exports;
create policy own_exports on public.exports
  for select to authenticated
  using (
    exists (
      select 1
      from public.documents d
      join public.projects p on p.id = d.project_id
      where d.id = document_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists own_payments on public.payments;
create policy own_payments on public.payments
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists public_templates on public.university_templates;
create policy public_templates on public.university_templates
  for select to authenticated
  using (is_public);
