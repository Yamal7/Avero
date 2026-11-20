begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

-- Fixtures: auth.users insert requires local Supabase auth schema (supabase db reset).
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
 email_confirmed_at, created_at, updated_at)
values
('11111111-1111-4111-8111-111111111111','00000000-0000-0000-0000-000000000000','authenticated','authenticated','a@test.local','x',now(),now(),now()),
('22222222-2222-4222-8222-222222222222','00000000-0000-0000-0000-000000000000','authenticated','authenticated','b@test.local','x',now(),now(),now()),
('33333333-3333-4333-8333-333333333333','00000000-0000-0000-0000-000000000000','authenticated','authenticated','staff@test.local','x',now(),now(),now());
insert into public.customers(id,name) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Customer A'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Customer B');
insert into public.customer_memberships(user_id,customer_id) values
('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.staff_users(user_id) values ('33333333-3333-4333-8333-333333333333');
insert into public.locations(id,customer_id,address,city) values
('a0000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Street A','Town'),
('b0000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Street B','Town');
insert into public.installations(id,location_id,type) values
('a1000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001','heat_pump'),
('b1000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001','heat_pump');
insert into public.documents(id,installation_id,storage_path,file_name,document_type,visible_to_customer) values
('a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001/public.pdf','public.pdf','manual',true),
('a2000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001/private.pdf','private.pdf','internal',false);

insert into public.devices(installation_id,manufacturer,serial_number) values
('a1000000-0000-4000-8000-000000000001','Test','SERIAL-A'),
('b1000000-0000-4000-8000-000000000001','Test','SERIAL-B');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select is((select count(*)::int from public.customers),1,'A sees only own customer');
select is((select count(*)::int from public.search_customers('',false)),1,'Search respects customer isolation');
select is((select count(*)::int from public.search_customers('SERIAL-B',false)),0,'Search hides other customer serial');
select is((select count(*)::int from public.search_customers('serial-a',false)),1,'Search finds own serial case-insensitively');
select is((select count(*)::int from public.search_customers('Street A',false)),1,'Search matches address');
select is((select count(*)::int from public.search_customers('%',false)),0,'Search treats wildcards literally');
select is((select count(*)::int from public.locations),1,'A sees only own location');
select is((select count(*)::int from public.installations),1,'A sees only own installation');
select is((select count(*)::int from public.documents),1,'A sees only public document');
select throws_ok($$insert into public.customers(name) values('Intruder')$$,'42501',null,'Client cannot create customer');
select throws_ok($$select public.create_service_ticket('b1000000-0000-4000-8000-000000000001','Wrong','wrong','normal')$$,'42501',null,'Reject unowned installation');
select lives_ok($$select public.create_service_ticket('a1000000-0000-4000-8000-000000000001','Broken','broken','normal')$$,'A creates own ticket through guarded RPC');
select ok(not has_table_privilege('authenticated','public.staff_users','SELECT'),'No staff table access');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select is((select count(*)::int from public.customers),1,'B sees only own customer');
select is((select count(*)::int from public.service_tickets),0,'B cannot see A ticket');
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select is((select count(*)::int from public.customers where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),2,'Staff sees both customers');
select is((select count(*)::int from public.documents where installation_id='a1000000-0000-4000-8000-000000000001'),2,'Staff sees private documents');
update public.customers set archived_at=now() where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is((select count(*)::int from public.search_customers('',true)),1,'Archive filter finds archived customer');
reset role;
select is((select count(*)::int from public.audit_logs where table_name='customers' and action='UPDATE' and row_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),1,'Archive writes audit log');
select * from finish();
rollback;
