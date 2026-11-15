-- Normalize the existing database once per operation. The commit holds a write lock
-- throughout the snapshot, duplicate checks and inserts.
create or replace function public.preview_customer_import(p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  item jsonb; report jsonb := '[]'; batch_id uuid; reason text;
  names text[] := '{}'; emails text[] := '{}'; phones text[] := '{}';
  name_key text; email_key text; phone_key text;
  db_names text[]; db_emails text[]; db_phones text[];
begin
  if auth.uid() is null or not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'Expected rows array' using errcode='22023'; end if;
  if jsonb_array_length(p_rows) not between 1 and 2000 or octet_length(p_rows::text) > 2097152 then
    raise exception 'Import size limit exceeded' using errcode='22023';
  end if;
  select coalesce(array_agg(public.import_name_key(name)), '{}'::text[]),
    coalesce(array_agg(lower(trim(email))), '{}'::text[]),
    coalesce(array_agg(public.import_phone_key(phone)), '{}'::text[])
  into db_names, db_emails, db_phones from public.customers;
  for item in select value from jsonb_array_elements(p_rows) loop
    perform public.validate_import_customer(item);
    name_key := public.import_name_key(item->>'name');
    email_key := lower(trim(item->>'email'));
    phone_key := public.import_phone_key(item->>'phone');
    reason := null;
    if name_key = any(db_names) or (email_key is not null and email_key = any(db_emails)) or (phone_key <> '' and phone_key = any(db_phones)) then reason := 'Zgodna nazwa, e-mail lub telefon w bazie (również w archiwum).';
    elsif name_key = any(names) or email_key = any(emails) or (phone_key <> '' and phone_key = any(phones)) then
      reason := 'Zgodna nazwa, e-mail lub telefon we wcześniejszym wierszu pliku.';
    end if;
    report := report || jsonb_build_array(item || jsonb_build_object('status', case when reason is null then 'ready' else 'duplicate' end, 'reason', reason));
    if reason is null then
      names := array_append(names,name_key); emails := array_append(emails,email_key); phones := array_append(phones,phone_key);
    end if;
  end loop;
  -- Discard expired previews belonging to this user before staging a new one.
  delete from public.customer_import_batches where created_by=auth.uid() and status='preview' and expires_at < now();
  insert into public.customer_import_batches(created_by,rows) values(auth.uid(),report) returning id into batch_id;
  return jsonb_build_object('batch_id',batch_id,'rows',report);
end;
$$;

create or replace function public.commit_customer_import(p_batch_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  batch public.customer_import_batches%rowtype; item jsonb; customer_id uuid;
  imported integer := 0; skipped integer := 0; report jsonb := '[]'; outcome jsonb;
  db_names text[]; db_emails text[]; db_phones text[];
  name_key text; email_key text; phone_key text;
begin
  if auth.uid() is null or not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
  select * into batch from public.customer_import_batches where id=p_batch_id and created_by=auth.uid() for update;
  if not found then raise exception 'Preview not found' using errcode='P0001'; end if;
  if batch.status='committed' then return batch.result; end if;
  if batch.expires_at < now() then raise exception 'Preview expired' using errcode='P0001'; end if;
  -- Serialize with other imports AND ordinary customer writes during the final check.
  lock table public.customers in share row exclusive mode;
  select coalesce(array_agg(public.import_name_key(name)), '{}'::text[]),
    coalesce(array_agg(lower(trim(email))), '{}'::text[]),
    coalesce(array_agg(public.import_phone_key(phone)), '{}'::text[])
  into db_names, db_emails, db_phones from public.customers;
  for item in select value from jsonb_array_elements(batch.rows) loop
    perform public.validate_import_customer(item);
    name_key := public.import_name_key(item->>'name');
    email_key := lower(trim(item->>'email'));
    phone_key := public.import_phone_key(item->>'phone');
    if item->>'status' <> 'ready' or name_key = any(db_names) or (email_key is not null and email_key = any(db_emails)) or (phone_key <> '' and phone_key = any(db_phones)) then
      skipped := skipped+1;
      report := report || jsonb_build_array(jsonb_build_object('row_number',item->'row_number','status','skipped','reason',coalesce(item->>'reason','Klient pojawił się w bazie po przygotowaniu podglądu.')));
    else
      insert into public.customers(name,email,phone,type)
      values(trim(item->>'name'),lower(trim(item->>'email')),item->>'phone',(item->>'type')::public.customer_kind)
      returning id into customer_id;
      db_names := array_append(db_names,name_key);
      db_emails := array_append(db_emails,email_key);
      db_phones := array_append(db_phones,phone_key);
      imported := imported+1;
      report := report || jsonb_build_array(jsonb_build_object('row_number',item->'row_number','status','imported','customer_id',customer_id));
    end if;
  end loop;
  outcome := jsonb_build_object('imported',imported,'skipped',skipped,'rows',report);
  update public.customer_import_batches set status='committed', rows='[]', result=outcome where id=p_batch_id;
  return outcome;
end;
$$;

-- Comparisons now use one normalized snapshot rather than one lookup per row.
-- These provisional lookup indexes are unnecessary for the bulk path.
drop index public.customers_import_name_idx;
drop index public.customers_import_email_idx;
drop index public.customers_import_phone_idx;
drop function public.import_customer_exists(jsonb);
