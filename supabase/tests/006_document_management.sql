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


set local role anon;
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000010','e5000000-0000-4000-8000-000000000001',null,'x.pdf','manual',9,'application/pdf',repeat('a',64))$$,'42501',null,'Anonymous cannot prepare uploads');
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is(public.prepare_document('f5000000-0000-4000-8000-000000000010','e5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001','Report.pdf','manual',9,'application/pdf',repeat('a',64))->>'upload_state','pending','Office prepares a hidden pending upload');
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001')->>'total')::int,2,'Incomplete file is not listed');
select is((select count(*)::int from public.documents where id='f5000000-0000-4000-8000-000000000010'),0,'Pending metadata is hidden even from ordinary staff SELECT');
select throws_ok($$select public.finish_document('f5000000-0000-4000-8000-000000000010')$$,'22023',null,'Cannot finalize a missing Storage object');
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000011','e5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000003','Wrong.pdf','manual',9,'application/pdf',repeat('a',64))$$,'42501',null,'Cannot attach a file to a ticket of another installation');
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000011','e5000000-0000-4000-8000-000000000001',null,'../file.pdf','manual',9,'application/pdf',repeat('a',64))$$,'22023',null,'Path traversal in a file name rejected');
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000011','e5000000-0000-4000-8000-000000000001',null,'x.pdf','manual',10485761,'application/pdf',repeat('a',64))$$,'22023',null,'Oversized metadata rejected');
select throws_ok($$insert into public.documents(installation_id,storage_path,file_name,document_type) values('e5000000-0000-4000-8000-000000000001','bypass','bypass','manual')$$,'42501',null,'Direct metadata writes cannot bypass lifecycle');
select throws_ok($$insert into storage.objects(bucket_id,name,metadata) values('hvac-documents','arbitrary/path.pdf','{"size":9,"mimetype":"application/pdf"}')$$,'42501',null,'Cannot upload an unreserved object key');
select lives_ok($$insert into storage.objects(bucket_id,name,metadata) values('hvac-documents','e5000000-0000-4000-8000-000000000001/f5000000-0000-4000-8000-000000000010/file.pdf','{"size":9,"mimetype":"application/pdf"}')$$,'Can upload only to a pending reserved key');
select is(public.finish_document('f5000000-0000-4000-8000-000000000010')::text,'f5000000-0000-4000-8000-000000000010','Finalization publishes complete internal metadata');
select is(public.prepare_document('f5000000-0000-4000-8000-000000000010','e5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001','Report.pdf','manual',9,'application/pdf',repeat('a',64))->>'upload_state','ready','Same request can be retried without duplication');
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000010','e5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001','Report.pdf','manual',9,'application/pdf',repeat('b',64))$$,'40001',null,'Retry cannot replace content');
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000001')->>'total')::int,1,'Ticket list includes only linked attachments');
select is((select count(*)::int from storage.objects where bucket_id='hvac-documents'),1,'Office can read the completed internal object');
with changed as (update storage.objects set metadata='{}' where bucket_id='hvac-documents' returning *) select is(count(*)::int,0,'Completed objects cannot be overwritten') from changed;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.document_file('f5000000-0000-4000-8000-000000000010'),null::jsonb,'Client cannot resolve an internal attachment');
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001',null,1,false,'c5000000-0000-4000-8000-000000000001')->>'total')::int,1,'Client list excludes internal and pending files');
select throws_ok($$select public.installation_documents('e5000000-0000-4000-8000-000000000001',null,1,false,'c5000000-0000-4000-8000-000000000003')$$,'42501',null,'Cannot mix two owned customer contexts');
select throws_ok($$select public.installation_documents('e5000000-0000-4000-8000-000000000002',null,1,false,'c5000000-0000-4000-8000-000000000001')$$,'42501',null,'Cannot enumerate a foreign installation');
select throws_ok($$select public.change_document('f5000000-0000-4000-8000-000000000010',1,true,false)$$,'42501',null,'Client cannot share a document');
select is((select count(*)::int from storage.objects where bucket_id='hvac-documents'),0,'Storage independently denies internal file');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.change_document('f5000000-0000-4000-8000-000000000010',1,true,false)$$,'Office explicitly shares file');
select throws_ok($$select public.change_document('f5000000-0000-4000-8000-000000000010',1,false,false)$$,'40001',null,'Stale version cannot overwrite a sharing change');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000010')->>'file_name','Report.pdf','Shared attachment is downloadable in portal');
select is((select count(*)::int from storage.objects where bucket_id='hvac-documents'),1,'Shared object becomes readable');
select is((public.portal_documents('c5000000-0000-4000-8000-000000000001')->>'total')::int,3,'Shared attachment is also included in document library');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000002',true);
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001')->>'total')::int,3,'Assigned technician can read installation files');
select throws_ok($$select public.prepare_document('f5000000-0000-4000-8000-000000000011','e5000000-0000-4000-8000-000000000001',null,'x.pdf','manual',9,'application/pdf',repeat('a',64))$$,'42501',null,'Technician cannot upload in this iteration');
select throws_ok($$select public.installation_documents('e5000000-0000-4000-8000-000000000001',null,1,true)$$,'42501',null,'Technician cannot open archive');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001',null,1,false,'c5000000-0000-4000-8000-000000000001')->>'total')::int,2,'Staff portal preview excludes internal files');
select lives_ok($$select public.change_document('f5000000-0000-4000-8000-000000000010',2,false,true)$$,'Office archives file and revokes sharing');
select is(public.document_file('f5000000-0000-4000-8000-000000000010'),null::jsonb,'Archived file cannot be downloaded even by staff');
select is((public.installation_documents('e5000000-0000-4000-8000-000000000001',null,1,true)->>'total')::int,1,'Office can inspect archive metadata');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000010'),null::jsonb,'Old portal URL no longer resolves archived file');
select is((select count(*)::int from storage.objects where bucket_id='hvac-documents'),0,'Old Storage path also denied after archive');
select is((public.portal_documents('c5000000-0000-4000-8000-000000000001')->>'total')::int,2,'Archived file disappears from portal count');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.change_document('f5000000-0000-4000-8000-000000000010',3,false,false)$$,'File restored as internal');
select is((select visible_to_customer from public.documents where id='f5000000-0000-4000-8000-000000000010'),false,'Restore does not silently re-share');
reset role;
select is((select count(*)::int from public.audit_logs where table_name='documents' and row_id='f5000000-0000-4000-8000-000000000010'),5,'Prepare, finish, share, archive, restore are audited');
insert into public.account_access(user_id,blocked) values('a5000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.installation_documents('e5000000-0000-4000-8000-000000000001')$$,'42501',null,'Blocked staff cannot list files with old session');
select is((select count(*)::int from storage.objects where bucket_id='hvac-documents'),0,'Blocked staff loses object access');
select * from finish();
rollback;
