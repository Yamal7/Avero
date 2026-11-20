-- Keep duplicate checks fast as the CRM and import files grow.
create index customers_import_name_idx on public.customers(public.import_name_key(name));
create index customers_import_email_idx on public.customers(lower(trim(email)));
create index customers_import_phone_idx on public.customers(public.import_phone_key(phone));
-- Pure normalization functions also serve expression indexes during ordinary writes.
grant execute on function public.import_name_key(text), public.import_phone_key(text) to authenticated;
