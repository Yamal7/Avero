-- KRA-71: granty ról API. Rolom anon i authenticated nie przysługuje TRUNCATE / REFERENCES / TRIGGER
-- na żadnej tabeli ani widoku w public, a anon (i PUBLIC) nie wykonuje żadnej funkcji z public.
-- Nowa tabela lub funkcja, która dostanie te uprawnienia (np. z domyślnych grantów), = czerwony test.
-- Dzisiejsze zachowanie anon się nie zmienia: select z tabel rdzenia zwraca 0 wierszy lub błąd uprawnień.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Funkcje z public, które anon może świadomie wykonać. Pusta: żadna droga bez sesji nie woła RPC
-- (logowanie idzie przez Supabase Auth, zaproszenie woła RPC dopiero po ustawieniu sesji, worker poczty to service_role).
create temp table anon_function_exceptions(name text primary key) on commit drop;

-- (a) TRUNCATE / REFERENCES / TRIGGER
select is(array(
 select c.relname::text||' '||r.role||' '||p.priv
 from pg_class c
 cross join (values ('anon'),('authenticated')) r(role)
 cross join (values ('truncate'),('references'),('trigger')) p(priv)
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v','m','f')
 and has_table_privilege(r.role,c.oid,p.priv)
 order by 1),array[]::text[],'No public table grants TRUNCATE, REFERENCES or TRIGGER to anon or authenticated');

-- (b) EXECUTE dla anon i PUBLIC
select is(array(
 select p.oid::regprocedure::text from pg_proc p
 where p.pronamespace='public'::regnamespace
 and has_function_privilege('anon',p.oid,'execute')
 and p.proname not in (select name from anon_function_exceptions)
 order by 1),array[]::text[],'anon cannot execute any public function outside the exception list');
select is(array(
 select p.oid::regprocedure::text from pg_proc p
 where p.pronamespace='public'::regnamespace
 and (p.proacl is null or exists(select 1 from aclexplode(p.proacl) a where a.grantee=0 and a.privilege_type='EXECUTE'))
 order by 1),array[]::text[],'No public function is executable by PUBLIC');

-- (b2) Domyślne uprawnienia: obiekt utworzony przez postgres w public nie dostaje tych grantów sam z siebie.
create table public.kra71_probe(id int primary key);
create function public.kra71_probe_fn() returns int language sql as $$select 1$$;
select ok(not has_table_privilege('authenticated','public.kra71_probe','truncate')
 and not has_table_privilege('anon','public.kra71_probe','truncate')
 and not has_table_privilege('authenticated','public.kra71_probe','references')
 and not has_table_privilege('authenticated','public.kra71_probe','trigger'),
 'New table gets no TRUNCATE, REFERENCES or TRIGGER for API roles by default');
select ok(has_table_privilege('service_role','public.kra71_probe','truncate'),'service_role keeps its default table grants');
select ok(not has_function_privilege('anon','public.kra71_probe_fn()','execute'),'New function is not executable by anon by default');
select ok(not exists(select 1 from pg_proc p, aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
 where p.oid='public.kra71_probe_fn()'::regprocedure and a.grantee=0),'New function is not executable by PUBLIC by default');
select ok(has_function_privilege('authenticated','public.kra71_probe_fn()','execute'),'authenticated keeps default EXECUTE on new functions');
drop function public.kra71_probe_fn();
drop table public.kra71_probe;

-- (d) Funkcje, których używa aplikacja, nadal działają dla swoich ról.
select ok(has_function_privilege('authenticated',f,'execute'),'authenticated executes '||f) from unnest(array[
 'public.is_staff()','public.can_access_customer(uuid)','public.customer_for_installation(uuid)','public.customer_for_ticket(uuid)',
 'public.search_customers(text,boolean)','public.current_access()','public.read_my_invitation(uuid)',
 'public.accept_access_invitation(uuid)','public.valid_bank_account(text)']) f;
select ok(has_function_privilege('service_role',f,'execute'),'service_role executes '||f) from unnest(array[
 'public.prepare_notification_emails(text[])','public.claim_notification_email(text,text,text,text[])']) f;
select ok(has_function_privilege('avero_rpc','public.valid_bank_account(text)','execute'),'avero_rpc executes valid_bank_account');

-- Dane: firma, pracownik, klient z lokalizacją.
insert into public.organizations(id,name) values ('0a460000-0000-4000-8000-00000000000a','Firma granty');
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
 ('a4600000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','grants-1@example.invalid','x',now(),now(),now());
insert into public.org_members(org_id,user_id,role) values
 ('0a460000-0000-4000-8000-00000000000a','a4600000-0000-4000-8000-000000000001','admin');
insert into public.customers(id,org_id,name,type) values
 ('c4600000-0000-4000-8000-000000000001','0a460000-0000-4000-8000-00000000000a','QZ6 Granty','company');
insert into public.locations(id,org_id,customer_id,address,city) values
 ('d4600000-0000-4000-8000-000000000001','0a460000-0000-4000-8000-00000000000a','c4600000-0000-4000-8000-000000000001','Polna 6','Rumia');

-- (c) anon: select z tabel rdzenia daje 0 wierszy (polityki nie wołają odebranych funkcji),
-- tabele bez grantu dla anon nadal odpowiadają błędem uprawnień, RPC nadal odmawia.
set local role anon;
select is((select count(*)::int from public.customers),0,'anon sees no customers');
select is((select count(*)::int from public.locations),0,'anon sees no locations');
select is((select count(*)::int from public.devices),0,'anon sees no devices');
select is((select count(*)::int from public.installations),0,'anon sees no installations');
select is((select count(*)::int from public.documents),0,'anon sees no documents');
select is((select count(*)::int from public.maintenance_plans),0,'anon sees no maintenance plans');
select is((select count(*)::int from public.sales_inquiries),0,'anon sees no sales inquiries');
select is((select count(*)::int from public.service_tickets),0,'anon sees no service tickets');
select is((select count(*)::int from public.service_visits),0,'anon sees no service visits');
select throws_ok($$select count(*) from public.offers$$,'42501',null,'anon has no access to offers');
select throws_ok($$select count(*) from public.offer_publications$$,'42501',null,'anon has no access to offer publications');
select throws_ok($$truncate public.customers$$,'42501',null,'anon cannot truncate customers');
select throws_ok($$select public.is_staff()$$,'42501',null,'anon cannot call is_staff');
select throws_ok($$select public.can_access_customer('c4600000-0000-4000-8000-000000000001')$$,'42501',null,'anon cannot call can_access_customer');
select throws_ok($$select * from public.search_customers('',false)$$,'42501',null,'anon cannot search customers');
select throws_ok($$select public.read_my_invitation('a4600000-0000-4000-8000-000000000009')$$,'42501',null,'anon cannot read invitations');

-- (d) authenticated: polityki i RPC z is_staff / can_access_customer działają jak dotąd.
reset role;
select set_config('request.jwt.claim.sub','a4600000-0000-4000-8000-000000000001',true);
set local role authenticated;
select throws_ok($$truncate public.customers$$,'42501',null,'authenticated cannot truncate customers');
select ok(public.is_staff(),'Staff user is staff');
select ok(public.can_access_customer('c4600000-0000-4000-8000-000000000001'),'Staff user accesses own customer');
select is((select count(*)::int from public.search_customers('QZ6',false)),1,'search_customers works for staff');
select is((select count(*)::int from public.customers where id='c4600000-0000-4000-8000-000000000001'),1,'Staff reads customer through RLS policies');
select is((select count(*)::int from public.locations where customer_id='c4600000-0000-4000-8000-000000000001'),1,'Staff reads location through RLS policies');

select * from finish();
rollback;
