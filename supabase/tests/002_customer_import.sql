begin;
create extension if not exists pgtap with schema extensions;
select plan(19);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('11111111-1111-4111-8111-000000000011','00000000-0000-0000-0000-000000000000','authenticated','authenticated','import-staff1@test.local','x',now(),now(),now()),
('11111111-1111-4111-8111-000000000012','00000000-0000-0000-0000-000000000000','authenticated','authenticated','import-staff2@test.local','x',now(),now(),now()),
('11111111-1111-4111-8111-000000000013','00000000-0000-0000-0000-000000000000','authenticated','authenticated','import-client@test.local','x',now(),now(),now());
insert into public.staff_users(user_id) values('11111111-1111-4111-8111-000000000011'),('11111111-1111-4111-8111-000000000012');
insert into public.customers(name,email,archived_at) values('ARCHIVED IMPORT TEST','archived-import@example.test',now());

set local role anon;
select throws_ok($$select public.preview_customer_import('[]')$$,'42501',null,'Anonymous cannot preview imports');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000013',true);
select throws_ok($$select public.preview_customer_import('[]')$$,'42501',null,'Client cannot preview imports');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000011',true);
select throws_ok($$select public.preview_customer_import('[{"row_number":2,"name":"","type":"individual"}]')$$,'22023',null,'RPC independently validates forged rows');
select set_config('test.import_batch', (public.preview_customer_import('[
 {"row_number":2,"name":"IMPORT TEST A","email":"import-a@example.test","phone":"+48 500 100 201","type":"company"},
 {"row_number":3,"name":"  import   test a  ","email":"other@example.test","phone":null,"type":"individual"},
 {"row_number":4,"name":"IMPORT TEST C","email":null,"phone":"500-100-201","type":"individual"},
 {"row_number":5,"name":"IMPORT TEST D","email":"ARCHIVED-IMPORT@example.test","phone":null,"type":"individual"}
]')->>'batch_id'),true);
select is((select count(*)::int from public.customers where name='IMPORT TEST A'),0,'Preview does not write customers');
-- KRA-76: authenticated nie ma SELECT na customer_import_batches — stan partii sprawdzamy jako postgres.
reset role;
select is((select count(*)::int from public.customer_import_batches b, lateral jsonb_array_elements(b.rows) r where b.id=current_setting('test.import_batch')::uuid and r->>'status'='ready'),1,'Only one row ready');
select is((select count(*)::int from public.customer_import_batches b, lateral jsonb_array_elements(b.rows) r where b.id=current_setting('test.import_batch')::uuid and r->>'status'='duplicate'),3,'Detects name, phone and archived email duplicates');
set local role authenticated;
select throws_ok($$update public.customer_import_batches set rows='[]'$$,'42501',null,'Staff cannot forge staged rows directly');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000012',true);
select throws_ok($$select count(*) from public.customer_import_batches$$,'42501',null,'Other staff cannot read staged contacts');
select throws_ok($$select public.commit_customer_import(current_setting('test.import_batch')::uuid)$$,'P0001',null,'Other staff cannot commit this batch');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000013',true);
select throws_ok($$select public.commit_customer_import(current_setting('test.import_batch')::uuid)$$,'42501',null,'Client cannot commit imports');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000011',true);
select is((public.commit_customer_import(current_setting('test.import_batch')::uuid)->>'imported')::int,1,'Imports one ready row');
select is((public.commit_customer_import(current_setting('test.import_batch')::uuid)->>'skipped')::int,3,'Replay returns original skipped count');
select is((select count(*)::int from public.customers where name='IMPORT TEST A'),1,'Repeated commit does not duplicate customer');
reset role;
select is((select rows from public.customer_import_batches where id=current_setting('test.import_batch')::uuid),'[]'::jsonb,'Clears staged contact data after commit');
set local role authenticated;
select set_config('test.race_batch',(public.preview_customer_import('[{"row_number":2,"name":"LATE IMPORT TEST","email":null,"phone":null,"type":"individual"}]')->>'batch_id'),true);
insert into public.customers(name) values('LATE IMPORT TEST');
select is((public.commit_customer_import(current_setting('test.race_batch')::uuid)->>'imported')::int,0,'Rechecks duplicates added after preview');

-- A failing second insert must roll back the entire import, including audit entries.
reset role;
create function public.test_import_rejection() returns trigger language plpgsql as $$
begin
 if new.name='FAILIMPORT SECOND' then raise exception 'Test failure' using errcode='23514'; end if;
 return new;
end $$;
create trigger import_test_rejection before insert on public.customers for each row execute function public.test_import_rejection();
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000011',true);
select set_config('test.atomic_batch',(public.preview_customer_import('[{"row_number":2,"name":"ATOMIC IMPORT FIRST","email":null,"phone":null,"type":"individual"},{"row_number":3,"name":"FAILIMPORT SECOND","email":null,"phone":null,"type":"individual"}]')->>'batch_id'),true);
select throws_ok($$select public.commit_customer_import(current_setting('test.atomic_batch')::uuid)$$,'23514',null,'Failed batch raises error');
select is((select count(*)::int from public.customers where name='ATOMIC IMPORT FIRST'),0,'Failed batch rolls back earlier rows');
reset role;
select is((select count(*)::int from public.audit_logs where table_name='customers' and actor_id='11111111-1111-4111-8111-000000000011' and new_data->>'name'='IMPORT TEST A'),1,'Import retains staff actor in audit log');
update public.customer_import_batches set expires_at=now()-interval '1 minute' where id=current_setting('test.atomic_batch')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-000000000011',true);
select throws_ok($$select public.commit_customer_import(current_setting('test.atomic_batch')::uuid)$$,'P0001',null,'Expired preview cannot be committed');
select * from finish();
rollback;
