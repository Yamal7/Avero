-- Office agenda projects existing CRM permissions; no new customer grants.
create function public.team_crm_tasks(p_date text default 'all',p_state text default 'open',p_assignee uuid default null,p_search text default '',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare total bigint;items jsonb;counts jsonb;people jsonb;today date:=(now() at time zone 'Europe/Warsaw')::date;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_date is null or p_date not in('all','today','overdue','upcoming') or p_state is null or p_state not in('open','todo','in_progress','done','cancelled','all') or p_search is null or length(p_search)>160 or p_search<>trim(p_search) or p_search~'[[:cntrl:]]' or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid team query' using errcode='22023';end if;
 with available as materialized(
 select t.*,c.name as customer_name,(t.fields->>'dueOn')::date as due,t.fields->>'state' in('todo','in_progress') as is_open,(t.fields->>'assigneeId')::uuid as person
 from public.crm_tasks t join public.customers c on c.id=t.customer_id where c.archived_at is null and public.can_read_internal_customer(c.id)
 ),scoped as materialized(select * from available where (p_assignee is null or person=p_assignee) and (p_search='' or strpos(lower(fields->>'title'),lower(p_search))>0 or strpos(lower(customer_name),lower(p_search))>0)),
 filtered as(select * from scoped where (p_state='all' or p_state='open' and is_open or fields->>'state'=p_state) and (p_date='all' or p_date='today' and due=today or p_date='overdue' and due<today or p_date='upcoming' and due>today)),
 paged as(select * from filtered order by due,id limit 20 offset(p_page-1)*20)
 select (select count(*) from filtered),coalesce((select jsonb_agg(public.crm_record_json('tasks',t.id)||jsonb_build_object('customerName',t.customer_name,'customerPage',1+(select count(*)/20 from public.crm_tasks sibling where sibling.customer_id=t.customer_id and (sibling.fields->>'dueOn',sibling.id)<(t.fields->>'dueOn',t.id)),'assigneeAvailable',public.crm_valid_assignee(t.customer_id,t.person)) order by due,id) from paged t),'[]'),
 (select jsonb_build_object('today',count(*) filter(where is_open and due=today),'overdue',count(*) filter(where is_open and due<today),'upcoming',count(*) filter(where is_open and due>today),'open',count(*) filter(where is_open),'closed',count(*) filter(where not is_open)) from scoped),
 coalesce((select jsonb_agg(jsonb_build_object('id',person,'label',coalesce(public.crm_staff_label(person),'Niedostępny użytkownik'),'available',valid) order by coalesce(public.crm_staff_label(person),'Niedostępny użytkownik'),person) from(select person,bool_or(public.crm_valid_assignee(customer_id,person)) as valid from available group by person) staff),'[]')
 into total,items,counts,people;
 return jsonb_build_object('viewerId',auth.uid(),'canManage',true,'today',today,'total',total,'counts',counts,'items',items,'assignees',people);
end;$$;
revoke all on function public.team_crm_tasks(text,text,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.team_crm_tasks(text,text,uuid,text,integer) to authenticated;

-- Enforce the existing active-recipient rule on quick progress as well.
create or replace function public.crm_task_progress(p_customer uuid,p_id uuid,p_version integer,p_state text,p_result text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.crm_tasks;f jsonb;begin
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id for update;
 if r.id is null or r.customer_id<>p_customer or not(public.can_manage_crm() or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_state is null or p_state not in('todo','in_progress','done') or p_result is null or p_version is null then raise exception 'Invalid progress' using errcode='22023';end if;
 f:=r.fields||jsonb_build_object('state',p_state,'result',p_result);perform public.crm_check_fields('tasks',f);
 if f=r.fields and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if p_version<>r.version then raise exception 'Stale task' using errcode='40001';end if;
 if r.fields->>'state'='cancelled' and not public.can_manage_crm() then raise exception 'Office must reopen task' using errcode='42501';end if;
 if p_state<>'done' and not public.crm_valid_assignee(p_customer,(r.fields->>'assigneeId')::uuid) then raise exception 'Assignee unavailable; reassign before reopening' using errcode='22023';end if;
 update public.crm_tasks set fields=f,version=version+1,updated_at=now(),completed_at=case when p_state='done' then coalesce(completed_at,now()) else null end where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$$;
