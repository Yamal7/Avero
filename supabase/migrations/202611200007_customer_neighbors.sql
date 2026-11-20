-- Karta firmy: „1 z 48” and the previous / next record (K / J) in the same order as the list (name), same kind, not archived.
create function public.customer_neighbors(p_customer uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare k text;r jsonb;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) or not public.can_read_internal_customer(p_customer) then raise exception 'Customer unavailable' using errcode='42501';end if;
 select type::text into k from public.customers where id=p_customer;
 with ordered as(select id,row_number() over(order by lower(name),id) pos,lag(id) over(order by lower(name),id) prev,lead(id) over(order by lower(name),id) next
  from public.customers where type::text=k and archived_at is null and public.can_read_internal_customer(id))
 select jsonb_build_object('position',o.pos,'total',(select count(*) from ordered),'previousId',o.prev,'nextId',o.next) into r from ordered o where o.id=p_customer;
 return coalesce(r,jsonb_build_object('position',null,'total',null,'previousId',null,'nextId',null));
end;$$;
revoke all on function public.customer_neighbors(uuid) from public,anon,authenticated;
grant execute on function public.customer_neighbors(uuid) to authenticated;
