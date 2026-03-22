begin;

update public.appslabs_leads
set client_locale = case
  when lower(coalesce(client_locale, '')) = 'ar' then 'AR'
  else 'EN'
end;

alter table public.appslabs_leads
  alter column client_locale set default 'EN';

alter table public.appslabs_leads
  drop constraint if exists appslabs_leads_client_locale_check;

alter table public.appslabs_leads
  add constraint appslabs_leads_client_locale_check
  check (client_locale in ('AR', 'EN'));

commit;
