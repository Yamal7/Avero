-- Firmy i osoby from the design: customer categories and one directory projection with city, devices, last contact,
-- account owner and revenue (accepted offers, last 12 months; office only).
alter table public.customers add column categories text[] not null default '{}' check(cardinality(categories)<=8);

create function public.set_customer_categories(p_customer uuid,p_categories text[]) returns text[] language plpgsql security definer set search_path='' as $$
declare cleaned text[];v text;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 perform public.crm_assert_write(p_customer);
 if p_categories is null or cardinality(p_categories)>8 then raise exception 'Invalid categories' using errcode='22023';end if;
 foreach v in array p_categories loop
  if v is null or length(v) not between 1 and 40 or v<>trim(v) or v~'[[:cntrl:]]' then raise exception 'Invalid category' using errcode='22023';end if;
 end loop;
 select coalesce(array_agg(x order by ord),'{}') into cleaned from(select distinct on(lower(x)) x,ord from unnest(p_categories) with ordinality u(x,ord) order by lower(x),ord) d;
 update public.customers set categories=cleaned where id=p_customer;
 return cleaned;
end;$$;

create function public.customer_directory(p_search text default '',p_archived boolean default false,p_kind text default 'company',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare q text:=lower(trim(coalesce(p_search,'')));manage boolean:=public.can_manage_crm();result jsonb;begin
 if not public.account_enabled(auth.uid()) or not exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Staff required' using errcode='42501';end if;
 if p_kind not in('company','individual') or p_page is null or p_page not between 1 and 100000 or length(q)>200 then raise exception 'Invalid directory query' using errcode='22023';end if;
 with visible as materialized(
  select c.* from public.customers c
  where (c.archived_at is not null)=coalesce(p_archived,false) and public.can_read_internal_customer(c.id)
   and(q='' or strpos(lower(concat_ws(' ',c.name,c.email,c.phone,array_to_string(c.categories,' '))),q)>0
    or exists(select 1 from public.locations l where l.customer_id=c.id and strpos(lower(concat_ws(' ',l.address,l.city,l.postal_code)),q)>0))
 ),kind as(select * from visible where type::text=p_kind),
 paged as(select * from kind order by lower(name),id limit 25 offset(p_page-1)*25)
 select jsonb_build_object(
  'total',(select count(*) from kind),
  'counts',jsonb_build_object('company',(select count(*) from visible where type::text='company'),'individual',(select count(*) from visible where type::text='individual')),
  'items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'type',p.type,'email',p.email,'phone',p.phone,'categories',to_jsonb(p.categories),
    'city',(select l.city from public.locations l where l.customer_id=p.id order by l.created_at,l.id limit 1),
    'devices',(select count(*) from public.devices d join public.installations i on i.id=d.installation_id join public.locations l on l.id=i.location_id where l.customer_id=p.id),
    'lastContact',(select max(x) from(select max(created_at) x from public.crm_notes where customer_id=p.id union all select max(created_at) from public.service_tickets where customer_id=p.id union all select max(updated_at) from public.crm_tasks where customer_id=p.id) s),
    'ownerId',(select o.owner_id from public.crm_owners o where o.id=p.id),
    'ownerLabel',(select public.crm_staff_label(o.owner_id) from public.crm_owners o where o.id=p.id and o.owner_id is not null),
    'revenueCents',case when manage then (select coalesce(sum((v->>'netCents')::bigint),0) from public.offer_publications op cross join lateral jsonb_array_elements(op.snapshot->'variants') v where op.customer_id=p.id and op.state='accepted' and op.accepted_at>now()-interval '12 months' and v->>'id'=op.selected_variant_id::text) end
   ) order by lower(p.name),p.id) from paged p),'[]')
 ) into result;
 return result;
end;$$;

revoke all on function public.set_customer_categories(uuid,text[]),public.customer_directory(text,boolean,text,integer) from public,anon,authenticated;
grant execute on function public.set_customer_categories(uuid,text[]),public.customer_directory(text,boolean,text,integer) to authenticated;
