-- Add display_name to profiles for author/owner labeling
alter table profiles add column if not exists display_name text;

-- Backfill missing display_name values from the email prefix
update profiles
set display_name = coalesce(nullif(display_name, ''), split_part(email, '@', 1))
where display_name is null or display_name = '';
