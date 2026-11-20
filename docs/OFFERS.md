# Kreator ofert i kalkulacja wewnętrzna — wersja 1

Wdrożenie lokalne: 26.10.2026, według pięciu ekranów użytkownika. Trzy kroki w oknie z rozmytym tłem prowadzą do edytora kalkulacji. Interfejs zachowuje pomarańczowy #FD4B01, logo bez nazwy, istniejący panel boczny i oba motywy.

## Przebieg

1. Wyszukanie aktywnego klienta, wybór jego lokalizacji (opcjonalnie) i nazwa oferty. Lista wyszukiwania zwraca do 25 wyników, z możliwością doprecyzowania nazwy.
2. Rodzaj prac: klimatyzacja split, multi-split, pompa ciepła, podłogówka, wod-kan lub własna kalkulacja.
3. Opcjonalne pozycje startowe z katalogu: urządzenie (jedna jednostka), materiał rozliczany w metrach, robocizna w godzinach i dojazd w kilometrach. Długość, czas i odległość określa użytkownik. Można rozpocząć od pustego szkicu. Po „Utwórz kalkulację” szkic zostaje zapisany w bazie.

To wybór pozycji startowych, nie automatyczny szablon technologiczny. Pełny moduł szablonów instalacji pozostaje w przygotowaniu. Żadnych kosztów ani ilości nie dodaje się na podstawie przykładowych danych z wizualizacji.

## Edytor

- Po lewej pozycje z katalogu lub własne, po prawej podsumowanie netto, kosztów, różnicy netto, marży, VAT i brutto. Na małym ekranie podsumowanie znajduje się pod tabelą, a tabela przewija się we własnym obszarze.
- Nazwa i opis, kategoria, jednostka, ilość (do trzech miejsc po przecinku), koszt i cena jednostkowa netto, stawka VAT i rabat procentowy w każdej pozycji.
- Do pięciu wariantów, do 30 pozycji każdy. Dodawanie, kopiowanie, zmiana nazwy, wybór wariantu głównego i usuwanie wariantu. Kopia zachowuje nazwy, kody i ceny jako niezależne pozycje, bez ponownego pobierania cen z katalogu.
- Suwak docelowej marży 0–95% i świadome zastosowanie sugerowanej ceny. Marża to różnica netto / sprzedaż netto, a nie narzut na koszty. Sama zmiana suwaka nie zmienia ceny sprzedaży.
- Ręczna cena końcowa **netto**; puste pole oznacza sumę pozycji po rabatach. Podsumowanie pokazuje wielkość korekty. Przy zerowej sumie pozycji dodatnia korekta jest niedozwolona.
- Notatka wewnętrzna oraz osobny opis dla klienta dla każdego wariantu.
- Zapis wszystkich wariantów, ponowne otwarcie szkicu, archiwizacja i przywracanie. Archiwum ma wyłączoną edycję. Niezapisane zmiany blokują zmianę stanu; odejście od edytora wymaga potwierdzenia odrzucenia zmian.
- Lista ofert ma wyszukiwanie po numerze, nazwie i kliencie, widoki Robocze / Archiwum / Wszystkie oraz stronicowanie. Wartości listy dotyczą wariantu głównego.

Waluta: PLN. Każda oferta ma numer `OF-ROK-NUMER`, nadawany przez bazę. Numer jest globalną sekwencją; rok pochodzi z daty utworzenia w Europe/Warsaw. Sekwencja może mieć luki, np. po wycofanym teście. Nie jest to numeracja faktur.

## Trwałość i uprawnienia

Oferty są wewnętrzne dla administratora i biura. Technik i klient nie mogą odczytywać ani zmieniać szkiców przez ekran, API ani bezpośrednią tabelę. Blokada konta jest sprawdzana również przy istniejącej sesji. Nie rozszerzono nikomu ról.

Migracja `202610260002_offers.sql` dodaje tabelę, RLS, audyt i funkcje zapisu / obliczeń. Zastosowano ją do lokalnej bazy bez resetowania, po kopii `/private/tmp/hvac-before-offers-20261026.sql`.

Oferta zapisuje własne kopie nazw, kodów, jednostek, cen, kosztów, stawek oraz opisu klienta i lokalizacji. Późniejsze zmiany katalogu lub nazwy klienta nie zmieniają zapisanej oferty. Klient i lokalizacja są stałe dla danego szkicu; aby ofertować innemu klientowi, tworzy się nową ofertę. Edycja aktywnej oferty wymaga aktywnego klienta; archiwizacja zachowuje dane historyczne.

Zapis jest atomowy i wersjonowany. Stary formularz nie nadpisuje nowszej wersji, a ponowienie tego samego utworzenia nie tworzy duplikatu. Surowe zapisy i trwałe kasowanie są niedostępne dla kont aplikacji. Zmiany trafiają do istniejącego audytu. Edytor odświeża czysty szkic po powrocie z podglądu, chroniąc niezapisane zmiany.

## Obliczenia

- Ceny: całkowite grosze. Ilości: całkowite tysięczne jednostki. VAT, rabaty i marża docelowa: setne części procenta.
- Netto wiersza: ilość × cena jednostkowa × (1 − rabat), zaokrąglone do grosza. Koszt wiersza zaokrągla się osobno, bez rabatu sprzedaży.
- Ręczna cena jest dzielona proporcjonalnie między wiersze metodą największych reszt, z rozstrzyganiem remisów kolejnością wierszy. Następnie naliczany jest VAT poszczególnych pozycji. Suma wierszy dokładnie odpowiada cenie końcowej.
- VAT i brutto sumuje się po wierszach. Podgląd pokazuje przydzielone kwoty po korekcie, podczas gdy tabela edytora pokazuje bazowe kwoty pozycji i podsumowanie korekty osobno.
- Sugerowana cena netto = koszt / (1 − docelowa marża), zaokrąglona w górę do grosza. Nie oznacza to zysku po wszystkich kosztach przedsiębiorstwa.
- Limity: 10 000 jednostek w pozycji; 9 999 999,99 zł ceny jednostkowej; 9 999 999 999,99 zł sumy netto/kosztu/brutto wariantu. Maksymalny zapis API: 256 KiB.

Te same reguły działają w bibliotece aplikacji (BigInt dla mnożenia) i bazie (dokładny typ numeric). Serwer oblicza sumy niezależnie, nie przyjmuje ich od przeglądarki.

## Podgląd

„Podgląd oferty” pokazuje zapisane warianty, opisy dla klienta, pozycje, stawki i wartości netto/VAT/brutto. Korzysta z jawnej projekcji bez kosztów, marży, docelowej marży, identyfikatorów katalogu i notatek wewnętrznych. Podgląd jest dostępny pracownikowi — nie jest jeszcze wysyłką ani publikacją w portalu klienta.

## API

- `GET /api/v1/offers` — wyszukiwanie, stan i strona.
- `POST /api/v1/offers` — utworzenie, edycja, archiwizacja lub przywrócenie, z UUID i oczekiwaną wersją.
- `GET /api/v1/offers/{id}` — wewnętrzna kalkulacja.
- `GET /api/v1/offers/options?search=…` — aktywni klienci i ich lokalizacje dla kreatora.

Wspólna biblioteka obsługuje `offers`, `offer`, `saveOffer`, z obecnym uwierzytelnianiem cookie / Bearer. To podstawa przyszłych aplikacji Windows/macOS i telefonicznych, bez deklarowania ich obecnej gotowości.

## Weryfikacja

270 testów Vitest (42 nowe dla ofert), 415 testów SQL (44 nowe), ESLint, TypeScript i kompilacja produkcyjna. Testy obejmują rabaty, ilości ułamkowe, mieszany VAT, korektę ceny, zaokrąglenia, wersje, zachowanie kopii danych, uprawnienia i ukrywanie danych wewnętrznych.

W przeglądarce sprawdzono trzy kroki, wybór realnej pozycji katalogu, własną robociznę, zapis, kopię wariantu, zmianę wariantu głównego i podgląd bez notatki kontrolnej. Używano wyłącznie technicznego szkicu do sprawdzenia funkcji. Nie wysyłano oferty do klienta i nie zmieniano istniejących pozycji katalogu.

## Następny etap

Firmowy dokument oferty do PDF: dane i logo firmy, ważność oferty, warunki, zakres i czytelne zestawienie wariantów. Następnie kontrolowane udostępnienie w portalu, pytania klienta i rejestrowana akceptacja/odrzucenie. Te funkcje nie są symulowane przez obecny szkic.

Końcowy podgląd: edytor i kreator przy 390 × 844 zachowują szerokość dokumentu 390 px. Potwierdzono archiwizację i przywrócenie po powrocie z podglądu. Kontrola komunikatu o niezapisanych zmianach ujawniła ograniczenie narzędzia przy systemowym potwierdzeniu; w końcowej wersji zastąpiono je oknem programu. Ostatnia kontrola klikania tego okna była ograniczona przez pozostające systemowe potwierdzenie w starszej karcie. Kompilacja końcowej wersji przeszła. Techniczny szkic usunięto po sprawdzeniu jego identyfikatora, nazwy i wersji; audyt pozostał zachowany, istniejące pozycje katalogu pozostały bez zmian. Nie wykonano testu na fizycznym telefonie.

## Eksport PDF

Wdrożony eksport PDF opisano w [OFFER_PDF.md](OFFER_PDF.md). Podgląd oferty udostępnia zapis danych wykonawcy i warunków oraz prywatne pobieranie dokumentu.

## Portal klienta

Wdrożone udostępnianie wersji i akceptacja wariantów: [OFFER_PORTAL.md](OFFER_PORTAL.md).
