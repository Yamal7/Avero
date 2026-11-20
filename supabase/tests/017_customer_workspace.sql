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
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.save_offer('98000000-0000-4000-8000-000000000021',pg_temp.body())->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000021',pg_temp.valid_doc(),null,0)->>'version';
select public.publish_offer('99000000-0000-4000-8000-000000000021','98000000-0000-4000-8000-000000000021',0,0,'JVBERi1maXh0dXJl')->>'revision';
select public.save_offer('98000000-0000-4000-8000-000000000022',pg_temp.body()||'{"title":"HIDDEN OTHER CREW"}')->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000022',pg_temp.valid_doc(),null,0)->>'version';
select public.publish_offer('99000000-0000-4000-8000-000000000022','98000000-0000-4000-8000-000000000022',0,0,'JVBERi1maXh0dXJl')->>'revision';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','e7000000-0000-4000-8000-000000000001',true)->>'state';
select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000022','e7000000-0000-4000-8000-000000000001',true)->>'state';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.create_work_order('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','Adres montażu','Kraków','30-001')->>'id';
select public.create_work_order('9a000000-0000-4000-8000-000000000002','99000000-0000-4000-8000-000000000022','Adres montażu','Kraków','30-001')->>'id';
select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-03-04T09:00',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'PRIVATE VISIT NOTE')->>'version';
select public.schedule_work_visit('9a000000-0000-4000-8000-000000000002',0,'9b000000-0000-4000-8000-000000000002','2030-03-04T09:00',60,array['a7000000-0000-4000-8000-000000000005'::uuid],'PRIVATE OTHER CREW')->>'version';
reset role;
insert into public.service_tickets(id,installation_id,customer_id,description,subject,assigned_to) values
('aa000000-0000-4000-8000-000000000001','e8000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001','PRIVATE SERVICE NOTE','Własny serwis','a7000000-0000-4000-8000-000000000003'),
('aa000000-0000-4000-8000-000000000002','e8000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001','PRIVATE SERVICE NOTE','HIDDEN OTHER SERVICE','a7000000-0000-4000-8000-000000000005');
insert into public.installation_handovers(id,fields,state,snapshot,published_at,updated_by,received_state,received_comment,received_at,received_by) values
('9a000000-0000-4000-8000-000000000001','{}','published','{"number":"PM-HISTORY"}',now(),'a7000000-0000-4000-8000-000000000001','reservations','PRIVATE RECEIPT TEXT',now(),'a7000000-0000-4000-8000-000000000004'),
('9a000000-0000-4000-8000-000000000002','{}','published','{"number":"HIDDEN PROTOCOL"}',now(),'a7000000-0000-4000-8000-000000000001',null,null,null,null);
insert into public.handover_corrections(id,round,fields,state,snapshot,published_at,updated_by) values('9a000000-0000-4000-8000-000000000001',1,'{}','published','{"number":"PM-HISTORY/P1"}',now(),'a7000000-0000-4000-8000-000000000001');
insert into public.handover_correction_tasks(id,report_id,round,title,assignee_id,due_on,state,result,internal_note,completed_at,last_payload) values('dc000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001',1,'Poprawka odpływu','a7000000-0000-4000-8000-000000000003','2026-10-28','completed','Wykonano','PRIVATE TASK NOTE',now(),'{}');
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'customer'->>'name','Oferta klient A','Profile reads actual customer');
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'counts'->>'offers','2','Office sees own customer offer count');
select is(public.customer_related_rows('c7000000-0000-4000-8000-000000000001','offers')->>'total','2','Offers are correctly scoped to customer');
select ok(public.customer_related_rows('c7000000-0000-4000-8000-000000000001','offers')::text !~ 'costCents|SECRET|PRIVATE','Related records exclude internal cost and notes');
select is(public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000001',null,pg_temp.contact_fields('Jan Kontakt',true))->>'version','0','Create contact with stable identity');
select is(public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000001',null,pg_temp.contact_fields('Jan Kontakt',true))->>'version','0','Creation retry idempotent');
select is(public.customer_contact_list('c7000000-0000-4000-8000-000000000001')->>'total','1','Retry does not duplicate contact');
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'primaryContact'->>'name','Jan Kontakt','Primary contact appears in profile');
select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000002',null,pg_temp.contact_fields('Anna Kontakt',true))->>'version';
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'primaryContact'->>'name','Anna Kontakt','Switching primary preserves exactly one current person');
select is(public.customer_contact_list('c7000000-0000-4000-8000-000000000001')->'items'->1->>'version','1','Replacing primary invalidates stale version of previous contact');
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000001',0,pg_temp.contact_fields('Jan Stale',true))$$,'40001',null,'Stale primary contact cannot overwrite newer selection');
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000002','df000000-0000-4000-8000-000000000001',1,pg_temp.contact_fields())$$,'42501',null,'Contact cannot be moved to another customer');
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000003',null,pg_temp.contact_fields()||'{"grantAccess":true}')$$,'22023',null,'Forged access fields rejected');
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000003',null,pg_temp.contact_fields()||'{"email":"invalid"}')$$,'22023',null,'Invalid email rejected by database');
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000003',null,pg_temp.contact_fields('Archive',true,true))$$,'22023',null,'Archived contact cannot remain primary');
select is(public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000002',0,pg_temp.contact_fields('Anna Kontakt',false,true))->>'archived','true','Archive is reversible and retains contact');
select ok(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'primaryContact'='null'::jsonb,'Archiving primary does not invent another preferred contact');
select is(public.customer_contact_list('c7000000-0000-4000-8000-000000000001',true)->>'total','1','Archive list includes archived person');
select is(public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000002',1,pg_temp.contact_fields('Anna Kontakt',false,false))->>'version','2','Restore preserves identity and increments version');
select is(public.customer_activity('c7000000-0000-4000-8000-000000000001','customer')->>'total','1','Customer creation appears once');
select ok((public.customer_activity('c7000000-0000-4000-8000-000000000001','contact')->>'total')::int>=5,'Contact changes and archive are recorded in timeline');
select ok(public.customer_activity('c7000000-0000-4000-8000-000000000001')::text !~ 'PRIVATE|SECRET|costCents|old_data|actor_id|encrypted','Timeline is a safe projection, not raw audit data');
select is(public.customer_activity('c7000000-0000-4000-8000-000000000001','offer')->>'total','6','Offer creation, publication and acceptance appear separately');
select is(public.customer_activity('c7000000-0000-4000-8000-000000000001','handover')->>'total','3','Published installation protocols and client receipt are distinct events');
select is(public.customer_activity('c7000000-0000-4000-8000-000000000001','correction')->>'total','2','Corrective task completion and next protocol appear in timeline');
select throws_ok($$select public.customer_activity('c7000000-0000-4000-8000-000000000001','all',0)$$,'22023',null,'History page lower bound validated');
select throws_ok($$select public.customer_related_rows('c7000000-0000-4000-8000-000000000001','unknown')$$,'22023',null,'Unknown record kinds rejected');
select throws_ok($$select * from public.customer_activity_rows('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Unbounded internal event helper is not callable');
select throws_ok($$select * from public.customer_contacts$$,'42501',null,'Raw contact table cannot bypass guarded API');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'counts'->'offers','null'::jsonb,'Technician profile never exposes offer count');
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'counts'->>'work','1','Technician count includes only crew orders');
select is(public.customer_workspace('c7000000-0000-4000-8000-000000000001')->'counts'->>'service','1','Technician count includes assigned service only');
select ok(public.customer_related_rows('c7000000-0000-4000-8000-000000000001','work')::text !~ 'HIDDEN|8481|netCents|costCents','Other crews and financial values excluded');
select is(public.customer_related_rows('c7000000-0000-4000-8000-000000000001','work')->'items'->0->'amountCents','null'::jsonb,'Technician cannot infer work order price');
select ok(public.customer_activity('c7000000-0000-4000-8000-000000000001')::text !~ 'HIDDEN|PRIVATE|SECRET|offer:|offer-pub:|offer-accept:|costCents','Technician timeline hides offers, other crews and service');
select is(public.customer_activity('c7000000-0000-4000-8000-000000000001','offer')->>'total','0','Even guessed offer filter cannot reveal history');
select throws_ok($$select public.customer_related_rows('c7000000-0000-4000-8000-000000000001','offers')$$,'42501',null,'Offer detail list denied to technician');
select throws_ok($$select public.customer_workspace('c7000000-0000-4000-8000-000000000002')$$,'42501',null,'Foreign customer profile denied');
select throws_ok($$select public.customer_contact_list('c7000000-0000-4000-8000-000000000002')$$,'42501',null,'Foreign customer contacts denied');
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000003',null,pg_temp.contact_fields())$$,'42501',null,'Technician cannot write contacts');
select is(public.customer_contact_list('c7000000-0000-4000-8000-000000000001')->>'total','2','Assigned technician may read internal contacts');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.customer_workspace('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Client membership does not grant internal CRM profile');
select throws_ok($$select public.customer_contact_list('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Client cannot read internal contacts');
reset role;
insert into public.customer_contacts(id,customer_id,name,last_payload) select md5('workspace-contact-'||n)::uuid,'c7000000-0000-4000-8000-000000000001','Osoba '||lpad(n::text,2,'0'),'{}'::jsonb from generate_series(1,25) n;
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select is(jsonb_array_length(public.customer_contact_list('c7000000-0000-4000-8000-000000000001',false,1)->'items'),20,'Contact page bounded to twenty rows');
select is(jsonb_array_length(public.customer_contact_list('c7000000-0000-4000-8000-000000000001',false,2)->'items'),7,'Second contact page contains remaining rows');
select is(jsonb_array_length(public.customer_activity('c7000000-0000-4000-8000-000000000001','all',1)->'items'),20,'Timeline page bounded to twenty events');
select ok(not exists(select 1 from jsonb_array_elements(public.customer_activity('c7000000-0000-4000-8000-000000000001','all',1)->'items') a join jsonb_array_elements(public.customer_activity('c7000000-0000-4000-8000-000000000001','all',2)->'items') b on a->>'id'=b->>'id'),'Stable ordering keeps pages disjoint when timestamps tie');
reset role;
update public.customers set archived_at=now() where id='c7000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.save_customer_contact('c7000000-0000-4000-8000-000000000001','df000000-0000-4000-8000-000000000003',null,pg_temp.contact_fields())$$,'40001',null,'Archived customer cannot receive contact changes');
reset role;
delete from public.staff_customer_assignments where user_id='a7000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.customer_activity('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Revoked assignment removes profile history access');
set local role anon;
select throws_ok($$select public.customer_workspace('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Anonymous profile denied');
select * from finish();
rollback;
