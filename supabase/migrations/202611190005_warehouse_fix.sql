-- post_stock_document: rename a variable that clashed with stock_doc_counters.period.
create or replace function public.post_stock_document(p_id uuid,p_kind text,p_from uuid,p_to uuid,p_ticket uuid,p_supplier text,p_note text,p_lines jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_period text:=to_char(now() at time zone 'Europe/Warsaw','YYYY/MM');n integer;num text;l jsonb;item public.stock_items;q numeric;before numeric;after numeric;dev uuid;op text;have numeric;mgr boolean:=public.can_manage_crm();begin
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
 insert into public.stock_doc_counters(kind,period,last) values(p_kind,v_period,1) on conflict(kind,period) do update set last=public.stock_doc_counters.last+1 returning last into n;
 num:=p_kind||'/'||v_period||'/'||lpad(n::text,3,'0');
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
revoke all on function public.post_stock_document(uuid,text,uuid,uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.post_stock_document(uuid,text,uuid,uuid,uuid,text,text,jsonb) to authenticated;
