-- KRA-71 (cd. 202611280005): od Postgresa 17 domyślne granty Supabase dają rolom API także MAINTAIN
-- (VACUUM, ANALYZE, REINDEX, REFRESH, LOCK TABLE) — anon i authenticated go nie potrzebują, a LOCK TABLE
-- pozwala zablokować tabelę. Tylko zawężenie. Warunkowo, bo na Postgresie < 17 to uprawnienie nie istnieje
-- (wersja projektu „Avero” niepotwierdzona). Pilnuje supabase/tests/046_api_grants.sql.
do $$
begin
  if current_setting('server_version_num')::int >= 170000 then
    execute 'revoke maintain on all tables in schema public from anon, authenticated';
    execute 'alter default privileges for role postgres in schema public revoke maintain on tables from anon, authenticated';
  end if;
end $$;
