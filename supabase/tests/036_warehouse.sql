begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('ae000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stock-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,4) n;
insert into public.staff_users(user_id,role) values('ae000000-0000-4000-8000-000000000001','office'),('ae000000-0000-4000-8000-000000000002','technician'),('ae000000-0000-4000-8000-000000000003','technician');
insert into public.customers(id,name) values('ce000000-0000-4000-8000-000000000001','Klient Magazyn');
insert into public.staff_customer_assignments(user_id,customer_id) values('ae000000-0000-4000-8000-000000000002','ce000000-0000-4000-8000-000000000001');
insert into public.locations(id,customer_id,address,city) values('de000000-0000-4000-8000-000000000001','ce000000-0000-4000-8000-000000000001','Polna 1','Rumia');
insert into public.installations(id,location_id,type) values('ee000000-0000-4000-8000-000000000001','de000000-0000-4000-8000-000000000001','Split');
insert into public.service_tickets(id,installation_id,customer_id,subject,description,status,assigned_to) values('fe000000-0000-4000-8000-000000000001','ee000000-0000-4000-8000-000000000001','ce000000-0000-4000-8000-000000000001','Montaż','Opis','in_progress','ae000000-0000-4000-8000-000000000002');
create function pg_temp.item() returns jsonb language sql as $$select i from jsonb_array_elements(public.stock_overview()->'items') i where i->>'id'='1e000000-0000-4000-8000-000000000001'$$;
create function pg_temp.lvl(loc text) returns numeric language sql as $$select coalesce((pg_temp.item()->'levels'->>loc)::numeric,0)$$;
set local role authenticated;

select set_config('request.jwt.claim.sub','ae000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.save_stock_item('1e000000-0000-4000-8000-000000000001','CZ-R32T','R32','refrigerant','kg',20,'C-01','HFC',675,'butla 9 kg')$$,'Office creates an item');
select throws_ok($$select public.save_stock_item('1e000000-0000-4000-8000-000000000002','cz-zle','X','refrigerant','kg',0,'','',null,'')$$,'22023',null,'Lower-case code refused');
select lives_ok($$select public.save_stock_vehicle('2e000000-0000-4000-8000-000000000001','ae000000-0000-4000-8000-000000000002','Bus Technik 2','GD 1234')$$,'Office adds a van');
select alike(public.post_stock_document('3e000000-0000-4000-8000-000000000001','PZ',null,'5e000000-0000-4000-8000-000000000001',null,'Hurtownia','',
 '[{"itemId":"1e000000-0000-4000-8000-000000000001","quantity":9}]')->>'number','PZ/%/001','Receipt gets a PZ number');
select is(pg_temp.lvl('5e000000-0000-4000-8000-000000000001'),9.000,'Receipt adds stock');
select lives_ok($$select public.post_stock_document('3e000000-0000-4000-8000-000000000002','MM','5e000000-0000-4000-8000-000000000001','2e000000-0000-4000-8000-000000000001',null,'','','[{"itemId":"1e000000-0000-4000-8000-000000000001","quantity":3}]')$$,'Transfer to the van');
select is(pg_temp.lvl('2e000000-0000-4000-8000-000000000001'),3.000,'Van holds transferred stock');
select throws_ok($$select public.post_stock_document('3e000000-0000-4000-8000-000000000003','MM','5e000000-0000-4000-8000-000000000001','2e000000-0000-4000-8000-000000000001',null,'','','[{"itemId":"1e000000-0000-4000-8000-000000000001","quantity":50}]')$$,'23514',null,'Stock cannot go negative');
select lives_ok($$select public.reserve_stock('4e000000-0000-4000-8000-000000000001','1e000000-0000-4000-8000-000000000001','fe000000-0000-4000-8000-000000000001',0.5)$$,'Office reserves for a ticket');
select is((pg_temp.item()->>'reserved')::numeric,0.5,'Overview shows reservation');

select set_config('request.jwt.claim.sub','ae000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.post_stock_document('3e000000-0000-4000-8000-000000000004','RW','5e000000-0000-4000-8000-000000000001',null,'fe000000-0000-4000-8000-000000000001','','','[{"itemId":"1e000000-0000-4000-8000-000000000001","quantity":1}]')$$,'42501',null,'Technician cannot issue from main warehouse');
select alike(public.post_stock_document('3e000000-0000-4000-8000-000000000005','RW','2e000000-0000-4000-8000-000000000001',null,'fe000000-0000-4000-8000-000000000001','','',
 '[{"itemId":"1e000000-0000-4000-8000-000000000001","massBefore":14.62,"massAfter":14.32,"operation":"topup"}]')->>'number','RW/%/001','Technician issues from own van by weighing');
select is(pg_temp.lvl('2e000000-0000-4000-8000-000000000001'),2.700,'Weighed difference leaves the van');
select is(public.post_stock_document('3e000000-0000-4000-8000-000000000005','RW','2e000000-0000-4000-8000-000000000001',null,'fe000000-0000-4000-8000-000000000001','','','[{"itemId":"1e000000-0000-4000-8000-000000000001","quantity":1}]')->>'number',
 public.post_stock_document('3e000000-0000-4000-8000-000000000005','RW','2e000000-0000-4000-8000-000000000001',null,'fe000000-0000-4000-8000-000000000001','','','[]')->>'number','Retry with the same id is idempotent');
select alike(public.service_job_details('fe000000-0000-4000-8000-000000000001')->'materials'->0->>'document','RW/%/001','Issue appears in the job materials');
select throws_ok($$select public.post_stock_document('3e000000-0000-4000-8000-000000000006','PZ',null,'5e000000-0000-4000-8000-000000000001',null,'','','[{"itemId":"1e000000-0000-4000-8000-000000000001","quantity":1}]')$$,'42501',null,'Technician cannot post receipts');

select set_config('request.jwt.claim.sub','ae000000-0000-4000-8000-000000000001',true);
select is((pg_temp.item()->>'reserved')::numeric,0::numeric,'Issue closes the reservation');
select is(jsonb_array_length(public.stock_item_moves('1e000000-0000-4000-8000-000000000001')),4,'Item history lists all moves');

select set_config('request.jwt.claim.sub','ae000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.stock_overview()$$,'42501',null,'Non-staff cannot read stock');
reset role;
select ok(not has_table_privilege('authenticated','public.stock_moves','select'),'No direct table access');
select * from finish();
rollback;
