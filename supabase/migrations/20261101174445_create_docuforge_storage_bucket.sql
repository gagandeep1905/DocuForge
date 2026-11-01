-- Private upload bucket for DocuForge source ZIP archives.
-- The 50 MiB per-file limit matches Supabase Free Storage limits.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'docuforge-uploads',
  'docuforge-uploads',
  false,
  52428800,
  array['application/zip']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated guest users may upload only under uploads/<their-user-id>/.
drop policy if exists docuforge_uploads_insert_own on storage.objects;
create policy docuforge_uploads_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'docuforge-uploads'
  and (storage.foldername(name))[1] = 'uploads'
  and (storage.foldername(name))[2] = (select auth.uid())::text
);
