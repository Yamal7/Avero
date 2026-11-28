-- KRA-76: rola authenticated (klucz publiczny + sesja użytkownika) ma w public tylko te uprawnienia, których
-- aplikacja realnie używa: SELECT na tabelach czytanych bezpośrednio (PostgREST .from, osadzenia), przez funkcje
-- security invoker, polityki storage i podzapytania polityk RLS, oraz INSERT/UPDATE na czterech tabelach CRM
-- zapisywanych przez server action saveRecord / archiveCustomer. Żadnych uprawnień do sekwencji, żadnego DELETE.
-- Nowe uprawnienie authenticated w public = czerwony test (lista dozwolonych poniżej).
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Lista dozwolonych uprawnień authenticated w public (tabela, uprawnienie). Uzasadnienie każdego wpisu:
-- supabase/migrations/202611280008_revoke_authenticated_unused.sql i docs/STATUS.md › KRA-76.
create temp table authenticated_allowed(rel text, priv text, primary key(rel, priv)) on commit drop;
insert into authenticated_allowed
select t, 'select' from unnest(array['catalog_items','customers','devices','documents','installations','locations',
 'maintenance_completions','maintenance_plans','offers','service_protocols','service_tickets','service_visits']) t
union all
select t, p from unnest(array['customers','locations','installations','devices']) t cross join unnest(array['insert','update']) p;

-- has_table_privilege / has_column_privilege / has_sequence_privilege liczą też granty dla PUBLIC.
-- Wywołania są osłonięte `case` po relkind, żeby wynik nie zależał od planu zapytania
-- (has_sequence_privilege na tabeli kończy się błędem „… is not a sequence” i odwrotnie).

-- (a) Uprawnienia do tabel i widoków: dokładnie lista dozwolonych.
select is(array(
 select c.relname::text||' '||p.priv
 from pg_class c
 cross join (select unnest(array['select','insert','update','delete','truncate','references','trigger']
   ||case when current_setting('server_version_num')::int>=170000 then array['maintain'] else '{}'::text[] end)) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f')
 and case when c.relkind in ('r','p','v','m','f') then has_table_privilege('authenticated',c.oid,p.priv) else false end
 and (c.relname::text,p.priv) not in (select rel,priv from authenticated_allowed)
 order by 1),array[]::text[],'authenticated has no table privilege outside the allow list');

select is(array(
 select a.rel||' '||a.priv from authenticated_allowed a
 where not has_table_privilege('authenticated',('public.'||a.rel)::regclass,a.priv)
 order by 1),array[]::text[],'authenticated keeps every privilege on the allow list');

-- Uprawnienia do kolumn poza uprawnieniem do całej tabeli (grant select(kolumna) omija test na poziomie tabeli).
select is(array(
 select c.relname::text||'.'||a.attname||' '||p.priv
 from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
 cross join (values ('select'),('insert'),('update'),('references')) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f')
 and case when c.relkind in ('r','p','v','m','f') then has_column_privilege('authenticated',c.oid,a.attnum,p.priv)
   and not has_table_privilege('authenticated',c.oid,p.priv) else false end
 order by 1),array[]::text[],'authenticated has no column-only privilege in public');

-- (b) Sekwencje: żadnego uprawnienia (zapisy audytu idą przez wyzwalacze SECURITY DEFINER).
select is(array(
 select c.relname::text||' '||p.priv
 from pg_class c
 cross join (values ('usage'),('select'),('update')) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind='S'
 and case when c.relkind='S' then has_sequence_privilege('authenticated',c.oid,p.priv) else false end
 order by 1),array[]::text[],'authenticated has no privilege on any public sequence');

-- Zapytanie kontrolne z docs/STATUS.md › KRA-76 (to samo, co ma uruchomić właściciel na „Avero”) = 0.
create function pg_temp.authenticated_extra_grants() returns int language sql stable as $$
 select count(*)::int from pg_class c
 cross join (values ('select'),('insert'),('update'),('delete'),('truncate'),('references'),('trigger')) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f','S')
 and case when c.relkind='S' then p.priv='select' and has_sequence_privilege('authenticated',c.oid,'usage,select,update')
   else (has_table_privilege('authenticated',c.oid,p.priv)
     or (p.priv in ('select','insert','update','references') and has_any_column_privilege('authenticated',c.oid,p.priv)))
     and (c.relname, p.priv) not in (values
       ('catalog_items','select'),('customers','select'),('devices','select'),('documents','select'),
       ('installations','select'),('locations','select'),('maintenance_completions','select'),
       ('maintenance_plans','select'),('offers','select'),('service_protocols','select'),
       ('service_tickets','select'),('service_visits','select'),
       ('customers','insert'),('customers','update'),('locations','insert'),('locations','update'),
       ('installations','insert'),('installations','update'),('devices','insert'),('devices','update')) end
$$;
select is(pg_temp.authenticated_extra_grants(),0,'Control query: authenticated has no privilege outside the allow list');

-- (c) Domyślne uprawnienia: nowa sekwencja (także identity) utworzona przez postgres nie daje authenticated niczego.
create table public.kra76_probe(id bigint generated always as identity primary key, name text);
create sequence public.kra76_probe_seq;
-- Od KRA-77 nowa tabela nie daje authenticated niczego (pełny test domyślnych uprawnień: 049_default_privileges.sql).
select is(pg_temp.authenticated_extra_grants(),0,'New table and sequence add nothing to the control query');
select ok(not has_sequence_privilege('authenticated','public.kra76_probe_seq','usage,select,update'),
 'New sequence gives authenticated nothing by default');
select ok(not has_sequence_privilege('authenticated',pg_get_serial_sequence('public.kra76_probe','id'),'usage,select,update'),
 'Identity sequence of a new table gives authenticated nothing by default');
select ok(has_sequence_privilege('service_role','public.kra76_probe_seq','usage,select,update'),'service_role keeps default sequence grants');
select ok(has_sequence_privilege('avero_rpc','public.kra76_probe_seq','usage,select,update'),'avero_rpc keeps default sequence grants');
-- Kontrola negatywna: zapytanie kontrolne wyłapuje grant dla PUBLIC na sekwencji, DELETE i grant na kolumnę.
grant usage on sequence public.kra76_probe_seq to public;
select is(pg_temp.authenticated_extra_grants(),1,'Control query sees a sequence grant to PUBLIC');
revoke usage on sequence public.kra76_probe_seq from public;
grant delete on public.customers to authenticated;
select is(pg_temp.authenticated_extra_grants(),1,'Control query sees DELETE on customers');
revoke delete on public.customers from authenticated;
grant select(name) on public.kra76_probe to public;
select is(pg_temp.authenticated_extra_grants(),1,'Control query sees a column grant to PUBLIC');
revoke select(name) on public.kra76_probe from public;
select is(pg_temp.authenticated_extra_grants(),0,'Control query is back to 0 after revoke');
drop sequence public.kra76_probe_seq;
drop table public.kra76_probe;

-- Dane: firma, pracownik biura, klient z lokalizacją i instalacją.
insert into public.organizations(id,name) values ('0a480000-0000-4000-8000-00000000000a','Firma authenticated');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
 ('a4800000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','auth-grants-1@example.invalid','x',now(),now(),now());
insert into public.org_members(org_id,user_id,role) values
 ('0a480000-0000-4000-8000-00000000000a','a4800000-0000-4000-8000-000000000001','admin');
insert into public.customers(id,org_id,name,type) values
 ('c4800000-0000-4000-8000-000000000001','0a480000-0000-4000-8000-00000000000a','QZ8 Authenticated','company');
insert into public.locations(id,org_id,customer_id,address,city) values
 ('d4800000-0000-4000-8000-000000000001','0a480000-0000-4000-8000-00000000000a','c4800000-0000-4000-8000-000000000001','Polna 8','Reda');
insert into public.installations(id,org_id,location_id,type) values
 ('e4800000-0000-4000-8000-000000000001','0a480000-0000-4000-8000-00000000000a','d4800000-0000-4000-8000-000000000001','heat_pump');

-- (d) authenticated (pracownik): zapis CRM z saveRecord / archiveCustomer działa, audyt dalej się zapisuje,
-- a odebrane uprawnienia odpowiadają błędem 42501.
select set_config('request.jwt.claim.sub','a4800000-0000-4000-8000-000000000001',true);
set local role authenticated;
select lives_ok($$insert into public.customers(name,type) values ('QZ8 Nowy','company')$$,'Staff inserts customer directly (saveRecord)');
select lives_ok($$insert into public.locations(customer_id,address,city) values ('c4800000-0000-4000-8000-000000000001','Polna 9','Reda')$$,'Staff inserts location directly');
select lives_ok($$insert into public.devices(installation_id,manufacturer,serial_number) values ('e4800000-0000-4000-8000-000000000001','Test','QZ8-SN')$$,'Staff inserts device directly');
select lives_ok($$update public.installations set installed_on=current_date where id='e4800000-0000-4000-8000-000000000001'$$,'Staff updates installation directly');
select lives_ok($$update public.customers set archived_at=now() where id='c4800000-0000-4000-8000-000000000001'$$,'Staff archives customer directly (archiveCustomer)');
select throws_ok($$select nextval('public.audit_logs_id_seq')$$,'42501',null,'authenticated cannot use audit sequence');
select throws_ok($$select nextval('public.access_audit_logs_id_seq')$$,'42501',null,'authenticated cannot use access audit sequence');
select throws_ok($$delete from public.customers where id='c4800000-0000-4000-8000-000000000001'$$,'42501',null,'authenticated cannot delete customers');
select throws_ok($$delete from public.devices$$,'42501',null,'authenticated cannot delete devices');
select throws_ok($$insert into public.sales_inquiries(customer_id,message) values ('c4800000-0000-4000-8000-000000000001','X')$$,'42501',null,'authenticated cannot insert sales inquiries directly');
select throws_ok(format('select count(*) from public.%I',t),'42501',null,'authenticated cannot read '||t)
 from unnest(array['sales_inquiries','customer_import_batches','installation_handovers','offer_documents','offer_publications','work_orders','work_order_visits']) t;
select is((select count(*)::int from public.customers where id='c4800000-0000-4000-8000-000000000001'),1,'Staff still reads customer through RLS policies');
select is((select count(*)::int from public.search_customers('QZ8',true)),1,'search_customers (security invoker) still works');
select lives_ok($$select count(*) from storage.objects$$,'Storage read policy (subquery on documents) still evaluates');
reset role;
select is((select count(*)::int from public.audit_logs where row_id in ('c4800000-0000-4000-8000-000000000001','e4800000-0000-4000-8000-000000000001') and action='UPDATE'),2,
 'Audit trigger (SECURITY DEFINER) still writes without a sequence grant for authenticated');

select * from finish();
rollback;
