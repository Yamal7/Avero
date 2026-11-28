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
set local role authenticated;
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select public.save_offer('98000000-0000-4000-8000-000000000002',pg_temp.body())->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000002',pg_temp.valid_doc(),null,0)->>'version';
select throws_ok($$select public.publish_offer('99000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002',1,0,'JVBERi1maXh0dXJl')$$,'40001',null,'Stale calculation cannot be published');
select throws_ok($$select public.publish_offer('99000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002',0,1,'JVBERi1maXh0dXJl')$$,'40001',null,'Stale PDF metadata cannot be published');
select throws_ok($$select public.publish_offer('99000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002',0,0,'bm90LXBkZg==')$$,'22023',null,'Wrong PDF signature rejected');
select is(public.publish_offer('99000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002',0,0,'JVBERi1maXh0dXJl')->>'revision','1','Staff publishes first edition');
select is(public.publish_offer('99000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002',0,0,'JVBERi1maXh0dXJl')->>'revision','1','Publication retry is idempotent');
select is(public.publish_offer('99000000-0000-4000-8000-000000000009','98000000-0000-4000-8000-000000000002',0,0,'JVBERi1maXh0dXJl')->>'id','99000000-0000-4000-8000-000000000001','Same saved versions do not create duplicate active edition');
select ok((public.staff_offer_publications('98000000-0000-4000-8000-000000000002')->'items'->0->'snapshot')::text !~ 'SECRET|costCents|profitCents|internalNote|targetMargin|catalogId','Publication contains no internal fields or private note');
select is(public.staff_offer_publications('98000000-0000-4000-8000-000000000002')->'items'->0->'snapshot'->'variants'->0->>'grossCents','8481','Frozen customer prices equal server calculation');
select throws_ok($$update public.offer_publications set snapshot='{}'$$,'42501',null,'Raw publication mutation denied');
select throws_ok($$select * from public.offer_publication_files$$,'42501',null,'Even staff cannot read PDF blobs directly');
select throws_ok($$select public.offer_publication_json('99000000-0000-4000-8000-000000000001')$$,'42501',null,'Internal projection helper is not public');
select public.save_offer('98000000-0000-4000-8000-000000000002',pg_temp.body()||jsonb_build_object('title','Updated private draft','variants',jsonb_build_array(pg_temp.variant()||'{"overrideNetCents":1000}')),0)->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000002',pg_temp.valid_doc()||'{"companyName":"Updated company"}',0,1)->>'version';
select is(public.portal_offer('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001')->'snapshot'->>'title','Klimatyzacja test oferty','Draft edit cannot change published title');
select is(public.portal_offer('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001')->'document'->>'companyName','Test Firma','Company edit cannot change frozen terms');
select is(regexp_replace(public.offer_publication_pdf('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001')->>'base64','\s','','g'),'JVBERi1maXh0dXJl','Stored PDF bytes remain unchanged');
select is(public.publish_offer('99000000-0000-4000-8000-000000000002','98000000-0000-4000-8000-000000000002',1,1,'JVBERi1maXh0dXJl')->>'revision','2','New saved versions create edition two');
select is(public.portal_offer('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001')->>'state','superseded','Previous edition is superseded');
select is(public.portal_offer('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002')->'snapshot'->'variants'->0->>'grossCents','1220','Published price includes allocated final-price correction and mixed VAT');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000001',true)$$,'42501',null,'Office preview cannot accept even with customer membership');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select throws_ok($$select count(*) from public.offer_publications$$,'42501',null,'Clients cannot read raw publication table');
select is(public.portal_offers('c7000000-0000-4000-8000-000000000001')->>'total','2','Customer sees only deliberately published editions');
select throws_ok($$select public.portal_offers('c7000000-0000-4000-8000-000000000002')$$,'42501',null,'Other customer list denied');
select throws_ok($$select public.offer_publication_pdf('c7000000-0000-4000-8000-000000000002','99000000-0000-4000-8000-000000000002')$$,'42501',null,'Other customer PDF denied');
select throws_ok($$select public.publish_offer('99000000-0000-4000-8000-000000000003','98000000-0000-4000-8000-000000000002',1,1,'JVBERi1maXh0dXJl')$$,'42501',null,'Customer cannot publish');
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001','e7000000-0000-4000-8000-000000000001',true)$$,'40001',null,'Superseded edition cannot be accepted');
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000001',false)$$,'22023',null,'Explicit confirmation is required');
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000099',true)$$,'22023',null,'Variant outside frozen offer rejected');
reset role;
update public.offer_publications set document=jsonb_set(document,'{validUntil}',to_jsonb(to_char((now() at time zone 'Europe/Warsaw')::date-1,'YYYY-MM-DD'))) where id='99000000-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000001',true)$$,'40001',null,'Expired edition cannot be accepted');
reset role;
update public.offer_publications set document=jsonb_set(document,'{validUntil}',pg_temp.valid_doc()->'validUntil') where id='99000000-0000-4000-8000-000000000002';
set local role authenticated;
select is(public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000001',true)->>'state','accepted','Assigned client accepts exact frozen variant');
select is(public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000001',true)->>'selectedVariantId','e7000000-0000-4000-8000-000000000001','Accepted choice survives retries');
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002','e7000000-0000-4000-8000-000000000099',true)$$,'40001',null,'Decision cannot be overwritten with another variant');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.withdraw_offer_publication('99000000-0000-4000-8000-000000000002')$$,'40001',null,'Accepted edition cannot be withdrawn');
select throws_ok($$select public.publish_offer('99000000-0000-4000-8000-000000000003','98000000-0000-4000-8000-000000000002',1,1,'JVBERi1maXh0dXJl')$$,'40001',null,'Accepted offer cannot be republished');
select is(public.offer_publication_summaries(array['98000000-0000-4000-8000-000000000002'::uuid])->0->>'state','accepted','Staff list exposes acceptance status');
select is(public.offer_publication_summaries(array['98000000-0000-4000-8000-000000000002'::uuid])->0->>'grossCents','1220','Staff list shows accepted frozen price rather than a later draft');
-- KRA-76: authenticated nie ma SELECT na offer_publications — kolumnę sprawdzamy jako postgres.
reset role;
select is((select accepted_by::text from public.offer_publications where id='99000000-0000-4000-8000-000000000002'),'a7000000-0000-4000-8000-000000000004','Acceptance identity comes from authenticated client, not request data');
set local role authenticated;
select public.save_offer('98000000-0000-4000-8000-000000000004',pg_temp.body())->>'version';
select public.save_offer_document('98000000-0000-4000-8000-000000000004',pg_temp.valid_doc(),null,0)->>'version';
select public.publish_offer('99000000-0000-4000-8000-000000000004','98000000-0000-4000-8000-000000000004',0,0,'JVBERi1maXh0dXJl')->>'revision';
select is(public.withdraw_offer_publication('99000000-0000-4000-8000-000000000004')->>'state','withdrawn','Staff may withdraw a pending edition');
select is(public.withdraw_offer_publication('99000000-0000-4000-8000-000000000004')->>'state','withdrawn','Withdrawal retry is idempotent');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.accept_offer_publication('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000004','e7000000-0000-4000-8000-000000000001',true)$$,'40001',null,'Withdrawn edition cannot be accepted');
select ok(public.offer_publication_pdf('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000004') is not null,'Historical PDF remains available to its customer');
reset role;
insert into public.account_access(user_id,blocked) values('a7000000-0000-4000-8000-000000000004',true);
set local role authenticated;
select throws_ok($$select public.portal_offers('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Blocked customer cannot read publications');
select throws_ok($$select public.offer_publication_pdf('c7000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000002')$$,'42501',null,'Blocked customer cannot download PDF');
select set_config('request.jwt.claim.sub','a7000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.portal_offers('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Technician cannot read publications');
set local role anon;
select throws_ok($$select public.portal_offers('c7000000-0000-4000-8000-000000000001')$$,'42501',null,'Anonymous cannot access portal offers');
select * from finish();
rollback;
