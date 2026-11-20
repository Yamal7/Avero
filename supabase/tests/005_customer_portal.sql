begin;
create extension if not exists pgtap with schema extensions;
select plan(43);
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
select throws_ok($$select public.portal_account_options()$$,'42501',null,'Anonymous cannot enumerate portal accounts');
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(jsonb_array_length(public.portal_account_options()),2,'Client sees own memberships only');
select is(jsonb_array_length(public.portal_account_options('PORTAL B')),0,'Account search cannot reveal another customer');
select is(public.portal_context(null)->'customer'->>'id','c5000000-0000-4000-8000-000000000001','Client gets a deterministic default context');
select is(public.portal_context(null)->>'preview','false','Client is not a staff preview');
select throws_ok($$select public.portal_context('c5000000-0000-4000-8000-000000000002')$$,'42501',null,'Forged customer context rejected');
select is((public.portal_installations('c5000000-0000-4000-8000-000000000001')->>'total')::int,1,'Installations restricted to selected customer');
select is((public.portal_installations('c5000000-0000-4000-8000-000000000001','SERIAL-PORTAL-A')->>'total')::int,1,'Finds own installation by serial');
select is((public.portal_installations('c5000000-0000-4000-8000-000000000001','SERIAL-PORTAL-B')->>'total')::int,0,'Serial search does not cross customer scope');
select is(public.portal_installation('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000003'),null::jsonb,'Detail cannot mix two owned customer contexts');
select is(jsonb_array_length(public.portal_installation('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001')->'devices'),1,'Device detail includes only the selected installation');
select is(public.portal_overview('c5000000-0000-4000-8000-000000000001')->>'next_due_on','2026-12-01','Overview includes own maintenance date');
select is((public.portal_overview('c5000000-0000-4000-8000-000000000001')->>'documents')::int,2,'Document count excludes draft and internal file');
select is((public.portal_tickets('c5000000-0000-4000-8000-000000000001','all')->>'total')::int,2,'Ticket list is scoped');
select is(public.portal_ticket('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000003'),null::jsonb,'Foreign ticket id returns no data');
select is(public.portal_ticket('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002')->'visits'->0->'protocol','null'::jsonb,'Ticket detail never embeds a draft protocol');
select is((public.portal_visits('c5000000-0000-4000-8000-000000000001','active')->>'total')::int,1,'Active visits scoped to customer');
select is((public.portal_visits('c5000000-0000-4000-8000-000000000001','history')->>'total')::int,1,'Completed visits available in history');
select is((public.portal_documents('c5000000-0000-4000-8000-000000000001')->>'total')::int,2,'Client sees published protocol and shared file');
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000002'),null::jsonb,'Internal file cannot be downloaded by id');
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000003'),null::jsonb,'Foreign file cannot be downloaded by id');
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000001')->>'storage_path','portal/a/manual.pdf','Shared file lookup resolves permitted object');
select is(public.portal_protocol('c5000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000002'),null::jsonb,'Draft cannot be opened as protocol');
select is(public.portal_protocol('c5000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000003'),null::jsonb,'Foreign published protocol cannot be opened');
select is(public.portal_protocol('c5000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001')->>'diagnosis','Diagnosis A','Published own protocol is available');
select is(public.portal_account('c5000000-0000-4000-8000-000000000001')->>'email','a@example.test','Account data uses the selected customer');
select throws_ok($$select public.portal_create_ticket('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000003','Wrong scope','Wrong scope','75000000-0000-4000-8000-000000000001')$$,'42501',null,'Ticket creation cannot mix owned customer contexts');
select set_config('test.portal_ticket',public.portal_create_ticket('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Portal request','Portal request','75000000-0000-4000-8000-000000000001')::text,true);
select is(public.portal_create_ticket('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Portal request','Portal request','75000000-0000-4000-8000-000000000001')::text,current_setting('test.portal_ticket'),'Portal retry does not create duplicate');
select is(public.portal_ticket('c5000000-0000-4000-8000-000000000001',current_setting('test.portal_ticket')::uuid)->>'priority','normal','Client ticket has normal priority');
select throws_ok($$select public.portal_installations('c5000000-0000-4000-8000-000000000001','',0)$$,'22023',null,'Invalid pagination is rejected');

select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000001',true);
select is(public.portal_context(null)->'customer','null'::jsonb,'Office preview requires explicit customer selection');
select is(public.portal_context('c5000000-0000-4000-8000-000000000001')->>'preview','true','Office is explicitly marked as preview');
select is((public.portal_documents('c5000000-0000-4000-8000-000000000001')->>'total')::int,2,'Office preview also excludes internal documents and drafts');
select is(public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000002'),null::jsonb,'Office preview cannot download internal file');
select is(public.portal_ticket('c5000000-0000-4000-8000-000000000001','b5000000-0000-4000-8000-000000000002')->'visits'->0->'protocol','null'::jsonb,'Office preview does not embed drafts');
select throws_ok($$select public.portal_create_ticket('c5000000-0000-4000-8000-000000000001','e5000000-0000-4000-8000-000000000001','Impersonation','No','75000000-0000-4000-8000-000000000002')$$,'42501',null,'Staff preview cannot submit as client');
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.portal_overview('c5000000-0000-4000-8000-000000000001')$$,'42501',null,'Technician assignment does not become a client membership');

reset role;
update public.customers set archived_at=now() where id='c5000000-0000-4000-8000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select is(public.portal_context('c5000000-0000-4000-8000-000000000003')->'customer'->>'name','PORTAL C','Archived membership retains history context');
select is(jsonb_array_length(public.portal_installation_options('c5000000-0000-4000-8000-000000000003')),0,'Archived customer has no new-ticket installation options');
select throws_ok($$select public.portal_create_ticket('c5000000-0000-4000-8000-000000000003','e5000000-0000-4000-8000-000000000003','Archived','Archived','75000000-0000-4000-8000-000000000003')$$,'42501',null,'Archived customer cannot create tickets');
reset role;
insert into public.account_access(user_id,blocked) values('a5000000-0000-4000-8000-000000000003',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a5000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.portal_overview('c5000000-0000-4000-8000-000000000001')$$,'42501',null,'Existing blocked session cannot load overview');
select throws_ok($$select public.portal_file('c5000000-0000-4000-8000-000000000001','f5000000-0000-4000-8000-000000000001')$$,'42501',null,'Existing blocked session cannot resolve a download');
select throws_ok($$select public.portal_account_options()$$,'42501',null,'Blocked user cannot enumerate own accounts');
select * from finish();
rollback;
