begin;

create extension if not exists pgcrypto;

create or replace function public.appslabs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.appslabs_invoices (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.appslabs_leads(id) on delete set null,
  invoice_number text not null unique,
  title text not null default 'Project Invoice',
  status text not null default 'draft',
  client_name text not null,
  client_email text not null,
  client_company text,
  client_locale text not null default 'EN',
  currency_code text not null default 'USD',
  issue_date date not null default current_date,
  due_date date not null default current_date,
  line_items jsonb not null default '[]'::jsonb,
  subtotal_amount integer not null default 0,
  total_amount integer not null default 0,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint appslabs_invoices_status_check check (status in ('draft', 'sent', 'paid', 'void')),
  constraint appslabs_invoices_client_locale_check check (client_locale in ('AR', 'EN')),
  constraint appslabs_invoices_currency_code_check check (char_length(trim(currency_code)) = 3),
  constraint appslabs_invoices_subtotal_nonnegative check (subtotal_amount >= 0),
  constraint appslabs_invoices_total_nonnegative check (total_amount >= 0)
);

create index if not exists appslabs_invoices_lead_id_idx
  on public.appslabs_invoices (lead_id);

create index if not exists appslabs_invoices_status_idx
  on public.appslabs_invoices (status);

create index if not exists appslabs_invoices_created_at_idx
  on public.appslabs_invoices (created_at desc);

drop trigger if exists appslabs_invoices_set_updated_at on public.appslabs_invoices;
create trigger appslabs_invoices_set_updated_at
before update on public.appslabs_invoices
for each row
execute function public.appslabs_set_updated_at();

alter table public.appslabs_invoices enable row level security;

drop policy if exists "appslabs invoices public select" on public.appslabs_invoices;
create policy "appslabs invoices public select"
on public.appslabs_invoices
for select
to anon, authenticated
using (
  status in ('draft', 'sent', 'paid')
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "appslabs invoices admin insert" on public.appslabs_invoices;
create policy "appslabs invoices admin insert"
on public.appslabs_invoices
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

drop policy if exists "appslabs invoices admin update" on public.appslabs_invoices;
create policy "appslabs invoices admin update"
on public.appslabs_invoices
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

drop policy if exists "appslabs invoices admin delete" on public.appslabs_invoices;
create policy "appslabs invoices admin delete"
on public.appslabs_invoices
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'appslabs_invoices'
    ) then
      execute 'alter publication supabase_realtime add table public.appslabs_invoices';
    end if;
  end if;
end
$$;

commit;
