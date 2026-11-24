#!/usr/bin/env bash
# M0.1 Wielofirmowość (KRA-27) — test liczności przed / po migracji (warunek D2). WYŁĄCZNIE lokalna baza Supabase CLI.
#   1. baza lokalna do stanu sprzed M0.1 (202611200008_user_preferences.sql),
#   2. dane we wszystkich tabelach (scripts/db/m0-1-fixture.sh),
#   3. liczba wierszy każdej tabeli + odcisk numerów dokumentów,
#   4. migracje M0.1 (supabase migration up --local),
#   5. porównanie: żaden wiersz nie ginie, numery bez zmian, wszystko w firmie „Kranz HVACR”.
# Z --rollback dodatkowo: skrypt cofający supabase/rollback/m0-1-organizations-down.sql → te same liczby i numery,
# schemat bez organizacji. Na końcu baza wraca do pełnego stanu migracji (supabase db reset --local).
set -euo pipefail
cd "$(dirname "$0")/../.."
DB_CONTAINER="${DB_CONTAINER:-supabase_db_hvac-mvp-dev}"
ROLLBACK=0; [ "${1:-}" = "--rollback" ] && ROLLBACK=1
OUT="${TMPDIR:-/tmp}/m0-1-count-check"; mkdir -p "$OUT"
q() { docker exec -i "$DB_CONTAINER" psql -U postgres -At -q -v ON_ERROR_STOP=1 "$@"; }

# Liczba wierszy każdej tabeli public (nazwy sprzed M0.1: staff_users, stock_doc_counters).
counts() {
  q <<'SQL'
select case c.relname when 'org_members' then 'staff_users' when 'org_doc_counters' then 'stock_doc_counters' else c.relname end,
 (xpath('/row/n/text()',query_to_xml(format('select count(*) n from public.%I',c.relname),false,true,'')))[1]::text
from pg_class c where c.relnamespace='public'::regnamespace and c.relkind='r' order by 1;
SQL
}
# Odcisk istniejących numerów dokumentów (id → numer) — muszą zostać identyczne.
numbers() {
  q <<'SQL'
select 'service_tickets', md5(string_agg(id||':'||ticket_number,',' order by id)) from public.service_tickets union all
select 'service_protocols', md5(string_agg(id||':'||protocol_number,',' order by id)) from public.service_protocols union all
select 'offers', md5(string_agg(id||':'||offer_number,',' order by id)) from public.offers union all
select 'work_orders', md5(string_agg(id||':'||order_number,',' order by id)) from public.work_orders union all
select 'installation_handovers', md5(string_agg(id||':'||protocol_number,',' order by id)) from public.installation_handovers union all
select 'crm_tasks', md5(string_agg(id||':'||number,',' order by id)) from public.crm_tasks union all
select 'stock_documents', md5(string_agg(id||':'||number,',' order by id)) from public.stock_documents;
SQL
}
# Odcisk schematu public: kolumny, ograniczenia, indeksy, polityki, funkcje (treść, właściciel, uprawnienia), widoki.
schema() {
  q <<'SQL'
select 'kolumny', md5(string_agg(table_name||'.'||column_name||':'||data_type||':'||is_nullable||':'||coalesce(column_default,'')||':'||is_identity,',' order by table_name,column_name)) from information_schema.columns where table_schema='public' union all
select 'ograniczenia', md5(string_agg(conrelid::regclass||'.'||conname||':'||pg_get_constraintdef(oid),',' order by conrelid::regclass::text,conname)) from pg_constraint where connamespace='public'::regnamespace union all
select 'indeksy', md5(string_agg(indexdef,',' order by indexname)) from pg_indexes where schemaname='public' union all
select 'polityki', md5(string_agg(schemaname||'.'||tablename||'.'||policyname||':'||permissive||':'||roles::text||':'||cmd||':'||coalesce(qual,'')||':'||coalesce(with_check,''),',' order by schemaname,tablename,policyname)) from pg_policies where schemaname in ('public','storage') union all
select 'funkcje', md5(string_agg(p.oid::regprocedure::text||':'||pg_get_userbyid(p.proowner)||':'||coalesce((select string_agg(x::text,' ' order by x::text) from unnest(p.proacl) x),'')||':'||pg_get_functiondef(p.oid),',' order by p.oid::regprocedure::text)) from pg_proc p where p.pronamespace='public'::regnamespace and p.prokind='f' union all
select 'tabele i widoki', md5(string_agg(c.relname||':'||c.relkind::text||':'||c.relrowsecurity::text||':'||coalesce((select string_agg(x::text,' ' order by x::text) from unnest(c.relacl) x),''),',' order by c.relname)) from pg_class c where c.relnamespace='public'::regnamespace and c.relkind in ('r','v','S') union all
select 'wyzwalacze', md5(string_agg(tgrelid::regclass||'.'||tgname||':'||pg_get_triggerdef(oid),',' order by tgrelid::regclass::text,tgname)) from pg_trigger where not tgisinternal and tgrelid::regclass::text not like '%.%';
SQL
}
compare() { # $1 = plik przed, $2 = plik po, $3 = etykieta; org_doc_counters może mieć +6 liczników nowych rodzajów
  join -t'|' -a1 -a2 -e MISSING -o 0,1.2,2.2 "$1" "$2" | awk -F'|' -v label="$3" -v extra="${4:-0}" '
    BEGIN { bad=0; printf "%-34s %8s %8s  %s\n", "tabela", "przed", label, "wynik" }
    { status="ok"
      if ($2=="MISSING") status="nowa tabela"
      else if ($3=="MISSING") { status="BRAK TABELI"; bad=1 }
      else if ($1=="stock_doc_counters" && extra) { if ($3!=$2+6) { status="RÓŻNICA"; bad=1 } else status="ok (+6 liczników ZS/PS/OF/ZL/PM/ZD)" }
      else if ($3!=$2) { status="RÓŻNICA"; bad=1 }
      printf "%-34s %8s %8s  %s\n", $1, $2, $3, status }
    END { exit bad }'
}

echo "== Baza lokalna do 202611200008 (przed M0.1)"
pnpm exec supabase db reset --local --version 202611200008 >/dev/null 2>&1
echo "== Dane testowe we wszystkich tabelach"
./scripts/db/m0-1-fixture.sh
counts | sort > "$OUT/before.txt"; numbers | sort > "$OUT/numbers-before.txt"; schema > "$OUT/schema-before.txt"
echo "   tabel: $(wc -l < "$OUT/before.txt" | tr -d ' '), wierszy: $(awk -F'|' '{s+=$2} END {print s}' "$OUT/before.txt")"
q -c "select string_agg(relname,', ' order by relname) from pg_class where relnamespace='public'::regnamespace and relkind='r' and (xpath('/row/n/text()',query_to_xml(format('select count(*) n from public.%I',relname),false,true,'')))[1]::text='0'" | grep -q . \
  && { echo "   UWAGA: puste tabele przed migracją"; }

echo "== Migracje M0.1"
pnpm exec supabase migration up --local >/dev/null 2>&1
counts | sort > "$OUT/after.txt"; numbers | sort > "$OUT/numbers-after.txt"
status=0
compare "$OUT/before.txt" "$OUT/after.txt" "po" 1 || status=1
if diff -q "$OUT/numbers-before.txt" "$OUT/numbers-after.txt" >/dev/null; then echo "Numery dokumentów: bez zmian (7 rodzajów)"; else echo "Numery dokumentów: RÓŻNICA"; diff "$OUT/numbers-before.txt" "$OUT/numbers-after.txt" || true; status=1; fi
foreign=$(q <<'SQL'
select coalesce(string_agg(t||'='||n,', '),'') from (
 select c.relname t,(xpath('/row/n/text()',query_to_xml(format('select count(*) n from public.%I where org_id is distinct from %L',c.relname,'0a000000-0000-4000-8000-000000000001'),false,true,'')))[1]::text::int n
 from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attname='org_id' and not a.attisdropped
 where c.relnamespace='public'::regnamespace and c.relkind='r') x where n>0;
SQL
)
tables=$(q -c "select count(*) from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attname='org_id' where c.relnamespace='public'::regnamespace and c.relkind='r' and c.relname<>'org_active'")
orgs=$(q -c "select string_agg(name,', ') from public.organizations")
if [ -z "$foreign" ]; then echo "Firma: wszystkie wiersze $tables tabel z org_id należą do „$orgs”"; else echo "Wiersze spoza Kranz HVACR: $foreign"; status=1; fi

if [ "$ROLLBACK" = 1 ]; then
  echo "== Cofnięcie (supabase/rollback/m0-1-organizations-down.sql)"
  q -1 < supabase/rollback/m0-1-organizations-down.sql >/dev/null
  counts | sort > "$OUT/rolled.txt"; numbers | sort > "$OUT/numbers-rolled.txt"; schema > "$OUT/schema-rolled.txt"
  compare "$OUT/before.txt" "$OUT/rolled.txt" "cofn." || status=1
  if diff -q "$OUT/numbers-before.txt" "$OUT/numbers-rolled.txt" >/dev/null; then echo "Numery dokumentów po cofnięciu: bez zmian"; else echo "Numery po cofnięciu: RÓŻNICA"; status=1; fi
  leftovers=$(q <<'SQL'
select concat_ws(', ',
 (select 'tabele: '||string_agg(relname,' ') from pg_class where relnamespace='public'::regnamespace and relname in ('organizations','org_active','org_members','org_doc_counters','auth_user_directory')),
 (select 'kolumny org_id: '||count(*) from information_schema.columns where table_schema='public' and column_name='org_id' having count(*)>0),
 (select 'funkcje: '||string_agg(proname,' ') from pg_proc where pronamespace='public'::regnamespace and proname in ('current_org_id','org_default','my_organizations','set_active_org','next_org_number','assign_org_number','valid_bank_account','create_org_warehouse','org_knows_user','account_enabled_in')),
 (select 'polityki: '||count(*) from pg_policies where policyname in ('org_isolation','rpc_access','avero_rpc_read') having count(*)>0),
 (select 'rola avero_rpc' from pg_roles where rolname='avero_rpc'),
 (select 'właściciel funkcji ≠ postgres: '||count(*) from pg_proc where pronamespace='public'::regnamespace and pg_get_userbyid(proowner)<>'postgres' having count(*)>0));
SQL
)
  if [ -z "$leftovers" ]; then echo "Schemat po cofnięciu: bez organizacji, org_id, avero_rpc i funkcji M0.1"; else echo "Pozostałości po cofnięciu: $leftovers"; status=1; fi
  if diff -q "$OUT/schema-before.txt" "$OUT/schema-rolled.txt" >/dev/null; then echo "Schemat po cofnięciu: identyczny jak przed M0.1 (kolumny, ograniczenia, indeksy, polityki, funkcje, uprawnienia, wyzwalacze)"; else echo "Schemat po cofnięciu różni się w:"; diff "$OUT/schema-before.txt" "$OUT/schema-rolled.txt" | grep '^>' | cut -d'|' -f1 || true; status=1; fi
  identity=$(q -c "select string_agg(table_name||'.'||column_name,' ' order by 1) from information_schema.columns where table_schema='public' and is_identity='YES'")
  echo "Kolumny identity po cofnięciu: $identity"
  next=$(q -c "select (select count(*) from public.service_tickets)>=0 and has_sequence_privilege('public.crm_task_number_seq','usage')")
  [ "$next" = "t" ] && echo "Sekwencja zadań crm_task_number_seq: odtworzona"
fi

echo "== Przywrócenie pełnej bazy lokalnej (supabase db reset --local)"
pnpm exec supabase db reset --local >/dev/null 2>&1
[ "$status" = 0 ] && echo "WYNIK: OK" || echo "WYNIK: BŁĄD"
exit "$status"
