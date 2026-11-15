begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('a7000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','offer-admin@test.local','x',now(),now(),now()),
('a7000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','offer-office@test.local','x',now(),now(),now()),
('a7000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','offer-tech@test.local','x',now(),now(),now()),
('a7000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','offer-client@test.local','x',now(),now(),now());
insert into public.staff_users(user_id,role) values('a7000000-0000-4000-8000-000000000001','admin'),('a7000000-0000-4000-8000-000000000002','office'),('a7000000-0000-4000-8000-000000000003','technician');
insert into public.customers(id,name,email) values('c7000000-0000-4000-8000-000000000001','Oferta klient A','offer-a@test.local'),('c7000000-0000-4000-8000-000000000002','Oferta klient B','offer-b@test.local');
insert into public.locations(id,customer_id,address,city) values('d7000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001','Ulica A','Miasto A'),('d7000000-0000-4000-8000-000000000002','c7000000-0000-4000-8000-000000000002','Ulica B','Miasto B');
insert into public.catalog_items(id,code,name,category,unit,cost_cents,sale_cents,vat_basis_points,created_by,created_payload) values('f7000000-0000-4000-8000-000000000001','TEST-OFFER-CATALOG','Usługa katalog test','service','hour',3800,6500,2300,'a7000000-0000-4000-8000-000000000001','{}');
create function pg_temp.line() returns jsonb language sql as $$select '{"id":"b7000000-0000-4000-8000-000000000001","catalogId":"f7000000-0000-4000-8000-000000000001","code":"TEST-OFFER-CATALOG","name":"Usługa katalog test","description":"Opis","category":"service","unit":"hour","quantityMills":1000,"costCents":3800,"saleCents":6500,"vatBasisPoints":2300,"discountBasisPoints":0}'::jsonb$$;
create function pg_temp.second_line() returns jsonb language sql as $$select pg_temp.line()||'{"id":"b7000000-0000-4000-8000-000000000002","catalogId":null,"name":"Materiał","category":"material","unit":"meter","quantityMills":2500,"costCents":101,"saleCents":200,"vatBasisPoints":800,"discountBasisPoints":1000}'::jsonb$$;
create function pg_temp.variant() returns jsonb language sql as $$select jsonb_build_object('id','e7000000-0000-4000-8000-000000000001','name','Rekomendowana','lines',jsonb_build_array(pg_temp.line(),pg_temp.second_line()),'internalNote','SECRET OFFER NOTE','customerNote','Opis dla klienta','targetMarginBasisPoints',3000,'overrideNetCents',null)$$;
create function pg_temp.body() returns jsonb language sql as $$select jsonb_build_object('customerId','c7000000-0000-4000-8000-000000000001','locationId','d7000000-0000-4000-8000-000000000001','title','Klimatyzacja test oferty','workType','split','technical','{"lengthMills":2500,"laborMills":1000,"travelMills":0}'::jsonb,'variants',jsonb_build_array(pg_temp.variant()),'mainVariantId','e7000000-0000-4000-8000-000000000001','archived',false)$$;

create function pg_temp.doc() returns jsonb language sql as $$select '{"companyName":"Test Firma","companyAddress":"Adres testowy","taxId":"","email":"","phone":"","website":"","issuedOn":"2026-10-26","validUntil":"2026-11-09","intro":"Opis klienta","paymentTerms":"","completionTerms":"","exclusions":"","note":""}'::jsonb$$;

insert into public.customer_memberships(user_id,customer_id) values
('a7000000-0000-4000-8000-000000000004','c7000000-0000-4000-8000-000000000001'),
('a7000000-0000-4000-8000-000000000002','c7000000-0000-4000-8000-000000000001');
create function pg_temp.valid_doc() returns jsonb language sql as $$select pg_temp.doc()||jsonb_build_object('issuedOn',to_char((now() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'validUntil',to_char((now() at time zone 'Europe/Warsaw')::date+14,'YYYY-MM-DD'))$$;

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('a7000000-0000-4000-8000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','work-tech-two@test.local','x',now(),now(),now()),
('a7000000-0000-4000-8000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','work-tech-foreign@test.local','x',now(),now(),now());
insert into public.staff_users(user_id,role) values('a7000000-0000-4000-8000-000000000005','technician'),('a7000000-0000-4000-8000-000000000006','technician');
insert into public.staff_customer_assignments(user_id,customer_id) values
('a7000000-0000-4000-8000-000000000003','c7000000-0000-4000-8000-000000000001'),
('a7000000-0000-4000-8000-000000000005','c7000000-0000-4000-8000-000000000001'),
('a7000000-0000-4000-8000-000000000006','c7000000-0000-4000-8000-000000000002');
insert into public.installations(id,location_id,type) values('e8000000-0000-4000-8000-000000000001','d7000000-0000-4000-8000-000000000001','Montaż test');
create function pg_temp.ver() returns integer language sql as $$select (public.work_order_detail('9a000000-0000-4000-8000-000000000001')->>'version')::int$$;

create function pg_temp.contact_fields(n text default 'Jan Kontakt',main boolean default false,arch boolean default false) returns jsonb language sql as $$select jsonb_build_object('name',n,'role','Administrator obiektu','email','kontakt@example.invalid','phone','+48 000 000 000','isPrimary',main,'archived',arch)$$;
create function pg_temp.note() returns jsonb language sql as $$select jsonb_build_object('title','PRIVATE NOTE TITLE','body','PRIVATE BODY','kind','call','occurredOn',to_char((now() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'contactId',null,'archived',false)$$;
create function pg_temp.task(who text default 'a7000000-0000-4000-8000-000000000003') returns jsonb language sql as $$select jsonb_build_object('title','Task title','description','Instructions for assignee','kind','follow_up','dueOn',to_char((now() at time zone 'Europe/Warsaw')::date-1,'YYYY-MM-DD'),'contactId',null,'assigneeId',who,'state','todo','result','')$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select is((public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->>'openTasks')::text,'0','Empty customer summary');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',null,pg_temp.note())->>'version')::text,'0','Office creates private note');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',null,pg_temp.note())->>'version')::text,'0','Retried create stays version zero');
select is((public.crm_records('c7000000-0000-4000-8000-000000000001','notes','open',1)->>'total')::text,'1','No duplicate note');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000002','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note())$$,'42501',null,'Cannot move note to foreign customer');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note()||'{"occurredOn":"2099-01-01"}')$$,'22023',null,'Reject future note');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note()||'{"occurredOn":"2026-02-30"}')$$,'22023',null,'Reject impossible date');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note()||'{"grantAccess":true}')$$,'22023',null,'Reject extra keys');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note()||'{"title":null}')$$,'22023',null,'Reject null title');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note()||'{"archived":true}')->>'version')::text,'1','Archive note');
select is((public.crm_records('c7000000-0000-4000-8000-000000000001','notes','open',1)->>'total')::text,'0','Archive removed from active list');
select is((public.crm_records('c7000000-0000-4000-8000-000000000001','notes','archived',1)->>'total')::text,'1','Archive retained');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',0,pg_temp.note()||'{"body":"stale"}')$$,'40001',null,'Stale note cannot overwrite');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',1,pg_temp.note())->>'version')::text,'2','Restore note');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000001',null,pg_temp.task())->>'version')::text,'0','Create assigned task');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000001',null,pg_temp.task())->>'version')::text,'0','Task create idempotent');
select is((public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->>'openTasks')::text,'1','Counts open tasks');
select is((public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->>'overdueTasks')::text,'1','Counts overdue task using Warsaw day');
select is((public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->'nextContact'->>'id')::text,'d2000000-0000-4000-8000-000000000001','Next contact comes from open task');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000002',null,pg_temp.task('a7000000-0000-4000-8000-000000000004'))$$,'22023',null,'Reject unavailable or unassigned recipient');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000002',null,pg_temp.task('a7000000-0000-4000-8000-000000000006'))$$,'22023',null,'Reject unavailable or unassigned recipient');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000002',null,pg_temp.task('aaaaaaaa-0000-4000-8000-000000000000'))$$,'22023',null,'Reject unavailable or unassigned recipient');
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000002',null,pg_temp.task('a7000000-0000-4000-8000-000000000005')||'{"title":"HIDDEN OTHER TASK"}')->>'version')::text,'0','Other technician task');
select is((public.save_crm_owner('c7000000-0000-4000-8000-000000000001',null,'a7000000-0000-4000-8000-000000000002')->'owner'->>'version')::text,'0','Choose office owner');
select is((public.save_crm_owner('c7000000-0000-4000-8000-000000000001',null,'a7000000-0000-4000-8000-000000000002')->'owner'->>'version')::text,'0','Owner retry idempotent');
select throws_ok($$select public.save_crm_owner('c7000000-0000-4000-8000-000000000001',0,'a7000000-0000-4000-8000-000000000003')$$,'22023',null,'Technician cannot be commercial owner');
select throws_ok($$select public.save_crm_owner('c7000000-0000-4000-8000-000000000001',9,null)$$,'40001',null,'Stale owner selection rejected');
select public.save_customer_contact('c7000000-0000-4000-8000-000000000002','df000000-0000-4000-8000-000000000009',null,pg_temp.contact_fields());
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',2,pg_temp.note()||'{"contactId":"df000000-0000-4000-8000-000000000009"}')$$,'22023',null,'Foreign contact cannot attach to note');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.crm_records('c7000000-0000-4000-8000-000000000001','notes','open',1)$$,'42501',null,'Technician cannot read private notes');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',2,pg_temp.note())$$,'42501',null,'Technician cannot edit notes');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000001',0,pg_temp.task())$$,'42501',null,'Technician cannot change task fields');
select is((public.crm_records('c7000000-0000-4000-8000-000000000001','tasks','open',1)->>'total')::text,'1','Technician sees own task only');
select ok(public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->'notes'='null'::jsonb,'No note count for technician');
select is((jsonb_array_length(public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->'assignees'))::text,'0','No staff directory for technician');
select ok(public.customer_activity('c7000000-0000-4000-8000-000000000001')::text !~ 'PRIVATE NOTE|PRIVATE BODY|HIDDEN OTHER TASK','Timeline hides notes and other tasks');
select throws_ok($$select public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000002',0,'done','forged')$$,'42501',null,'Cannot complete another task');
select is((public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',0,'done','Contacted client')->>'version')::text,'1','Technician completes own task');
select is((public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',0,'done','Contacted client')->>'version')::text,'1','Completion retry idempotent');
select is((public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->>'openTasks')::text,'0','Completed contact not included in open count');
select ok(public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')->'nextContact'='null'::jsonb,'Completed contact clears next contact');
select throws_ok($$select public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',0,'todo','')$$,'40001',null,'Stale status rejected');
select is((public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',1,'todo','Replan')->>'version')::text,'2','Reopen task');
select ok(public.crm_records('c7000000-0000-4000-8000-000000000001','tasks')->'items'->0->'completedAt'='null'::jsonb,'Reopening clears completion timestamp');
select throws_ok($$select public.crm_records('c7000000-0000-4000-8000-000000000001','tasks','all',0)$$,'22023',null,'Reject zero page');
select throws_ok($$select public.crm_records('c7000000-0000-4000-8000-000000000002','tasks')$$,'42501',null,'No scope to foreign customer');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.customer_crm_summary('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Client denied internal CRM');
select throws_ok($$select public.crm_records('c7000000-0000-4000-8000-000000000001','tasks','open',1)$$,'42501',null,'Client denied internal CRM');
select throws_ok($$select public.crm_records('c7000000-0000-4000-8000-000000000001','notes','open',1)$$,'42501',null,'Client denied internal CRM');
select throws_ok($$select public.customer_activity('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Client denied internal CRM');
select throws_ok($$select public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',2,'done','')$$,'42501',null,'Client denied internal CRM');
reset role;
delete from public.staff_customer_assignments where user_id='a7000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.crm_records('c7000000-0000-4000-8000-000000000001','tasks','open',1)$$,'42501',null,'Revoking scope hides assigned tasks');
select throws_ok($$select public.crm_task_progress('c7000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001',2,'done','')$$,'42501',null,'Revoked technician cannot complete task');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select is((public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000001',2,pg_temp.task()||'{"state":"cancelled","result":"Recipient unavailable"}')->>'version')::text,'3','Office can close unavailable recipient task');
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','tasks','d2000000-0000-4000-8000-000000000001',3,pg_temp.task())$$,'22023',null,'Cannot reopen on unavailable recipient');
reset role;
update public.customers set archived_at=now() where id='c7000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',2,pg_temp.note())$$,'40001',null,'Archived customer cannot be edited');
select throws_ok($$select public.save_crm_owner('c7000000-0000-4000-8000-000000000001',0,null)$$,'40001',null,'Archived owner cannot be changed');
select throws_ok($$select * from public.crm_notes$$,'42501',null,'Direct table read denied');
select throws_ok($$select public.crm_record_json('notes','d1000000-0000-4000-8000-000000000001')$$,'42501',null,'Raw helper execute denied');
reset role;
update public.customers set archived_at=null where id='c7000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.save_crm_record('c7000000-0000-4000-8000-000000000001','notes','d1000000-0000-4000-8000-000000000001',2,pg_temp.note()||jsonb_build_object('body',E'First\tSecond'))$$,'22023',null,'Reject controls in direct RPC text consistently with shared schema');
select * from finish();
rollback;
