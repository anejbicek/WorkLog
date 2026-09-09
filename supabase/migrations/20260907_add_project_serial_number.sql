alter table if exists public.projects
  add column if not exists serial_number text;
