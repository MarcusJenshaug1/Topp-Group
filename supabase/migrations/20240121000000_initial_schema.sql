-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- PROFILE POLICIES
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- PROJECT CATEGORIES
create table project_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table project_categories enable row level security;

-- PROJECT CATEGORIES POLICIES
create policy "Project categories are viewable by everyone" 
  on project_categories for select using (true);

create policy "Only admins/editors can insert/update/delete project categories" 
  on project_categories for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'editor')
    )
  );

-- PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references project_categories(id),
  title text not null,
  slug text unique not null,
  excerpt text,
  year int,
  content text,
  cover_image_path text,
  gallery jsonb default '[]'::jsonb,
  status text default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

-- PROJECTS POLICIES
create policy "Projects are viewable by everyone" 
  on projects for select using (true);

create policy "Only admins/editors can manage projects" 
  on projects for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'editor')
    )
  );

-- DOCUMENT CATEGORIES
create table document_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table document_categories enable row level security;

-- DOCUMENT CATEGORIES POLICIES
create policy "Document categories are viewable by authenticated users" 
  on document_categories for select 
  using (auth.role() = 'authenticated');

create policy "Only admins/editors can manage document categories" 
  on document_categories for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'editor')
    )
  );

-- DOCUMENTS
create table documents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category_id uuid references document_categories(id),
  tags text[],
  file_path text not null, -- Storage path
  file_name text not null,
  mime_type text,
  published_at timestamptz default now(),
  visibility text default 'authenticated' check (visibility in ('authenticated', 'admin_only')),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table documents enable row level security;

-- DOCUMENTS POLICIES
create policy "Documents are viewable by authenticated users based on visibility" 
  on documents for select 
  using (
    auth.role() = 'authenticated' 
    and (
      visibility = 'authenticated' 
      or 
      (visibility = 'admin_only' and exists (
        select 1 from profiles 
        where profiles.id = auth.uid() 
        and profiles.role in ('admin', 'editor')
      ))
    )
  );

create policy "Only admins/editors can manage documents" 
  on documents for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('admin', 'editor')
    )
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA (Optional categories)
insert into project_categories (name, slug, sort_order) values
('Næring', 'naring', 1),
('Bolig', 'bolig', 2),
('Fritidseiendom', 'fritidseiendom', 3),
('Hotell', 'hotell', 4);

insert into document_categories (name, slug, sort_order) values
('Rapporter', 'rapporter', 1),
('Prospekt', 'prospekt', 2),
('Avtaler', 'avtaler', 3);
