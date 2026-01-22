-- Add full_name and title-case display_name for nicer author labels
alter table profiles add column if not exists full_name text;

-- Title-case existing display_name and backfill full_name
update profiles
set
  display_name = nullif(initcap(display_name), ''),
  full_name = coalesce(nullif(full_name, ''), nullif(initcap(display_name), ''), split_part(email, '@', 1))
where display_name is not null or email is not null;
