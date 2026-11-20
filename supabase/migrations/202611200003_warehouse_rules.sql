-- Magazyn rules from the design conversation:
-- WZ (external issue, e.g. a sale) next to PZ/RW/MM; cylinder number on refrigerant lines; a minimum per van and one
-- action that refills every van short of it with MM; RW drafts; reservations for a task as well as a ticket;
-- the unit of an item is locked once it has a movement.
alter table public.stock_documents drop constraint stock_documents_kind_check,
  add constraint stock_documents_kind_check check(kind in('PZ','RW','MM','WZ')),
  add constraint stock_documents_wz_check check(kind<>'WZ' or (from_location is not null and to_location is null)),
  add column customer_id uuid references public.customers on delete set null;
alter table public.stock_moves add column cylinder text not null default '' check(length(cylinder)<=40);

alter table public.stock_reservations alter column ticket_id drop not null,
  add column task_id uuid references public.crm_tasks on delete cascade,
  add constraint stock_reservations_target check(num_nonnulls(ticket_id,task_id)=1);

create table public.stock_vehicle_minimums(
  location_id uuid not null references public.stock_locations on delete cascade,
  item_id uuid not null references public.stock_items on delete cascade,
  min_quantity numeric(12,3) not null check(min_quantity>0),
  primary key(location_id,item_id)
);
create table public.stock_drafts(
  id uuid primary key,
  kind text not null check(kind in('RW','WZ','MM','PZ')),
  payload jsonb not null check(jsonb_typeof(payload)='object' and length(payload::text)<=20000),
  created_by uuid not null references auth.users on delete cascade,
  updated_at timestamptz not null default now()
);
alter table public.stock_vehicle_minimums enable row level security;
alter table public.stock_drafts enable row level security;
revoke all on public.stock_vehicle_minimums,public.stock_drafts from public,anon,authenticated;

create or replace function public.stock_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 return jsonb_build_object(
  'canManage',public.can_manage_crm(),
  'viewerId',auth.uid(),
  'locations',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'kind',l.kind,'name',l.name,'technicianId',l.technician_id,'technicianLabel',case when l.technician_id is null then null else public.crm_staff_label(l.technician_id) end,'plate',l.plate) order by l.kind desc,l.name) from public.stock_locations l where l.active),'[]'),
  'drafts',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'kind',d.kind,'payload',d.payload,'updatedAt',d.updated_at) order by d.updated_at desc) from public.stock_drafts d where d.created_by=auth.uid()),'[]'),
  'items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',i.id,'code',i.code,'name',i.name,'category',i.category,'unit',i.unit,'minQuantity',i.min_quantity,'bin',i.bin,'refrigerantClass',i.refrigerant_class,'gwp',i.gwp,'container',i.container,
    'unitLocked',exists(select 1 from public.stock_moves m where m.item_id=i.id),
    'levels',coalesce((select jsonb_object_agg(x.location_id,x.q) from(select location_id,sum(delta) q from public.stock_moves where item_id=i.id group by location_id having sum(delta)<>0) x),'{}'),
    'vehicleMins',coalesce((select jsonb_object_agg(v.location_id,v.min_quantity) from public.stock_vehicle_minimums v where v.item_id=i.id),'{}'),
    'reserved',coalesce((select sum(quantity) from public.stock_reservations r where r.item_id=i.id and r.closed_at is null),0),
    'reservations',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'ticketId',r.ticket_id,'ticketNumber',t.ticket_number,'taskId',r.task_id,'taskNumber',k.number,'taskCustomerId',k.customer_id,'quantity',r.quantity) order by r.created_at) from public.stock_reservations r left join public.service_tickets t on t.id=r.ticket_id left join public.crm_tasks k on k.id=r.task_id where r.item_id=i.id and r.closed_at is null),'[]'),
    'lastMove',(select jsonb_build_object('at',m.created_at,'delta',m.delta) from public.stock_moves m where m.item_id=i.id order by m.created_at desc,m.id limit 1)
   ) order by i.category,i.code) from public.stock_items i where i.active),'[]'));
end;$$;

create or replace function public.stock_item_moves(p_item uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(x.j order by x.created_at desc) from(
  select m.created_at,jsonb_build_object('id',m.id,'documentId',d.id,'number',d.number,'kind',d.kind,'delta',m.delta,'locationId',m.location_id,'ticketId',d.ticket_id,'ticketNumber',t.ticket_number,'supplier',d.supplier,'cylinder',m.cylinder,'authorId',d.created_by,'authorLabel',public.crm_staff_label(d.created_by),'at',m.created_at) j
  from public.stock_moves m join public.stock_documents d on d.id=m.document_id left join public.service_tickets t on t.id=d.ticket_id
  where m.item_id=p_item order by m.created_at desc limit 30) x),'[]');
end;$$;

-- The unit cannot change once the item has a movement: levels in the old unit would become wrong.
create or replace function public.save_stock_item(p_id uuid,p_code text,p_name text,p_category text,p_unit text,p_min numeric,p_bin text,p_class text,p_gwp integer,p_container text) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_code is null or p_code!~'^[A-Z0-9][A-Z0-9-]{0,31}$' or p_name is null or length(trim(p_name)) not between 1 and 160 or p_category not in('refrigerant','parts','materials','other') or p_unit not in('kg','szt.','m','l','kpl') or p_min is null or p_min<0 or length(coalesce(p_bin,''))>20 or length(coalesce(p_class,''))>20 or length(coalesce(p_container,''))>40 or (p_gwp is not null and p_gwp not between 0 and 30000) then raise exception 'Invalid stock item' using errcode='22023';end if;
 if exists(select 1 from public.stock_items where id=p_id and unit<>p_unit) and exists(select 1 from public.stock_moves where item_id=p_id) then raise exception 'Unit locked after first movement' using errcode='22023';end if;
 insert into public.stock_items(id,code,name,category,unit,min_quantity,bin,refrigerant_class,gwp,container) values(p_id,p_code,trim(p_name),p_category,p_unit,p_min,coalesce(p_bin,''),coalesce(p_class,''),p_gwp,coalesce(p_container,''))
 on conflict(id) do update set code=excluded.code,name=excluded.name,category=excluded.category,unit=excluded.unit,min_quantity=excluded.min_quantity,bin=excluded.bin,refrigerant_class=excluded.refrigerant_class,gwp=excluded.gwp,container=excluded.container;
 return p_id;
exception when unique_violation then raise exception 'Code already used' using errcode='23505';
end;$$;

create function public.set_stock_vehicle_min(p_location uuid,p_item uuid,p_min numeric) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_min is null or p_min<0 or p_min<>round(p_min,3) or not exists(select 1 from public.stock_locations where id=p_location and kind='vehicle' and active) or not exists(select 1 from public.stock_items where id=p_item and active) then raise exception 'Invalid vehicle minimum' using errcode='22023';end if;
 if p_min=0 then delete from public.stock_vehicle_minimums where location_id=p_location and item_id=p_item;
 else insert into public.stock_vehicle_minimums(location_id,item_id,min_quantity) values(p_location,p_item,p_min) on conflict(location_id,item_id) do update set min_quantity=excluded.min_quantity;end if;
end;$$;

create function public.reserve_stock_for_task(p_id uuid,p_item uuid,p_task uuid,p_quantity numeric) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_quantity is null or p_quantity<=0 or p_quantity<>round(p_quantity,3) or not exists(select 1 from public.stock_items where id=p_item and active) or not exists(select 1 from public.crm_tasks where id=p_task and fields->>'state' in('backlog','todo','in_progress','review')) then raise exception 'Invalid reservation' using errcode='22023';end if;
 insert into public.stock_reservations(id,item_id,task_id,quantity,created_by) values(p_id,p_item,p_task,p_quantity,auth.uid()) on conflict(id) do nothing;
end;$$;

create function public.save_stock_draft(p_id uuid,p_kind text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.stock_drafts;begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 if p_id is null or p_kind not in('RW','WZ','MM','PZ') or jsonb_typeof(p_payload) is distinct from 'object' or length(p_payload::text)>20000 then raise exception 'Invalid draft' using errcode='22023';end if;
 if exists(select 1 from public.stock_documents where id=p_id) then raise exception 'Document already posted' using errcode='40001';end if;
 insert into public.stock_drafts(id,kind,payload,created_by) values(p_id,p_kind,p_payload,auth.uid())
 on conflict(id) do update set kind=excluded.kind,payload=excluded.payload,updated_at=now() where public.stock_drafts.created_by=auth.uid()
 returning * into d;
 if d.id is null then raise exception 'Draft unavailable' using errcode='42501';end if;
 return jsonb_build_object('id',d.id,'kind',d.kind,'payload',d.payload,'updatedAt',d.updated_at);
end;$$;
create function public.delete_stock_draft(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 delete from public.stock_drafts where id=p_id and created_by=auth.uid();
end;$$;

-- Posts one document. p_lines: [{itemId, quantity, massBefore?, massAfter?, operation?, deviceId?, cylinder?}]
-- PZ, MM and WZ: office. RW: office, or a technician issuing from their own van to a ticket they can edit.
-- WZ: external issue to a recipient (p_supplier holds the recipient name, p_customer optionally the customer).
drop function public.post_stock_document(uuid,text,uuid,uuid,uuid,text,text,jsonb);
create function public.post_stock_document(p_id uuid,p_kind text,p_from uuid,p_to uuid,p_ticket uuid,p_supplier text,p_note text,p_lines jsonb,p_customer uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_period text:=to_char(now() at time zone 'Europe/Warsaw','YYYY/MM');n integer;num text;l jsonb;item public.stock_items;q numeric;before numeric;after numeric;dev uuid;op text;cyl text;have numeric;mgr boolean:=public.can_manage_crm();begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 if exists(select 1 from public.stock_documents where id=p_id) then return jsonb_build_object('id',p_id,'number',(select number from public.stock_documents where id=p_id));end if;
 if p_id is null or p_kind not in('PZ','RW','MM','WZ') or jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines) not between 1 and 40 or length(coalesce(p_note,''))>500 or length(coalesce(p_supplier,''))>120 then raise exception 'Invalid document' using errcode='22023';end if;
 if p_kind in('PZ','MM','WZ') and not mgr then raise exception 'Office required' using errcode='42501';end if;
 if p_kind='PZ' and (p_from is not null or p_to is null) or p_kind in('RW','WZ') and (p_from is null or p_to is not null) or p_kind='RW' and p_ticket is null or p_kind='MM' and (p_from is null or p_to is null or p_from=p_to) then raise exception 'Invalid locations' using errcode='22023';end if;
 if p_kind='WZ' and length(trim(coalesce(p_supplier,'')))=0 then raise exception 'Recipient required' using errcode='22023';end if;
 if p_customer is not null and (p_kind<>'WZ' or not exists(select 1 from public.customers where id=p_customer)) then raise exception 'Invalid customer' using errcode='22023';end if;
 if p_from is not null and not exists(select 1 from public.stock_locations where id=p_from and active) or p_to is not null and not exists(select 1 from public.stock_locations where id=p_to and active) then raise exception 'Location unavailable' using errcode='22023';end if;
 if p_kind='RW' then
  if not public.can_edit_service_ticket(p_ticket) then raise exception 'Ticket unavailable' using errcode='42501';end if;
  if exists(select 1 from public.service_tickets where id=p_ticket and status='closed') then raise exception 'Ticket closed' using errcode='40001';end if;
  if not mgr and not exists(select 1 from public.stock_locations where id=p_from and kind='vehicle' and technician_id=auth.uid()) then raise exception 'Own vehicle only' using errcode='42501';end if;
 end if;
 perform pg_advisory_xact_lock(hashtext('stock'));
 insert into public.stock_doc_counters(kind,period,last) values(p_kind,v_period,1) on conflict(kind,period) do update set last=public.stock_doc_counters.last+1 returning last into n;
 num:=p_kind||'/'||v_period||'/'||lpad(n::text,3,'0');
 insert into public.stock_documents(id,number,kind,from_location,to_location,ticket_id,supplier,note,created_by,customer_id) values(p_id,num,p_kind,p_from,p_to,p_ticket,coalesce(trim(p_supplier),''),coalesce(trim(p_note),''),auth.uid(),p_customer);
 for l in select * from jsonb_array_elements(p_lines) loop
  select * into item from public.stock_items where id=(l->>'itemId')::uuid and active;
  if item.id is null then raise exception 'Item unavailable' using errcode='22023';end if;
  before:=(l->>'massBefore')::numeric;after:=(l->>'massAfter')::numeric;op:=coalesce(l->>'operation','');dev:=(l->>'deviceId')::uuid;cyl:=trim(coalesce(l->>'cylinder',''));
  q:=case when before is not null and after is not null then before-after else (l->>'quantity')::numeric end;
  if q is null or q<=0 or q<>round(q,3) or q>100000 or op not in('','fill','topup','other') or (before is null)<>(after is null) or length(cyl)>40 then raise exception 'Invalid quantity' using errcode='22023';end if;
  if p_from is not null then
   have:=public.stock_level(item.id,p_from);
   if have<q then raise exception 'Not enough stock' using errcode='23514';end if;
   insert into public.stock_moves(document_id,item_id,location_id,delta,mass_before,mass_after,operation,device_id,cylinder) values(p_id,item.id,p_from,-q,before,after,op,dev,cyl);
  end if;
  if p_to is not null then insert into public.stock_moves(document_id,item_id,location_id,delta,cylinder) values(p_id,item.id,p_to,q,cyl);end if;
  if p_kind='RW' then
   update public.stock_reservations set closed_at=now() where item_id=item.id and ticket_id=p_ticket and closed_at is null;
   insert into public.service_materials(id,ticket_id,name,quantity,unit,document,source,net_cents,created_by)
   values(gen_random_uuid(),p_ticket,item.name||case when cyl<>'' then ' (butla '||cyl||')' else '' end,q,item.unit,num,(select name from public.stock_locations where id=p_from),0,auth.uid());
  end if;
 end loop;
 delete from public.stock_drafts where id=p_id;
 return jsonb_build_object('id',p_id,'number',num);
end;$$;

-- „Uzupełnij braki”: one MM per van that is below its minimum, from the main warehouse, as much as the warehouse has.
-- p_request makes a retry return the same documents.
create function public.refill_vehicles(p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare main uuid:='5e000000-0000-4000-8000-000000000001';v record;lines jsonb;doc uuid;res jsonb:='[]';free numeric;need numeric;m record;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_request is null then raise exception 'Invalid request' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtext('stock-refill'));
 for v in select l.id,l.name from public.stock_locations l where l.kind='vehicle' and l.active order by l.name loop
  doc:=md5(p_request::text||v.id::text)::uuid;
  if exists(select 1 from public.stock_documents where id=doc) then res:=res||jsonb_build_object('locationId',v.id,'number',(select number from public.stock_documents where id=doc));continue;end if;
  lines:='[]';
  for m in select vm.item_id,vm.min_quantity-public.stock_level(vm.item_id,v.id) short from public.stock_vehicle_minimums vm join public.stock_items i on i.id=vm.item_id and i.active where vm.location_id=v.id loop
   continue when m.short<=0;
   free:=public.stock_level(m.item_id,main);
   need:=least(m.short,free);
   if need>0 then lines:=lines||jsonb_build_object('itemId',m.item_id,'quantity',need);end if;
  end loop;
  if jsonb_array_length(lines)>0 then
   res:=res||jsonb_build_object('locationId',v.id,'number',public.post_stock_document(doc,'MM',main,v.id,null,'','Uzupełnienie do minimum busa',lines)->>'number');
  end if;
 end loop;
 return res;
end;$$;

do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('set_stock_vehicle_min','reserve_stock_for_task','save_stock_draft','delete_stock_draft','post_stock_document','refill_vehicles') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);execute format('grant execute on function %s to authenticated',f.oid::regprocedure);end loop;end;$$;
