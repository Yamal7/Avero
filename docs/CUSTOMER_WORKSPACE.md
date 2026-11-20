# Karta klienta CRM — 28.10.2026

## Widok i obsługa

Karta `/dashboard/customers/{id}` obejmuje profil, osoby kontaktowe i powiązane moduły. Kierunek UX/UI: Attio dla relacji i profilu, Linear dla zwartych list, Notion dla hierarchii treści; własne logo, pomarańczowy #FD4B01, jasny i ciemny motyw są zachowane.

Na szerokim ekranie profil jest stałym panelem po lewej, a praca odbywa się w zakładkach po prawej. Na telefonie i w węższym oknie szczegóły profilu są rozwijane; e-mail i telefon są dostępne od razu. Zakładki mieszczą się w kolejnych wierszach, a listy ofert i realizacji zmieniają się w układ pionowy.

- **Historia**: zdarzenia z istniejących modułów, grupowanie według dnia w Europe/Warsaw, filtr kategorii i 20 zdarzeń na stronę. Wpis prowadzi do źródłowego rekordu, protokołu lub rundy poprawek.
- **Osoby**: dane kontaktowe osób powiązanych z tym klientem, ich rola/powiązanie, kontakt główny oraz osobne archiwum. Zapis kontaktu CRM nie tworzy konta i nie nadaje uprawnień.
- **Oferty**: wyłącznie oferty bieżącego klienta, status ostatniej publikacji, data aktualizacji i wartość brutto głównego wariantu. Kwoty nie są sumowane pomiędzy wersjami. Nowa oferta uruchamia kreator z właściwym klientem wybranym po UUID.
- **Realizacje**: wyłącznie powiązane z klientem zlecenia, status i miejsce. Wartości widoczne tylko dla biura.
- **Instalacje**: zachowane dotychczasowe drzewo lokalizacji, instalacji i urządzeń wraz z formularzami edycji, dokumentami i przeglądami.
- **Serwis**: powiązane zgłoszenia i przejście do szczegółów.

W profilu widać liczbę kontaktów, lokalizacji, instalacji, urządzeń i rund poprawek w toku. Liczniki realizacji i serwisu uwzględniają zakres uprawnień. Rundy w toku oznaczają zapisane szkice lub opublikowane rundy oczekujące na decyzję; nie oznaczają całego rejestru spraw gwarancyjnych.

## Osoby kontaktowe

Administrator i biuro dodają lub edytują osobę. Imię i nazwisko są wymagane; rola, e-mail i telefon są opcjonalne. Można wskazać jedną aktywną osobę jako główny kontakt. Zmiana wskazania atomowo usuwa poprzednie i aktualizuje jego wersję; nie usuwa kontaktu.

Archiwizacja jest odwracalna, zachowuje tożsamość osoby i jej historię oraz wyłącza wskazanie główne. Przywrócenie nie wybiera automatycznie kontaktu głównego. Archiwalny klient blokuje zapisy kontaktów.

Zmiany korzystają ze stabilnych UUID i kontroli wersji. Identyczne ponowienie ostatniego zapisu nie tworzy duplikatu. Stara wersja lub próba przeniesienia kontaktu do innego klienta jest odrzucana. Zmiany trafiają do istniejącego audytu i bezpiecznej osi historii.

## Źródła historii

Historia nie kopiuje pełnych danych operacyjnych. Pobiera wyłącznie bezpieczne metadane istniejących rekordów:

- utworzenie klienta oraz dodanie/zmiana/archiwizacja osoby kontaktowej;
- utworzenie oferty, publikacja i akceptacja przez klienta;
- utworzenie i zmiany statusu realizacji;
- publikacja pierwszego protokołu montażu i decyzja klienta;
- wykonanie/anulowanie zadania poprawkowego, publikacja kolejnego protokołu i nowa decyzja klienta;
- utworzenie i zmiany statusu serwisu, publikacja protokołu serwisowego;
- zapis potwierdzenia wykonania przeglądu.

Dla tworzenia i publikacji wykorzystujemy zapisane czasy tych zdarzeń, a dla zmian statusu — istniejący audyt. Brakującej historii nie odtwarzamy na podstawie obecnego statusu. Nie dodano synchronizacji e-maila/kalendarza, automatycznego rejestrowania rozmów; ręczne notatki i zadania opisuje [CRM_WORK.md](CRM_WORK.md). Historia nie jest pełnym ekranem audytowym; nie pokazuje surowych starych/nowych danych ani wszystkich edycji pól.

## Dostęp i API

Profil jest wewnętrznym CRM, nie portalem klienta. Administrator i biuro odczytują dostępne profile i zarządzają kontaktami. Technik wymaga aktywnego przypisania do klienta; oferty i ceny są wyłączone, realizacje ograniczone do jego ekipy, zgłoszenia do jego zakresu serwisowego. Dane lokalizacji i urządzeń zachowują dotychczasowy zakres CRM. Członkostwo klienta w portalu nie daje dostępu do wewnętrznych kontaktów i historii.

Migracja `202610280003_customer_workspace.sql` dodaje tabelę osób kontaktowych oraz odczyty profilu, historii i powiązań. Bez bezpośrednich uprawnień do tabeli kontaktów lub surowych pomocniczych odczytów. Warstwa API dodatkowo odrzuca niespójny profil technika, ceny i zdarzenia ofertowe.

- GET `/api/v1/customers/{id}` — profil, główny kontakt i liczniki.
- GET `/api/v1/customers/{id}/activity?kind=all&page=1` — historia.
- GET `/api/v1/customers/{id}/contacts?archived=false&page=1` — aktywne lub archiwalne osoby.
- PUT `/api/v1/customers/{id}/contacts` — wersjonowany zapis osoby kontaktowej.
- GET `/api/v1/customers/{id}/records?kind=offers|work|service&page=1` — powiązane rekordy.
- GET `/api/v1/offers/options?customer={id}` — precyzyjny wybór klienta w kreatorze oferty.

Wspólne schematy i metody HTTP są dostępne w `packages/api-client` dla web i przyszłych aplikacji mobilnych/komputerowych. Historia, kontakty i powiązane listy mają po 20 pozycji na stronę. Zakładka instalacji zachowuje wcześniejszy pełny widok drzewa; nie dodano w tym etapie jego paginacji.

## Weryfikacja

384 testy aplikacji i 717 testów bazy, kontrola typów, lint oraz kompilacja produkcyjna. Nowy zestaw SQL zawiera 50 asercji: izolacja klientów i różnych ekip, zakres serwisu, brak ofert/cen technika, bezpieczne metadane historii, wersje i ponowienia kontaktów, unikalny główny kontakt, archiwizacja/przywracanie, brak zapisu przy archiwalnym kliencie, paginacja i odebranie dostępu.

Przeglądarka: fikcyjna firma, dodanie głównej osoby, archiwizacja i przywracanie, aktualizacja liczników, wybór klienta w kreatorze bez tworzenia oferty, powiązane zakładki, historia, oba motywy i ekran telefonu. Dane kontroli są tymczasowe i usuwane, bez tworzenia kont lub nadawania uprawnień; audyt pozostaje.

## Proponowany następny krok

Notatki i zadania CRM wdrożono w KRA-10: [CRM_WORK.md](CRM_WORK.md). Kolejny proponowany etap to zbiorczy widok „Moje zadania” ze wszystkich klientów.
