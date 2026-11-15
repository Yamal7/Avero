-- Include visits continuing into the selected week from the previous day.
create or replace function public.calendar_service_visits(p_from date) returns jsonb
language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'ticket_id',t.id,'ticket_number',t.ticket_number,'subject',t.subject,'customer_name',c.name,
 'address',l.address,'city',l.city,'assigned_to',t.assigned_to,'scheduled_at',v.scheduled_at,'duration_minutes',v.duration_minutes,'status',v.status) order by v.scheduled_at),'[]')
 from public.service_visits v join public.service_tickets t on t.id=v.ticket_id join public.customers c on c.id=t.customer_id
 join public.installations i on i.id=t.installation_id join public.locations l on l.id=i.location_id
 where v.scheduled_at+v.duration_minutes*interval '1 minute'>(p_from::timestamp at time zone 'Europe/Warsaw') and v.scheduled_at<((p_from+7)::timestamp at time zone 'Europe/Warsaw');
$$;
