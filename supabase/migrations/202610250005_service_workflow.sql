alter table public.service_tickets add column ticket_number bigint generated always as identity unique;
alter table public.service_tickets add column subject text not null default 'Zgłoszenie serwisowe' check(length(trim(subject)) between 1 and 160);
alter table public.service_tickets add column request_id uuid;
create unique index service_ticket_request_idx on public.service_tickets(created_by,request_id) where request_id is not null;
alter table public.service_tickets add column assigned_to uuid references public.staff_users(user_id) on delete set null;
alter table public.service_visits add column duration_minutes integer not null default 60 check(duration_minutes between 15 and 480);
alter table public.service_visits add column status text not null default 'planned' check(status in ('planned','en_route','in_progress','completed','cancelled'));
update public.service_visits set status='completed' where completed_at is not null;
create index tickets_assigned_idx on public.service_tickets(assigned_to,status);
create index visits_schedule_idx on public.service_visits(scheduled_at,status);
create table public.service_protocols (
 id uuid primary key default gen_random_uuid(), protocol_number bigint generated always as identity unique,
 visit_id uuid not null unique references public.service_visits(id),
 status text not null default 'draft' check(status in ('draft','published')),
 diagnosis text not null default '' check(length(diagnosis)<=10000),
 work_performed text not null default '' check(length(work_performed)<=10000),
 materials text not null default '' check(length(materials)<=10000),
 measurements text not null default '' check(length(measurements)<=10000),
 recommendations text not null default '' check(length(recommendations)<=10000),
 version integer not null default 1,
 updated_by uuid,
 updated_at timestamptz not null default now(), published_at timestamptz,
 snapshot jsonb
);
alter table public.service_protocols enable row level security;
-- Scheduling and workflow writes go through guarded transactional functions.
revoke insert,update,delete on public.service_tickets,public.service_visits from anon,authenticated;
revoke all on public.service_protocols from anon,authenticated;
grant select on public.service_protocols to authenticated;

create function public.is_customer_member(p_customer uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and exists(select 1 from public.customer_memberships where user_id=auth.uid() and customer_id=p_customer);
$$;
create function public.can_edit_service_ticket(p_ticket uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.can_manage_crm() or (public.account_enabled(auth.uid()) and exists(
 select 1 from public.service_tickets t join public.staff_users s on s.user_id=t.assigned_to
 join public.staff_customer_assignments a on a.user_id=s.user_id and a.customer_id=t.customer_id
 where t.id=p_ticket and t.assigned_to=auth.uid() and s.role='technician'));
$$;
create function public.can_read_service_ticket(p_ticket uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select public.can_edit_service_ticket(p_ticket) or exists(select 1 from public.service_tickets where id=p_ticket and public.is_customer_member(customer_id));
$$;
alter policy tickets_read on public.service_tickets using(public.can_read_service_ticket(id));
alter policy visits_read on public.service_visits using(public.can_read_service_ticket(ticket_id));
create policy protocols_read on public.service_protocols for select to authenticated using(exists(
 select 1 from public.service_visits v where v.id=service_protocols.visit_id and
 (public.can_edit_service_ticket(v.ticket_id) or (service_protocols.status='published' and public.can_read_service_ticket(v.ticket_id)))));

create function public.service_write_lock() returns void
language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(682510005);
 -- Shared with administration, so a pending role revocation takes effect first.
 perform pg_advisory_xact_lock(682501004);
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
end $$;
create function public.validate_service_technician(p_technician uuid,p_customer uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.staff_users s join public.staff_customer_assignments a on a.user_id=s.user_id
 where s.user_id=p_technician and s.role='technician' and a.customer_id=p_customer and public.account_enabled(s.user_id)) then
 raise exception 'Active assigned technician required' using errcode='P0001'; end if;
end $$;
create function public.assert_service_slot(p_technician uuid,p_start timestamptz,p_minutes integer,p_exclude uuid default null,p_exclude_ticket uuid default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_start is null or p_minutes is null or p_minutes not between 15 and 480 then raise exception 'Invalid visit time' using errcode='22023'; end if;
 if exists(select 1 from public.service_visits v join public.service_tickets t on t.id=v.ticket_id
 where t.assigned_to=p_technician and v.status in ('planned','en_route','in_progress')
 and (p_exclude is null or v.id<>p_exclude) and (p_exclude_ticket is null or t.id<>p_exclude_ticket)
 and tstzrange(v.scheduled_at,v.scheduled_at+v.duration_minutes*interval '1 minute','[)') && tstzrange(p_start,p_start+p_minutes*interval '1 minute','[)')) then
 raise exception 'Technician schedule conflict' using errcode='23P01'; end if;
end $$;

create function public.create_service_ticket(p_installation uuid,p_subject text,p_description text,p_priority text default 'normal',p_request uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare customer uuid; result uuid; assigned uuid; existing public.service_tickets%rowtype;
begin
 perform public.service_write_lock();
 if p_request is not null then
 select * into existing from public.service_tickets where created_by=auth.uid() and request_id=p_request;
 if found then
 if existing.installation_id is distinct from p_installation or existing.subject is distinct from trim(p_subject) or existing.description is distinct from trim(p_description) or existing.priority::text is distinct from p_priority then raise exception 'Request token reused for different ticket' using errcode='22023'; end if;
 return existing.id; end if; end if;
 if not public.can_manage_crm() and (select count(*) from public.service_tickets where created_by=auth.uid() and created_at>now()-interval '1 hour')>=20 then raise exception 'Ticket submission limit reached' using errcode='P0001'; end if;
 select l.customer_id into customer from public.installations i join public.locations l on l.id=i.location_id
 join public.customers c on c.id=l.customer_id where i.id=p_installation and i.status<>'archived' and c.archived_at is null;
 if customer is null or not public.can_access_customer(customer) then raise exception 'Installation unavailable' using errcode='42501'; end if;
 if p_subject is null or length(trim(p_subject)) not between 1 and 160 or p_description is null or length(trim(p_description)) not between 1 and 10000
 or p_priority is null or p_priority not in ('low','normal','high') then raise exception 'Invalid ticket' using errcode='22023'; end if;
 if not public.can_manage_crm() and p_priority<>'normal' then raise exception 'Priority requires office role' using errcode='42501'; end if;
 if exists(select 1 from public.staff_users where user_id=auth.uid() and role='technician') and public.can_read_internal_customer(customer) then assigned:=auth.uid(); end if;
 insert into public.service_tickets(installation_id,customer_id,subject,description,priority,created_by,assigned_to,request_id)
 values(p_installation,customer,trim(p_subject),trim(p_description),p_priority::public.ticket_priority,auth.uid(),assigned,p_request) returning id into result;
 return result;
end $$;
create function public.assign_service_ticket(p_ticket uuid,p_technician uuid) returns void
language plpgsql security definer set search_path='' as $$
declare ticket public.service_tickets%rowtype; visit record;
begin
 perform public.service_write_lock();
 if not public.can_manage_crm() then raise exception 'Office role required' using errcode='42501'; end if;
 select * into ticket from public.service_tickets where id=p_ticket for update;
 if not found then raise exception 'Ticket not found' using errcode='P0001'; end if;
 if exists(select 1 from public.service_visits where ticket_id=p_ticket and status in ('en_route','in_progress')) then raise exception 'Visit already in progress' using errcode='P0001'; end if;
 if p_technician is null and exists(select 1 from public.service_visits where ticket_id=p_ticket and status='planned') then raise exception 'Cancel planned visits before unassigning' using errcode='P0001'; end if;
 if p_technician is not null then
  perform public.validate_service_technician(p_technician,ticket.customer_id);
  for visit in select id,scheduled_at,duration_minutes from public.service_visits where ticket_id=p_ticket and status='planned' loop
   perform public.assert_service_slot(p_technician,visit.scheduled_at,visit.duration_minutes,visit.id,p_ticket);
  end loop;
 end if;
 update public.service_tickets set assigned_to=p_technician,updated_at=now() where id=p_ticket;
end $$;
create function public.update_service_ticket(p_ticket uuid,p_status text,p_priority text) returns void
language plpgsql security definer set search_path='' as $$
declare ticket public.service_tickets%rowtype;
begin
 perform public.service_write_lock();
 if not public.can_edit_service_ticket(p_ticket) then raise exception 'Ticket unavailable' using errcode='42501'; end if;
 select * into ticket from public.service_tickets where id=p_ticket for update;
 if p_status is null or p_status not in ('new','in_progress','waiting','closed') or p_priority is null or p_priority not in ('low','normal','high') then raise exception 'Invalid status' using errcode='22023'; end if;
 if not public.can_manage_crm() and p_priority<>ticket.priority::text then raise exception 'Priority requires office role' using errcode='42501'; end if;
 if p_status='closed' then
  if exists(select 1 from public.service_visits where ticket_id=p_ticket and status in ('planned','en_route','in_progress')) then raise exception 'Open visits must be completed or cancelled' using errcode='P0001'; end if;
  if not public.can_manage_crm() and not exists(select 1 from public.service_protocols p join public.service_visits v on v.id=p.visit_id where v.ticket_id=p_ticket and p.status='published') then raise exception 'Published protocol required' using errcode='P0001'; end if;
 end if;
 update public.service_tickets set status=p_status::public.ticket_state,priority=p_priority::public.ticket_priority,updated_at=now() where id=p_ticket;
end $$;
create function public.schedule_service_visit(p_ticket uuid,p_local_start text,p_minutes integer,p_notes text default '',p_visit uuid default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare ticket public.service_tickets%rowtype; local_start timestamp; start_at timestamptz; result uuid;
begin
 perform public.service_write_lock();
 if not public.can_manage_crm() then raise exception 'Office role required' using errcode='42501'; end if;
 select * into ticket from public.service_tickets where id=p_ticket for update;
 if not found or ticket.status='closed' then raise exception 'Open ticket required' using errcode='P0001'; end if;
 perform public.validate_service_technician(ticket.assigned_to,ticket.customer_id);
 if p_local_start is null or p_local_start !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$' or length(coalesce(p_notes,''))>4000 then raise exception 'Invalid visit data' using errcode='22023'; end if;
 local_start:=p_local_start::timestamp; start_at:=local_start at time zone 'Europe/Warsaw';
 if start_at at time zone 'Europe/Warsaw' <> local_start then raise exception 'Nonexistent local time' using errcode='22023'; end if;
 if p_visit is not null and not exists(select 1 from public.service_visits where id=p_visit and ticket_id=p_ticket and status in ('planned','cancelled')) then raise exception 'Visit cannot be rescheduled' using errcode='P0001'; end if;
 perform public.assert_service_slot(ticket.assigned_to,start_at,p_minutes,p_visit);
 if p_visit is null then
 insert into public.service_visits(ticket_id,scheduled_at,duration_minutes,notes) values(p_ticket,start_at,p_minutes,coalesce(p_notes,'')) returning id into result;
 else
 update public.service_visits set scheduled_at=start_at,duration_minutes=p_minutes,notes=coalesce(p_notes,''),status='planned',completed_at=null where id=p_visit returning id into result;
 end if;
 return result;
end $$;
create function public.change_service_visit_state(p_visit uuid,p_status text) returns void
language plpgsql security definer set search_path='' as $$
declare visit public.service_visits%rowtype; ticket public.service_tickets%rowtype;
begin
 perform public.service_write_lock();
 select * into visit from public.service_visits where id=p_visit for update;
 if not found or not public.can_edit_service_ticket(visit.ticket_id) then raise exception 'Visit unavailable' using errcode='42501'; end if;
 select * into ticket from public.service_tickets where id=visit.ticket_id;
 if ticket.status='closed' then raise exception 'Open ticket required' using errcode='P0001'; end if;
 if p_status='cancelled' then
  if not public.can_manage_crm() or visit.status not in ('planned','en_route','in_progress') then raise exception 'Cannot cancel visit' using errcode='42501'; end if;
 elsif p_status='en_route' then
  if visit.status<>'planned' then raise exception 'Invalid visit transition' using errcode='P0001'; end if;
 elsif p_status='in_progress' then
  if visit.status not in ('planned','en_route') then raise exception 'Invalid visit transition' using errcode='P0001'; end if;
 else raise exception 'Invalid visit transition' using errcode='22023'; end if;
 update public.service_visits set status=p_status where id=p_visit;
 if p_status in ('en_route','in_progress') then update public.service_tickets set status='in_progress',updated_at=now() where id=ticket.id; end if;
end $$;

create function public.save_service_protocol(p_visit uuid,p_fields jsonb,p_version integer,p_publish boolean default false) returns uuid
language plpgsql security definer set search_path='' as $$
declare visit public.service_visits%rowtype; ticket public.service_tickets%rowtype; protocol public.service_protocols%rowtype;
 result uuid; snapshot_data jsonb; field text;
begin
 perform public.service_write_lock();
 select * into visit from public.service_visits where id=p_visit for update;
 if not found or not public.can_edit_service_ticket(visit.ticket_id) then raise exception 'Visit unavailable' using errcode='42501'; end if;
 select * into ticket from public.service_tickets where id=visit.ticket_id;
 if visit.status<>'in_progress' or ticket.status='closed' then raise exception 'Start visit before completing protocol' using errcode='P0001'; end if;
 if jsonb_typeof(p_fields) is distinct from 'object' or p_version is null or p_version<0 or p_publish is null then raise exception 'Invalid protocol' using errcode='22023'; end if;
 foreach field in array array['diagnosis','work_performed','materials','measurements','recommendations'] loop
  if jsonb_typeof(p_fields->field) is distinct from 'string' or length(p_fields->>field)>10000 then raise exception 'Invalid protocol field' using errcode='22023'; end if;
 end loop;
 if p_publish and (length(trim(p_fields->>'diagnosis'))=0 or length(trim(p_fields->>'work_performed'))=0) then raise exception 'Diagnosis and work required' using errcode='22023'; end if;
 select * into protocol from public.service_protocols where visit_id=p_visit for update;
 if found then
  if protocol.status='published' then raise exception 'Published protocol is immutable' using errcode='P0001'; end if;
  if protocol.version<>p_version then raise exception 'Protocol changed; refresh before saving' using errcode='40001'; end if;
 else
  if p_version<>0 then raise exception 'Protocol version mismatch' using errcode='40001'; end if;
 end if;
 if p_publish then
 select jsonb_build_object('customer_name',c.name,'address',l.address,'city',l.city,'postal_code',l.postal_code,'installation_type',i.type,
 'ticket_number',ticket.ticket_number,'subject',ticket.subject,'scheduled_at',visit.scheduled_at,'completed_at',now(),
 'performer',(select email from auth.users where id=ticket.assigned_to),
 'devices',coalesce((select jsonb_agg(jsonb_build_object('manufacturer',d.manufacturer,'model',d.model,'serial_number',d.serial_number) order by d.id) from public.devices d where d.installation_id=i.id),'[]'))
 into snapshot_data from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id where i.id=ticket.installation_id;
 end if;
 insert into public.service_protocols(visit_id,diagnosis,work_performed,materials,measurements,recommendations,status,updated_by,published_at,snapshot)
 values(p_visit,p_fields->>'diagnosis',p_fields->>'work_performed',p_fields->>'materials',p_fields->>'measurements',p_fields->>'recommendations',case when p_publish then 'published' else 'draft' end,auth.uid(),case when p_publish then now() end,snapshot_data)
 on conflict(visit_id) do update set diagnosis=excluded.diagnosis,work_performed=excluded.work_performed,materials=excluded.materials,
 measurements=excluded.measurements,recommendations=excluded.recommendations,status=excluded.status,updated_by=auth.uid(),updated_at=now(),
 version=public.service_protocols.version+1,published_at=excluded.published_at,snapshot=excluded.snapshot returning id into result;
 if p_publish then update public.service_visits set status='completed',completed_at=now() where id=p_visit; end if;
 return result;
end $$;

create function public.protect_published_protocol() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.status='published' then raise exception 'Published protocol is immutable' using errcode='P0001'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger protect_published_protocol before update or delete on public.service_protocols for each row execute function public.protect_published_protocol();
create trigger tickets_service_audit after insert or update on public.service_tickets for each row execute function public.audit_crm_change();
create trigger visits_service_audit after insert or update on public.service_visits for each row execute function public.audit_crm_change();
create trigger protocols_service_audit after insert or update on public.service_protocols for each row execute function public.audit_crm_change();

create function public.service_technicians(p_customer uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.can_manage_crm() then raise exception 'Office role required' using errcode='42501'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.user_id,'email',u.email) order by u.email),'[]') into result from public.staff_users s
 join auth.users u on u.id=s.user_id
 where s.role='technician' and public.account_enabled(s.user_id)
 and (p_customer is null or exists(select 1 from public.staff_customer_assignments a where a.user_id=s.user_id and a.customer_id=p_customer));
 return result;
end $$;
create function public.find_service_installations(p_search text default '')
returns table(id uuid,label text) language sql stable security invoker set search_path='' as $$
 select i.id,c.name||' · '||l.address||', '||l.city||' · '||i.type as label
 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.status<>'archived' and c.archived_at is null and (trim(p_search)='' or strpos(lower(concat_ws(' ',c.name,l.address,l.city,i.type)),lower(trim(p_search)))>0)
 order by c.name,l.address,i.id limit 50;
$$;
create function public.list_service_tickets(p_search text default '',p_status text default 'open',p_page integer default 1) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result jsonb; total integer;
begin
 if p_page not between 1 and 100000 or p_page is null or length(p_search)>200 or p_status not in ('open','all','new','in_progress','waiting','closed') then raise exception 'Invalid filter' using errcode='22023'; end if;
 select count(*) into total from public.service_tickets t join public.customers c on c.id=t.customer_id
 where (p_status='all' or (p_status='open' and t.status<>'closed') or t.status::text=p_status)
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',t.ticket_number,t.subject,c.name)),lower(trim(p_search)))>0);
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]') into result from (
 select t.id,t.ticket_number,t.subject,t.status,t.priority,t.created_at,t.assigned_to,c.name as customer_name,l.address,l.city
 from public.service_tickets t join public.customers c on c.id=t.customer_id join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id
 where (p_status='all' or (p_status='open' and t.status<>'closed') or t.status::text=p_status)
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',t.ticket_number,t.subject,c.name)),lower(trim(p_search)))>0)
 order by t.created_at desc,t.id limit 25 offset(p_page-1)*25) rows;
 return jsonb_build_object('tickets',result,'total',total);
end $$;
create function public.calendar_service_visits(p_from date) returns jsonb
language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'ticket_id',t.id,'ticket_number',t.ticket_number,'subject',t.subject,'customer_name',c.name,
 'address',l.address,'city',l.city,'assigned_to',t.assigned_to,'scheduled_at',v.scheduled_at,'duration_minutes',v.duration_minutes,'status',v.status) order by v.scheduled_at),'[]')
 from public.service_visits v join public.service_tickets t on t.id=v.ticket_id join public.customers c on c.id=t.customer_id
 join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id
 where v.scheduled_at>=(p_from::timestamp at time zone 'Europe/Warsaw') and v.scheduled_at<((p_from+7)::timestamp at time zone 'Europe/Warsaw');
$$;

do $$ declare f record;
begin
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in (
 'is_customer_member','can_edit_service_ticket','can_read_service_ticket','service_write_lock','validate_service_technician','assert_service_slot',
 'create_service_ticket','assign_service_ticket','update_service_ticket','schedule_service_visit','change_service_visit_state','save_service_protocol',
 'protect_published_protocol','service_technicians','find_service_installations','list_service_tickets','calendar_service_visits') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);
 if f.proname not in ('service_write_lock','validate_service_technician','assert_service_slot','protect_published_protocol') then
 execute format('grant execute on function %s to authenticated',f.oid::regprocedure); end if;
 end loop;
end $$;
