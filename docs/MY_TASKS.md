# Moje zadania

Wdrożenie lokalne KRA-11 — 28.10.2026. Ekran `/dashboard/tasks` i pozycja **Moje zadania** pod przeglądem w panelu bocznym. Zwarte wiersze, szczegóły rozwijane na żądanie, oba motywy i telefon.

## Jak korzystać

Ekran zbiera własne zadania CRM z aktywnych klientów. Każda rola, również administrator i biuro, widzi tu wyłącznie zadania przypisane do siebie. Zarządzanie zadaniami całego klienta pozostaje w jego karcie.

- **Dzisiaj**: otwarte zadania z terminem dzisiejszym.
- **Po terminie**: otwarte zadania z terminem wcześniejszym od dzisiejszego.
- **Nadchodzące**: otwarte zadania z terminem po dzisiejszym dniu, bez ograniczenia do tygodnia.
- **Otwarte**: wszystkie do wykonania i w trakcie.
- **Zamknięte**: wykonane i anulowane, od ostatniego zamknięcia.

Trzy pierwsze zbiory są rozłączne i sumują się do otwartych. Daty i zaległości liczone są według **Europe/Warsaw**, niezależnie od strefy sesji bazy/przeglądarki. Wskazania odświeżają się przy nawigacji, wyszukiwaniu, przeładowaniu lub zapisie; nie dodano synchronizacji na żywo ani automatycznego odświeżania o północy.

Wyszukiwarka dopasowuje fragment tytułu zadania lub nazwy klienta bez rozróżnienia wielkości liter. Znaki `%` i `_` są zwykłymi znakami. Nie przeszukuje prywatnych notatek ani opisów. Liczniki wszystkich widoków uwzględniają to samo wyszukiwanie. Zmiana filtra lub zapytania wraca na pierwszą stronę; lista ma po 20 wierszy na stronie.

**Aktualizuj** otwiera status i wynik/postęp, bez przenoszenia do klienta. Wykonanie usuwa zadanie z otwartych widoków i aktualizuje liczniki oraz następny kontakt w karcie. Wykonane zadanie można wznowić; anulowane wznawia biuro w karcie klienta. Ten ekran nie służy do zmiany zakresu, daty lub wykonawcy ani anulowania zadania. Nowe zadania dodaje biuro przy konkretnym kliencie.

Kliknięcie klienta otwiera właściwą stronę jego zakładki zadań i wyróżnia wybrany rekord, także jeśli znajduje się poza pierwszą stroną. Numer strony obliczany jest z bieżącego zakresu odczytu użytkownika.

## Dostęp i zapis

Baza wymaga aktywnej roli admin/office/technician i aktywnego dostępu do klienta. Klient portalowy, konto bez roli, zablokowane i anonimowe nie odczytają listy. Nie ma parametru pozwalającego wybrać innego użytkownika. Odebranie przypisania klienta usuwa jego zadania i liczniki. Klient zarchiwizowany znika ze wszystkich filtrów agendy; historia pozostaje dostępna w karcie zgodnie z dotychczasowymi uprawnieniami.

Nie zmieniono kont ani zakresów dostępu. Widok nie ujawnia notatek biura ani zadań innych osób. Szybki zapis używa dotychczasowego RPC `crm_task_progress`: kontroli wersji, zakresu i bezpiecznych ponowień. Konflikt pokazuje możliwość odświeżenia listy; nie nadpisuje nowszego rekordu. Zmiany pozostają w istniejącym audycie i historii klienta.

## API i źródła

Migracja `202610280005_my_tasks.sql` dodaje indeks według wykonawcy/terminu i chroniony odczyt `my_crm_tasks`. Bez nowych tabel ani bezpośrednich uprawnień do `crm_tasks`.

GET `/api/v1/tasks?filter=today&search=&page=1`:

- filtry: `today | overdue | upcoming | open | closed`;
- wyszukiwanie do 160 znaków, strona 1–100000, pozostałe parametry odrzucane;
- odpowiedź: `viewerId`, dzisiejsza data `today`, liczba wyfiltrowanych rekordów `total`, `counts` i `items`;
- każdy wiersz zawiera bezpieczny kontrakt istniejącego zadania oraz `customerName` i `customerPage`;
- API dodatkowo sprawdza tożsamość odbiorcy oraz wykonawcę każdego zadania, również przy roli administratora.

Aktualizacja przez POST `/api/v1/customers/{customerId}/tasks/{id}/progress` odświeża kartę klienta i agendę. Wspólne schematy oraz `createHvacClient().myTasks()` znajdują się w `packages/api-client`; obejmują przyszłe kanały mobilne i komputerowe, nie oznaczają gotowych instalatorów.

## Sprawdzenie

420 testów aplikacji, 826 testów bazy (50 nowych asercji agendy), typy, lint i kompilacja produkcyjna. Testy obejmują rolę administratora/biura/technika, izolację własnych przypisań, odebrany dostęp i blokadę konta, klientów archiwalnych, filtry dat, wyszukiwanie literalne, liczniki, stronicowanie, poprawny numer strony klienta, zapis postępu i ponowienia oraz ścisłe projekcje API.

W przeglądarce: własne zadania dwóch tymczasowych klientów, zakończenie zadania i aktualizacja liczników, wyszukiwanie po kliencie i czyszczenie, druga strona listy i przejście do konkretnego rekordu na drugiej stronie karty klienta, motywy jasny/ciemny, ekran 1440×1000 i telefon 390×844, mobilny formularz. Szerokość strony 390 px bez poziomego przewijania. Dane demonstracyjne usuwa harness z automatycznym limitem 300 sekund; audyt pozostaje. Nie tworzono kont ani uprawnień.

Podglądy: `output/qa/my-tasks-light.png`, `my-tasks-dark.png`, `my-tasks-mobile.png`.

## Kolejny proponowany etap

Zadania połączono z przeglądem i dzwonkiem w KRA-12: [TASK_ALERTS.md](TASK_ALERTS.md). Kolejny proponowany etap: zbiorczy widok zadań zespołu dla biura.
