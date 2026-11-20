create table public.app_notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),category text not null check(category in('tasks','service','maintenance')),source_id uuid not null,event_key text not null,phase text not null check(phase in('today','overdue','urgent','upcoming')),due_on date,created_at timestamptz not null default now(),read_at timestamptz,version integer not null default 0,unique(user_id,category,source_id,event_key));
create index app_notifications_owner_time on public.app_notifications(user_id,created_at desc,id desc);
create table public.notification_preferences(user_id uuid primary key references auth.users(id),tasks boolean not null default true,service boolean not null default true,maintenance boolean not null default true,version integer not null default 0);
alter table public.app_notifications enable row level security;
alter table public.notification_preferences enable row level security;
revoke all on public.app_notifications,public.notification_preferences from public,anon,authenticated;
create function public.assert_notification_staff() returns void language plpgsql stable security definer set search_path='' as $$begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid() and role in('admin','office','technician')) then raise exception 'Staff required' using errcode='42501';end if;
end;$$;
-- Resolve names and access live: the ledger never stores private descriptions or stale customer data.
create function public.notification_sources() returns table(category text,source_id uuid,title text,customer_name text,href text,event_key text,phase text,due_on date,active boolean) language plpgsql stable security definer set search_path='' as $$
declare today date:=(now() at time zone 'Europe/Warsaw')::date;begin
 perform public.assert_notification_staff();
 return query
 select 'tasks',t.id,t.fields->>'title',c.name,'/dashboard/customers/'||c.id||'?tab=tasks&filter=all&page='||(1+(select count(*)/20 from public.crm_tasks sibling where sibling.customer_id=t.customer_id and (public.can_manage_crm() or sibling.fields->>'assigneeId'=auth.uid()::text) and (sibling.fields->>'dueOn',sibling.id)<(t.fields->>'dueOn',t.id)))||'#crm-'||t.id,
 (t.fields->>'dueOn')||':'||case when (t.fields->>'dueOn')::date<today then 'overdue' else 'today' end,case when (t.fields->>'dueOn')::date<today then 'overdue' else 'today' end,(t.fields->>'dueOn')::date,t.fields->>'state' in('todo','in_progress') and (t.fields->>'dueOn')::date<=today
 from public.crm_tasks t join public.customers c on c.id=t.customer_id where t.fields->>'assigneeId'=auth.uid()::text and c.archived_at is null and public.can_read_internal_customer(c.id)
 union all
 select 'service',t.id,t.subject,c.name,'/dashboard/service/'||t.id,'urgent','urgent',null::date,t.status<>'closed' and t.priority='high'
 from public.service_tickets t join public.customers c on c.id=t.customer_id where c.archived_at is null and public.can_read_service_ticket(t.id)
 union all
 select 'maintenance',m.id,m.title,c.name,'/dashboard/maintenance/'||m.id,m.next_due_on::text||':'||case when m.next_due_on<today then 'overdue' else 'upcoming' end,case when m.next_due_on<today then 'overdue' else 'upcoming' end,m.next_due_on,m.active and m.next_due_on<=today+30
 from public.maintenance_plans m join public.installations i on i.id=m.installation_id join public.locations l on l.id=i.location_id join public.customers c on c.id=l.customer_id where c.archived_at is null and i.status<>'archived' and public.can_read_internal_customer(c.id);
end;$$;
create function public.my_notification_preferences() returns jsonb language plpgsql stable security definer set search_path='' as $$declare result jsonb;begin
 perform public.assert_notification_staff();select jsonb_build_object('viewerId',auth.uid(),'version',version,'tasks',tasks,'service',service,'maintenance',maintenance) into result from public.notification_preferences where user_id=auth.uid();
 return coalesce(result,jsonb_build_object('viewerId',auth.uid(),'version',null,'tasks',true,'service',true,'maintenance',true));
end;$$;
create function public.save_notification_preferences(p_version integer,p_tasks boolean,p_service boolean,p_maintenance boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.notification_preferences%rowtype;begin
 perform public.assert_notification_staff();perform pg_advisory_xact_lock(hashtextextended('notifications:'||auth.uid()::text,0));
 if p_version<0 or p_version>2147483646 or p_tasks is null or p_service is null or p_maintenance is null then raise exception 'Invalid preferences' using errcode='22023';end if;
 select * into r from public.notification_preferences where user_id=auth.uid() for update;
 if found then
  if r.tasks=p_tasks and r.service=p_service and r.maintenance=p_maintenance and p_version in(r.version,r.version-1) then return public.my_notification_preferences();end if;
  if r.version=0 and p_version is null and r.tasks=p_tasks and r.service=p_service and r.maintenance=p_maintenance then return public.my_notification_preferences();end if;
  if p_version is distinct from r.version then raise exception 'Stale preferences' using errcode='40001';end if;
  update public.notification_preferences set tasks=p_tasks,service=p_service,maintenance=p_maintenance,version=version+1 where user_id=auth.uid();
 else
  if p_version is not null then raise exception 'Missing preferences' using errcode='40001';end if;
  insert into public.notification_preferences(user_id,tasks,service,maintenance) values(auth.uid(),p_tasks,p_service,p_maintenance);
 end if;return public.my_notification_preferences();
end;$$;
create function public.sync_my_notifications() returns jsonb language plpgsql security definer set search_path='' as $$declare added integer;more boolean;prefs jsonb;begin
 perform public.assert_notification_staff();perform pg_advisory_xact_lock(hashtextextended('notifications:'||auth.uid()::text,0));prefs:=public.my_notification_preferences();
 insert into public.app_notifications(user_id,category,source_id,event_key,phase,due_on)
 select auth.uid(),s.category,s.source_id,s.event_key,s.phase,s.due_on from public.notification_sources() s where s.active and (prefs->>s.category)::boolean and not exists(select 1 from public.app_notifications n where n.user_id=auth.uid() and n.category=s.category and n.source_id=s.source_id and n.event_key=s.event_key) order by s.due_on nulls first,s.category,s.source_id limit 200 on conflict do nothing;
 get diagnostics added=row_count;
 select exists(select 1 from public.notification_sources() s where s.active and (prefs->>s.category)::boolean and not exists(select 1 from public.app_notifications n where n.user_id=auth.uid() and n.category=s.category and n.source_id=s.source_id and n.event_key=s.event_key)) into more;
 return jsonb_build_object('added',added,'more',more);
end;$$;
create function public.list_my_notifications(p_state text default 'all',p_category text default 'all',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$declare result jsonb;begin
 perform public.assert_notification_staff();if p_state is null or p_state not in('all','read','unread') or p_category is null or p_category not in('all','tasks','service','maintenance') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid filter' using errcode='22023';end if;
 with scoped as materialized(select n.*,s.title,s.customer_name,s.href,(s.active and n.event_key=s.event_key) as current from public.app_notifications n join public.notification_sources() s on s.category=n.category and s.source_id=n.source_id where n.user_id=auth.uid()),filtered as(select * from scoped where (p_state='all' or (read_at is not null)=(p_state='read')) and (p_category='all' or category=p_category)),paged as(select * from filtered order by created_at desc,id desc limit 25 offset(p_page-1)*25)
 select jsonb_build_object('viewerId',auth.uid(),'unread',(select count(*) from scoped where read_at is null),'total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'category',category,'sourceId',source_id,'phase',phase,'dueOn',due_on,'createdAt',created_at,'read',read_at is not null,'version',version,'title',title,'customerName',customer_name,'href',href,'current',current) order by created_at desc,id desc) from paged),'[]')) into result;return result;
end;$$;
create function public.mark_my_notification(p_id uuid,p_version integer,p_read boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.app_notifications%rowtype;begin
 perform public.assert_notification_staff();perform pg_advisory_xact_lock(hashtextextended('notifications:'||auth.uid()::text,0));
 if p_id is null or p_version is null or p_version<0 or p_version>2147483646 or p_read is null then raise exception 'Invalid read state' using errcode='22023';end if;
 select * into r from public.app_notifications where id=p_id and user_id=auth.uid() for update;
 if not found or not exists(select 1 from public.notification_sources() s where s.category=r.category and s.source_id=r.source_id) then raise exception 'Notification unavailable' using errcode='42501';end if;
 if (r.read_at is not null)=p_read and p_version in(r.version,r.version-1) then return jsonb_build_object('id',r.id,'read',p_read,'version',r.version);end if;
 if p_version<>r.version then raise exception 'Stale read state' using errcode='40001';end if;
 update public.app_notifications set read_at=case when p_read then now() else null end,version=version+1 where id=r.id returning * into r;
 return jsonb_build_object('id',r.id,'read',r.read_at is not null,'version',r.version);
end;$$;
revoke all on function public.assert_notification_staff(),public.notification_sources(),public.my_notification_preferences(),public.save_notification_preferences(integer,boolean,boolean,boolean),public.sync_my_notifications(),public.list_my_notifications(text,text,integer),public.mark_my_notification(uuid,integer,boolean) from public,anon,authenticated;
grant execute on function public.my_notification_preferences(),public.save_notification_preferences(integer,boolean,boolean,boolean),public.sync_my_notifications(),public.list_my_notifications(text,text,integer),public.mark_my_notification(uuid,integer,boolean) to authenticated;
