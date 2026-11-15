-- Enrich the existing activity stream, never expose raw audit snapshots.
create or replace function public.customer_activity(p_customer uuid,p_kind text default 'all',p_page integer default 1) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare total bigint;items jsonb;manager boolean;
begin
 perform public.assert_customer_workspace(p_customer);
 if p_page is null or p_page not between 1 and 100000 or p_kind is null or p_kind not in('all','customer','contact','offer','work','handover','correction','service','maintenance','crm_note','crm_task','crm_owner') then raise exception 'Invalid history filter' using errcode='22023';end if;
 manager:=public.can_manage_crm();
 with events as(select * from public.customer_activity_rows(p_customer) where p_kind='all' or kind=p_kind),
 paged as(select * from events order by at desc,id desc limit 20 offset(p_page-1)*20),
 enriched as (
 select e.*,a.actor_id,a.old_data->'fields' as previous,a.new_data->'fields' as current,
   manager and a.action='UPDATE' and (
     a.old_data->'fields'->>'dueOn' is distinct from a.new_data->'fields'->>'dueOn'
     or a.old_data->'fields'->>'assigneeId' is distinct from a.new_data->'fields'->>'assigneeId'
   ) as plan_changed
 from paged e left join public.audit_logs a on manager and e.kind='crm_task' and a.id=case when e.kind='crm_task' then substring(e.id from 10)::bigint end and a.table_name='crm_tasks' and a.row_id=e.entity_id
 )
 select (select count(*) from events),coalesce((select jsonb_agg(
   jsonb_build_object('id',id,'at',at,'kind',kind,'title',case when plan_changed and previous->>'state'=current->>'state' then 'Zmieniono plan zadania CRM' else title end,'detail',detail,'entityId',entity_id,'round',round)
   ||case when plan_changed then jsonb_build_object('planChange',jsonb_build_object(
     'actorLabel',coalesce(public.crm_staff_label(actor_id),'Niedostępny użytkownik'),
     'dueOn',case when previous->>'dueOn' is distinct from current->>'dueOn' then jsonb_build_object('from',previous->>'dueOn','to',current->>'dueOn') else null end,
     'assignee',case when previous->>'assigneeId' is distinct from current->>'assigneeId' then jsonb_build_object(
       'fromLabel',coalesce(public.crm_staff_label((previous->>'assigneeId')::uuid),'Niedostępny użytkownik'),
       'toLabel',coalesce(public.crm_staff_label((current->>'assigneeId')::uuid),'Niedostępny użytkownik')) else null end
   )) else '{}'::jsonb end order by at desc,id desc) from enriched),'[]') into total,items;
 return jsonb_build_object('total',total,'items',items);
end;$$;
revoke all on function public.customer_activity(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.customer_activity(uuid,text,integer) to authenticated;
