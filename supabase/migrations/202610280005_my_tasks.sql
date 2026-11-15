-- Personal CRM agenda. The caller cannot select another assignee or broaden scope.
create index crm_tasks_assignee_due on public.crm_tasks((fields->>'assigneeId'),(fields->>'dueOn'),id);
create function public.my_crm_tasks(p_filter text default 'today',p_search text default '',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare total bigint;items jsonb;counts jsonb;today date:=(now() at time zone 'Europe/Warsaw')::date;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid() and role in('admin','office','technician')) then raise exception 'Staff required' using errcode='42501';end if;
 if p_filter is null or p_filter not in('today','overdue','upcoming','open','closed') or p_search is null or length(p_search)>160 or p_search<>trim(p_search) or p_search~'[[:cntrl:]]' or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid agenda query' using errcode='22023';end if;
 with scoped as materialized(
 select t.*,c.name as customer_name,(t.fields->>'dueOn')::date as due,t.fields->>'state' in('todo','in_progress') as is_open
 from public.crm_tasks t join public.customers c on c.id=t.customer_id
 where t.fields->>'assigneeId'=auth.uid()::text and c.archived_at is null and public.can_read_internal_customer(c.id)
 and (p_search='' or strpos(lower(t.fields->>'title'),lower(p_search))>0 or strpos(lower(c.name),lower(p_search))>0)
 ),filtered as(select * from scoped where
 p_filter='today' and is_open and due=today or p_filter='overdue' and is_open and due<today or p_filter='upcoming' and is_open and due>today or p_filter='open' and is_open or p_filter='closed' and not is_open
 ),paged as(select * from filtered order by case when p_filter='closed' then completed_at end desc,due,id limit 20 offset(p_page-1)*20)
 select (select count(*) from filtered),coalesce((select jsonb_agg(public.crm_record_json('tasks',t.id)||jsonb_build_object('customerName',t.customer_name,'customerPage',1+(select count(*)/20 from public.crm_tasks sibling where sibling.customer_id=t.customer_id and (public.can_manage_crm() or sibling.fields->>'assigneeId'=auth.uid()::text) and (sibling.fields->>'dueOn',sibling.id)<(t.fields->>'dueOn',t.id))) order by case when p_filter='closed' then completed_at end desc,due,id) from paged t),'[]'),
 (select jsonb_build_object('today',count(*) filter(where is_open and due=today),'overdue',count(*) filter(where is_open and due<today),'upcoming',count(*) filter(where is_open and due>today),'open',count(*) filter(where is_open),'closed',count(*) filter(where not is_open)) from scoped)
 into total,items,counts;
 return jsonb_build_object('viewerId',auth.uid(),'today',today,'total',total,'counts',counts,'items',items);
end;$$;
revoke all on function public.my_crm_tasks(text,text,integer) from public,anon,authenticated;
grant execute on function public.my_crm_tasks(text,text,integer) to authenticated;
