create table public.maintenance_completions (
 id uuid primary key,
 plan_id uuid not null references public.maintenance_plans(id),
 installation_id uuid not null references public.installations(id),
 protocol_id uuid not null references public.service_protocols(id),
 visit_id uuid not null references public.service_visits(id),
 ticket_id uuid not null references public.service_tickets(id),
 protocol_number bigint not null, ticket_number bigint not null,
 plan_title text not null, interval_months integer not null,
 performed_at timestamptz not null, performed_on date not null,
 previous_due_on date not null, next_due_on date not null,
 plan_version_before integer not null,
 recorded_by uuid not null references auth.users(id),
 recorded_at timestamptz not null default now(),
 unique(plan_id,protocol_id)
);
create index maintenance_completions_history_idx on public.maintenance_completions(plan_id,performed_at desc,id);
create index maintenance_completions_installation_idx on public.maintenance_completions(installation_id,performed_at desc,id);
alter table public.maintenance_completions enable row level security;
revoke all on public.maintenance_completions from anon,authenticated;
grant select on public.maintenance_completions to authenticated;
create policy maintenance_completions_read on public.maintenance_completions for select to authenticated using(public.can_access_customer(public.customer_for_installation(installation_id)));
create trigger maintenance_completions_audit after insert on public.maintenance_completions for each row execute function public.audit_crm_change();

create function public.record_maintenance_completion(p_plan uuid,p_protocol uuid,p_request uuid,p_version integer,p_expected_due date) returns jsonb
language plpgsql security definer set search_path='' as $$
declare plan public.maintenance_plans%rowtype; previous public.maintenance_completions%rowtype;
 protocol record; performed date; next_due date; last_performed timestamptz;
begin
 if not public.can_manage_crm() then raise exception 'Maintenance write access denied' using errcode='42501'; end if;
 if p_plan is null or p_protocol is null or p_request is null or p_version is null or p_version<0 or p_expected_due is null then raise exception 'Invalid completion' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('maintenance-complete:'||p_request::text,0));
 select * into previous from public.maintenance_completions where id=p_request;
 if found then
  if previous.plan_id<>p_plan or previous.protocol_id<>p_protocol or previous.recorded_by<>auth.uid() or previous.plan_version_before<>p_version or previous.next_due_on<>p_expected_due then raise exception 'Request conflict' using errcode='40001'; end if;
  return jsonb_build_object('completionId',previous.id,'planId',previous.plan_id,'nextDueOn',previous.next_due_on);
 end if;
 select * into plan from public.maintenance_plans where id=p_plan for update;
 if not found then raise exception 'Plan unavailable' using errcode='42501'; end if;
 if exists(select 1 from public.maintenance_completions where plan_id=p_plan and protocol_id=p_protocol) then raise exception 'Protocol already recorded for plan' using errcode='P0001'; end if;
 if plan.version<>p_version then raise exception 'Plan changed' using errcode='40001'; end if;
 if not plan.active then raise exception 'Plan must be active' using errcode='P0001'; end if;
 perform 1 from public.installations i join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id
 where i.id=plan.installation_id and i.status<>'archived' and c.archived_at is null for share of i,c;
 if not found then raise exception 'Installation unavailable' using errcode='42501'; end if;
 select p.id,p.protocol_number,v.id as visit_id,v.completed_at,t.id as ticket_id,t.ticket_number into protocol
 from public.service_protocols p join public.service_visits v on v.id=p.visit_id join public.service_tickets t on t.id=v.ticket_id
 where p.id=p_protocol and p.status='published' and v.status='completed' and v.completed_at is not null and v.completed_at<=now()
 and t.installation_id=plan.installation_id for share of p,v,t;
 if not found then raise exception 'Completed protocol unavailable' using errcode='42501'; end if;
 select max(performed_at) into last_performed from public.maintenance_completions where plan_id=p_plan;
 if last_performed is not null and protocol.completed_at<=last_performed then raise exception 'Protocol precedes latest completion' using errcode='P0001'; end if;
 performed:=(protocol.completed_at at time zone 'Europe/Warsaw')::date;
 next_due:=(performed+make_interval(months=>plan.interval_months))::date;
 if performed not between '1900-01-01'::date and '2199-12-31'::date or next_due not between '1900-01-01'::date and '2199-12-31'::date then raise exception 'Invalid completion date' using errcode='22023'; end if;
 if next_due<>p_expected_due then raise exception 'Preview changed' using errcode='40001'; end if;
 insert into public.maintenance_completions(id,plan_id,installation_id,protocol_id,visit_id,ticket_id,protocol_number,ticket_number,plan_title,interval_months,performed_at,performed_on,previous_due_on,next_due_on,plan_version_before,recorded_by)
 values(p_request,plan.id,plan.installation_id,protocol.id,protocol.visit_id,protocol.ticket_id,protocol.protocol_number,protocol.ticket_number,plan.title,plan.interval_months,protocol.completed_at,performed,plan.next_due_on,next_due,plan.version,auth.uid());
 update public.maintenance_plans set next_due_on=next_due,version=version+1,updated_at=now() where id=plan.id;
 return jsonb_build_object('completionId',p_request,'planId',plan.id,'nextDueOn',next_due);
end $$;

create function public.maintenance_completion_history(p_installation uuid,p_page integer default 1,p_plan uuid default null) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid history page' using errcode='22023'; end if;
 select jsonb_build_object('total',(select count(*) from public.maintenance_completions where installation_id=p_installation and (p_plan is null or plan_id=p_plan)),
 'items',coalesce((select jsonb_agg(to_jsonb(rows)) from (
 select id,plan_id,protocol_id,protocol_number,visit_id,ticket_id,ticket_number,plan_title,interval_months,performed_at,performed_on,previous_due_on,next_due_on,recorded_at,
 public.can_read_service_ticket(ticket_id) as can_read_protocol
 from public.maintenance_completions where installation_id=p_installation and (p_plan is null or plan_id=p_plan)
 order by performed_at desc,id limit 20 offset(p_page-1)*20) rows),'[]')) into result;
 return result;
end $$;
create function public.maintenance_plan_detail(p_plan uuid,p_history_page integer default 1,p_protocol_page integer default 1) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare plan public.maintenance_plans%rowtype; plan_data jsonb; candidates jsonb; history jsonb;
 can_complete boolean; last_performed timestamptz; today date:=(now() at time zone 'Europe/Warsaw')::date;
begin
 if not public.is_staff() then raise exception 'Maintenance access denied' using errcode='42501'; end if;
 if p_history_page is null or p_protocol_page is null or p_history_page not between 1 and 100000 or p_protocol_page not between 1 and 100000 then raise exception 'Invalid page' using errcode='22023'; end if;
 select * into plan from public.maintenance_plans where id=p_plan;
 if not found or not public.can_read_internal_customer(public.customer_for_installation(plan.installation_id)) then raise exception 'Plan unavailable' using errcode='42501'; end if;
 select to_jsonb(rows) into plan_data from (
 select m.id,m.installation_id,l.customer_id,m.title,m.interval_months,m.next_due_on,m.active,m.version,c.name as customer_name,i.type as installation_type,l.address,l.city,
 (c.archived_at is null and i.status<>'archived') as parent_active,
 case when c.archived_at is not null or i.status='archived' then 'archived' when not m.active then 'paused' when m.next_due_on<today then 'overdue' when m.next_due_on<=today+30 then 'upcoming' else 'later' end as state
 from public.maintenance_plans m join public.installations i on i.id=m.installation_id join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id where m.id=p_plan) rows;
 can_complete:=public.can_manage_crm() and plan.active and (plan_data->>'parent_active')::boolean;
 select max(performed_at) into last_performed from public.maintenance_completions where plan_id=p_plan;
 with options as (
 select p.id,p.protocol_number,t.id as ticket_id,t.ticket_number,t.subject,v.completed_at,(v.completed_at at time zone 'Europe/Warsaw')::date as performed_on
 from public.service_protocols p join public.service_visits v on v.id=p.visit_id join public.service_tickets t on t.id=v.ticket_id
 where can_complete and t.installation_id=plan.installation_id and p.status='published' and v.status='completed' and v.completed_at is not null and v.completed_at<=now()
 and (v.completed_at at time zone 'Europe/Warsaw')::date>='1900-01-01'::date
 and (last_performed is null or v.completed_at>last_performed)
 and not exists(select 1 from public.maintenance_completions x where x.plan_id=p_plan and x.protocol_id=p.id))
 select jsonb_build_object('total',(select count(*) from options),'items',coalesce((select jsonb_agg(to_jsonb(rows)) from (select * from options order by completed_at desc,id limit 20 offset(p_protocol_page-1)*20) rows),'[]')) into candidates;
 history:=public.maintenance_completion_history(plan.installation_id,p_history_page,p_plan);
 return jsonb_build_object('plan',plan_data,'canComplete',can_complete,'protocols',candidates,'history',history);
end $$;
create function public.portal_maintenance_history(p_customer uuid,p_installation uuid,p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
begin
 perform public.portal_assert_customer(p_customer);
 if not exists(select 1 from public.installations where id=p_installation and public.customer_for_installation(id)=p_customer) then raise exception 'Installation unavailable' using errcode='42501'; end if;
 return public.maintenance_completion_history(p_installation,p_page,null);
end $$;
do $$declare f record;begin
 for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace and proname in ('record_maintenance_completion','maintenance_completion_history','maintenance_plan_detail','portal_maintenance_history') loop
 execute format('revoke all on function %s from public,anon',f.signature);
 execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
