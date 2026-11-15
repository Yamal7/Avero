create table public.work_orders (
 id uuid primary key, order_number bigint generated always as identity unique,
 publication_id uuid not null unique references public.offer_publications(id),
 customer_id uuid not null references public.customers(id),
 snapshot jsonb not null, address text not null, city text not null, postal_code text not null default '',
 state text not null default 'draft' check(state in ('draft','planned','in_progress','completed','cancelled')),
 version integer not null default 0, created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.work_order_visits (
 id uuid primary key, order_id uuid not null references public.work_orders(id),
 start_at timestamptz not null,duration_minutes integer not null check(duration_minutes between 15 and 480),
 crew_ids uuid[] not null check(cardinality(crew_ids) between 1 and 10),notes text not null default '',
 state text not null default 'planned' check(state in ('planned','in_progress','completed','cancelled'))
);
create index work_order_visits_order on public.work_order_visits(order_id,start_at);
create index work_order_visits_crew on public.work_order_visits using gin(crew_ids);
alter table public.work_orders enable row level security;
alter table public.work_order_visits enable row level security;
revoke all on public.work_orders,public.work_order_visits from public,anon,authenticated;
grant select on public.work_orders,public.work_order_visits to authenticated;
create policy work_orders_staff on public.work_orders for select to authenticated using(public.can_manage_crm());
create policy work_visits_staff on public.work_order_visits for select to authenticated using(public.can_manage_crm());
create trigger work_orders_audit after insert or update on public.work_orders for each row execute function public.audit_crm_change();
create trigger work_order_visits_audit after insert or update on public.work_order_visits for each row execute function public.audit_crm_change();
create function public.can_read_work_order(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.can_manage_crm() or (public.account_enabled(auth.uid()) and exists(
 select 1 from public.work_orders o join public.work_order_visits v on v.order_id=o.id
 join public.staff_customer_assignments a on a.customer_id=o.customer_id and a.user_id=auth.uid()
 join public.staff_users s on s.user_id=a.user_id and s.role='technician'
 where o.id=p_id and auth.uid()=any(v.crew_ids)));
$$;
create function public.work_order_detail(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o public.work_orders; variant jsonb; manager boolean:=public.can_manage_crm();
begin
 if not public.can_read_work_order(p_id) then raise exception 'Forbidden' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_id;if not found then return null;end if;
 variant:=o.snapshot->'variant';
 return jsonb_build_object('id',o.id,'number','ZL-'||lpad(o.order_number::text,greatest(5,length(o.order_number::text)),'0'),
 'publicationId',o.publication_id,'customerId',o.customer_id,'customerName',o.snapshot->'customer'->>'name','offerNumber',o.snapshot->>'offerNumber','title',o.snapshot->>'title','variantName',variant->>'name','scopeNote',coalesce(variant->>'note',''),
 'address',o.address,'city',o.city,'postalCode',o.postal_code,'state',o.state,'version',o.version,'canManage',manager,
 'grossCents',case when manager then variant->'grossCents' else null end,'netCents',case when manager then variant->'netCents' else null end,
 'lines',(select jsonb_agg(jsonb_build_object('name',l->'name','description',l->'description','unit',l->'unit','quantityMills',l->'quantityMills') order by n) from jsonb_array_elements(variant->'lines') with ordinality t(l,n)),
 'visits',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'startAt',v.start_at,'durationMinutes',v.duration_minutes,'state',v.state,'crewIds',v.crew_ids,'notes',v.notes) order by v.start_at,v.id) from public.work_order_visits v where v.order_id=o.id and (manager or auth.uid()=any(v.crew_ids))),'[]'));
end;$$;
create function public.work_order_source(p_publication uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 return (select jsonb_build_object('publication',public.offer_publication_json(p.id),'orderId',(select id from public.work_orders where publication_id=p.id)) from public.offer_publications p where p.id=p_publication and p.state='accepted');
end;$$;
create function public.create_work_order(p_id uuid,p_publication uuid,p_address text,p_city text,p_postal text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.offer_publications; existing public.work_orders; variant jsonb;
begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 select * into existing from public.work_orders where publication_id=p_publication;
 if found then return public.work_order_detail(existing.id);end if;
 if p_id is null or p_address is null or length(trim(p_address)) not between 1 and 240 or p_city is null or length(trim(p_city)) not between 1 and 120 or p_postal is null or length(p_postal)>20 or concat(p_address,p_city,p_postal)~'[[:cntrl:]]' then raise exception 'Invalid address' using errcode='22023';end if;
 if exists(select 1 from public.work_orders where id=p_id) then raise exception 'Request identity conflict' using errcode='40001';end if;
 select * into p from public.offer_publications where id=p_publication and state='accepted' for update;
 if not found then raise exception 'Accepted publication required' using errcode='40001';end if;
 if not exists(select 1 from public.customers where id=p.customer_id and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 select v into variant from jsonb_array_elements(p.snapshot->'variants') v where v->>'id'=p.selected_variant_id::text;
 if variant is null then raise exception 'Missing selected variant' using errcode='40001';end if;
 insert into public.work_orders(id,publication_id,customer_id,address,city,postal_code,snapshot,created_by)
 values(p_id,p.id,p.customer_id,trim(p_address),trim(p_city),trim(p_postal),jsonb_build_object('offerNumber',p.snapshot->>'number','title',p.snapshot->>'title','customer',p.snapshot->'customer','variant',variant,'document',p.document,'acceptedAt',p.accepted_at),auth.uid());
 return public.work_order_detail(p_id);
end;$$;
create function public.list_work_orders(p_search text default '',p_state text default 'active',p_page integer default 1) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if public.current_access()->>'role' not in ('admin','office','technician') or not public.account_enabled(auth.uid()) then raise exception 'Forbidden' using errcode='42501';end if;
 if p_search is null or length(p_search)>200 or p_state is null or p_state not in ('active','all','draft','planned','in_progress','completed','cancelled') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid query' using errcode='22023';end if;
 return (with filtered as(select o.id,o.created_at from public.work_orders o where public.can_read_work_order(o.id)
 and (p_state='all' or p_state='active' and o.state not in ('completed','cancelled') or o.state=p_state)
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',o.snapshot->>'title',o.snapshot->'customer'->>'name',o.city,o.address,'ZL-'||lpad(o.order_number::text,greatest(5,length(o.order_number::text)),'0'))),lower(trim(p_search)))>0)),
 paged as(select * from filtered order by created_at desc,id limit 25 offset(p_page-1)*25)
 select jsonb_build_object('total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(public.work_order_detail(id) order by created_at desc,id) from paged),'[]')));
end;$$;
-- Extended shared slot check: both service planning and montage planning reserve the same people's time.
create or replace function public.assert_service_slot(p_technician uuid,p_start timestamptz,p_minutes integer,p_exclude uuid default null,p_exclude_ticket uuid default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_start is null or p_minutes is null or p_minutes not between 15 and 480 then raise exception 'Invalid visit time' using errcode='22023';end if;
 if exists(select 1 from public.service_visits v join public.service_tickets t on t.id=v.ticket_id
 where t.assigned_to=p_technician and v.status in ('planned','en_route','in_progress') and (p_exclude is null or v.id<>p_exclude) and (p_exclude_ticket is null or t.id<>p_exclude_ticket)
 and tstzrange(v.scheduled_at,v.scheduled_at+v.duration_minutes*interval '1 minute','[)') && tstzrange(p_start,p_start+p_minutes*interval '1 minute','[)'))
 or exists(select 1 from public.work_order_visits v where p_technician=any(v.crew_ids) and v.state in ('planned','in_progress')
 and tstzrange(v.start_at,v.start_at+v.duration_minutes*interval '1 minute','[)') && tstzrange(p_start,p_start+p_minutes*interval '1 minute','[)')) then raise exception 'Technician schedule conflict' using errcode='23P01';end if;
end;$$;
create function public.assert_work_slot(p_technician uuid,p_start timestamptz,p_minutes integer,p_exclude uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_start is null or p_minutes is null or p_minutes not between 15 and 480 then raise exception 'Invalid visit time' using errcode='22023';end if;
 if exists(select 1 from public.service_visits v join public.service_tickets t on t.id=v.ticket_id
 where t.assigned_to=p_technician and v.status in ('planned','en_route','in_progress')
 and tstzrange(v.scheduled_at,v.scheduled_at+v.duration_minutes*interval '1 minute','[)') && tstzrange(p_start,p_start+p_minutes*interval '1 minute','[)'))
 or exists(select 1 from public.work_order_visits v where p_technician=any(v.crew_ids) and v.state in ('planned','in_progress') and (p_exclude is null or v.id<>p_exclude)
 and tstzrange(v.start_at,v.start_at+v.duration_minutes*interval '1 minute','[)') && tstzrange(p_start,p_start+p_minutes*interval '1 minute','[)')) then raise exception 'Technician schedule conflict' using errcode='23P01';end if;
end;$$;
create function public.schedule_work_visit(p_order uuid,p_version integer,p_id uuid,p_local_start text,p_minutes integer,p_crew uuid[],p_notes text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.work_orders; v public.work_order_visits; start_at timestamptz; local_start timestamp; tech uuid;
begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_order for update;
 if not found then raise exception 'Missing order' using errcode='22023';end if;
 if o.state in ('completed','cancelled') then raise exception 'Closed order' using errcode='40001';end if;
 if p_id is null or p_local_start is null or p_local_start!~'^20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$' or p_minutes is null or p_minutes not between 15 and 480 or p_crew is null or cardinality(p_crew) not between 1 and 10 or exists(select 1 from unnest(p_crew) t where t is null) or (select count(distinct t) from unnest(p_crew) t)<>cardinality(p_crew) or p_notes is null or length(trim(p_notes))>2000 then raise exception 'Invalid visit' using errcode='22023';end if;
 local_start:=p_local_start::timestamp;start_at:=local_start at time zone 'Europe/Warsaw';
 if start_at at time zone 'Europe/Warsaw'<>local_start then raise exception 'Nonexistent local time' using errcode='22023';end if;
 select * into v from public.work_order_visits where id=p_id;
 if found and v.order_id=p_order and v.state='planned' and v.start_at=start_at and v.duration_minutes=p_minutes and v.crew_ids=p_crew and v.notes=trim(p_notes) and p_version in (o.version,o.version-1) then return public.work_order_detail(p_order);end if;
 if o.version is distinct from p_version then raise exception 'Stale order' using errcode='40001';end if;
 if v.id is not null and (v.order_id<>p_order or v.state not in ('planned','cancelled')) then raise exception 'Visit immutable' using errcode='40001';end if;
 if not exists(select 1 from public.customers where id=o.customer_id and archived_at is null) then raise exception 'Archived customer' using errcode='40001';end if;
 if v.id is null and (select count(*) from public.work_order_visits where order_id=p_order)>=100 then raise exception 'Visit limit reached' using errcode='22023';end if;
 foreach tech in array p_crew loop perform public.validate_service_technician(tech,o.customer_id);perform public.assert_work_slot(tech,start_at,p_minutes,p_id);end loop;
 insert into public.work_order_visits(id,order_id,start_at,duration_minutes,crew_ids,notes) values(p_id,p_order,start_at,p_minutes,p_crew,trim(p_notes))
 on conflict(id) do update set start_at=excluded.start_at,duration_minutes=excluded.duration_minutes,crew_ids=excluded.crew_ids,notes=excluded.notes,state='planned';
 update public.work_orders set version=version+1,state=case when state='draft' then 'planned' else state end,updated_at=now() where id=p_order;
 return public.work_order_detail(p_order);
end;$$;
create function public.change_work_visit(p_order uuid,p_visit uuid,p_version integer,p_state text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.work_orders; v public.work_order_visits; manager boolean;
begin
 perform public.service_write_lock();manager:=public.can_manage_crm();
 if not public.can_read_work_order(p_order) then raise exception 'Forbidden' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_order for update;
 select * into v from public.work_order_visits where id=p_visit and order_id=p_order for update;
 if v.id is null or not manager and not auth.uid()=any(v.crew_ids) then raise exception 'Visit unavailable' using errcode='42501';end if;
 if p_state is null or p_state not in ('in_progress','completed','cancelled') or p_state='cancelled' and not manager then raise exception 'Forbidden transition' using errcode='42501';end if;
 if v.state=p_state and p_version in (o.version,o.version-1) then return public.work_order_detail(p_order);end if;
 if o.version is distinct from p_version or o.state in ('completed','cancelled') then raise exception 'Stale or closed order' using errcode='40001';end if;
 if not(p_state='in_progress' and v.state='planned' or p_state='completed' and v.state='in_progress' or p_state='cancelled' and v.state in ('planned','in_progress')) then raise exception 'Invalid transition' using errcode='40001';end if;
 update public.work_order_visits set state=p_state where id=p_visit;
 update public.work_orders set state=case when p_state in ('in_progress','completed') then 'in_progress' when state='planned' and not exists(select 1 from public.work_order_visits where order_id=p_order and state in ('planned','in_progress')) then 'draft' else state end,version=version+1,updated_at=now() where id=p_order;
 return public.work_order_detail(p_order);
end;$$;
create function public.change_work_order(p_id uuid,p_version integer,p_state text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.work_orders;
begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_id for update;
 if not found then raise exception 'Missing order' using errcode='22023';end if;
 if p_state is null or p_state not in ('completed','cancelled','draft') then raise exception 'Invalid state' using errcode='22023';end if;
 if o.state=p_state and p_version in (o.version,o.version-1) then return public.work_order_detail(p_id);end if;
 if o.version is distinct from p_version then raise exception 'Stale order' using errcode='40001';end if;
 if o.state='cancelled' and p_state='draft' then update public.work_orders set state='draft',version=version+1,updated_at=now() where id=p_id;return public.work_order_detail(p_id);end if;
 if o.state in ('completed','cancelled') or p_state='draft' then raise exception 'Closed order' using errcode='40001';end if;
 if p_state='completed' and (not exists(select 1 from public.work_order_visits where order_id=p_id and state='completed') or exists(select 1 from public.work_order_visits where order_id=p_id and state in ('planned','in_progress'))) then raise exception 'Finish all visits first' using errcode='40001';end if;
 if p_state='cancelled' then update public.work_order_visits set state='cancelled' where order_id=p_id and state in ('planned','in_progress');end if;
 update public.work_orders set state=p_state,version=version+1,updated_at=now() where id=p_id;
 return public.work_order_detail(p_id);
end;$$;
create function public.calendar_work_visits(p_from date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) or public.current_access()->>'role' not in ('admin','office','technician') then raise exception 'Forbidden' using errcode='42501';end if;
 if p_from is null then raise exception 'Missing week' using errcode='22023';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'orderId',o.id,'number','ZL-'||lpad(o.order_number::text,greatest(5,length(o.order_number::text)),'0'),'title',o.snapshot->>'title','customerName',o.snapshot->'customer'->>'name','address',o.address,'city',o.city,'startAt',v.start_at,'durationMinutes',v.duration_minutes,'state',v.state,'crewIds',v.crew_ids) order by v.start_at,v.id)
 from public.work_order_visits v join public.work_orders o on o.id=v.order_id where public.can_read_work_order(o.id) and (public.can_manage_crm() or auth.uid()=any(v.crew_ids))
 and v.state<>'cancelled' and tstzrange(v.start_at,v.start_at+v.duration_minutes*interval '1 minute','[)') && tstzrange(p_from::timestamp at time zone 'Europe/Warsaw',(p_from+7)::timestamp at time zone 'Europe/Warsaw','[)')),'[]');
end;$$;
create function public.portal_work_order(p_customer uuid,p_publication uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);
 if public.current_access()->>'role' not in ('admin','office','client') then raise exception 'Forbidden' using errcode='42501';end if;
 return (select jsonb_build_object('id',o.id,'number','ZL-'||lpad(o.order_number::text,greatest(5,length(o.order_number::text)),'0'),'state',o.state,'address',o.address,'city',o.city,
 'visits',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'startAt',v.start_at,'durationMinutes',v.duration_minutes,'state',v.state) order by v.start_at,v.id) from public.work_order_visits v where v.order_id=o.id),'[]'))
 from public.work_orders o where o.publication_id=p_publication and o.customer_id=p_customer);
end;$$;
do $$declare f record;begin
 for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in ('assert_work_slot','can_read_work_order','work_order_detail','work_order_source','create_work_order','list_work_orders','schedule_work_visit','change_work_visit','change_work_order','calendar_work_visits','portal_work_order') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);
 end loop;
end;$$;
grant execute on function public.work_order_detail(uuid),public.work_order_source(uuid),public.create_work_order(uuid,uuid,text,text,text),public.list_work_orders(text,text,integer),public.schedule_work_visit(uuid,integer,uuid,text,integer,uuid[],text),public.change_work_visit(uuid,uuid,integer,text),public.change_work_order(uuid,integer,text),public.calendar_work_visits(date),public.portal_work_order(uuid,uuid) to authenticated;

create function public.update_work_address(p_id uuid,p_version integer,p_address text,p_city text,p_postal text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.work_orders;
begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Forbidden' using errcode='42501';end if;
 select * into o from public.work_orders where id=p_id for update;
 if not found then raise exception 'Missing order' using errcode='22023';end if;
 if p_address is null or length(trim(p_address)) not between 1 and 240 or p_city is null or length(trim(p_city)) not between 1 and 120 or p_postal is null or length(p_postal)>20 or concat(p_address,p_city,p_postal)~'[[:cntrl:]]' then raise exception 'Invalid address' using errcode='22023';end if;
 if o.address=trim(p_address) and o.city=trim(p_city) and o.postal_code=trim(p_postal) and p_version in (o.version,o.version-1) then return public.work_order_detail(p_id);end if;
 if o.version is distinct from p_version or o.state not in ('draft','planned') or exists(select 1 from public.work_order_visits where order_id=p_id and state in ('in_progress','completed')) then raise exception 'Order already started or changed' using errcode='40001';end if;
 update public.work_orders set address=trim(p_address),city=trim(p_city),postal_code=trim(p_postal),version=version+1,updated_at=now() where id=p_id;
 return public.work_order_detail(p_id);
end;$$;
revoke all on function public.update_work_address(uuid,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.update_work_address(uuid,integer,text,text,text) to authenticated;
