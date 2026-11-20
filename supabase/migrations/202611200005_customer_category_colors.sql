-- Firmy i osoby: category colours chosen by the office („Zarządzaj kategoriami”), a category filter
-- (any / all / none of the chosen categories), sorting by last contact, the „Bez kontaktu 30 dni” view
-- and a summary row (count, devices, revenue) over the whole filtered list.
create table public.customer_category_colors(
  key text primary key check(key=lower(key) and length(key) between 1 and 40),
  color text not null check(color in('blue','teal','violet','orange','green','amber','red','grey'))
);
alter table public.customer_category_colors enable row level security;
revoke all on public.customer_category_colors from public,anon,authenticated;

create function public.customer_category_list(p_kind text default 'company') returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_kind not in('company','individual') then raise exception 'Invalid kind' using errcode='22023';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('name',x.name,'color',coalesce(cc.color,''),'count',x.n) order by lower(x.name)) from(
   select min(cat) as name,count(*) n from public.customers c cross join lateral unnest(c.categories) cat
   where c.archived_at is null and c.type::text=p_kind and public.can_read_internal_customer(c.id) group by lower(cat)) x
  left join public.customer_category_colors cc on cc.key=lower(x.name)),'[]');
end;$$;

-- Office: set the colour of a category and optionally rename it on every customer.
create function public.save_customer_category(p_name text,p_color text,p_rename text default null) returns void language plpgsql security definer set search_path='' as $$
declare target text:=coalesce(nullif(trim(p_rename),''),trim(p_name));begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_name is null or length(trim(p_name)) not between 1 and 40 or length(target)>40 or target~'[[:cntrl:]]' or p_color not in('blue','teal','violet','orange','green','amber','red','grey') then raise exception 'Invalid category' using errcode='22023';end if;
 if lower(target)<>lower(trim(p_name)) or target<>trim(p_name) then
  update public.customers set categories=(select coalesce(array_agg(v order by o),'{}') from(select distinct on(lower(v)) v,o from unnest(array_replace(categories,(select x from unnest(categories) x where lower(x)=lower(trim(p_name)) limit 1),target)) with ordinality u(v,o) order by lower(v),o) d)
  where exists(select 1 from unnest(categories) x where lower(x)=lower(trim(p_name)));
  delete from public.customer_category_colors where key=lower(trim(p_name));
 end if;
 insert into public.customer_category_colors(key,color) values(lower(target),p_color) on conflict(key) do update set color=excluded.color;
end;$$;

drop function public.customer_directory(text,boolean,text,integer);
create function public.customer_directory(p_search text default '',p_archived boolean default false,p_kind text default 'company',p_page integer default 1,p_categories text[] default '{}',p_mode text default 'any',p_view text default 'all',p_sort text default 'name') returns jsonb language plpgsql stable security definer set search_path='' as $$
declare q text:=lower(trim(coalesce(p_search,'')));manage boolean:=public.can_manage_crm();cats text[];result jsonb;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_kind not in('company','individual') or p_page is null or p_page not between 1 and 100000 or length(q)>200 or p_categories is null or cardinality(p_categories)>20 or p_mode not in('any','all','none') or p_view not in('all','no_contact_30') or p_sort not in('name','last_contact') then raise exception 'Invalid directory query' using errcode='22023';end if;
 select coalesce(array_agg(distinct lower(trim(x))),'{}') into cats from unnest(p_categories) x where length(trim(x))>0;
 with visible as materialized(
  select c.* from public.customers c
  where (c.archived_at is not null)=coalesce(p_archived,false) and public.can_read_internal_customer(c.id)
   and(q='' or strpos(lower(concat_ws(' ',c.name,c.email,c.phone,array_to_string(c.categories,' '))),q)>0
    or exists(select 1 from public.locations l where l.customer_id=c.id and strpos(lower(concat_ws(' ',l.address,l.city,l.postal_code)),q)>0))
 ),kind as materialized(
  select v.*,(select max(x) from(select max(created_at) x from public.crm_notes where customer_id=v.id union all select max(created_at) from public.service_tickets where customer_id=v.id union all select max(updated_at) from public.crm_tasks where customer_id=v.id) s) last_contact,
   (select count(*) from public.devices d join public.installations i on i.id=d.installation_id join public.locations l on l.id=i.location_id where l.customer_id=v.id) device_count,
   case when manage then (select coalesce(sum((vr->>'netCents')::bigint),0) from public.offer_publications op cross join lateral jsonb_array_elements(op.snapshot->'variants') vr where op.customer_id=v.id and op.state='accepted' and op.accepted_at>now()-interval '12 months' and vr->>'id'=op.selected_variant_id::text) end revenue
  from visible v where v.type::text=p_kind
   and(cardinality(cats)=0
    or p_mode='any' and exists(select 1 from unnest(v.categories) x where lower(x)=any(cats))
    or p_mode='all' and (select count(distinct lower(x)) from unnest(v.categories) x where lower(x)=any(cats))=cardinality(cats)
    or p_mode='none' and not exists(select 1 from unnest(v.categories) x where lower(x)=any(cats)))
 ),filtered as materialized(select * from kind where p_view='all' or last_contact is null or last_contact<now()-interval '30 days'),
 paged as(select * from filtered order by case when p_sort='last_contact' then last_contact end desc nulls last,lower(name),id limit 25 offset(p_page-1)*25)
 select jsonb_build_object(
  'total',(select count(*) from filtered),
  'counts',jsonb_build_object('company',(select count(*) from visible where type::text='company'),'individual',(select count(*) from visible where type::text='individual')),
  'summary',jsonb_build_object('all',(select count(*) from visible where type::text=p_kind),'devices',(select coalesce(sum(device_count),0) from filtered),'revenueCents',case when manage then (select coalesce(sum(revenue),0) from filtered) end),
  'items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'type',p.type,'email',p.email,'phone',p.phone,'categories',to_jsonb(p.categories),
    'city',(select l.city from public.locations l where l.customer_id=p.id order by l.created_at,l.id limit 1),
    'devices',p.device_count,'lastContact',p.last_contact,
    'ownerId',(select o.owner_id from public.crm_owners o where o.id=p.id),
    'ownerLabel',(select public.crm_staff_label(o.owner_id) from public.crm_owners o where o.id=p.id and o.owner_id is not null),
    'revenueCents',p.revenue
   ) order by case when p_sort='last_contact' then p.last_contact end desc nulls last,lower(p.name),p.id) from paged p),'[]')
 ) into result;
 return result;
end;$$;

revoke all on function public.customer_category_list(text),public.save_customer_category(text,text,text),public.customer_directory(text,boolean,text,integer,text[],text,text,text) from public,anon,authenticated;
grant execute on function public.customer_category_list(text),public.save_customer_category(text,text,text),public.customer_directory(text,boolean,text,integer,text[],text,text,text) to authenticated;
