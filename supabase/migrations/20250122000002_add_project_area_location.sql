-- Add missing project fields used by the app
alter table projects
  add column if not exists location text,
  add column if not exists area_sqm int;
