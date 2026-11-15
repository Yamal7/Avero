-- Integration journey. All synthetic identities and decisions are rolled back.
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

select is(public.work_order_detail('9a000000-0000-4000-8000-000000000001')->>'version','1','Flow: accepted offer becomes scheduled work order');
select public.save_handover('9a000000-0000-4000-8000-000000000001',null,1,pg_temp.fields(),'SECRET INTERNAL');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',1,'in_progress');
select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',2,'completed');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select is(public.change_work_order('9a000000-0000-4000-8000-000000000001',3,'completed')->>'state','completed','Flow: office finishes work before customer receipt');
select is(public.publish_handover('9a000000-0000-4000-8000-000000000001',0,4,public.prepare_handover('9a000000-0000-4000-8000-000000000001',0,4),'JVBERi1maXh0dXJl')->>'state','published','Flow: completed work produces published handover');
select set_config('test.flow_installation',public.handover_context('9a000000-0000-4000-8000-000000000001')->'report'->'snapshot'->'installation'->>'id',true);
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select is(jsonb_array_length(public.portal_installation('c7000000-0000-4000-8000-000000000001',current_setting('test.flow_installation')::uuid)->'devices'),1,'Flow: customer sees device registered by handover');
select ok(public.portal_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001')::text !~ 'SECRET|PRIVATE|costCents|internalNote','Flow: handover hides internal offer and montage notes');
select lives_ok($$select public.acknowledge_handover('c7000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','accepted','',true)$$,'Flow: customer independently acknowledges completed montage');
select set_config('test.flow_ticket',public.portal_create_ticket('c7000000-0000-4000-8000-000000000001',current_setting('test.flow_installation')::uuid,'Przegląd po montażu','Sprawdzenie działania','75000000-0000-4000-8000-000000000024')::text,true);
select is(public.portal_create_ticket('c7000000-0000-4000-8000-000000000001',current_setting('test.flow_installation')::uuid,'Przegląd po montażu','Sprawdzenie działania','75000000-0000-4000-8000-000000000024')::text,current_setting('test.flow_ticket'),'Flow: service submission retry keeps one ticket');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.assign_service_ticket(current_setting('test.flow_ticket')::uuid,'a7000000-0000-4000-8000-000000000003');
select set_config('test.flow_visit',public.schedule_service_visit(current_setting('test.flow_ticket')::uuid,'2030-04-05T09:00',60,'Uzgodniony przegląd')::text,true);
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select public.change_service_visit_state(current_setting('test.flow_visit')::uuid,'in_progress');
select set_config('test.flow_protocol',public.save_service_protocol(current_setting('test.flow_visit')::uuid,'{"diagnosis":"Sprawna instalacja","work_performed":"Kontrola działania","materials":"","measurements":"Parametry poprawne","recommendations":"Regularne przeglądy"}',0,true)::text,true);
select is((select status from public.service_visits where id=current_setting('test.flow_visit')::uuid),'completed','Flow: service protocol completes visit on montage installation');
select lives_ok($$select public.update_service_ticket(current_setting('test.flow_ticket')::uuid,'closed','normal')$$,'Flow: assigned technician closes serviced ticket');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select is(public.portal_ticket('c7000000-0000-4000-8000-000000000001',current_setting('test.flow_ticket')::uuid)->>'status','closed','Flow: customer sees service completion');
select is((select count(*) from public.service_protocols where id=current_setting('test.flow_protocol')::uuid),1::bigint,'Flow: customer can read published service protocol');
select is(decode(public.handover_pdf('9a000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001')->>'base64','base64'),convert_to('%PDF-fixture','UTF8'),'Flow: later service does not change original handover PDF');
reset role;
delete from public.customer_memberships where user_id='a7000000-0000-4000-8000-000000000004';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.portal_ticket('c7000000-0000-4000-8000-000000000001',current_setting('test.flow_ticket')::uuid)$$,'42501',null,'Flow: revoked customer loses access to subsequent service');
select * from finish();
rollback;
