create table if not exists public.store_lead_form_settings (
    id uuid not null default gen_random_uuid(),
    store_id uuid not null references public.stores(id) on delete cascade,
    mode text not null default 'embedded' check (mode in ('popup', 'embedded')),
    country text not null default 'DZ',
    multi_country boolean not null default false,
    fields jsonb not null default '[]'::jsonb,
    styles jsonb not null default '{}'::jsonb,
    texts jsonb not null default '{}'::jsonb,
    rtl boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint store_lead_form_settings_pkey primary key (id),
    constraint store_lead_form_settings_store_id_key unique (store_id)
);

alter table public.store_lead_form_settings enable row level security;

create policy "Users can view their own store lead form settings"
    on public.store_lead_form_settings for select
    using (auth.uid() in (select user_id from public.stores where id = store_id));

create policy "Users can insert their own store lead form settings"
    on public.store_lead_form_settings for insert
    with check (auth.uid() in (select user_id from public.stores where id = store_id));

create policy "Users can update their own store lead form settings"
    on public.store_lead_form_settings for update
    using (auth.uid() in (select user_id from public.stores where id = store_id));

-- Add public policy for reading settings (needed for public product pages)
create policy "Public can view store lead form settings"
    on public.store_lead_form_settings for select
    using (true);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_store_lead_form_settings_updated_at
    before update on public.store_lead_form_settings
    for each row execute procedure public.handle_updated_at();
