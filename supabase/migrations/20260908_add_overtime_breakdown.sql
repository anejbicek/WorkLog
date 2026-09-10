alter table if exists public.work_orders
  add column if not exists overtime_normal_hours numeric not null default 0;

alter table if exists public.work_orders
  add column if not exists overtime_special_hours numeric not null default 0;
