begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('ab000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','details-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,4) n;
insert into public.staff_users(user_id,role) values('ab000000-0000-4000-8000-000000000001','office'),('ab000000-0000-4000-8000-000000000002','technician'),('ab000000-0000-4000-8000-000000000003','technician');
insert into public.customers(id,name) values('cb000000-0000-4000-8000-000000000001','Klient Detale');
insert into public.staff_customer_assignments(user_id,customer_id) values('ab000000-0000-4000-8000-000000000002','cb000000-0000-4000-8000-000000000001'),('ab000000-0000-4000-8000-000000000003','cb000000-0000-4000-8000-000000000001');
create function pg_temp.task(n integer,who integer) returns jsonb language sql as $$select public.save_crm_record('cb000000-0000-4000-8000-000000000001','tasks',('db000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,null,jsonb_build_object('title','Zadanie '||n,'description','','kind','general','dueOn',to_char((now() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'assigneeId','ab000000-0000-4000-8000-'||lpad(who::text,12,'0'),'contactId',null,'state','todo','result',''))$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','ab000000-0000-4000-8000-000000000001',true);
select pg_temp.task(1,2),pg_temp.task(2,3);
select ok((pg_temp.task(1,2)->>'number')::bigint>=100,'Task gets a sequential number');
select isnt(pg_temp.task(1,2)->>'number',pg_temp.task(2,3)->>'number','Numbers are unique');
select is(pg_temp.task(1,2)->>'priority','none','Default priority is none');

select set_config('request.jwt.claim.sub','ab000000-0000-4000-8000-000000000002',true);
select is(public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001',0,'high','purchasing')->>'version','1','Assignee sets priority and label; version bumps');
select is(public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001',1,'high','purchasing')->>'label','purchasing','Label stored');
select throws_ok($$select public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001',0,'low',null)$$,'40001',null,'Stale version refused');
select throws_ok($$select public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000002',0,'low',null)$$,'42501',null,'Other technician task refused');
select throws_ok($$select public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001',1,'critical',null)$$,'22023',null,'Unknown priority refused');
select is(public.add_crm_task_comment('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001','eb000000-0000-4000-8000-000000000001','Odbiór jutro o 7:30.')->>'body','Odbiór jutro o 7:30.','Assignee adds a comment');
select is(public.add_crm_task_comment('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001','eb000000-0000-4000-8000-000000000001','Odbiór jutro o 7:30.')->>'id','eb000000-0000-4000-8000-000000000001','Retry with same id is idempotent');
select throws_ok($$select public.add_crm_task_comment('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001','eb000000-0000-4000-8000-000000000001','Inna treść')$$,'22023',null,'Reused id with other body refused');
select throws_ok($$select public.add_crm_task_comment('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001','eb000000-0000-4000-8000-000000000002',' ')$$,'22023',null,'Blank comment refused');
select throws_ok($$select public.add_crm_task_comment('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000002','eb000000-0000-4000-8000-000000000003','Cudze')$$,'42501',null,'Comment on other technician task refused');
select is(jsonb_array_length(public.crm_task_comments('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001')),1,'Thread lists the comment');
select is(public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001',1,'high','purchasing')->>'comments','1','Task JSON counts comments');

select set_config('request.jwt.claim.sub','ab000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.crm_task_comments('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001')$$,'42501',null,'Other technician cannot read the thread');

select set_config('request.jwt.claim.sub','ab000000-0000-4000-8000-000000000001',true);
select is(jsonb_array_length(public.crm_task_comments('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000001')),1,'Office reads the thread');
select is(public.crm_task_meta('cb000000-0000-4000-8000-000000000001','db000000-0000-4000-8000-000000000002',0,'urgent',null)->>'priority','urgent','Office sets priority on any task');

reset role;
select ok(not has_table_privilege('authenticated','public.crm_task_comments','select'),'No direct table access');
select * from finish();
rollback;
