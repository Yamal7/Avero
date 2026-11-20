-- A duplicate retains rules and quantities, but receives independent identities.
create table public.installation_template_copies(target_id uuid primary key references public.installation_templates(id),source_id uuid not null references public.installation_templates(id),created_by uuid not null references auth.users(id),request jsonb not null);
alter table public.installation_template_copies enable row level security;
revoke all on public.installation_template_copies from public,anon,authenticated;
create function public.duplicate_installation_template(p_source uuid,p_input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid;previous public.installation_template_copies%rowtype;source public.installation_templates%rowtype;items jsonb;fields jsonb;begin
 perform public.service_write_lock();
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_source is null or not coalesce(public.offer_keys(p_input,array['id','sourceVersion','name']),false) then raise exception 'Invalid copy' using errcode='22023';end if;
 if jsonb_typeof(p_input->'id') is distinct from 'string' or jsonb_typeof(p_input->'sourceVersion') is distinct from 'number' or p_input->>'sourceVersion'!~'^[0-9]{1,10}$' or (p_input->>'sourceVersion')::numeric>2147483646 or jsonb_typeof(p_input->'name') is distinct from 'string' then raise exception 'Invalid copy types' using errcode='22023';end if;
 target:=(p_input->>'id')::uuid;
 if target=p_source then raise exception 'Copy identity must be new' using errcode='22023';end if;
 select * into previous from public.installation_template_copies where target_id=target;
 if found then
  if previous.created_by=auth.uid() and previous.source_id=p_source and previous.request=p_input then return public.installation_template_json(target);end if;
  raise exception 'Copy request conflict' using errcode='40001';
 end if;
 if exists(select 1 from public.installation_templates where id=target) then raise exception 'Copy identity used' using errcode='40001';end if;
 select * into source from public.installation_templates where id=p_source for share;
 if not found then raise exception 'Source unavailable' using errcode='42501';end if;
 if source.version<>(p_input->>'sourceVersion')::integer then raise exception 'Stale source' using errcode='40001';end if;
 perform 1 from public.catalog_items where id in(select (value->>'catalogId')::uuid from jsonb_array_elements(source.fields->'lines')) order by id for share;
 if exists(select 1 from jsonb_array_elements(source.fields->'lines') l left join public.catalog_items c on c.id=(l->>'catalogId')::uuid where c.id is null or c.archived) then raise exception 'Catalog unavailable' using errcode='22023';end if;
 select jsonb_agg(l.value||jsonb_build_object('id',gen_random_uuid()) order by l.ordinality) into items from jsonb_array_elements(source.fields->'lines') with ordinality l;
 fields:=source.fields||jsonb_build_object('name',p_input->>'name','archived',false,'lines',items);
 perform public.save_installation_template(target,null,fields);
 insert into public.installation_template_copies(target_id,source_id,created_by,request) values(target,p_source,auth.uid(),p_input);
 return public.installation_template_json(target);
end;$$;
revoke all on function public.duplicate_installation_template(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.duplicate_installation_template(uuid,jsonb) to authenticated;
