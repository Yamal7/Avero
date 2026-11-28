-- KRA-76 (cd. KRA-71 i KRA-74, decyzja właściciela): rola authenticated (klucz publiczny + sesja) traci w public
-- uprawnienia, których aplikacja nie używa. Tylko zawężenie — nic nie jest nadawane, dane bez zmian.
-- Pilnuje supabase/tests/048_authenticated_grants.sql (lista dozwolonych = stan po tej migracji).
--
-- Co zostaje i dlaczego (ustalone przeglądem src/, funkcji security invoker, polityk RLS i storage):
--   INSERT, UPDATE na customers, locations, installations, devices
--     — server action saveRecord (src/app/(dashboard)/dashboard/actions.ts: insert/update encji z entitySchema)
--       i archiveCustomer (update customers.archived_at); zapis ograniczają polityki *_staff_insert/_update.
--   SELECT na customers, locations, installations, devices, service_tickets, service_visits, service_protocols,
--     catalog_items — bezpośrednie zapytania PostgREST (.from / osadzenia) w src/;
--     documents — funkcje security invoker portal_documents/portal_file/document_file i polityka storage
--       hvac_files_read (podzapytanie na documents, wykonywane z uprawnieniami wywołującego);
--     maintenance_plans, maintenance_completions, offers — funkcje security invoker (portal_installation(s),
--       portal_overview, maintenance_completion_history, offer_detail, list_offers), które authenticated wykonuje.
--   Polityki RLS tabel nie są zmieniane.
--
-- 1. Sekwencje public (audit_logs_id_seq, access_audit_logs_id_seq): authenticated mógł wołać nextval/setval
--    (RLS nie obejmuje sekwencji). Wiersze audytu zapisują wyzwalacze SECURITY DEFINER (audit_crm_change, właściciel
--    postgres) i funkcje RPC (właściciel avero_rpc) — wywołujący nie potrzebuje uprawnienia do sekwencji.
revoke all on all sequences in schema public from authenticated;

-- 2. DELETE: żadna tabela public nie ma polityki DELETE dla authenticated, a kod nie usuwa wierszy bezpośrednio
--    (archiwizacja = UPDATE archived_at). Dotyczy customers, devices, installations, locations, sales_inquiries.
revoke delete on all tables in schema public from authenticated;

-- 3. INSERT / UPDATE: zostają tylko na czterech tabelach CRM z saveRecord. Dziś odbiera to INSERT/UPDATE
--    na sales_inquiries (kod nie zapisuje zapytań ofertowych bezpośrednio). Pętla zamiast listy, żeby objąć też
--    granty, które mogły się pojawić na zdalnym projekcie poza migracjami.
do $$
declare r record;
begin
  for r in
    select c.oid::regclass as rel from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind in ('r','p','v','m','f')
      and c.relname not in ('customers','locations','installations','devices')
  loop
    execute format('revoke insert, update on %s from authenticated', r.rel);
  end loop;
end $$;

-- 4. SELECT na tabelach, których authenticated nie czyta żadną drogą (odczyt idzie przez RPC SECURITY DEFINER
--    właściciela avero_rpc): sales_inquiries, customer_import_batches, installation_handovers, offer_documents,
--    offer_publications, work_orders, work_order_visits. Polityki SELECT dla authenticated na tych tabelach
--    zostają (bez grantu nie są oceniane), żeby ewentualny powrót do odczytu wymagał tylko jawnego GRANT.
revoke select on public.sales_inquiries, public.customer_import_batches, public.installation_handovers,
  public.offer_documents, public.offer_publications, public.work_orders, public.work_order_visits from authenticated;

-- 5. Domyślne uprawnienia: sekwencje tworzone przez postgres (migracje, także identity) nie dają authenticated
--    niczego. Nie psuje istniejących wzorców: wszystkie zapisy do tabel z sekwencjami idą przez SECURITY DEFINER.
--    Domyślne granty authenticated na nowych tabelach (SELECT/INSERT/UPDATE/DELETE) zostają — migracje modułów
--    odbierają je jawnie; ich zawężenie to osobna decyzja (docs/STATUS.md › KRA-76).
alter default privileges for role postgres in schema public
  revoke all on sequences from authenticated;

-- Uwaga (Supabase): rola postgres nie jest superuserem. REVOKE odbiera tylko granty nadane przez postgres;
-- grant nadany przez supabase_admin zostałby (WARNING „no privileges could be revoked”). Po wgraniu na zdalny
-- projekt sprawdź zapytaniem kontrolnym z docs/STATUS.md › KRA-76 (wynik = 0).
