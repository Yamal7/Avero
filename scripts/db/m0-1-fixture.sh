#!/usr/bin/env bash
# M0.1 — dane do testu liczności. Odtwarza testy pgTAP 001–042 z COMMIT zamiast ROLLBACK, każdy plik z własną
# przestrzenią identyfikatorów (UUID i e-maile z numerem pliku), żeby dane z różnych plików mogły współistnieć.
# Potem dopisuje rekordy do tabel, których testy nie zostawiają (m0-1-fixture-gaps.sql).
# Tylko lokalna baza (kontener Supabase CLI). Nie uruchamiaj na zdalnym projekcie.
set -euo pipefail
cd "$(dirname "$0")/../.."
DB_CONTAINER="${DB_CONTAINER:-supabase_db_hvac-mvp-dev}"
psql_local() { docker exec -i "$DB_CONTAINER" psql -U postgres -q -v ON_ERROR_STOP=1 "$@"; }
for f in supabase/tests/0[0-3]*.sql supabase/tests/04[0-2]*.sql; do
  n=$(basename "$f" | cut -c1-3)
  # Unikalne kody i ścieżki z poprzednich plików dostają przedrostek, żeby kolejny plik mógł użyć tych samych.
  psql_local >/dev/null <<'SQL'
update public.catalog_items set code=upper(left('K'||substr(md5(id::text),1,6)||'-'||code,64)) where code not like 'K______-%';
update public.documents set storage_path='k-'||id||'/'||storage_path where storage_path not like 'k-%';
update storage.objects set name='k-'||id||'/'||name where bucket_id='hvac-documents' and name not like 'k-%';
SQL
  # Stałe wiersze z migracji (magazyn główny, profil firmy) zostają; reszta UUID dostaje numer pliku w 3. grupie.
  if ! perl scripts/db/m0-1-remap.pl "$n" < "$f" | psql_local >/dev/null 2>"${TMPDIR:-/tmp}/m0-1-fixture-$n.log"; then
    echo "pominięto $f: $(grep -m1 ERROR "${TMPDIR:-/tmp}/m0-1-fixture-$n.log" || true)" >&2
  fi
done
psql_local < scripts/db/m0-1-fixture-gaps.sql >/dev/null
