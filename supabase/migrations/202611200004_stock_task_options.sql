-- Open tasks that stock can be reserved for (design: rezerwacja na zadanie, e.g. ZD-118 zamówienie butli). Office only.
create function public.stock_task_options() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'number',t.number,'title',t.fields->>'title','customerId',t.customer_id,'customer',c.name) order by t.number desc)
  from(select * from public.crm_tasks where fields->>'state' in('backlog','todo','in_progress','review') order by number desc limit 200) t join public.customers c on c.id=t.customer_id),'[]');
end;$$;
revoke all on function public.stock_task_options() from public,anon,authenticated;
grant execute on function public.stock_task_options() to authenticated;
