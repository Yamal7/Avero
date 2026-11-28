-- KRA-74 (cd. KRA-71, decyzja właściciela): rola anon (klucz publiczny bez sesji) nie dostaje żadnego
-- uprawnienia do tabel, widoków, widoków zmaterializowanych, tabel obcych ani sekwencji w public.
-- Tylko zawężenie — nic nie jest nadawane, dane bez zmian. Pilnuje supabase/tests/047_anon_no_table_access.sql.
--
-- Przed migracją anon miał (z domyślnych grantów Supabase): SELECT na 9 tabelach rdzenia, INSERT/UPDATE/DELETE
-- na 7 z nich, a na sekwencjach audit_logs_id_seq i access_audit_logs_id_seq USAGE/SELECT/UPDATE.
-- RLS i tak nie wpuszczało anon do wierszy (PostgREST zwracał []); teraz odpowiedź to 42501.
-- Żadna droga bez sesji nie czyta tabel jako anon: logowanie = Supabase Auth (schemat auth), zaproszenie woła
-- read_my_invitation / accept_access_invitation po setSession (authenticated), middleware woła tylko auth.getUser,
-- /api/health nie dotyka bazy, worker poczty i /api/internal/* działają jako service_role, storage.objects
-- nie ma polityk dla anon. authenticated, service_role i avero_rpc nie są tu zmieniane.
--
-- Uwaga (Supabase): rola postgres nie jest superuserem. REVOKE odbiera tylko granty, których grantorem jest
-- postgres (albo rola, do której postgres należy); grant nadany przez supabase_admin zostałby bez błędu
-- (tylko WARNING „no privileges could be revoked”). Lokalnie wszystkie granty anon w public mają grantora
-- postgres. Po wgraniu na zdalny projekt sprawdź zapytaniem kontrolnym z docs/STATUS.md › KRA-74 (wynik = 0).
-- To samo dotyczy domyślnych uprawnień: zmieniamy tylko te dla obiektów tworzonych przez postgres (migracje);
-- domyślne uprawnienia supabase_admin w public (obiekty tworzone przez platformę) są poza zasięgiem postgres.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
