-- Explicit customer context supplements the existing row-level policies.
create function public.portal_assert_customer(p_customer uuid) returns void
language plpgsql stable security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) or p_customer is null or not exists(select 1 from public.customers where id=p_customer)
 or not (public.can_manage_crm() or public.is_customer_member(p_customer)) then
 raise exception 'Customer context unavailable' using errcode='42501'; end if;
end $$;
create function public.portal_account_options(p_search text default '') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
 if p_search is null or length(p_search)>200 then raise exception 'Invalid search' using errcode='22023'; end if;
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select c.id,c.name,c.archived_at from public.customers c
 where (public.can_manage_crm() or public.is_customer_member(c.id))
 and (trim(p_search)='' or strpos(lower(c.name),lower(trim(p_search)))>0)
 order by (c.archived_at is null) desc,c.name,c.id limit 50) rows;
 return result;
end $$;
create function public.portal_context(p_customer uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare selected public.customers%rowtype; preview boolean;
begin
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
 preview:=public.can_manage_crm();
 if p_customer is not null then
 perform public.portal_assert_customer(p_customer);
 select * into selected from public.customers where id=p_customer;
 elsif not preview then
 select c.* into selected from public.customers c where public.is_customer_member(c.id)
 order by (c.archived_at is null) desc,c.name,c.id limit 1;
 end if;
 return jsonb_build_object('preview',preview,'customer',case when selected.id is null then null else jsonb_build_object('id',selected.id,'name',selected.name,'archived_at',selected.archived_at) end);
end $$;

create function public.portal_installations(p_customer uuid,p_search text default '',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.portal_assert_customer(p_customer);
 if p_page is null or p_page not between 1 and 100000 or p_search is null or length(p_search)>200 then raise exception 'Invalid filter' using errcode='22023'; end if;
 select count(*) into total from public.installations i join public.locations l on l.id=i.location_id
 where l.customer_id=p_customer and (trim(p_search)='' or strpos(lower(concat_ws(' ',i.type,l.address,l.city)),lower(trim(p_search)))>0
 or exists(select 1 from public.devices d where d.installation_id=i.id and strpos(lower(concat_ws(' ',d.manufacturer,d.model,d.serial_number)),lower(trim(p_search)))>0));
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select i.id,i.type,i.status,i.installed_on,l.address,l.city,l.postal_code,
 (select count(*)::int from public.devices d where d.installation_id=i.id) as device_count,
 (select min(m.next_due_on) from public.maintenance_plans m where m.installation_id=i.id and m.active) as next_due_on
 from public.installations i join public.locations l on l.id=i.location_id where l.customer_id=p_customer
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',i.type,l.address,l.city)),lower(trim(p_search)))>0
 or exists(select 1 from public.devices d where d.installation_id=i.id and strpos(lower(concat_ws(' ',d.manufacturer,d.model,d.serial_number)),lower(trim(p_search)))>0))
 order by (i.status='archived'),l.city,l.address,i.id limit 20 offset(p_page-1)*20) rows;
 return jsonb_build_object('total',total,'installations',result);
end $$;
create function public.portal_installation(p_customer uuid,p_installation uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',i.id,'type',i.type,'status',i.status,'installed_on',i.installed_on,'address',l.address,'city',l.city,'postal_code',l.postal_code,
 'devices',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'manufacturer',d.manufacturer,'model',d.model,'serial_number',d.serial_number,'warranty_until',d.warranty_until) order by d.created_at,d.id) from public.devices d where d.installation_id=i.id),'[]'),
 'maintenance',coalesce((select jsonb_agg(jsonb_build_object('interval_months',m.interval_months,'next_due_on',m.next_due_on) order by m.next_due_on) from public.maintenance_plans m where m.installation_id=i.id and m.active),'[]'),
 'history',coalesce((select jsonb_agg(to_jsonb(history)) from (select t.id,t.ticket_number,t.subject,t.status,t.created_at from public.service_tickets t where t.installation_id=i.id order by t.created_at desc,t.id limit 10) history),'[]'))
 into result from public.installations i join public.locations l on l.id=i.location_id where i.id=p_installation and l.customer_id=p_customer;
 return result;
end $$;
create function public.portal_tickets(p_customer uuid,p_status text default 'open',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.portal_assert_customer(p_customer);
 if p_page is null or p_page not between 1 and 100000 or p_status is null or p_status not in ('open','all','closed') then raise exception 'Invalid filter' using errcode='22023'; end if;
 select count(*) into total from public.service_tickets where customer_id=p_customer and (p_status='all' or (p_status='open' and status<>'closed') or (p_status='closed' and status='closed'));
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select t.id,t.ticket_number,t.subject,t.description,t.status,t.priority,t.created_at,i.type as installation_type,l.address,l.city
 from public.service_tickets t join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id
 where t.customer_id=p_customer and (p_status='all' or (p_status='open' and t.status<>'closed') or (p_status='closed' and t.status='closed'))
 order by t.created_at desc,t.id limit 20 offset(p_page-1)*20) rows;
 return jsonb_build_object('total',total,'tickets',result);
end $$;
create function public.portal_ticket(p_customer uuid,p_ticket uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',t.id,'ticket_number',t.ticket_number,'subject',t.subject,'description',t.description,'status',t.status,'priority',t.priority,'created_at',t.created_at,
 'installation_id',i.id,'installation_type',i.type,'address',l.address,'city',l.city,
 'visits',coalesce((select jsonb_agg(jsonb_build_object('id',v.id,'status',v.status,'scheduled_at',v.scheduled_at,'duration_minutes',v.duration_minutes,'completed_at',v.completed_at,'notes',v.notes,
 'protocol', (select jsonb_build_object('id',p.id,'protocol_number',p.protocol_number,'published_at',p.published_at) from public.service_protocols p where p.visit_id=v.id and p.status='published')) order by v.scheduled_at nulls last,v.id)
 from public.service_visits v where v.ticket_id=t.id),'[]')) into result
 from public.service_tickets t join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id
 where t.id=p_ticket and t.customer_id=p_customer;
 return result;
end $$;
create function public.portal_visits(p_customer uuid,p_view text default 'active',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.portal_assert_customer(p_customer);
 if p_page is null or p_page not between 1 and 100000 or p_view is null or p_view not in ('active','history') then raise exception 'Invalid filter' using errcode='22023'; end if;
 select count(*) into total from public.service_visits v join public.service_tickets t on t.id=v.ticket_id
 where t.customer_id=p_customer and ((p_view='active' and v.status in ('planned','en_route','in_progress')) or (p_view='history' and v.status in ('completed','cancelled')));
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select v.id,v.scheduled_at,v.duration_minutes,v.status,v.notes,v.completed_at,t.id as ticket_id,t.ticket_number,t.subject,i.type as installation_type,l.address,l.city,
 (v.status='planned' and v.scheduled_at<now()) as overdue
 from public.service_visits v join public.service_tickets t on t.id=v.ticket_id join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id
 where t.customer_id=p_customer and ((p_view='active' and v.status in ('planned','en_route','in_progress')) or (p_view='history' and v.status in ('completed','cancelled')))
 order by case when v.status in ('en_route','in_progress') then 0 else 1 end,
 case when p_view='active' then v.scheduled_at end asc,case when p_view='history' then v.scheduled_at end desc,v.id limit 20 offset(p_page-1)*20) rows;
 return jsonb_build_object('total',total,'visits',result);
end $$;
create function public.portal_documents(p_customer uuid,p_kind text default 'all',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; total integer;
begin
 perform public.portal_assert_customer(p_customer);
 if p_page is null or p_page not between 1 and 100000 or p_kind is null or p_kind not in ('all','protocol','file') then raise exception 'Invalid filter' using errcode='22023'; end if;
 with docs as (
 select p.id,'protocol'::text as kind,'Protokół PS-'||lpad(p.protocol_number::text,greatest(6,length(p.protocol_number::text)),'0') as title,p.published_at as created_at,i.type as installation_type,l.address,l.city
 from public.service_protocols p join public.service_visits v on v.id=p.visit_id join public.service_tickets t on t.id=v.ticket_id
 join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id where t.customer_id=p_customer and p.status='published' and p_kind in ('all','protocol')
 union all
 select d.id,'file',d.file_name,d.created_at,i.type,l.address,l.city from public.documents d join public.installations i on i.id=d.installation_id
 join public.locations l on l.id=i.location_id where l.customer_id=p_customer and d.visible_to_customer and p_kind in ('all','file')
 ), paged as (select * from docs order by created_at desc,id limit 20 offset(p_page-1)*20)
 select (select count(*)::int from docs),coalesce((select jsonb_agg(to_jsonb(paged)) from paged),'[]') into total,result;
 return jsonb_build_object('total',total,'documents',result);
end $$;
create function public.portal_file(p_customer uuid,p_document uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',d.id,'file_name',d.file_name,'storage_path',d.storage_path) into result
 from public.documents d join public.installations i on i.id=d.installation_id join public.locations l on l.id=i.location_id
 where d.id=p_document and d.visible_to_customer and l.customer_id=p_customer;
 return result;
end $$;
create function public.portal_protocol(p_customer uuid,p_protocol uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',p.id,'protocol_number',p.protocol_number,'status',p.status,'version',p.version,'diagnosis',p.diagnosis,'work_performed',p.work_performed,'materials',p.materials,'measurements',p.measurements,'recommendations',p.recommendations,'published_at',p.published_at,'snapshot',p.snapshot) into result from public.service_protocols p join public.service_visits v on v.id=p.visit_id join public.service_tickets t on t.id=v.ticket_id
 where p.id=p_protocol and p.status='published' and t.customer_id=p_customer;
 return result;
end $$;
create function public.portal_overview(p_customer uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object(
 'installations',(select count(*) from public.installations i join public.locations l on l.id=i.location_id where l.customer_id=p_customer and i.status<>'archived'),
 'open_tickets',(select count(*) from public.service_tickets where customer_id=p_customer and status<>'closed'),
 'documents',(public.portal_documents(p_customer,'all',1)->'total'),
 'next_due_on',(select min(m.next_due_on) from public.maintenance_plans m join public.installations i on i.id=m.installation_id join public.locations l on l.id=i.location_id where l.customer_id=p_customer and m.active and i.status<>'archived'),
 'visits',(public.portal_visits(p_customer,'active',1)->'visits'),
 'tickets',(public.portal_tickets(p_customer,'open',1)->'tickets')) into result;
 return result;
end $$;
create function public.portal_account(p_customer uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',id,'name',name,'email',email,'phone',phone,'type',type,'archived_at',archived_at) into result from public.customers where id=p_customer;
 return result;
end $$;
create function public.portal_installation_options(p_customer uuid,p_search text default '') returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 if p_search is null or length(p_search)>200 then raise exception 'Invalid filter' using errcode='22023'; end if;
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select i.id,i.type||' · '||l.address||', '||l.city as label from public.installations i join public.locations l on l.id=i.location_id
 join public.customers c on c.id=l.customer_id where l.customer_id=p_customer and i.status<>'archived' and c.archived_at is null
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',i.type,l.address,l.city)),lower(trim(p_search)))>0)
 order by l.city,l.address,i.id limit 50) rows;
 return result;
end $$;
create function public.portal_create_ticket(p_customer uuid,p_installation uuid,p_subject text,p_description text,p_request uuid) returns uuid
language plpgsql security definer set search_path='' as $$
begin
 perform public.service_write_lock();
 -- Preview mode is read-only, even though the real staff session has broader rights.
 if public.is_staff() or not public.is_customer_member(p_customer) then raise exception 'Client membership required' using errcode='42501'; end if;
 if not exists(select 1 from public.installations i join public.locations l on l.id=i.location_id where i.id=p_installation and l.customer_id=p_customer) then
 raise exception 'Installation outside selected customer' using errcode='42501'; end if;
 return public.create_service_ticket(p_installation,p_subject,p_description,'normal',p_request);
end $$;

do $$ declare f record;
begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in (
 'portal_assert_customer','portal_account_options','portal_context','portal_installations','portal_installation','portal_tickets','portal_ticket','portal_visits',
 'portal_documents','portal_file','portal_protocol','portal_overview','portal_account','portal_installation_options','portal_create_ticket') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);
 execute format('grant execute on function %s to authenticated',f.oid::regprocedure);
 end loop;
end $$;
