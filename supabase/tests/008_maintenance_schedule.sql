begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('a5000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','portal-office@test.local','x',now(),now(),now()),
('a5000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','portal-tech@test.local','x',now(),now(),now()),
('a5000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','portal-client-a@test.local','x',now(),now(),now()),
('a5000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','portal-client-b@test.local','x',now(),now(),now());
insert into public.staff_users(user_id,role) values('a5000000-0000-4000-8000-000000000001','office'),('a5000000-0000-4000-8000-000000000002','technician');
insert into public.customers(id,name,email) values
('c5000000-0000-4000-8000-000000000001','PORTAL A','a@example.test'),('c5000000-0000-4000-8000-000000000002','PORTAL B','b@example.test'),('c5000000-0000-4000-8000-000000000003','PORTAL C','c@example.test');
insert into public.customer_memberships(user_id,customer_id) values
('a5000000-0000-4000-8000-000000000003','c5000000-0000-4000-8000-000000000001'),('a5000000-0000-4000-8000-000000000003','c5000000-0000-4000-8000-000000000003'),('a5000000-0000-4000-8000-000000000004','c5000000-0000-4000-8000-000000000002');
insert into public.staff_customer_assignments(user_id,customer_id) values('a5000000-0000-4000-8000-000000000002','c5000000-0000-4000-8000-000000000001');
insert into public.locations(id,customer_id,address,city) values
('d5000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','Street A','Town A'),
('d5000000-0000-4000-8000-000000000002','c5000000-0000-4000-8000-000000000002','Street B','Town B'),
('d5000000-0000-4000-8000-000000000003','c5000000-0000-4000-8000-000000000003','Street C','Town C');
insert into public.installations(id,location_id,type) values
('e5000000-0000-4000-8000-000000000001','d5000000-0000-4000-8000-000000000001','Pump A'),
('e5000000-0000-4000-8000-000000000002','d5000000-0000-4000-8000-000000000002','Pump B'),
('e5000000-0000-4000-8000-000000000003','d5000000-0000-4000-8000-000000000003','Pump C');
insert into public.devices(installation_id,manufacturer,serial_number) values
('e5000000-0000-4000-8000-000000000001','Maker A','SERIAL-PORTAL-A'),('e5000000-0000-4000-8000-000000000002','Maker B','SERIAL-PORTAL-B');
insert into public.maintenance_plans(installation_id,interval_months,next_due_on) values('e5000000-0000-4000-8000-000000000001',12,'2026-12-01');
insert into public.documents(id,installation_id,storage_path,file_name,document_type,visible_to_customer) values
('f5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','portal/a/manual.pdf','Manual A.pdf','manual',true),
('f5000000-0000-4000-8000-000000000002','e5000000-0000-4000-8000-000000000001','portal/a/internal.pdf','SECRET INTERNAL.pdf','internal',false),
('f5000000-0000-4000-8000-000000000003','e5000000-0000-4000-8000-000000000002','portal/b/manual.pdf','Manual B.pdf','manual',true);
insert into public.service_tickets(id,installation_id,customer_id,subject,description,status) values
('b5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','Published A','Problem A','closed'),
('b5000000-0000-4000-8000-000000000002','e5000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','Draft A','Problem draft','in_progress'),
('b5000000-0000-4000-8000-000000000003','e5000000-0000-4000-8000-000000000002','c5000000-0000-4000-8000-000000000002','Published B','Problem B','closed');
insert into public.service_visits(id,ticket_id,scheduled_at,status,notes) values
('95000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001','2026-10-20T10:00Z','completed','Visible note A'),
('95000000-0000-4000-8000-000000000002','b5000000-0000-4000-8000-000000000002','2026-11-02T10:00Z','in_progress','Visible planned note'),
('95000000-0000-4000-8000-000000000003','b5000000-0000-4000-8000-000000000003','2026-10-20T12:00Z','completed','Visible note B');
insert into public.service_protocols(id,visit_id,status,diagnosis,work_performed,published_at,snapshot) values
('85000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000001','published','Diagnosis A','Work A',now(),'{"customer_name":"PORTAL A"}'),
('85000000-0000-4000-8000-000000000002','95000000-0000-4000-8000-000000000002','draft','SECRET DRAFT','',null,null),
('85000000-0000-4000-8000-000000000003','95000000-0000-4000-8000-000000000003','published','Diagnosis B','Work B',now(),'{"customer_name":"PORTAL B"}');


delete from public.maintenance_plans where installation_id in ('e5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000002','e5000000-0000-4000-8000-000000000003');
set local role anon;
select throws_ok($$select public.maintenance_schedule()$$,'42501',null,'Anonymous cannot enumerate maintenance');
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Zaległy przegląd',12,(now() at time zone 'Europe/Warsaw')::date-1,true,null)$$,'Office creates a plan');
select is(public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Zaległy przegląd',12,(now() at time zone 'Europe/Warsaw')::date-1,true,null)::text,'65000000-0000-4000-8000-000000000001','Retry returns original plan');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Changed retry',12,(now() at time zone 'Europe/Warsaw')::date-1,true,null)$$,'40001',null,'Creation retry cannot silently edit');
select public.save_maintenance_plan('65000000-0000-4000-8000-000000000002','e5000000-0000-4000-8000-000000000001','Dzisiaj',6,(now() at time zone 'Europe/Warsaw')::date,true,null);
select public.save_maintenance_plan('65000000-0000-4000-8000-000000000003','e5000000-0000-4000-8000-000000000002','Granica 30 dni',12,(now() at time zone 'Europe/Warsaw')::date+30,true,null);
select public.save_maintenance_plan('65000000-0000-4000-8000-000000000004','e5000000-0000-4000-8000-000000000001','Za 31 dni',12,(now() at time zone 'Europe/Warsaw')::date+31,true,null);
select public.save_maintenance_plan('65000000-0000-4000-8000-000000000005','e5000000-0000-4000-8000-000000000001','Wstrzymany',12,(now() at time zone 'Europe/Warsaw')::date-3,false,null);
select public.save_maintenance_plan('65000000-0000-4000-8000-000000000006','e5000000-0000-4000-8000-000000000003','Archiwalny klient',12,(now() at time zone 'Europe/Warsaw')::date-2,true,null);
reset role;
update public.customers set archived_at=now() where id='c5000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is((public.maintenance_schedule()->'summary'->>'overdue')::int,1,'Only active parent overdue plans counted');
select is((public.maintenance_schedule()->'summary'->>'upcoming')::int,2,'Today and exactly 30 days are upcoming');
select is((public.maintenance_schedule()->'summary'->>'active')::int,4,'Paused and archived parents excluded from active count');
select is((public.maintenance_schedule()->'summary'->>'paused')::int,1,'Paused plans counted separately');
select is((public.maintenance_schedule()->>'total')::int,3,'Attention includes overdue and upcoming only');
select is((public.maintenance_schedule('','overdue')->>'total')::int,1,'Overdue filter works');
select is((public.maintenance_schedule('','all')->>'total')::int,6,'All includes later, paused and historical plans');
select is((public.maintenance_schedule('','paused')->>'total')::int,1,'Paused filter works');
select is((public.maintenance_schedule('PORTAL B','all')->>'total')::int,1,'Search is scoped to matching customers');
select is((public.maintenance_schedule('','all',1,'e5000000-0000-4000-8000-000000000001')->>'total')::int,4,'Installation filter works');
select is(public.maintenance_schedule('','all')->'plans'->0->>'title','Zaległy przegląd','Actionable earliest plan comes first');
select throws_ok($$select public.maintenance_schedule('','all',0)$$,'22023',null,'Invalid pagination rejected');
select throws_ok($$select public.maintenance_schedule(repeat('a',201))$$,'22023',null,'Unbounded searches rejected');
select throws_ok($$insert into public.maintenance_plans(installation_id,interval_months,next_due_on) values('e5000000-0000-4000-8000-000000000001',12,current_date)$$,'42501',null,'Direct writes cannot bypass guarded RPC');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000007','e5000000-0000-4000-8000-000000000001','Invalid',0,current_date,true,null)$$,'22023',null,'Invalid cycle rejected');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000007','e5000000-0000-4000-8000-000000000001','Invalid',12,'infinity',true,null)$$,'22023',null,'Unbounded date rejected');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000006','e5000000-0000-4000-8000-000000000003','Archiwalny klient',12,current_date,true,0)$$,'42501',null,'Archived customer plans are readonly');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000002','Move',12,current_date,true,0)$$,'42501',null,'Plan cannot be moved to another installation');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000099','e5000000-0000-4000-8000-000000000001','Missing',12,current_date,true,0)$$,'42501',null,'Missing edit cannot become a create');
select lives_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Zmieniony przegląd',6,(now() at time zone 'Europe/Warsaw')::date+90,true,0)$$,'Office edits cycle and next date');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Stale',12,current_date,false,0)$$,'40001',null,'Stale edit cannot overwrite');
select lives_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Zmieniony przegląd',6,(now() at time zone 'Europe/Warsaw')::date+90,false,1)$$,'Office pauses plan');
select is((public.maintenance_schedule()->'summary'->>'overdue')::int,0,'Changed plan no longer counted as overdue');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000002',true);
select is((public.maintenance_schedule('','all')->>'total')::int,4,'Technician sees assigned customer only');
select is((public.maintenance_schedule('PORTAL B','all')->>'total')::int,0,'Technician search cannot reveal foreign customer');
select throws_ok($$select public.maintenance_schedule('','all',1,'e5000000-0000-4000-8000-000000000002')$$,'42501',null,'Forged technician installation denied');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000007','e5000000-0000-4000-8000-000000000001','Tech write',12,current_date,true,null)$$,'42501',null,'Technician cannot change plans');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.maintenance_schedule()$$,'42501',null,'Client cannot enumerate company schedule');
select is(public.portal_installation('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001')->'maintenance'->0->>'title','Dzisiaj','Portal shows active plans and readable title');
select is(jsonb_array_length(public.portal_installation('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001')->'maintenance'),2,'Paused plans disappear from portal');
select is(public.portal_overview('c5000000-0000-4000-8000-000000000001')->>'next_due_on',(now() at time zone 'Europe/Warsaw')::date::text,'Portal overview uses current active next date');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000007','e5000000-0000-4000-8000-000000000001','Client write',12,current_date,true,null)$$,'42501',null,'Client cannot change schedule');
reset role;
select is((select count(*)::int from public.audit_logs where table_name='maintenance_plans' and row_id='65000000-0000-4000-8000-000000000001'),3,'Create, edit and pause are audited, retry is not duplicated');
insert into public.maintenance_plans(installation_id,title,interval_months,next_due_on,active) select 'e5000000-0000-4000-8000-000000000001','Paginacja '||i,12,current_date,false from generate_series(1,25)i;
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is(jsonb_array_length(public.maintenance_schedule('Paginacja','all',1)->'plans'),20,'List pages are bounded');
select is(jsonb_array_length(public.maintenance_schedule('Paginacja','all',2)->'plans'),5,'Next page returns remaining records');
set local timezone='Pacific/Honolulu';
select is(public.maintenance_schedule()->>'today',(now() at time zone 'Europe/Warsaw')::date::text,'Classification uses Warsaw rather than session timezone');
reset role;
insert into public.account_access(user_id,blocked) values('a5000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.maintenance_schedule()$$,'42501',null,'Blocked office loses schedule access');
select throws_ok($$select public.save_maintenance_plan('65000000-0000-4000-8000-000000000007','e5000000-0000-4000-8000-000000000001','Blocked write',12,current_date,true,null)$$,'42501',null,'Blocked office cannot save with old session');
select * from finish();
rollback;
