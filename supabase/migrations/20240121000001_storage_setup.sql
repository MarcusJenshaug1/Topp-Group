-- 1. Create the storage bucket 'toppgroup' (Private)
insert into storage.buckets (id, name, public)
values ('toppgroup', 'toppgroup', false)
on conflict (id) do nothing;

-- 2. Enable RLS on storage.objects (usually enabled by default, but good to ensure)
alter table storage.objects enable row level security;

-- 3. Policy: Allow Admins/Editors to upload, update, delete, select files
create policy "Admins and Editors have full access to toppgroup bucket"
on storage.objects
for all
using (
  bucket_id = 'toppgroup' 
  and exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role in ('admin', 'editor')
  )
)
with check (
  bucket_id = 'toppgroup' 
  and exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role in ('admin', 'editor')
  )
);

-- 4. Policy: Allow all authenticated users to READ (for downloading/previewing)
-- Note: actual visibility (admin_only vs authenticated) is controlled by the 'documents' table in the app.
-- This storage policy just allows the technical retrieval of the file content if you have a valid session.
create policy "Authenticated users can read (select) from toppgroup bucket"
on storage.objects
for select
using (
  bucket_id = 'toppgroup'
  and auth.role() = 'authenticated'
);
