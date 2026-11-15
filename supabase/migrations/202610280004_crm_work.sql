-- CRM work is internal. Assignments never grant customer access.
create table public.crm_notes(id uuid primary key,customer_id uuid not null references public.customers,fields jsonb not null,version integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.crm_tasks(id uuid primary key,customer_id uuid not null references public.customers,fields jsonb not null,version integer not null default 0,completed_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.crm_owners(id uuid primary key references public.customers,owner_id uuid references auth.users,version integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index crm_notes_customer on public.crm_notes(customer_id,updated_at desc,id);
create index crm_tasks_customer on public.crm_tasks(customer_id,(fields->>'dueOn'),id);
alter table public.crm_notes enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_owners enable row level security;
revoke all on public.crm_notes,public.crm_tasks,public.crm_owners from public,anon,authenticated;
create trigger crm_notes_audit after insert or update on public.crm_notes for each row execute function public.audit_crm_change();
create trigger crm_tasks_audit after insert or update on public.crm_tasks for each row execute function public.audit_crm_change();
create trigger crm_owners_audit after insert or update on public.crm_owners for each row execute function public.audit_crm_change();
create function public.crm_staff_label(p_id uuid) returns text language sql stable security definer set search_path='' as $$select coalesce(email,'Użytkownik') from auth.users where id=p_id$$;
create function public.crm_valid_assignee(p_customer uuid,p_user uuid,p_owner boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.staff_users s where s.user_id=p_user and public.account_enabled(s.user_id) and (s.role in('admin','office') or not p_owner and s.role='technician' and exists(select 1 from public.staff_customer_assignments a where a.user_id=s.user_id and a.customer_id=p_customer)));
$$;
create function public.crm_record_json(p_kind text,p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select fields||jsonb_build_object('id',id,'customerId',customer_id,'version',version,'createdAt',created_at,'updatedAt',updated_at,'contactLabel',(select name from public.customer_contacts where id=(fields->>'contactId')::uuid)) from public.crm_notes where p_kind='notes' and id=p_id
 union all
 select fields||jsonb_build_object('id',id,'customerId',customer_id,'version',version,'createdAt',created_at,'updatedAt',updated_at,'contactLabel',(select name from public.customer_contacts where id=(fields->>'contactId')::uuid),'assigneeLabel',coalesce(public.crm_staff_label((fields->>'assigneeId')::uuid),'Niedostępny użytkownik'),'completedAt',completed_at) from public.crm_tasks where p_kind='tasks' and id=p_id;
$$;
create function public.crm_assert_write(p_customer uuid) returns void language plpgsql security definer set search_path='' as $$begin
 perform public.service_write_lock();perform public.assert_customer_workspace(p_customer);
 perform 1 from public.customers where id=p_customer and archived_at is null for update;if not found then raise exception 'Archived customer' using errcode='40001';end if;
end;$$;
create function public.crm_check_fields(p_kind text,p_fields jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare k text;v text;lim integer;d date;begin
 if p_kind not in('notes','tasks') or p_kind is null or not coalesce(public.offer_keys(p_fields,case p_kind when 'notes' then array['title','body','kind','occurredOn','contactId','archived'] else array['title','description','kind','dueOn','assigneeId','contactId','state','result'] end),false) then raise exception 'Invalid CRM fields' using errcode='22023';end if;
 foreach k in array case p_kind when 'notes' then array['title','body'] else array['title','description','result'] end loop
 v:=p_fields->>k;lim:=case k when 'title' then 160 when 'body' then 6000 when 'description' then 4000 else 2000 end;
 if jsonb_typeof(p_fields->k) is distinct from 'string' or length(v)>lim or v<>trim(v,E' \n\r\t') or v~E'[\\x01-\\x09\\x0b-\\x1f\\x7f]' or cardinality(string_to_array(v,E'\n'))>80 or k='title' and (length(v)=0 or position(E'\n' in v)>0) then raise exception 'Invalid CRM text' using errcode='22023';end if;
 end loop;
 if jsonb_typeof(p_fields->'kind') is distinct from 'string' or p_kind='notes' and (p_fields->>'kind' not in('note','call','meeting') or jsonb_typeof(p_fields->'archived') is distinct from 'boolean') or p_kind='tasks' and (p_fields->>'kind' not in('general','follow_up') or jsonb_typeof(p_fields->'state') is distinct from 'string' or p_fields->>'state' not in('todo','in_progress','done','cancelled') or jsonb_typeof(p_fields->'assigneeId') is distinct from 'string') then raise exception 'Invalid CRM kind or state' using errcode='22023';end if;
 k:=case p_kind when 'notes' then 'occurredOn' else 'dueOn' end;v:=p_fields->>k;
 if jsonb_typeof(p_fields->k) is distinct from 'string' or v!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Invalid date' using errcode='22023';end if;
 d:=v::date;if to_char(d,'YYYY-MM-DD')<>v or d not between date '2000-01-01' and date '2100-12-31' or p_kind='notes' and d>(now() at time zone 'Europe/Warsaw')::date then raise exception 'Invalid date' using errcode='22023';end if;
 if jsonb_typeof(p_fields->'contactId') not in('null','string') or jsonb_typeof(p_fields->'contactId')='string' and (p_fields->>'contactId')::uuid is null then raise exception 'Invalid contact' using errcode='22023';end if;
 if p_kind='tasks' then perform (p_fields->>'assigneeId')::uuid;end if;
exception when datetime_field_overflow or invalid_datetime_format then raise exception 'Invalid CRM date' using errcode='22023';
end;$$;
create function public.save_crm_record(p_customer uuid,p_kind text,p_id uuid,p_version integer,p_fields jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare old_fields jsonb;old_version integer;old_customer uuid;person uuid;who uuid;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;perform public.crm_assert_write(p_customer);perform public.crm_check_fields(p_kind,p_fields);
 if p_id is null then raise exception 'Missing id' using errcode='22023';end if;
 if p_kind='notes' then select fields,version,customer_id into old_fields,old_version,old_customer from public.crm_notes where id=p_id for update;else select fields,version,customer_id into old_fields,old_version,old_customer from public.crm_tasks where id=p_id for update;end if;
 if old_customer is not null and old_customer<>p_customer then raise exception 'Foreign record' using errcode='42501';end if;
 if old_fields=p_fields and (p_version in(old_version,old_version-1) or p_version is null and old_version=0) then return public.crm_record_json(p_kind,p_id);end if;
 if p_version is distinct from old_version then raise exception 'Stale record' using errcode='40001';end if;
 person:=(p_fields->>'contactId')::uuid;
 if person is not null and not exists(select 1 from public.customer_contacts c where c.id=person and c.customer_id=p_customer and (not c.archived or old_fields->>'contactId'=person::text)) then raise exception 'Contact unavailable' using errcode='22023';end if;
 if p_kind='tasks' then
 who:=(p_fields->>'assigneeId')::uuid;
 if not public.crm_valid_assignee(p_customer,who) and not coalesce(old_fields->>'assigneeId'=who::text and p_fields->>'state' in('done','cancelled'),false) then raise exception 'Assignee unavailable' using errcode='22023';end if;
 insert into public.crm_tasks(id,customer_id,fields,completed_at) values(p_id,p_customer,p_fields,case when p_fields->>'state' in('done','cancelled') then now() end)
 on conflict(id) do update set fields=excluded.fields,version=public.crm_tasks.version+1,updated_at=now(),completed_at=case when excluded.completed_at is null then null else coalesce(public.crm_tasks.completed_at,excluded.completed_at) end;
 else
 insert into public.crm_notes(id,customer_id,fields) values(p_id,p_customer,p_fields) on conflict(id) do update set fields=excluded.fields,version=public.crm_notes.version+1,updated_at=now();
 end if;
 return public.crm_record_json(p_kind,p_id);
end;$$;
create function public.crm_task_progress(p_customer uuid,p_id uuid,p_version integer,p_state text,p_result text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.crm_tasks;f jsonb;begin
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id for update;
 if r.id is null or r.customer_id<>p_customer or not(public.can_manage_crm() or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_state is null or p_state not in('todo','in_progress','done') or p_result is null or p_version is null then raise exception 'Invalid progress' using errcode='22023';end if;
 f:=r.fields||jsonb_build_object('state',p_state,'result',p_result);perform public.crm_check_fields('tasks',f);
 if f=r.fields and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if p_version<>r.version then raise exception 'Stale task' using errcode='40001';end if;
 if r.fields->>'state'='cancelled' and not public.can_manage_crm() then raise exception 'Office must reopen task' using errcode='42501';end if;
 update public.crm_tasks set fields=f,version=version+1,updated_at=now(),completed_at=case when p_state='done' then coalesce(completed_at,now()) else null end where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$$;
create function public.crm_records(p_customer uuid,p_kind text,p_filter text default 'open',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$declare total bigint;items jsonb;begin
 perform public.assert_customer_workspace(p_customer);
 if p_kind is null or p_kind not in('notes','tasks') or p_filter is null or (p_kind='notes' and p_filter not in('open','archived')) or (p_kind='tasks' and p_filter not in('open','overdue','closed','all')) or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid list' using errcode='22023';end if;
 if p_kind='notes' and not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 with rows as(
 select id,updated_at::text as sort from public.crm_notes where p_kind='notes' and customer_id=p_customer and (fields->>'archived')::boolean=(p_filter='archived')
 union all
 select id,fields->>'dueOn' as sort from public.crm_tasks where p_kind='tasks' and customer_id=p_customer and (public.can_manage_crm() or fields->>'assigneeId'=auth.uid()::text) and (p_filter='all' or p_filter='closed' and fields->>'state' in('done','cancelled') or p_filter in('open','overdue') and fields->>'state' in('todo','in_progress') and (p_filter='open' or (fields->>'dueOn')::date<(now() at time zone 'Europe/Warsaw')::date))
 ), paged as(select * from rows order by case when p_kind='tasks' then sort end,case when p_kind='notes' then sort end desc,id limit 20 offset(p_page-1)*20)
 select (select count(*) from rows),coalesce((select jsonb_agg(public.crm_record_json(p_kind,id) order by case when p_kind='tasks' then sort end,case when p_kind='notes' then sort end desc,id) from paged),'[]') into total,items;
 return jsonb_build_object('total',total,'items',items);
end;$$;
create function public.customer_crm_summary(p_customer uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$declare manager boolean;begin
 perform public.assert_customer_workspace(p_customer);manager:=public.can_manage_crm();
 return jsonb_build_object('canManage',manager,'viewerId',auth.uid(),'owner',coalesce((select jsonb_build_object('version',version,'ownerId',owner_id,'label',public.crm_staff_label(owner_id),'available',public.crm_valid_assignee(p_customer,owner_id,true)) from public.crm_owners where id=p_customer),jsonb_build_object('version',null,'ownerId',null,'label',null,'available',false)),
 'owners',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'label',public.crm_staff_label(user_id)) order by public.crm_staff_label(user_id),user_id) from public.staff_users where public.crm_valid_assignee(p_customer,user_id,true)),'[]') else '[]'::jsonb end,
 'assignees',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',user_id,'label',public.crm_staff_label(user_id)) order by public.crm_staff_label(user_id),user_id) from public.staff_users where public.crm_valid_assignee(p_customer,user_id)),'[]') else '[]'::jsonb end,
 'contacts',case when manager then coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',name) order by name,id) from public.customer_contacts where customer_id=p_customer and not archived),'[]') else '[]'::jsonb end,
 'nextContact',(select jsonb_build_object('id',id,'title',fields->>'title','dueOn',fields->>'dueOn','assigneeLabel',coalesce(public.crm_staff_label((fields->>'assigneeId')::uuid),'Niedostępny użytkownik')) from public.crm_tasks where customer_id=p_customer and fields->>'kind'='follow_up' and fields->>'state' in('todo','in_progress') and (manager or fields->>'assigneeId'=auth.uid()::text) order by fields->>'dueOn',id limit 1),
 'openTasks',(select count(*) from public.crm_tasks where customer_id=p_customer and fields->>'state' in('todo','in_progress') and (manager or fields->>'assigneeId'=auth.uid()::text)),
 'overdueTasks',(select count(*) from public.crm_tasks where customer_id=p_customer and fields->>'state' in('todo','in_progress') and (fields->>'dueOn')::date<(now() at time zone 'Europe/Warsaw')::date and (manager or fields->>'assigneeId'=auth.uid()::text)),
 'notes',case when manager then(select count(*) from public.crm_notes where customer_id=p_customer and not(fields->>'archived')::boolean) else null end);
end;$$;
create function public.save_crm_owner(p_customer uuid,p_version integer,p_owner uuid) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.crm_owners;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;perform public.crm_assert_write(p_customer);
 select * into r from public.crm_owners where id=p_customer for update;
 if r.id is not null and r.owner_id is not distinct from p_owner and (p_version in(r.version,r.version-1) or p_version is null and r.version=0) then return public.customer_crm_summary(p_customer);end if;
 if p_version is distinct from r.version then raise exception 'Stale owner' using errcode='40001';end if;
 if p_owner is not null and not public.crm_valid_assignee(p_customer,p_owner,true) then raise exception 'Owner unavailable' using errcode='22023';end if;
 insert into public.crm_owners(id,owner_id) values(p_customer,p_owner) on conflict(id) do update set owner_id=excluded.owner_id,version=public.crm_owners.version+1,updated_at=now();
 return public.customer_crm_summary(p_customer);
end;$$;

create or replace function public.customer_activity_rows(p_customer uuid) returns table(id text,at timestamptz,kind text,title text,detail text,entity_id uuid,round integer)
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
 select 'maintenance:'||m.id,m.recorded_at,'maintenance','Zarejestrowano wykonanie przeglądu',m.plan_title,m.plan_id,null::integer from public.maintenance_completions m join public.locations l on l.id=(select i.location_id from public.installations i where i.id=m.installation_id) where l.customer_id=p_customer
 union all
 select 'crm-note:'||a.id,a.happened_at,'crm_note',case when a.action='INSERT' then 'Dodano notatkę CRM' when (a.new_data->'fields'->>'archived')::boolean then 'Zarchiwizowano notatkę CRM' else 'Zmieniono notatkę CRM' end,a.new_data->'fields'->>'title',n.id,null::integer from public.audit_logs a join public.crm_notes n on n.id=a.row_id where a.table_name='crm_notes' and n.customer_id=p_customer and public.can_manage_crm()
 union all
 select 'crm-task:'||a.id,a.happened_at,'crm_task',case when a.action='INSERT' then 'Dodano zadanie CRM' when a.new_data->'fields'->>'state'='done' then 'Wykonano zadanie CRM' when a.new_data->'fields'->>'state'='cancelled' then 'Anulowano zadanie CRM' else 'Zmieniono zadanie CRM' end,a.new_data->'fields'->>'title',t.id,null::integer from public.audit_logs a join public.crm_tasks t on t.id=a.row_id where a.table_name='crm_tasks' and t.customer_id=p_customer and (public.can_manage_crm() or t.fields->>'assigneeId'=auth.uid()::text and a.new_data->'fields'->>'assigneeId'=auth.uid()::text and (a.action='INSERT' or a.old_data->'fields'->>'assigneeId'=auth.uid()::text))
 union all
 select 'crm-owner:'||a.id,a.happened_at,'crm_owner','Zmieniono opiekuna handlowego',coalesce(public.crm_staff_label((a.new_data->>'owner_id')::uuid),'Bez opiekuna'),p_customer,null::integer from public.audit_logs a where a.table_name='crm_owners' and a.row_id=p_customer;
end;$$;
create or replace function public.customer_activity(p_customer uuid,p_kind text default 'all',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$declare total bigint;items jsonb;begin
 perform public.assert_customer_workspace(p_customer);if p_page is null or p_page not between 1 and 100000 or p_kind is null or p_kind not in('all','customer','contact','offer','work','handover','correction','service','maintenance','crm_note','crm_task','crm_owner') then raise exception 'Invalid history filter' using errcode='22023';end if;
 with events as(select * from public.customer_activity_rows(p_customer) where p_kind='all' or kind=p_kind),paged as(select * from events order by at desc,id desc limit 20 offset(p_page-1)*20)
 select (select count(*) from events),coalesce((select jsonb_agg(jsonb_build_object('id',id,'at',at,'kind',kind,'title',title,'detail',detail,'entityId',entity_id,'round',round) order by at desc,id desc) from paged),'[]') into total,items;
 return jsonb_build_object('total',total,'items',items);
end;$$;

do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('crm_staff_label','crm_valid_assignee','crm_record_json','crm_assert_write','crm_check_fields','save_crm_record','crm_task_progress','crm_records','customer_crm_summary','save_crm_owner') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.save_crm_record(uuid,text,uuid,integer,jsonb),public.crm_task_progress(uuid,uuid,integer,text,text),public.crm_records(uuid,text,text,integer),public.customer_crm_summary(uuid),public.save_crm_owner(uuid,integer,uuid) to authenticated;
