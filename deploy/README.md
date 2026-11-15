# Konfiguracja pilotażu do uzupełnienia — 6.11.2026

Hosting, domena i nadawca nie zostały jeszcze wybrane. Ten pakiet przygotowuje konfigurację; nie publikuje aplikacji i nie zakłada płatnych usług. Wymagany jest hosting uruchamiający serwer Node/Next.js oraz oddzielny projekt Supabase. Statyczny hosting HTML nie obsłuży tego programu.

## Przekazanie konfiguracji operatorowi

1. Ustal domenę pilotażu, projekt Supabase i osoby testujące. Nie kopiuj lokalnej bazy z danymi użytkownika do usług zewnętrznych.
2. Skopiuj `deploy/pilot.env.example` do `deploy/pilot.env` albo wprowadź wartości w menedżerze sekretów hostingu. Plik `.env` jest ignorowany przez Git. Nie wklejaj kluczy do czatu, dokumentacji ani zrzutów.
3. Uzupełnij kanoniczny `APP_URL` i oba publiczne ustawienia Supabase. Sekrety workera i dostawcy nie mogą mieć prefiksu `NEXT_PUBLIC_`. Klucz service_role/secret nie zastępuje publicznego klucza.
4. Pierwsze uruchomienie z `NOTIFICATION_MAIL_MODE=disabled`. Dostęp aplikacji nie jest zależny od uruchomienia e-maili.
5. Uruchom sprawdzenie bez wykonywania operacji sieciowych:

```sh
node --env-file=deploy/pilot.env scripts/pilot-preflight.mjs
# Gdy hosting już wstrzykuje zmienne do procesu:
npm run pilot:check
```

Kod wyjścia 1 blokuje uznanie konfiguracji za uzupełnioną; 0 oznacza wyłącznie przejście walidacji statycznej. Narzędzie nie drukuje wartości. Sprawdza adresy HTTPS, brak szablonowych wartości, typ klucza publicznego i wymagania poczty. Nie sprawdza podpisu JWT, przynależności klucza do projektu, DNS, połączenia z bazą ani uprawnień dostawcy — te elementy trzeba potwierdzić na środowisku docelowym.

## Wdrożenie aplikacji

- Zastosuj wersję Node obsługującą `--env-file` i zgodną z zainstalowaną wersją Next. Użyj pnpm i istniejącego `pnpm-lock.yaml`, bez aktualizowania zależności w trakcie pierwszego wdrożenia. Zapisz wersje Node/pnpm w raporcie środowiska.
- Instalacja: `pnpm install --frozen-lockfile`. Kontrole: `pnpm test`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`.
- Zmienne publiczne właściwego projektu muszą być dostępne już podczas build. Po zmianie `NEXT_PUBLIC_*` wykonaj nowy build; Next umieszcza je w przeglądarkowym pakiecie podczas kompilacji. [Dokumentacja Next](https://nextjs.org/docs/app/guides/self-hosting).
- Start: `pnpm run start -- -H 127.0.0.1 -p 3100` za proxy HTTPS na tym samym serwerze. Na hostingu kontenerowym użyj hosta/portu wymaganego przez dostawcę i prywatnej sieci platformy; parametr loopback jest przykładem dla proxy na jednym serwerze.
- Zachowaj pliki `assets/fonts` i pliki runtime projektu; nie wdrażaj samego folderu `public`. Generowanie PDF wymaga Node i PDFKit.
- Na świeżym, wydzielonym Supabase zastosuj migracje z `supabase/migrations` w kolejności. Przed migracją istniejącego środowiska wykonaj kopię. Nie używaj `db reset` ani `migration repair` jako metody wdrożenia schematu. Najpierw obejrzyj listę oczekujących migracji i sprawdź projekt docelowy.
- W Supabase Auth skonfiguruj Site URL i dozwolone adresy przekierowań dla dokładnej domeny. Oddzielnie skonfiguruj SMTP zaproszeń. Nie otwieraj publicznego dostępu do bucketów ani tabel.
- Pierwszy administrator wymaga świadomego przypisania istniejącego konta do właściwej roli; sam deploy nie tworzy admina. Pozostałe role/przypisania przez panel Użytkownicy.
- Sprawdź `/login`, logowanie, odczyt klienta, pobranie PDF i upload/pobranie prywatnego pliku. Sam HTTP 200 logowania nie potwierdza zdrowia bazy ani Storage.

## Worker poczty — dopiero po konfiguracji

Po weryfikacji nadawcy ustaw `resend`, jawnych odbiorców pilotażowych i serwerowe sekrety. Najpierw wykonaj pojedynczy kontrolowany cykl:

```sh
node --env-file=deploy/pilot.env scripts/notification-email-worker.mjs --once
# Proces długotrwały na hostingu obsługującym worker:
node --env-file=deploy/pilot.env scripts/notification-email-worker.mjs
```

Na hostingu wstrzykującym zmienne użyj polecenia bez `--env-file`. Alternatywą jest harmonogram POST `/api/internal/email/dispatch` z sekretem Bearer w nagłówku, nigdy w URL. Sam serwer Next nie uruchamia workera. Potrzebne jest monitorowanie ostatniego poprawnego cyklu, błędów i wiadomości niepewnych. Przed realną próbą odbiorca musi włączyć własne przypomnienia. Szczegóły limitów i ponowień: [NOTIFICATION_EMAIL.md](../docs/NOTIFICATION_EMAIL.md).

## Kopia i próba odtworzenia

Kopia bazy nie zawiera bajtów plików Storage, tylko ich metadane. Potrzebne są **dwie kopie**: baza oraz prywatne obiekty (w projekcie bucket `hvac-documents`). Potwierdza to [dokumentacja kopii Supabase](https://supabase.com/docs/guides/platform/backups). Nie oznaczaj kopii jako kompletnej, jeśli pobrano wyłącznie SQL.

Procedura do wykonania po wyborze dostawcy:

1. Określ okno kopii i wstrzymaj zapisy aplikacji oraz worker. Zapisz czas UTC, wersję aplikacji i ostatnią migrację. Dla pilotażu proponowany początkowy cel: kopia co dobę, dodatkowo przed migracją; dopuszczalną utratę danych i czas odtworzenia zatwierdza właściciel.
2. Wykonaj obsługiwaną przez wybrany plan Supabase kopię bazy i niezależny eksport poza środowisko. Uzgodnij zakres Auth, schematu, danych, funkcji i RLS. Zachowaj konfigurację Auth, bucketów i sekretów osobno w chronionym magazynie.
3. Wyeksportuj wszystkie obiekty Storage z zachowaniem ścieżek; sporządź manifest: ścieżka, rozmiar, SHA-256. Porównaj liczbę i bajty z obiektami źródła. Nie zapisuj URL z tokenami w manifeście.
4. Zaszyfruj pakiet i przechowuj poza serwerem aplikacji. Dostęp ograniczony do operatora; hasło/klucz odtworzenia osobno. `backups/` jest ignorowany, ale to nie zapewnia szyfrowania ani kopii zewnętrznej.
5. Odtwórz do nowego, izolowanego projektu, z wyłączoną pocztą i harmonogramami. Nie wskazuj projektu użytkownika jako celu próby. Sposób odtworzenia dobierz do typu kopii i wersji Supabase; nie wykonuj surowego importu na działającej produkcji.
6. Przywróć obiekty Storage do tych samych ścieżek, konfigurację prywatnych bucketów, Auth i adresy izolowanego środowiska. Sprawdź manifest i brak publicznego dostępu.
7. Sprawdź scenariusz [PILOT_READINESS.md](../docs/PILOT_READINESS.md): logowanie i role, klient/oferta/odbiór/serwis, PDF, pliki i cofnięcie dostępu. Odczyt tabel nie wystarcza.
8. Zapisz czasy, liczby rekordów/plików, sumy, braki, wynik dostępu i operatora. Dopiero poprawny wynik oznacza sprawdzoną odtwarzalność. Usunięcie środowiska odtworzenia jest osobną świadomą operacją.

W tej iteracji nie wykonywano eksportu, transferu ani odtworzenia danych. Nie utworzono harmonogramu kopii. Dobór konkretnych poleceń eksportu i odtworzenia nastąpi po wyborze środowiska i planu usług.

## Gotowość pakietu

Szablon celowo nie przechodzi walidacji do uzupełnienia wartości. Zmiana nie uruchamia hostingu, nie kupuje domeny ani nie wysyła e-maili. Następny krok: wybór hostingu/projektu Supabase, domeny i nadawcy, a potem uzupełnienie sekretów bezpiecznie i próbne wdrożenie z wyłączoną pocztą.
