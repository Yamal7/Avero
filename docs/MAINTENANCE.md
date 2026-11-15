# Przeglądy i terminy

Wersja lokalna, 25.10.2026.

## Obsługa firmy

Zakładka **Przeglądy** prowadzi do `/dashboard/maintenance`. Można też otworzyć „Plany przeglądów” z karty klienta przy konkretnej instalacji lub z rejestru instalacji.

Administrator i biuro tworzą plan, wybierając instalację, nazwę, cykl od 1 do 120 miesięcy i następny termin. Dla instalacji może istnieć kilka planów, np. kontrola filtrów i coroczny przegląd urządzenia. Nowego planu nie można przypisać do archiwalnej instalacji lub klienta. Wyszukiwarka instalacji pokazuje do 50 dopasowań.

„Pomoc w wyliczeniu następnego terminu” dodaje cykl do wybranej daty bazowej, np. ostatniego przeglądu. Gdy docelowy miesiąc nie ma danego dnia, wybiera jego ostatni dzień: 31 stycznia + miesiąc = 28 lub 29 lutego. Wynik można sprawdzić i zmienić przed zapisem. Kalkulator wyznacza pojedynczą datę; nie zapisuje wykonania przeglądu.

Firma edytuje nazwę, cykl, datę i status. „Wstrzymaj plan” zachowuje historię danych i termin, ale usuwa go z listy wymagającej uwagi i aktywnych terminów portalu. „Wznów plan” zachowuje datę — w razie zaległości plan znów trafi do zaległych. Archiwalne instalacje i klienci mają widok historii; ich planów nie można edytować.

Zmiana planu nie przenosi go między instalacjami. Nie dodano kasowania planów. Edycje i wstrzymania są audytowane, a numer wersji chroni przed nadpisaniem zmian innej osoby. Ponowienie tego samego tworzenia z tym samym identyfikatorem nie dodaje duplikatu.

## Lista i podsumowanie

- **Wymagające uwagi:** aktywne zaległe plany oraz terminy od dziś do dziś + 30 dni włącznie.
- **Po terminie:** data wcześniejsza niż dzisiaj.
- **W ciągu 30 dni:** od dzisiaj do dzisiaj + 30 dni włącznie. Dzisiejszy termin nie jest zaległy.
- **Wszystkie plany:** również dalsze terminy, plany wstrzymane oraz historia archiwalnych obiektów.
- **Wstrzymane:** plany nieaktywne niearchiwalnych obiektów.

Dniem odniesienia jest data w `Europe/Warsaw`, niezależnie od strefy serwera i urządzenia. Lista ma po 20 rekordów, ze stabilnym sortowaniem po stanie, dacie i identyfikatorze. Wyszukiwanie obejmuje nazwę planu, klienta, instalację, adres i miasto. Liczniki uwzględniają wyszukiwanie i wybraną instalację, ale nie filtr widoku.

Plany wstrzymane i archiwalnych obiektów nie generują liczników aktywnych terminów. Pulpit pokazuje liczbę zaległych i nadchodzących przeglądów oraz odsyła do harmonogramu. Technik widzi plany klientów przypisanych mu w panelu dostępu, wyłącznie do odczytu.

## Portal klienta i serwis

Karta instalacji w portalu pokazuje aktywne nazwy, cykle i terminy. Strona główna portalu pobiera najbliższy termin z aktywnych planów. Klient nie zmienia harmonogramu ani nie ma dostępu do harmonogramu całej firmy.

**Termin w planie wymaga uzgodnienia wizyty z firmą.** Nie jest automatyczną rezerwacją i nie zastępuje kalendarza wizyt. Z listy można przejść do utworzenia zwykłego zgłoszenia serwisowego z wybraną instalacją. Samo kliknięcie nie tworzy zgłoszenia ani automatycznego powiązania z planem.

Po wykonaniu przeglądu firma otwiera „Wykonanie i historia”, wybiera zatwierdzony protokół zakończonej wizyty i zatwierdza podgląd następnego terminu. Zapis dodaje historię i aktualizuje datę w jednej transakcji. Instrukcja: [MAINTENANCE_COMPLETION.md](MAINTENANCE_COMPLETION.md). Nadal można ręcznie edytować plan; taka edycja nie potwierdza wykonania i nie zmienia historycznych wpisów. Nie są jeszcze wysyłane e-maile, SMS ani push.

## API i wspólna logika

`GET /api/v1/maintenance-plans` przyjmuje opcjonalne `installation`, `search`, `view` i `page`. Odpowiedź zawiera `today`, `summary`, `total`, `plans`, `page`, `pageSize` oraz wersję API. Dostęp mają administrator, biuro i technik zgodnie z aktualnymi przypisaniami; klient używa istniejących endpointów portalu.

`POST /api/v1/maintenance-plans` zapisuje `{id, installationId, title, intervalMonths, nextDueOn, active, version}`. `version: null` oznacza nowy plan z identyfikatorem operacji, a numer oznacza edycję istniejącego planu. Tworzenie zwraca 201, edycja 200, konflikt wersji 409. Wyłącznie administrator/biuro mogą pisać. Bezpośrednie zapisy tabeli przez sesję aplikacji są zablokowane; baza sprawdza rolę, blokadę, stan rodzica, niezmienność instalacji i wersję. Zachowano RLS dla odczytu danych klienta.

Kontrakty i `nextMaintenanceDate` znajdują się w `packages/api-client`; SDK udostępnia `maintenancePlans` i `saveMaintenancePlan`. Wykorzystują istniejące Bearer/cookie, kontrolę Origin i brak buforowania danych prywatnych. Nie dodano nowych aplikacji natywnych ani migracji wymagającej resetu bazy.

## Weryfikacja 25.10.2026

- 162 testy Vitest i 285 asercji SQL, w tym dotychczasowe moduły.
- ESLint, TypeScript i kompilacja produkcyjna Next.js.
- Rzeczywisty test HTTP Bearer: tworzenie i ponowienie bez duplikatu, liczniki i filtry, edycja, konflikt wersji, wstrzymanie/wznowienie oraz dane aktywnych planów w portalu.
- Weryfikacja formularza, liczników i kart terminów w przeglądarce na tymczasowym kliencie testowym bez przypisanych kont. Plany i tymczasowe rekordy zostały usunięte po próbie; dane istniejących klientów nie były zmieniane.
- Zrzut `maintenance-ready-2026-10-25.png` przedstawia wyłącznie dane testowe. Nie wykonano testu na fizycznym telefonie ani wysyłki powiadomień.
