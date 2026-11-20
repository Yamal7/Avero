-- Osoby (design: Firmy i osoby · Osoby): company contacts and individual customers in one table, with person
-- categories (Decyzyjny, Techniczny, Płatnik, Zarządca; individual customers are „Klient indywidualny”).
alter table public.customer_contacts add column categories text[] not null default '{}'
  check(categories <@ array['decision','technical','payer','manager']::text[]);

create function public.set_contact_categories(p_contact uuid,p_categories text[]) returns text[] language plpgsql security definer set search_path='' as $$
declare c public.customer_contacts;cleaned text[];begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 select * into c from public.customer_contacts where id=p_contact;
 if c.id is null then raise exception 'Contact unavailable' using errcode='42501';end if;
 perform public.crm_assert_write(c.customer_id);
 if p_categories is null or not p_categories <@ array['decision','technical','payer','manager']::text[] then raise exception 'Invalid categories' using errcode='22023';end if;
 select coalesce(array_agg(distinct x order by x),'{}') into cleaned from unnest(p_categories) x;
 update public.customer_contacts set categories=cleaned,updated_at=now() where id=p_contact;
 return cleaned;
end;$$;

create function public.people_directory(p_search text default '',p_view text default 'all',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare q text:=lower(trim(coalesce(p_search,'')));result jsonb;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_view not in('all','decision','individual','no_contact_30') or p_page is null or p_page not between 1 and 100000 or length(q)>200 then raise exception 'Invalid people query' using errcode='22023';end if;
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
 ),filtered as(
  select * from scored where p_view='all' or p_view='decision' and categories ? 'decision' or p_view='individual' and kind='individual'
   or p_view='no_contact_30' and (last_contact is null or last_contact<now()-interval '30 days')
 ),paged as(select * from filtered order by lower(name),id limit 25 offset(p_page-1)*25)
 select jsonb_build_object(
  'total',(select count(*) from filtered),
  'all',(select count(*) from people),
  'items',coalesce((select jsonb_agg(jsonb_build_object('kind',p.kind,'id',p.id,'name',p.name,'customerId',p.customer_id,'company',p.company,'role',p.role,'categories',p.categories,'phone',p.phone,'email',p.email,'lastContact',p.last_contact,
    'ownerLabel',(select public.crm_staff_label(o.owner_id) from public.crm_owners o where o.id=p.customer_id and o.owner_id is not null)) order by lower(p.name),p.id) from paged p),'[]')
 ) into result;
 return result;
end;$$;

revoke all on function public.set_contact_categories(uuid,text[]),public.people_directory(text,text,integer) from public,anon,authenticated;
grant execute on function public.set_contact_categories(uuid,text[]),public.people_directory(text,text,integer) to authenticated;
