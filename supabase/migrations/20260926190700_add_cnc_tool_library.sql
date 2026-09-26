create table if not exists public.cnc_tool_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  geometry_schema jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cnc_tools (
  id uuid primary key default gen_random_uuid(),
  tool_type_id uuid not null
    references public.cnc_tool_types(id)
    on delete restrict,
  name text not null,
  diameter numeric(12,3),
  shank_diameter numeric(12,3),
  flutes integer,
  cutting_length numeric(12,3),
  flute_length numeric(12,3),
  overall_length numeric(12,3),
  corner_radius numeric(12,3),
  tip_angle numeric(12,3),
  tool_material text not null,
  coating text,
  geometry jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cnc_materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  cutting_speed_vc numeric(12,3),
  feed_per_tooth_fz numeric(12,5),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cnc_operations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cnc_tools_tool_type_idx
on public.cnc_tools(tool_type_id);

create index if not exists cnc_tools_active_idx
on public.cnc_tools(active);

create index if not exists cnc_materials_active_idx
on public.cnc_materials(active);

create index if not exists cnc_operations_active_idx
on public.cnc_operations(active);

alter table public.cnc_tool_types enable row level security;
alter table public.cnc_tools enable row level security;
alter table public.cnc_materials enable row level security;
alter table public.cnc_operations enable row level security;

drop policy if exists "Authenticated users can read CNC tool types"
on public.cnc_tool_types;

create policy "Authenticated users can read CNC tool types"
on public.cnc_tool_types
for select to authenticated
using (true);

drop policy if exists "Authenticated users can read CNC tools"
on public.cnc_tools;

create policy "Authenticated users can read CNC tools"
on public.cnc_tools
for select to authenticated
using (true);

drop policy if exists "Authenticated users can read CNC materials"
on public.cnc_materials;

create policy "Authenticated users can read CNC materials"
on public.cnc_materials
for select to authenticated
using (true);

drop policy if exists "Authenticated users can read CNC operations"
on public.cnc_operations;

create policy "Authenticated users can read CNC operations"
on public.cnc_operations
for select to authenticated
using (true);

insert into public.cnc_tool_types (code, name, description)
values
('end_mill_flat', 'Čelni rezkar – ravno čelo', 'Standardni čelni rezkar z ravnim čelom.'),
('end_mill_chamfer', 'Čelni rezkar – posneto čelo', 'Čelni rezkar s posnetim spodnjim robom.'),
('ball_end_mill', 'Kroglični rezkar', 'Rezkar s kroglasto konico.'),
('bull_nose_end_mill', 'Torusni rezkar', 'Čelni rezkar z radijem na spodnjem robu.'),
('t_slot_cutter', 'T-rezkar', 'Rezkar za izdelavo T-utorov.'),
('face_mill', 'Čelni rezkar / Face Mill', 'Večrezno orodje za čelno rezkanje.'),
('dovetail_cutter', 'Lastovičji rep', 'Rezkar za lastovičje repe in poševne utore.'),
('chamfer_mill', 'Fazni rezkar', 'Orodje za posnemanje robov in faz.'),
('slot_mill', 'Rezkar za utore', 'Rezkar za izdelavo ozkih utorov.'),
('tapered_end_mill', 'Konusni rezkar', 'Čelni rezkar s konusno geometrijo.'),
('angular_mill', 'Kotovni rezkar', 'Rezkar za poševne in kotne površine.'),
('drill', 'Sveder', 'Vrtalno orodje.'),
('custom_mill', 'Posebno orodje', 'Orodje s poljubno uporabniško geometrijo.')
on conflict (code) do nothing;

insert into public.cnc_operations (code, name, description)
values
('milling', 'Rezkanje', 'Standardno rezkanje.'),
('slotting', 'Utor', 'Rezkanje z večjo radialno vpetostjo oziroma polno širino.'),
('plunging', 'Potapljanje', 'Vertikalno potapljanje orodja.')
on conflict (code) do nothing;
