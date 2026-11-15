alter table public.maintenance_plans
 add column title text not null default 'Przegląd okresowy' check(length(trim(title)) between 1 and 160),
 add column version integer not null default 0,
 add column created_by uuid references auth.users(id),
 add column updated_at timestamptz not null default now();
revoke insert,update,delete on public.maintenance_plans from authenticated;
drop policy maintenance_staff_insert on public.maintenance_plans;
drop policy maintenance_staff_update on public.maintenance_plans;
create trigger maintenance_audit after insert or update on public.maintenance_plans for each row execute function public.audit_crm_change();
create function public.save_maintenance_plan(p_id uuid,p_installation uuid,p_title text,p_interval integer,p_due date,p_active boolean,p_version integer default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare existing public.maintenance_plans%rowtype; present boolean;
begin
 if not public.can_manage_crm() then raise exception 'Maintenance write access denied' using errcode='42501'; end if;
 if p_id is null or p_installation is null or p_title is null or length(trim(p_title)) not between 1 and 160 or p_interval is null or p_interval not between 1 and 120
 or p_due is null or p_due not between '1900-01-01'::date and '2199-12-31'::date or p_active is null or p_version<0 then raise exception 'Invalid maintenance plan' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('maintenance:'||p_id::text,0));
 select * into existing from public.maintenance_plans where id=p_id for update;present:=found;
 if present then
  if existing.installation_id<>p_installation then raise exception 'Installation is immutable' using errcode='42501'; end if;
  if p_version is null then
   if existing.created_by is not distinct from auth.uid() and existing.version=0 and existing.title=trim(p_title) and existing.interval_months=p_interval and existing.next_due_on=p_due and existing.active=p_active then return existing.id; end if;
   raise exception 'Request conflict' using errcode='40001';
  end if;
  if existing.version<>p_version then raise exception 'Plan changed' using errcode='40001'; end if;
 elsif p_version is not null then raise exception 'Plan unavailable' using errcode='42501'; end if;
 perform 1 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.id=p_installation and i.status<>'archived' and c.archived_at is null for share of i,c;
 if not found then raise exception 'Installation unavailable' using errcode='42501'; end if;
 if present then
  update public.maintenance_plans set title=trim(p_title),interval_months=p_interval,next_due_on=p_due,active=p_active,version=version+1,updated_at=now() where id=p_id;
 else
  insert into public.maintenance_plans(id,installation_id,title,interval_months,next_due_on,active,created_by) values(p_id,p_installation,trim(p_title),p_interval,p_due,p_active,auth.uid());
 end if;
 return p_id;
end $$;
create function public.maintenance_schedule(p_search text default '',p_view text default 'attention',p_page integer default 1,p_installation uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Warsaw')::date; result jsonb;
begin
 if not public.is_staff() then raise exception 'Maintenance access denied' using errcode='42501'; end if;
 if p_search is null or length(p_search)>200 or p_view is null or p_view not in ('attention','overdue','upcoming','all','paused') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid maintenance filter' using errcode='22023'; end if;
 if p_installation is not null and not public.can_read_internal_customer(public.customer_for_installation(p_installation)) then raise exception 'Installation unavailable' using errcode='42501'; end if;
 with base as (
 select m.id,m.installation_id,l.customer_id,m.title,m.interval_months,m.next_due_on,m.active,m.version,c.name as customer_name,i.type as installation_type,l.address,l.city,
 (c.archived_at is null and i.status<>'archived') as parent_active,
 case when c.archived_at is not null or i.status='archived' then 'archived' when not m.active then 'paused' when m.next_due_on<today then 'overdue' when m.next_due_on<=today+30 then 'upcoming' else 'later' end as state
 from public.maintenance_plans m join public.installations i on i.id=m.installation_id join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where public.can_read_internal_customer(c.id) and (p_installation is null or m.installation_id=p_installation)
 and (trim(p_search)='' or strpos(lower(concat_ws(' ',m.title,c.name,i.type,l.address,l.city)),lower(trim(p_search)))>0)
 ), filtered as (select * from base where p_view='all' or (p_view='attention' and state in ('overdue','upcoming')) or (p_view='overdue' and state='overdue') or (p_view='upcoming' and state='upcoming') or (p_view='paused' and state='paused'))
 select jsonb_build_object('today',today,'total',(select count(*) from filtered),
 'summary',jsonb_build_object('overdue',(select count(*) from base where state='overdue'),'upcoming',(select count(*) from base where state='upcoming'),'active',(select count(*) from base where active and parent_active),'paused',(select count(*) from base where state='paused')),
 'plans',coalesce((select jsonb_agg(to_jsonb(rows)) from (select * from filtered order by (state='archived'),(state='paused'),next_due_on,id limit 20 offset(p_page-1)*20) rows),'[]')) into result;
 return result;
end $$;
revoke all on function public.save_maintenance_plan(uuid,uuid,text,integer,date,boolean,integer) from public,anon;
grant execute on function public.save_maintenance_plan(uuid,uuid,text,integer,date,boolean,integer) to authenticated;
revoke all on function public.maintenance_schedule(text,text,integer,uuid) from public,anon;
grant execute on function public.maintenance_schedule(text,text,integer,uuid) to authenticated;

create or replace function public.portal_installation(p_customer uuid,p_installation uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 perform public.portal_assert_customer(p_customer);
 select jsonb_build_object('id',i.id,'type',i.type,'status',i.status,'installed_on',i.installed_on,'address',l.address,'city',l.city,'postal_code',l.postal_code,
 'devices',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'manufacturer',d.manufacturer,'model',d.model,'serial_number',d.serial_number,'warranty_until',d.warranty_until) order by d.created_at,d.id) from public.devices d where d.installation_id=i.id),'[]'),
 'maintenance',coalesce((select jsonb_agg(jsonb_build_object('title',m.title,'interval_months',m.interval_months,'next_due_on',m.next_due_on) order by m.next_due_on) from public.maintenance_plans m where m.installation_id=i.id and m.active),'[]'),
 'history',coalesce((select jsonb_agg(to_jsonb(history)) from (select t.id,t.ticket_number,t.subject,t.status,t.created_at from public.service_tickets t where t.installation_id=i.id order by t.created_at desc,t.id limit 10) history),'[]'))
 into result from public.installations i join public.locations l on l.id=i.location_id where i.id=p_installation and l.customer_id=p_customer;
 return result;
end $$;
