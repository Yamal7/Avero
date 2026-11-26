-- M0.1 Wielofirmowość (KRA-27), krok 2: org_id w każdej tabeli danych + izolacja polityką RLS.
-- Istniejące wiersze dostają firmę „Kranz HVACR” (stała wartość domyślna przy dodaniu kolumny — bez UPDATE,
-- więc bez wyzwalaczy audytu i blokad opublikowanych protokołów). Żaden wiersz nie jest usuwany.

-- Wyjątki bez org_id (lista pilnowana w supabase/tests/044_org_guard.sql i opisana w docs/STATUS.md):
--  organizations, org_active — same firmy i wybór aktywnej firmy;
--  user_preferences, notification_preferences, notification_email_preferences — ustawienia osobiste konta,
--  zawsze czytane i zapisywane dla auth.uid().
do $$
declare t text;
begin
 for t in
  select c.relname from pg_class c
  where c.relnamespace='public'::regnamespace and c.relkind='r'
  and c.relname not in ('organizations','org_active','org_members','user_preferences','notification_preferences','notification_email_preferences')
  order by c.relname
 loop
  execute format('alter table public.%I add column org_id uuid not null default %L constraint %I references public.organizations(id)',
   t,'0a000000-0000-4000-8000-000000000001',t||'_org_id_fkey');
 end loop;
end $$;

-- Aktywna firma bieżącej osoby, zweryfikowana członkostwem. Kolejność: wybrana (jeśli nadal należy i nie jest tam
-- zablokowana) → najstarsze członkostwo pracownika → firma klienta portalu. Brak dostępu = null (nic nie widać).
-- Działa jako postgres (wyjątek w 044), bo musi widzieć członkostwa ze wszystkich firm osoby.
create function public.current_org_id() returns uuid
language sql stable security definer set search_path='' as $$
 with me as (select auth.uid() as uid),
 mine as (
  select m.org_id, 0 as kind, m.created_at from public.org_members m, me where m.user_id=me.uid
  union all
  select cm.org_id, 1, c.created_at from public.customer_memberships cm join public.customers c on c.id=cm.customer_id, me where cm.user_id=me.uid
 ),
 usable as (
  select x.org_id, min(x.kind) kind, min(x.created_at) created_at,
   exists(select 1 from public.account_access a, me where a.user_id=me.uid and a.org_id=x.org_id and a.blocked) blocked
  from mine x group by x.org_id
 )
 select u.org_id from usable u left join public.org_active a on a.user_id=(select uid from me) and a.org_id=u.org_id
 order by u.blocked, (a.org_id is null), u.kind, u.created_at, u.org_id limit 1;
$$;
comment on function public.current_org_id() is 'Aktywna firma zalogowanej osoby (null bez dostępu). Używana w politykach org_isolation.';

-- Domyślna wartość org_id. Poza sesją użytkownika (migracje, worker, testy jako postgres) — jedyna firma, jeśli istnieje
-- tylko jedna; przy wielu firmach brak kontekstu kończy się błędem NOT NULL zamiast zgadywania.
create function public.org_default() returns uuid
language sql stable security definer set search_path='' as $$
 select coalesce(public.current_org_id(),(select o.id from public.organizations o where (select count(*) from public.organizations)=1));
$$;
alter table public.org_members alter column org_id set default public.org_default();

-- Bez anon: anon nie ma żadnej polityki permissive, więc jego zapytania do tabel kończą się pustym wynikiem
-- bez wywołania tych funkcji (sprawdzone testami 001–044).
revoke all on function public.current_org_id() from public, anon;
revoke all on function public.org_default() from public, anon;
grant execute on function public.current_org_id() to authenticated, service_role, avero_rpc;
grant execute on function public.org_default() to authenticated, service_role, avero_rpc;

-- Domyślne org_id = aktywna firma, indeks, polityki. org_isolation (restrictive, dla wszystkich ról) zawęża każdy
-- odczyt i zapis do aktywnej firmy — także wewnątrz funkcji RPC, bo działają jako avero_rpc bez BYPASSRLS.
-- rpc_access (permissive) wpuszcza avero_rpc; pozostałe polityki dla authenticated zostają bez zmian.
do $$
declare t text;
begin
 for t in
  select c.relname from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attname='org_id' and not a.attisdropped
  where c.relnamespace='public'::regnamespace and c.relkind='r' and c.relname<>'org_active' order by c.relname
 loop
  execute format('alter table public.%I alter column org_id set default public.org_default()',t);
  execute format('create index if not exists %I on public.%I(org_id)',t||'_org_id_idx',t);
  execute format('create policy org_isolation on public.%I as restrictive for all to public using (org_id = (select public.current_org_id())) with check (org_id = (select public.current_org_id()))',t);
  execute format('create policy rpc_access on public.%I for all to avero_rpc using (true) with check (true)',t);
 end loop;
end $$;
create policy rpc_access on public.user_preferences for all to avero_rpc using (true) with check (true);
create policy rpc_access on public.notification_preferences for all to avero_rpc using (true) with check (true);
create policy rpc_access on public.notification_email_preferences for all to avero_rpc using (true) with check (true);
create policy rpc_access on public.organizations for select to avero_rpc using (id = (select public.current_org_id()));
create policy rpc_access on public.org_active for all to avero_rpc using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Przypisanie technika i przypisanie do zgłoszenia muszą wskazywać członka tej samej firmy.
alter table public.service_tickets add constraint service_tickets_assigned_to_fkey foreign key(org_id,assigned_to)
 references public.org_members(org_id,user_id) on delete set null (assigned_to);
alter table public.staff_customer_assignments add constraint staff_customer_assignments_user_id_fkey foreign key(org_id,user_id)
 references public.org_members(org_id,user_id) on delete cascade;

-- Unikalności biznesowe w obrębie firmy (numery dokumentów — krok 4, profil firmy — krok 6).
drop index public.catalog_code_unique;
create unique index catalog_code_unique on public.catalog_items(org_id,lower(code));
alter table public.stock_items drop constraint stock_items_code_key, add constraint stock_items_code_key unique(org_id,code);
drop index public.stock_locations_vehicle;
create unique index stock_locations_vehicle on public.stock_locations(org_id,technician_id) where kind='vehicle' and active;
alter table public.customer_category_colors drop constraint customer_category_colors_pkey, add primary key(org_id,key);
alter table public.account_access drop constraint account_access_pkey, add primary key(org_id,user_id);
-- Pamięć geokodowania też należy do firmy: firma nie nadpisuje cudzych współrzędnych ani nie sprawdza, czy ktoś
-- inny geokodował adres. Istniejące wpisy → Kranz HVACR.
alter table public.geocode_cache drop constraint geocode_cache_pkey, add primary key(org_id,query);
create index account_access_user_idx on public.account_access(user_id);

-- Uprawnienia avero_rpc: tabele i sekwencje public (także przyszłe, tworzone przez postgres w migracjach).
grant select, insert, update, delete on all tables in schema public to avero_rpc;
grant usage, select, update on all sequences in schema public to avero_rpc;
alter default privileges for role postgres in schema public grant select, insert, update, delete on tables to avero_rpc;
alter default privileges for role postgres in schema public grant usage, select, update on sequences to avero_rpc;

-- finish_document (RPC) sprawdza w storage.objects, czy plik dotarł, zanim dokument stanie się „ready”;
-- dostęp do pliku dla użytkownika nadal daje wyłącznie hvac_files_read przez documents (z org_isolation).
create policy avero_rpc_read on storage.objects for select to avero_rpc using (bucket_id='hvac-documents');

-- Audyt zapisuje firmę rekordu (nie aktywną firmę osoby) — poprawnie także przy przyjęciu zaproszenia i w workerze.
create or replace function public.audit_crm_change() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.audit_logs(org_id, actor_id, table_name, row_id, action, old_data, new_data)
  values (new.org_id, auth.uid(), tg_table_name, new.id, tg_op,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end, to_jsonb(new));
  return new;
end;
$$;
create or replace function public.audit_access_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare before_data jsonb; after_data jsonb; target uuid; label text:=case tg_table_name when 'org_members' then 'staff_users' else tg_table_name end;
begin
 if tg_op <> 'INSERT' then before_data:=to_jsonb(old); end if;
 if tg_op <> 'DELETE' then after_data:=to_jsonb(new); end if;
 target:=coalesce((after_data->>'user_id')::uuid,(before_data->>'user_id')::uuid,(after_data->>'accepted_by')::uuid);
 insert into public.access_audit_logs(org_id,actor_id,target_user_id,action,old_data,new_data)
 values(coalesce((after_data->>'org_id')::uuid,(before_data->>'org_id')::uuid),auth.uid(),target,label||':'||tg_op,before_data,after_data);
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create or replace function public.audit_company_profile() returns trigger
language plpgsql security definer set search_path='' as $$begin
 insert into public.audit_logs(org_id,table_name,row_id,action,actor_id,old_data,new_data) values(new.org_id,'company_profiles','00000000-0000-4000-8000-000000000021',TG_OP,auth.uid(),case when TG_OP='UPDATE' then to_jsonb(OLD)-'data' else null end,to_jsonb(NEW)-'data');return NEW;
end;$$;

-- Nowa firma dostaje magazyn główny (dotychczasowy wiersz 5e000000-…-0001 zostaje magazynem Kranz HVACR).
create function public.create_org_warehouse() returns trigger
language plpgsql security definer set search_path='' as $$begin
 insert into public.stock_locations(id,org_id,kind,name) values(gen_random_uuid(),new.id,'warehouse','Magazyn główny');return new;
end;$$;
revoke all on function public.create_org_warehouse() from public, anon, authenticated;
create trigger organizations_warehouse after insert on public.organizations for each row execute function public.create_org_warehouse();

-- Kolory kategorii firm: klucz w obrębie firmy.
create or replace function public.save_customer_category(p_name text, p_color text, p_rename text default null) returns void
language plpgsql security definer set search_path='' as $$
declare target text:=coalesce(nullif(trim(p_rename),''),trim(p_name));begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_name is null or length(trim(p_name)) not between 1 and 40 or length(target)>40 or target~'[[:cntrl:]]' or p_color not in('blue','teal','violet','orange','green','amber','red','grey') then raise exception 'Invalid category' using errcode='22023';end if;
 if lower(target)<>lower(trim(p_name)) or target<>trim(p_name) then
  update public.customers set categories=(select coalesce(array_agg(v order by o),'{}') from(select distinct on(lower(v)) v,o from unnest(array_replace(categories,(select x from unnest(categories) x where lower(x)=lower(trim(p_name)) limit 1),target)) with ordinality u(v,o) order by lower(v),o) d)
  where exists(select 1 from unnest(categories) x where lower(x)=lower(trim(p_name)));
  delete from public.customer_category_colors where key=lower(trim(p_name));
 end if;
 insert into public.customer_category_colors(key,color) values(lower(target),p_color) on conflict(org_id,key) do update set color=excluded.color;
end;$$;

-- Spójność zgłoszenia z instalacją sprawdzana jako właściciel tabel (wyzwalacz działa też przy wstawieniach bez sesji
-- użytkownika); dodatkowo instalacja musi należeć do tej samej firmy co zgłoszenie.
create or replace function public.validate_ticket_installation() returns trigger
language plpgsql security definer set search_path='' as $$
declare c uuid; o uuid;
begin
  select l.customer_id, i.org_id into c, o from public.installations i join public.locations l on l.id = i.location_id where i.id = new.installation_id;
  if new.customer_id is distinct from c or new.org_id is distinct from o then
    raise exception 'Ticket installation belongs to another customer';
  end if;
  return new;
end $$;
revoke all on function public.validate_ticket_installation() from public, anon, authenticated;

-- Pamięć geokodowania: klucz w obrębie firmy (odczyt geocode_lookup / geocode_pending filtruje org_isolation).
create or replace function public.save_geocode(p_key text, p_lat double precision, p_lng double precision) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not public.can_manage_crm() then raise exception 'Office required' using errcode='42501';end if;
 if p_key is null or length(p_key) not between 3 and 400 or p_key<>lower(p_key) or (p_lat is null)<>(p_lng is null) or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'Invalid geocode' using errcode='22023';end if;
 insert into public.geocode_cache(query,latitude,longitude,failed) values(p_key,p_lat,p_lng,p_lat is null)
 on conflict(org_id,query) do update set latitude=excluded.latitude,longitude=excluded.longitude,failed=excluded.failed,fetched_at=now();
end;$$;
