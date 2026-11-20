# HVAC MVP — Next.js + Supabase

Kontynuacja: panel CRM, import CSV, użytkownicy i uprawnienia, serwis oraz mobilny portal klienta. Portal: [docs/CUSTOMER_PORTAL.md](docs/CUSTOMER_PORTAL.md). Serwis: [docs/SERVICE_WORKFLOW.md](docs/SERVICE_WORKFLOW.md). Zarządzanie dostępem: [docs/ACCESS_MANAGEMENT.md](docs/ACCESS_MANAGEMENT.md). Instrukcja oraz stan weryfikacji: [docs/CONTINUATION.md](docs/CONTINUATION.md).

Startowy szkielet z migracją bazy, politykami RLS, prywatnym bucketem i testami. **Nie jest kompletną, audytowaną aplikacją produkcyjną.**

## Wymagania
- Node.js 20+ (zalecane aktualne LTS), npm, Docker, Supabase CLI.
- Dla uruchomienia lokalnego: `npm install`, `npx supabase start`.
- Skopiuj `.env.example` do `.env.local` i wstaw wartości `API URL` i `anon key` z `npx supabase status`.
- `npx supabase db reset` uruchamia migrację. `npm run dev` startuje portal.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run db:test`.

## Uprawnienia i provisioning
- Nowe konta w Supabase Auth **nie uzyskują automatycznie** dostępu do żadnego klienta.
- Uprawnienia do klientów nadaje wyłącznie zaufany proces administracyjny w `customer_memberships`.
- Uprawnienia pracownika nadaje wyłącznie zaufany proces w `staff_users`.
- Nie twórz endpointu publicznego do nadawania ról; operacje administracyjne tylko po weryfikacji uprawnień.
- Nie umieszczaj klucza `service_role` w frontendzie ani publicznym środowisku Next.js.
- `auth.getUser()` weryfikuje sesję. `middleware` jest dodatkową kontrolą nawigacji, a RLS ostatecznym zabezpieczeniem danych.

## Co zawiera repozytorium
- Migracja z tabelami, indeksami, rolami, RLS, kontrolą spójności zgłoszeń i politykami Storage.
- Minimalny panel z listą klientów, logowanie hasłem, endpoint health.
- Test jednostkowy walidacji Zod oraz test SQL izolacji dwóch klientów i pracownika.

## Przed produkcją (blokery)
1. Wykonaj testy RLS na lokalnej instancji i stagingu; zweryfikuj wersje zależności, migracje i `npm run build`.
2. Panel admin UI/API jest wdrożony. Przed produkcją skonfiguruj SMTP, wymagane potwierdzanie e-mail, adresy powrotu i przeprowadź pilotaż zaproszeń.
3. Dodaj pełne CRUD, walidację Zod dla każdego zapisu, limitowanie zgłoszeń i przesyłanych plików.
4. Zaimplementuj workflow dokumentów: najpierw upload do ścieżki losowej, potem zatwierdzony rekord; sprzątanie osieroconych plików.
5. Dodaj automatyczne przypomnienia z deduplikacją i retry, logi audytowe oraz kontrolę wysyłek.
6. Dodaj politykę retencji, procedurę obsługi żądań RODO, kopie zapasowe i **test przywrócenia**.
7. Włącz MFA dla pracowników, monitorowanie błędów, CSP, rate limiting i zabezpieczenia formularzy.
8. Wprowadź testy E2E Playwright oraz testy autoryzacji dla wszystkich endpointów i operacji Storage.
9. Zaplanuj import 500+ rekordów (dry run, normalizacja, duplikaty, rollback).
10. Zrób przegląd bezpieczeństwa przed importem rzeczywistych danych osobowych.

## Uwaga o migracji
`service_tickets.customer_id` jest zdenormalizowany, ale trigger wymusza zgodność z instalacją. Zmiana właściciela lokalizacji po utworzeniu zgłoszeń wymaga osobnego kontrolowanego procesu migracji.

## Zakres
To jest **secure-by-default starter**, nie gotowy produkt. Monitoring MQTT/API producentów, płatności, załączniki i automatyzacje zostaną dodane w kolejnych iteracjach.

## Przeglądarka, telefon i program komputerowy

Docelowy kierunek oraz zakres wspólnego API: [Plan wersji na różne platformy](docs/MULTIPLATFORM.md). Obecnie działa wersja internetowa; instalatory Windows/macOS i aplikacje Android/iOS są kolejnymi etapami.

Instrukcja obsługi plików: [Dokumenty instalacji i załączniki](docs/DOCUMENTS.md).

Portal klienta: [Dodawanie zdjęć i załączników do zgłoszenia](docs/CLIENT_ATTACHMENTS.md).

Instrukcja harmonogramów: [Przeglądy i terminy](docs/MAINTENANCE.md).

Wykonane przeglądy: [Potwierdzanie protokołem i historia](docs/MAINTENANCE_COMPLETION.md).

Wygląd programu: [Jasny i ciemny motyw](docs/THEMES.md).

Wygląd list danych i zakres nowych pozycji menu: [docs/DATA_LISTS.md](docs/DATA_LISTS.md).

Katalog produktów i usług (PLN, ceny, VAT, marża, archiwum, API): [docs/CATALOG.md](docs/CATALOG.md).

Kreator i kalkulacja ofert: [docs/OFFERS.md](docs/OFFERS.md).

- [Oferty PDF: obsługa i weryfikacja](docs/OFFER_PDF.md)

- [Oferty w portalu i akceptacja wariantu](docs/OFFER_PORTAL.md)

- [Realizacje i planowanie ekip](docs/WORK_ORDERS.md)

- [Protokoły odbioru montażu, urządzenia i gwarancje](docs/HANDOVERS.md)

- [Uwagi po odbiorze, zadania poprawkowe i ponowny odbiór](docs/CORRECTIONS.md)
- [Kierunek UX/UI: Linear, Attio i Notion](docs/DESIGN_DIRECTION.md)

- [Karta klienta, osoby kontaktowe i historia współpracy](docs/CUSTOMER_WORKSPACE.md)
