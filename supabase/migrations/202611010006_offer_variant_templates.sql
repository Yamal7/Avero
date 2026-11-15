-- Private request ledger makes a retried conversion return the original created template.
create table public.offer_template_exports(template_id uuid primary key references public.installation_templates(id),offer_id uuid not null references public.offers(id),variant_id uuid not null,created_by uuid not null references auth.users(id),request jsonb not null);
alter table public.offer_template_exports enable row level security;
revoke all on public.offer_template_exports from public,anon,authenticated;
create function public.offer_variant_template_context(p_offer uuid,p_variant uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare o public.offers%rowtype;v jsonb;items jsonb;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 select * into o from public.offers where id=p_offer;if not found then raise exception 'Offer unavailable' using errcode='42501';end if;
 select value into v from jsonb_array_elements(o.data->'variants') where value->>'id'=p_variant::text;
 if v is null then raise exception 'Variant unavailable' using errcode='42501';end if;
 select coalesce(jsonb_agg(jsonb_build_object('lineId',l.value->>'id','name',l.value->>'name','unit',l.value->>'unit','quantityMills',(l.value->>'quantityMills')::integer,'catalog',case when c.id is not null then jsonb_build_object('id',c.id,'name',c.name,'unit',c.unit) else null end) order by l.ordinality),'[]') into items from jsonb_array_elements(v->'lines') with ordinality l left join public.catalog_items c on c.id=(l.value->>'catalogId')::uuid and not c.archived and c.unit=l.value->>'unit';
 return jsonb_build_object('offerId',o.id,'offerVersion',o.version,'variantId',p_variant,'variantName',v->>'name','workType',o.data->>'workType','lines',items);
end;$$;
create function public.create_template_from_offer_variant(p_offer uuid,p_variant uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid;old public.offer_template_exports%rowtype;o public.offers%rowtype;v jsonb;m jsonb;l jsonb;items jsonb:='[]';fields jsonb;begin
 perform public.service_write_lock();
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_offer is null or p_variant is null or not coalesce(public.offer_keys(p_input,array['id','offerVersion','name','description','mappings']),false) then raise exception 'Invalid conversion' using errcode='22023';end if;
 if jsonb_typeof(p_input->'id') is distinct from 'string' or jsonb_typeof(p_input->'offerVersion') is distinct from 'number' or p_input->>'offerVersion'!~'^[0-9]{1,10}$' or (p_input->>'offerVersion')::numeric>2147483646 or jsonb_typeof(p_input->'name') is distinct from 'string' or jsonb_typeof(p_input->'description') is distinct from 'string' or jsonb_typeof(p_input->'mappings') is distinct from 'array' then raise exception 'Invalid conversion types' using errcode='22023';end if;
 target:=(p_input->>'id')::uuid;
 select * into old from public.offer_template_exports where template_id=target;
 if found then
  if old.created_by=auth.uid() and old.offer_id=p_offer and old.variant_id=p_variant and old.request=p_input then return public.installation_template_json(target);end if;
  raise exception 'Conversion request conflict' using errcode='40001';
 end if;
 if exists(select 1 from public.installation_templates where id=target) then raise exception 'Template id already used' using errcode='40001';end if;
 select * into o from public.offers where id=p_offer for share;
 if not found then raise exception 'Offer unavailable' using errcode='42501';end if;
 if o.version<>(p_input->>'offerVersion')::integer then raise exception 'Stale source offer' using errcode='40001';end if;
 select value into v from jsonb_array_elements(o.data->'variants') where value->>'id'=p_variant::text;
 if v is null then raise exception 'Variant unavailable' using errcode='42501';end if;
 if jsonb_array_length(v->'lines') not between 1 and 30 or jsonb_array_length(p_input->'mappings')<>jsonb_array_length(v->'lines') then raise exception 'Map every source line' using errcode='22023';end if;
 for m in select value from jsonb_array_elements(p_input->'mappings') loop
  if not coalesce(public.offer_keys(m,array['lineId','catalogId']),false) or jsonb_typeof(m->'lineId') is distinct from 'string' or jsonb_typeof(m->'catalogId') is distinct from 'string' then raise exception 'Invalid mapping' using errcode='22023';end if;
  perform (m->>'lineId')::uuid,(m->>'catalogId')::uuid;
  if not exists(select 1 from jsonb_array_elements(v->'lines') s where s->>'id'=m->>'lineId') then raise exception 'Unknown source line' using errcode='22023';end if;
 end loop;
 if (select count(distinct value->>'lineId') from jsonb_array_elements(p_input->'mappings'))<>jsonb_array_length(v->'lines') then raise exception 'Repeated mapping' using errcode='22023';end if;
 -- Protect the selected catalog units/activity until the new template is committed.
 perform 1 from public.catalog_items where id in(select (value->>'catalogId')::uuid from jsonb_array_elements(p_input->'mappings')) order by id for share;
 for l in select value from jsonb_array_elements(v->'lines') loop
  select value into m from jsonb_array_elements(p_input->'mappings') where value->>'lineId'=l->>'id';
  if not exists(select 1 from public.catalog_items c where c.id=(m->>'catalogId')::uuid and not c.archived and c.unit=l->>'unit') then raise exception 'Catalog mapping unavailable or different unit' using errcode='22023';end if;
  items:=items||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'catalogId',m->>'catalogId','quantityMills',(l->>'quantityMills')::integer,'quantitySource','fixed'));
 end loop;
 fields:=jsonb_build_object('name',p_input->>'name','description',p_input->>'description','workType',o.data->>'workType','archived',false,'lines',items);
 perform public.save_installation_template(target,null,fields);
 insert into public.offer_template_exports(template_id,offer_id,variant_id,created_by,request) values(target,p_offer,p_variant,auth.uid(),p_input);
 return public.installation_template_json(target);
end;$$;
revoke all on function public.offer_variant_template_context(uuid,uuid),public.create_template_from_offer_variant(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.offer_variant_template_context(uuid,uuid),public.create_template_from_offer_variant(uuid,uuid,jsonb) to authenticated;
