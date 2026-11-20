# Stan implementacji

Prowadzi Claude Code. Czat projektowy czyta ten plik przed każdym nowym modułem. Najnowsze wpisy na górze.

Stos: Next.js 15 (App Router), React 19, TypeScript, Supabase (Postgres z RLS, dostęp do tabel tylko przez funkcje RPC), Zod (`packages/api-client`), Vitest + testy SQL (pgTAP). Gałąź robocza: `redesign-precision-ui`.

## Zaimplementowane

| Moduł / ekran | Stan | Data | Uwagi |
|---|---|---|---|
| Magazyn · tabela, panel pozycji, w samochodach, PZ / MM / RW | działa na danych | 2026-11-19 | RW z ważeniem butli trafia do materiałów zlecenia; rezerwacje pod zlecenie; stan nie może zejść poniżej zera |
| Planowanie · dzień, przeciąganie, mapa | działa na danych | 2026-11-19 | geokodowanie OpenStreetMap (Nominatim, z pamięcią podręczną), czasy dojazdu, „Przydziel” |
| Zlecenie serwisowe (ZS-…) | działa na danych | 2026-11-19 | pomiary, materiały, komentarze; zamknięte zlecenie blokuje zapis |
| Zadania · lista, tablica, panel zadania | działa na danych | 2026-11-18 | numer ZD-n, priorytet, etykieta, komentarze |
| Mój dzień | działa na danych | 2026-11-18 | |
| Firmy i osoby · lista, karta firmy (przegląd) | działa częściowo | 2026-11-18 | kategorie firm, NIP, termin płatności |
| Kreator oferty | wygląd 1:1, logika częściowa | 2026-11-17 | |
| Rama aplikacji (górny pasek, karty, panel boczny) | działa | 2026-11-17 | karty ostatnich rekordów zapisywane w przeglądarce |

Ekrany przenoszone 1:1 z makiet (wartości odstępów, promieni i kolorów skopiowane z kanwy).

## Do zrobienia (z makiet i rozmowy projektowej)

- Karta urządzenia i historia F-gaz (CO₂e, częstotliwość kontroli wg (UE) 2024/573, CRO).
- Telefon technika, zlecenie montażu, faktura końcowa, widoki klienta (oferta, podpis, płatność), przeglądy i umowy, raporty, ustawienia.
- Poprawki zgodności z projektem:
  - kształty statusów „Nowe” i „Czeka na części”;
  - statusy zadań „Do sprawdzenia” i „Backlog”;
  - powiązanie zadania ze zleceniem lub ofertą;
  - minimum na bus i jedno MM na braki;
  - dokument WZ, szkic RW i numer butli;
  - kolory kategorii nadawane przez użytkownika;
  - Osoby jako kontakty firm;
  - przechodzenie K / J między firmami;
  - silnik widoku kolekcji (filtry, sortowanie, grupowanie, kolumny, zapisane widoki).

## Odstępstwa od makiet

Co świadomie zrobiono inaczej niż w `docs/design/` i dlaczego.

- **Mapa:** kafelki OpenStreetMap z nakładką SVG zamiast MapLibre. Nie wymaga nowej biblioteki; do zmiany po zgodzie właściciela.
- **Ikony:** własne SVG odwzorowane z makiet (`src/components/design-icons.tsx`) zamiast pakietu Phosphor. Nowa biblioteka wymaga zgody.
- **Tokeny:** style w `src/app/precision.css`, skopiowane z kanwy przed powstaniem `docs/design/tokens.css`. Trzeba je porównać z `tokens.css` i ujednolicić.
- **Motyw ciemny:** nowe ekrany nie są jeszcze sprawdzone w ciemnym motywie.

## Pytania do projektu

- (brak)

## Dziennik

- 2026-11-20 — repozytorium projektu połączone z kodem (merge `Yamal7/avero` do gałęzi `redesign-precision-ui`); uzupełniono stan implementacji.
- 2026-11-20 — utworzono plik (szablon z czatu projektowego).
