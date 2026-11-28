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

insert into public.installations(id,location_id,type) values('e8000000-0000-4000-8000-000000000002','d7000000-0000-4000-8000-000000000002','Obca instalacja');
create function pg_temp.device() returns jsonb language sql as $$select '{"id":"dc000000-0000-4000-8000-000000000001","deviceId":null,"manufacturer":"Producent test","model":"Model A","serialNumber":"SN-TEST","warrantyUntil":null,"warrantyTerms":""}'::jsonb$$;
create function pg_temp.fields() returns jsonb language sql as $$select jsonb_build_object('performedOn',to_char((now() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'performerName','Technik test','workPerformed','Montaż i uruchomienie','checks','Szczelność sprawdzona','observations','','recommendations','Uzgodnić przegląd','mode','new','installationId',null,'locationId',null,'installationType','Klimatyzacja','devices',jsonb_build_array(pg_temp.device()))$$;
create function pg_temp.rv() returns int language sql as $$select (public.handover_context('9a000000-0000-4000-8000-000000000001')->'report'->>'version')::int$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.save_offer('98000000-0000-4000-8000-000000000021',pg_temp.body())->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000021',pg_temp.valid_doc(),null,0)->>'version';
select public.publish_offer('99000000-0000-4000-8000-000000000021','98000000-0000-4000-8000-000000000021',0,0,'JVBERi1maXh0dXJl')->>'revision';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','e7000000-0000-4000-8000-000000000001',true)->>'state';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.create_work_order('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','Adres test','Miasto','00-001')->>'id';
select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-04-04T09:00',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'PRIVATE VISIT NOTE')->>'version';
select is(public.save_handover('9a000000-0000-4000-8000-000000000001',null,1,pg_temp.fields(),'SECRET INTERNAL')->>'version','0','Draft created once');
select is(public.save_handover('9a000000-0000-4000-8000-000000000001',null,1,pg_temp.fields(),'SECRET INTERNAL')->>'version','0','Retry does not duplicate draft');
select is((select count(*) from public.devices where id='dc000000-0000-4000-8000-000000000001'),0::bigint,'Draft does not register device');
select ok(public.handover_pdf('9a000000-0000-4000-8000-000000000001') is null,'Draft has no PDF');
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',0,1)$$,'40001',null,'Unfinished montage prevents publication');
select throws_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',0,0,pg_temp.fields(),'')$$,'40001',null,'Stale order rejected');
select throws_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',0,1,pg_temp.fields()||'{"mode":"existing","installationId":"e8000000-0000-4000-8000-000000000002"}','')$$,'42501',null,'Foreign installation rejected');
select throws_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',0,1,pg_temp.fields()||'{"locationId":"d7000000-0000-4000-8000-000000000002"}','')$$,'42501',null,'Foreign location rejected');
select throws_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',0,1,pg_temp.fields()||'{"admin":true}','')$$,'22023',null,'Unknown fields rejected');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000006',true);
select throws_ok($$select public.handover_context('9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Foreign technician denied');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select is(public.save_handover('9a000000-0000-4000-8000-000000000001',0,1,pg_temp.fields(),'SECRET INTERNAL')->>'version','0','Assigned technician can save draft');
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',0,1)$$,'42501',null,'Technician cannot approve');
select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',1,'in_progress')->>'version';
select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',2,'completed')->>'version';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select is(public.change_work_order('9a000000-0000-4000-8000-000000000001',3,'completed')->>'state','completed','Order closes independently of published protocol and customer receipt');
select public.save_handover('9a000000-0000-4000-8000-000000000001',0,4,pg_temp.fields()||'{"performerName":""}','SECRET INTERNAL')->>'version';
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)$$,'22023',null,'Missing performer prevents approval');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.fields()||jsonb_build_object('performedOn','2099-01-01','devices','[]'::jsonb),'SECRET INTERNAL')->>'version';
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)$$,'22023',null,'Future execution date cannot publish');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.fields()||jsonb_build_object('devices',jsonb_build_array(pg_temp.device(),pg_temp.device()||'{"id":"dc000000-0000-4000-8000-000000000002"}')),'SECRET INTERNAL')->>'version';
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)$$,'22023',null,'Duplicate serials in report rejected');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.fields(),'SECRET INTERNAL')->>'version';
reset role;
insert into public.devices(id,installation_id,manufacturer,model,serial_number,warranty_until,warranty_terms) values
('dd000000-0000-4000-8000-000000000001','e8000000-0000-4000-8000-000000000001','Producent test','Model A','EXISTING-SN','2021-01-01','Podane wcześniej warunki'),
('dd000000-0000-4000-8000-000000000002','e8000000-0000-4000-8000-000000000002','Producent test','Obcy model','FOREIGN-SN',null,'');
create function pg_temp.existing_device() returns jsonb language sql as $$select pg_temp.device()||'{"id":"dd000000-0000-4000-8000-000000000001","deviceId":"dd000000-0000-4000-8000-000000000001","serialNumber":"EXISTING-SN","warrantyUntil":"2021-01-01","warrantyTerms":"Podane wcześniej warunki"}'::jsonb$$;
create function pg_temp.existing_fields() returns jsonb language sql as $$select pg_temp.fields()||jsonb_build_object('mode','existing','installationId','e8000000-0000-4000-8000-000000000001','devices',jsonb_build_array(pg_temp.existing_device()))$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.existing_fields()||jsonb_build_object('devices',jsonb_build_array(pg_temp.existing_device()||'{"deviceId":"dd000000-0000-4000-8000-000000000002"}')),'')$$,'42501',null,'Device from another installation cannot be selected');
select lives_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.existing_fields(),'SECRET INTERNAL')$$,'Existing device may retain its explicitly recorded expired warranty');
select is(public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)->'devices'->0->>'warrantyUntil','2021-01-01','Existing warranty is copied exactly without extension');
select is(public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)->'installation'->>'id','e8000000-0000-4000-8000-000000000001','Existing installation is explicitly selected');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.existing_fields()||jsonb_build_object('devices',jsonb_build_array(pg_temp.existing_device()||'{"model":"Forged model"}')),'SECRET INTERNAL')->>'version';
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)$$,'40001',null,'Existing device data cannot be silently overwritten');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.existing_fields()||jsonb_build_object('devices',jsonb_build_array(pg_temp.device()||'{"serialNumber":"existing-sn"}')),'SECRET INTERNAL')->>'version';
select throws_ok($$select public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)$$,'40001',null,'Already registered serial requires selecting existing device');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.fields()||jsonb_build_object('devices',jsonb_build_array(pg_temp.device()||'{"warrantyUntil":"2028-10-28","warrantyTerms":"Jawnie wskazane warunki"}')),'SECRET INTERNAL')->>'version';
select is(public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)->'devices'->0->>'warrantyUntil','2028-10-28','Explicit new-device warranty preserved');
select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.fields(),'SECRET INTERNAL')->>'version';
select ok(public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4)::text !~ 'SECRET|PRIVATE|costCents|saleCents|grossCents|internalNote','Public snapshot excludes all costs and private notes');
select throws_ok($$select public.publish_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,'{}','JVBERi1maXh0dXJl')$$,'40001',null,'Changed rendered snapshot rejected');
select throws_ok($$select public.publish_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4),'bm90IHBERg==')$$,'22023',null,'Invalid PDF rejected');
select is(public.publish_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,public.prepare_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4),'JVBERi1maXh0dXJl')->>'state','published','Office publishes frozen protocol');
select is(public.publish_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv()-1,4,'{}','JVBERi1maXh0dXJl')->>'state','published','Publication retry returns existing protocol');
select is((select count(*) from public.devices where id='dc000000-0000-4000-8000-000000000001'),1::bigint,'Publication retry registers exactly one device');
select ok((select warranty_until is null and warranty_terms='' from public.devices where id='dc000000-0000-4000-8000-000000000001'),'No warranty is inferred');
select is(jsonb_array_length(public.installation_handover_links((public.handover_context('9a000000-0000-4000-8000-000000000001')->'report'->'snapshot'->'installation'->>'id')::uuid)),1,'Installation links to approved protocol');
select throws_ok($$select public.save_handover('9a000000-0000-4000-8000-000000000001',pg_temp.rv(),4,pg_temp.fields(),'EDIT')$$,'40001',null,'Approved protocol immutable');
select throws_ok($$select public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','accepted','',true)$$,'42501',null,'Staff preview cannot acknowledge on behalf of client');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select ok(public.portal_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001')::text !~ 'SECRET|PRIVATE|fields|internalNote|costCents|received_by','Client projection contains public data only');
select throws_ok($$select count(*) from public.installation_handovers$$,'42501',null,'Client cannot select raw draft or internal data');
select throws_ok($$select public.handover_context('9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Client cannot use staff detail');
select throws_ok($$select public.portal_handover('c7000000-0000-4000-8000-000000000002','9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Foreign customer protocol denied');
select throws_ok($$select public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','accepted','',false)$$,'22023',null,'Explicit client confirmation required');
select throws_ok($$select public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','reservations','',true)$$,'22023',null,'Reservations require explanation');
create temp table receipt_saved as select public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','reservations','Uwagi testowe',true) as value;
select is(public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','reservations','Uwagi testowe',true),(select value from receipt_saved),'Retry preserves original receipt and timestamp');
select throws_ok($$select public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','accepted','',true)$$,'40001',null,'Recorded decision immutable');
select is(decode(public.handover_pdf('9a000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001')->>'base64','base64'),convert_to('%PDF-fixture','UTF8'),'PDF unchanged after customer receipt');
select is(public.portal_documents('c7000000-0000-4000-8000-000000000001','handover')->>'total','1','Customer document list includes approved handover');
reset role;
update public.devices set model='Later registry edit' where id='dc000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select is(public.portal_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001')->'snapshot'->'devices'->0->>'model','Model A','Registry edits do not rewrite frozen document');
reset role;
delete from public.customer_memberships where user_id='a7000000-0000-4000-8000-000000000004';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.portal_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Revoked membership removes protocol access');
set local role anon;
select throws_ok($$select public.handover_context('9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Anonymous access denied');
select * from finish();
rollback;
