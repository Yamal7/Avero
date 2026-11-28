-- M0.4 Silnik widoku kolekcji (KRA-31): filtry, sortowanie, grupowanie i strony list po stronie serwera
-- (Firmy, Osoby, Magazyn, Przeglądy) oraz izolacja firm w nowych i zmienionych funkcjach.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into public.organizations(id,name) values
 ('0a450000-0000-4000-8000-00000000000a','Firma A kolekcje'),('0a450000-0000-4000-8000-00000000000b','Firma B kolekcje');
update public.stock_locations set id='5e450000-0000-4000-8000-00000000000a' where org_id='0a450000-0000-4000-8000-00000000000a' and kind='warehouse';
update public.stock_locations set id='5e450000-0000-4000-8000-00000000000b' where org_id='0a450000-0000-4000-8000-00000000000b' and kind='warehouse';

-- 1 admin A · 2 technik A (przypisany do QZ4 Alfa) · 3 admin B · 4 klient portalu A
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('a4500000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','coll-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,4) n;
insert into public.org_members(org_id,user_id,role) values
 ('0a450000-0000-4000-8000-00000000000a','a4500000-0000-4000-8000-000000000001','admin'),
 ('0a450000-0000-4000-8000-00000000000a','a4500000-0000-4000-8000-000000000002','technician'),
 ('0a450000-0000-4000-8000-00000000000b','a4500000-0000-4000-8000-000000000003','admin');
insert into public.customers(id,org_id,name,type,categories) values
 ('c4500000-0000-4000-8000-000000000001','0a450000-0000-4000-8000-00000000000a','QZ4 Alfa','company','{Chłodnictwo,VIP}'),
 ('c4500000-0000-4000-8000-000000000002','0a450000-0000-4000-8000-00000000000a','QZ4 Beta','company','{VIP}'),
 ('c4500000-0000-4000-8000-000000000003','0a450000-0000-4000-8000-00000000000a','QZ4 Gamma','company','{}'),
 ('c4500000-0000-4000-8000-000000000004','0a450000-0000-4000-8000-00000000000a','QZ4 Prywatny','individual','{}'),
 ('c4500000-0000-4000-8000-00000000000b','0a450000-0000-4000-8000-00000000000b','QZ4 Obca','company','{VIP}');
insert into public.customer_memberships(org_id,user_id,customer_id) values
 ('0a450000-0000-4000-8000-00000000000a','a4500000-0000-4000-8000-000000000004','c4500000-0000-4000-8000-000000000001');
insert into public.staff_customer_assignments(org_id,user_id,customer_id) values
 ('0a450000-0000-4000-8000-00000000000a','a4500000-0000-4000-8000-000000000002','c4500000-0000-4000-8000-000000000001');
insert into public.locations(id,org_id,customer_id,address,city) values
 ('d4500000-0000-4000-8000-000000000001','0a450000-0000-4000-8000-00000000000a','c4500000-0000-4000-8000-000000000001','Polna 1','Rumia'),
 ('d4500000-0000-4000-8000-000000000002','0a450000-0000-4000-8000-00000000000a','c4500000-0000-4000-8000-000000000002','Morska 5','Gdynia'),
 ('d4500000-0000-4000-8000-00000000000b','0a450000-0000-4000-8000-00000000000b','c4500000-0000-4000-8000-00000000000b','Leśna 2','Reda');
insert into public.installations(id,org_id,location_id,type) values
 ('e4500000-0000-4000-8000-000000000001','0a450000-0000-4000-8000-00000000000a','d4500000-0000-4000-8000-000000000001','split'),
 ('e4500000-0000-4000-8000-000000000002','0a450000-0000-4000-8000-00000000000a','d4500000-0000-4000-8000-000000000002','chłodnia'),
 ('e4500000-0000-4000-8000-00000000000b','0a450000-0000-4000-8000-00000000000b','d4500000-0000-4000-8000-00000000000b','split');
insert into public.devices(org_id,installation_id,manufacturer,serial_number) values
 ('0a450000-0000-4000-8000-00000000000a','e4500000-0000-4000-8000-000000000001','Daikin','QZ4-1'),
 ('0a450000-0000-4000-8000-00000000000a','e4500000-0000-4000-8000-000000000001','Daikin','QZ4-2');
insert into public.customer_contacts(id,org_id,customer_id,name,role,email,phone,last_payload) values
 ('d7450000-0000-4000-8000-000000000001','0a450000-0000-4000-8000-00000000000a','c4500000-0000-4000-8000-000000000001','QZ4 Ewa Zielińska','Kierownik','','','{}'),
 ('d7450000-0000-4000-8000-000000000002','0a450000-0000-4000-8000-00000000000a','c4500000-0000-4000-8000-000000000002','QZ4 Adam Nowak','Technik','','','{}'),
 ('d7450000-0000-4000-8000-00000000000b','0a450000-0000-4000-8000-00000000000b','c4500000-0000-4000-8000-00000000000b','QZ4 Obcy Kontakt','Prezes','','','{}');
insert into public.maintenance_plans(id,org_id,installation_id,title,interval_months,next_due_on) values
 ('f4500000-0000-4000-8000-000000000001','0a450000-0000-4000-8000-00000000000a','e4500000-0000-4000-8000-000000000001','QZ4 Przegląd B',12,(now() at time zone 'Europe/Warsaw')::date+10),
 ('f4500000-0000-4000-8000-000000000002','0a450000-0000-4000-8000-00000000000a','e4500000-0000-4000-8000-000000000002','QZ4 Przegląd A',12,(now() at time zone 'Europe/Warsaw')::date+20),
 ('f4500000-0000-4000-8000-00000000000b','0a450000-0000-4000-8000-00000000000b','e4500000-0000-4000-8000-00000000000b','QZ4 Przegląd obcy',12,(now() at time zone 'Europe/Warsaw')::date+5);

create function pg_temp.as_user(n int) returns void language sql as $$select set_config('request.jwt.claim.sub','a4500000-0000-4000-8000-'||lpad(n::text,12,'0'),true)$$;
create function pg_temp.names(r jsonb) returns text language sql as $$select coalesce(string_agg(i->>'name',',' order by o),'') from jsonb_array_elements(r->'items') with ordinality x(i,o)$$;
create function pg_temp.field(r jsonb,k text) returns text language sql as $$select coalesce(string_agg(coalesce(i->>k,'∅'),',' order by o),'') from jsonb_array_elements(r->'items') with ordinality x(i,o)$$;
create function pg_temp.titles(r jsonb) returns text language sql as $$select coalesce(string_agg(i->>'title',',' order by o),'') from jsonb_array_elements(r->'plans') with ordinality x(i,o)$$;
create function pg_temp.codes(r jsonb) returns text language sql as $$select coalesce(string_agg(i->>'code',',' order by o),'') from jsonb_array_elements(r->'items') with ordinality x(i,o)$$;

-- Sygnatury: stare wersje usunięte (bez przeciążeń), nowe z wartościami domyślnymi.
select hasnt_function('public','customer_directory',array['text','boolean','text','integer','text[]','text','text','text'],'Old 8-argument customer_directory removed');
select has_function('public','customer_directory',array['text','boolean','text','integer','text[]','text','text','text','text'],'customer_directory takes p_group');
select hasnt_function('public','people_directory',array['text','text','integer'],'Old 3-argument people_directory removed');
select has_function('public','people_directory',array['text','text','integer','text'],'people_directory takes p_sort');
select hasnt_function('public','maintenance_schedule',array['text','text','integer','uuid'],'Old 4-argument maintenance_schedule removed');
select has_function('public','maintenance_schedule',array['text','text','integer','uuid','text'],'maintenance_schedule takes p_sort');
select has_function('public','stock_item_list',array['text','text','text[]','text','text','integer'],'stock_item_list exists');
select is(array(select p.oid::regprocedure::text from pg_proc p where p.pronamespace='public'::regnamespace
 and p.proname in ('customer_directory','people_directory','maintenance_schedule','stock_item_list') and pg_get_userbyid(p.proowner)<>'avero_rpc'),
 array[]::text[],'Collection RPCs run as avero_rpc');
select ok(not has_function_privilege('anon','public.stock_item_list(text,text,text[],text,text,integer)','EXECUTE'),'Anonymous cannot list stock');

-- Firma A: notatka przy Alfie (ostatni kontakt), pozycje magazynu i PZ.
set local role authenticated;
select pg_temp.as_user(1);
select public.save_crm_record('c4500000-0000-4000-8000-000000000001','notes','b4500000-0000-4000-8000-000000000001',null,
 jsonb_build_object('title','Telefon','body','Umówić przegląd','kind','call','occurredOn',to_char((now() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'contactId',null,'archived',false));
select public.save_stock_item('14500000-0000-4000-8000-000000000001','QZ4-R32','Czynnik R32','refrigerant','kg',5,'A-1','HFC',675,'butla 9 kg');
select public.save_stock_item('14500000-0000-4000-8000-000000000002','QZ4-ZL','Złączka 1/4','parts','szt.',0,'B-2','',null,'');
select public.save_stock_item('14500000-0000-4000-8000-000000000003','QZ4-RURA','Rura miedziana 3/8','materials','m',0,'','',null,'');
select public.post_stock_document('34500000-0000-4000-8000-000000000001','PZ',null,'5e450000-0000-4000-8000-00000000000a',null,'Hurtownia','',
 '[{"itemId":"14500000-0000-4000-8000-000000000001","quantity":3},{"itemId":"14500000-0000-4000-8000-000000000002","quantity":10}]');

-- Firmy: sortowanie
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','none')),'QZ4 Alfa,QZ4 Beta,QZ4 Gamma','Sort by name');
select is(split_part(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','last_contact','none')),',',1),'QZ4 Alfa','Last contact first');
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','devices','none')),'QZ4 Alfa,QZ4 Beta,QZ4 Gamma','Sort by devices, ties by name');
select is(pg_temp.field(public.customer_directory('QZ4',false,'company',1,'{}','any','all','devices','none'),'devices'),'2,0,0','Device counts in order');
select lives_ok($$select public.customer_directory('QZ4',false,'company',1,'{}','any','all','revenue','none')$$,'Sort by revenue accepted');
select is(public.customer_directory('QZ4')->'items'->0->>'group','','Without grouping the group key is empty');
-- Firmy: grupowanie (kolejność = klucz grupy, potem sortowanie; puste klucze na końcu)
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','category')),'QZ4 Alfa,QZ4 Beta,QZ4 Gamma','Group by first category');
select is(pg_temp.field(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','category'),'group'),'chłodnictwo,vip,','Item carries the category group key');
select is(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','category')->'groups',
 '[{"key":"chłodnictwo","count":1,"label":"Chłodnictwo"},{"key":"vip","count":1,"label":"VIP"},{"key":"","count":1,"label":""}]'::jsonb,'Group counts cover the whole result');
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','city')),'QZ4 Beta,QZ4 Alfa,QZ4 Gamma','Group by city');
select is(pg_temp.field(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','city'),'group'),'gdynia,rumia,','Item carries the city group key');
select is(public.customer_directory('QZ4',false,'company',1,'{VIP}','any','all','name','category')->'groups',
 '[{"key":"chłodnictwo","count":1,"label":"Chłodnictwo"},{"key":"vip","count":1,"label":"VIP"}]'::jsonb,'Groups follow the filter');
select is(public.customer_directory('QZ4')->'groups','[]'::jsonb,'No groups without grouping');
-- Firmy: odrzucenie złych wartości
select throws_ok($$select public.customer_directory('',false,'company',1,'{}','any','all','city','none')$$,'22023',null,'Unknown sort refused');
select throws_ok($$select public.customer_directory('',false,'company',1,'{}','any','all','name','owner')$$,'22023',null,'Unknown group refused');
select throws_ok($$select public.customer_directory('',false,'company',1,'{}','any','all',null,'none')$$,'22023',null,'Null sort refused');
select throws_ok($$select public.customer_directory('',false,'company',1,'{}',null,'all','name','none')$$,'22023',null,'Null mode refused');
select throws_ok($$select public.customer_directory('',false,'company',1,'{}','any','all','name',null)$$,'22023',null,'Null group refused');
-- Firmy: istniejące filtry nadal działają
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{vip}','none','all','name','none')),'QZ4 Gamma','Category filter with grouping parameter');
select is(pg_temp.names(public.customer_directory('QZ4',false,'individual')),'QZ4 Prywatny','Individuals');

-- Osoby: sortowanie
select is(pg_temp.names(public.people_directory('QZ4','all',1,'name')),'QZ4 Adam Nowak,QZ4 Ewa Zielińska,QZ4 Prywatny','People by name');
select is(split_part(pg_temp.names(public.people_directory('QZ4','all',1,'last_contact')),',',1),'QZ4 Ewa Zielińska','People by last contact');
select is(pg_temp.names(public.people_directory('QZ4')),'QZ4 Adam Nowak,QZ4 Ewa Zielińska,QZ4 Prywatny','Default people sort is name');
select throws_ok($$select public.people_directory('','all',1,'phone')$$,'22023',null,'Unknown people sort refused');
select throws_ok($$select public.people_directory('','all',1,null)$$,'22023',null,'Null people sort refused');

-- Magazyn: widoki, filtry, sortowanie, grupy, strony
select is((public.stock_item_list('all','QZ4')->>'total')::int,3,'All items');
select is(pg_temp.codes(public.stock_item_list('refrigerant','QZ4')),'QZ4-R32','Refrigerant view');
select is(pg_temp.codes(public.stock_item_list('below','QZ4')),'QZ4-R32','Below-minimum view');
select is(pg_temp.codes(public.stock_item_list('all','QZ4','{parts,materials}','code','none')),'QZ4-RURA,QZ4-ZL','Category filter');
select is(pg_temp.codes(public.stock_item_list('all','złączka')),'QZ4-ZL','Search by name');
select is(pg_temp.codes(public.stock_item_list('all','QZ4','{}','code','category')),'QZ4-R32,QZ4-ZL,QZ4-RURA','Grouped by category in fixed order, then code');
select is(public.stock_item_list('all','QZ4','{}','code','category')->'groups','[{"key":"refrigerant","count":1},{"key":"parts","count":1},{"key":"materials","count":1}]'::jsonb,'Category group counts');
select is(public.stock_item_list('all','QZ4','{}','code','none')->'groups','[]'::jsonb,'No groups without grouping');
select is(pg_temp.codes(public.stock_item_list('all','QZ4','{}','name','none')),'QZ4-R32,QZ4-RURA,QZ4-ZL','Sort by name');
select is(pg_temp.codes(public.stock_item_list('all','QZ4','{}','available','none')),'QZ4-RURA,QZ4-R32,QZ4-ZL','Sort by available, lowest first');
select is(split_part(pg_temp.codes(public.stock_item_list('all','QZ4','{}','last_move','none')),',',3),'QZ4-RURA','Items without a movement go last');
select is((public.stock_item_list('all','QZ4')->'summary'->>'below')::int>=1,true,'Summary counts items below minimum');
select is(jsonb_array_length(public.stock_item_list('all','QZ4','{}','code','category',2)->'items'),0,'Second page is empty');
select is(public.stock_item_list('all','QZ4','{}','code','none')->'items'->0,
 (select i from jsonb_array_elements(public.stock_overview()->'items') i where i->>'code'='QZ4-R32'),'Item has the same shape as in stock_overview');
select throws_ok($$select public.stock_item_list('vehicles')$$,'22023',null,'Unknown stock view refused');
select throws_ok($$select public.stock_item_list('all','','{gas}')$$,'22023',null,'Unknown category refused');
select throws_ok($$select public.stock_item_list('all','','{}','price')$$,'22023',null,'Unknown stock sort refused');
select throws_ok($$select public.stock_item_list('all','','{}','code','unit')$$,'22023',null,'Unknown stock group refused');
select throws_ok($$select public.stock_item_list('all','','{}','code','none',0)$$,'22023',null,'Invalid stock page refused');
select throws_ok($$select public.stock_item_list('all',repeat('a',201))$$,'22023',null,'Unbounded stock search refused');

-- Przeglądy: sortowanie
select is(pg_temp.titles(public.maintenance_schedule('QZ4','all')),'QZ4 Przegląd B,QZ4 Przegląd A','Default sort by due date');
select is(pg_temp.titles(public.maintenance_schedule('QZ4','all',1,null,'due')),'QZ4 Przegląd B,QZ4 Przegląd A','Sort by due date');
select is(pg_temp.titles(public.maintenance_schedule('QZ4','all',1,null,'title')),'QZ4 Przegląd A,QZ4 Przegląd B','Sort by plan title');
select is(pg_temp.titles(public.maintenance_schedule('QZ4','all',1,null,'customer')),'QZ4 Przegląd B,QZ4 Przegląd A','Sort by customer (Alfa before Beta)');
select throws_ok($$select public.maintenance_schedule('','all',1,null,'city')$$,'22023',null,'Unknown maintenance sort refused');
select throws_ok($$select public.maintenance_schedule('','all',1,null,null)$$,'22023',null,'Null maintenance sort refused');

-- Izolacja firm: firma A nie widzi danych B przez żadną z funkcji list.
select ok(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','category')) not like '%Obca%','A does not see B customers');
select ok(not (public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','city')->'groups') @> '[{"key":"reda"}]'::jsonb,'A groups do not reveal B cities');
select is((public.customer_directory('QZ4')->'counts'->>'company')::int,3,'A company count excludes B');
select ok(pg_temp.names(public.people_directory('QZ4','all',1,'name')) not like '%Obcy%','A does not see B contacts');
select ok(pg_temp.codes(public.stock_item_list('all','')) not like '%OBCY%','A does not see B stock (before B adds it)');
select ok(pg_temp.titles(public.maintenance_schedule('QZ4','all',1,null,'title')) not like '%obcy%','A does not see B plans');

select pg_temp.as_user(3);
select public.save_stock_item('14500000-0000-4000-8000-00000000000b','QZ4-OBCY','Pozycja obca','parts','szt.',0,'','',null,'');
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','name','category')),'QZ4 Obca','B sees only its customers');
select is(pg_temp.names(public.people_directory('QZ4','all',1,'last_contact')),'QZ4 Obcy Kontakt','B sees only its people');
select is(pg_temp.codes(public.stock_item_list('all','QZ4')),'QZ4-OBCY','B sees only its stock');
select is(pg_temp.titles(public.maintenance_schedule('QZ4','all',1,null,'customer')),'QZ4 Przegląd obcy','B sees only its plans');

select pg_temp.as_user(1);
select ok(pg_temp.codes(public.stock_item_list('all','QZ4')) not like '%OBCY%','A does not see B stock');
select is((public.stock_item_list('all','QZ4')->'summary'->>'all')::int>=3,true,'A summary counts its items');

-- Technik widzi tylko przypisanych klientów i nie dostaje przychodu.
select pg_temp.as_user(2);
select is(pg_temp.names(public.customer_directory('QZ4',false,'company',1,'{}','any','all','revenue','city')),'QZ4 Alfa','Technician sees assigned customer only');
select is(public.customer_directory('QZ4',false,'company',1,'{}','any','all','revenue','city')->'items'->0->'revenueCents','null'::jsonb,'Technician gets no revenue');
select is(pg_temp.titles(public.maintenance_schedule('QZ4','all',1,null,'title')),'QZ4 Przegląd B','Technician sees plans of assigned customers only');
select is((public.stock_item_list('all','QZ4')->>'total')::int,3,'Technician lists company stock like in stock_overview');

-- Klient portalu i osoba anonimowa nie wywołają list.
select pg_temp.as_user(4);
select throws_ok($$select public.customer_directory()$$,'42501',null,'Portal client cannot list customers');
select throws_ok($$select public.people_directory()$$,'42501',null,'Portal client cannot list people');
select throws_ok($$select public.stock_item_list()$$,'42501',null,'Portal client cannot list stock');
select throws_ok($$select public.maintenance_schedule()$$,'42501',null,'Portal client cannot list plans');

select * from finish();
rollback;
