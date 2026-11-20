# Katalog produktów i usług — wersja 1

Wdrożenie lokalne: 26.10.2026. Katalog jest wspólną bazą pozycji i cen firmy, przygotowaną do późniejszego użycia w ofertach. Lista zachowuje zaakceptowany układ tabel, pomarańczowy #FD4B01 oraz jasny i ciemny motyw.

## Zakres produktu

- Kategorie: urządzenia, materiały, usługi, dojazd.
- Każda pozycja ma unikalny kod, nazwę, kategorię, jednostkę, koszt i cenę sprzedaży netto, stawkę VAT oraz opcjonalne pola producenta, modelu, dostawcy i opisu.
- Jednostki: sztuka, komplet, metr, metr kwadratowy, godzina, kilometr, wizyta. Jednostkę można dobrać niezależnie od kategorii.
- Waluta tej wersji: PLN. Kwoty dotyczą jednej jednostki; limit pojedynczej ceny netto 9 999 999,99 zł. Obsługiwane są przecinek i kropka, do dwóch miejsc po przecinku.
- VAT jest polem edytowalnym (0–100%, do dwóch miejsc po przecinku). Formularz startuje z 23%; użytkownik dobiera stawkę do pozycji. Program nie ustala automatycznie stawki według rodzaju prac.
- Podgląd brutto, różnicy netto i marży: `(sprzedaż netto − koszt netto) / sprzedaż netto × 100%`. Marża nie jest narzutem. Przy sprzedaży 0 zł pokazywana jest kreska; ujemna marża ma ostrzeżenie, ale nie blokuje świadomego zapisu.
- Dodawanie, edycja, archiwizacja i przywracanie. Brak trwałego kasowania w interfejsie. Archiwum zachowuje rezerwację kodu.
- Wyszukiwanie po kodzie, nazwie, producencie, modelu, dostawcy i opisie. Filtry kategorii i statusu zachowują wyszukiwanie, a zmiana filtra wraca do strony 1. Strony po 25 pozycji, stabilna kolejność nazwa / identyfikator.

Katalog pozostaje wewnętrzny dla administratora i biura. Technik i klient nie widzą cen zakupu ani katalogu, także przez bezpośrednie zapytania do bazy lub API. Zablokowane konto traci dostęp również w istniejącej sesji. Portal klienta nie pokazuje tych danych.

## Dane i zapis

Migracja `202610260001_catalog.sql` dodaje tabelę `catalog_items`, kontrolę dostępu RLS, unikalność kodów bez rozróżniania wielkości liter oraz historię zmian w istniejącym audycie CRM. Nie zmienia istniejących klientów, instalacji ani kont. Przed zastosowaniem migracji lokalnie wykonano kopię bazy w `/private/tmp/hvac-before-catalog-20261026.sql`.

Ceny przechowywane są jako całkowite grosze, a VAT jako setne części procenta. Obliczenie brutto zaokrągla wynik do najbliższego grosza. Formularz przelicza wpisane kwoty bez mnożenia dziesiętnych liczb zmiennoprzecinkowych.

Zapis odbywa się przez chronioną funkcję `save_catalog_item`, z kontrolą roli, pełną walidacją danych i blokadą transakcyjną. Edycja wymaga wersji odczytanego rekordu; stary formularz nie nadpisze nowszych cen. Powtórzenie utworzenia z tym samym identyfikatorem i treścią nie duplikuje pozycji. Po konflikcie edycji należy odświeżyć dane; formularz nie ponawia jej samodzielnie. Kody aktywnych i archiwalnych pozycji pozostają unikalne.

## API i przyszłe aplikacje

Wspólny kontrakt w `packages/api-client/src/catalog.ts`:

- `GET /api/v1/catalog` — filtry `search`, `category`, `state`, `page`.
- `GET /api/v1/catalog/{id}` — pełna pozycja dostępna dla administratora/biura.
- `POST /api/v1/catalog` — utworzenie z UUID i `version: null`, edycja/archiwizacja/przywrócenie z aktualną wersją.
- Metody wspólnego klienta: `catalogItems`, `catalogItem`, `saveCatalogItem`.

API korzysta z istniejących zabezpieczeń źródła żądania i uwierzytelniania cookie / Bearer. Może służyć przyszłym aplikacjom telefonicznym oraz Windows/macOS; nie oznacza to jeszcze wdrożenia ich interfejsów. Po stronie bazy ponownie sprawdzane są uprawnienia — interfejs nie jest jedyną ochroną cen.

## Weryfikacja

- 228 testów Vitest, w tym 49 nowych testów katalogu i API.
- 371 testów SQL, w tym 40 testów katalogu (uprawnienia, ceny, unikalność, ponowienia, konflikt wersji, archiwizacja, przywracanie, audyt, blokada konta).
- ESLint, TypeScript i kompilacja produkcyjna.
- W przeglądarce sprawdzono dodanie technicznej pozycji, edycję ceny, wyszukiwanie, archiwizację i przywrócenie. Kwoty 38/65 zł dały 79,95 zł brutto i 41,54% marży; po zmianie sprzedaży na 70 zł — 86,10 zł brutto i 45,71% marży.
- Jasny i ciemny motyw przy 1440 × 1000, lista i formularz przy 390 × 844; dokument nie poszerza się ponad 390 px, tabela przewija się osobno.
- Techniczną pozycję QA usunięto po weryfikacji. Nie wprowadzono fikcyjnego cennika firmy. Audyt technicznego zapisu pozostał zachowany.

Nie testowano na fizycznym telefonie ani w gotowych aplikacjach instalowanych.

## Kolejny etap

Kreator ofert korzystający z katalogu: wybór klienta, pozycje i ilości, rabaty, wartości netto/VAT/brutto, kontrola marży i zapis szkicu. Oferta powinna zachowywać własną kopię nazw, jednostek, kosztów, cen i stawek z chwili wyceny, aby późniejsze zmiany katalogu nie zmieniały wcześniejszych ofert.

Poza bieżącym zakresem: import CSV/cenników dostawców, wiele ofert zakupu dla jednego produktu, załączniki i zdjęcia produktów, wiele walut, stany magazynowe i szablony instalacji.

Kreator szkiców ofert został wdrożony w kolejnym etapie: [OFFERS.md](OFFERS.md).
