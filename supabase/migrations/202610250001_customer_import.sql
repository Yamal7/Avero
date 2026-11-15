-- Preview data is private to the staff member who created it.
create table public.customer_import_batches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  status text not null default 'preview' check (status in ('preview','committed')),
  rows jsonb not null,
  result jsonb
);
alter table public.customer_import_batches enable row level security;
revoke all on public.customer_import_batches from anon, authenticated;
grant select on public.customer_import_batches to authenticated;
create policy import_batches_read on public.customer_import_batches for select to authenticated
using (created_by = (select auth.uid()) and public.is_staff());
create index import_batches_owner_idx on public.customer_import_batches(created_by, created_at);

create function public.import_name_key(value text) returns text
language sql immutable set search_path = '' as $$
  select lower(regexp_replace(trim(coalesce(value,'')), '\s+', ' ', 'g'));
$$;
create function public.import_phone_key(value text) returns text
language sql immutable set search_path = '' as $$
  select case when length(digits)=11 and left(digits,2)='48' then right(digits,9) else digits end
  from (select regexp_replace(coalesce(value,''), '[^0-9]', '', 'g') as digits) s;
$$;

create function public.validate_import_customer(item jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  if jsonb_typeof(item) is distinct from 'object'
    or jsonb_typeof(item->'name') is distinct from 'string'
    or length(trim(item->>'name')) not between 1 and 200
    or jsonb_typeof(item->'type') is distinct from 'string'
    or item->>'type' not in ('individual','company')
    or jsonb_typeof(item->'row_number') is distinct from 'number'
    or (item->>'row_number') !~ '^[1-9][0-9]{0,6}$'
  then raise exception 'Invalid import row' using errcode='22023'; end if;
  if item->>'email' is not null and (
    jsonb_typeof(item->'email') <> 'string' or length(item->>'email') > 320
    or (item->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then raise exception 'Invalid import email' using errcode='22023'; end if;
  if item->>'phone' is not null and (
    jsonb_typeof(item->'phone') <> 'string' or length(item->>'phone') > 40
    or (item->>'phone') !~ '^[+0-9[:space:]()./\-]+$'
    or length(regexp_replace(item->>'phone', '[^0-9]', '', 'g')) not between 7 and 15
  ) then raise exception 'Invalid import phone' using errcode='22023'; end if;
end;
$$;

create function public.import_customer_exists(item jsonb) returns boolean
language sql stable set search_path = '' as $$
  select exists(select 1 from public.customers c where
    public.import_name_key(c.name) = public.import_name_key(item->>'name')
    or (nullif(trim(item->>'email'),'') is not null and lower(trim(c.email)) = lower(trim(item->>'email')))
    or (nullif(public.import_phone_key(item->>'phone'),'') is not null and public.import_phone_key(c.phone) = public.import_phone_key(item->>'phone'))
  );
$$;

create function public.preview_customer_import(p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  item jsonb; report jsonb := '[]'; batch_id uuid; reason text;
  names text[] := '{}'; emails text[] := '{}'; phones text[] := '{}';
  name_key text; email_key text; phone_key text;
begin
  if auth.uid() is null or not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
  if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'Expected rows array' using errcode='22023'; end if;
  if jsonb_array_length(p_rows) not between 1 and 2000 or octet_length(p_rows::text) > 2097152 then
    raise exception 'Import size limit exceeded' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(p_rows) loop
    perform public.validate_import_customer(item);
    name_key := public.import_name_key(item->>'name');
    email_key := lower(trim(item->>'email'));
    phone_key := public.import_phone_key(item->>'phone');
    reason := null;
    if public.import_customer_exists(item) then reason := 'Zgodna nazwa, e-mail lub telefon w bazie (również w archiwum).';
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

create function public.commit_customer_import(p_batch_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  batch public.customer_import_batches%rowtype; item jsonb; customer_id uuid;
  imported integer := 0; skipped integer := 0; report jsonb := '[]'; outcome jsonb;
begin
  if auth.uid() is null or not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
  select * into batch from public.customer_import_batches where id=p_batch_id and created_by=auth.uid() for update;
  if not found then raise exception 'Preview not found' using errcode='P0001'; end if;
  if batch.status='committed' then return batch.result; end if;
  if batch.expires_at < now() then raise exception 'Preview expired' using errcode='P0001'; end if;
  -- Serialize with other imports AND ordinary customer writes during the final check.
  lock table public.customers in share row exclusive mode;
  for item in select value from jsonb_array_elements(batch.rows) loop
    perform public.validate_import_customer(item);
    if item->>'status' <> 'ready' or public.import_customer_exists(item) then
      skipped := skipped+1;
      report := report || jsonb_build_array(jsonb_build_object('row_number',item->'row_number','status','skipped','reason',coalesce(item->>'reason','Klient pojawił się w bazie po przygotowaniu podglądu.')));
    else
      insert into public.customers(name,email,phone,type)
      values(trim(item->>'name'),lower(trim(item->>'email')),item->>'phone',(item->>'type')::public.customer_kind)
      returning id into customer_id;
      imported := imported+1;
      report := report || jsonb_build_array(jsonb_build_object('row_number',item->'row_number','status','imported','customer_id',customer_id));
    end if;
  end loop;
  outcome := jsonb_build_object('imported',imported,'skipped',skipped,'rows',report);
  update public.customer_import_batches set status='committed', rows='[]', result=outcome where id=p_batch_id;
  return outcome;
end;
$$;

create function public.discard_customer_import(p_batch_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
  delete from public.customer_import_batches where id=p_batch_id and created_by=auth.uid() and status='preview';
end;
$$;

revoke all on function public.import_name_key(text), public.import_phone_key(text), public.validate_import_customer(jsonb), public.import_customer_exists(jsonb) from public, anon, authenticated;
revoke all on function public.preview_customer_import(jsonb), public.commit_customer_import(uuid), public.discard_customer_import(uuid) from public, anon, authenticated;
grant execute on function public.preview_customer_import(jsonb), public.commit_customer_import(uuid), public.discard_customer_import(uuid) to authenticated;
