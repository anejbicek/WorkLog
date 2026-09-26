create table if not exists public.cnc_cutting_parameters (
  id uuid primary key default gen_random_uuid(),

  tool_id uuid not null
    references public.cnc_tools(id)
    on delete cascade,

  material_id uuid not null
    references public.cnc_materials(id)
    on delete cascade,

  operation_id uuid not null
    references public.cnc_operations(id)
    on delete cascade,

  cutting_speed_vc numeric(12,3),
  feed_per_tooth_fz numeric(12,5),

  reference_rpm integer,
  reference_feed numeric(12,3),

  radial_depth_ae numeric(12,3),
  axial_depth_ap numeric(12,3),

  max_radial_depth_ae numeric(12,3),
  max_axial_depth_ap numeric(12,3),

  full_width_reference boolean not null default false,
  full_flute_reference boolean not null default true,

  notes text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cnc_cutting_parameters_unique
    unique (
      tool_id,
      material_id,
      operation_id
    )
);

create index if not exists
  cnc_cutting_parameters_tool_idx
on public.cnc_cutting_parameters(tool_id);

create index if not exists
  cnc_cutting_parameters_material_idx
on public.cnc_cutting_parameters(material_id);

create index if not exists
  cnc_cutting_parameters_operation_idx
on public.cnc_cutting_parameters(operation_id);

create index if not exists
  cnc_cutting_parameters_active_idx
on public.cnc_cutting_parameters(active);

create or replace function public.update_cnc_cutting_parameters_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  cnc_cutting_parameters_updated_at
on public.cnc_cutting_parameters;

create trigger
  cnc_cutting_parameters_updated_at
before update on public.cnc_cutting_parameters
for each row
execute function public.update_cnc_cutting_parameters_updated_at();

alter table public.cnc_cutting_parameters
enable row level security;

drop policy if exists
  "Authenticated users can read CNC cutting parameters"
on public.cnc_cutting_parameters;

create policy
  "Authenticated users can read CNC cutting parameters"
on public.cnc_cutting_parameters
for select
to authenticated
using (true);