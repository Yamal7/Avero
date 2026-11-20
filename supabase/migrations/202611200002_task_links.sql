-- A task points at the concrete work it belongs to: a service ticket (ZG-0000), a work order (ZS-0000) or an offer (OF-YYYY-NNN).
alter table public.crm_tasks
  add column link_ticket_id uuid references public.service_tickets(id) on delete set null,
  add column link_order_id uuid references public.work_orders(id) on delete set null,
  add column link_offer_id uuid references public.offers(id) on delete set null,
  add constraint crm_tasks_single_link check (num_nonnulls(link_ticket_id,link_order_id,link_offer_id)<=1);

create function public.crm_task_link_json(p_ticket uuid,p_order uuid,p_offer uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(
  (select jsonb_build_object('kind','ticket','id',id,'code','ZG-'||lpad(ticket_number::text,4,'0'),'title',subject) from public.service_tickets where id=p_ticket),
  (select jsonb_build_object('kind','order','id',id,'code','ZS-'||lpad(order_number::text,4,'0'),'title',concat_ws(', ',nullif(address,''),nullif(city,''))) from public.work_orders where id=p_order),
  (select jsonb_build_object('kind','offer','id',id,'code','OF-'||to_char(created_at at time zone 'Europe/Warsaw','YYYY')||'-'||lpad(offer_number::text,3,'0'),'title',coalesce(nullif(data->>'title',''),'Oferta')) from public.offers where id=p_offer));
$$;
revoke all on function public.crm_task_link_json(uuid,uuid,uuid) from public,anon,authenticated;

create or replace function public.crm_record_json(p_kind text, p_id uuid) returns jsonb language sql stable security definer set search_path='' as $function$
 select fields||jsonb_build_object('id',id,'customerId',customer_id,'version',version,'createdAt',created_at,'updatedAt',updated_at,'contactLabel',(select name from public.customer_contacts where id=(fields->>'contactId')::uuid)) from public.crm_notes where p_kind='notes' and id=p_id
 union all
 select fields||jsonb_build_object('id',id,'customerId',customer_id,'version',version,'createdAt',created_at,'updatedAt',updated_at,'contactLabel',(select name from public.customer_contacts where id=(fields->>'contactId')::uuid),'assigneeLabel',coalesce(public.crm_staff_label((fields->>'assigneeId')::uuid),'Niedostępny użytkownik'),'completedAt',completed_at,'number',number,'priority',priority,'label',label,'comments',(select count(*) from public.crm_task_comments c where c.task_id=crm_tasks.id),'link',public.crm_task_link_json(link_ticket_id,link_order_id,link_offer_id)) from public.crm_tasks where p_kind='tasks' and id=p_id;
$function$;

-- What a task of this customer can be linked to. Technicians see the customer's tickets; office also sees work orders and offers.
create function public.crm_task_link_options(p_customer uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare manager boolean:=public.can_manage_crm();begin
 if not public.account_enabled(auth.uid()) or not public.can_read_internal_customer(p_customer) then raise exception 'Customer unavailable' using errcode='42501';end if;
 return coalesce((select jsonb_agg(o order by o->>'kind' desc,o->>'code' desc) from(
   select public.crm_task_link_json(id,null,null) o from public.service_tickets where customer_id=p_customer and (status<>'closed' or updated_at>now()-interval '90 days')
   union all select public.crm_task_link_json(null,id,null) from public.work_orders where manager and customer_id=p_customer
   union all select public.crm_task_link_json(null,null,id) from public.offers where manager and customer_id=p_customer) x),'[]');
end;$$;

create function public.set_crm_task_link(p_customer uuid,p_id uuid,p_version integer,p_kind text,p_target uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.crm_tasks;manager boolean:=public.can_manage_crm();t uuid;o uuid;f uuid;begin
 perform public.crm_assert_write(p_customer);
 select * into r from public.crm_tasks where id=p_id for update;
 if r.id is null or r.customer_id<>p_customer or not(manager or r.fields->>'assigneeId'=auth.uid()::text) then raise exception 'Task unavailable' using errcode='42501';end if;
 if p_version is null or p_kind is not null and p_kind not in('ticket','order','offer') or (p_kind is null)<>(p_target is null) then raise exception 'Invalid task link' using errcode='22023';end if;
 if p_kind='ticket' then
  if not exists(select 1 from public.service_tickets where id=p_target and customer_id=p_customer) then raise exception 'Link target unavailable' using errcode='22023';end if; t:=p_target;
 elsif p_kind='order' then
  if not manager then raise exception 'Office required' using errcode='42501';end if;
  if not exists(select 1 from public.work_orders where id=p_target and customer_id=p_customer) then raise exception 'Link target unavailable' using errcode='22023';end if; o:=p_target;
 elsif p_kind='offer' then
  if not manager then raise exception 'Office required' using errcode='42501';end if;
  if not exists(select 1 from public.offers where id=p_target and customer_id=p_customer) then raise exception 'Link target unavailable' using errcode='22023';end if; f:=p_target;
 end if;
 if r.link_ticket_id is not distinct from t and r.link_order_id is not distinct from o and r.link_offer_id is not distinct from f and p_version in(r.version,r.version-1) then return public.crm_record_json('tasks',p_id);end if;
 if p_version<>r.version then raise exception 'Stale task' using errcode='40001';end if;
 update public.crm_tasks set link_ticket_id=t,link_order_id=o,link_offer_id=f,version=version+1,updated_at=now() where id=p_id;
 return public.crm_record_json('tasks',p_id);
end;$$;
revoke all on function public.crm_task_link_options(uuid),public.set_crm_task_link(uuid,uuid,integer,text,uuid) from public,anon;
grant execute on function public.crm_task_link_options(uuid),public.set_crm_task_link(uuid,uuid,integer,text,uuid) to authenticated;
