-- Prices are integer grosze; VAT is integer hundredths of one percent.
create table public.catalog_items (
 id uuid primary key,
 code text not null check(length(code) between 1 and 64 and code=upper(trim(code))),
 name text not null check(length(trim(name)) between 1 and 160),
 category text not null check(category in ('device','material','service','travel')),
 unit text not null check(unit in ('piece','set','meter','square_meter','hour','kilometer','visit')),
 cost_cents integer not null check(cost_cents between 0 and 999999999),
 sale_cents integer not null check(sale_cents between 0 and 999999999),
 vat_basis_points integer not null check(vat_basis_points between 0 and 10000),
 manufacturer text not null default '' check(length(manufacturer)<=100),
 model text not null default '' check(length(model)<=100),
 supplier text not null default '' check(length(supplier)<=160),
 description text not null default '' check(length(description)<=2000),
 archived boolean not null default false,
 version integer not null default 0 check(version>=0),
 created_by uuid not null references auth.users(id),
 created_payload jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index catalog_code_unique on public.catalog_items(lower(code));
create index catalog_category_state on public.catalog_items(archived,category,name,id);
alter table public.catalog_items enable row level security;
revoke all on public.catalog_items from anon,authenticated;
grant select on public.catalog_items to authenticated;
create policy catalog_read on public.catalog_items for select to authenticated using(public.can_manage_crm());
create trigger catalog_audit after insert or update on public.catalog_items for each row execute function public.audit_crm_change();

create function public.save_catalog_item(p_id uuid,p_item jsonb,p_version integer default null) returns uuid
language plpgsql security definer set search_path='' as $$
declare item jsonb; existing public.catalog_items%rowtype; present boolean;
begin
 if not public.can_manage_crm() then raise exception 'Catalog access denied' using errcode='42501'; end if;
 if p_id is null or p_item is null or jsonb_typeof(p_item)<>'object' or p_version<0 or p_version>2147483646 then raise exception 'Invalid catalog item' using errcode='22023'; end if;
 if (select count(*) from jsonb_object_keys(p_item))<>12 or exists(select 1 from jsonb_object_keys(p_item) k where k not in ('code','name','category','unit','costCents','saleCents','vatBasisPoints','manufacturer','model','supplier','description','archived')) then raise exception 'Invalid catalog fields' using errcode='22023'; end if;
 if exists(select 1 from unnest(array['code','name','category','unit','manufacturer','model','supplier','description']) k where jsonb_typeof(p_item->k) is distinct from 'string')
 or jsonb_typeof(p_item->'archived') is distinct from 'boolean'
 or exists(select 1 from unnest(array['costCents','saleCents','vatBasisPoints']) k where jsonb_typeof(p_item->k) is distinct from 'number' or (p_item->>k)!~'^[0-9]{1,9}$') then raise exception 'Invalid catalog types' using errcode='22023'; end if;
 item:=p_item||jsonb_build_object('code',upper(trim(p_item->>'code')),'name',trim(p_item->>'name'),'manufacturer',trim(p_item->>'manufacturer'),'model',trim(p_item->>'model'),'supplier',trim(p_item->>'supplier'),'description',trim(p_item->>'description'));
 if length(item->>'code') not between 1 and 64 or length(item->>'name') not between 1 and 160
 or item->>'category' not in ('device','material','service','travel') or item->>'unit' not in ('piece','set','meter','square_meter','hour','kilometer','visit')
 or (item->>'vatBasisPoints')::integer>10000 or length(item->>'manufacturer')>100 or length(item->>'model')>100 or length(item->>'supplier')>160 or length(item->>'description')>2000
 or concat_ws('',item->>'code',item->>'name',item->>'manufacturer',item->>'model',item->>'supplier')~'[[:cntrl:]]'
 or (item->>'description')~E'[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]' then raise exception 'Invalid catalog values' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended('catalog:'||p_id::text,0));
 select * into existing from public.catalog_items where id=p_id for update;present:=found;
 if present then
  if p_version is null then
   if existing.created_by=auth.uid() and existing.created_payload=item then return p_id;end if;
   raise exception 'Catalog request conflict' using errcode='40001';
  end if;
  if existing.version<>p_version then raise exception 'Catalog item changed' using errcode='40001'; end if;
  update public.catalog_items set code=item->>'code',name=item->>'name',category=item->>'category',unit=item->>'unit',cost_cents=(item->>'costCents')::integer,sale_cents=(item->>'saleCents')::integer,vat_basis_points=(item->>'vatBasisPoints')::integer,manufacturer=item->>'manufacturer',model=item->>'model',supplier=item->>'supplier',description=item->>'description',archived=(item->>'archived')::boolean,version=version+1,updated_at=now() where id=p_id;
 else
  if p_version is not null then raise exception 'Catalog item unavailable' using errcode='42501';end if;
  if (item->>'archived')::boolean then raise exception 'New item must be active' using errcode='22023';end if;
  insert into public.catalog_items(id,code,name,category,unit,cost_cents,sale_cents,vat_basis_points,manufacturer,model,supplier,description,archived,created_by,created_payload)
  values(p_id,item->>'code',item->>'name',item->>'category',item->>'unit',(item->>'costCents')::integer,(item->>'saleCents')::integer,(item->>'vatBasisPoints')::integer,item->>'manufacturer',item->>'model',item->>'supplier',item->>'description',false,auth.uid(),item);
 end if;
 return p_id;
end $$;
create function public.list_catalog_items(p_search text default '',p_category text default 'all',p_state text default 'active',p_page integer default 1) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if not public.can_manage_crm() then raise exception 'Catalog access denied' using errcode='42501';end if;
 if p_search is null or length(p_search)>200 or p_category is null or p_category not in ('all','device','material','service','travel') or p_state is null or p_state not in ('active','archived','all') or p_page is null or p_page not between 1 and 100000 then raise exception 'Invalid catalog filter' using errcode='22023';end if;
 with filtered as (select * from public.catalog_items where (p_category='all' or category=p_category) and (p_state='all' or archived=(p_state='archived')) and (trim(p_search)='' or strpos(lower(concat_ws(' ',code,name,manufacturer,model,supplier,description)),lower(trim(p_search)))>0))
 select jsonb_build_object('total',(select count(*) from filtered),'items',coalesce((select jsonb_agg(jsonb_build_object('id',id,'code',code,'name',name,'category',category,'unit',unit,'costCents',cost_cents,'saleCents',sale_cents,'vatBasisPoints',vat_basis_points,'manufacturer',manufacturer,'model',model,'supplier',supplier,'description',description,'archived',archived,'version',version,'createdAt',created_at,'updatedAt',updated_at) order by lower(name),id) from (select * from filtered order by lower(name),id limit 25 offset(p_page-1)*25) rows),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.save_catalog_item(uuid,jsonb,integer) from public,anon;
grant execute on function public.save_catalog_item(uuid,jsonb,integer) to authenticated;
revoke all on function public.list_catalog_items(text,text,text,integer) from public,anon;
grant execute on function public.list_catalog_items(text,text,text,integer) to authenticated;
