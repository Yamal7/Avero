-- M0.1 Wielofirmowość (KRA-27) — skrypt cofający migracje 202611230001…202611230007.
-- NIE jest migracją (leży poza supabase/migrations). Uruchamia go ręcznie właściciel, w jednej transakcji:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f supabase/rollback/m0-1-organizations-down.sql
-- a potem usuwa wpisy 202611230001…7 z supabase_migrations.schema_migrations (instrukcja w docs/STATUS.md › M0.1).
-- Działa tylko, gdy istnieje wyłącznie firma „Kranz HVACR” (inaczej cofnięcie zgubiłoby podział danych) — wtedy
-- przerywa bez zmian. Wszystkie wiersze zostają; usuwane są tylko kolumny org_id, tabele organizacji, liczniki
-- dokumentów dodane przez M0.1 (inne niż PZ/MM/RW/WZ) i pole bankAccount w profilu firmy (stary schemat go nie zna).
-- Sprawdzony lokalnie skryptem scripts/db/m0-1-count-check.sh --rollback.

do $$ begin
 if (select count(*) from public.organizations)<>1 or not exists(select 1 from public.organizations where id='0a000000-0000-4000-8000-000000000001') then
  raise exception 'Cofnięcie M0.1 możliwe tylko przy jednej firmie (Kranz HVACR). Najpierw przenieś lub usuń dane innych firm.';
 end if;
 if exists(select 1 from public.org_members group by user_id having count(*)>1) then
  raise exception 'Osoba ma kilka członkostw — cofnięcie niemożliwe.';
 end if;
end $$;

-- 1. RPC przełącznika firm i helpery dostępu M0.1.
drop function public.set_active_org(uuid);
drop function public.my_organizations();

-- 2. Polityki izolacji (muszą zniknąć przed usunięciem kolumn org_id).
do $$ declare r record; begin
 for r in select schemaname, tablename, policyname from pg_policies
  where schemaname='public' and policyname in ('org_isolation','rpc_access') loop
  execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
 end loop;
end $$;
drop policy avero_rpc_read on storage.objects;

-- 3. Numeracja: z powrotem kolumny identity / sekwencja zadań, kontynuacja od obecnego stanu licznika.
drop trigger service_tickets_number on public.service_tickets;
drop trigger service_protocols_number on public.service_protocols;
drop trigger offers_number on public.offers;
drop trigger work_orders_number on public.work_orders;
drop trigger installation_handovers_number on public.installation_handovers;
drop trigger crm_tasks_number on public.crm_tasks;
do $$
declare r record; nxt bigint;
begin
 for r in select * from (values ('ticket','service_tickets','ticket_number'),('protocol','service_protocols','protocol_number'),
  ('offer','offers','offer_number'),('work_order','work_orders','order_number'),('handover','installation_handovers','protocol_number')) v(k,t,c) loop
  execute format('select greatest(coalesce(max(%I),0),coalesce((select last from public.org_doc_counters where kind=%L and period=%L),0))+1 from public.%I',r.c,r.k,'',r.t) into nxt;
  execute format('alter table public.%I alter column %I add generated always as identity (start with %s)',r.t,r.c,nxt);
 end loop;
 select greatest(coalesce(max(number),99),coalesce((select last from public.org_doc_counters where kind='task' and period=''),99))+1 into nxt from public.crm_tasks;
 create sequence public.crm_task_number_seq;
 perform setval('public.crm_task_number_seq',nxt,false);
 alter table public.crm_tasks alter column number set default nextval('public.crm_task_number_seq');
 alter sequence public.crm_task_number_seq owned by public.crm_tasks.number;
end $$;
drop function public.assign_org_number();
drop function public.next_org_number(uuid,text,text);
alter table public.service_tickets drop constraint service_tickets_ticket_number_key, add constraint service_tickets_ticket_number_key unique(ticket_number);
alter table public.service_protocols drop constraint service_protocols_protocol_number_key, add constraint service_protocols_protocol_number_key unique(protocol_number);
alter table public.offers drop constraint offers_offer_number_key, add constraint offers_offer_number_key unique(offer_number);
alter table public.work_orders drop constraint work_orders_order_number_key, add constraint work_orders_order_number_key unique(order_number);
alter table public.installation_handovers drop constraint installation_handovers_protocol_number_key, add constraint installation_handovers_protocol_number_key unique(protocol_number);
alter table public.crm_tasks drop constraint crm_tasks_number_key, add constraint crm_tasks_number_key unique(number);
alter table public.stock_documents drop constraint stock_documents_number_key, add constraint stock_documents_number_key unique(number);
delete from public.org_doc_counters where kind not in ('PZ','MM','RW','WZ');
alter table public.org_doc_counters drop constraint org_doc_counters_pkey;
alter table public.org_doc_counters rename to stock_doc_counters;
alter table public.stock_doc_counters alter column last type integer;
alter table public.stock_doc_counters add constraint stock_doc_counters_pkey primary key(kind,period);
comment on table public.stock_doc_counters is null;

-- 4. Unikalności i klucze sprzed M0.1.
alter table public.company_profiles drop constraint company_profiles_pkey, add constraint company_profiles_pkey primary key(singleton);
update public.company_profiles set data=data-'bankAccount' where data ? 'bankAccount';
drop function public.valid_bank_account(text);
drop index public.catalog_code_unique;
create unique index catalog_code_unique on public.catalog_items(lower(code));
alter table public.stock_items drop constraint stock_items_code_key, add constraint stock_items_code_key unique(code);
drop index public.stock_locations_vehicle;
create unique index stock_locations_vehicle on public.stock_locations(technician_id) where kind='vehicle' and active;
alter table public.customer_category_colors drop constraint customer_category_colors_pkey, add primary key(key);
drop index public.account_access_user_idx;
alter table public.account_access drop constraint account_access_pkey, add primary key(user_id);
alter table public.geocode_cache drop constraint geocode_cache_pkey, add primary key(query);
drop trigger organizations_warehouse on public.organizations;
drop function public.create_org_warehouse();

-- 5. Członkostwa: org_members wraca do staff_users (te same wiersze), z kluczami sprzed M0.1.
alter table public.service_tickets drop constraint service_tickets_assigned_to_fkey;
alter table public.staff_customer_assignments drop constraint staff_customer_assignments_user_id_fkey;
drop view public.staff_users;
alter table public.org_members drop constraint org_members_pkey;
drop index public.org_members_user_idx;
alter table public.org_members rename to staff_users;
alter table public.staff_users rename constraint org_members_user_id_fkey to staff_users_user_id_fkey;
alter table public.staff_users rename constraint org_members_role_check to staff_users_role_check;
alter table public.staff_users add constraint staff_users_pkey primary key(user_id);
comment on table public.staff_users is null;
alter table public.service_tickets add constraint service_tickets_assigned_to_fkey foreign key(assigned_to) references public.staff_users(user_id) on delete set null;
alter table public.staff_customer_assignments add constraint staff_customer_assignments_user_id_fkey foreign key(user_id) references public.staff_users(user_id) on delete cascade;

-- 6. Funkcje w wersji sprzed M0.1 (treść z bazy po 202611200008_user_preferences.sql).
CREATE OR REPLACE FUNCTION public.accept_access_invitation(p_invitation uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare invitation public.access_invitations%rowtype; verified boolean;
begin
 perform pg_advisory_xact_lock(682501004);
 if not public.account_enabled(auth.uid()) then raise exception 'Account unavailable' using errcode='42501'; end if;
 select * into invitation from public.access_invitations where id=p_invitation for update;
 if not found then raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 select exists(select 1 from auth.users where id=auth.uid() and lower(email)=invitation.email and email_confirmed_at is not null) into verified;
 if not verified then raise exception 'Verified invitation email required' using errcode='42501'; end if;
 if invitation.status='accepted' and invitation.accepted_by=auth.uid() then return; end if;
 if invitation.status<>'pending' or invitation.expires_at<now() or not public.account_enabled(invitation.created_by)
 or not exists(select 1 from public.staff_users where user_id=invitation.created_by and role='admin') then
 raise exception 'Invitation unavailable' using errcode='P0001'; end if;
 if invitation.customer_id is not null and not exists(select 1 from public.customers where id=invitation.customer_id and archived_at is null) then raise exception 'Customer unavailable' using errcode='P0001'; end if;
 if invitation.role='client' then
 insert into public.customer_memberships(user_id,customer_id,role) values(auth.uid(),invitation.customer_id,'viewer') on conflict do nothing;
 else
 if exists(select 1 from public.staff_users where user_id=auth.uid()) then raise exception 'Use administrator for staff changes' using errcode='P0001'; end if;
 insert into public.staff_users(user_id,role) values(auth.uid(),invitation.role);
 if invitation.role='technician' and invitation.customer_id is not null then insert into public.staff_customer_assignments(user_id,customer_id) values(auth.uid(),invitation.customer_id); end if;
 end if;
 update public.access_invitations set status='accepted',accepted_by=auth.uid() where id=p_invitation;
end $function$
;

CREATE OR REPLACE FUNCTION public.account_enabled(p_user uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select p_user is not null and not exists(select 1 from public.account_access where user_id=p_user and blocked);
$function$
;

CREATE OR REPLACE FUNCTION public.audit_access_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare before_data jsonb; after_data jsonb; target uuid;
begin
 if tg_op <> 'INSERT' then before_data:=to_jsonb(old); end if;
 if tg_op <> 'DELETE' then after_data:=to_jsonb(new); end if;
 target:=coalesce((after_data->>'user_id')::uuid,(before_data->>'user_id')::uuid,(after_data->>'accepted_by')::uuid);
 insert into public.access_audit_logs(actor_id,target_user_id,action,old_data,new_data)
 values(auth.uid(),target,tg_table_name||':'||tg_op,before_data,after_data);
 if tg_op='DELETE' then return old; end if; return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.audit_company_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
 insert into public.audit_logs(table_name,row_id,action,actor_id,old_data,new_data) values('company_profiles','00000000-0000-4000-8000-000000000021',TG_OP,auth.uid(),case when TG_OP='UPDATE' then to_jsonb(OLD)-'data' else null end,to_jsonb(NEW)-'data');return NEW;
end;$function$
;

CREATE OR REPLACE FUNCTION public.audit_crm_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.audit_logs(actor_id, table_name, row_id, action, old_data, new_data)
  values (auth.uid(), tg_table_name, new.id, tg_op,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end, to_jsonb(new));
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.company_profile()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 return(select jsonb_build_object('version',version,'data',data) from public.company_profiles where singleton);
end;$function$
;

CREATE OR REPLACE FUNCTION public.email_job_eligible(p_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$declare q public.notification_email_queue%rowtype;old_sub text;result boolean;begin
 select * into q from public.notification_email_queue where id=p_id;if not found then return false;end if;
 if not public.account_enabled(q.user_id) or not exists(select 1 from public.staff_users where user_id=q.user_id and role in('admin','office','technician')) or not exists(select 1 from auth.users where id=q.user_id and email_confirmed_at is not null and lower(email)=lower(q.recipient)) or not exists(select 1 from public.notification_email_preferences where user_id=q.user_id and enabled) then return false;end if;
 old_sub:=current_setting('request.jwt.claim.sub',true);perform set_config('request.jwt.claim.sub',q.user_id::text,true);
 select exists(select 1 from public.app_notifications n join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category and s.event_key=n.event_key where n.id=q.notification_id and n.user_id=q.user_id and s.active and not (n.read_at is not null) and (public.my_notification_preferences()->>n.category)::boolean) into result;
 perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);return result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.list_access_users(p_search text DEFAULT ''::text, p_page integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare result jsonb; total integer;
begin
 perform public.assert_access_admin();
 if p_page<1 or p_page>100000 or length(p_search)>200 then raise exception 'Invalid page' using errcode='22023'; end if;
 select count(*) into total from auth.users where strpos(lower(coalesce(email,'')),lower(trim(p_search)))>0 or trim(p_search)='';
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
 select u.id,u.email,u.email_confirmed_at,u.created_at,coalesce(s.role,'client') as role,not public.account_enabled(u.id) as blocked,
 coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'kind','member')) from public.customer_memberships m join public.customers c on c.id=m.customer_id where m.user_id=u.id),'[]') ||
 coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'kind','technician')) from public.staff_customer_assignments a join public.customers c on c.id=a.customer_id where a.user_id=u.id),'[]') as customers
 from auth.users u left join public.staff_users s on s.user_id=u.id
 where strpos(lower(coalesce(u.email,'')),lower(trim(p_search)))>0 or trim(p_search)=''
 order by u.created_at desc,u.id limit 25 offset (p_page-1)*25
 ) t;
 return jsonb_build_object('users',result,'total',total);
end $function$
;

CREATE OR REPLACE FUNCTION public.post_stock_document(p_id uuid, p_kind text, p_from uuid, p_to uuid, p_ticket uuid, p_supplier text, p_note text, p_lines jsonb, p_customer uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.prepare_notification_emails(p_allowed text[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare u record;old_sub text;added integer:=0;n integer;begin
 perform public.assert_email_worker();if coalesce(cardinality(p_allowed),0) not between 1 and 100 then raise exception 'Explicit recipients required' using errcode='22023';end if;
 old_sub:=current_setting('request.jwt.claim.sub',true);
 for u in select p.user_id,p.enabled_at,a.email from public.notification_email_preferences p join auth.users a on a.id=p.user_id join public.staff_users s on s.user_id=p.user_id where p.enabled and p.next_scan_at<=now() and public.account_enabled(p.user_id) and a.email_confirmed_at is not null and lower(a.email)=any(p_allowed) and s.role in('admin','office','technician') order by p.next_scan_at,p.user_id limit 20 loop
  if not pg_try_advisory_xact_lock(hashtextextended('notifications:'||u.user_id::text,0)) then continue;end if;
  perform set_config('request.jwt.claim.sub',u.user_id::text,true);perform public.sync_my_notifications();
  insert into public.notification_email_queue(notification_id,user_id,recipient,category)
  select n.id,u.user_id,u.email,n.category from public.app_notifications n join public.notification_sources() s on s.source_id=n.source_id and s.category=n.category and s.event_key=n.event_key where n.user_id=u.user_id and n.created_at>=u.enabled_at and n.read_at is null and s.active and (public.my_notification_preferences()->>n.category)::boolean and not exists(select 1 from public.notification_email_queue q where q.notification_id=n.id) order by n.created_at,n.id limit 200 on conflict(notification_id) do nothing;
  get diagnostics n=row_count;added:=added+n;update public.notification_email_preferences set next_scan_at=now()+interval '1 minute' where user_id=u.user_id;
 end loop;
 perform set_config('request.jwt.claim.sub',coalesce(old_sub,''),true);return added;
end;$function$
;

CREATE OR REPLACE FUNCTION public.refill_vehicles(p_request uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.save_company_profile(p_version integer, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare current public.company_profiles%rowtype;begin
 perform public.service_write_lock();
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501';end if;
 if p_version<0 or p_version>2147483646 or jsonb_typeof(p_data->'validityDays') is distinct from 'number' or p_data->>'validityDays'!~'^[0-9]{1,3}$' or (p_data->>'validityDays')::integer not between 1 and 365 or not coalesce(public.validate_offer_document((p_data-'validityDays')||'{"issuedOn":"2026-01-01","validUntil":"2026-01-02"}'),false) or p_data?'issuedOn' or p_data?'validUntil' then raise exception 'Invalid company profile' using errcode='22023';end if;
 select * into current from public.company_profiles where singleton for update;
 if found then
  if current.data=p_data and (p_version=current.version or p_version=current.version-1 or p_version is null and current.version=0) then return public.company_profile();end if;
  if p_version is distinct from current.version then raise exception 'Stale company profile' using errcode='40001';end if;
  update public.company_profiles set data=p_data,version=version+1,updated_at=now() where singleton;
 else
  if p_version is not null then raise exception 'Missing company profile' using errcode='40001';end if;
  insert into public.company_profiles(data) values(p_data);
 end if;
 return public.company_profile();
end;$function$
;

CREATE OR REPLACE FUNCTION public.save_customer_category(p_name text, p_color text, p_rename text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare target text:=coalesce(nullif(trim(p_rename),''),trim(p_name));begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_name is null or length(trim(p_name)) not between 1 and 40 or length(target)>40 or target~'[[:cntrl:]]' or p_color not in('blue','teal','violet','orange','green','amber','red','grey') then raise exception 'Invalid category' using errcode='22023';end if;
 if lower(target)<>lower(trim(p_name)) or target<>trim(p_name) then
  update public.customers set categories=(select coalesce(array_agg(v order by o),'{}') from(select distinct on(lower(v)) v,o from unnest(array_replace(categories,(select x from unnest(categories) x where lower(x)=lower(trim(p_name)) limit 1),target)) with ordinality u(v,o) order by lower(v),o) d)
  where exists(select 1 from unnest(categories) x where lower(x)=lower(trim(p_name)));
  delete from public.customer_category_colors where key=lower(trim(p_name));
 end if;
 insert into public.customer_category_colors(key,color) values(lower(target),p_color) on conflict(key) do update set color=excluded.color;
end;$function$
;

CREATE OR REPLACE FUNCTION public.save_geocode(p_key text, p_lat double precision, p_lng double precision)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_key is null or length(p_key) not between 3 and 400 or p_key<>lower(p_key) or (p_lat is null)<>(p_lng is null) or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'Invalid geocode' using errcode='22023';end if;
 insert into public.geocode_cache(query,latitude,longitude,failed) values(p_key,p_lat,p_lng,p_lat is null)
 on conflict(query) do update set latitude=excluded.latitude,longitude=excluded.longitude,failed=excluded.failed,fetched_at=now();
end;$function$
;

CREATE OR REPLACE FUNCTION public.set_access_blocked(p_user uuid, p_blocked boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 perform public.assert_access_admin();
 if p_blocked is null or not exists(select 1 from auth.users where id=p_user) then raise exception 'Invalid user' using errcode='22023'; end if;
 if p_blocked then perform public.protect_last_admin(p_user); end if;
 insert into public.account_access(user_id,blocked) values(p_user,p_blocked) on conflict(user_id) do update set blocked=excluded.blocked;
 if p_blocked then update public.access_invitations set status='revoked' where status='pending' and email=(select lower(email) from auth.users where id=p_user); end if;
end $function$
;

CREATE OR REPLACE FUNCTION public.set_access_role(p_user uuid, p_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 perform public.assert_access_admin();
 if p_role not in ('admin','office','technician','client') or p_role is null then raise exception 'Invalid role' using errcode='22023'; end if;
 if not exists(select 1 from auth.users where id=p_user) then raise exception 'User not found' using errcode='P0001'; end if;
 if p_role <> 'admin' then perform public.protect_last_admin(p_user); end if;
 if p_role='client' then delete from public.staff_users where user_id=p_user;
 else
 insert into public.staff_users(user_id,role) values(p_user,p_role) on conflict(user_id) do update set role=excluded.role;
 if p_role<>'technician' then delete from public.staff_customer_assignments where user_id=p_user; end if;
 end if;
 update public.access_invitations set status='revoked' where status='pending' and email=(select lower(email) from auth.users where id=p_user);
end $function$
;

CREATE OR REPLACE FUNCTION public.set_customer_access(p_user uuid, p_customer uuid, p_kind text, p_remove boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 perform public.assert_access_admin();
 if p_kind not in ('member','technician') or p_kind is null or p_remove is null then raise exception 'Invalid assignment' using errcode='22023'; end if;
 if not exists(select 1 from auth.users where id=p_user) then raise exception 'User not found' using errcode='P0001'; end if;
 if not p_remove and not exists(select 1 from public.customers where id=p_customer and archived_at is null) then raise exception 'Active customer required' using errcode='P0001'; end if;
 if p_kind='technician' then
  if not exists(select 1 from public.staff_users where user_id=p_user and role='technician') then raise exception 'Technician role required' using errcode='P0001'; end if;
  if p_remove then delete from public.staff_customer_assignments where user_id=p_user and customer_id=p_customer;
  else insert into public.staff_customer_assignments(user_id,customer_id) values(p_user,p_customer) on conflict do nothing; end if;
 else
  if p_remove then delete from public.customer_memberships where user_id=p_user and customer_id=p_customer;
  else insert into public.customer_memberships(user_id,customer_id,role) values(p_user,p_customer,'viewer') on conflict do nothing; end if;
 end if;
 if p_remove then update public.access_invitations set status='revoked' where status='pending' and customer_id=p_customer and email=(select lower(email) from auth.users where id=p_user); end if;
end $function$
;

CREATE OR REPLACE FUNCTION public.validate_ticket_installation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if new.customer_id is distinct from public.customer_for_installation(new.installation_id) then
    raise exception 'Ticket installation belongs to another customer';
  end if;
  return new;
end $function$
;


grant execute on function public.validate_ticket_installation() to public, anon, authenticated;

drop function public.org_knows_user(uuid);
drop function public.account_enabled_in(uuid,uuid);

-- Funkcje, w których M0.1 podmienił tylko auth.users → public.auth_user_directory.
do $$ declare f record; begin
 for f in select p.oid from pg_proc p where p.pronamespace='public'::regnamespace and p.prosrc like '%public.auth_user_directory%' loop
  execute replace(pg_get_functiondef(f.oid),'public.auth_user_directory','auth.users');
 end loop;
end $$;
drop view public.auth_user_directory;

-- 7. Kolumny org_id i tabele organizacji.
do $$ declare t text; begin
 for t in select c.relname from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attname='org_id' and not a.attisdropped
  where c.relnamespace='public'::regnamespace and c.relkind='r' and c.relname<>'org_active' loop
  execute format('alter table public.%I drop column org_id',t);
 end loop;
end $$;
drop function public.org_default();
drop function public.current_org_id();
drop table public.org_active;
drop table public.organizations;

-- 8. Rola avero_rpc: funkcje wracają do postgres, uprawnienia i rola znikają.
reassign owned by avero_rpc to postgres;
drop owned by avero_rpc;
revoke authenticated from avero_rpc;
revoke avero_rpc from postgres;
drop role avero_rpc;
