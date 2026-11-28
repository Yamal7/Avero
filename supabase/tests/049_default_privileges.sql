-- KRA-77: domyślne uprawnienia schematu public dla obiektów tworzonych przez postgres (migracje) nie dają
-- roli authenticated niczego — ani na tabelach/widokach, ani na sekwencjach, ani EXECUTE na funkcjach.
-- Nowa tabela = dostęp tylko przez RPC, chyba że migracja nada grant jawnie (i wpisze go do listy w 048).
-- EXECUTE dla PUBLIC na nowych funkcjach zostaje (globalna wartość wbudowana Postgresa, patrz KRA-71),
-- dlatego nowa funkcja nadal wymaga `revoke all … from public, anon, authenticated`.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- (a) pg_default_acl dla postgres w public: authenticated i anon nie występują w żadnym typie obiektu.
select is(array(
 select d.defaclobjtype::text||' '||a.grantee::regrole::text||' '||a.privilege_type
 from pg_default_acl d cross join lateral aclexplode(d.defaclacl) a
 where d.defaclrole='postgres'::regrole and d.defaclnamespace='public'::regnamespace
 and a.grantee in ('authenticated'::regrole,'anon'::regrole)
 order by 1),array[]::text[],'Default privileges of postgres in public give authenticated and anon nothing');

-- service_role i avero_rpc zachowują swoje domyślne uprawnienia (tabele, sekwencje, funkcje).
create function pg_temp.default_privs(objtype "char", role regrole) returns text[] language sql stable as $$
 select coalesce(array_agg(a.privilege_type order by a.privilege_type),'{}') from pg_default_acl d
 cross join lateral aclexplode(d.defaclacl) a
 where d.defaclrole='postgres'::regrole and d.defaclnamespace='public'::regnamespace
 and d.defaclobjtype=objtype and a.grantee=role
$$;
select ok(pg_temp.default_privs('r','service_role') @> array['DELETE','INSERT','REFERENCES','SELECT','TRIGGER','TRUNCATE','UPDATE'],
 'service_role keeps default table privileges');
select is(pg_temp.default_privs('r','avero_rpc'),array['DELETE','INSERT','SELECT','UPDATE'],'avero_rpc keeps default table privileges');
select is(pg_temp.default_privs('S','service_role'),array['SELECT','UPDATE','USAGE'],'service_role keeps default sequence privileges');
select is(pg_temp.default_privs('S','avero_rpc'),array['SELECT','UPDATE','USAGE'],'avero_rpc keeps default sequence privileges');
select is(pg_temp.default_privs('f','service_role'),array['EXECUTE'],'service_role keeps default EXECUTE');
select is(pg_temp.default_privs('f','avero_rpc'),array['EXECUTE'],'avero_rpc keeps default EXECUTE');

-- (b) Nowa tabela, widok i sekwencja (także identity) w public nie dają authenticated żadnego uprawnienia.
create table public.kra77_probe(id bigint generated always as identity primary key, name text);
create view public.kra77_probe_view with (security_invoker=true) as select id from public.kra77_probe;
create sequence public.kra77_probe_seq;
select ok(not has_table_privilege('authenticated','public.kra77_probe','select,insert,update,delete,truncate,references,trigger')
 and not has_any_column_privilege('authenticated','public.kra77_probe','select,insert,update,references'),
 'New table gives authenticated nothing by default');
select ok(not has_table_privilege('authenticated','public.kra77_probe_view','select,insert,update,delete'),
 'New view gives authenticated nothing by default');
select ok(not has_sequence_privilege('authenticated','public.kra77_probe_seq','usage,select,update'),
 'New sequence gives authenticated nothing by default');
select ok(not has_sequence_privilege('authenticated',pg_get_serial_sequence('public.kra77_probe','id'),'usage,select,update'),
 'Identity sequence of a new table gives authenticated nothing by default');
select ok(has_table_privilege('service_role','public.kra77_probe','select,insert,update,delete,truncate'),'service_role keeps grants on a new table');
select ok(has_table_privilege('avero_rpc','public.kra77_probe','select,insert,update,delete'),'avero_rpc keeps grants on a new table');

-- (c) Nowa funkcja w public: authenticated nie ma własnego wpisu w ACL. Bez revoke wykonuje ją wyłącznie
-- przez PUBLIC (wartość wbudowana Postgresa, nie domyślne uprawnienia schematu); po `revoke all … from public`
-- authenticated nie może jej wykonać, a service_role i avero_rpc zachowują EXECUTE z domyślnych uprawnień.
create function public.kra77_probe_fn() returns int language sql as $$select 1$$;
select ok(not exists(select 1 from pg_proc p cross join lateral aclexplode(p.proacl) a
 where p.oid='public.kra77_probe_fn()'::regprocedure and a.grantee in ('authenticated'::regrole,'anon'::regrole)),
 'New function has no ACL entry for authenticated or anon');
select ok(exists(select 1 from pg_proc p cross join lateral aclexplode(p.proacl) a
 where p.oid='public.kra77_probe_fn()'::regprocedure and a.grantee=0 and a.privilege_type='EXECUTE'),
 'New function is still executable by PUBLIC (built-in default) until revoked');
revoke all on function public.kra77_probe_fn() from public;
select ok(not has_function_privilege('authenticated','public.kra77_probe_fn()','execute'),
 'After revoke from public a new function is closed to authenticated');
select ok(has_function_privilege('service_role','public.kra77_probe_fn()','execute')
 and has_function_privilege('avero_rpc','public.kra77_probe_fn()','execute'),'service_role and avero_rpc keep EXECUTE on a new function');
-- Jawny grant (wzorzec z CLAUDE.md) nadal działa.
grant execute on function public.kra77_probe_fn() to authenticated;
set local role authenticated;
select is(public.kra77_probe_fn(),1,'Explicit grant execute to authenticated works');
select throws_ok($$select count(*) from public.kra77_probe$$,'42501',null,'authenticated cannot read a new table without an explicit grant');
reset role;

-- (d) Funkcje w pg_temp nie podlegają domyślnym uprawnieniom schematu public: authenticated je wykonuje (PUBLIC).
create function pg_temp.kra77_temp_fn() returns int language sql as $$select 2$$;
set local role authenticated;
select is(pg_temp.kra77_temp_fn(),2,'pg_temp function stays executable by authenticated');
reset role;

drop function public.kra77_probe_fn();
drop sequence public.kra77_probe_seq;
drop view public.kra77_probe_view;
drop table public.kra77_probe;

select * from finish();
rollback;
