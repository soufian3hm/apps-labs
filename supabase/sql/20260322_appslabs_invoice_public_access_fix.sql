begin;

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

commit;
