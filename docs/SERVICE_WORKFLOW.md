# Zgłoszenia, wizyty i protokoły serwisowe

Stan: 25.10.2026. Moduły: `/dashboard/service` oraz `/dashboard/calendar`.

## Co obejmuje etap

- Zgłoszenia powiązane z instalacją i jej klientem, z numerem, tematem, opisem, statusem i priorytetem.
- Wyszukiwanie po numerze, temacie lub kliencie; filtry statusu i paginacja po 25 rekordów.
- Przydział prowadzącego technika przez administratora lub biuro.
- Planowanie, przeplanowanie i odwoływanie wizyt oraz kontrola konfliktów terminów.
- Tygodniowy kalendarz, także dla wizyt przechodzących przez północ, z filtrem technika dla biura.
- Statusy wizyt: zaplanowana, w drodze, w trakcie, zakończona, odwołana.
- Roboczy i zatwierdzony protokół: diagnoza, wykonane prace, części, pomiary i zalecenia.
- Widok zatwierdzonego protokołu do wydruku lub zapisu PDF przez okno drukowania przeglądarki.
- Liczba otwartych zgłoszeń i najbliższe wizyty na pulpicie; przejście do zgłoszenia z karty instalacji.

## Przygotowanie

1. Dodaj klienta, lokalizację i instalację (oraz urządzenia).
2. Zaproś lub skonfiguruj konto z rolą `technician`.
3. W panelu Użytkownicy przypisz technikowi klienta, którego ma obsługiwać.

Przydział konkretnego zlecenia nie nadaje automatycznie dostępu do całej bazy ani nowego klienta. Biuro może wybrać tylko aktywnego technika z istniejącym przypisaniem do danego klienta. Zmiana zakresu klientów pozostaje operacją administratora.

## Przebieg obsługi

1. Klient, biuro lub technik dodaje zgłoszenie dotyczące dostępnej, niearchiwalnej instalacji. Klient i technik nadają wyłącznie priorytet normalny; biuro ustala priorytety. Formularz ma identyfikator żądania zabezpieczający przed powtórnym dodaniem po ponowieniu tego samego wysłania.
2. Biuro przydziela prowadzącego technika i planuje wizytę, określając czas trwania od 15 do 480 minut.
3. Informacja wpisana w polu wizyty „Informacja dla klienta” jest widoczna dla klienta. Nie należy tam wpisywać notatek wewnętrznych.
4. Technik zaznacza „W drodze” lub „Rozpocznij wizytę”. Rozpoczęta wizyta automatycznie zmienia zgłoszenie na „W obsłudze”.
5. Technik albo biuro uzupełnia protokół. Roboczo można zapisać niekompletne dane. Klient nie może odczytać wersji roboczej nawet przez bezpośrednie API.
6. Po wpisaniu diagnozy i wykonanych prac operator potwierdza zatwierdzenie i udostępnienie klientowi. Zapis protokołu i zakończenie wizyty następują w jednej transakcji.
7. Klient może otworzyć zatwierdzony dokument. Przycisk „Drukuj / zapisz jako PDF” otwiera standardowe okno drukowania; do zapisu należy wybrać drukarkę PDF przeglądarki/systemu.
8. Zgłoszenie zamyka się osobno, po zakończeniu lub odwołaniu wszystkich aktywnych wizyt. Technik potrzebuje zatwierdzonego protokołu, biuro może również zamknąć sprawę niewymagającą wizyty.

Zamknięte zgłoszenie można ponownie otworzyć. Nie zmienia to zakończonych wizyt ani zatwierdzonych protokołów; kolejne prace wymagają nowej wizyty.

## Dostęp

- Administrator i biuro: wszystkie zgłoszenia, przydziały, planowanie i obsługa wizyt.
- Technik: zgłoszenia prowadzone przez niego, pod warunkiem aktywnego przypisania do ich klienta. Samo przypisanie do klienta nie daje wglądu we wszystkie zgłoszenia pozostałych techników.
- Technik może aktualizować status, rozpocząć swoją wizytę i opracować protokół. Nie przydziela innych techników, nie planuje terminów ani nie zmienia priorytetu.
- Klient: zgłoszenia i wizyty własnych klientów/obiektów oraz opublikowane protokoły. Bez możliwości zmiany organizacji pracy i protokołów.
- Blokada konta lub cofnięcie przypisania odbiera dostęp również istniejącej sesji.

Nowe zgłoszenie technika do przypisanej instalacji jest automatycznie przydzielane jemu. Konto klienta lub technika ma limit 20 nowych zgłoszeń na godzinę. Biuro nie podlega temu limitowi.

## Terminy i konflikty

Wszystkie terminy wprowadza się w czasie `Europe/Warsaw`. Baza zamienia je na znaczniki czasu UTC i odrzuca nieistniejące godziny podczas wiosennej zmiany czasu. Kalendarz tworzy tygodnie według dat warszawskich, a nie stałych odcinków 168 godzin.

Konflikty dotyczą aktywnych wizyt tego samego technika. Wizyta kończąca się o 10:00 nie blokuje rozpoczęcia kolejnej o 10:00. Kontrola działa także przy zmianie technika dla już zaplanowanych wizyt. Odwołane i zakończone wizyty nie rezerwują nowych terminów.

Operacje są serializowane transakcyjnie; sprawdzenie terminu i zapis nie mogą się rozminąć przy równoczesnych żądaniach. Usunięcie przydziału zgłoszenia z planowanymi wizytami wymaga uprzedniego odwołania tych wizyt. Wizyty rozpoczętej nie można przeplanować.

## Protokoły i historia

Każdy zapis roboczy zwiększa wersję. Zapis ze starej wersji jest odrzucany, aby inna sesja nie nadpisała zmian. Po zatwierdzeniu protokół jest nieedytowalny także przez zwykły uprzywilejowany UPDATE/DELETE w bazie.

Przy zatwierdzaniu utrwalane są nazwa klienta, adres, instalacja, urządzenia, numer zgłoszenia, termin, wykonawca i zakończenie wizyty. Późniejsza zmiana karty klienta nie zmienia treści historycznego dokumentu. Operacje na zgłoszeniach, wizytach i protokołach trafiają do istniejącego dziennika audytowego.

Protokół jest potwierdzeniem prac przez firmę. Nie zawiera elektronicznego podpisu klienta ani odrębnego potwierdzenia odbioru. Nie wdrożono korekt opublikowanych protokołów; dalsze prace można udokumentować kolejną wizytą. Numery dokumentów są technicznymi numerami porządkowymi, nie numeracją księgową.

## Weryfikacja

- 56 testów aplikacji: dotychczasowy zestaw oraz formularze serwisowe, wersjonowanie, błędy terminów i przeliczanie czasu warszawskiego, w tym DST oraz wizyty nocne.
- 117 asercji SQL: dotychczasowe 71 oraz 46 nowych. Obejmują pełny przebieg zgłoszenia i wizyty, prywatność szkiców, publikację, niezmienność, historyczny snapshot, konflikty, zmianę technika, ponowienie żądania oraz blokadę konta.
- Wszystkie dane scenariuszy SQL wycofano. Nie dodawano klientów, techników ani przykładowych wizyt do rzeczywistej bazy aplikacji.
- Kompilacja produkcyjna, kontrola typów i lint przeszły.
- W przeglądarce sprawdzono listę, formularz nowego zgłoszenia, tygodniowy kalendarz i przełączanie tygodni na istniejącym koncie administratora. Pełny interaktywny pilotaż z rzeczywistym klientem i technikiem pozostaje do wykonania.

## Kolejne rozszerzenia

Załączniki i zdjęcia, odrębna korespondencja przy zgłoszeniu, automatyczne powiadomienia/przypomnienia, podpis/odbiór protokołu przez klienta, korekty dokumentów, praca offline. Portal klienta jest już wdrożony — opis w CUSTOMER_PORTAL.md. Nie uruchomiono automatycznych wysyłek e-mail ani push przy zmianach wizyt.
