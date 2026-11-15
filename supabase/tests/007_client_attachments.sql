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


insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values('a5000000-0000-4000-8000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','portal-member@test.local','x',now(),now(),now());
insert into public.customer_memberships(user_id,customer_id) values('a5000000-0000-4000-8000-000000000005','c5000000-0000-4000-8000-000000000001'),('a5000000-0000-4000-8000-000000000005','c5000000-0000-4000-8000-000000000003');
insert into public.service_tickets(id,installation_id,customer_id,subject,description) values('b5000000-0000-4000-8000-000000000004','e5000000-0000-4000-8000-000000000003','c5000000-0000-4000-8000-000000000003','Attachment limits','Test');
set local role anon;
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))$$,'42501',null,'Anonymous cannot upload attachments');
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is(public.can_attach_to_ticket('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002'),false,'Office preview has no client upload capability');
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))$$,'42501',null,'Office cannot impersonate client');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.can_attach_to_ticket('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002'),true,'Member can attach to active own customer ticket');
select is(public.can_attach_to_ticket('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001'),false,'Closed ticket does not accept uploads');
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000004','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))$$,'42501',null,'Cannot mix two owned customer contexts');
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000002','b5000000-0000-4000-8000-000000000003','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))$$,'42501',null,'Foreign customer rejected');
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000020','e5000000-0000-4000-8000-000000000001',null,'Bypass.pdf','manual',9,'application/pdf',repeat('a',64))$$,'42501',null,'Client cannot bypass scope through staff upload RPC');
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','../bad.jpg',9,'image/jpeg',repeat('a',64))$$,'22023',null,'Unsafe attachment name rejected');
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','Photo.jpg',10485761,'image/jpeg',repeat('a',64))$$,'22023',null,'Per-file limit enforced in database');
select is(public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))->>'upload_state','pending','Client reserves pending attachment');
select is(public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))->>'upload_state','pending','Pending retry reuses reservation');
select is(public.document_file('f5000000-0000-4000-8000-000000000020'),null::jsonb,'Pending attachment is not downloadable');
select is(public.can_upload_document('e5000000-0000-4000-8000-000000000001/f5000000-0000-4000-8000-000000000020/file.jpg'),true,'Owner may upload only to reserved key');
select throws_ok($$select public.finish_document('f5000000-0000-4000-8000-000000000020')$$,'22023',null,'Missing object cannot be finalized');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000005',true);
select is(public.can_upload_document('e5000000-0000-4000-8000-000000000001/f5000000-0000-4000-8000-000000000020/file.jpg'),false,'Another member cannot upload to this reservation');
select throws_ok($$select public.finish_document('f5000000-0000-4000-8000-000000000020')$$,'42501',null,'Another member cannot finalize reservation');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select lives_ok($$insert into storage.objects(bucket_id,name,metadata) values('hvac-documents','e5000000-0000-4000-8000-000000000001/f5000000-0000-4000-8000-000000000020/file.jpg','{"size":9,"mimetype":"image/jpeg"}')$$,'RLS permits reserved client upload');
reset role;
update public.service_tickets set status='closed' where id='b5000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.finish_document('f5000000-0000-4000-8000-000000000020')$$,'42501',null,'Ticket closed during upload blocks finalization');
select is(public.can_upload_document('e5000000-0000-4000-8000-000000000001/f5000000-0000-4000-8000-000000000020/file.jpg'),false,'Closed ticket blocks further Storage writes');
reset role;
update public.service_tickets set status='in_progress' where id='b5000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.finish_document('f5000000-0000-4000-8000-000000000020')::text,'f5000000-0000-4000-8000-000000000020','Client finalizes completed attachment');
select is((select uploaded_by_client from public.documents where id='f5000000-0000-4000-8000-000000000020'),true,'Client source is recorded');
select is((select visible_to_customer from public.documents where id='f5000000-0000-4000-8000-000000000020'),true,'Completed client attachment is visible in portal');
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000020')->>'file_name','Photo.jpg','Client can download own completed attachment');
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002',1,false,'c5000000-0000-4000-8000-000000000001')->'documents'->0->>'uploaded_by_client')::boolean,true,'List includes client source');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.change_document('f5000000-0000-4000-8000-000000000020',1,false,false)$$,'Office can hide a submitted file');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000020','Photo.jpg',9,'image/jpeg',repeat('a',64))->>'upload_state','ready','Completed retry does not create another attachment');
select is(public.finish_document('f5000000-0000-4000-8000-000000000020')::text,'f5000000-0000-4000-8000-000000000020','Completed finalization remains idempotent');
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000020'),null::jsonb,'Retry cannot silently re-share a hidden file');
select throws_ok($$select public.change_document('f5000000-0000-4000-8000-000000000020',2,true,false)$$,'42501',null,'Client cannot change visibility');
-- Nine more reservations, even without actual Storage bytes, consume count and rate quota.
do $$begin for i in 21..29 loop perform public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002',('f5000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'Small.jpg',9,'image/jpeg',repeat('a',64));end loop;end $$;
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000003','b5000000-0000-4000-8000-000000000004','f5000000-0000-4000-8000-000000000030','Small.jpg',9,'image/jpeg',repeat('a',64))$$,'P0001','Client attachment rate limit reached','Hourly quota counts pending reservations across customers');
select is(public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000021','Small.jpg',9,'image/jpeg',repeat('a',64))->>'upload_state','pending','Quota does not prevent retry of same upload');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000005',true);
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000030','Small.jpg',9,'image/jpeg',repeat('a',64))$$,'P0001','Client attachment ticket limit reached','Another member cannot bypass ticket count limit');
do $$begin for i in 31..35 loop perform public.prepare_client_attachment('c5000000-0000-4000-8000-000000000003','b5000000-0000-4000-8000-000000000004',('f5000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'Large.jpg',10485760,'image/jpeg',repeat('a',64));end loop;end $$;
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000003','b5000000-0000-4000-8000-000000000004','f5000000-0000-4000-8000-000000000036','Small.jpg',1,'image/jpeg',repeat('a',64))$$,'P0001','Client attachment ticket limit reached','50 MiB ticket budget counts pending reservations');
reset role;
insert into public.account_access(user_id,blocked) values('a5000000-0000-4000-8000-000000000005',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000005',true);
select is(public.can_upload_document('e5000000-0000-4000-8000-000000000003/f5000000-0000-4000-8000-000000000031/file.jpg'),false,'Blocked client loses reserved Storage upload');
select throws_ok($$select public.finish_document('f5000000-0000-4000-8000-000000000031')$$,'42501',null,'Blocked client cannot finalize pending file');
reset role;
update public.account_access set blocked=false where user_id='a5000000-0000-4000-8000-000000000005';
update public.customers set archived_at=now() where id='c5000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000005',true);
select is(public.can_upload_document('e5000000-0000-4000-8000-000000000003/f5000000-0000-4000-8000-000000000031/file.jpg'),false,'Archived customer loses pending upload capability');
select throws_ok($$select public.finish_document('f5000000-0000-4000-8000-000000000031')$$,'42501',null,'Archived customer cannot finalize');
reset role;
delete from public.customer_memberships where user_id='a5000000-0000-4000-8000-000000000003' and customer_id='c5000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.can_upload_document('e5000000-0000-4000-8000-000000000001/f5000000-0000-4000-8000-000000000021/file.jpg'),false,'Revoked membership invalidates a reservation');
select throws_ok($$select public.prepare_client_attachment('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002','f5000000-0000-4000-8000-000000000021','Small.jpg',9,'image/jpeg',repeat('a',64))$$,'42501',null,'Retry cannot bypass removed membership');
select * from finish();
rollback;
