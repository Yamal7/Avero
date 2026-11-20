begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('aa000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','cats-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,2) n;
insert into public.staff_users(user_id,role) values('aa000000-0000-4000-8000-000000000001','office'),('aa000000-0000-4000-8000-000000000002','technician');
insert into public.customers(id,name,type,categories) values
 ('ca000000-0000-4000-8000-000000000001','ZZ Kat Alfa','company','{Chłodnictwo,VIP}'),
 ('ca000000-0000-4000-8000-000000000002','ZZ Kat Beta','company','{Chłodnictwo}'),
 ('ca000000-0000-4000-8000-000000000003','ZZ Kat Gamma','company','{}');
insert into public.crm_notes(id,customer_id,fields,created_at) select 'da000000-0000-4000-8000-000000000001','ca000000-0000-4000-8000-000000000001',jsonb_build_object('kind','note','body','x','archived',false),now() where exists(select 1 from information_schema.columns where table_name='crm_notes' and column_name='fields');
create function pg_temp.names(r jsonb) returns text language sql as $$select string_agg(i->>'name',',' order by i->>'name') from jsonb_array_elements(r->'items') i where i->>'name' like 'ZZ Kat%'$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000001',true);
select is(pg_temp.names(public.customer_directory('ZZ Kat',false,'company',1,'{chłodnictwo}','any')),'ZZ Kat Alfa,ZZ Kat Beta','Any of the categories');
select is(pg_temp.names(public.customer_directory('ZZ Kat',false,'company',1,'{Chłodnictwo,VIP}','all')),'ZZ Kat Alfa','All of the categories');
select is(pg_temp.names(public.customer_directory('ZZ Kat',false,'company',1,'{Chłodnictwo}','none')),'ZZ Kat Gamma','None of the categories');
select is((public.customer_directory('ZZ Kat',false,'company',1,'{VIP}','any')->'summary'->>'all')::int,3,'Summary counts the unfiltered list');
select ok(pg_temp.names(public.customer_directory('ZZ Kat',false,'company',1,'{}','any','no_contact_30')) like '%Gamma%','Customer without contact is in the 30-day view');
select throws_ok($$select public.customer_directory('',false,'company',1,'{}','some')$$,'22023',null,'Unknown mode refused');
select lives_ok($$select public.save_customer_category('Chłodnictwo','teal')$$,'Office sets a colour');
select is((select c->>'color' from jsonb_array_elements(public.customer_category_list('company')) c where c->>'name'='Chłodnictwo'),'teal','List returns the colour');
select lives_ok($$select public.save_customer_category('VIP','red','Kluczowy')$$,'Office renames a category');
select is(pg_temp.names(public.customer_directory('ZZ Kat',false,'company',1,'{Kluczowy}','any')),'ZZ Kat Alfa','Renamed category kept on the customer');
select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.save_customer_category('Chłodnictwo','blue')$$,'42501',null,'Technician cannot change colours');
select * from finish();
rollback;
