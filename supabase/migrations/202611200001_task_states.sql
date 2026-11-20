-- Task statuses from the design: Backlog and Do sprawdzenia join Do zrobienia, W realizacji, Gotowe, Anulowane.
-- Open = backlog, todo, in_progress, review.

CREATE OR REPLACE FUNCTION public.change_crm_task_plan(p_customer uuid, p_id uuid, p_version integer, p_assignee uuid, p_due_on text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare r public.crm_tasks;f jsonb;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id and customer_id=p_customer for update;
 if r.id is null then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_version is null or p_version<0 or p_assignee is null or p_due_on is null then raise exception 'Invalid task plan' using errcode='22023';end if;
 if not public.crm_valid_assignee(p_customer,p_assignee) then raise exception 'Assignee unavailable' using errcode='22023';end if;
 f:=r.fields||jsonb_build_object('assigneeId',p_assignee::text,'dueOn',p_due_on);perform public.crm_check_fields('tasks',f);
 if f=r.fields and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if r.version<>p_version or r.fields->>'state' not in('backlog','todo','in_progress','review') then raise exception 'Stale or closed task' using errcode='40001';end if;
 update public.crm_tasks set fields=f,version=version+1,updated_at=now() where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$function$
;

CREATE OR REPLACE FUNCTION public.crm_check_fields(p_kind text, p_fields jsonb)
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare k text;v text;lim integer;d date;begin
 if p_kind not in('notes','tasks') or p_kind is null or not coalesce(public.offer_keys(p_fields,case p_kind when 'notes' then array['title','body','kind','occurredOn','contactId','archived'] else array['title','description','kind','dueOn','assigneeId','contactId','state','result'] end),false) then raise exception 'Invalid CRM fields' using errcode='22023';end if;
 foreach k in array case p_kind when 'notes' then array['title','body'] else array['title','description','result'] end loop
 v:=p_fields->>k;lim:=case k when 'title' then 160 when 'body' then 6000 when 'description' then 4000 else 2000 end;
 if jsonb_typeof(p_fields->k) is distinct from 'string' or length(v)>lim or v<>trim(v,E' \n\r\t') or v~E'[\\x01-\\x09\\x0b-\\x1f\\x7f]' or cardinality(string_to_array(v,E'\n'))>80 or k='title' and (length(v)=0 or position(E'\n' in v)>0) then raise exception 'Invalid CRM text' using errcode='22023';end if;
 end loop;
 if jsonb_typeof(p_fields->'kind') is distinct from 'string' or p_kind='notes' and (p_fields->>'kind' not in('note','call','meeting') or jsonb_typeof(p_fields->'archived') is distinct from 'boolean') or p_kind='tasks' and (p_fields->>'kind' not in('general','follow_up') or jsonb_typeof(p_fields->'state') is distinct from 'string' or p_fields->>'state' not in('backlog','todo','in_progress','review','done','cancelled') or jsonb_typeof(p_fields->'assigneeId') is distinct from 'string') then raise exception 'Invalid CRM kind or state' using errcode='22023';end if;
 k:=case p_kind when 'notes' then 'occurredOn' else 'dueOn' end;v:=p_fields->>k;
 if jsonb_typeof(p_fields->k) is distinct from 'string' or v!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date' using errcode='22023';end if;
 d:=v::date;if to_char(d,'YYYY-MM-DD')<>v or d not between date '2000-01-01' and date '2100-12-31' or p_kind='notes' and d>(now() at time zone 'Europe/Warsaw')::date then raise exception 'Invalid date' using errcode='22023';end if;
 if jsonb_typeof(p_fields->'contactId') not in('null','string') or jsonb_typeof(p_fields->'contactId')='string' and (p_fields->>'contactId')::uuid is null then raise exception 'Invalid contact' using errcode='22023';end if;
 if p_kind='tasks' then perform (p_fields->>'assigneeId')::uuid;end if;
exception when datetime_field_overflow or invalid_datetime_format then raise exception 'Invalid CRM date' using errcode='22023';
end;$function$
;

CREATE OR REPLACE FUNCTION public.crm_records(p_customer uuid, p_kind text, p_filter text DEFAULT 'open'::text, p_page integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$declare total bigint;items jsonb;begin
 perform public.assert_customer_workspace(p_customer);
 if p_kind is null or p_kind not in('notes','tasks') or p_filter is null or (p_kind='notes' and p_filter not in('open','archived')) or (p_kind='tasks' and p_filter not in('open','overdue','closed','all')) or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid list' using errcode='22023';end if;
 if p_kind='notes' and not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 with rows as(
 select id,updated_at::text as sort from public.crm_notes where p_kind='notes' and customer_id=p_customer and (fields->>'archived')::boolean=(p_filter='archived')
 union all
 select id,fields->>'dueOn' as sort from public.crm_tasks where p_kind='tasks' and customer_id=p_customer and (public.can_manage_crm() or fields->>'assigneeId'=auth.uid()::text) and (p_filter='all' or p_filter='closed' and fields->>'state' in('done','cancelled') or p_filter in('open','overdue') and fields->>'state' in('backlog','todo','in_progress','review') and (p_filter='open' or (fields->>'dueOn')::date<(now() at time zone 'Europe/Warsaw')::date))
 ), paged as(select * from rows order by case when p_kind='tasks' then sort end,case when p_kind='notes' then sort end desc,id limit 20 offset(p_page-1)*20)
 select (select count(*) from rows),coalesce((select jsonb_agg(public.crm_record_json(p_kind,id) order by case when p_kind='tasks' then sort end,case when p_kind='notes' then sort end desc,id) from paged),'[]') into total,items;
 return jsonb_build_object('total',total,'items',items);
end;$function$
;

CREATE OR REPLACE FUNCTION public.crm_task_plan_context(p_customer uuid, p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$declare r public.crm_tasks;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 perform public.assert_customer_workspace(p_customer);
 select * into r from public.crm_tasks where id=p_id and customer_id=p_customer;
 if r.id is null then raise exception 'Task unavailable' using errcode='42501';end if;
 if r.fields->>'state' not in('backlog','todo','in_progress','review') or exists(select 1 from public.customers where id=p_customer and archived_at is not null) then raise exception 'Planning unavailable' using errcode='40001';end if;
 return jsonb_build_object('task',public.crm_record_json('tasks',p_id),'assignees',coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'label',public.crm_staff_label(user_id)) order by public.crm_staff_label(user_id),user_id) from public.staff_users where public.crm_valid_assignee(p_customer,user_id)),'[]'));
end;$function$
;

CREATE OR REPLACE FUNCTION public.crm_task_progress(p_customer uuid, p_id uuid, p_version integer, p_state text, p_result text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.crm_tasks;f jsonb;begin
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id for update;
 if r.id is null or r.customer_id<>p_customer or not(public.can_manage_crm() or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_state is null or p_state not in('backlog','todo','in_progress','review','done') or p_result is null or p_version is null then raise exception 'Invalid progress' using errcode='22023';end if;
 f:=r.fields||jsonb_build_object('state',p_state,'result',p_result);perform public.crm_check_fields('tasks',f);
 if f=r.fields and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if p_version<>r.version then raise exception 'Stale task' using errcode='40001';end if;
 if r.fields->>'state'='cancelled' and not public.can_manage_crm() then raise exception 'Office must reopen task' using errcode='42501';end if;
 if p_state<>'done' and not public.crm_valid_assignee(p_customer,(r.fields->>'assigneeId')::uuid) then raise exception 'Assignee unavailable; reassign before reopening' using errcode='22023';end if;
 update public.crm_tasks set fields=f,version=version+1,updated_at=now(),completed_at=case when p_state='done' then coalesce(completed_at,now()) else null end where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$function$
;

CREATE OR REPLACE FUNCTION public.customer_crm_summary(p_customer uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$declare manager boolean;begin
 perform public.assert_customer_workspace(p_customer);manager:=public.can_manage_crm();
 return jsonb_build_object('canManage',manager,'viewerId',auth.uid(),'owner',coalesce((select jsonb_build_object('version',version,'ownerId',owner_id,'label',public.crm_staff_label(owner_id),'available',public.crm_valid_assignee(p_customer,owner_id,true)) from public.crm_owners where id=p_customer),jsonb_build_object('version',null,'ownerId',null,'label',null,'available',false)),
 'owners',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'label',public.crm_staff_label(user_id)) order by public.crm_staff_label(user_id),user_id) from public.staff_users where public.crm_valid_assignee(p_customer,user_id,true)),'[]') else '[]'::jsonb end,
 'assignees',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'label',public.crm_staff_label(user_id)) order by public.crm_staff_label(user_id),user_id) from public.staff_users where public.crm_valid_assignee(p_customer,user_id)),'[]') else '[]'::jsonb end,
 'contacts',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',name) order by name,id) from public.customer_contacts where customer_id=p_customer and not archived),'[]') else '[]'::jsonb end,
 'nextContact',(select jsonb_build_object('id',id,'title',fields->>'title','dueOn',fields->>'dueOn','assigneeLabel',coalesce(public.crm_staff_label((fields->>'assigneeId')::uuid),'Niedostępny użytkownik')) from public.crm_tasks where customer_id=p_customer and fields->>'kind'='follow_up' and fields->>'state' in('backlog','todo','in_progress','review') and (manager or fields->>'assigneeId'=auth.uid()::text) order by fields->>'dueOn',id limit 1),
 'openTasks',(select count(*) from public.crm_tasks where customer_id=p_customer and fields->>'state' in('backlog','todo','in_progress','review') and (manager or fields->>'assigneeId'=auth.uid()::text)),
 'overdueTasks',(select count(*) from public.crm_tasks where customer_id=p_customer and fields->>'state' in('backlog','todo','in_progress','review') and (fields->>'dueOn')::date<(now() at time zone 'Europe/Warsaw')::date and (manager or fields->>'assigneeId'=auth.uid()::text)),
 'notes',case when manager then(select count(*) from public.crm_notes where customer_id=p_customer and not(fields->>'archived')::boolean) else null end);
end;$function$
;

CREATE OR REPLACE FUNCTION public.my_crm_tasks(p_filter text DEFAULT 'today'::text, p_search text DEFAULT ''::text, p_page integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare total bigint;items jsonb;counts jsonb;today date:=(now() at time zone 'Europe/Warsaw')::date;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid() and role in('admin','office','technician')) then raise exception 'Staff required' using errcode='42501';end if;
 if p_filter is null or p_filter not in('today','overdue','upcoming','open','closed') or p_search is null or length(p_search)>160 or p_search<>trim(p_search) or p_search~'[[:cntrl:]]' or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid agenda query' using errcode='22023';end if;
 with scoped as materialized(
 select t.*,c.name as customer_name,(t.fields->>'dueOn')::date as due,t.fields->>'state' in('backlog','todo','in_progress','review') as is_open
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.notification_sources()
 RETURNS TABLE(category text, source_id uuid, title text, customer_name text, href text, event_key text, phase text, due_on date, active boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare today date:=(now() at time zone 'Europe/Warsaw')::date;begin
 perform public.assert_notification_staff();
 return query
 select 'tasks',t.id,t.fields->>'title',c.name,'/dashboard/customers/'||c.id||'?tab=tasks&filter=all&page='||(1+(select count(*)/20 from public.crm_tasks sibling where sibling.customer_id=t.customer_id and (public.can_manage_crm() or sibling.fields->>'assigneeId'=auth.uid()::text) and (sibling.fields->>'dueOn',sibling.id)<(t.fields->>'dueOn',t.id)))||'#crm-'||t.id,
 (t.fields->>'dueOn')||':'||case when (t.fields->>'dueOn')::date<today then 'overdue' else 'today' end,case when (t.fields->>'dueOn')::date<today then 'overdue' else 'today' end,(t.fields->>'dueOn')::date,t.fields->>'state' in('backlog','todo','in_progress','review') and (t.fields->>'dueOn')::date<=today
 from public.crm_tasks t join public.customers c on c.id=t.customer_id where t.fields->>'assigneeId'=auth.uid()::text and c.archived_at is null and public.can_read_internal_customer(c.id)
 union all
 select 'service',t.id,t.subject,c.name,'/dashboard/service/'||t.id,'urgent','urgent',null::date,t.status<>'closed' and t.priority='high'
 from public.service_tickets t join public.customers c on c.id=t.customer_id where c.archived_at is null and public.can_read_service_ticket(t.id)
 union all
 select 'maintenance',m.id,m.title,c.name,'/dashboard/maintenance/'||m.id,m.next_due_on::text||':'||case when m.next_due_on<today then 'overdue' else 'upcoming' end,case when m.next_due_on<today then 'overdue' else 'upcoming' end,m.next_due_on,m.active and m.next_due_on<=today+30
 from public.maintenance_plans m join public.installations i on i.id=m.installation_id join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id where c.archived_at is null and i.status<>'archived' and public.can_read_internal_customer(c.id);
end;$function$
;

CREATE OR REPLACE FUNCTION public.team_crm_tasks(p_date text DEFAULT 'all'::text, p_state text DEFAULT 'open'::text, p_assignee uuid DEFAULT NULL::uuid, p_search text DEFAULT ''::text, p_page integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare total bigint;items jsonb;counts jsonb;people jsonb;today date:=(now() at time zone 'Europe/Warsaw')::date;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_date is null or p_date not in('all','today','overdue','upcoming') or p_state is null or p_state not in('open','backlog','todo','in_progress','review','done','cancelled','all') or p_search is null or length(p_search)>160 or p_search<>trim(p_search) or p_search~'[[:cntrl:]]' or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid team query' using errcode='22023';end if;
 with available as materialized(
 select t.*,c.name as customer_name,(t.fields->>'dueOn')::date as due,t.fields->>'state' in('backlog','todo','in_progress','review') as is_open,(t.fields->>'assigneeId')::uuid as person
 from public.crm_tasks t join public.customers c on c.id=t.customer_id where c.archived_at is null and public.can_read_internal_customer(c.id)
 ),scoped as materialized(select * from available where (p_assignee is null or person=p_assignee) and (p_search='' or strpos(lower(fields->>'title'),lower(p_search))>0 or strpos(lower(customer_name),lower(p_search))>0)),
 filtered as(select * from scoped where (p_state='all' or p_state='open' and is_open or fields->>'state'=p_state) and (p_date='all' or p_date='today' and due=today or p_date='overdue' and due<today or p_date='upcoming' and due>today)),
 paged as(select * from filtered order by due,id limit 20 offset(p_page-1)*20)
 select (select count(*) from filtered),coalesce((select jsonb_agg(public.crm_record_json('tasks',t.id)||jsonb_build_object('customerName',t.customer_name,'customerPage',1+(select count(*)/20 from public.crm_tasks sibling where sibling.customer_id=t.customer_id and (sibling.fields->>'dueOn',sibling.id)<(t.fields->>'dueOn',t.id)),'assigneeAvailable',public.crm_valid_assignee(t.customer_id,t.person)) order by due,id) from paged t),'[]'),
 (select jsonb_build_object('today',count(*) filter(where is_open and due=today),'overdue',count(*) filter(where is_open and due<today),'upcoming',count(*) filter(where is_open and due>today),'open',count(*) filter(where is_open),'closed',count(*) filter(where not is_open)) from scoped),
 coalesce((select jsonb_agg(jsonb_build_object('id',person,'label',coalesce(public.crm_staff_label(person),'Niedostępny użytkownik'),'available',valid) order by coalesce(public.crm_staff_label(person),'Niedostępny użytkownik'),person) from(select person,bool_or(public.crm_valid_assignee(customer_id,person)) as valid from available group by person) staff),'[]')
 into total,items,counts,people;
 return jsonb_build_object('viewerId',auth.uid(),'canManage',true,'today',today,'total',total,'counts',counts,'items',items,'assignees',people);
end;$function$
;

