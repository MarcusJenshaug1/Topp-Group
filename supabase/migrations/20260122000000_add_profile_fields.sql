alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists avatar_url text;

alter table projects add column if not exists location text;
alter table projects add column if not exists area_sqm int;

-- Optional: keep email in sync if needed
-- update profiles set email = auth.users.email from auth.users where profiles.id = auth.users.id and profiles.email is null;
