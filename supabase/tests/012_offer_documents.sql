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
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.save_offer('98000000-0000-4000-8000-000000000001',pg_temp.body());
select is(public.offer_document_context('98000000-0000-4000-8000-000000000001')->'document','null'::jsonb,'No implicit writes on document context read');
select is(public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc(),null,0)->>'version','0','Create saved document snapshot');
select is(public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc(),null,0)->>'version','0','Exact create retry idempotent');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc(),0,1)$$,'40001',null,'Stale calculation blocks document save');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc()||'{"validUntil":"2026-10-01"}',0,0)$$,'22023',null,'Expiry precedes issue date rejected');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc()||'{"issuedOn":"2026-02-30"}',0,0)$$,'22023',null,'Invalid calendar date rejected');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc()||'{"companyName":""}',0,0)$$,'22023',null,'Empty company rejected');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc()||'{"forged":true}',0,0)$$,'22023',null,'Unexpected document fields rejected');
select throws_ok($$update public.offer_documents set data='{}'$$,'42501',null,'Raw metadata writes denied');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select is(public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc()||'{"companyName":"Biuro Firma"}',0,0)->>'version','1','Office may update metadata optimistically');
select is(public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc()||'{"companyName":"Biuro Firma"}',0,0)->>'version','1','Lost response retry is idempotent');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc(),0,0)$$,'40001',null,'Stale document cannot overwrite latest');
select is(public.offer_document_context('98000000-0000-4000-8000-000000000001')->'document'->'data'->>'companyName','Biuro Firma','Atomic context contains saved company snapshot');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select is((select count(*) from public.offer_documents),0::bigint,'Technician cannot read raw document metadata');
select throws_ok($$select public.offer_document_context('98000000-0000-4000-8000-000000000001')$$,'42501',null,'Technician cannot read PDF context');
select throws_ok($$select public.save_offer_document('98000000-0000-4000-8000-000000000001',pg_temp.doc(),1,0)$$,'42501',null,'Technician cannot modify document');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select is((select count(*) from public.offer_documents),0::bigint,'Client cannot read internal document settings');
select throws_ok($$select public.offer_document_context('98000000-0000-4000-8000-000000000001')$$,'42501',null,'Client cannot use staff export context');
reset role;
insert into public.account_access(user_id,blocked) values('a7000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select is((select count(*) from public.offer_documents),0::bigint,'Blocked staff cannot read settings');
select throws_ok($$select public.offer_document_context('98000000-0000-4000-8000-000000000001')$$,'42501',null,'Blocked staff cannot export');
set local role anon;
select throws_ok($$select public.offer_document_context('98000000-0000-4000-8000-000000000001')$$,'42501',null,'Anonymous cannot read context');
select throws_ok($$select * from public.offer_documents$$,'42501',null,'Anonymous cannot read raw metadata');
select * from finish();
rollback;
