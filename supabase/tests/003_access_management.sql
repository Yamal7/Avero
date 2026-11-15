begin;
create extension if not exists pgtap with schema extensions;
select plan(33);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('a3000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','access-admin@test.local','x',now(),now(),now()),
('a3000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','access-office@test.local','x',now(),now(),now()),
('a3000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','access-tech@test.local','x',now(),now(),now()),
('a3000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','access-client@test.local','x',now(),now(),now()),
('a3000000-0000-4000-8000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','access-other@test.local','x',now(),now(),now()),
('a3000000-0000-4000-8000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','access-new@test.local','x',null,now(),now());
insert into public.staff_users(user_id,role) values
('a3000000-0000-4000-8000-000000000001','admin'),('a3000000-0000-4000-8000-000000000002','office'),('a3000000-0000-4000-8000-000000000003','technician');
insert into public.customers(id,name) values
('c3000000-0000-4000-8000-000000000001','ACCESS CUSTOMER A'),('c3000000-0000-4000-8000-000000000002','ACCESS CUSTOMER B');
insert into public.locations(id,customer_id,address,city) values
('d3000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000001','A','Town'),
('d3000000-0000-4000-8000-000000000002','c3000000-0000-4000-8000-000000000002','B','Town');
insert into public.installations(id,location_id,type) values
('e3000000-0000-4000-8000-000000000001','d3000000-0000-4000-8000-000000000001','Pump'),
('e3000000-0000-4000-8000-000000000002','d3000000-0000-4000-8000-000000000002','Pump');
insert into public.staff_customer_assignments(user_id,customer_id) values('a3000000-0000-4000-8000-000000000003','c3000000-0000-4000-8000-000000000001');
insert into public.customer_memberships(user_id,customer_id) values('a3000000-0000-4000-8000-000000000004','c3000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000002',true);
select is(public.can_manage_crm(),true,'Office can manage CRM');
select throws_ok($$select public.list_access_users()$$,'42501',null,'Office cannot list auth accounts');
select throws_ok($$select public.set_access_role('a3000000-0000-4000-8000-000000000002','admin')$$,'42501',null,'Office cannot promote itself');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000003',true);
select is(public.can_manage_crm(),false,'Technician cannot manage CRM');
select is((select count(*)::int from public.customers where id in('c3000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000002')),1,'Technician sees assigned customer only');
select is((select count(*)::int from public.installations where id in('e3000000-0000-4000-8000-000000000001','e3000000-0000-4000-8000-000000000002')),1,'Technician sees assigned installation only');
select throws_ok($$insert into public.customers(name) values('Denied technician write')$$,'42501',null,'Technician cannot write CRM');
select throws_ok($$select public.preview_customer_import('[]')$$,'42501',null,'Technician cannot call import RPC directly');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000004',true);
select is((select count(*)::int from public.customers where id in('c3000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000002')),1,'Client sees own customer only');
select throws_ok($$select public.set_customer_access('a3000000-0000-4000-8000-000000000004','c3000000-0000-4000-8000-000000000001','member')$$,'42501',null,'Client cannot assign itself another customer');
select throws_ok($$select public.list_access_activity()$$,'42501',null,'Client cannot read access audit');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.set_access_blocked('a3000000-0000-4000-8000-000000000004',true)$$,'Administrator blocks client');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000004',true);
select is((select count(*)::int from public.customers),0,'Blocked user loses access with same session claims');
select is(public.current_access()->>'blocked','true','Blocked status is returned to application');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.set_access_blocked('a3000000-0000-4000-8000-000000000004',false)$$,'Administrator restores access');
select set_config('test.access_invite',public.create_access_invitation('access-new@test.local','client','c3000000-0000-4000-8000-000000000001')::text,true);
select is((select count(*)::int from public.customers where id in('c3000000-0000-4000-8000-000000000001','c3000000-0000-4000-8000-000000000002')),2,'Admin retains CRM access');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000005',true);
select throws_ok($$select public.accept_access_invitation(current_setting('test.access_invite')::uuid)$$,'42501',null,'Different email cannot accept invitation');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000006',true);
select throws_ok($$select public.accept_access_invitation(current_setting('test.access_invite')::uuid)$$,'42501',null,'Unverified email cannot accept invitation');
reset role;
update auth.users set email_confirmed_at=now() where id='a3000000-0000-4000-8000-000000000006';
set local role authenticated;
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000006',true);
select lives_ok($$select public.accept_access_invitation(current_setting('test.access_invite')::uuid)$$,'Verified recipient accepts invitation');
select lives_ok($$select public.accept_access_invitation(current_setting('test.access_invite')::uuid)$$,'Repeated acceptance is idempotent');
select is((select count(*)::int from public.customers),1,'New client sees invited customer only');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000001',true);
select set_config('test.revoked_invite',public.create_access_invitation('access-other@test.local','client','c3000000-0000-4000-8000-000000000002')::text,true);
select public.revoke_access_invitation(current_setting('test.revoked_invite')::uuid);
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000005',true);
select throws_ok($$select public.accept_access_invitation(current_setting('test.revoked_invite')::uuid)$$,'P0001',null,'Revoked invitation cannot grant access');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000001',true);
select set_config('test.expired_invite',public.create_access_invitation('access-other@test.local','technician',null)::text,true);
reset role;
update public.access_invitations set expires_at=now()-interval '1 minute' where id=current_setting('test.expired_invite')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000005',true);
select throws_ok($$select public.accept_access_invitation(current_setting('test.expired_invite')::uuid)$$,'P0001',null,'Expired invitation cannot grant access');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.set_customer_access('a3000000-0000-4000-8000-000000000003','c3000000-0000-4000-8000-000000000001','technician',true)$$,'Admin removes technician assignment');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000003',true);
select is((select count(*)::int from public.installations),0,'Removing assignment immediately removes technician access');
select set_config('request.jwt.claim.sub','a3000000-0000-4000-8000-000000000001',true);
select throws_ok($$insert into public.staff_users(user_id,role) values('a3000000-0000-4000-8000-000000000005','admin')$$,'42501',null,'No direct writes to role table, even by admin');
select throws_ok($$select count(*) from public.access_audit_logs$$,'42501',null,'Audit table has no direct client SELECT');
select set_config('test.delivery_invite',public.create_access_invitation('access-other@test.local','client','c3000000-0000-4000-8000-000000000001')::text,true);
select lives_ok($$select public.reserve_invitation_delivery(current_setting('test.delivery_invite')::uuid)$$,'First delivery attempt is reserved');
select throws_ok($$select public.reserve_invitation_delivery(current_setting('test.delivery_invite')::uuid)$$,'P0001',null,'Repeated delivery is rate limited');
reset role;
select ok(exists(select 1 from public.access_audit_logs where actor_id='a3000000-0000-4000-8000-000000000001' and action='account_access:INSERT'),'Access change records the acting administrator');
-- Keep either the fixture admin (fresh DB) or the existing bootstrap admin.
-- No existing administrator role is changed by this test.
do $$ begin
 if exists(select 1 from public.staff_users where role='admin' and user_id<>'a3000000-0000-4000-8000-000000000001') then
 update public.staff_users set role='office' where user_id='a3000000-0000-4000-8000-000000000001';
 end if;
end $$;
select set_config('test.admin_count',(select count(*)::text from public.staff_users where role='admin' and public.account_enabled(user_id)),true);
select set_config('request.jwt.claim.sub',(select user_id::text from public.staff_users where role='admin' order by created_at limit 1),true);
set local role authenticated;
select throws_ok($$select public.set_access_blocked(auth.uid(),true)$$,'P0001',null,'Last active administrator cannot be blocked') where current_setting('test.admin_count')='1';
select throws_ok($$select public.set_access_role(auth.uid(),'office')$$,'P0001',null,'Last active administrator cannot be demoted') where current_setting('test.admin_count')='1';
select skip('Last-admin scenario requires an isolated DB with at most one bootstrap admin',2) where current_setting('test.admin_count')<>'1';
select lives_ok($$select public.list_access_users('access-',1)$$,'Administrator can list accounts through guarded RPC');
select * from finish();
rollback;
