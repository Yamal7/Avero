alter table public.devices add column warranty_terms text not null default '' check(length(warranty_terms)<=2000);
alter table public.devices add column installed_on date;
create table public.installation_handovers (
 id uuid primary key references public.work_orders(id), protocol_number bigint generated always as identity unique,
 fields jsonb not null,internal_note text not null default '',version integer not null default 0,
 state text not null default 'draft' check(state in ('draft','published')),
 new_installation_id uuid not null default gen_random_uuid(), new_location_id uuid not null default gen_random_uuid(),
 snapshot jsonb,published_at timestamptz,updated_by uuid not null references auth.users(id),updated_at timestamptz not null default now(),
 received_state text check(received_state in ('accepted','reservations')),received_comment text,received_by uuid references auth.users(id),received_at timestamptz
);
create table public.installation_handover_files(id uuid primary key references public.installation_handovers(id),pdf bytea not null check(octet_length(pdf) between 5 and 2097152));
alter table public.installation_handovers enable row level security;
alter table public.installation_handover_files enable row level security;
revoke all on public.installation_handovers,public.installation_handover_files from public,anon,authenticated;
grant select on public.installation_handovers to authenticated;
create policy installation_handovers_staff on public.installation_handovers for select to authenticated using(public.can_manage_crm());
create trigger handovers_audit after insert or update on public.installation_handovers for each row execute function public.audit_crm_change();
create function public.handover_json(p_id uuid,p_public boolean default false) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare r public.installation_handovers; receipt jsonb;
begin
 select * into r from public.installation_handovers where id=p_id;if not found then return null;end if;
 receipt:=case when r.received_at is null then null else jsonb_build_object('state',r.received_state,'comment',r.received_comment,'receivedAt',r.received_at) end;
 if p_public then return case when r.state='published' then jsonb_build_object('id',r.id,'publishedAt',r.published_at,'snapshot',r.snapshot,'receipt',receipt) else null end;end if;
 return jsonb_build_object('id',r.id,'orderId',r.id,'number','PM-'||lpad(r.protocol_number::text,greatest(5,length(r.protocol_number::text)),'0'),'version',r.version,'state',r.state,'fields',r.fields,'internalNote',r.internal_note,'publishedAt',r.published_at,'snapshot',r.snapshot,'receipt',receipt);
end;$$;
create function public.validate_handover_fields(p_fields jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare k text; v text; d jsonb; lim integer;
begin
 if not coalesce(public.offer_keys(p_fields,array['performedOn','performerName','workPerformed','checks','observations','recommendations','mode','installationId','locationId','installationType','devices']),false) then return false;end if;
 foreach k in array array['performedOn','performerName','workPerformed','checks','observations','recommendations','mode','installationType'] loop
 if jsonb_typeof(p_fields->k) is distinct from 'string' then return false;end if;
 v:=p_fields->>k;lim:=case k when 'workPerformed' then 6000 when 'checks' then 6000 when 'observations' then 4000 when 'recommendations' then 4000 when 'performedOn' then 10 when 'mode' then 8 else 160 end;
 if length(v)-length(replace(v,chr(10),''))>79 or length(v)>lim or replace(replace(v,chr(10),''),chr(9),'')~'[[:cntrl:]]' then return false;end if;
 if k in ('performerName','installationType') and v~'[[:cntrl:]]' then return false;end if;
 end loop;
 if p_fields->>'performedOn'!~'^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' or to_char((p_fields->>'performedOn')::date,'YYYY-MM-DD')<>p_fields->>'performedOn' or p_fields->>'mode' not in ('new','existing') then return false;end if;
 foreach k in array array['installationId','locationId'] loop
 if jsonb_typeof(p_fields->k) is distinct from 'null' then if jsonb_typeof(p_fields->k) is distinct from 'string' then return false;end if;perform (p_fields->>k)::uuid;end if;
 end loop;
 if (p_fields->>'mode'='existing' and p_fields->>'installationId' is null) or (p_fields->>'mode'='new' and p_fields->>'installationId' is not null) or jsonb_typeof(p_fields->'devices') is distinct from 'array' then return false;end if;
 if jsonb_array_length(p_fields->'devices')>20 then return false;end if;
 for d in select * from jsonb_array_elements(p_fields->'devices') loop
 if not coalesce(public.offer_keys(d,array['id','deviceId','manufacturer','model','serialNumber','warrantyUntil','warrantyTerms']),false) then return false;end if;
 foreach k in array array['id','manufacturer','model','serialNumber','warrantyTerms'] loop
 if jsonb_typeof(d->k) is distinct from 'string' then return false;end if;
 if length(d->>k)-length(replace(d->>k,chr(10),''))>79 or length(d->>k)>(case k when 'model' then 160 when 'warrantyTerms' then 2000 else 120 end) or replace(replace(d->>k,chr(10),''),chr(9),'')~'[[:cntrl:]]' then return false;end if;
 if k<>'warrantyTerms' and (d->>k)~'[[:cntrl:]]' then return false;end if;
 end loop;
 perform (d->>'id')::uuid;
 if jsonb_typeof(d->'deviceId') is distinct from 'null' then if jsonb_typeof(d->'deviceId') is distinct from 'string' then return false;end if;perform (d->>'deviceId')::uuid;end if;
 if jsonb_typeof(d->'warrantyUntil') is distinct from 'null' then
 if jsonb_typeof(d->'warrantyUntil') is distinct from 'string' or d->>'warrantyUntil'!~'^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' or to_char((d->>'warrantyUntil')::date,'YYYY-MM-DD')<>d->>'warrantyUntil' or (d->>'deviceId' is null and (d->>'warrantyUntil')::date<(p_fields->>'performedOn')::date) then return false;end if;
 end if;
 end loop;
 if (select count(distinct elem->>'id') from jsonb_array_elements(p_fields->'devices') as items(elem))<>jsonb_array_length(p_fields->'devices') then return false;end if;
 if (select count(distinct elem->>'deviceId') from jsonb_array_elements(p_fields->'devices') as items(elem))<>(select count(*) from jsonb_array_elements(p_fields->'devices') as items(elem) where elem->>'deviceId' is not null) then return false;end if;
 return true;
 exception when invalid_text_representation or datetime_field_overflow or invalid_datetime_format then return false;
end;$$;
create function public.handover_context(p_order uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o public.work_orders;
begin
 if not public.can_read_work_order(p_order) then raise exception 'Forbidden' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_order;
 return jsonb_build_object('order',public.work_order_detail(p_order),'report',public.handover_json(p_order),
 'readyToPublish',o.state<>'cancelled' and exists(select 1 from public.work_order_visits where order_id=p_order and state='completed') and not exists(select 1 from public.work_order_visits where order_id=p_order and state in ('planned','in_progress')),
 'locations',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'address',l.address,'city',l.city,'postalCode',coalesce(l.postal_code,'')) order by l.city,l.address,l.id) from (select * from public.locations where customer_id=o.customer_id order by city,address,id limit 100) l),'[]'),
 'installations',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'type',i.type,'locationId',l.id,'address',l.address,'city',l.city,
 'devices',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'manufacturer',d.manufacturer,'model',coalesce(d.model,''),'serialNumber',coalesce(d.serial_number,''),'warrantyUntil',d.warranty_until,'warrantyTerms',d.warranty_terms) order by d.created_at,d.id) from public.devices d where d.installation_id=i.id),'[]')) order by i.id) from (select i.* from public.installations i join public.locations l on l.id=i.location_id where l.customer_id=o.customer_id and i.status<>'archived' order by i.created_at desc,i.id limit 100) i join public.locations l on l.id=i.location_id),'[]'));
end;$$;
create function public.save_handover(p_order uuid,p_version integer,p_work_version integer,p_fields jsonb,p_internal_note text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.work_orders; r public.installation_handovers; d jsonb;
begin
 perform public.service_write_lock();if not public.can_read_work_order(p_order) then raise exception 'Forbidden' using errcode='42501';end if;
 if not public.validate_handover_fields(p_fields) or p_internal_note is null or length(p_internal_note)>4000 or length(p_internal_note)-length(replace(p_internal_note,chr(10),''))>79 or replace(replace(p_internal_note,chr(10),''),chr(9),'')~'[[:cntrl:]]' then raise exception 'Invalid report' using errcode='22023';end if;
 select * into o from public.work_orders where id=p_order for update;
 if o.version is distinct from p_work_version or o.state='cancelled' then raise exception 'Work order changed or cancelled' using errcode='40001';end if;
 if not exists(select 1 from public.customers where id=o.customer_id and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 if p_fields->>'installationId' is not null and not exists(select 1 from public.installations i join public.locations l on l.id=i.location_id where i.id=(p_fields->>'installationId')::uuid and l.customer_id=o.customer_id and i.status<>'archived') then raise exception 'Foreign installation' using errcode='42501';end if;
 if p_fields->>'locationId' is not null and not exists(select 1 from public.locations where id=(p_fields->>'locationId')::uuid and customer_id=o.customer_id) then raise exception 'Foreign location' using errcode='42501';end if;
 for d in select * from jsonb_array_elements(p_fields->'devices') loop
 if d->>'deviceId' is not null and (p_fields->>'mode'<>'existing' or not exists(select 1 from public.devices where id=(d->>'deviceId')::uuid and installation_id=(p_fields->>'installationId')::uuid)) then raise exception 'Foreign device' using errcode='42501';end if;
 end loop;
 select * into r from public.installation_handovers where id=p_order for update;
 if found then
 if r.state='published' then raise exception 'Published report is immutable' using errcode='40001';end if;
 if r.fields=p_fields and r.internal_note=p_internal_note and (p_version is null and r.version=0 or p_version in(r.version,r.version-1)) then return public.handover_json(p_order);end if;
 if p_version is distinct from r.version then raise exception 'Stale report' using errcode='40001';end if;
 update public.installation_handovers set fields=p_fields,internal_note=p_internal_note,version=version+1,updated_by=auth.uid(),updated_at=now() where id=p_order;
 else
 if p_version is not null then raise exception 'Missing report' using errcode='40001';end if;
 insert into public.installation_handovers(id,fields,internal_note,updated_by) values(p_order,p_fields,p_internal_note,auth.uid());
 end if;
 return public.handover_json(p_order);
end;$$;
create function public.prepare_handover(p_order uuid,p_version integer,p_work_version integer) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o public.work_orders; r public.installation_handovers; f jsonb; d jsonb; asset public.devices; i public.installations; l public.locations; site jsonb; inst_id uuid; inst_type text; device_rows jsonb:='[]'; doc jsonb;
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_order;select * into r from public.installation_handovers where id=p_order;
 if o.id is null or r.id is null or o.version is distinct from p_work_version or r.version is distinct from p_version or r.state<>'draft' or o.state='cancelled' then raise exception 'Stale report or work order' using errcode='40001';end if;
 if not exists(select 1 from public.customers where id=o.customer_id and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 if not exists(select 1 from public.work_order_visits where order_id=p_order and state='completed') or exists(select 1 from public.work_order_visits where order_id=p_order and state in ('planned','in_progress')) then raise exception 'Finish montage dates first' using errcode='40001';end if;
 f:=r.fields;
 if (f->>'performedOn')::date>(clock_timestamp() at time zone 'Europe/Warsaw')::date or length(trim(f->>'performerName'))=0 or length(trim(f->>'workPerformed'))=0 or length(trim(f->>'checks'))=0 then raise exception 'Incomplete report' using errcode='22023';end if;
 if f->>'mode'='existing' then
 select i0.* into i from public.installations i0 join public.locations l0 on l0.id=i0.location_id where i0.id=(f->>'installationId')::uuid and l0.customer_id=o.customer_id and i0.status<>'archived';
 if i.id is null then raise exception 'Foreign installation' using errcode='42501';end if;
 select * into l from public.locations where id=i.location_id;inst_id:=i.id;inst_type:=i.type;
 else
 if length(trim(f->>'installationType'))=0 then raise exception 'Missing installation type' using errcode='22023';end if;
 inst_id:=r.new_installation_id;inst_type:=trim(f->>'installationType');
 if f->>'locationId' is not null then select * into l from public.locations where id=(f->>'locationId')::uuid and customer_id=o.customer_id;if l.id is null then raise exception 'Foreign location' using errcode='42501';end if;end if;
 end if;
 site:=jsonb_build_object('address',coalesce(l.address,o.address),'city',coalesce(l.city,o.city),'postalCode',coalesce(l.postal_code,case when l.id is null then o.postal_code else '' end));
 if exists(select 1 from jsonb_array_elements(f->'devices') as items(elem) where length(trim(elem->>'serialNumber'))>0 group by lower(trim(elem->>'manufacturer')),upper(trim(elem->>'serialNumber')) having count(*)>1) then raise exception 'Duplicate serial number in report' using errcode='22023';end if;
 for d in select * from jsonb_array_elements(f->'devices') loop
 if length(trim(d->>'manufacturer'))=0 or length(trim(d->>'model'))=0 then raise exception 'Incomplete device' using errcode='22023';end if;
 if d->>'deviceId' is not null then
 select * into asset from public.devices where id=(d->>'deviceId')::uuid and installation_id=inst_id;
 if asset.id is null then raise exception 'Foreign device' using errcode='42501';end if;
 if asset.manufacturer is distinct from d->>'manufacturer' or coalesce(asset.model,'') is distinct from d->>'model' or coalesce(asset.serial_number,'') is distinct from d->>'serialNumber' or asset.warranty_until is distinct from (d->>'warrantyUntil')::date or asset.warranty_terms is distinct from d->>'warrantyTerms' then raise exception 'Device record changed' using errcode='40001';end if;
 else
 if exists(select 1 from public.devices where id=(d->>'id')::uuid) or length(trim(d->>'serialNumber'))>0 and exists(select 1 from public.devices where installation_id=inst_id and lower(trim(manufacturer))=lower(trim(d->>'manufacturer')) and upper(trim(serial_number))=upper(trim(d->>'serialNumber'))) then raise exception 'Device already registered: select existing' using errcode='40001';end if;
 end if;
 device_rows:=device_rows||jsonb_build_array(jsonb_build_object('id',coalesce(d->>'deviceId',d->>'id'),'manufacturer',d->'manufacturer','model',d->'model','serialNumber',d->'serialNumber','warrantyUntil',d->'warrantyUntil','warrantyTerms',d->'warrantyTerms'));
 end loop;
 doc:=o.snapshot->'document';
 return jsonb_build_object('number','PM-'||lpad(r.protocol_number::text,greatest(5,length(r.protocol_number::text)),'0'),'orderNumber','ZL-'||lpad(o.order_number::text,greatest(5,length(o.order_number::text)),'0'),'title',o.snapshot->>'title','customerName',o.snapshot->'customer'->>'name',
 'company',jsonb_build_object('name',doc->>'companyName','address',doc->>'companyAddress','taxId',doc->>'taxId','email',doc->>'email','phone',doc->>'phone','website',doc->>'website'),
 'site',site,'installation',jsonb_build_object('id',inst_id,'type',inst_type),'performedOn',f->'performedOn','performerName',f->'performerName','workPerformed',f->'workPerformed','checks',f->'checks','observations',f->'observations','recommendations',f->'recommendations','devices',device_rows);
end;$$;
create function public.publish_handover(p_order uuid,p_version integer,p_work_version integer,p_snapshot jsonb,p_pdf_base64 text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.work_orders; r public.installation_handovers; snap jsonb; inst uuid; loc uuid; d jsonb; pdf bytea;
begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_order for update;select * into r from public.installation_handovers where id=p_order for update;
 if r.id is null then raise exception 'Save report first' using errcode='40001';end if;
 if r.state='published' and p_version in(r.version,r.version-1) then return public.handover_json(p_order);end if;
 if p_pdf_base64 is null or length(p_pdf_base64)>2796204 then raise exception 'Invalid PDF' using errcode='22023';end if;
 pdf:=decode(p_pdf_base64,'base64');if octet_length(pdf) not between 5 and 2097152 or substring(pdf from 1 for 5)<>convert_to('%PDF-','UTF8') then raise exception 'Invalid PDF' using errcode='22023';end if;
 if r.fields->>'installationId' is not null then perform 1 from public.installations where id=(r.fields->>'installationId')::uuid for share;perform 1 from public.locations where id=(select location_id from public.installations where id=(r.fields->>'installationId')::uuid) for share;end if;
 if r.fields->>'locationId' is not null then perform 1 from public.locations where id=(r.fields->>'locationId')::uuid for share;end if;
 for d in select * from jsonb_array_elements(r.fields->'devices') loop if d->>'deviceId' is not null then perform 1 from public.devices where id=(d->>'deviceId')::uuid for share;end if;end loop;
 snap:=public.prepare_handover(p_order,p_version,p_work_version);
 if snap is distinct from p_snapshot then raise exception 'Snapshot changed' using errcode='40001';end if;
 inst:=(snap->'installation'->>'id')::uuid;
 if r.fields->>'mode'='new' then
 if r.fields->>'locationId' is null then loc:=r.new_location_id;insert into public.locations(id,customer_id,address,city,postal_code) values(loc,o.customer_id,o.address,o.city,nullif(o.postal_code,''));else loc:=(r.fields->>'locationId')::uuid;end if;
 insert into public.installations(id,location_id,type,installed_on,status) values(inst,loc,snap->'installation'->>'type',(r.fields->>'performedOn')::date,'active');
 end if;
 for d in select * from jsonb_array_elements(r.fields->'devices') loop
 if d->>'deviceId' is null then insert into public.devices(id,installation_id,manufacturer,model,serial_number,warranty_until,warranty_terms,installed_on)
 values((d->>'id')::uuid,inst,d->>'manufacturer',d->>'model',nullif(d->>'serialNumber',''),(d->>'warrantyUntil')::date,d->>'warrantyTerms',(r.fields->>'performedOn')::date);end if;
 end loop;
 insert into public.installation_handover_files(id,pdf) values(p_order,pdf);
 update public.installation_handovers set snapshot=snap,state='published',published_at=clock_timestamp(),version=version+1,updated_by=auth.uid(),updated_at=now() where id=p_order;
 return public.handover_json(p_order);
end;$$;
create function public.portal_handover(p_customer uuid,p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);if public.current_access()->>'role' not in('admin','office','client') then raise exception 'Forbidden role' using errcode='42501';end if;
 if not exists(select 1 from public.installation_handovers r join public.work_orders o on o.id=r.id where r.id=p_id and r.state='published' and o.customer_id=p_customer) then return null;end if;
 return public.handover_json(p_id,true);
end;$$;
create function public.handover_pdf(p_id uuid,p_customer uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if p_customer is null then if not public.can_read_work_order(p_id) then raise exception 'Forbidden' using errcode='42501';end if;
 else if public.portal_handover(p_customer,p_id) is null then return null;end if;end if;
 return (select jsonb_build_object('number',r.snapshot->>'number','base64',encode(f.pdf,'base64')) from public.installation_handovers r join public.installation_handover_files f on f.id=r.id where r.id=p_id and r.state='published');
end;$$;
create function public.acknowledge_handover(p_customer uuid,p_id uuid,p_state text,p_comment text,p_confirm boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.installation_handovers;
begin
 perform public.service_write_lock();perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' is distinct from 'client' or not public.is_customer_member(p_customer) then raise exception 'Client account required' using errcode='42501';end if;
 if p_confirm is distinct from true or p_state is null or p_state not in('accepted','reservations') or p_comment is null or length(trim(p_comment))>2000 or length(p_comment)-length(replace(p_comment,chr(10),''))>79 or replace(replace(p_comment,chr(10),''),chr(9),'')~'[[:cntrl:]]' or p_state='reservations' and length(trim(p_comment))=0 then raise exception 'Invalid receipt' using errcode='22023';end if;
 if not exists(select 1 from public.work_orders where id=p_id and customer_id=p_customer) then raise exception 'Foreign report' using errcode='42501';end if;
 select * into r from public.installation_handovers where id=p_id for update;
 if r.id is null or r.state<>'published' then raise exception 'Published report required' using errcode='40001';end if;
 if r.received_at is not null then if r.received_state=p_state and r.received_comment=trim(p_comment) then return public.handover_json(p_id,true);end if;raise exception 'Receipt is already recorded' using errcode='40001';end if;
 if not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 update public.installation_handovers set received_state=p_state,received_comment=trim(p_comment),received_by=auth.uid(),received_at=clock_timestamp() where id=p_id;
 return public.handover_json(p_id,true);
end;$$;
do $$declare f record;begin
 for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in ('handover_json','validate_handover_fields','handover_context','save_handover','prepare_handover','publish_handover','portal_handover','handover_pdf','acknowledge_handover') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;
end;$$;
grant execute on function public.handover_context(uuid),public.save_handover(uuid,integer,integer,jsonb,text),public.prepare_handover(uuid,integer,integer),public.publish_handover(uuid,integer,integer,jsonb,text),public.portal_handover(uuid,uuid),public.handover_pdf(uuid,uuid),public.acknowledge_handover(uuid,uuid,text,text,boolean) to authenticated;
create function public.portal_handover_documents(p_customer uuid) returns table(id uuid,kind text,title text,created_at timestamptz,installation_type text,address text,city text)
language plpgsql stable security definer set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);if public.current_access()->>'role' not in('admin','office','client') then raise exception 'Forbidden' using errcode='42501';end if;
 return query select r.id,'handover'::text,'Protokół odbioru '||(r.snapshot->>'number'),r.published_at,r.snapshot->'installation'->>'type',r.snapshot->'site'->>'address',r.snapshot->'site'->>'city' from public.installation_handovers r join public.work_orders o on o.id=r.id where r.state='published' and o.customer_id=p_customer;
end;$$;
create function public.installation_handover_links(p_installation uuid,p_customer uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if p_customer is not null then perform public.portal_assert_customer(p_customer);if public.current_access()->>'role' not in('admin','office','client') then raise exception 'Forbidden' using errcode='42501';end if;
 elsif public.current_access()->>'role' not in('admin','office','technician') or not public.account_enabled(auth.uid()) then raise exception 'Forbidden' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'number',r.snapshot->>'number','publishedAt',r.published_at,'orderId',o.id) order by r.published_at desc,r.id)
 from public.installation_handovers r join public.work_orders o on o.id=r.id where r.state='published' and r.snapshot->'installation'->>'id'=p_installation::text and (p_customer is not null and o.customer_id=p_customer or p_customer is null and public.can_read_work_order(o.id))),'[]');
end;$$;
revoke all on function public.portal_handover_documents(uuid),public.installation_handover_links(uuid,uuid) from public,anon,authenticated;
grant execute on function public.portal_handover_documents(uuid),public.installation_handover_links(uuid,uuid) to authenticated;

create or replace function public.portal_documents(p_customer uuid,p_kind text default 'all',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.portal_assert_customer(p_customer);
 if p_page is null or p_page not between 1 and 100000 or p_kind is null or p_kind not in ('all','protocol','file','handover') then raise exception 'Invalid filter' using errcode='22023'; end if;
 with docs as (
 select p.id,'protocol'::text as kind,'Protokół PS-'||lpad(p.protocol_number::text,greatest(6,length(p.protocol_number::text)),'0') as title,p.published_at as created_at,i.type as installation_type,l.address,l.city
 from public.service_protocols p join public.service_visits v on v.id=p.visit_id join public.service_tickets t on t.id=v.ticket_id
 join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id where t.customer_id=p_customer and p.status='published' and p_kind in ('all','protocol')
 union all
 select d.id,'file',d.file_name,d.created_at,i.type,l.address,l.city from public.documents d join public.installations i on i.id=d.installation_id
 join public.locations l on l.id=i.location_id where l.customer_id=p_customer and d.visible_to_customer and p_kind in ('all','file')
 union all
 select * from public.portal_handover_documents(p_customer) where p_kind in ('all','handover')
 ), paged as (select * from docs order by created_at desc,id limit 20 offset(p_page-1)*20)
 select (select count(*)::int from docs),coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]') into total,result;
 return jsonb_build_object('total',total,'documents',result);
end $$;
create or replace function public.portal_installation(p_customer uuid,p_installation uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',i.id,'type',i.type,'status',i.status,'installed_on',i.installed_on,'address',l.address,'city',l.city,'postal_code',l.postal_code,
 'devices',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'manufacturer',d.manufacturer,'model',d.model,'serial_number',d.serial_number,'warranty_until',d.warranty_until,'warranty_terms',d.warranty_terms,'installed_on',d.installed_on) order by d.created_at,d.id) from public.devices d where d.installation_id=i.id),'[]'),
 'maintenance',coalesce((select jsonb_agg(jsonb_build_object('title',m.title,'interval_months',m.interval_months,'next_due_on',m.next_due_on) order by m.next_due_on) from public.maintenance_plans m where m.installation_id=i.id and m.active),'[]'),
 'history',coalesce((select jsonb_agg(to_jsonb(history)) from (select t.id,t.ticket_number,t.subject,t.status,t.created_at from public.service_tickets t where t.installation_id=i.id order by t.created_at desc,t.id limit 10) history),'[]'))
 into result from public.installations i join public.locations l on l.id=i.location_id where i.id=p_installation and l.customer_id=p_customer;
 return result;
end $$;
