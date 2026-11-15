create table public.customer_contacts (
 id uuid primary key,customer_id uuid not null references public.customers(id),name text not null,role text not null default '',email text not null default '',phone text not null default '',is_primary boolean not null default false,archived boolean not null default false,
 version integer not null default 0,last_payload jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),archived_at timestamptz,
 check(not archived or not is_primary)
);
create unique index customer_contacts_primary on public.customer_contacts(customer_id) where is_primary and not archived;
create index customer_contacts_customer on public.customer_contacts(customer_id,archived,name,id);
alter table public.customer_contacts enable row level security;
revoke all on public.customer_contacts from public,anon,authenticated;
create trigger customer_contacts_audit after insert or update on public.customer_contacts for each row execute function public.audit_crm_change();
create function public.assert_customer_workspace(p_customer uuid) returns void language plpgsql stable security definer set search_path='' as $$begin
 if not public.can_read_internal_customer(p_customer) or not exists(select 1 from public.customers where id=p_customer) then raise exception 'Customer unavailable' using errcode='42501';end if;
end;$$;
create function public.customer_contact_json(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',id,'customerId',customer_id,'version',version,'name',name,'role',role,'email',email,'phone',phone,'isPrimary',is_primary,'archived',archived,'createdAt',created_at,'updatedAt',updated_at) from public.customer_contacts where id=p_id;
$$;
create function public.save_customer_contact(p_customer uuid,p_id uuid,p_version integer,p_fields jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.customer_contacts;k text;v text;lim integer;begin
 perform public.service_write_lock();if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;perform public.assert_customer_workspace(p_customer);
 perform 1 from public.customers where id=p_customer and archived_at is null for update;if not found then raise exception 'Archived customer' using errcode='40001';end if;
 if p_id is null or not coalesce(public.offer_keys(p_fields,array['name','role','email','phone','isPrimary','archived']),false) then raise exception 'Invalid contact' using errcode='22023';end if;
 foreach k in array array['name','role','email','phone'] loop
 v:=p_fields->>k;lim:=case k when 'name' then 160 when 'role' then 120 when 'email' then 320 else 40 end;
 if jsonb_typeof(p_fields->k) is distinct from 'string' or length(v)>lim or v~'[[:cntrl:]]' or v<>trim(v) then raise exception 'Invalid contact fields' using errcode='22023';end if;
 end loop;
 if length(p_fields->>'name')=0 or (p_fields->>'email'<>'' and p_fields->>'email'!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') or jsonb_typeof(p_fields->'isPrimary') is distinct from 'boolean' or jsonb_typeof(p_fields->'archived') is distinct from 'boolean' or (p_fields->>'archived')::boolean and (p_fields->>'isPrimary')::boolean then raise exception 'Invalid contact' using errcode='22023';end if;
 select * into r from public.customer_contacts where id=p_id for update;
 if r.id is not null then
 if r.customer_id<>p_customer then raise exception 'Foreign contact' using errcode='42501';end if;
 if r.last_payload=p_fields and (p_version in(r.version,r.version-1) or p_version is null and r.version=0) then return public.customer_contact_json(p_id);end if;
 if p_version is distinct from r.version then raise exception 'Stale contact' using errcode='40001';end if;
 else if p_version is not null then raise exception 'Missing contact' using errcode='40001';end if;end if;
 if (p_fields->>'isPrimary')::boolean then update public.customer_contacts set is_primary=false,last_payload=jsonb_set(last_payload,'{isPrimary}','false'),version=version+1,updated_at=now() where customer_id=p_customer and is_primary and id<>p_id;end if;
 insert into public.customer_contacts(id,customer_id,name,role,email,phone,is_primary,archived,archived_at,last_payload)
 values(p_id,p_customer,p_fields->>'name',p_fields->>'role',p_fields->>'email',p_fields->>'phone',(p_fields->>'isPrimary')::boolean,(p_fields->>'archived')::boolean,case when (p_fields->>'archived')::boolean then clock_timestamp() else null end,p_fields)
 on conflict(id) do update set name=excluded.name,role=excluded.role,email=excluded.email,phone=excluded.phone,is_primary=excluded.is_primary,archived=excluded.archived,archived_at=case when excluded.archived then coalesce(public.customer_contacts.archived_at,excluded.archived_at) else null end,last_payload=excluded.last_payload,version=public.customer_contacts.version+1,updated_at=now();
 return public.customer_contact_json(p_id);
end;$$;
create function public.customer_contact_list(p_customer uuid,p_archived boolean default false,p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 perform public.assert_customer_workspace(p_customer);if p_page is null or p_page not between 1 and 100000 or p_archived is null then raise exception 'Invalid page' using errcode='22023';end if;
 return jsonb_build_object('total',(select count(*) from public.customer_contacts where customer_id=p_customer and archived=p_archived),'items',coalesce((select jsonb_agg(public.customer_contact_json(id) order by is_primary desc,name,id) from(select * from public.customer_contacts where customer_id=p_customer and archived=p_archived order by is_primary desc,name,id limit 20 offset(p_page-1)*20) t),'[]'));
end;$$;
create function public.customer_workspace(p_customer uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 perform public.assert_customer_workspace(p_customer);
 return jsonb_build_object('customer',(select jsonb_build_object('id',id,'name',name,'type',type,'email',email,'phone',phone,'createdAt',created_at,'archivedAt',archived_at) from public.customers where id=p_customer),'canManage',public.can_manage_crm(),
 'primaryContact',(select public.customer_contact_json(id) from public.customer_contacts where customer_id=p_customer and is_primary and not archived),
 'counts',jsonb_build_object('contacts',(select count(*) from public.customer_contacts where customer_id=p_customer and not archived),'locations',(select count(*) from public.locations where customer_id=p_customer),'installations',(select count(*) from public.installations i join public.locations l on l.id=i.location_id where l.customer_id=p_customer),'devices',(select count(*) from public.devices d join public.installations i on i.id=d.installation_id join public.locations l on l.id=i.location_id where l.customer_id=p_customer),
 'offers',case when public.can_manage_crm() then(select count(*) from public.offers where customer_id=p_customer) else null end,
 'work',(select count(*) from public.work_orders where customer_id=p_customer and public.can_read_work_order(id)),
 'service',(select count(*) from public.service_tickets where customer_id=p_customer and public.can_read_service_ticket(id)),
 'openCorrections',(select count(*) from public.handover_corrections r join public.work_orders o on o.id=r.id where o.customer_id=p_customer and public.can_read_work_order(o.id) and (r.state='draft' or r.received_at is null))));
end;$$;
create function public.customer_related_rows(p_customer uuid,p_kind text,p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$declare result jsonb;total bigint;begin
 perform public.assert_customer_workspace(p_customer);if p_kind is null or p_kind not in('offers','work','service') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid list' using errcode='22023';end if;
 if p_kind='offers' and not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 with rows as (
 select o.id,'OF-'||to_char(o.created_at at time zone 'Europe/Warsaw','YYYY')||'-'||lpad(o.offer_number::text,greatest(5,length(o.offer_number::text)),'0') as number,o.data->>'title' as title,o.data->>'workType' as subtitle,
 case when (o.data->>'archived')::boolean then 'archived' else coalesce((select p.state from public.offer_publications p where p.offer_id=o.id order by revision desc limit 1),'draft') end as state,o.updated_at as at,(o.computed->(o.data->>'mainVariantId')->>'grossCents')::bigint as amount
 from public.offers o where p_kind='offers' and public.can_manage_crm() and o.customer_id=p_customer
 union all
 select o.id,'ZL-'||lpad(o.order_number::text,greatest(5,length(o.order_number::text)),'0'),o.snapshot->>'title',o.address||', '||o.city,o.state,o.created_at,case when public.can_manage_crm() then(o.snapshot->'variant'->>'grossCents')::bigint else null end from public.work_orders o where p_kind='work' and o.customer_id=p_customer and public.can_read_work_order(o.id)
 union all
 select t.id,'ZS-'||lpad(t.ticket_number::text,greatest(5,length(t.ticket_number::text)),'0'),t.subject,l.address||', '||l.city,t.status::text,t.created_at,null::bigint from public.service_tickets t join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id where p_kind='service' and t.customer_id=p_customer and public.can_read_service_ticket(t.id)
 ), paged as(select * from rows order by at desc,id limit 20 offset(p_page-1)*20)
 select (select count(*) from rows),coalesce((select jsonb_agg(jsonb_build_object('id',id,'number',number,'title',title,'subtitle',subtitle,'state',state,'at',at,'amountCents',amount) order by at desc,id) from paged),'[]') into total,result;
 return jsonb_build_object('total',total,'items',result);
end;$$;
create function public.customer_activity_rows(p_customer uuid) returns table(id text,at timestamptz,kind text,title text,detail text,entity_id uuid,round integer)
language plpgsql stable security definer set search_path='' as $$begin
 perform public.assert_customer_workspace(p_customer);
 return query
 select 'customer:'||c.id,c.created_at,'customer','Dodano klienta',c.name,c.id,null::integer from public.customers c where c.id=p_customer
 union all
 select 'contact:'||a.id,a.happened_at,'contact',case when a.action='INSERT' then 'Dodano osobę kontaktową' when (a.new_data->>'archived')::boolean and not(a.old_data->>'archived')::boolean then 'Zarchiwizowano kontakt' else 'Zmieniono kontakt' end,coalesce(a.new_data->>'name',''),p_customer,null::integer from public.audit_logs a join public.customer_contacts c on c.id=a.row_id where a.table_name='customer_contacts' and c.customer_id=p_customer
 union all
 select 'offer:'||o.id,o.created_at,'offer','Utworzono ofertę',o.data->>'title',o.id,null::integer from public.offers o where o.customer_id=p_customer and public.can_manage_crm()
 union all
 select 'offer-pub:'||p.id,p.published_at,'offer','Udostępniono ofertę',coalesce(p.snapshot->>'number','')||' · '||coalesce(p.snapshot->>'title',''),p.offer_id,null::integer from public.offer_publications p where p.customer_id=p_customer and public.can_manage_crm()
 union all
 select 'offer-accept:'||p.id,p.accepted_at,'offer','Klient zaakceptował ofertę',coalesce(p.snapshot->>'number',''),p.offer_id,null::integer from public.offer_publications p where p.customer_id=p_customer and p.accepted_at is not null and public.can_manage_crm()
 union all
 select 'work:'||o.id,o.created_at,'work','Utworzono realizację',o.snapshot->>'title',o.id,null::integer from public.work_orders o where o.customer_id=p_customer and public.can_read_work_order(o.id)
 union all
 select 'work-state:'||a.id,a.happened_at,'work',case a.new_data->>'state' when 'completed' then 'Zakończono realizację' when 'cancelled' then 'Anulowano realizację' when 'in_progress' then 'Rozpoczęto realizację' when 'planned' then 'Zaplanowano realizację' else 'Wznowiono planowanie realizacji' end,o.snapshot->>'title',o.id,null::integer from public.audit_logs a join public.work_orders o on o.id=a.row_id where a.table_name='work_orders' and a.action='UPDATE' and a.new_data->>'state' is distinct from a.old_data->>'state' and o.customer_id=p_customer and public.can_read_work_order(o.id)
 union all
 select 'handover:'||h.id,h.published_at,'handover','Udostępniono protokół montażu',h.snapshot->>'number',o.id,null::integer from public.installation_handovers h join public.work_orders o on o.id=h.id where o.customer_id=p_customer and h.state='published' and public.can_read_work_order(o.id)
 union all
 select 'handover-receipt:'||h.id,h.received_at,'handover',case h.received_state when 'accepted' then 'Klient potwierdził odbiór' else 'Klient odebrał prace z uwagami' end,h.snapshot->>'number',o.id,null::integer from public.installation_handovers h join public.work_orders o on o.id=h.id where o.customer_id=p_customer and h.received_at is not null and public.can_read_work_order(o.id)
 union all
 select 'correction:'||r.id||':'||r.round,r.published_at,'correction','Udostępniono ponowny odbiór',r.snapshot->>'number',o.id,r.round from public.handover_corrections r join public.work_orders o on o.id=r.id where o.customer_id=p_customer and r.state='published' and public.can_read_work_order(o.id)
 union all
 select 'correction-receipt:'||r.id||':'||r.round,r.received_at,'correction',case r.received_state when 'accepted' then 'Klient potwierdził ponowny odbiór' else 'Klient zgłosił uwagi po poprawkach' end,r.snapshot->>'number',o.id,r.round from public.handover_corrections r join public.work_orders o on o.id=r.id where o.customer_id=p_customer and r.received_at is not null and public.can_read_work_order(o.id)
 union all
 select 'correction-task:'||t.id,t.completed_at,'correction',case t.state when 'completed' then 'Wykonano zadanie poprawkowe' else 'Anulowano zadanie poprawkowe' end,t.title,o.id,t.round from public.handover_correction_tasks t join public.work_orders o on o.id=t.report_id where o.customer_id=p_customer and t.completed_at is not null and public.can_read_work_order(o.id)
 union all
 select 'service:'||t.id,t.created_at,'service','Dodano zgłoszenie serwisowe',t.subject,t.id,null::integer from public.service_tickets t where t.customer_id=p_customer and public.can_read_service_ticket(t.id)
 union all
 select 'service-state:'||a.id,a.happened_at,'service',case a.new_data->>'status' when 'closed' then 'Zamknięto zgłoszenie serwisowe' when 'in_progress' then 'Rozpoczęto obsługę zgłoszenia' when 'waiting' then 'Zgłoszenie oczekuje' else 'Zmieniono status zgłoszenia' end,t.subject,t.id,null::integer from public.audit_logs a join public.service_tickets t on t.id=a.row_id where a.table_name='service_tickets' and a.action='UPDATE' and a.new_data->>'status' is distinct from a.old_data->>'status' and t.customer_id=p_customer and public.can_read_service_ticket(t.id)
 union all
 select 'service-protocol:'||p.id,p.published_at,'service','Udostępniono protokół serwisowy','PS-'||p.protocol_number,t.id,null::integer from public.service_protocols p join public.service_visits v on v.id=p.visit_id join public.service_tickets t on t.id=v.ticket_id where t.customer_id=p_customer and p.status='published' and public.can_read_service_ticket(t.id)
 union all
 select 'maintenance:'||m.id,m.recorded_at,'maintenance','Zarejestrowano wykonanie przeglądu',m.plan_title,m.plan_id,null::integer from public.maintenance_completions m join public.locations l on l.id=(select i.location_id from public.installations i where i.id=m.installation_id) where l.customer_id=p_customer;
end;$$;
create function public.customer_activity(p_customer uuid,p_kind text default 'all',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$declare total bigint;items jsonb;begin
 perform public.assert_customer_workspace(p_customer);if p_page is null or p_page not between 1 and 100000 or p_kind is null or p_kind not in('all','customer','contact','offer','work','handover','correction','service','maintenance') then raise exception 'Invalid history filter' using errcode='22023';end if;
 with events as(select * from public.customer_activity_rows(p_customer) where p_kind='all' or kind=p_kind),paged as(select * from events order by at desc,id desc limit 20 offset(p_page-1)*20)
 select (select count(*) from events),coalesce((select jsonb_agg(jsonb_build_object('id',id,'at',at,'kind',kind,'title',title,'detail',detail,'entityId',entity_id,'round',round) order by at desc,id desc) from paged),'[]') into total,items;
 return jsonb_build_object('total',total,'items',items);
end;$$;
do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('assert_customer_workspace','customer_contact_json','save_customer_contact','customer_contact_list','customer_workspace','customer_related_rows','customer_activity_rows','customer_activity') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.save_customer_contact(uuid,uuid,integer,jsonb),public.customer_contact_list(uuid,boolean,integer),public.customer_workspace(uuid),public.customer_related_rows(uuid,text,integer),public.customer_activity(uuid,text,integer) to authenticated;
