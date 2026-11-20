-- Report a missing ticket instead of a successful zero-row update.
create or replace function public.update_service_ticket(p_ticket uuid,p_status text,p_priority text) returns void
language plpgsql security definer set search_path='' as $$
declare ticket public.service_tickets%rowtype;
begin
 perform public.service_write_lock();
 if not public.can_edit_service_ticket(p_ticket) then raise exception 'Ticket unavailable' using errcode='42501'; end if;
 select * into ticket from public.service_tickets where id=p_ticket for update;
 if not found then raise exception 'Ticket not found' using errcode='P0001'; end if;
 if p_status is null or p_status not in ('new','in_progress','waiting','closed') or p_priority is null or p_priority not in ('low','normal','high') then raise exception 'Invalid status' using errcode='22023'; end if;
 if not public.can_manage_crm() and p_priority<>ticket.priority::text then raise exception 'Priority requires office role' using errcode='42501'; end if;
 if p_status='closed' then
  if exists(select 1 from public.service_visits where ticket_id=p_ticket and status in ('planned','en_route','in_progress')) then raise exception 'Open visits must be completed or cancelled' using errcode='P0001'; end if;
  if not public.can_manage_crm() and not exists(select 1 from public.service_protocols p join public.service_visits v on v.id=p.visit_id where v.ticket_id=p_ticket and p.status='published') then raise exception 'Published protocol required' using errcode='P0001'; end if;
 end if;
 update public.service_tickets set status=p_status::public.ticket_state,priority=p_priority::public.ticket_priority,updated_at=now() where id=p_ticket;
end $$;
