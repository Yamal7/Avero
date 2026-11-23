-- M0.1 (KRA-27): izolacja firm. Firma A nie odczyta ani nie zmieni danych firmy B — ani bezpośrednio, ani przez RPC;
-- numeracja jest niezależna; klient portalu widzi tylko swoje; przełączyć można się tylko na własną firmę.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into public.organizations(id,name) values
 ('0a430000-0000-4000-8000-00000000000a','Firma A test'),('0a430000-0000-4000-8000-00000000000b','Firma B test');
-- Magazyn główny zakłada się sam z firmą; stałe identyfikatory ułatwiają wywołania w teście.
update public.stock_locations set id='5e430000-0000-4000-8000-00000000000a' where org_id='0a430000-0000-4000-8000-00000000000a' and kind='warehouse';
update public.stock_locations set id='5e430000-0000-4000-8000-00000000000b' where org_id='0a430000-0000-4000-8000-00000000000b' and kind='warehouse';
select is((select count(*)::int from public.stock_locations where org_id in ('0a430000-0000-4000-8000-00000000000a','0a430000-0000-4000-8000-00000000000b') and kind='warehouse'),2,'New firm gets its own main warehouse');

-- 1 admin A · 2 technik A · 3 admin B · 4 klient portalu A · 5 biuro w A i B · 6 klient portalu B · 7 bez dostępu
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
select ('a4300000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','org-'||n||'@example.invalid','x',now(),now(),now() from generate_series(1,7) n;
insert into public.org_members(org_id,user_id,role) values
 ('0a430000-0000-4000-8000-00000000000a','a4300000-0000-4000-8000-000000000001','admin'),
 ('0a430000-0000-4000-8000-00000000000a','a4300000-0000-4000-8000-000000000002','technician'),
 ('0a430000-0000-4000-8000-00000000000b','a4300000-0000-4000-8000-000000000003','admin'),
 ('0a430000-0000-4000-8000-00000000000a','a4300000-0000-4000-8000-000000000005','office'),
 ('0a430000-0000-4000-8000-00000000000b','a4300000-0000-4000-8000-000000000005','office');
insert into public.customers(id,org_id,name) values
 ('c4300000-0000-4000-8000-00000000000a','0a430000-0000-4000-8000-00000000000a','Klient firmy A'),
 ('c4300000-0000-4000-8000-00000000000b','0a430000-0000-4000-8000-00000000000b','Klient firmy B');
insert into public.customer_memberships(org_id,user_id,customer_id) values
 ('0a430000-0000-4000-8000-00000000000a','a4300000-0000-4000-8000-000000000004','c4300000-0000-4000-8000-00000000000a'),
 ('0a430000-0000-4000-8000-00000000000b','a4300000-0000-4000-8000-000000000006','c4300000-0000-4000-8000-00000000000b');
insert into public.staff_customer_assignments(org_id,user_id,customer_id) values
 ('0a430000-0000-4000-8000-00000000000a','a4300000-0000-4000-8000-000000000002','c4300000-0000-4000-8000-00000000000a');
insert into public.locations(id,org_id,customer_id,address,city) values
 ('d4300000-0000-4000-8000-00000000000a','0a430000-0000-4000-8000-00000000000a','c4300000-0000-4000-8000-00000000000a','Polna 1','Rumia'),
 ('d4300000-0000-4000-8000-00000000000b','0a430000-0000-4000-8000-00000000000b','c4300000-0000-4000-8000-00000000000b','Leśna 2','Reda');
insert into public.installations(id,org_id,location_id,type) values
 ('e4300000-0000-4000-8000-00000000000a','0a430000-0000-4000-8000-00000000000a','d4300000-0000-4000-8000-00000000000a','split'),
 ('e4300000-0000-4000-8000-00000000000b','0a430000-0000-4000-8000-00000000000b','d4300000-0000-4000-8000-00000000000b','split');
-- Ten sam kod katalogu w obu firmach — unikalność kodów działa w obrębie firmy.
insert into public.catalog_items(id,org_id,code,name,category,unit,cost_cents,sale_cents,vat_basis_points,created_by,created_payload) values
 ('f4300000-0000-4000-8000-00000000000a','0a430000-0000-4000-8000-00000000000a','ORG-TEST','Usługa A','service','hour',3800,6500,2300,'a4300000-0000-4000-8000-000000000001','{}'),
 ('f4300000-0000-4000-8000-00000000000b','0a430000-0000-4000-8000-00000000000b','ORG-TEST','Usługa B','service','hour',3800,6500,2300,'a4300000-0000-4000-8000-000000000003','{}');
-- Dokument i plik firmy B (bucket hvac-documents; ścieżki bez zmian).
insert into public.documents(id,org_id,installation_id,storage_path,file_name,document_type,upload_state,byte_size,mime_type) values
 ('b4300000-0000-4000-8000-00000000000b','0a430000-0000-4000-8000-00000000000b','e4300000-0000-4000-8000-00000000000b','e4300000-0000-4000-8000-00000000000b/b4300000-0000-4000-8000-00000000000b/b.pdf','b.pdf','manual','ready',9,'application/pdf');
insert into storage.objects(bucket_id,name,metadata) values('hvac-documents','e4300000-0000-4000-8000-00000000000b/b4300000-0000-4000-8000-00000000000b/b.pdf','{"size":9,"mimetype":"application/pdf"}');

create function pg_temp.task(who text) returns jsonb language sql as $$select jsonb_build_object('title','Zadanie','description','Opis','kind','follow_up','dueOn',to_char((now() at time zone 'Europe/Warsaw')::date+1,'YYYY-MM-DD'),'contactId',null,'assigneeId',who,'state','todo','result','')$$;
create function pg_temp.note() returns jsonb language sql as $$select jsonb_build_object('title','NOTATKA B','body','TAJNE B','kind','call','occurredOn',to_char((now() at time zone 'Europe/Warsaw')::date,'YYYY-MM-DD'),'contactId',null,'archived',false)$$;
create function pg_temp.offer(org text) returns jsonb language sql as $$select jsonb_build_object('customerId','c4300000-0000-4000-8000-00000000000'||org,'locationId','d4300000-0000-4000-8000-00000000000'||org,'title','Oferta '||org,'workType','split',
 'technical','{"lengthMills":2500,"laborMills":1000,"travelMills":0}'::jsonb,'mainVariantId','e7430000-0000-4000-8000-00000000000'||org,'archived',false,
 'variants',jsonb_build_array(jsonb_build_object('id','e7430000-0000-4000-8000-00000000000'||org,'name','Rekomendowana','internalNote','MARŻA '||org,'customerNote','','targetMarginBasisPoints',3000,'overrideNetCents',null,
 'lines',jsonb_build_array(jsonb_build_object('id','b7430000-0000-4000-8000-00000000000'||org,'catalogId','f4300000-0000-4000-8000-00000000000'||org,'code','ORG-TEST','name','Usługa','description','','category','service','unit','hour','quantityMills',1000,'costCents',3800,'saleCents',6500,'vatBasisPoints',2300,'discountBasisPoints',0)))))$$;
create function pg_temp.profile(name text) returns jsonb language sql as $$select jsonb_build_object('companyName',name,'companyAddress','Ulica 1, 84-230 Rumia','taxId','5250000000','email','','phone','','website','','intro','','paymentTerms','','completionTerms','','exclusions','','note','','validityDays',14,'bankAccount','PL61 1090 1014 0000 0712 1981 2874')$$;
create function pg_temp.as_user(n int) returns void language sql as $$select set_config('request.jwt.claim.sub','a4300000-0000-4000-8000-'||lpad(n::text,12,'0'),true)$$;

-- Firma B tworzy swoje dane przez RPC.
set local role authenticated;
select pg_temp.as_user(3);
select is(public.current_org_id(),'0a430000-0000-4000-8000-00000000000b'::uuid,'Admin B works in firm B');
select set_config('test.ticket_b',public.create_service_ticket('e4300000-0000-4000-8000-00000000000b','Awaria B','Opis B','normal')::text,true);
select lives_ok($$select public.save_crm_record('c4300000-0000-4000-8000-00000000000b','tasks','d2430000-0000-4000-8000-00000000000b',null,pg_temp.task('a4300000-0000-4000-8000-000000000003'))$$,'B creates a task');
select lives_ok($$select public.save_crm_record('c4300000-0000-4000-8000-00000000000b','notes','d1430000-0000-4000-8000-00000000000b',null,pg_temp.note())$$,'B creates a note');
select lives_ok($$select public.save_offer('97430000-0000-4000-8000-00000000000b',pg_temp.offer('b'))$$,'B creates an offer');
select lives_ok($$select public.save_stock_item('1e430000-0000-4000-8000-00000000000b','CZ-R32','R32 B','refrigerant','kg',20,'C-01','HFC',675,'butla 9 kg')$$,'B creates a stock item');
select alike(public.post_stock_document('3e430000-0000-4000-8000-00000000000b','PZ',null,'5e430000-0000-4000-8000-00000000000b',null,'Hurtownia','','[{"itemId":"1e430000-0000-4000-8000-00000000000b","quantity":5}]')->>'number','PZ/%/001','B gets its first PZ number');
select lives_ok($$select public.save_customer_category('VIP','red')$$,'B colours a category');
select lives_ok($$select public.save_company_profile(null,pg_temp.profile('Firma B sp. z o.o.'))$$,'B saves its company profile with bank account');
select is((select count(*)::int from storage.objects where name like 'e4300000-0000-4000-8000-00000000000b/%'),1,'B reads its own file');

-- Firma A — te same operacje, niezależna numeracja.
select pg_temp.as_user(1);
select is(public.current_org_id(),'0a430000-0000-4000-8000-00000000000a'::uuid,'Admin A works in firm A');
select set_config('test.ticket_a',public.create_service_ticket('e4300000-0000-4000-8000-00000000000a','Awaria A','Opis A','normal')::text,true);
select lives_ok($$select public.save_crm_record('c4300000-0000-4000-8000-00000000000a','tasks','d2430000-0000-4000-8000-00000000000a',null,pg_temp.task('a4300000-0000-4000-8000-000000000001'))$$,'A creates a task');
select lives_ok($$select public.save_stock_item('1e430000-0000-4000-8000-00000000000a','CZ-R32','R32 A','refrigerant','kg',20,'C-01','HFC',675,'butla 9 kg')$$,'A may reuse a stock code taken in B');
select alike(public.post_stock_document('3e430000-0000-4000-8000-00000000000a','PZ',null,'5e430000-0000-4000-8000-00000000000a',null,'Hurtownia','','[{"itemId":"1e430000-0000-4000-8000-00000000000a","quantity":2}]')->>'number','PZ/%/001','A numbers PZ independently of B');
select lives_ok($$select public.save_customer_category('VIP','blue')$$,'A colours the same category');

-- Odczyt przez RPC: nic z firmy B.
select is((select count(*)::int from public.search_customers('',false) c where c.id='c4300000-0000-4000-8000-00000000000b'),0,'A search does not find B customer');
select is((select count(*)::int from public.search_customers('',false)),1,'A search returns only its customer');
select is((public.list_service_tickets('','all',1)->>'total')::int,1,'A ticket list holds only its ticket');
select is((public.list_offers('','active',1)->>'total')::int,0,'A offer list does not show B offer');
select is((select count(*)::int from jsonb_array_elements(public.stock_overview()->'items') i where i->>'id'='1e430000-0000-4000-8000-00000000000b'),0,'A stock overview hides B items');
select is(public.company_profile(),null,'A has no company profile even though B has one');
select is((select count(*)::int from jsonb_array_elements(public.list_access_users('',1)->'users') u where u->>'id' in ('a4300000-0000-4000-8000-000000000003','a4300000-0000-4000-8000-000000000006','a4300000-0000-4000-8000-000000000007')),0,'A user list does not show people of B');
select is((select count(*)::int from jsonb_array_elements(public.list_access_users('',1)->'users') u where u->>'id' in ('a4300000-0000-4000-8000-000000000001','a4300000-0000-4000-8000-000000000004')),2,'A user list shows its staff and portal clients');
select is((select count(*)::int from public.customers),1,'A direct select sees only its customer');
select is((select count(*)::int from storage.objects where name like 'e4300000-0000-4000-8000-00000000000b/%'),0,'A cannot read B file');

-- Zapis przez RPC: dane B nietknięte.
select throws_ok($$select public.create_service_ticket('e4300000-0000-4000-8000-00000000000b','Obce','Obce','normal')$$,'42501',null,'A cannot open a ticket on B installation');
select throws_ok($$select public.save_crm_record('c4300000-0000-4000-8000-00000000000b','notes','d1430000-0000-4000-8000-0000000000aa',null,pg_temp.note())$$,null,null,'A cannot write a note for B customer');
select throws_ok($$select public.save_crm_record('c4300000-0000-4000-8000-00000000000b','notes','d1430000-0000-4000-8000-00000000000b',0,pg_temp.note())$$,null,null,'A cannot overwrite B note');
select throws_ok($$select public.crm_records('c4300000-0000-4000-8000-00000000000b','notes','all',1)$$,null,null,'A cannot list B notes');
select throws_ok($$select public.post_stock_document('3e430000-0000-4000-8000-0000000000aa','MM','5e430000-0000-4000-8000-00000000000b','5e430000-0000-4000-8000-00000000000a',null,'','','[{"itemId":"1e430000-0000-4000-8000-00000000000b","quantity":1}]')$$,'22023',null,'A cannot move stock out of B warehouse');
select throws_ok($$select public.save_stock_item('1e430000-0000-4000-8000-00000000000b','CZ-R32','Przejęty','refrigerant','kg',0,'','',null,'')$$,null,null,'A cannot overwrite B stock item by id');
select throws_ok($$insert into public.customers(org_id,name) values('0a430000-0000-4000-8000-00000000000b','Podrzucony')$$,'42501',null,'A cannot insert a row into B');
select lives_ok($$update public.customers set name='Przejęty' where id='c4300000-0000-4000-8000-00000000000b'$$,'Update of B customer is silently filtered');
select throws_ok($$select public.set_active_org('0a430000-0000-4000-8000-00000000000b')$$,'42501',null,'A cannot switch to a firm it does not belong to');
select is(public.current_org_id(),'0a430000-0000-4000-8000-00000000000a'::uuid,'Rejected switch keeps firm A');
select lives_ok($$select public.set_access_blocked('a4300000-0000-4000-8000-000000000005',true)$$,'A blocks the shared office worker in A');

-- Pętla po wszystkich tabelach z org_id: rola RPC (avero_rpc) w kontekście admina A nie widzi, nie zmienia i nie usuwa wierszy B.
reset role;
create temp table org_tables on commit drop as
 select c.relname::text as t from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attname='org_id' and not a.attisdropped
 where c.relnamespace='public'::regnamespace and c.relkind='r';
grant select on org_tables to public;
create function pg_temp.foreign_visible() returns text[] language plpgsql as $$
declare r record; n bigint; bad text[]:='{}';begin
 for r in select t from org_tables order by t loop
  execute format('select count(*) from public.%I where org_id is distinct from %L',r.t,'0a430000-0000-4000-8000-00000000000a') into n;
  if n>0 then bad:=bad||(r.t||'='||n);end if;
 end loop;return bad;end $$;
create function pg_temp.foreign_changed() returns text[] language plpgsql as $$
declare r record; n bigint; bad text[]:='{}';begin
 for r in select t from org_tables order by t loop
  execute format('with u as (update public.%I set org_id=org_id where org_id=%L returning 1) select count(*) from u',r.t,'0a430000-0000-4000-8000-00000000000b') into n;
  if n>0 then bad:=bad||('update '||r.t);end if;
  execute format('with d as (delete from public.%I where org_id=%L returning 1) select count(*) from d',r.t,'0a430000-0000-4000-8000-00000000000b') into n;
  if n>0 then bad:=bad||('delete '||r.t);end if;
 end loop;return bad;end $$;
select cmp_ok((select count(*)::int from org_tables),'>=',50,'Loop covers all data tables');
create temp table b_rows on commit drop as select 0 as n;
do $$declare r record; n bigint; total int:=0;begin
 for r in select t from org_tables loop
  execute format('select count(*) from public.%I where org_id=%L',r.t,'0a430000-0000-4000-8000-00000000000b') into n;
  if n>0 then total:=total+1;end if;
 end loop;update b_rows set n=total;end $$;
select cmp_ok((select n from b_rows),'>=',20,'Firm B has rows in at least 20 tables for the loop to check');
set local role avero_rpc;
select pg_temp.as_user(1);
select is(pg_temp.foreign_visible(),'{}'::text[],'RPC role sees no row of another firm in any table');
select is(pg_temp.foreign_changed(),'{}'::text[],'RPC role updates and deletes no row of another firm in any table');
reset role;
set local role authenticated;
select pg_temp.as_user(1);
select is(array(select t from org_tables where has_table_privilege('authenticated',('public.'||quote_ident(t))::regclass,'SELECT')
 and (xpath('/row/n/text()',query_to_xml(format('select count(*) n from public.%I where org_id<>%L',t,'0a430000-0000-4000-8000-00000000000a'),false,true,'')))[1]::text::int>0),
 '{}'::text[],'Direct SELECT as signed-in user shows no row of another firm');
reset role;

select is((select name from public.customers where id='c4300000-0000-4000-8000-00000000000b'),'Klient firmy B','B customer name unchanged');
select is((select color from public.customer_category_colors where org_id='0a430000-0000-4000-8000-00000000000b' and key='vip'),'red','B category colour unchanged');
select is((select count(*)::int from public.customer_category_colors where key='vip'),2,'Category key is unique per firm');
select is((select count(*)::int from public.stock_items where code='CZ-R32' and org_id in ('0a430000-0000-4000-8000-00000000000a','0a430000-0000-4000-8000-00000000000b')),2,'Stock code is unique per firm');
select is((select ticket_number from public.service_tickets where id=current_setting('test.ticket_a')::uuid),1::bigint,'A first ticket number is 1');
select is((select ticket_number from public.service_tickets where id=current_setting('test.ticket_b')::uuid),1::bigint,'B first ticket number is 1');
select is((select number from public.crm_tasks where id='d2430000-0000-4000-8000-00000000000a'),1::bigint,'A first task number is 1');
select is((select number from public.crm_tasks where id='d2430000-0000-4000-8000-00000000000b'),1::bigint,'B first task number is 1');
select is((select offer_number from public.offers where id='97430000-0000-4000-8000-00000000000b'),1::bigint,'B first offer number is 1');
select is((select org_id from public.offers where id='97430000-0000-4000-8000-00000000000b'),'0a430000-0000-4000-8000-00000000000b'::uuid,'RPC insert takes the active firm');
select is((select data->>'bankAccount' from public.company_profiles where org_id='0a430000-0000-4000-8000-00000000000b'),'PL61 1090 1014 0000 0712 1981 2874','Bank account kept on the B profile');
select is((select count(*)::int from public.account_access where user_id='a4300000-0000-4000-8000-000000000005' and blocked),1,'Block is stored once, for firm A');

-- Klient portalu A widzi tylko swoje.
set local role authenticated;
select pg_temp.as_user(4);
select is(public.current_org_id(),'0a430000-0000-4000-8000-00000000000a'::uuid,'Portal client works in the firm of its customer');
select is(public.current_access()->>'role','client','Portal client keeps the client role');
select is((public.portal_tickets('c4300000-0000-4000-8000-00000000000a','all')->>'total')::int,1,'Portal client sees its ticket');
select throws_ok($$select public.portal_tickets('c4300000-0000-4000-8000-00000000000b','all')$$,null,null,'Portal client cannot open B customer');
select is((select count(*)::int from public.customers),1,'Portal client sees only its customer');
select is((select count(*)::int from public.service_tickets),1,'Portal client sees only its ticket');
select throws_ok($$select public.set_active_org('0a430000-0000-4000-8000-00000000000b')$$,'42501',null,'Portal client cannot switch to another firm');

-- Osoba w dwóch firmach przełącza się; blokada w A nie blokuje jej w B.
select pg_temp.as_user(5);
select is(jsonb_array_length(public.my_organizations()),1,'Worker blocked in A lists only firm B');
select lives_ok($$select public.set_active_org('0a430000-0000-4000-8000-00000000000b')$$,'Worker switches to firm B');
select is(public.current_org_id(),'0a430000-0000-4000-8000-00000000000b'::uuid,'Active firm is B');
select is((public.current_access()->>'blocked')::boolean,false,'Block in A does not block in B');
select is((select count(*)::int from public.search_customers('',false) c where c.id='c4300000-0000-4000-8000-00000000000b'),1,'Worker now sees B customer');
select is((select count(*)::int from public.search_customers('',false) c where c.id='c4300000-0000-4000-8000-00000000000a'),0,'and no longer A customer');
reset role;
update public.account_access set blocked=false where user_id='a4300000-0000-4000-8000-000000000005';
set local role authenticated;
select pg_temp.as_user(5);
select is(jsonb_array_length(public.my_organizations()),2,'Unblocked worker lists both firms');
select is((select count(*)::int from jsonb_array_elements(public.my_organizations()) o where (o->>'active')::boolean and o->>'id'='0a430000-0000-4000-8000-00000000000b'),1,'B is marked active');
select lives_ok($$select public.set_active_org('0a430000-0000-4000-8000-00000000000a')$$,'Worker switches back to firm A');
select is(public.company_profile(),null,'Profile follows the active firm');

-- Osoba bez dostępu.
select pg_temp.as_user(7);
select is(public.current_org_id(),null,'Outsider has no firm');
select is(public.current_access()->>'role','none','Outsider has no role');
select is(public.my_organizations(),'[]'::jsonb,'Outsider lists no firms');
select is((select count(*)::int from public.customers),0,'Outsider sees no customers');
select throws_ok($$select public.set_active_org(null)$$,'42501',null,'Null firm refused');
reset role;
set local role anon;
select is((select count(*)::int from public.customers),0,'Anonymous sees no customers');
reset role;

select * from finish();
rollback;
