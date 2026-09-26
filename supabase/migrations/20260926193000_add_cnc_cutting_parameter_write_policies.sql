-- ============================================================
-- WorkLog CNC
-- Pravice za urejanje rezalnih parametrov
--
-- Pisanje je dovoljeno samo glavnemu administratorju:
-- public.users.id = 1
-- ============================================================

create or replace function public.is_cnc_main_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where id = 1
      and (
        auth_user_id = auth.uid()
        or (
          lower(email) =
          lower(coalesce(auth.jwt() ->> 'email', ''))
        )
      )
  );
$$;


revoke all
on function public.is_cnc_main_admin()
from public;

grant execute
on function public.is_cnc_main_admin()
to authenticated;


-- ============================================================
-- INSERT
-- ============================================================

drop policy if exists
  "Main admin can insert CNC cutting parameters"
on public.cnc_cutting_parameters;

create policy
  "Main admin can insert CNC cutting parameters"
on public.cnc_cutting_parameters
for insert
to authenticated
with check (
  public.is_cnc_main_admin()
);


-- ============================================================
-- UPDATE
-- ============================================================

drop policy if exists
  "Main admin can update CNC cutting parameters"
on public.cnc_cutting_parameters;

create policy
  "Main admin can update CNC cutting parameters"
on public.cnc_cutting_parameters
for update
to authenticated
using (
  public.is_cnc_main_admin()
)
with check (
  public.is_cnc_main_admin()
);


-- ============================================================
-- DELETE
-- ============================================================

drop policy if exists
  "Main admin can delete CNC cutting parameters"
on public.cnc_cutting_parameters;

create policy
  "Main admin can delete CNC cutting parameters"
on public.cnc_cutting_parameters
for delete
to authenticated
using (
  public.is_cnc_main_admin()
);
