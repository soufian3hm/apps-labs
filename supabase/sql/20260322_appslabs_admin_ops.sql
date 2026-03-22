begin;

create or replace function public.appslabs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.appslabs_settings (
  id integer primary key,
  fb_pixel_id text,
  fb_pixel_token text,
  admin_notification_email text not null default 'soufian3hm@gmail.com',
  booking_timezone text not null default 'UTC',
  booking_start_hour integer not null default 9,
  booking_end_hour integer not null default 20,
  booking_slot_minutes integer not null default 30,
  booking_min_notice_minutes integer not null default 60,
  booking_day_window integer not null default 7,
  reminder_lead_minutes integer not null default 30,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.appslabs_settings
  add column if not exists admin_notification_email text not null default 'soufian3hm@gmail.com',
  add column if not exists booking_timezone text not null default 'UTC',
  add column if not exists booking_start_hour integer not null default 9,
  add column if not exists booking_end_hour integer not null default 20,
  add column if not exists booking_slot_minutes integer not null default 30,
  add column if not exists booking_min_notice_minutes integer not null default 60,
  add column if not exists booking_day_window integer not null default 7,
  add column if not exists reminder_lead_minutes integer not null default 30,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

insert into public.appslabs_settings (
  id,
  admin_notification_email,
  booking_timezone,
  booking_start_hour,
  booking_end_hour,
  booking_slot_minutes,
  booking_min_notice_minutes,
  booking_day_window,
  reminder_lead_minutes,
  updated_at
)
values (
  1,
  'soufian3hm@gmail.com',
  'UTC',
  9,
  20,
  30,
  60,
  7,
  30,
  timezone('utc', now())
)
on conflict (id) do update
set
  admin_notification_email = coalesce(public.appslabs_settings.admin_notification_email, excluded.admin_notification_email),
  booking_timezone = coalesce(public.appslabs_settings.booking_timezone, excluded.booking_timezone),
  booking_start_hour = coalesce(public.appslabs_settings.booking_start_hour, excluded.booking_start_hour),
  booking_end_hour = coalesce(public.appslabs_settings.booking_end_hour, excluded.booking_end_hour),
  booking_slot_minutes = coalesce(public.appslabs_settings.booking_slot_minutes, excluded.booking_slot_minutes),
  booking_min_notice_minutes = coalesce(public.appslabs_settings.booking_min_notice_minutes, excluded.booking_min_notice_minutes),
  booking_day_window = coalesce(public.appslabs_settings.booking_day_window, excluded.booking_day_window),
  reminder_lead_minutes = coalesce(public.appslabs_settings.reminder_lead_minutes, excluded.reminder_lead_minutes);

alter table public.appslabs_leads
  add column if not exists source_label text not null default 'website',
  add column if not exists assignee_email text,
  add column if not exists client_locale text not null default 'EN',
  add column if not exists meeting_timezone text not null default 'UTC',
  add column if not exists meeting_status text not null default 'scheduled',
  add column if not exists meeting_link text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.appslabs_leads
set
  source_label = coalesce(nullif(trim(source_label), ''), 'website'),
  client_locale = case when lower(coalesce(client_locale, '')) = 'ar' then 'AR' else 'EN' end,
  meeting_timezone = coalesce(nullif(trim(meeting_timezone), ''), 'UTC'),
  meeting_status = coalesce(nullif(trim(meeting_status), ''), 'scheduled'),
  updated_at = coalesce(updated_at, created_at, timezone('utc', now()));

alter table public.appslabs_leads
  alter column client_locale set default 'EN';

alter table public.appslabs_leads
  drop constraint if exists appslabs_leads_client_locale_check;

alter table public.appslabs_leads
  add constraint appslabs_leads_client_locale_check
  check (client_locale in ('AR', 'EN'));

create index if not exists appslabs_leads_meeting_timestamp_idx
  on public.appslabs_leads (meeting_timestamp);

create index if not exists appslabs_leads_meeting_status_idx
  on public.appslabs_leads (meeting_status);

create index if not exists appslabs_leads_source_label_idx
  on public.appslabs_leads (source_label);

create index if not exists appslabs_leads_assignee_email_idx
  on public.appslabs_leads (assignee_email);

drop trigger if exists appslabs_leads_set_updated_at on public.appslabs_leads;
create trigger appslabs_leads_set_updated_at
before update on public.appslabs_leads
for each row
execute function public.appslabs_set_updated_at();

drop trigger if exists appslabs_settings_set_updated_at on public.appslabs_settings;
create trigger appslabs_settings_set_updated_at
before update on public.appslabs_settings
for each row
execute function public.appslabs_set_updated_at();

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
        and tablename = 'appslabs_leads'
    ) then
      execute 'alter publication supabase_realtime add table public.appslabs_leads';
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'appslabs_email_logs'
    ) then
      execute 'alter publication supabase_realtime add table public.appslabs_email_logs';
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'appslabs_smart_tasks'
    ) then
      execute 'alter publication supabase_realtime add table public.appslabs_smart_tasks';
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'appslabs_kanban_columns'
    ) then
      execute 'alter publication supabase_realtime add table public.appslabs_kanban_columns';
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'appslabs_settings'
    ) then
      execute 'alter publication supabase_realtime add table public.appslabs_settings';
    end if;
  end if;
end
$$;

commit;
