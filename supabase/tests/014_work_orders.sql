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
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.save_offer('98000000-0000-4000-8000-000000000021',pg_temp.body())->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000021',pg_temp.valid_doc(),null,0)->>'version';
select public.publish_offer('99000000-0000-4000-8000-000000000021','98000000-0000-4000-8000-000000000021',0,0,'JVBERi1maXh0dXJl')->>'revision';
select throws_ok($$select public.create_work_order('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','Adres','Miasto','')$$,'40001',null,'Only accepted publication can become an order');
select public.save_offer('98000000-0000-4000-8000-000000000022',pg_temp.body())->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000022',pg_temp.valid_doc(),null,0)->>'version';
select public.publish_offer('99000000-0000-4000-8000-000000000022','98000000-0000-4000-8000-000000000022',0,0,'JVBERi1maXh0dXJl')->>'revision';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','e7000000-0000-4000-8000-000000000001',true)->>'state';
select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000022','e7000000-0000-4000-8000-000000000001',true)->>'state';
select throws_ok($$select public.create_work_order('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','Adres','Miasto','')$$,'42501',null,'Client cannot create operational order');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select is(public.create_work_order('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','Adres montażu','Kraków','30-001')->>'state','draft','Office creates order from accepted variant');
select is(public.create_work_order('9a000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021','Adres montażu','Kraków','30-001')->>'version','0','Create retry is idempotent');
select is(public.create_work_order('9a000000-0000-4000-8000-000000000099','99000000-0000-4000-8000-000000000021','Adres montażu','Kraków','30-001')->>'id','9a000000-0000-4000-8000-000000000001','One accepted edition cannot produce duplicate orders');
select is(public.work_order_detail('9a000000-0000-4000-8000-000000000001')->>'grossCents','8481','Order copies exact accepted amount');
select public.save_offer('98000000-0000-4000-8000-000000000021',pg_temp.body()||'{"title":"New draft is not an order"}',0)->>'version';
select is(public.work_order_detail('9a000000-0000-4000-8000-000000000001')->>'title','Klimatyzacja test oferty','Later draft changes cannot alter work scope');
select throws_ok($$update public.work_orders set state='completed'$$,'42501',null,'Direct order writes denied');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-03-31T02:30',120,array['a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'22023',null,'Nonexistent Warsaw daylight saving time rejected');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-03-04T09:00',120,array['a7000000-0000-4000-8000-000000000006'::uuid],'')$$,'P0001',null,'Technician assigned to another customer cannot join crew');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-03-04T09:00',120,array['a7000000-0000-4000-8000-000000000003'::uuid,'a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'22023',null,'Duplicate crew members rejected');
select is(public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-03-04T09:00',120,array['a7000000-0000-4000-8000-000000000003'::uuid],'PRIVATE WORK NOTES')->>'state','planned','First montage plans the order');
select is(public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000001','2030-03-04T09:00',120,array['a7000000-0000-4000-8000-000000000003'::uuid],'PRIVATE WORK NOTES')->>'version','1','Visit retry does not duplicate slot or increment version');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',0,'9b000000-0000-4000-8000-000000000002','2030-03-05T09:00',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'40001',null,'Stale order cannot add another visit');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',1,'9b000000-0000-4000-8000-000000000002','2030-03-04T10:00',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'23P01',null,'Overlapping montage slots rejected');
create temp table test_ticket(id uuid);
insert into test_ticket select public.create_service_ticket('e8000000-0000-4000-8000-000000000001','Collision test','Serwis','normal');
select public.assign_service_ticket((select id from test_ticket),'a7000000-0000-4000-8000-000000000003');
select throws_ok($$select public.schedule_service_visit((select id from test_ticket),'2030-03-04T10:00',60)$$,'23P01',null,'Existing montage blocks service booking');
create temp table test_service_visit(id uuid);
insert into test_service_visit select public.schedule_service_visit((select id from test_ticket),'2030-03-04T11:00',60);
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',1,'9b000000-0000-4000-8000-000000000002','2030-03-04T11:15',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'23P01',null,'Existing service booking blocks montage');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',1,(select id from test_service_visit),'2030-03-04T11:15',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'23P01',null,'Reusing service UUID cannot bypass cross-module conflict');
select is(public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',1,'9b000000-0000-4000-8000-000000000002','2030-03-05T09:00',60,array['a7000000-0000-4000-8000-000000000005'::uuid],'')->>'version','2','Second day can have a different crew');
select is(jsonb_array_length(public.calendar_work_visits('2030-03-04')),2,'Calendar contains both montage dates');
select throws_ok($$select public.change_work_order('9a000000-0000-4000-8000-000000000001',2,'completed')$$,'40001',null,'Order cannot finish with open montage dates');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.work_orders),0::bigint,'Technician cannot access raw financial snapshot');
select is(public.work_order_detail('9a000000-0000-4000-8000-000000000001')->'grossCents','null'::jsonb,'Technician projection hides price');
select is(jsonb_array_length(public.work_order_detail('9a000000-0000-4000-8000-000000000001')->'visits'),1,'Technician sees own crew visits only');
select is(jsonb_array_length(public.calendar_work_visits('2030-03-04')),1,'Technician calendar contains own work only');
select throws_ok($$select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000002',2,'in_progress')$$,'42501',null,'Technician cannot start another crew visit');
select throws_ok($$select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',2,'cancelled')$$,'42501',null,'Technician cannot cancel office booking');
select is(public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',2,'in_progress')->>'state','in_progress','Assigned technician starts own montage');
select is(public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000001',3,'completed')->'visits'->0->>'state','completed','Assigned technician completes own montage date');
select throws_ok($$select public.change_work_order('9a000000-0000-4000-8000-000000000001',4,'completed')$$,'42501',null,'Technician cannot close entire order');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000005',true);
select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000002',4,'in_progress')->>'version';
select public.change_work_visit('9a000000-0000-4000-8000-000000000001','9b000000-0000-4000-8000-000000000002',5,'completed')->>'version';
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select is(public.change_work_order('9a000000-0000-4000-8000-000000000001',6,'completed')->>'state','completed','Office closes completed scope after every date is finished');
select is(public.change_work_order('9a000000-0000-4000-8000-000000000001',6,'completed')->>'version','7','Order closure retry is idempotent');
select throws_ok($$select public.schedule_work_visit('9a000000-0000-4000-8000-000000000001',7,'9b000000-0000-4000-8000-000000000003','2030-03-06T09:00',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'')$$,'40001',null,'Closed order cannot acquire new dates');
select public.create_work_order('9a000000-0000-4000-8000-000000000002','99000000-0000-4000-8000-000000000022','Inny adres','Kraków','')->>'id';
select public.schedule_work_visit('9a000000-0000-4000-8000-000000000002',0,'9b000000-0000-4000-8000-000000000003','2030-03-06T09:00',60,array['a7000000-0000-4000-8000-000000000003'::uuid],'')->>'version';
select is(public.change_work_order('9a000000-0000-4000-8000-000000000002',1,'cancelled')->'visits'->0->>'state','cancelled','Cancelling order cancels open dates');
select lives_ok($$select public.schedule_service_visit((select id from test_ticket),'2030-03-06T09:00',60)$$,'Cancelled montage releases calendar reservation');
select is(public.change_work_order('9a000000-0000-4000-8000-000000000002',2,'draft')->>'state','draft','Office can resume cancelled order without recreating scope');
select is(public.work_order_detail('9a000000-0000-4000-8000-000000000002')->'visits'->0->>'state','cancelled','Resuming does not restore cancelled reservations');
select is(public.update_work_address('9a000000-0000-4000-8000-000000000002',3,'Poprawiony adres','Gdańsk','80-001')->>'city','Gdańsk','Address can be corrected before work begins');
select throws_ok($$select public.update_work_address('9a000000-0000-4000-8000-000000000001',7,'Zmieniony adres','Gdańsk','')$$,'40001',null,'Completed order location remains frozen');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select is(public.portal_work_order('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021')->>'state','completed','Client sees progress at their accepted offer');
select ok(public.portal_work_order('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000021')::text !~ 'PRIVATE|crewIds|notes|a7000000','Client plan excludes notes and staff identities');
select throws_ok($$select public.portal_work_order('c7000000-0000-4000-8000-000000000002','99000000-0000-4000-8000-000000000021')$$,'42501',null,'Other customer progress denied');
select throws_ok($$select public.work_order_detail('9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Client cannot read operational detail');
reset role;
delete from public.staff_customer_assignments where user_id='a7000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.work_order_detail('9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Revoked customer assignment removes technician access');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000006',true);
select throws_ok($$select public.work_order_detail('9a000000-0000-4000-8000-000000000001')$$,'42501',null,'Unassigned technician cannot read order');
set local role anon;
select throws_ok($$select public.list_work_orders()$$,'42501',null,'Anonymous cannot list operational orders');
select * from finish();
rollback;
