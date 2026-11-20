begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('ac100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','prefs-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,2) n;
insert into public.staff_users(user_id,role) values('ac100000-0000-4000-8000-000000000001','office'),('ac100000-0000-4000-8000-000000000002','technician');
set local role authenticated;
select set_config('request.jwt.claim.sub','ac100000-0000-4000-8000-000000000001',true);
select lives_ok($$select public.set_my_preference('nav.sales','true')$$,'Person stores a preference');
select lives_ok($$select public.set_my_preference('nav.sales','false')$$,'Preference is overwritten');
select is(public.my_preferences(),'{"nav.sales": false}'::jsonb,'Person reads own preferences');
select throws_ok($$select public.set_my_preference('Bad Key','1')$$,'22023',null,'Invalid key refused');
select set_config('request.jwt.claim.sub','ac100000-0000-4000-8000-000000000002',true);
select is(public.my_preferences(),'{}'::jsonb,'Others do not see them');
select * from finish();
rollback;
