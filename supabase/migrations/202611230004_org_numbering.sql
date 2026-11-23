-- M0.1 Wielofirmowość (KRA-27), krok 4: numeracja dokumentów w obrębie firmy.
-- ZS (zgłoszenia), PS (protokoły serwisowe), OF (oferty), ZL (zlecenia), PM (protokoły montażu), ZD (zadania)
-- i PZ/MM/RW/WZ (magazyn) liczą się osobno w każdej firmie. Istniejące numery się nie zmieniają; liczniki
-- Kranz HVACR startują od dotychczasowego stanu (większe z: maksimum w tabeli, ostatnia wartość sekwencji).
-- Formatowanie i prefiksy bez zmian (konfiguracja prefiksów — M3.1).

-- Liczniki: dotychczasowe liczniki magazynu (PZ/MM/RW/WZ na miesiąc) przechodzą w ogólną tabelę liczników firmy.
-- Wiersze zostają (z org_id = Kranz HVACR z kroku 2); pozostałe rodzaje mają period = ''.
alter table public.stock_doc_counters rename to org_doc_counters;
alter table public.org_doc_counters drop constraint stock_doc_counters_pkey;
alter table public.org_doc_counters add constraint org_doc_counters_pkey primary key(org_id,kind,period);
alter table public.org_doc_counters alter column last type bigint;
alter index public.stock_doc_counters_org_id_idx rename to org_doc_counters_org_id_idx;
alter table public.org_doc_counters rename constraint stock_doc_counters_org_id_fkey to org_doc_counters_org_id_fkey;
comment on table public.org_doc_counters is 'Ostatni nadany numer dokumentu danego rodzaju w firmie (period: YYYY/MM dla magazynu, pusty dla pozostałych).';

-- Stan początkowy liczników Kranz HVACR — odczyt sekwencji przed ich usunięciem.
create function pg_temp.last_issued(p_table text, p_column text) returns bigint language plpgsql as $$
declare seq text:=pg_get_serial_sequence('public.'||p_table,p_column); v bigint; called boolean; m bigint;
begin
 execute format('select max(%I) from public.%I',p_column,p_table) into m;
 if seq is not null then execute format('select last_value, is_called from %s',seq) into v,called; end if;
 return greatest(coalesce(m,0), case when seq is null then 0 when called then v else v-1 end);
end $$;
insert into public.org_doc_counters(org_id,kind,period,last)
select '0a000000-0000-4000-8000-000000000001',k,'',pg_temp.last_issued(t,c)
from (values ('ticket','service_tickets','ticket_number'),('protocol','service_protocols','protocol_number'),
 ('offer','offers','offer_number'),('work_order','work_orders','order_number'),
 ('handover','installation_handovers','protocol_number'),('task','crm_tasks','number')) v(k,t,c);
-- Zadania numerowano od 100 (ZD-100); nowe firmy zaczynają tak samo, Kranz HVACR — od dotychczasowego stanu.
update public.org_doc_counters set last=greatest(last,99) where org_id='0a000000-0000-4000-8000-000000000001' and kind='task';

-- Kolejny numer w firmie; blokada wiersza licznika szereguje równoległe wstawienia w tej samej firmie.
-- Security invoker: z wyzwalacza działa jako postgres, z RPC jako avero_rpc (wtedy org_isolation pilnuje p_org).
create function public.next_org_number(p_org uuid, p_kind text, p_period text default '') returns bigint
language plpgsql security invoker set search_path='' as $$
declare n bigint;begin
 if p_org is null then raise exception 'Organization required' using errcode='23502';end if;
 insert into public.org_doc_counters(org_id,kind,period,last) values(p_org,p_kind,coalesce(p_period,''),case p_kind when 'task' then 100 else 1 end)
 on conflict(org_id,kind,period) do update set last=public.org_doc_counters.last+1 returning last into n;
 return n;
end;$$;
revoke all on function public.next_org_number(uuid,text,text) from public, anon, authenticated;
grant execute on function public.next_org_number(uuid,text,text) to avero_rpc;

-- Wyzwalacz nadający numer przy wstawieniu (argumenty: rodzaj licznika, kolumna). Jawnie podany numer (np. import
-- jako postgres) zostaje i tylko podnosi licznik, żeby kolejne numery się nie powtórzyły.
create function public.assign_org_number() returns trigger
language plpgsql security definer set search_path='' as $$
declare kind text:=tg_argv[0]; col text:=tg_argv[1]; given bigint:=(to_jsonb(new)->>col)::bigint;begin
 if new.org_id is null then raise exception 'Organization required' using errcode='23502';end if;
 if given is null then
  new:=jsonb_populate_record(new,jsonb_build_object(col,public.next_org_number(new.org_id,kind)));
 else
  insert into public.org_doc_counters(org_id,kind,period,last) values(new.org_id,kind,'',given)
  on conflict(org_id,kind,period) do update set last=greatest(public.org_doc_counters.last,excluded.last);
 end if;
 return new;
end;$$;
revoke all on function public.assign_org_number() from public, anon, authenticated;

-- Kolumny identity / sekwencja → numer z licznika firmy; unikalność numeru w obrębie firmy.
alter table public.service_tickets alter column ticket_number drop identity;
alter table public.service_protocols alter column protocol_number drop identity;
alter table public.offers alter column offer_number drop identity;
alter table public.work_orders alter column order_number drop identity;
alter table public.installation_handovers alter column protocol_number drop identity;
alter table public.crm_tasks alter column number drop default;
drop sequence public.crm_task_number_seq;

alter table public.service_tickets drop constraint service_tickets_ticket_number_key, add constraint service_tickets_ticket_number_key unique(org_id,ticket_number);
alter table public.service_protocols drop constraint service_protocols_protocol_number_key, add constraint service_protocols_protocol_number_key unique(org_id,protocol_number);
alter table public.offers drop constraint offers_offer_number_key, add constraint offers_offer_number_key unique(org_id,offer_number);
alter table public.work_orders drop constraint work_orders_order_number_key, add constraint work_orders_order_number_key unique(org_id,order_number);
alter table public.installation_handovers drop constraint installation_handovers_protocol_number_key, add constraint installation_handovers_protocol_number_key unique(org_id,protocol_number);
alter table public.crm_tasks drop constraint crm_tasks_number_key, add constraint crm_tasks_number_key unique(org_id,number);
alter table public.stock_documents drop constraint stock_documents_number_key, add constraint stock_documents_number_key unique(org_id,number);

create trigger service_tickets_number before insert on public.service_tickets for each row execute function public.assign_org_number('ticket','ticket_number');
create trigger service_protocols_number before insert on public.service_protocols for each row execute function public.assign_org_number('protocol','protocol_number');
create trigger offers_number before insert on public.offers for each row execute function public.assign_org_number('offer','offer_number');
create trigger work_orders_number before insert on public.work_orders for each row execute function public.assign_org_number('work_order','order_number');
create trigger installation_handovers_number before insert on public.installation_handovers for each row execute function public.assign_org_number('handover','protocol_number');
create trigger crm_tasks_number before insert on public.crm_tasks for each row execute function public.assign_org_number('task','number');

-- Magazyn: licznik PZ/MM/RW/WZ na miesiąc w obrębie firmy (reszta funkcji bez zmian).
create or replace function public.post_stock_document(p_id uuid, p_kind text, p_from uuid, p_to uuid, p_ticket uuid, p_supplier text, p_note text, p_lines jsonb, p_customer uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
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
 n:=public.next_org_number(public.current_org_id(),p_kind,v_period);
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

-- „Uzupełnij braki”: magazyn główny aktywnej firmy zamiast stałego identyfikatora.
create or replace function public.refill_vehicles(p_request uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare main uuid;v record;lines jsonb;doc uuid;res jsonb:='[]';free numeric;need numeric;m record;begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_request is null then raise exception 'Invalid request' using errcode='22023';end if;
 select l.id into main from public.stock_locations l where l.kind='warehouse' and l.active order by l.created_at,l.id limit 1;
 if main is null then raise exception 'Main warehouse missing' using errcode='22023';end if;
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
