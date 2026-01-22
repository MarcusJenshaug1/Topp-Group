-- Add author tracking to projects
alter table projects add column if not exists created_by uuid references profiles(id);
alter table projects add column if not exists updated_by uuid references profiles(id);

-- Backfill authors to the first profile (assumes at least one admin user exists)
with first_profile as (
  select id from profiles order by created_at asc limit 1
)
update projects p
set
  created_by = coalesce(p.created_by, fp.id),
  updated_by = coalesce(p.updated_by, fp.id)
from first_profile fp
where p.created_by is null or p.updated_by is null;

-- New table for revision history
create table if not exists project_revisions (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references projects(id) on delete cascade,
    user_id uuid references profiles(id),
    action text not null,
    payload jsonb,
    created_at timestamptz default now()
);

alter table project_revisions enable row level security;

-- Policies: view/manage by admins/editors
drop policy if exists "Project revisions viewable by admins/editors" on project_revisions;
drop policy if exists "Project revisions manageable by admins/editors" on project_revisions;

create policy "Project revisions viewable by admins/editors"
  on project_revisions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin','editor')
    )
  );

create policy "Project revisions manageable by admins/editors"
  on project_revisions for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin','editor')
    )
  );
