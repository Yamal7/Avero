begin;
create extension if not exists pgtap with schema extensions;
select plan(46);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('a4000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','service-office@test.local','x',now(),now(),now()),
('a4000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','service-tech1@test.local','x',now(),now(),now()),
('a4000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','service-tech2@test.local','x',now(),now(),now()),
('a4000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','service-client-a@test.local','x',now(),now(),now()),
('a4000000-0000-4000-8000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','service-client-b@test.local','x',now(),now(),now());
insert into public.staff_users(user_id,role) values
('a4000000-0000-4000-8000-000000000001','office'),('a4000000-0000-4000-8000-000000000002','technician'),('a4000000-0000-4000-8000-000000000003','technician');
insert into public.customers(id,name) values('c4000000-0000-4000-8000-000000000001','SERVICE CUSTOMER A'),('c4000000-0000-4000-8000-000000000002','SERVICE CUSTOMER B');
insert into public.customer_memberships(user_id,customer_id) values('a4000000-0000-4000-8000-000000000004','c4000000-0000-4000-8000-000000000001'),('a4000000-0000-4000-8000-000000000005','c4000000-0000-4000-8000-000000000002');
insert into public.staff_customer_assignments(user_id,customer_id) values
('a4000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000001'),
('a4000000-0000-4000-8000-000000000003','c4000000-0000-4000-8000-000000000001'),
('a4000000-0000-4000-8000-000000000003','c4000000-0000-4000-8000-000000000002');
insert into public.locations(id,customer_id,address,city) values
('d4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','Street A','Town A'),
('d4000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000002','Street B','Town B');
insert into public.installations(id,location_id,type) values
('e4000000-0000-4000-8000-000000000001','d4000000-0000-4000-8000-000000000001','Heat pump'),
('e4000000-0000-4000-8000-000000000002','d4000000-0000-4000-8000-000000000002','AC');
select throws_ok($$insert into public.service_tickets(installation_id,customer_id,description) values('e4000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000001','Mismatch')$$,'P0001',null,'Database rejects mismatched installation/customer even for privileged writes');
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.update_service_ticket('f4000000-0000-4000-8000-000000000099','new','normal')$$,'P0001',null,'Missing ticket cannot produce a false success');
select set_config('test.ticket_a1',public.create_service_ticket('e4000000-0000-4000-8000-000000000001','A1','Problem A1','normal')::text,true);
select set_config('test.ticket_a2',public.create_service_ticket('e4000000-0000-4000-8000-000000000001','A2','Problem A2','normal')::text,true);
select set_config('test.ticket_b',public.create_service_ticket('e4000000-0000-4000-8000-000000000002','B','Problem B','high')::text,true);
select public.assign_service_ticket(current_setting('test.ticket_a1')::uuid,'a4000000-0000-4000-8000-000000000002');
select public.assign_service_ticket(current_setting('test.ticket_a2')::uuid,'a4000000-0000-4000-8000-000000000003');
select public.assign_service_ticket(current_setting('test.ticket_b')::uuid,'a4000000-0000-4000-8000-000000000003');
select throws_ok($$select public.assign_service_ticket(current_setting('test.ticket_b')::uuid,'a4000000-0000-4000-8000-000000000002')$$,'P0001',null,'Cannot assign technician without customer access');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select is((select count(*)::int from public.service_tickets),1,'Technician sees only its own assigned ticket');
select throws_ok($$select public.update_service_ticket(current_setting('test.ticket_a2')::uuid,'waiting','normal')$$,'42501',null,'Technician cannot edit another technician ticket');
select throws_ok($$select public.assign_service_ticket(current_setting('test.ticket_a1')::uuid,'a4000000-0000-4000-8000-000000000003')$$,'42501',null,'Technician cannot change assignment');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000004',true);
select is((select count(*)::int from public.service_tickets),2,'Client sees only own customer tickets');
select throws_ok($$select public.create_service_ticket('e4000000-0000-4000-8000-000000000002','Wrong','Wrong','normal')$$,'42501',null,'Client cannot report against other customer installation');
select throws_ok($$select public.create_service_ticket('e4000000-0000-4000-8000-000000000001','Priority','Priority','high')$$,'42501',null,'Client cannot set staff priority');
select throws_ok($$insert into public.service_tickets(installation_id,customer_id,description) values('e4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','Bypass')$$,'42501',null,'Direct ticket writes cannot bypass workflow');
select throws_ok($$select public.service_technicians(null)$$,'42501',null,'Client cannot list staff directory');
select set_config('test.client_ticket',public.create_service_ticket('e4000000-0000-4000-8000-000000000001','Retry','Retry','normal','f4000000-0000-4000-8000-000000000001')::text,true);
select is(public.create_service_ticket('e4000000-0000-4000-8000-000000000001','Retry','Retry','normal','f4000000-0000-4000-8000-000000000001')::text,current_setting('test.client_ticket'),'Repeated submission returns original ticket');
select throws_ok($$select public.create_service_ticket('e4000000-0000-4000-8000-000000000001','Different','Retry','normal','f4000000-0000-4000-8000-000000000001')$$,'22023',null,'Reused request id cannot silently return a different request');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000001',true);
select set_config('test.visit1',public.schedule_service_visit(current_setting('test.ticket_a1')::uuid,'2026-11-02T09:00',60,'Customer-visible note')::text,true);
select set_config('test.visit2',public.schedule_service_visit(current_setting('test.ticket_a2')::uuid,'2026-11-02T09:00',60,'')::text,true);
select throws_ok($$select public.assign_service_ticket(current_setting('test.ticket_a2')::uuid,'a4000000-0000-4000-8000-000000000002')$$,'23P01',null,'Changing technician also checks existing visit conflicts');
select lives_ok($$select public.schedule_service_visit(current_setting('test.ticket_a2')::uuid,'2026-11-02T10:00',60,'',current_setting('test.visit2')::uuid)$$,'Office reschedules planned visit');
select lives_ok($$select public.assign_service_ticket(current_setting('test.ticket_a2')::uuid,'a4000000-0000-4000-8000-000000000002')$$,'Back-to-back visits are allowed');
select throws_ok($$select public.schedule_service_visit(current_setting('test.ticket_a1')::uuid,'2026-11-02T09:30',60,'')$$,'23P01',null,'Overlapping appointments are rejected');
select throws_ok($$select public.schedule_service_visit(current_setting('test.ticket_a1')::uuid,'2027-03-28T02:30',60,'')$$,'22023',null,'Nonexistent Warsaw DST time is rejected');
select throws_ok($$select public.schedule_service_visit(current_setting('test.ticket_a1')::uuid,'2026-11-02T15:00',9999,'')$$,'22023',null,'Invalid duration rejected by database');
select throws_ok($$select public.assign_service_ticket(current_setting('test.ticket_a1')::uuid,null)$$,'P0001',null,'Planned visits cannot silently lose technician');
select throws_ok($$select public.update_service_ticket(current_setting('test.ticket_a2')::uuid,'closed','normal')$$,'P0001',null,'Ticket cannot close with planned visits');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000004',true);
select throws_ok($$select public.change_service_visit_state(current_setting('test.visit1')::uuid,'in_progress')$$,'42501',null,'Client cannot start service visit');
select is(jsonb_array_length(public.calendar_service_visits('2026-11-02')),2,'Client calendar contains own visits');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000005',true);
select is(jsonb_array_length(public.calendar_service_visits('2026-11-02')),0,'Other client calendar does not leak appointments');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select lives_ok($$select public.change_service_visit_state(current_setting('test.visit1')::uuid,'en_route')$$,'Assigned technician marks en route');
select lives_ok($$select public.change_service_visit_state(current_setting('test.visit1')::uuid,'in_progress')$$,'Assigned technician starts visit');
select throws_ok($$select public.change_service_visit_state(current_setting('test.visit1')::uuid,'completed')$$,'22023',null,'Completion requires a published protocol');
select throws_ok($$select public.change_service_visit_state(current_setting('test.visit1')::uuid,'cancelled')$$,'42501',null,'Technician cannot cancel appointment');
select set_config('test.protocol',public.save_service_protocol(current_setting('test.visit1')::uuid,'{"diagnosis":"INTERNAL DRAFT","work_performed":"","materials":"","measurements":"","recommendations":""}',0,false)::text,true);
select throws_ok($$select public.save_service_protocol(current_setting('test.visit1')::uuid,'{"diagnosis":"Stale","work_performed":"","materials":"","measurements":"","recommendations":""}',0,false)$$,'40001',null,'Stale protocol version cannot overwrite another edit');
select throws_ok($$select public.save_service_protocol(current_setting('test.visit1')::uuid,'{"diagnosis":"","work_performed":"","materials":"","measurements":"","recommendations":""}',1,true)$$,'22023',null,'Publishing requires diagnosis and performed work');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000004',true);
select is((select count(*)::int from public.service_protocols),0,'Client cannot read draft protocol directly');
select throws_ok($$select public.save_service_protocol(current_setting('test.visit1')::uuid,'{"diagnosis":"Forged","work_performed":"Forged","materials":"","measurements":"","recommendations":""}',1,true)$$,'42501',null,'Client cannot publish protocol');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.schedule_service_visit(current_setting('test.ticket_a1')::uuid,'2026-11-03T09:00',60,'',current_setting('test.visit1')::uuid)$$,'P0001',null,'Office cannot reschedule a started visit');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select lives_ok($$select public.save_service_protocol(current_setting('test.visit1')::uuid,'{"diagnosis":"Filter blocked","work_performed":"Replaced filter","materials":"Filter 1 pc","measurements":"Supply 35 C","recommendations":"Check in 12 months"}',1,true)$$,'Technician publishes completed work');
select is((select status from public.service_visits where id=current_setting('test.visit1')::uuid),'completed','Publishing atomically completes visit');
select is((select version from public.service_protocols where id=current_setting('test.protocol')::uuid),2,'Publishing increments protocol version');
select lives_ok($$select public.update_service_ticket(current_setting('test.ticket_a1')::uuid,'closed','normal')$$,'Technician closes completed ticket with protocol');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000004',true);
select is((select count(*)::int from public.service_protocols),1,'Client can read published protocol');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000005',true);
select is((select count(*)::int from public.service_protocols),0,'Other client cannot read protocol by guessing id');
reset role;
select throws_ok($$update public.service_protocols set diagnosis='Tampered' where id=current_setting('test.protocol')::uuid$$,'P0001',null,'Published protocol protected even against ordinary privileged update');
select throws_ok($$delete from public.service_protocols where id=current_setting('test.protocol')::uuid$$,'P0001',null,'Published protocol cannot be deleted');
update public.customers set name='SERVICE CUSTOMER A RENAMED' where id='c4000000-0000-4000-8000-000000000001';
select is((select snapshot->>'customer_name' from public.service_protocols where id=current_setting('test.protocol')::uuid),'SERVICE CUSTOMER A','Protocol preserves historical customer snapshot');
select ok(exists(select 1 from public.audit_logs where table_name='service_protocols' and row_id=current_setting('test.protocol')::uuid and actor_id='a4000000-0000-4000-8000-000000000002' and action='UPDATE'),'Publishing records acting technician in audit');
insert into public.account_access(user_id,blocked) values('a4000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.change_service_visit_state(current_setting('test.visit2')::uuid,'in_progress')$$,'42501',null,'Blocked technician cannot act with existing session');
select is((select count(*)::int from public.service_tickets),0,'Blocked technician cannot read assigned work');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000001',true);
select public.schedule_service_visit(current_setting('test.ticket_b')::uuid,'2026-11-01T23:30',120,'Overnight');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000005',true);
select is(jsonb_array_length(public.calendar_service_visits('2026-11-02')),1,'Calendar includes visit continuing from previous week');
select * from finish();
rollback;
