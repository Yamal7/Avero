-- KRA-77 (cd. KRA-71, KRA-74, KRA-76, decyzja właściciela): nowe tabele, widoki, sekwencje i funkcje tworzone
-- przez postgres (migracje) w public nie dają roli authenticated żadnego uprawnienia przez domyślne uprawnienia
-- schematu. Tylko zawężenie — istniejące obiekty, ich granty i dane bez zmian; anon, service_role i avero_rpc
-- bez zmian. Pilnuje supabase/tests/049_default_privileges.sql.
--
-- Przed migracją pg_default_acl (postgres, public) zawierał dla authenticated:
--   r (tabele i widoki): arwd — SELECT/INSERT/UPDATE/DELETE na każdej nowej tabeli,
--   f (funkcje):         X    — EXECUTE na każdej nowej funkcji (wpis na poziomie schematu, nie globalny).
-- Sekwencje (S) odebrano już w 202611280008.
--
-- Co ta zmiana daje: nowa tabela bez jawnego GRANT jest dla authenticated zamknięta (42501) — dostęp przez RPC;
-- bezpośredni grant musi być nadany jawnie w migracji i wpisany do listy dozwolonych w teście 048.
-- Nowa funkcja nie dostaje już osobnego wpisu EXECUTE dla authenticated.
--
-- Czego nie daje: EXECUTE dla PUBLIC na nowych funkcjach to wbudowana wartość globalna Postgresa (nie wpis
-- schematu), więc authenticated nadal może wykonać nową funkcję przez PUBLIC, dopóki migracja nie zrobi
-- `revoke all … from public, anon, authenticated` (CLAUDE.md). Globalnego odebrania świadomie nie robimy (KRA-71:
-- obejmowałoby pg_temp i inne schematy). Funkcje w pg_temp nie podlegają domyślnym uprawnieniom schematu public.
--
-- Uwaga (Supabase): zmienia tylko domyślne uprawnienia roli postgres. Obiekty tworzone przez supabase_admin
-- (platforma) mają własne domyślne uprawnienia, poza zasięgiem postgres. Zapytanie kontrolne: docs/STATUS.md › KRA-77.
alter default privileges for role postgres in schema public
  revoke all on tables from authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from authenticated;
