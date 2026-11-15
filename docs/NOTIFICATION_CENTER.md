# Centrum powiadomień — 3.11.2026

KRA-22. Centrum `/dashboard/notifications` jest dostępne dla administratora, biura i technika przez dzwonek → **Otwórz historię i preferencje**. To wewnętrzna historia przypomnień, oddzielna od listy bieżących działań i dziennika audytu.

## Zakres i obsługa

- **Moje zadania**: wyłącznie własne otwarte zadania na dzisiaj i po terminie. Przypomnienie jest rozpoznawane według zadania, daty i etapu „dzisiaj”/„po terminie”. Zmiana daty może utworzyć nowy wpis. Nie przypominamy codziennie tego samego zaległego zadania.
- **Pilny serwis**: otwarte zgłoszenia z wysokim priorytetem w aktualnym zakresie użytkownika. Jedno przypomnienie na zgłoszenie; ponowne otwarcie nie tworzy kolejnego wpisu o tym samym identyfikatorze.
- **Przeglądy**: aktywne plany do 30 dni i zaległe, z dostępnych instalacji. Rozróżniamy termin i etap „zbliżający się”/„po terminie”.

Nowe wpisy zbieramy przy otwarciu centrum, zmianie jego filtra, odświeżeniu lub otwarciu dzwonka. Jedna partia zawiera do 200 nowych wpisów; jeśli pozostały następne, przycisk centrum pozwala wczytać kolejne. Nie działa jeszcze harmonogram w tle, e-mail, SMS ani push. Nie rekonstruujemy zdarzeń, które rozpoczęły się i zakończyły między odświeżeniami. Data „Zarejestrowano” oznacza czas dodania przypomnienia do historii, nie czas pierwotnego zdarzenia biznesowego.

Widoki **Wszystkie / Nieprzeczytane / Przeczytane**, filtr kategorii, strony po 25 wpisów. Przeczytanie i przywrócenie nieprzeczytania są odwracalne i nie zmieniają zadania, zgłoszenia ani planu. Zakończone, przesunięte lub wstrzymane sprawy zachowują przypomnienie z oznaczeniem **Historyczne przypomnienie**, o ile użytkownik nadal ma dostęp do źródła. Tytuł i nazwa klienta są odczytywane z bieżącego rekordu; historia nie jest niezmiennym zrzutem wszystkich wcześniejszych nazw.

Dzwonek pokazuje licznik nieprzeczytanych oraz link do centrum. Dotychczasowe alerty zadań/serwisu/przeglądów pozostają dostępne; nie sumujemy ich z historią jako jednej liczby. Otwarcie dzwonka odświeża także dane istniejącego podsumowania. Licznik historii odświeża się po zmianie stanu przeczytania. Nieprzeczytane przypomnienie może dotyczyć już zakończonej sprawy — przeczytanie jest osobnym stanem.

## Preferencje i dostęp

Każdy pracownik zapisuje własne włączone kategorie. Domyślnie wszystkie są włączone, bez automatycznego zapisu rekordu preferencji przy samym odczycie. Wyłączenie kategorii zatrzymuje zbieranie kolejnych wpisów; nie usuwa historii, nie zmienia liczby otwartych zadań i nie wyłącza dotychczasowych bieżących alertów. Ponowne włączenie pozwala zebrać także nadal aktualne, dotąd niezarejestrowane przypomnienia. Ustawienia nie dotyczą przyszłych kanałów poczty/push.

Uprawnienia są sprawdzane ponownie przy każdym odczycie i zmianie przeczytania. Odebranie przypisania do klienta/zadania, archiwizacja klienta, usunięcie źródła lub blokada konta nie ujawniają historycznych tytułów ani liczników. Zadania innych wykonawców pozostają niedostępne w tym centrum także administratorowi. Serwis i przeglądy stosują dotychczasowy zakres roli. Klient/portal nie korzystają z wewnętrznej historii ani preferencji; ich komunikacja jest kolejnym zakresem.

## Dane i API

Migracja `202611030003_notification_center.sql` dodaje prywatne `app_notifications` i `notification_preferences`, bez bezpośrednich grantów dla użytkowników. Rejestr przechowuje właściciela, kategorię/źródło, klucz deduplikacji, etap, datę terminu, czas rejestracji i stan przeczytania z wersją; nie utrwala opisów, notatek, wyników, kosztów ani nazwy klienta. Źródłowa projekcja jest prywatna. Operacje zapisujące serializuje blokada konkretnego użytkownika, a unikalność chroni przed duplikatami.

- GET `/api/v1/notifications?state=all&category=all&page=1`: tylko własne, aktualnie dostępne wpisy, globalny licznik nieprzeczytanych i liczba w filtrze.
- POST `/api/v1/notifications/sync` z `{}`: zbiera przypomnienia wyłącznie aktualnej osoby, zwraca `added` i `more`. GET nie tworzy historii.
- PATCH `/api/v1/notifications/{id}` z `{version,read}`: zmienia własny dostępny wpis. Identyczne ponowienie ostatniej zmiany nie dodaje wersji i nie zmienia czasu przeczytania. Konflikt innej treści wymaga odświeżenia.
- GET `/api/v1/notifications/preferences`: własne kategorie i wersja/null.
- PUT tej ścieżki z `{version,tasks,service,maintenance}`: wersjonowane preferencje, bez identyfikatora użytkownika w wejściu.

Wspólne kontrakty i metody HTTP znajdują się w `packages/api-client/src/notifications.ts` / `client.ts`. API sprawdza tożsamość odbiorcy w odpowiedzi i przyjmuje wyłącznie jawne filtry/pola. Linki prowadzą do stałych wewnętrznych ścieżek, a zadanie otwiera właściwą stronę karty klienta i jego wiersz. Retencja/porządkowanie nieaktualnych wpisów oraz dodatkowe rodzaje zdarzeń pozostają do osobnego wdrożenia.

## Weryfikacja

641 testów aplikacji (60 plików), 1178 asercji SQL (30 plików), lint i build z kontrolą typów przeszły. Nowe zestawy: 24 testy kontraktów/API/klienta oraz 45 asercji bazy. Obejmują role, prywatne źródła i tabele, izolację użytkowników/preferencji, deduplikację, wyłączenie kategorii, odczyt po zamknięciu, cofnięcie dostępu i archiwizację klienta, wersje/przeczytanie, batch 200+2 oraz strony po 25 wpisów.

W przeglądarce: 3 własne przypomnienia demonstracyjne, zmiana nieprzeczytane 3→2 i powrót do 3, filtry stanu/kategorii, pusty widok po odwróceniu przeczytania, zapis preferencji, zachowanie wpisu po zamknięciu demonstracyjnego zgłoszenia. Dzwonek pokazuje historię oraz dotychczasowe działania. Oba motywy i układ 390×844 bez przewijania poziomego (390/390 px). Informację o sposobie zbierania historii przeniesiono pod rozwijany opis. Podglądy w `output/qa/notifications-dark.png`, `notifications-light.png`, `notifications-mobile.png`.

Próby używały osobnej karty, własnego klienta, instalacji, zadania, zgłoszenia, planu i powiadomień. Na czas testu zbieranie było wyłączone, aby nie rejestrować rzeczywistych spraw użytkownika; preferencje po kontroli przywrócono dokładnie do wcześniejszego stanu. Dane demonstracyjne usunięto, audyt źródeł zachowano, bez nowych kont/uprawnień i zmian rzeczywistych zadań. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki. Migracja zastosowana i zarejestrowana lokalnie. Próby na fizycznym telefonie pozostają częścią pilotażu.

Następny krok planu: automatyczne powiadomienia e-mail — kolejka, deduplikacja, ponowienia i kontrola dostarczenia, najpierw na wskazanych odbiorcach testowych.
