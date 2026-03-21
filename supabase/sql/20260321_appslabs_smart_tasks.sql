create extension if not exists pgcrypto;

create table if not exists public.appslabs_smart_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.appslabs_leads(id) on delete cascade,
  title text not null,
  details text,
  completed boolean not null default false,
  sort_order integer not null default 0,
  task_type text not null default 'custom',
  due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint appslabs_smart_tasks_title_check check (char_length(trim(title)) > 0),
  constraint appslabs_smart_tasks_unique_task unique (lead_id, title)
);

create index if not exists appslabs_smart_tasks_lead_id_idx
  on public.appslabs_smart_tasks (lead_id);

create index if not exists appslabs_smart_tasks_pending_idx
  on public.appslabs_smart_tasks (completed, due_at);

create or replace function public.appslabs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists appslabs_smart_tasks_set_updated_at on public.appslabs_smart_tasks;
create trigger appslabs_smart_tasks_set_updated_at
before update on public.appslabs_smart_tasks
for each row
execute function public.appslabs_set_updated_at();

alter table public.appslabs_smart_tasks enable row level security;

drop policy if exists "appslabs smart tasks admin select" on public.appslabs_smart_tasks;
create policy "appslabs smart tasks admin select"
on public.appslabs_smart_tasks
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "appslabs smart tasks admin insert" on public.appslabs_smart_tasks;
create policy "appslabs smart tasks admin insert"
on public.appslabs_smart_tasks
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "appslabs smart tasks admin update" on public.appslabs_smart_tasks;
create policy "appslabs smart tasks admin update"
on public.appslabs_smart_tasks
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "appslabs smart tasks admin delete" on public.appslabs_smart_tasks;
create policy "appslabs smart tasks admin delete"
on public.appslabs_smart_tasks
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.id = auth.uid()
  )
);
