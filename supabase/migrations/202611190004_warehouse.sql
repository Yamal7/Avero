-- Magazyn (design: Magazyn, wydanie RW, w samochodach): stock locations (main warehouse and technician vans), stock items,
-- reservations for service tickets, and posted documents PZ (receipt), RW (issue to a ticket) and MM (transfer).
-- Stock levels are the sum of posted movements per item and location and may never go below zero.
create table public.stock_locations(
  id uuid primary key,
  kind text not null check(kind in('warehouse','vehicle')),
  name text not null check(length(name) between 1 and 80),
  technician_id uuid references auth.users,
  plate text not null default '' check(length(plate)<=20),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check(kind='warehouse' or technician_id is not null)
);
create unique index stock_locations_vehicle on public.stock_locations(technician_id) where kind='vehicle' and active;

create table public.stock_items(
  id uuid primary key,
  code text not null unique check(length(code) between 1 and 32 and code=upper(trim(code))),
  name text not null check(length(name) between 1 and 160),
  category text not null check(category in('refrigerant','parts','materials','other')),
  unit text not null check(unit in('kg','szt.','m','l','kpl')),
  min_quantity numeric(12,3) not null default 0 check(min_quantity>=0),
  bin text not null default '' check(length(bin)<=20),
  refrigerant_class text not null default '' check(length(refrigerant_class)<=20),
  gwp integer check(gwp between 0 and 30000),
  container text not null default '' check(length(container)<=40),
  catalog_id uuid references public.catalog_items on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.stock_reservations(
  id uuid primary key,
  item_id uuid not null references public.stock_items,
  ticket_id uuid not null references public.service_tickets on delete cascade,
  quantity numeric(12,3) not null check(quantity>0),
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index stock_reservations_open on public.stock_reservations(item_id) where closed_at is null;

create table public.stock_doc_counters(kind text not null,period text not null,last integer not null,primary key(kind,period));

create table public.stock_documents(
  id uuid primary key,
  number text not null unique,
  kind text not null check(kind in('PZ','RW','MM')),
  from_location uuid references public.stock_locations,
  to_location uuid references public.stock_locations,
  ticket_id uuid references public.service_tickets,
  supplier text not null default '' check(length(supplier)<=120),
  note text not null default '' check(length(note)<=500),
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  check(kind<>'PZ' or (to_location is not null and from_location is null)),
  check(kind<>'RW' or (from_location is not null and to_location is null)),
  check(kind<>'MM' or (from_location is not null and to_location is not null and from_location<>to_location))
);

create table public.stock_moves(
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.stock_documents on delete cascade,
  item_id uuid not null references public.stock_items,
  location_id uuid not null references public.stock_locations,
  delta numeric(12,3) not null check(delta<>0),
  mass_before numeric(12,3),
  mass_after numeric(12,3),
  operation text not null default '' check(operation in('','fill','topup','other')),
  device_id uuid references public.devices,
  created_at timestamptz not null default now()
);
create index stock_moves_item on public.stock_moves(item_id,created_at desc);
create index stock_moves_level on public.stock_moves(item_id,location_id);

alter table public.stock_locations enable row level security;
alter table public.stock_items enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.stock_doc_counters enable row level security;
alter table public.stock_documents enable row level security;
alter table public.stock_moves enable row level security;
revoke all on public.stock_locations,public.stock_items,public.stock_reservations,public.stock_doc_counters,public.stock_documents,public.stock_moves from public,anon,authenticated;

insert into public.stock_locations(id,kind,name) values('5e000000-0000-4000-8000-000000000001','warehouse','Magazyn główny');

create function public.stock_is_staff() returns boolean language sql stable security definer set search_path='' as $$
 select public.account_enabled(auth.uid()) and exists(select 1 from public.staff_users where user_id=auth.uid() and role in('admin','office','technician'))
$$;
create function public.stock_level(p_item uuid,p_location uuid) returns numeric language sql stable security definer set search_path='' as $$
 select coalesce(sum(delta),0) from public.stock_moves where item_id=p_item and location_id=p_location
$$;

-- Whole warehouse view: items with level per location, open reservations and last movement.
create function public.stock_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 return jsonb_build_object(
  'canManage',public.can_manage_crm(),
  'viewerId',auth.uid(),
  'locations',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'kind',l.kind,'name',l.name,'technicianId',l.technician_id,'technicianLabel',case when l.technician_id is null then null else public.crm_staff_label(l.technician_id) end,'plate',l.plate) order by l.kind desc,l.name) from public.stock_locations l where l.active),'[]'),
  'items',coalesce((select jsonb_agg(jsonb_build_object(
    'id',i.id,'code',i.code,'name',i.name,'category',i.category,'unit',i.unit,'minQuantity',i.min_quantity,'bin',i.bin,'refrigerantClass',i.refrigerant_class,'gwp',i.gwp,'container',i.container,
    'levels',coalesce((select jsonb_object_agg(x.location_id,x.q) from(select location_id,sum(delta) q from public.stock_moves where item_id=i.id group by location_id having sum(delta)<>0) x),'{}'),
    'reserved',coalesce((select sum(quantity) from public.stock_reservations r where r.item_id=i.id and r.closed_at is null),0),
    'reservations',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'ticketId',r.ticket_id,'ticketNumber',t.ticket_number,'quantity',r.quantity) order by r.created_at) from public.stock_reservations r join public.service_tickets t on t.id=r.ticket_id where r.item_id=i.id and r.closed_at is null),'[]'),
    'lastMove',(select jsonb_build_object('at',m.created_at,'delta',m.delta) from public.stock_moves m where m.item_id=i.id order by m.created_at desc,m.id limit 1)
   ) order by i.category,i.code) from public.stock_items i where i.active),'[]'));
end;$$;

create function public.stock_item_moves(p_item uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 return coalesce((select jsonb_agg(x.j order by x.created_at desc) from(
  select m.created_at,jsonb_build_object('id',m.id,'documentId',d.id,'number',d.number,'kind',d.kind,'delta',m.delta,'locationId',m.location_id,'ticketId',d.ticket_id,'ticketNumber',t.ticket_number,'supplier',d.supplier,'authorId',d.created_by,'authorLabel',public.crm_staff_label(d.created_by),'at',m.created_at) j
  from public.stock_moves m join public.stock_documents d on d.id=m.document_id left join public.service_tickets t on t.id=d.ticket_id
  where m.item_id=p_item order by m.created_at desc limit 30) x),'[]');
end;$$;

create function public.save_stock_item(p_id uuid,p_code text,p_name text,p_category text,p_unit text,p_min numeric,p_bin text,p_class text,p_gwp integer,p_container text) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_code is null or p_code!~'^[A-Z0-9][A-Z0-9-]{0,31}$' or p_name is null or length(trim(p_name)) not between 1 and 160 or p_category not in('refrigerant','parts','materials','other') or p_unit not in('kg','szt.','m','l','kpl') or p_min is null or p_min<0 or length(coalesce(p_bin,''))>20 or length(coalesce(p_class,''))>20 or length(coalesce(p_container,''))>40 or (p_gwp is not null and p_gwp not between 0 and 30000) then raise exception 'Invalid stock item' using errcode='22023';end if;
 insert into public.stock_items(id,code,name,category,unit,min_quantity,bin,refrigerant_class,gwp,container) values(p_id,p_code,trim(p_name),p_category,p_unit,p_min,coalesce(p_bin,''),coalesce(p_class,''),p_gwp,coalesce(p_container,''))
 on conflict(id) do update set code=excluded.code,name=excluded.name,category=excluded.category,unit=excluded.unit,min_quantity=excluded.min_quantity,bin=excluded.bin,refrigerant_class=excluded.refrigerant_class,gwp=excluded.gwp,container=excluded.container;
 return p_id;
exception when unique_violation then raise exception 'Code already used' using errcode='23505';
end;$$;

create function public.save_stock_vehicle(p_id uuid,p_technician uuid,p_name text,p_plate text) returns uuid language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_technician is null or not exists(select 1 from public.staff_users where user_id=p_technician and role='technician') or p_name is null or length(trim(p_name)) not between 1 and 80 or length(coalesce(p_plate,''))>20 then raise exception 'Invalid vehicle' using errcode='22023';end if;
 insert into public.stock_locations(id,kind,name,technician_id,plate) values(p_id,'vehicle',trim(p_name),p_technician,coalesce(trim(p_plate),''))
 on conflict(id) do update set name=excluded.name,plate=excluded.plate,technician_id=excluded.technician_id;
 return p_id;
exception when unique_violation then raise exception 'Technician already has a vehicle' using errcode='23505';
end;$$;

create function public.reserve_stock(p_id uuid,p_item uuid,p_ticket uuid,p_quantity numeric) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_id is null or p_quantity is null or p_quantity<=0 or p_quantity<>round(p_quantity,3) or not exists(select 1 from public.stock_items where id=p_item and active) or not exists(select 1 from public.service_tickets where id=p_ticket and status<>'closed') then raise exception 'Invalid reservation' using errcode='22023';end if;
 insert into public.stock_reservations(id,item_id,ticket_id,quantity,created_by) values(p_id,p_item,p_ticket,p_quantity,auth.uid()) on conflict(id) do nothing;
end;$$;

create function public.close_stock_reservation(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 update public.stock_reservations set closed_at=coalesce(closed_at,now()) where id=p_id;
end;$$;

-- Posts one document. p_lines: [{itemId, quantity, massBefore?, massAfter?, operation?, deviceId?}]
-- PZ and MM: office. RW: office, or a technician issuing from their own van to a ticket they can edit.
create function public.post_stock_document(p_id uuid,p_kind text,p_from uuid,p_to uuid,p_ticket uuid,p_supplier text,p_note text,p_lines jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare period text:=to_char(now() at time zone 'Europe/Warsaw','YYYY/MM');n integer;num text;l jsonb;item public.stock_items;q numeric;before numeric;after numeric;dev uuid;op text;have numeric;mgr boolean:=public.can_manage_crm();begin
 if not public.stock_is_staff() then raise exception 'Staff required' using errcode='42501';end if;
 if exists(select 1 from public.stock_documents where id=p_id) then return jsonb_build_object('id',p_id,'number',(select number from public.stock_documents where id=p_id));end if;
 if p_id is null or p_kind not in('PZ','RW','MM') or jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines) not between 1 and 40 or length(coalesce(p_note,''))>500 or length(coalesce(p_supplier,''))>120 then raise exception 'Invalid document' using errcode='22023';end if;
 if p_kind in('PZ','MM') and not mgr then raise exception 'Office required' using errcode='42501';end if;
 if p_kind='PZ' and (p_from is not null or p_to is null) or p_kind='RW' and (p_from is null or p_to is not null or p_ticket is null) or p_kind='MM' and (p_from is null or p_to is null or p_from=p_to) then raise exception 'Invalid locations' using errcode='22023';end if;
 if p_from is not null and not exists(select 1 from public.stock_locations where id=p_from and active) or p_to is not null and not exists(select 1 from public.stock_locations where id=p_to and active) then raise exception 'Location unavailable' using errcode='22023';end if;
 if p_kind='RW' then
  if not public.can_edit_service_ticket(p_ticket) then raise exception 'Ticket unavailable' using errcode='42501';end if;
  if exists(select 1 from public.service_tickets where id=p_ticket and status='closed') then raise exception 'Ticket closed' using errcode='40001';end if;
  if not mgr and not exists(select 1 from public.stock_locations where id=p_from and kind='vehicle' and technician_id=auth.uid()) then raise exception 'Own vehicle only' using errcode='42501';end if;
 end if;
 perform pg_advisory_xact_lock(hashtext('stock'));
 insert into public.stock_doc_counters(kind,period,last) values(p_kind,period,1) on conflict(kind,period) do update set last=public.stock_doc_counters.last+1 returning last into n;
 num:=p_kind||'/'||period||'/'||lpad(n::text,3,'0');
 insert into public.stock_documents(id,number,kind,from_location,to_location,ticket_id,supplier,note,created_by) values(p_id,num,p_kind,p_from,p_to,p_ticket,coalesce(trim(p_supplier),''),coalesce(trim(p_note),''),auth.uid());
 for l in select * from jsonb_array_elements(p_lines) loop
  select * into item from public.stock_items where id=(l->>'itemId')::uuid and active;
  if item.id is null then raise exception 'Item unavailable' using errcode='22023';end if;
  before:=(l->>'massBefore')::numeric;after:=(l->>'massAfter')::numeric;op:=coalesce(l->>'operation','');dev:=(l->>'deviceId')::uuid;
  q:=case when before is not null and after is not null then before-after else (l->>'quantity')::numeric end;
  if q is null or q<=0 or q<>round(q,3) or q>100000 or op not in('','fill','topup','other') or (before is null)<>(after is null) then raise exception 'Invalid quantity' using errcode='22023';end if;
  if p_from is not null then
   have:=public.stock_level(item.id,p_from);
   if have<q then raise exception 'Not enough stock' using errcode='23514';end if;
   insert into public.stock_moves(document_id,item_id,location_id,delta,mass_before,mass_after,operation,device_id) values(p_id,item.id,p_from,-q,before,after,op,dev);
  end if;
  if p_to is not null then insert into public.stock_moves(document_id,item_id,location_id,delta) values(p_id,item.id,p_to,q);end if;
  if p_kind='RW' then
   update public.stock_reservations set closed_at=now() where item_id=item.id and ticket_id=p_ticket and closed_at is null;
   insert into public.service_materials(id,ticket_id,name,quantity,unit,document,source,net_cents,created_by)
   values(gen_random_uuid(),p_ticket,item.name,q,item.unit,num,(select name from public.stock_locations where id=p_from),0,auth.uid());
  end if;
 end loop;
 return jsonb_build_object('id',p_id,'number',num);
end;$$;

do $$declare f record;begin for f in select oid from pg_proc where pronamespace='public'::regnamespace and proname in('stock_is_staff','stock_level','stock_overview','stock_item_moves','save_stock_item','save_stock_vehicle','reserve_stock','close_stock_reservation','post_stock_document') loop execute format('revoke all on function %s from public,anon,authenticated',f.oid::regprocedure);end loop;end;$$;
grant execute on function public.stock_overview(),public.stock_item_moves(uuid),public.save_stock_item(uuid,text,text,text,text,numeric,text,text,integer,text),public.save_stock_vehicle(uuid,uuid,text,text),public.reserve_stock(uuid,uuid,uuid,numeric),public.close_stock_reservation(uuid),public.post_stock_document(uuid,text,uuid,uuid,uuid,text,text,jsonb) to authenticated;
