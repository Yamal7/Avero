# Plan dalszego rozwoju HVAC CRM / ERP

Aktualizacja: 3.11.2026. Podstawa: bieżące dokumenty modułów, kod projektu, historia wdrożeń i zadania projektu Program CRM w Linear. To plan priorytetów, nie deklaracja terminów ani gotowości produkcyjnej.

## Cel produktu

Jeden system dla biura, handlowca, technika i klienta. Wspólne konto oraz centralna baza danych; zakres widoczności zależy od roli i przypisań. Trzy formy korzystania: przeglądarka, program Windows/macOS oraz aplikacje iOS/Android. Klient może mieć wiele lokalizacji, instalacji i urządzeń. Każda nowa funkcja powinna uwzględniać wspólne API, jasny/ciemny motyw i telefon.

## Stan obecny

Poniższe funkcje są wdrożone lokalnie. Nie oznacza to uruchomienia produkcyjnego ani formalnego odbioru przez użytkownika. Implementacje są przekazywane w Linear do In Review; odbiór użytkownika pozostaje osobnym krokiem. Ostatnia weryfikacja z 3.11: 666 testów aplikacji i 1218 asercji bazy oraz poprawne typy, lint i build.

| Obszar | Dostępny zakres |
| --- | --- |
| CRM | Klienci, kontakty, lokalizacje, instalacje, urządzenia, import klientów CSV, profil i historia współpracy, notatki, opiekun oraz kolejny kontakt |
| Praca zespołu | Własna agenda i zadania zespołu, filtry, zmiana terminu/wykonawcy, postęp i historia planowania; alerty w pulpicie i dzwonku |
| Powiadomienia | Własna historia, przeczytane/nieprzeczytane, preferencje; kolejka e-mailowych przypomnień pracowników z opt-in, deduplikacją, ponowieniami i historią. Lokalny Mailpit sprawdzony; Resend wymaga konfiguracji |
| Katalog i wycena | Urządzenia, materiały, usługi, dojazd; koszty/ceny/VAT/marża w PLN; archiwum |
| Oferty | Kreator, własne pozycje/katalog, do 5 wariantów, rabaty, korekta ceny, porównanie rentowności, profesjonalny PDF, publikowane wersje i akceptacja wariantu przez klienta |
| Szablony | Biblioteka zestawów, reguły ilości od długości/powierzchni/godzin/km, kilka szablonów w ofercie, zapis wariantu jako nowego szablonu |
| Realizacje | Zlecenie z zaakceptowanej oferty, planowanie ekip, kalendarz, protokół montażu, urządzenia/gwarancje, osobny odbiór klienta oraz rundy poprawek |
| Serwis | Zgłoszenia, technicy, wizyty, protokoły, harmonogramy przeglądów i potwierdzanie wykonania z historią |
| Klient | Mobilny portal internetowy: własne dane, instalacje, oferty/PDF/akceptacje, realizacje/odbiory, zgłoszenia, zdjęcia/załączniki i udostępnione dokumenty |
| Fundament | Role i zaproszenia, blokady dostępu, audyt, prywatne pliki, wspólne kontrakty/API dla wielu modułów, oba motywy |

Nie dostarczono instalatorów Windows/macOS, aplikacji sklepowych iOS/Android, SMS, powiadomień push ani synchronizacji offline. Produkcyjne e-maile są wyłączone do konfiguracji dostawcy, nadawcy i harmonogramu; zdarzenia ofert/wizyt/odbiorów do klientów pozostają do wdrożenia. Część starszych modułów nadal wymaga uzupełnienia API przed przygotowaniem klientów instalowanych.

## Kolejność rozwoju

### Etap 1. Domknięcie codziennego ofertowania

1. Powielanie szablonów instalacji: nazwa nowego zestawu, niezależna kopia pozycji i reguł, kontrola wycofanych produktów, zachowanie oryginału.
2. Globalny profil firmy i ustawienia dokumentów: dane wykonawcy, własne logo, domyślne warunki, termin ważności i treści ofert. Wdrożone lokalnie 3.11.2026: dane profilu są podpowiadane przed pierwszym zapisem dokumentu.
3. Domyślne ustawienia kopiowane do nowej oferty; późniejsza edycja profilu nie zmienia historycznych dokumentów i opublikowanych PDF.
4. Uporządkowanie list i szybkich działań: zapamiętane filtry, sortowanie, przejścia między powiązanymi rekordami; rozbudowa globalnej wyszukiwarki o oferty, realizacje i urządzenia.

Efekt odbioru: utworzenie kolejnej oferty nie wymaga ponownego wpisywania danych firmy ani ręcznego odtwarzania podobnego zestawu.

### Etap 2. Powiadomienia i współpraca z klientem

1. Centrum powiadomień: przeczytane/nieprzeczytane, historia, typy zdarzeń i preferencje odbiorcy.
2. Automatyczne e-maile: nowa oferta, decyzja klienta, planowana lub zmieniona wizyta, przegląd, oczekujący odbiór. Dla biura także nieobsłużone działania.
3. Kolejka wysyłek z deduplikacją, ponowieniami i stanem dostarczenia; przypomnienie wysyłane tylko aktualnie uprawnionemu odbiorcy.
4. Uporządkowana korespondencja przy zgłoszeniu lub realizacji: wiadomości widoczne klientowi, osobno notatki wewnętrzne, zdjęcia i załączniki. Docelowo skrzynka zbiorcza.
5. Prośba klienta o zmianę terminu i potwierdzenie wizyty, z zatwierdzeniem przez biuro i kontrolą dostępności ekipy.

Najpierw jeden kanał e-mail; SMS po określeniu kosztów i konfiguracji, push razem z aplikacjami mobilnymi. Testy wysyłki najpierw na wskazanych kontach demonstracyjnych, bez automatycznego kontaktowania rzeczywistych klientów podczas wdrożenia.

Efekt odbioru: użytkownik dostaje jedno właściwe powiadomienie o zdarzeniu, przechodzi do jego aktualnego szczegółu, a biuro widzi błędy dostarczenia.

### Etap 3. Przygotowanie pierwszego pilotażu

6.11.2026: przygotowany [pakiet konfiguracji i instrukcja wdrożenia](../deploy/README.md) oraz walidator `pilot:check`. Hosting, domena i nadawca nie są jeszcze wybrane zgodnie z odpowiedzią użytkownika. Kopie i odtworzenie opisane jako procedura do wykonania; nie deklarujemy ich uruchomienia.

Ten etap jest warunkiem korzystania produkcyjnego i może być realizowany równolegle z etapami 1–2. Nie należy odkładać go do ukończenia wszystkich przyszłych modułów.

- Przegląd oraz odbiór już wdrożonych funkcji; naprawy wynikające z rzeczywistego użycia i aktualizacja statusów Linear po akceptacji.
- Docelowe środowisko testowe i produkcyjne, HTTPS, konfiguracja poczty/zaproszeń i monitorowanie działania.
- Kopie bazy oraz plików i sprawdzona procedura odtworzenia, bez resetowania danych użytkownika.
- Przegląd bezpieczeństwa, ról i izolacji klientów, logowania/MFA administratorów, limitów i plików.
- Retencja danych i audytu, kontrolowane korekty błędnego potwierdzenia przeglądu, sprzątanie nieukończonych przesłań plików.
- Testy całych scenariuszy dla biura, technika i klienta oraz próby na rzeczywistym telefonie.
- Import próbny, instrukcje i pilotaż na ograniczonej grupie, pierwotnie zakładane 10–20 klientów.

Efekt odbioru: pełny scenariusz klient → oferta → akceptacja → montaż → odbiór → serwis przechodzi w docelowym środowisku; istnieje sprawdzony sposób odzyskania danych i obsługi błędów. Liczba testów lokalnych sama w sobie nie oznacza spełnienia tego warunku.

### Etap 4. Sprzedaż i rozwój CRM

- Oddzielne szanse sprzedaży: nowe zapytanie, kwalifikacja/oględziny, wycena, oferta, negocjacje, wygrana/przegrana.
- Widok tabeli i tablicy etapów, wartość szansy, opiekun, planowany termin decyzji i następne działanie.
- Powiązanie szansy z klientem, kontaktami, ofertami i realizacją; nie utożsamiać statusu oferty z etapem całej relacji handlowej.
- Źródło kontaktu, powód przegranej, przypomnienie o ponownym kontakcie.
- Własne widoki/filtry CRM inspirowane Attio; pola dodatkowe dopiero po sprawdzeniu potrzeb.
- Raport konwersji i prognoza sprzedaży oparta na faktycznych danych.

Efekt odbioru: firma widzi, ile zapytań czeka na ruch i gdzie traci sprzedaż. Pulpit odróżnia wartość otwartych ofert, wygranych zleceń i opłaconych należności.

### Etap 5. Realizacje, zaopatrzenie i rentowność

- Listy czynności i materiałów dla montażu, zdjęcia przed/po, ewidencja czasu pracy i faktycznego zużycia.
- Planowane versus rzeczywiste koszty materiałów, robocizny, dojazdu i poprawek; wynik finansowy zlecenia.
- Rozszerzenie planowania ekip o dostępność, nieobecności i rezerwacje prac poprawkowych. Dzisiejsze daty zadań CRM/poprawek nie rezerwują kalendarza.
- Rejestr dostawców, import i aktualizacja cenników z podglądem zmian; historia cen i kilka cen zakupu produktu.
- Magazyn w osobnym kroku: stany, przyjęcia/wydania/zwroty, rezerwacje do zleceń, minima i inwentaryzacja; później lokalizacje/składy aut i skanowanie.
- Zapotrzebowanie i zamówienia zakupowe wynikające z materiałów zlecenia, bez podwójnego rezerwowania stanu.

Efekt odbioru: firma zna faktyczny wynik zlecenia i brakujące materiały; oferta oraz magazyn pozostają różnymi źródłami informacji o planie i wykonaniu.

### Etap 6. Opieka posprzedażowa i rozliczenia

- Pakiety/umowy serwisowe, zakres świadczeń, okres obowiązywania i cykle przeglądów.
- Reklamacje i naprawy gwarancyjne powiązane z urządzeniem oraz historią serwisową; przypomnienia o końcu gwarancji.
- Zależnie od potrzeb pilotażu: cele czasu reakcji i eskalacja pilnych zgłoszeń.
- Terminy płatności, zaliczki, należności i statusy rozliczenia zlecenia.
- Eksport lub integracja z wybranym programem księgowym/fakturującym; następnie płatności online, jeśli potrzebne.
- Portal klienta: pakiety, rozliczenia i faktury udostępnione przez firmę, wygodne ponowne zamówienie usługi.

Efekt odbioru: wiadomo, co firma ma wykonać w ramach umowy, kiedy i czy zlecenie zostało rozliczone. Docelowy zakres fakturowania ustalić przed budowaniem własnego modułu księgowego.

### Etap 7. Programy komputerowe i aplikacje telefoniczne

1. Po ustabilizowaniu przepływu pilotażowego: ograniczony prototyp Windows/macOS — logowanie, bezpieczna sesja, odczyt, jeden zapis i plik/PDF. Taki test można wykonać wcześniej, żeby sprawdzić ryzyka techniczne; nie wymaga ukończenia magazynu czy rozliczeń.
2. Uzupełnienie brakujących operacji wspólnego API, odświeżania sesji i obsługi błędów wersji.
3. Program Windows/macOS: codzienna praca biura, pliki/drukowanie, podpisane instalatory oraz aktualizacje; próby na obu systemach.
4. Aplikacje iOS/Android: klient — oferty, wizyty, dokumenty, zgłoszenia i odbiory; technik — plan dnia, urządzenia, zdjęcia, protokoły i zadania. Aparat, skanowanie QR, systemowe udostępnianie i push.
5. Kontrolowany pilotaż na rzeczywistych urządzeniach przed publikacją w sklepach.
6. Offline jako osobny zakres: najpierw robocze protokoły, zdjęcia i notatki technika, kolejka synchronizacji, konflikty oraz bezpieczne usuwanie danych lokalnych. Akceptacje klienta i operacje wymagające świeżej dostępności pozostają online do osobnego zaprojektowania.

Wspólne konto/dane nie oznaczają identycznych ekranów na każdym urządzeniu. Nie utrzymujemy pięciu niezależnych wersji logiki biznesowej. Instalacja programu sama w sobie nie zapewnia działania bez internetu. Szczegóły architektury i historyczny zakres: [MULTIPLATFORM.md](MULTIPLATFORM.md).

## Dodatkowe pomysły — do potwierdzenia po pilotażu

| Pomysł | Wartość i moment decyzji |
| --- | --- |
| QR na urządzeniu | Szybkie otwarcie historii/zgłoszenia; dostęp nadal po zalogowaniu i sprawdzeniu uprawnień |
| Baza wiedzy i instrukcje | Zatwierdzone materiały dla techników oraz wybrane poradniki klienta, kierunek Notion |
| Ankieta po realizacji | Opinie i wykrywanie problemów po odbiorze; dopiero po wdrożeniu komunikacji |
| Portal większego klienta | Wiele obiektów, osoby odpowiedzialne za lokalizacje i raport zbiorczy; obecne przypisania są zasadniczo na poziomie klienta |
| Integracja kalendarza i poczty | Mniej przepisywania, ale wymaga określenia właściciela danych, uprawnień i reguł synchronizacji |
| Monitoring urządzeń | Odczyty/alerty z wybranych producentów po potwierdzeniu dostępnego interfejsu i warunków dostępu |
| Pomoc AI | Szkic opisu oferty, podsumowanie historii i wyszukiwanie instrukcji; kontrola człowieka przy zmianach cen, wysyłce i zobowiązaniach |
| Wiele walut/języków | Dopiero po decyzji o rynku; obecne wyceny są w PLN, makiety z EUR nie oznaczają wdrożonej obsługi walut |
| Wiele niezależnych firm | Jeśli produkt ma być sprzedawany innym firmom: osobny projekt izolacji danych, konfiguracji i rozliczeń; nie zakładać, że role klientów już to zapewniają |

## Najbliższa kolejka wykonawcza

1. Powielanie szablonów instalacji — wdrożone lokalnie 3.11.2026, gotowe do przeglądu: [TEMPLATE_DUPLICATION.md](TEMPLATE_DUPLICATION.md).
2. Profil firmy i domyślne warunki dokumentów — wdrożone lokalnie 3.11.2026: [COMPANY_PROFILE.md](COMPANY_PROFILE.md).
3. Centrum powiadomień, preferencje i historia przypomnień — wdrożone lokalnie 3.11.2026: [NOTIFICATION_CENTER.md](NOTIFICATION_CENTER.md).
4. Automatyczne powiadomienia e-mail z kontrolą wysyłek — fundament wdrożony lokalnie 3.11.2026: własne przypomnienia pracowników, opt-in, prywatna kolejka, ponowienia i historia; adapter Mailpit/Resend. [NOTIFICATION_EMAIL.md](NOTIFICATION_EMAIL.md). Wysyłka produkcyjna pozostaje wyłączona; e-maile zdarzeń ofert/wizyt/odbiorów do klientów są dalszą częścią etapu 2.
5. Test całego procesu i przygotowanie pilotażu — 4.11.2026 dodano transakcyjny test integracji oferta → montaż → odbiór → nowa instalacja → serwis. Warunki środowiska oraz scenariusz odbioru w przeglądarce: [PILOT_READINESS.md](PILOT_READINESS.md). Odbiór na docelowym środowisku, kopie/odtworzenie, poczta i monitoring pozostają do wykonania.
6. Lejek sprzedaży i widoki szans, a potem kolejne moduły według wyników pilotażu.

Każde zadanie kończyć krótkim opisem działania, wynikiem odpowiednich sprawdzeń i propozycją kolejnego kroku. Nowych funkcji nie uznawać za odebrane wyłącznie na podstawie lokalnej implementacji.

## Zasady projektowania i odbioru

Zachowujemy projekt użytkownika: samo logo, wyszukiwanie i dzwonek obok niego, profil i ustawienia na dole panelu bocznego, przełącznik jasny/ciemny, akcent #FD4B01. Linear inspiruje zadania i działania, Attio CRM i relacje, Notion układ treści. Nowy moduł nie powinien niepotrzebnie zwiększać liczby elementów widocznych jednocześnie.

Warunki każdego etapu: właściwy dostęp biura/technika/klienta, brak ujawnienia cen zakupu i notatek klientowi, kontrola równoczesnych zmian, bezpieczne ponowienia zapisów, oba motywy, telefon oraz spójność zapisanych dokumentów. Weryfikacja zależy od zakresu zmiany; wyniki i ograniczenia zapisujemy w dokumentacji zadania.

## Dokumenty szczegółowe

- [CRM i historia klienta](CUSTOMER_WORKSPACE.md), [codzienna praca](CRM_WORK.md), [zadania zespołu](TEAM_TASKS.md).
- [Katalog](CATALOG.md), [oferty](OFFERS.md), [PDF](OFFER_PDF.md), [portal ofert](OFFER_PORTAL.md).
- [Szablony](INSTALLATION_TEMPLATES.md), [parametry](TEMPLATE_PARAMETERS.md), [warianty](OFFER_TEMPLATE_VARIANTS.md), [szablon z oferty](OFFER_VARIANT_TO_TEMPLATE.md).
- [Realizacje](WORK_ORDERS.md), [odbiory](HANDOVERS.md), [poprawki](CORRECTIONS.md), [serwis](SERVICE_WORKFLOW.md), [przeglądy](MAINTENANCE_COMPLETION.md).
- [Portal klienta](CUSTOMER_PORTAL.md), [dokumenty](DOCUMENTS.md), [dostęp](ACCESS_MANAGEMENT.md), [kierunek UX/UI](DESIGN_DIRECTION.md).
- [Historia wdrożeń](CONTINUATION.md). Starsze sekcje „kolejny etap” w dokumentach poszczególnych iteracji są historyczne; aktualna kolejność jest w niniejszym planie.
