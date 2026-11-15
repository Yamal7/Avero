create table public.installation_templates(id uuid primary key,fields jsonb not null,version integer not null default 0,created_by uuid not null references auth.users,created_payload jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.installation_templates enable row level security;
revoke all on public.installation_templates from public,anon,authenticated;
create trigger installation_templates_audit after insert or update on public.installation_templates for each row execute function public.audit_crm_change();
create function public.installation_template_json(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$select jsonb_build_object('id',id,'version',version,'fields',fields,'createdAt',created_at,'updatedAt',updated_at) from public.installation_templates where id=p_id$$;
create function public.save_installation_template(p_id uuid,p_version integer,p_fields jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.installation_templates%rowtype;l jsonb;k text;begin
 perform public.service_write_lock();
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_version<0 or p_version>2147483646 or not coalesce(public.offer_keys(p_fields,array['name','description','workType','archived','lines']),false) then raise exception 'Invalid template' using errcode='22023';end if;
 foreach k in array array['name','description','workType'] loop
 if jsonb_typeof(p_fields->k) is distinct from 'string' or p_fields->>k<>trim(p_fields->>k) or p_fields->>k~'[[:cntrl:]]' then raise exception 'Invalid text' using errcode='22023';end if;end loop;
 if length(p_fields->>'name') not between 1 and 160 or length(p_fields->>'description')>1000 or p_fields->>'workType' not in('split','multi_split','heat_pump','underfloor','plumbing','other') or jsonb_typeof(p_fields->'archived') is distinct from 'boolean' or jsonb_typeof(p_fields->'lines') is distinct from 'array' then raise exception 'Invalid template values' using errcode='22023';end if;
 if jsonb_array_length(p_fields->'lines') not between 1 and 30 then raise exception 'Invalid lines' using errcode='22023';end if;
 for l in select * from jsonb_array_elements(p_fields->'lines') loop
 if not coalesce(public.offer_keys(l,array['id','catalogId','quantityMills']),false) or jsonb_typeof(l->'id') is distinct from 'string' or jsonb_typeof(l->'catalogId') is distinct from 'string' or jsonb_typeof(l->'quantityMills') is distinct from 'number' or (l->>'quantityMills')!~'^[0-9]{1,8}$' then raise exception 'Invalid line' using errcode='22023';end if;
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
create function public.list_installation_templates(p_search text default '',p_state text default 'active',p_work_type text default 'all',p_page integer default 1) returns jsonb language plpgsql stable security definer set search_path='' as $$begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_search is null or length(p_search)>200 or p_state is null or p_state not in('active','archived','all') or p_work_type is null or p_work_type not in('all','split','multi_split','heat_pump','underfloor','plumbing','other') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid filter' using errcode='22023';end if;
 return(with matches as(select * from public.installation_templates where (p_state='all' or (fields->>'archived')::boolean=(p_state='archived')) and (p_work_type='all' or fields->>'workType'=p_work_type) and (trim(p_search)='' or strpos(lower(concat_ws(' ',fields->>'name',fields->>'description')),lower(trim(p_search)))>0)),paged as(select * from matches order by lower(fields->>'name'),id limit 25 offset(p_page-1)*25) select jsonb_build_object('total',(select count(*) from matches),'items',coalesce((select jsonb_agg(public.installation_template_json(id) order by lower(fields->>'name'),id) from paged),'[]')));
end;$$;
create function public.installation_template_detail(p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$declare t jsonb;lines jsonb;missing jsonb;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 t:=public.installation_template_json(p_id);if t is null then raise exception 'Template unavailable' using errcode='42501';end if;
 with resolved as(select l.value as line,l.ordinality as pos,c.* from jsonb_array_elements(t->'fields'->'lines') with ordinality l left join public.catalog_items c on c.id=(l.value->>'catalogId')::uuid)
 select coalesce(jsonb_agg(jsonb_build_object('id',line->>'id','catalogId',id,'code',code,'name',name,'description',left(regexp_replace(description,'\s+',' ','g'),500),'category',category,'unit',unit,'quantityMills',(line->>'quantityMills')::integer,'costCents',cost_cents,'saleCents',sale_cents,'vatBasisPoints',vat_basis_points,'discountBasisPoints',0) order by pos) filter(where id is not null and not archived),'[]'),coalesce(jsonb_agg(line->>'id' order by pos) filter(where id is null or archived),'[]') into lines,missing from resolved;
 return jsonb_build_object('template',t,'lines',lines,'unavailable',missing);
end;$$;
revoke all on function public.installation_template_json(uuid),public.save_installation_template(uuid,integer,jsonb),public.list_installation_templates(text,text,text,integer),public.installation_template_detail(uuid) from public,anon,authenticated;
grant execute on function public.save_installation_template(uuid,integer,jsonb),public.list_installation_templates(text,text,text,integer),public.installation_template_detail(uuid) to authenticated;
