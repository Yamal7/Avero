-- M0.4 Silnik widoku kolekcji (KRA-31): Osoby — sortowanie po stronie serwera (p_sort: name | last_contact).
-- Dostęp, widoki, zwracane pola i rozmiar strony (25) bez zmian. Stara wersja (3 parametry) usunięta — bez przeciążeń.
drop function public.people_directory(text,text,integer);
create function public.people_directory(p_search text default '',p_view text default 'all',p_page integer default 1,p_sort text default 'name') returns jsonb language plpgsql stable security definer set search_path='' as $$
declare q text:=lower(trim(coalesce(p_search,'')));result jsonb;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_view is null or p_view not in('all','decision','individual','no_contact_30') or p_page is null or p_page not between 1 and 100000 or length(q)>200
  or p_sort is null or p_sort not in('name','last_contact') then raise exception 'Invalid people query' using errcode='22023';end if;
 with people as materialized(
  select 'contact' kind,k.id,k.name,c.id customer_id,c.name company,k.role,to_jsonb(k.categories) categories,nullif(k.phone,'') phone,nullif(k.email,'') email,c.id contact_of
  from public.customer_contacts k join public.customers c on c.id=k.customer_id
  where not k.archived and c.archived_at is null and c.type::text='company' and public.can_read_internal_customer(c.id)
  union all
  select 'individual',c.id,c.name,c.id,null,'',to_jsonb(array['individual']),c.phone,c.email,c.id
  from public.customers c where c.archived_at is null and c.type::text='individual' and public.can_read_internal_customer(c.id)
 ),scored as materialized(
  select p.*,(select max(x) from(select max(created_at) x from public.crm_notes where customer_id=p.customer_id union all select max(created_at) from public.service_tickets where customer_id=p.customer_id union all select max(updated_at) from public.crm_tasks where customer_id=p.customer_id) s) last_contact
  from people p where q='' or strpos(lower(concat_ws(' ',p.name,p.company,p.role,p.phone,p.email)),q)>0
 ),filtered as materialized(
  select * from scored where p_view='all' or p_view='decision' and categories ? 'decision' or p_view='individual' and kind='individual'
   or p_view='no_contact_30' and (last_contact is null or last_contact<now()-interval '30 days')
 ),ordered as materialized(
  select f.*,row_number() over(order by case when p_sort='last_contact' then f.last_contact end desc nulls last,lower(f.name),f.id) rn from filtered f
 )
 select jsonb_build_object(
  'total',(select count(*) from filtered),
  'all',(select count(*) from people),
  'items',coalesce((select jsonb_agg(jsonb_build_object('kind',p.kind,'id',p.id,'name',p.name,'customerId',p.customer_id,'company',p.company,'role',p.role,'categories',p.categories,'phone',p.phone,'email',p.email,'lastContact',p.last_contact,
    'ownerLabel',(select public.crm_staff_label(o.owner_id) from public.crm_owners o where o.id=p.customer_id and o.owner_id is not null)) order by p.rn)
   from ordered p where p.rn>(p_page-1)*25 and p.rn<=p_page*25),'[]')
 ) into result;
 return result;
end;$$;
alter function public.people_directory(text,text,integer,text) owner to avero_rpc;
revoke all on function public.people_directory(text,text,integer,text) from public,anon,authenticated;
grant execute on function public.people_directory(text,text,integer,text) to authenticated;
