-- M0.1 (KRA-27): straż wielofirmowości. Pilnuje, żeby każda nowa tabela i funkcja trafiała pod izolację firm.
-- Wyjątki są jawne i opisane w docs/STATUS.md › M0.1 › Wyjątki. Nowa tabela lub funkcja spoza listy = czerwony test.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Tabele bez org_id: same organizacje, wybór aktywnej firmy, globalna pamięć geokodowania i ustawienia osobiste konta.
create temp table guard_table_exceptions(name text primary key) on commit drop;
insert into guard_table_exceptions values
 ('organizations'),('org_active'),('geocode_cache'),('user_preferences'),('notification_preferences'),('notification_email_preferences');

-- Funkcje security definer, które celowo działają jako postgres (widzą wszystkie firmy):
-- wybór firmy, worker poczty (rola service_role, bez użytkownika), przyjęcie zaproszenia (zanim użytkownik należy do firmy).
create temp table guard_function_exceptions(name text primary key) on commit drop;
insert into guard_function_exceptions values
 ('current_org_id'),('org_default'),('my_organizations'),('set_active_org'),('account_enabled'),
 ('accept_access_invitation'),('read_my_invitation'),
 ('prepare_notification_emails'),('claim_notification_email'),('bind_notification_email'),('finish_notification_email'),
 ('notification_email_checks'),('finish_notification_email_check'),('assert_email_worker'),('email_job_eligible');

select ok(exists(select 1 from pg_roles where rolname='avero_rpc' and not rolbypassrls and not rolsuper and not rolcanlogin),
 'avero_rpc exists without BYPASSRLS, superuser or login');
select ok(not exists(select 1 from pg_auth_members m join pg_roles r on r.oid=m.roleid
 where m.member='avero_rpc'::regrole and r.rolname in ('postgres','service_role','supabase_admin')),
 'avero_rpc does not inherit table-owner or bypass roles');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p')
 and c.relname not in (select name from guard_table_exceptions)
 and not exists(select 1 from pg_attribute a where a.attrelid=c.oid and a.attname='org_id' and a.attnotnull and not a.attisdropped)
 order by 1),array[]::text[],'Every data table has org_id not null');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p')
 and c.relname not in (select name from guard_table_exceptions)
 and not exists(select 1 from pg_constraint k where k.conrelid=c.oid and k.contype='f' and k.confrelid='public.organizations'::regclass)
 order by 1),array[]::text[],'Every org_id references organizations');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p')
 and c.relname not in (select name from guard_table_exceptions)
 and not exists(select 1 from pg_policies p where p.schemaname='public' and p.tablename=c.relname and p.permissive='RESTRICTIVE'
  and p.cmd='ALL' and p.roles @> array['public']::name[] and p.qual like '%org_id = ( SELECT current_org_id()%' and p.with_check like '%org_id = ( SELECT current_org_id()%')
 order by 1),array[]::text[],'Every data table has the restrictive org policy');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p') and not c.relrowsecurity order by 1),
 array[]::text[],'RLS is enabled on every table');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p')
 and not exists(select 1 from pg_policies p where p.schemaname='public' and p.tablename=c.relname and p.roles @> array['avero_rpc']::name[])
 order by 1),array[]::text[],'Every table has an explicit avero_rpc policy');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v')
 and not has_table_privilege('avero_rpc',c.oid,'SELECT,INSERT,UPDATE,DELETE') order by 1),
 array[]::text[],'avero_rpc may read and write every table used by RPC');

select is(array(
 select c.relname::text from pg_class c
 where c.relnamespace='public'::regnamespace and c.relkind in ('r','p','v')
 and c.relname in ('organizations','org_active','org_members','staff_users')
 and (has_table_privilege('authenticated',c.oid,'SELECT') or has_table_privilege('anon',c.oid,'SELECT')) order by 1),
 array[]::text[],'Membership tables are not readable directly');

select is(array(
 select p.oid::regprocedure::text from pg_proc p
 where p.pronamespace='public'::regnamespace and p.prosecdef and p.prorettype<>'trigger'::regtype
 and p.proname not in (select name from guard_function_exceptions)
 and pg_get_userbyid(p.proowner)<>'avero_rpc' order by 1),array[]::text[],'Every security definer RPC is owned by avero_rpc');

select is(array(
 select p.oid::regprocedure::text from pg_proc p
 where p.pronamespace='public'::regnamespace and p.prosecdef
 and (p.proname in (select name from guard_function_exceptions) or p.prorettype='trigger'::regtype)
 and pg_get_userbyid(p.proowner)<>'postgres' order by 1),array[]::text[],'Documented exceptions and trigger functions stay with postgres');

select is(array(
 select p.oid::regprocedure::text from pg_proc p
 where p.pronamespace='public'::regnamespace and p.prosecdef
 and not exists(select 1 from unnest(coalesce(p.proconfig,'{}')) c where c='search_path=""') order by 1),
 array[]::text[],'Every security definer function pins search_path to empty');

select is(array(select name from guard_function_exceptions g where not exists(select 1 from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=g.name) order by 1),
 array[]::text[],'Exception list names existing functions only');

select * from finish();
rollback;
