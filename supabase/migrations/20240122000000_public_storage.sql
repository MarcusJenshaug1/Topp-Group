-- Enable public read access to the toppgroup bucket so unauthenticated users can view images
-- 1. Update bucket to be public (optional but good for /object/public/ urls)
update storage.buckets
set public = true
where id = 'toppgroup';

-- 2. Add policy for public read access
create policy "Public Access to ToppGroup"
on storage.objects for select
using ( bucket_id = 'toppgroup' );
