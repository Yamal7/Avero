-- Optional quantity sources preserve legacy fixed templates. Measurements are copied into offers, never live formulas.
create or replace function public.save_installation_template(p_id uuid,p_version integer,p_fields jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.installation_templates%rowtype;l jsonb;k text;begin
 perform public.service_write_lock();
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_version<0 or p_version>2147483646 or not coalesce(public.offer_keys(p_fields,array['name','description','workType','archived','lines']),false) then raise exception 'Invalid template' using errcode='22023';end if;
 foreach k in array array['name','description','workType'] loop
 if jsonb_typeof(p_fields->k) is distinct from 'string' or p_fields->>k<>trim(p_fields->>k) or p_fields->>k~'[[:cntrl:]]' then raise exception 'Invalid text' using errcode='22023';end if;end loop;
 if length(p_fields->>'name') not between 1 and 160 or length(p_fields->>'description')>1000 or p_fields->>'workType' not in('split','multi_split','heat_pump','underfloor','plumbing','other') or jsonb_typeof(p_fields->'archived') is distinct from 'boolean' or jsonb_typeof(p_fields->'lines') is distinct from 'array' then raise exception 'Invalid template values' using errcode='22023';end if;
 if jsonb_array_length(p_fields->'lines') not between 1 and 30 then raise exception 'Invalid lines' using errcode='22023';end if;
 for l in select * from jsonb_array_elements(p_fields->'lines') loop
 if not coalesce(public.offer_keys(l,case when l?'quantitySource' then array['id','catalogId','quantityMills','quantitySource'] else array['id','catalogId','quantityMills'] end),false) or jsonb_typeof(l->'id') is distinct from 'string' or jsonb_typeof(l->'catalogId') is distinct from 'string' or jsonb_typeof(l->'quantityMills') is distinct from 'number' or (l->>'quantityMills')!~'^[0-9]{1,8}$' then raise exception 'Invalid line' using errcode='22023';end if;
 if l?'quantitySource' and (jsonb_typeof(l->'quantitySource') is distinct from 'string' or l->>'quantitySource' not in('fixed','length','area','labor','travel')) then raise exception 'Invalid quantity source' using errcode='22023';end if;
 perform (l->>'id')::uuid,(l->>'catalogId')::uuid;
 if (l->>'quantityMills')::integer not between 1 and 10000000 then raise exception 'Invalid quantity' using errcode='22023';end if;
 end loop;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_fields->'lines'))<>jsonb_array_length(p_fields->'lines') then raise exception 'Duplicate lines' using errcode='22023';end if;
 select * into r from public.installation_templates where id=p_id for update;
 if r.id is not null then
  if p_version is null then
   if r.created_by=auth.uid() and r.created_payload=p_fields then return public.installation_template_json(p_id);end if;
   raise exception 'Create conflict' using errcode='40001';
  end if;
  if r.fields=p_fields and p_version in(r.version,r.version-1) then return public.installation_template_json(p_id);end if;
  if r.version<>p_version then raise exception 'Stale template' using errcode='40001';end if;
 else
  if p_version is not null then raise exception 'Template unavailable' using errcode='42501';end if;
  if (p_fields->>'archived')::boolean then raise exception 'New template must be active' using errcode='22023';end if;
 end if;
 if not (p_fields->>'archived')::boolean and exists(select 1 from jsonb_array_elements(p_fields->'lines') ref left join public.catalog_items c on c.id=(ref.value->>'catalogId')::uuid where c.id is null or c.archived) then raise exception 'Catalog item unavailable' using errcode='22023';end if;
 if r.id is null then insert into public.installation_templates(id,fields,created_by,created_payload) values(p_id,p_fields,auth.uid(),p_fields);
 else update public.installation_templates set fields=p_fields,version=version+1,updated_at=now() where id=p_id;end if;
 return public.installation_template_json(p_id);
end;$$;

create or replace function public.save_offer(p_id uuid,p_data jsonb,p_version integer default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare existing public.offers%rowtype; present boolean; customer public.customers%rowtype; location public.locations%rowtype; variant jsonb; line jsonb; calculated jsonb:='{}'; snapshot jsonb; catalog_uuid uuid;
begin
 if not public.can_manage_crm() then raise exception 'Offer access denied' using errcode='42501';end if;
 if p_id is null or p_version<0 or p_version>2147483646 or not coalesce(public.offer_keys(p_data,array['customerId','locationId','title','workType','technical','variants','mainVariantId','archived']),false)
 or jsonb_typeof(p_data->'title') is distinct from 'string' or length(trim(p_data->>'title')) not between 1 and 160 or (p_data->>'title')~'[[:cntrl:]]'
 or jsonb_typeof(p_data->'customerId') is distinct from 'string' or jsonb_typeof(p_data->'mainVariantId') is distinct from 'string'
 or jsonb_typeof(p_data->'workType') is distinct from 'string' or p_data->>'workType' not in ('split','multi_split','heat_pump','underfloor','plumbing','other')
 or jsonb_typeof(p_data->'archived') is distinct from 'boolean' or jsonb_typeof(p_data->'variants') is distinct from 'array'
 or not coalesce(public.offer_keys(p_data->'technical',case when p_data->'technical'?'areaMills' then array['lengthMills','laborMills','travelMills','areaMills'] else array['lengthMills','laborMills','travelMills'] end),false)
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
