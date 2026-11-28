-- KRA-71: odebranie rolom API zbędnych uprawnień. Tylko zawężenie — nic nie jest nadawane, dane bez zmian.
-- Pilnuje tego supabase/tests/046_api_grants.sql.
--
-- 1. TRUNCATE / REFERENCES / TRIGGER na tabelach public dla anon i authenticated.
--    Przyszły z domyślnych grantów Supabase na 9 tabelach rdzenia (customers, devices, documents,
--    installations, locations, maintenance_plans, sales_inquiries, service_tickets, service_visits).
--    TRUNCATE omija RLS, więc to realna dziura; REFERENCES i TRIGGER nie są potrzebne żadnej roli API.
--    Pozostałe granty (SELECT/INSERT/UPDATE/DELETE) zostają bez zmian, żeby nie zmieniać tego, co widzi anon
--    (dziś: 0 wierszy przez RLS) — patrz docs/STATUS.md › KRA-71 › Pytania.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- 2. EXECUTE dla PUBLIC i anon na wszystkich funkcjach public. Dotyczy: is_staff(), can_access_customer(uuid),
--    customer_for_installation(uuid), customer_for_ticket(uuid), audit_crm_change(), search_customers(text,boolean),
--    valid_bank_account(text). Wyjątków dla anon nie ma: żadna droga bez sesji nie woła RPC
--    (logowanie = Supabase Auth, zaproszenie woła read_my_invitation/accept_access_invitation po ustawieniu sesji,
--    worker poczty = service_role). Polityki RLS z is_staff()/can_access_customer() są nadane tylko roli
--    authenticated, więc nie są oceniane dla anon; polityka org_isolation woła current_org_id(), którego anon
--    i tak nie wykonywał. audit_crm_change() to funkcja wyzwalacza — prawo EXECUTE nie jest sprawdzane przy odpaleniu.
--    authenticated, service_role i avero_rpc mają jawne granty i ich nie tracą.
revoke execute on all routines in schema public from public, anon;

-- 3. Domyślne uprawnienia dla obiektów, które migracje (rola postgres) utworzą w przyszłości.
--    Granty anon/authenticated w public są nadawane per schemat, więc można je zawęzić per schemat.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on routines from anon;
--    EXECUTE dla PUBLIC jest domyślnym grantem globalnym Postgresa (nie per schemat) i nie da się go zawęzić
--    tylko do public. Globalne `alter default privileges for role postgres revoke execute on routines from public`
--    odebrałoby EXECUTE także funkcjom w pg_temp i innych schematach (testy pgTAP wołają funkcje pg_temp jako
--    authenticated) — świadomie tego nie robimy. Nowa funkcja nadal potrzebuje `revoke all … from public, anon`
--    (CLAUDE.md), a test 046 wyłapie każdą funkcję public, którą anon może wykonać.
