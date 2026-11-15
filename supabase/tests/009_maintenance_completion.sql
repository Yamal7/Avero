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


update public.service_visits set completed_at='2024-01-31T12:00Z' where id='95000000-0000-4000-8000-000000000001';
update public.service_visits set completed_at='2024-01-31T12:00Z' where id='95000000-0000-4000-8000-000000000003';
insert into public.service_visits(id,ticket_id,status,completed_at) values
('95000000-0000-4000-8000-000000000004','b5000000-0000-4000-8000-000000000001','completed','2024-02-29T12:00Z'),
('95000000-0000-4000-8000-000000000005','b5000000-0000-4000-8000-000000000001','completed','2023-12-31T23:30Z'),
('95000000-0000-4000-8000-000000000006','b5000000-0000-4000-8000-000000000001','completed',now()+interval '1 day');
insert into public.service_protocols(id,visit_id,status,published_at,snapshot) values
('85000000-0000-4000-8000-000000000004','95000000-0000-4000-8000-000000000004','published',now(),'{"customer_name":"PORTAL A"}'),
('85000000-0000-4000-8000-000000000005','95000000-0000-4000-8000-000000000005','published',now(),'{"customer_name":"PORTAL A"}'),
('85000000-0000-4000-8000-000000000006','95000000-0000-4000-8000-000000000006','published',now(),'{"customer_name":"PORTAL A"}');
insert into public.maintenance_plans(id,installation_id,title,interval_months,next_due_on) values
('66000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Original plan',1,'2024-01-10'),
('66000000-0000-4000-8000-000000000002','e5000000-0000-4000-8000-000000000001','Second plan',6,'2024-01-10'),
('66000000-0000-4000-8000-000000000003','e5000000-0000-4000-8000-000000000001','Atomic plan',6,'2024-01-10');
set local role anon;
select throws_ok($$select public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')$$,'42501',null,'Anonymous cannot access plan detail');
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->>'canComplete')::boolean,true,'Office may confirm an active plan');
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->'protocols'->>'total')::int,3,'Only published completed own-installation non-future protocols proposed');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000002','76000000-0000-4000-8000-000000000001',0,'2024-02-29')$$,'42501',null,'Draft/incomplete protocol rejected');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000003','76000000-0000-4000-8000-000000000001',0,'2024-02-29')$$,'42501',null,'Foreign installation protocol rejected');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000006','76000000-0000-4000-8000-000000000001',0,'2024-02-29')$$,'42501',null,'Future completion rejected');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001',0,'2024-03-01')$$,'40001',null,'Unconfirmed calculated date rejected');
select is((select count(*)::int from public.maintenance_completions),0,'Rejected attempts do not create history');
select is(public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001',0,'2024-02-29')->>'nextDueOn','2024-02-29','Jan 31 plus one month clamps to leap day');
select is((select version from public.maintenance_plans where id='66000000-0000-4000-8000-000000000001'),1,'Completion advances plan version once');
select is((select next_due_on::text from public.maintenance_plans where id='66000000-0000-4000-8000-000000000001'),'2024-02-29','Plan date advanced atomically');
select is(public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001',0,'2024-02-29')->>'completionId','76000000-0000-4000-8000-000000000001','Exact retry returns original result despite old version');
select is((select count(*)::int from public.maintenance_completions),1,'Retry does not duplicate history');
select is((select version from public.maintenance_plans where id='66000000-0000-4000-8000-000000000001'),1,'Retry does not advance another cycle');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000001',1,'2024-03-29')$$,'40001',null,'Same request ID cannot change its protocol');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000002',1,'2024-02-29')$$,'P0001','Protocol already recorded for plan','New request ID cannot reuse same protocol for same plan');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000005','76000000-0000-4000-8000-000000000002',1,'2024-02-01')$$,'P0001','Protocol precedes latest completion','Old protocol cannot rewind chronology');
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->'protocols'->>'total')::int,1,'Used and older protocols disappear from choices');
select public.save_maintenance_plan('66000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Original plan',1,'2024-02-29',false,1);
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000002',2,'2024-03-29')$$,'P0001','Plan must be active','Paused plan cannot be completed');
select public.save_maintenance_plan('66000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Original plan',1,'2024-02-29',true,2);
select public.save_maintenance_plan('66000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Updated title',12,'2024-02-29',true,3);
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000002',3,'2025-02-28')$$,'40001',null,'Changed cycle invalidates stale confirmation');
select is(public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000002',4,'2025-02-28')->>'nextDueOn','2025-02-28','Leap day plus 12 months clamps to Feb 28');
select is((select plan_title from public.maintenance_completions where id='76000000-0000-4000-8000-000000000001'),'Original plan','Old title remains a snapshot');
select is((select interval_months from public.maintenance_completions where id='76000000-0000-4000-8000-000000000001'),1,'Old cycle remains a snapshot');
select is((select previous_due_on::text from public.maintenance_completions where id='76000000-0000-4000-8000-000000000002'),'2024-02-29','Next history record stores the prior plan date');
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->'history'->>'total')::int,2,'History includes both chronological completions');
select is(public.record_maintenance_completion('66000000-0000-4000-8000-000000000002','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000003',0,'2024-07-31')->>'nextDueOn','2024-07-31','One visit may explicitly confirm another plan on the same installation');
select throws_ok($$update public.maintenance_completions set plan_title='tampered' where id='76000000-0000-4000-8000-000000000001'$$,'42501',null,'Application session cannot rewrite history');
reset role;
-- Failure after inserting history still rolls back the whole completion.
create function public.test_reject_maintenance_update() returns trigger language plpgsql as $$begin if new.id='66000000-0000-4000-8000-000000000003' then raise exception 'Simulated plan write failure';end if;return new;end $$;
create trigger test_reject_maintenance_update before update on public.maintenance_plans for each row execute function public.test_reject_maintenance_update();
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000003','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000004',0,'2024-08-29')$$,'P0001','Simulated plan write failure','Plan update failure is reported');
select is((select count(*)::int from public.maintenance_completions where id='76000000-0000-4000-8000-000000000004'),0,'Failed plan update rolls back inserted history');
select is((select next_due_on::text from public.maintenance_plans where id='66000000-0000-4000-8000-000000000003'),'2024-01-10','Failed operation leaves original date');
reset role;
drop trigger test_reject_maintenance_update on public.maintenance_plans;
drop function public.test_reject_maintenance_update();
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is(public.record_maintenance_completion('66000000-0000-4000-8000-000000000003','85000000-0000-4000-8000-000000000005','76000000-0000-4000-8000-000000000004',0,'2024-07-01')->>'nextDueOn','2024-07-01','Execution date uses Warsaw date across UTC midnight');
reset role;
select is((select count(*)::int from public.audit_logs where table_name='maintenance_completions' and row_id in ('76000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000002')),2,'Completions are audited exactly once');
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000002',true);
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->>'canComplete')::boolean,false,'Technician has read-only history');
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->'protocols'->>'total')::int,0,'Technician is not offered protocols to submit');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000003','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000004',0,'2024-08-29')$$,'42501',null,'Technician cannot confirm');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is((public.portal_maintenance_history('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001')->>'total')::int,4,'Client sees history of own installation across its plans');
select throws_ok($$select public.portal_maintenance_history('c5000000-0000-4000-8000-000000000003','e5000000-0000-4000-8000-000000000001')$$,'42501',null,'Cannot mix two owned customer contexts');
select throws_ok($$select public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')$$,'42501',null,'Client cannot access company detail');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000003','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000004',0,'2024-08-29')$$,'42501',null,'Client cannot confirm completion');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000004',true);
select is((select count(*)::int from public.maintenance_completions),0,'Foreign client sees no history through raw table');
select throws_ok($$select public.portal_maintenance_history('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001')$$,'42501',null,'Foreign portal context is denied');
reset role;
update public.customers set archived_at=now() where id='c5000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is((public.maintenance_plan_detail('66000000-0000-4000-8000-000000000001')->>'canComplete')::boolean,false,'Archived customer detail is historical');
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000003','85000000-0000-4000-8000-000000000004','76000000-0000-4000-8000-000000000005',1,'2024-08-29')$$,'42501',null,'Archived parent prevents new confirmation');
select is(public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001',0,'2024-02-29')->>'completionId','76000000-0000-4000-8000-000000000001','Exact retry remains read-only after parent archive');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is((public.portal_maintenance_history('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001')->>'total')::int,4,'Archived membership retains history');
reset role;
insert into public.account_access(user_id,blocked) values('a5000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.record_maintenance_completion('66000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001',0,'2024-02-29')$$,'42501',null,'Blocked account cannot replay an old request');
select * from finish();
rollback;
