# Realizacje i planowanie montaży

## Praca firmy

Po akceptacji wariantu oferty firma otwiera historię jej udostępnień i wybiera **Utwórz / otwórz zlecenie**. Formularz pokazuje zaakceptowany wariant, cenę i klienta oraz wymaga potwierdzenia miejsca montażu. Powstaje jedno zlecenie ZL-xxxxx na zaakceptowaną publikację. Kolejne próby otwierają to samo zlecenie, zamiast powielać pracę. Adres można poprawić przed rozpoczęciem prac; pierwotna oferta nie jest zmieniana.

Nowa zakładka **Realizacje** zawiera wyszukiwanie, statusy i kartę zlecenia. Zakres, uwagi dla klienta i cena są kopiowane z wybranego zaakceptowanego wariantu, z niezależnym zapisem jego treści. Późniejsze zmiany kalkulacji i katalogu nie zmieniają zlecenia.

Każdy termin ma datę i godzinę, 15–480 minut, od 1 do 10 osób i wewnętrzną notatkę. Zlecenie może mieć do 100 terminów: dla wielu dni dodaje się osobne pozycje, z możliwością wyboru różnych ekip. Do ekipy wybierane są wyłącznie aktywne osoby z rolą technika, wcześniej przypisane do danego klienta. Ten etap nie nadaje automatycznie uprawnień użytkownikom. Jeśli lista osób jest pusta, administrator musi uzupełnić role i przypisania w istniejącej zakładce Użytkownicy.

Wspólny kalendarz pokazuje montaże i wizyty serwisowe chronologicznie, z filtrem technika. Nakładające się rezerwacje dowolnej osoby w ekipie są odrzucane w obu kierunkach: montaż/serwis i serwis/montaż. Terminy są przedziałami z wyłączonym końcem, więc kolejna praca może zacząć się dokładnie po poprzedniej. Obie operacje używają wspólnej blokady transakcyjnej service_write_lock. Identyfikator montażu nie może ukryć kolizji z wizytą serwisową o takim samym UUID.

Godziny są interpretowane w Europe/Warsaw. Nieistniejąca godzina podczas wiosennej zmiany czasu jest odrzucana. Powtarzana godzina jesienna zachowuje sposób interpretacji istniejącego modułu serwisowego PostgreSQL, czyli standardowy czas zimowy. Czas trwania oznacza rzeczywiste minuty.

Technik rozpoczyna swój termin, a następnie oznacza go jako zakończony. Biuro może zmienić lub odwołać termin i zamknąć całe zlecenie. Zamknięcie wymaga przynajmniej jednego zakończonego terminu i braku terminów otwartych. Anulowanie zlecenia odwołuje otwarte terminy i zwalnia rezerwacje; wykonana historia pozostaje. Wznowienie anulowanego zlecenia przywraca planowanie, bez automatycznego odtwarzania dawnych rezerwacji. Zakończone zlecenie nie podlega ponownemu planowaniu.

## Portal i uprawnienia

Klient widzi przy zaakceptowanej ofercie numer zlecenia, status, miejsce i terminy montażu. Nie otrzymuje notatek wewnętrznych, identyfikatorów ani adresów e-mail ekipy. To widok tylko do odczytu, z odświeżaniem istniejącym przyciskiem portalu.

Technik ma dostęp tylko do zleceń, do których należy jego ekipa, i tylko tak długo, jak pozostaje aktywnym technikiem przypisanym do tego klienta. Otrzymuje zakres, uwagi i własne terminy z notatkami operacyjnymi. Nie otrzymuje ceny ani surowego snapshotu finansowego. Nie może tworzyć zleceń, planować terminów, zmieniać adresu ani zamykać całego zlecenia. Biuro i administrator zarządzają całością. Surowe zapisy tabel są odebrane użytkownikom; zmiany przechodzą przez kontrolowane funkcje z audytem i numerem wersji.

## API i kolejne platformy

- GET/POST `/api/v1/work-orders`: stronicowana lista i utworzenie z zaakceptowanej publikacji.
- GET/PATCH `/api/v1/work-orders/{id}`: operacyjny podgląd i korekta adresu przed rozpoczęciem.
- PUT `/api/v1/work-orders/{id}/visits`: dodanie lub przeplanowanie terminu z wersją zlecenia i stałym identyfikatorem terminu.
- POST `/api/v1/work-orders/{id}/visits/{visitId}/state`: rozpoczęcie, zakończenie lub odwołanie terminu.
- POST `/api/v1/work-orders/{id}/state`: zakończenie, anulowanie lub wznowienie planowania.
- GET `/api/v1/work-orders/calendar?from=YYYY-MM-DD`: tydzień montaży dostępnych dla użytkownika.
- GET `/api/v1/portal/offers/{publicationId}/work-order?customer={customerId}`: wyłącznie publiczny plan dla przypisanego klienta.

Wspólne schematy i klient API obsługują wszystkie operacje także przez Bearer dla przyszłych aplikacji mobilnych i desktopowych. Daty w kalendarzu są ISO, a interfejs przelicza je na Europe/Warsaw. Metody zapisu używają optymistycznej kontroli wersji. Powtórzenie identycznego ostatniego zapisu nie tworzy duplikatu i nie podbija wersji.

## Weryfikacja

329 testów aplikacji i 526 testów bazy; typy, lint oraz kompilacja produkcyjna. Testy obejmują tworzenie tylko z zaakceptowanej wersji, niezmienność zakresu i ceny, izolację klienta i techników, brak cen w odpowiedzi technika, brak danych ekipy i notatek w portalu, ponowienia zapisu, nieaktualne wersje, wielodniowe terminy, odwołanie, wznowienie, korektę adresu, oba kierunki kolizji z serwisem, przylegające terminy i wiosenną zmianę czasu. Baza testowa wycofuje swoje fikcyjne dane transakcyjnie.

W przeglądarce sprawdzono na własnej fikcyjnej ofercie: utworzenie zlecenia, planowanie dwóch dni, odrzucenie nakładającego się terminu i poprawny zapis po zmianie daty, widoczność w kalendarzu i publiczny plan na ekranie 390 px. Dane kontrolne zawierały syntetyczną akceptację; żadnej rzeczywistej oferty klienta nie zaakceptowano. Technik kontrolny nie ma hasła ani skrzynki odbiorczej i jest przypisany wyłącznie do fikcyjnego klienta; po sprawdzeniu usuwamy wszystkie własne dane kontrolne. Historia audytowa pozostaje.

## Dalszy etap

Zamknięcie zlecenia nie tworzy jeszcze technicznej karty instalacji, urządzeń, protokołu odbioru, gwarancji, faktury ani rozchodu magazynowego. Proponowany następny etap: protokół odbioru montażu, zapis urządzeń i numerów seryjnych oraz gwarancji, z powiązaniem do instalacji i portalu klienta. Rozliczenie kosztów rzeczywistych i magazyn to oddzielne moduły.

Końcowa kontrola po kompilacji: formularz zgłasza pojedynczy widoczny błąd kolizji; karta realizacji i portal mają przy ekranie 390 px dokładnie 390 px szerokości strony. W portalu nie ma notatki kontrolnej ani e-maila technika. Własne zlecenie kontrolne, oba terminy, syntetyczna publikacja, oferta, klient i konto technika zostały usunięte. Program pozostawiono uruchomiony w zakładce Realizacje.

Aktualizacja 28.10.2026: protokoły odbioru, rejestracja urządzeń i jawne dane gwarancji są już dostępne — [HANDOVERS.md](HANDOVERS.md). Zakończenie zlecenia pozostaje osobne, zgodnie z decyzją użytkownika. Etap nie obejmuje rozliczeń ani magazynu.
