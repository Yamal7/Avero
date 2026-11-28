-- KRA-74: rola anon (klucz publiczny bez sesji) nie ma żadnego uprawnienia do tabel, widoków i sekwencji w public.
-- Drogi bez sesji (logowanie przez Supabase Auth, zaproszenie po setSession, worker poczty = service_role)
-- nie czytają tabel jako anon. Nowa tabela lub sekwencja, która da anon cokolwiek, = czerwony test.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- has_table_privilege / has_column_privilege / has_sequence_privilege liczą też granty dla PUBLIC.
-- Wywołania są osłonięte `case` po relkind, żeby wynik nie zależał od planu zapytania
-- (has_sequence_privilege na indeksie lub tabeli kończy się błędem „… is not a sequence”).

-- (a) Żadna tabela, widok, widok zmaterializowany, tabela obca ani tabela partycjonowana w public nie daje anon niczego.
select is(array(
 select c.relname::text||' '||p.priv
 from pg_class c
 cross join (select unnest(array['select','insert','update','delete','truncate','references','trigger']
   ||case when current_setting('server_version_num')::int>=170000 then array['maintain'] else '{}'::text[] end)) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f')
 and case when c.relkind in ('r','p','v','m','f') then has_table_privilege('anon',c.oid,p.priv) else false end
 order by 1),array[]::text[],'anon has no privilege on any public table or view');

-- Uprawnienia do kolumn też się liczą (grant select(kolumna) omija test na poziomie tabeli).
select is(array(
 select c.relname::text||'.'||a.attname||' '||p.priv
 from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
 cross join (values ('select'),('insert'),('update'),('references')) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f')
 and case when c.relkind in ('r','p','v','m','f') then has_column_privilege('anon',c.oid,a.attnum,p.priv) else false end
 order by 1),array[]::text[],'anon has no column privilege in public');

select is(array(
 select c.relname::text||' '||p.priv
 from pg_class c
 cross join (values ('usage'),('select'),('update')) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind='S'
 and case when c.relkind='S' then has_sequence_privilege('anon',c.oid,p.priv) else false end
 order by 1),array[]::text[],'anon has no privilege on any public sequence');

-- Zapytanie kontrolne z docs/STATUS.md › KRA-74 (to samo, co ma uruchomić właściciel na „Avero”) = 0.
create function pg_temp.anon_public_grants() returns int language sql stable as $$
 select count(*)::int from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f','S')
 and case when c.relkind='S' then has_sequence_privilege('anon',c.oid,'usage,select,update')
   else has_table_privilege('anon',c.oid,'select,insert,update,delete,truncate,references,trigger')
     or has_any_column_privilege('anon',c.oid,'select,insert,update,references') end
$$;
select is(pg_temp.anon_public_grants(),0,'Control query: anon has no privilege on public relations');

-- (b) Domyślne uprawnienia: nowa tabela i sekwencja utworzone przez postgres nie dają anon niczego.
create table public.kra74_probe(id bigint generated always as identity primary key, name text);
create sequence public.kra74_probe_seq;
create view public.kra74_probe_view with (security_invoker=true) as select id from public.kra74_probe;
select ok(not has_table_privilege('anon','public.kra74_probe','select,insert,update,delete,truncate,references,trigger'),
 'New table gives anon nothing by default');
select ok(not has_table_privilege('anon','public.kra74_probe_view','select,insert,update,delete'),'New view gives anon nothing by default');
select ok(not has_sequence_privilege('anon','public.kra74_probe_seq','usage,select,update'),'New sequence gives anon nothing by default');
select ok(not has_sequence_privilege('anon',pg_get_serial_sequence('public.kra74_probe','id'),'usage,select,update'),
 'Identity sequence of a new table gives anon nothing by default');
-- Pozostałe role zachowują domyślne granty do tabel; authenticated od KRA-77 nie dostaje niczego
-- (patrz 049_default_privileges.sql).
select ok(not has_table_privilege('authenticated','public.kra74_probe','select,insert,update,delete'),'authenticated gets no default table grants');
select ok(has_table_privilege('service_role','public.kra74_probe','select,insert,update,delete,truncate'),'service_role keeps default table grants');
select ok(has_table_privilege('avero_rpc','public.kra74_probe','select,insert,update,delete'),'avero_rpc keeps default table grants');
-- Kontrola negatywna: zapytanie kontrolne wyłapuje granty dla PUBLIC i na kolumny (aclexplode by ich nie pokazał).
grant usage on sequence public.kra74_probe_seq to public;
select is(pg_temp.anon_public_grants(),1,'Control query sees a sequence grant to PUBLIC');
revoke usage on sequence public.kra74_probe_seq from public;
grant select(name) on public.kra74_probe to public;
select is(pg_temp.anon_public_grants(),1,'Control query sees a column grant to PUBLIC');
revoke select(name) on public.kra74_probe from public;
select is(pg_temp.anon_public_grants(),0,'Control query is back to 0 after revoke');
drop view public.kra74_probe_view;
drop sequence public.kra74_probe_seq;
drop table public.kra74_probe;

-- (c) authenticated zachowuje uprawnienia, których aplikacja używa (pełna lista dozwolonych od KRA-76:
-- 048_authenticated_grants.sql — tam też brak uprawnień do sekwencji i brak DELETE).
select ok(has_table_privilege('authenticated','public.'||t,'select,insert,update'),'authenticated keeps select, insert, update on '||t)
 from unnest(array['customers','locations','devices','installations']) t;
select ok(has_table_privilege('authenticated','public.'||t,'select'),'authenticated keeps select on '||t)
 from unnest(array['catalog_items','documents','maintenance_plans','offers','service_protocols','service_tickets','service_visits']) t;
select ok(not has_sequence_privilege('authenticated','public.audit_logs_id_seq','usage,select,update'),'authenticated has no privilege on audit sequence');
select ok(has_table_privilege('service_role','public.customers','select,insert,update,delete'),'service_role keeps DML on customers');

-- Dane: firma, pracownik, klient.
insert into public.organizations(id,name) values ('0a470000-0000-4000-8000-00000000000a','Firma anon');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
 ('a4700000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','anon-1@example.invalid','x',now(),now(),now());
insert into public.org_members(org_id,user_id,role) values
 ('0a470000-0000-4000-8000-00000000000a','a4700000-0000-4000-8000-000000000001','admin');
insert into public.customers(id,org_id,name,type) values
 ('c4700000-0000-4000-8000-000000000001','0a470000-0000-4000-8000-00000000000a','QZ7 Anon','company');

-- anon: tabele rdzenia odpowiadają błędem uprawnień zamiast pustej listy.
set local role anon;
select throws_ok(format('select count(*) from public.%I',t),'42501',null,'anon cannot read '||t)
 from unnest(array['customers','locations','devices','installations','documents','maintenance_plans','sales_inquiries','service_tickets','service_visits']) t;
select throws_ok($$insert into public.customers(org_id,name,type) values ('0a470000-0000-4000-8000-00000000000a','X','company')$$,'42501',null,'anon cannot insert customers');
select throws_ok($$update public.customers set name='X'$$,'42501',null,'anon cannot update customers');
select throws_ok($$delete from public.customers$$,'42501',null,'anon cannot delete customers');
select throws_ok($$select nextval('public.audit_logs_id_seq')$$,'42501',null,'anon cannot use audit sequence');

-- authenticated: odczyt przez RLS działa jak dotąd.
reset role;
select set_config('request.jwt.claim.sub','a4700000-0000-4000-8000-000000000001',true);
set local role authenticated;
select is((select count(*)::int from public.customers where id='c4700000-0000-4000-8000-000000000001'),1,'Staff reads customer through RLS policies');
select is((select count(*)::int from public.search_customers('QZ7',false)),1,'search_customers works for staff');

select * from finish();
rollback;
