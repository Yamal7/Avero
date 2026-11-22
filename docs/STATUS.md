# Stan implementacji

Prowadzi Claude Code. Czat projektowy czyta ten plik przed każdym nowym modułem. Najnowsze wpisy na górze.

Stos: Next.js 15 (App Router), React 19, TypeScript, Supabase (Postgres z RLS, dostęp do tabel tylko przez funkcje RPC), Zod (`packages/api-client`), Vitest + testy SQL (pgTAP). Gałąź robocza: `redesign-precision-ui`.

## Zaimplementowane

| Moduł / ekran | Stan | Data | Uwagi |
|---|---|---|---|
| Widok kolekcji (silnik) | działa w Zadaniach | 2026-11-20 | grupowanie, sortowanie, kolumny, filtry priorytetu i etykiety, zapisane widoki jako pigułki; ustawienia na koncie |
| Rama aplikacji · skróty | działa | 2026-11-20 | ⌥T / ⌘T nowa karta, ⌥1–9 / ⌘1–9 przełączanie kart; zwinięte grupy menu zapisane na koncie |
| Karta firmy · nawigacja | działa | 2026-11-20 | „2 z 4”, poprzednia / następna firma klawiszami J / K |
| Osoby | działa na danych | 2026-11-20 | kontakty firm i klienci indywidualni razem; kategorie osób; widoki Decyzyjne, Klienci indywidualni, Bez kontaktu 30 dni |
| Firmy · filtry i podsumowanie | działa na danych | 2026-11-20 | kolory kategorii z „Zarządzaj”, filtr którakolwiek / wszystkie / żadna, sortowanie po ostatnim kontakcie, widok „Bez kontaktu 30 dni”, wiersz podsumowania |
| Magazyn · reguły z rozmowy | działa na danych | 2026-11-20 | WZ, numer butli, minimum na bus i „Uzupełnij braki (N)”, szkice dokumentów, rezerwacja na zadanie, jednostka blokowana po pierwszym ruchu, ⌘↵ |
| Zadania · powiązania i panel | działa na danych | 2026-11-20 | powiązanie ze zgłoszeniem (ZG), zleceniem (ZS) lub ofertą (OF) z numerem przy tytule; osoba i termin zmieniane w panelu (biuro) |
| Zadania · statusy i tablica | działa na danych | 2026-11-20 | statusy Backlog i Do sprawdzenia; tablica 5 kolumn 1:1 z makiety |
| Statusy zgłoszeń | działa | 2026-11-20 | Nowe = przerywane kółko, Czeka na części = pomarańczowe z „!” |
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
- Silnik widoku kolekcji w Magazynie, Firmach i Przeglądach (na razie tylko Zadania).
- Wydanie czynnika (RW) ma zwiększać ładunek w karcie urządzenia — czeka na Kartę urządzenia.

## Odstępstwa od makiet

Co świadomie zrobiono inaczej niż w `docs/design/` i dlaczego.

- **Mapa:** kafelki OpenStreetMap z nakładką SVG zamiast MapLibre. Nie wymaga nowej biblioteki; do zmiany po zgodzie właściciela.
- **Ikony:** własne SVG odwzorowane z makiet (`src/components/design-icons.tsx`) zamiast pakietu Phosphor. Nowa biblioteka wymaga zgody.
- **Tokeny:** style w `src/app/precision.css`, skopiowane z kanwy przed powstaniem `docs/design/tokens.css`. Trzeba je porównać z `tokens.css` i ujednolicić.
- **Motyw ciemny:** nowe ekrany nie są jeszcze sprawdzone w ciemnym motywie.
- **Skróty kart:** przeglądarki zastrzegają ⌘T i ⌘1–9 dla własnych kart, więc w przeglądarce działają ⌥T i ⌥1–9; ⌘ działa tam, gdzie przeglądarka go przepuszcza (np. aplikacja zainstalowana jako okno).
- **„Uzupełnij braki”:** dokument MM ma jedno miejsce docelowe, więc powstaje jedno MM na każdy bus z brakami (jedna akcja, kilka dokumentów).
- **„+” w kolumnie tablicy zadań:** zadanie zawsze należy do firmy, więc „+” prowadzi do listy firm; zadanie dodaje się na karcie firmy.
- **Minimum na bus:** ustawiane dwuklikiem w komórce macierzy „W samochodach” (makieta nie pokazuje, gdzie się je edytuje).
- **Filtry widoku Zadań** działają na wczytanej stronie listy (20 zadań); grupowanie i sortowanie też.

## Pytania do projektu

- **Kategorie osób kontaktowych:** makiety nie pokazują, gdzie się je edytuje; teraz w komórce tabeli Osoby.

Rozstrzygnięte przez właściciela 2026-11-22:
- Style: Tailwind v4 na tokenach z `tokens.css`, wprowadzany stopniowo (domyślne skale wyłączone, bez wartości dowolnych); zgoda na `tailwindcss`, `@tailwindcss/postcss`. Komentarz w `tokens.css` mówi o `theme.extend` (Tailwind v3) — w v4 tokeny idą do bloku `@theme`; do poprawienia po stronie projektu.

Rozstrzygnięte przez właściciela 2026-11-20:
- J = poprzednia, K = następna firma (zgodnie z `screens/04-klienci.md`).
- Ikona „Do sprawdzenia” zostaje jak w makiecie (pełne zielone kółko).
- Minimum na bus ustawiane dwuklikiem w komórce „W samochodach” zostaje.

## Dziennik

- 2026-11-22 — plan wdrożenia makiet: `docs/PLAN.md` (29 modułów w 4 fazach, powiązanych z Linear); do decyzji właściciela: D2 (migracja wielofirmowości).
- 2026-11-22 — decyzja właściciela D1: Tailwind v4 na tokenach, wprowadzany stopniowo (M0.2 / KRA-26).
- 2026-11-20 — 9 poprawek zgodności z rozmową projektową (statusy, zadania, magazyn, firmy, osoby, karta firmy, skróty, silnik widoku).
- 2026-11-20 — repozytorium projektu połączone z kodem (merge `Yamal7/avero` do gałęzi `redesign-precision-ui`); uzupełniono stan implementacji.
- 2026-11-20 — utworzono plik (szablon z czatu projektowego).
