-- DOCUMENT VERSIONS
create table document_versions (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references documents(id) on delete cascade not null,
  version_label text not null,
  title text not null,
  file_path text not null,
  file_name text not null,
  mime_type text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table document_versions enable row level security;

-- DOCUMENT VERSIONS POLICIES
create policy "Document versions are viewable by authenticated users based on parent visibility"
  on document_versions for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from documents
      where documents.id = document_versions.document_id
      and (
        documents.visibility = 'authenticated'
        or
        (documents.visibility = 'admin_only' and exists (
          select 1 from profiles
          where profiles.id = auth.uid()
          and profiles.role in ('admin', 'editor')
        ))
      )
    )
  );

create policy "Only admins/editors can manage document versions"
  on document_versions for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );
