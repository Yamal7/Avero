create table public.offers(
 id uuid primary key,
 offer_number bigint generated always as identity unique,
 customer_id uuid not null references public.customers(id),
 location_id uuid references public.locations(id),
 customer_snapshot jsonb not null,
 data jsonb not null,
 computed jsonb not null,
 creation_data jsonb not null,
 version integer not null default 0 check(version>=0),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.offers enable row level security;
revoke all on public.offers from anon,authenticated;
grant select on public.offers to authenticated;
create policy offers_read on public.offers for select to authenticated using(public.can_manage_crm());
create trigger offers_audit after insert or update on public.offers for each row execute function public.audit_crm_change();

create function public.offer_keys(p_value jsonb,p_keys text[]) returns boolean
language sql immutable set search_path='' as $$
 select case when jsonb_typeof(p_value)='object' then (select count(*)=cardinality(p_keys) and coalesce(bool_and(k=any(p_keys)),false) from jsonb_object_keys(p_value) k) else false end;
$$;
create function public.calculate_offer_variant(p_variant jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare line jsonb; lines jsonb:='[]'; part jsonb; n integer:=0; base_total bigint:=0; cost_total bigint:=0; net_total bigint; vat_total bigint:=0; base bigint; cost bigint; allocated bigint; vat bigint; remainder_count integer; remainders jsonb:='[]'; result_lines jsonb:='[]'; extra integer; idx integer;
begin
 if not coalesce(public.offer_keys(p_variant,array['id','name','lines','internalNote','customerNote','targetMarginBasisPoints','overrideNetCents']),false)
 or jsonb_typeof(p_variant->'id') is distinct from 'string' or jsonb_typeof(p_variant->'name') is distinct from 'string'
 or length(trim(p_variant->>'name')) not between 1 and 80 or (p_variant->>'name')~'[[:cntrl:]]'
 or jsonb_typeof(p_variant->'internalNote') is distinct from 'string' or jsonb_typeof(p_variant->'customerNote') is distinct from 'string'
 or length(p_variant->>'internalNote')>2000 or length(p_variant->>'customerNote')>2000
 or jsonb_typeof(p_variant->'lines') is distinct from 'array'
 or jsonb_typeof(p_variant->'targetMarginBasisPoints') is distinct from 'number' or (p_variant->>'targetMarginBasisPoints')!~'^[0-9]{1,4}$' or (p_variant->>'targetMarginBasisPoints')::integer>9500
 then raise exception 'Invalid offer variant' using errcode='22023';end if;
 perform (p_variant->>'id')::uuid;
 if jsonb_array_length(p_variant->'lines')>30 then raise exception 'Too many offer lines' using errcode='22023';end if;
 if jsonb_typeof(p_variant->'overrideNetCents') is distinct from 'null' and (jsonb_typeof(p_variant->'overrideNetCents') is distinct from 'number' or (p_variant->>'overrideNetCents')!~'^[0-9]{1,12}$') then raise exception 'Invalid final price' using errcode='22023';end if;
 for line in select * from jsonb_array_elements(p_variant->'lines') loop
  if not coalesce(public.offer_keys(line,array['id','catalogId','code','name','description','category','unit','quantityMills','costCents','saleCents','vatBasisPoints','discountBasisPoints']),false)
  or exists(select 1 from unnest(array['id','code','name','description','category','unit']) k where jsonb_typeof(line->k) is distinct from 'string')
  or length(trim(line->>'name')) not between 1 and 160 or length(line->>'code')>64 or length(line->>'description')>500
  or concat_ws('',line->>'name',line->>'code',line->>'description')~'[[:cntrl:]]'
  or line->>'category' not in ('device','material','service','travel') or line->>'unit' not in ('piece','set','meter','square_meter','hour','kilometer','visit')
  or exists(select 1 from unnest(array['quantityMills','costCents','saleCents','vatBasisPoints','discountBasisPoints']) k where jsonb_typeof(line->k) is distinct from 'number' or (line->>k)!~'^[0-9]{1,9}$')
  then raise exception 'Invalid offer line' using errcode='22023';end if;
  perform (line->>'id')::uuid;
  if jsonb_typeof(line->'catalogId') is distinct from 'null' then
   if jsonb_typeof(line->'catalogId') is distinct from 'string' then raise exception 'Invalid catalog identity' using errcode='22023';end if;
   perform (line->>'catalogId')::uuid;
  end if;
  if (line->>'quantityMills')::integer not between 1 and 10000000 or (line->>'vatBasisPoints')::integer>10000 or (line->>'discountBasisPoints')::integer>10000 then raise exception 'Invalid quantity or rate' using errcode='22023';end if;
  base:=round((line->>'quantityMills')::numeric*(line->>'saleCents')::numeric*(10000-(line->>'discountBasisPoints')::integer)/10000000)::bigint;
  cost:=round((line->>'quantityMills')::numeric*(line->>'costCents')::numeric/1000)::bigint;
  base_total:=base_total+base;cost_total:=cost_total+cost;
  lines:=lines||jsonb_build_array(jsonb_build_object('id',line->>'id','baseNetCents',base,'costCents',cost,'vatBasisPoints',(line->>'vatBasisPoints')::integer,'index',n));n:=n+1;
 end loop;
 if (select count(distinct value->>'id') from jsonb_array_elements(lines))<>n then raise exception 'Duplicate offer line' using errcode='22023';end if;
 net_total:=coalesce((p_variant->>'overrideNetCents')::bigint,base_total);
 if base_total=0 and net_total<>0 then raise exception 'Final price requires positive lines' using errcode='22023';end if;
 allocated:=0;
 for part in select * from jsonb_array_elements(lines) loop
  base:=(part->>'baseNetCents')::bigint;
  cost:=case when base_total>0 then floor(base::numeric*net_total/base_total)::bigint else 0 end;
  remainders:=remainders||jsonb_build_array(part||jsonb_build_object('netCents',cost,'remainder',case when base_total>0 then mod(base::numeric*net_total,base_total) else 0 end));
  allocated:=allocated+cost;
 end loop;
 remainder_count:=(net_total-allocated)::integer;
 for part in select value from jsonb_array_elements(remainders) order by (value->>'remainder')::numeric desc,(value->>'index')::integer loop
  idx:=(part->>'index')::integer;extra:=case when remainder_count>0 then 1 else 0 end;remainder_count:=remainder_count-extra;
  allocated:=(part->>'netCents')::bigint+extra;
  vat:=round(allocated::numeric*(part->>'vatBasisPoints')::integer/10000)::bigint;vat_total:=vat_total+vat;
  result_lines:=result_lines||jsonb_build_array(jsonb_build_object('id',part->>'id','baseNetCents',(part->>'baseNetCents')::bigint,'costCents',(part->>'costCents')::bigint,'netCents',allocated,'vatCents',vat,'grossCents',allocated+vat,'index',idx));
 end loop;
 if greatest(base_total,cost_total,net_total+vat_total)>999999999999 then raise exception 'Offer limit exceeded' using errcode='22023';end if;
 return jsonb_build_object('baseNetCents',base_total,'netCents',net_total,'costCents',cost_total,'vatCents',vat_total,'grossCents',net_total+vat_total,'profitCents',net_total-cost_total,'lines',coalesce((select jsonb_agg(value-'index' order by (value->>'index')::integer) from jsonb_array_elements(result_lines)),'[]'));
end $$;
create function public.offer_detail(p_id uuid) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if not public.can_manage_crm() then raise exception 'Offer access denied' using errcode='42501';end if;
 select o.data||jsonb_build_object('id',o.id,'version',o.version,'number','OF-'||to_char(o.created_at at time zone 'Europe/Warsaw','YYYY')||'-'||lpad(o.offer_number::text,greatest(5,length(o.offer_number::text)),'0'),'customerSnapshot',o.customer_snapshot,'computed',o.computed,'createdAt',o.created_at,'updatedAt',o.updated_at) into result from public.offers o where o.id=p_id;
 return result;
end $$;
create function public.save_offer(p_id uuid,p_data jsonb,p_version integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare existing public.offers%rowtype; present boolean; customer public.customers%rowtype; location public.locations%rowtype; variant jsonb; line jsonb; calculated jsonb:='{}'; snapshot jsonb; catalog_uuid uuid;
begin
 if not public.can_manage_crm() then raise exception 'Offer access denied' using errcode='42501';end if;
 if p_id is null or p_version<0 or p_version>2147483646 or not coalesce(public.offer_keys(p_data,array['customerId','locationId','title','workType','technical','variants','mainVariantId','archived']),false)
 or jsonb_typeof(p_data->'title') is distinct from 'string' or length(trim(p_data->>'title')) not between 1 and 160 or (p_data->>'title')~'[[:cntrl:]]'
 or jsonb_typeof(p_data->'customerId') is distinct from 'string' or jsonb_typeof(p_data->'mainVariantId') is distinct from 'string'
 or jsonb_typeof(p_data->'workType') is distinct from 'string' or p_data->>'workType' not in ('split','multi_split','heat_pump','underfloor','plumbing','other')
 or jsonb_typeof(p_data->'archived') is distinct from 'boolean' or jsonb_typeof(p_data->'variants') is distinct from 'array'
 or not coalesce(public.offer_keys(p_data->'technical',array['lengthMills','laborMills','travelMills']),false)
 then raise exception 'Invalid offer' using errcode='22023';end if;
 if jsonb_array_length(p_data->'variants') not between 1 and 5 or exists(select 1 from jsonb_each(p_data->'technical') x where jsonb_typeof(x.value)<>'number' or x.value::text!~'^[0-9]{1,8}$' or x.value::text::numeric>10000000)
 or (select count(distinct value->>'id') from jsonb_array_elements(p_data->'variants'))<>jsonb_array_length(p_data->'variants')
 or not exists(select 1 from jsonb_array_elements(p_data->'variants') where value->>'id'=p_data->>'mainVariantId') then raise exception 'Invalid offer variants or measurements' using errcode='22023';end if;
 if jsonb_typeof(p_data->'locationId') is distinct from 'null' and jsonb_typeof(p_data->'locationId') is distinct from 'string' then raise exception 'Invalid location' using errcode='22023';end if;
 perform (p_data->>'mainVariantId')::uuid;
 perform pg_advisory_xact_lock(hashtextextended('offer:'||p_id::text,0));
 select * into existing from public.offers where id=p_id for update;present:=found;
 if present then
  if p_version is null then
   if existing.created_by=auth.uid() and existing.creation_data=p_data then return public.offer_detail(p_id);end if;
   raise exception 'Offer request conflict' using errcode='40001';
  end if;
  if existing.version<>p_version then raise exception 'Offer changed' using errcode='40001';end if;
  if existing.customer_id<>(p_data->>'customerId')::uuid or existing.location_id is distinct from (p_data->>'locationId')::uuid then raise exception 'Offer customer is immutable' using errcode='42501';end if;
 else
  if p_version is not null then raise exception 'Offer unavailable' using errcode='42501';end if;
  if (p_data->>'archived')::boolean then raise exception 'New offer must be active' using errcode='22023';end if;
 end if;
 select * into customer from public.customers where id=(p_data->>'customerId')::uuid for share;
 if not found or (customer.archived_at is not null and not (p_data->>'archived')::boolean) then raise exception 'Customer unavailable' using errcode='42501';end if;
 if p_data->>'locationId' is not null then
  select * into location from public.locations where id=(p_data->>'locationId')::uuid and customer_id=customer.id for share;
  if not found then raise exception 'Location unavailable' using errcode='42501';end if;
 end if;
 for variant in select * from jsonb_array_elements(p_data->'variants') loop
  calculated:=calculated||jsonb_build_object(variant->>'id',public.calculate_offer_variant(variant));
  for line in select * from jsonb_array_elements(variant->'lines') loop
   if line->>'catalogId' is not null then
    catalog_uuid:=(line->>'catalogId')::uuid;
    if not present or not exists(select 1 from jsonb_array_elements(existing.data->'variants') v cross join lateral jsonb_array_elements(v->'lines') l where l->>'id'=line->>'id' and l->>'catalogId'=line->>'catalogId') then
     perform 1 from public.catalog_items where id=catalog_uuid and not archived for share;
     if not found then raise exception 'Catalog item unavailable' using errcode='42501';end if;
    end if;
   end if;
  end loop;
 end loop;
 if present then update public.offers set data=p_data,computed=calculated,version=version+1,updated_at=now() where id=p_id;
 else
  snapshot:=jsonb_build_object('name',customer.name,'email',customer.email,'phone',customer.phone,'address',location.address,'city',location.city,'postalCode',location.postal_code);
  insert into public.offers(id,customer_id,location_id,customer_snapshot,data,computed,creation_data,created_by) values(p_id,customer.id,location.id,snapshot,p_data,calculated,p_data,auth.uid());
 end if;
 return public.offer_detail(p_id);
end $$;
create function public.list_offers(p_search text default '',p_state text default 'active',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if not public.can_manage_crm() then raise exception 'Offer access denied' using errcode='42501';end if;
 if p_search is null or length(p_search)>200 or p_state is null or p_state not in ('active','archived','all') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid offer filter' using errcode='22023';end if;
 with base as(select o.*,'OF-'||to_char(o.created_at at time zone 'Europe/Warsaw','YYYY')||'-'||lpad(o.offer_number::text,greatest(5,length(o.offer_number::text)),'0') as number from public.offers o), filtered as(select * from base where (p_state='all' or (data->>'archived')::boolean=(p_state='archived')) and (trim(p_search)='' or strpos(lower(concat_ws(' ',number,data->>'title',customer_snapshot->>'name')),lower(trim(p_search)))>0))
 select jsonb_build_object('total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'number',number,'title',data->>'title','customerName',customer_snapshot->>'name','workType',data->>'workType','archived',(data->>'archived')::boolean,'netCents',(computed->(data->>'mainVariantId')->>'netCents')::bigint,'costCents',(computed->(data->>'mainVariantId')->>'costCents')::bigint,'grossCents',(computed->(data->>'mainVariantId')->>'grossCents')::bigint,'updatedAt',updated_at) order by updated_at desc,id) from(select * from filtered order by updated_at desc,id limit 25 offset(p_page-1)*25) rows),'[]')) into result;
 return result;
end $$;
revoke all on function public.offer_keys(jsonb,text[]) from public,anon;
revoke all on function public.calculate_offer_variant(jsonb) from public,anon;
revoke all on function public.offer_detail(uuid) from public,anon;
revoke all on function public.save_offer(uuid,jsonb,integer) from public,anon;
revoke all on function public.list_offers(text,text,integer) from public,anon;
grant execute on function public.offer_keys(jsonb,text[]),public.calculate_offer_variant(jsonb),public.offer_detail(uuid),public.save_offer(uuid,jsonb,integer),public.list_offers(text,text,integer) to authenticated;
