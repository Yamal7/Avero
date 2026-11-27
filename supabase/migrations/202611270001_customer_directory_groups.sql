-- M0.4 Silnik widoku kolekcji (KRA-31): Firmy — grupowanie i rozszerzone sortowanie po stronie serwera.
-- p_group (none | category | city) ustawia kolejność: najpierw klucz grupy (puste na końcu), potem sortowanie.
-- Wiersz dostaje klucz grupy (`group`, małymi literami), odpowiedź — liczności wszystkich grup wyniku (`groups`),
-- żeby pasek grupy pokazywał liczbę z całego filtra, a nie z bieżącej strony.
-- p_sort: name | last_contact | devices | revenue (przychód — malejąco; dla techników jest pusty, więc kolejność wg nazwy).
-- Dostęp, filtry, zwracane pola i rozmiar strony (25) bez zmian. Stara wersja (8 parametrów) usunięta — bez przeciążeń.
drop function public.customer_directory(text,boolean,text,integer,text[],text,text,text);
create function public.customer_directory(p_search text default '',p_archived boolean default false,p_kind text default 'company',p_page integer default 1,p_categories text[] default '{}',p_mode text default 'any',p_view text default 'all',p_sort text default 'name',p_group text default 'none') returns jsonb language plpgsql stable security definer set search_path='' as $$
declare q text:=lower(trim(coalesce(p_search,'')));manage boolean:=public.can_manage_crm();cats text[];result jsonb;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_kind is null or p_kind not in('company','individual') or p_page is null or p_page not between 1 and 100000 or length(q)>200 or p_categories is null or cardinality(p_categories)>20
  or p_mode is null or p_mode not in('any','all','none') or p_view is null or p_view not in('all','no_contact_30')
  or p_sort is null or p_sort not in('name','last_contact','devices','revenue') or p_group is null or p_group not in('none','category','city') then
  raise exception 'Invalid directory query' using errcode='22023';end if;
 select coalesce(array_agg(distinct lower(trim(x))),'{}') into cats from unnest(p_categories) x where length(trim(x))>0;
 with visible as materialized(
  select c.* from public.customers c
  where (c.archived_at is not null)=coalesce(p_archived,false) and public.can_read_internal_customer(c.id)
   and(q='' or strpos(lower(concat_ws(' ',c.name,c.email,c.phone,array_to_string(c.categories,' '))),q)>0
    or exists(select 1 from public.locations l where l.customer_id=c.id and strpos(lower(concat_ws(' ',l.address,l.city,l.postal_code)),q)>0))
 ),kind as materialized(
  select v.*,(select max(x) from(select max(created_at) x from public.crm_notes where customer_id=v.id union all select max(created_at) from public.service_tickets where customer_id=v.id union all select max(updated_at) from public.crm_tasks where customer_id=v.id) s) last_contact,
   (select count(*) from public.devices d join public.installations i on i.id=d.installation_id join public.locations l on l.id=i.location_id where l.customer_id=v.id) device_count,
   case when manage then (select coalesce(sum((vr->>'netCents')::bigint),0) from public.offer_publications op cross join lateral jsonb_array_elements(op.snapshot->'variants') vr where op.customer_id=v.id and op.state='accepted' and op.accepted_at>now()-interval '12 months' and vr->>'id'=op.selected_variant_id::text) end revenue,
   (select l.city from public.locations l where l.customer_id=v.id order by l.created_at,l.id limit 1) first_city
  from visible v where v.type::text=p_kind
   and(cardinality(cats)=0
    or p_mode='any' and exists(select 1 from unnest(v.categories) x where lower(x)=any(cats))
    or p_mode='all' and (select count(distinct lower(x)) from unnest(v.categories) x where lower(x)=any(cats))=cardinality(cats)
    or p_mode='none' and not exists(select 1 from unnest(v.categories) x where lower(x)=any(cats)))
 ),filtered as materialized(
  select k.*,
   case p_group when 'category' then coalesce(nullif(trim(k.categories[1]),''),'') when 'city' then coalesce(nullif(trim(k.first_city),''),'') else '' end group_label
  from kind k where p_view='all' or k.last_contact is null or k.last_contact<now()-interval '30 days'
 ),ordered as materialized(
  select f.*,lower(f.group_label) group_key,row_number() over(order by
   (f.group_label=''),lower(f.group_label),
   case when p_sort='last_contact' then f.last_contact end desc nulls last,
   case when p_sort='devices' then f.device_count end desc,
   case when p_sort='revenue' then f.revenue end desc nulls last,
   lower(f.name),f.id) rn
  from filtered f
 )
 select jsonb_build_object(
  'total',(select count(*) from filtered),
  'counts',jsonb_build_object('company',(select count(*) from visible where type::text='company'),'individual',(select count(*) from visible where type::text='individual')),
  'summary',jsonb_build_object('all',(select count(*) from visible where type::text=p_kind),'devices',(select coalesce(sum(device_count),0) from filtered),'revenueCents',case when manage then (select coalesce(sum(revenue),0) from filtered) end),
  'groups',case when p_group='none' then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('key',g.group_key,'label',g.label,'count',g.n) order by g.first_rn)
    from(select group_key,min(group_label) label,count(*) n,min(rn) first_rn from ordered group by group_key) g),'[]') end,
  'items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'type',p.type,'email',p.email,'phone',p.phone,'categories',to_jsonb(p.categories),
    'city',p.first_city,'devices',p.device_count,'lastContact',p.last_contact,
    'ownerId',(select o.owner_id from public.crm_owners o where o.id=p.id),
    'ownerLabel',(select public.crm_staff_label(o.owner_id) from public.crm_owners o where o.id=p.id and o.owner_id is not null),
    'revenueCents',p.revenue,'group',p.group_key
   ) order by p.rn) from ordered p where p.rn>(p_page-1)*25 and p.rn<=p_page*25),'[]')
 ) into result;
 return result;
end;$$;
alter function public.customer_directory(text,boolean,text,integer,text[],text,text,text,text) owner to avero_rpc;
revoke all on function public.customer_directory(text,boolean,text,integer,text[],text,text,text,text) from public,anon,authenticated;
grant execute on function public.customer_directory(text,boolean,text,integer,text[],text,text,text,text) to authenticated;
