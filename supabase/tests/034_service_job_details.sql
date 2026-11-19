begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('ac000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','job-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,4) n;
insert into public.staff_users(user_id,role) values('ac000000-0000-4000-8000-000000000001','office'),('ac000000-0000-4000-8000-000000000002','technician'),('ac000000-0000-4000-8000-000000000003','technician');
insert into public.customers(id,name) values('cc000000-0000-4000-8000-000000000001','Klient Zlecenie');
insert into public.customer_memberships(user_id,customer_id) values('ac000000-0000-4000-8000-000000000004','cc000000-0000-4000-8000-000000000001');
insert into public.staff_customer_assignments(user_id,customer_id) values('ac000000-0000-4000-8000-000000000002','cc000000-0000-4000-8000-000000000001'),('ac000000-0000-4000-8000-000000000003','cc000000-0000-4000-8000-000000000001');
insert into public.locations(id,customer_id,address,city) values('dc000000-0000-4000-8000-000000000001','cc000000-0000-4000-8000-000000000001','Starowiejska 12','Gdynia');
insert into public.installations(id,location_id,type) values('ec000000-0000-4000-8000-000000000001','dc000000-0000-4000-8000-000000000001','Lodziarka');
insert into public.service_tickets(id,installation_id,customer_id,subject,description,status,assigned_to) values
 ('fc000000-0000-4000-8000-000000000001','ec000000-0000-4000-8000-000000000001','cc000000-0000-4000-8000-000000000001','Brak chłodzenia','Lody miękną','in_progress','ac000000-0000-4000-8000-000000000002'),
 ('fc000000-0000-4000-8000-000000000002','ec000000-0000-4000-8000-000000000001','cc000000-0000-4000-8000-000000000001','Zamknięte','Stare','closed','ac000000-0000-4000-8000-000000000002');
set local role authenticated;

select set_config('request.jwt.claim.sub','ac000000-0000-4000-8000-000000000002',true);
select is(jsonb_array_length(public.save_service_measurement('fc000000-0000-4000-8000-000000000001','1c000000-0000-4000-8000-000000000001','Temperatura w komorze','−22 … −18 °C','−8 °C','',true)->'measurements'),1,'Assigned technician records a measurement');
select is(public.save_service_measurement('fc000000-0000-4000-8000-000000000001','1c000000-0000-4000-8000-000000000001','Temperatura w komorze','−22 … −18 °C','−8 °C','−19 °C',true)->'measurements'->0->>'after','−19 °C','Upsert keeps one row and stores after-repair value');
select throws_ok($$select public.save_service_measurement('fc000000-0000-4000-8000-000000000001','1c000000-0000-4000-8000-000000000002','','','','',false)$$,'22023',null,'Empty parameter refused');
select is(public.save_service_material('fc000000-0000-4000-8000-000000000001','2c000000-0000-4000-8000-000000000001','Silnik wentylatora',1,'szt.','MM/2026/11/052','Bus KN',18600)->'materials'->0->>'netCents','18600','Technician records a material');
select throws_ok($$select public.save_service_material('fc000000-0000-4000-8000-000000000001','2c000000-0000-4000-8000-000000000002','Łopatka',0,'szt.','','',100)$$,'22023',null,'Zero quantity refused');
select throws_ok($$select public.save_service_material('fc000000-0000-4000-8000-000000000002','2c000000-0000-4000-8000-000000000003','Łopatka',1,'szt.','','',100)$$,'40001',null,'Closed ticket refuses materials');
select is(jsonb_array_length(public.add_service_ticket_comment('fc000000-0000-4000-8000-000000000001','3c000000-0000-4000-8000-000000000001','Będę ok. 9:40.')->'comments'),1,'Technician comments');
select is(jsonb_array_length(public.add_service_ticket_comment('fc000000-0000-4000-8000-000000000001','3c000000-0000-4000-8000-000000000001','Będę ok. 9:40.')->'comments'),1,'Comment retry is idempotent');
select throws_ok($$select public.add_service_ticket_comment('fc000000-0000-4000-8000-000000000001','3c000000-0000-4000-8000-000000000001','Inaczej')$$,'22023',null,'Reused comment id refused');
select is(jsonb_array_length(public.delete_service_measurement('fc000000-0000-4000-8000-000000000001','1c000000-0000-4000-8000-000000000001')->'measurements'),0,'Measurement deleted');

select set_config('request.jwt.claim.sub','ac000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.service_job_details('fc000000-0000-4000-8000-000000000001')$$,'42501',null,'Unassigned technician cannot read');
select throws_ok($$select public.add_service_ticket_comment('fc000000-0000-4000-8000-000000000001','3c000000-0000-4000-8000-000000000002','x')$$,'42501',null,'Unassigned technician cannot comment');

select set_config('request.jwt.claim.sub','ac000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.service_job_details('fc000000-0000-4000-8000-000000000001')$$,'42501',null,'Client cannot read internal job details');

select set_config('request.jwt.claim.sub','ac000000-0000-4000-8000-000000000001',true);
select is(jsonb_array_length(public.service_job_details('fc000000-0000-4000-8000-000000000001')->'materials'),1,'Office reads materials');
select is(public.service_job_details('fc000000-0000-4000-8000-000000000001')->'comments'->0->>'authorLabel','job-2@example.invalid','Comment carries author label');

reset role;
select ok(not has_table_privilege('authenticated','public.service_materials','select'),'No direct table access');
select * from finish();
rollback;
