# Stan implementacji

Prowadzi Claude Code. Czat projektowy czyta ten plik przed każdym nowym modułem. Najnowsze wpisy na górze.

Stos: Next.js 15 (App Router), React 19, TypeScript, Supabase (Postgres z RLS, dostęp do tabel tylko przez funkcje RPC), Zod (`packages/api-client`), Vitest + testy SQL (pgTAP). Gałąź robocza: `redesign-precision-ui`.

## Zaimplementowane

| Moduł / ekran | Stan | Data | Uwagi |
|---|---|---|---|
| Tabele w jednej linii · logo z kartą podglądu · przypięta kolumna (M0.3, KRA-63) | działa (wygląd do sprawdzenia w przeglądarce) | 2026-11-24 | wspólne komponenty `src/components/table/` (`TableScroll`, `Row`, `Cell`, `HeaderRow`/`HeaderCell`, `RowGroup`/`GroupBar`, `TableMessage`, `TableSkeleton`, `Logo`, `CustomerLogo` z kartą 280 px w portalu, rama `page-chrome.tsx`); logika w `src/lib/table/` (inicjały, kolor marki, układ kolumn i przypięcia, ←/→, pozycja karty) z testami `tests/table-logic.test.ts`; Firmy, Osoby, Zadania (lista + panel) i Magazyn (pozycje, W samochodach, panel, okna PZ/RW/MM/WZ) przeniesione na Tailwind bez `style={{}}`; szkielety `loading.tsx` dla Firm, Zadań i Magazynu |
| Tailwind v4 na tokenach · ikony Phosphor (M0.2, KRA-26) | działa | 2026-11-23 | `src/app/tailwind.css` (`@theme inline reference`, domyślne skale wyłączone, wariant `dark` = `[data-theme=dark]`, bez preflightu); warstwy `theme → legacy (globals.css, precision.css) → tokens (docs/design/tokens.css) → utilities`; wspólne elementy w `src/components/ui/` (Button, Input, Pill, TableRow — stany: hover, aktywny, fokus, wyłączony, ładowanie, pusty, błąd); rama (`app-shell.tsx`) i układ list (`list-layout.tsx`) w Tailwindzie; reguła ESLint `avero/tailwind-tokens` (wartości dowolne, odstępy spoza siatki 4 px) |
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
- **Ikony (M0.2):** Phosphor Regular (`@phosphor-icons/react/ssr`, działa w komponentach serwerowych). `src/components/icon.tsx` zostaje jako mapa nazw → Phosphor, bo nawigacja, paleta poleceń i portal podają ikonę jako daną (`icon: 'cube'`); własnych ścieżek SVG już nie ma. `design-icons.tsx` usunięty: glify stanu (status zadania i zgłoszenia, priorytet, awatar) są w `src/components/glyphs.tsx` — to rysunki stanu, zostają własnym SVG; etykiety i helpery w `src/lib/tasks/labels.ts`. Wyjątek od wagi Regular: ptaszek i „×” 10 px w widoku kolekcji są w wadze Bold (Regular przy 10 px ma kreskę ok. 0,6 px). Kształty ikon różnią się od Lucide z makiety (inny zestaw) — to zamierzona zmiana z decyzji o Phosphor. Pojedyncze SVG w innych ekranach (filtry firm, zlecenie serwisowe, kalendarz, mapa, pager rekordu, kategorie) przejdą na Phosphor przy swoich modułach.
- **Tokeny (M0.2):** jedna lista zmiennych — `docs/design/tokens.css`, importowany do warstwy `tokens` (wygrywa z dawnymi definicjami w `globals.css`, np. `:root[data-theme=dark] { --accent }`). `precision.css` ma już tylko aliasy starych nazw (`--ink`, `--muted`, … , `--pui-sidebar-w` → `--sidebar-w`) i dodatki spoza tokenów (pytanie niżej). Wartości z `precision.css` były identyczne z `tokens.css` (sprawdzone przed usunięciem).
- **Tailwind obok starych arkuszy (M0.2):** bez preflightu; `globals.css` i `precision.css` w warstwie `legacy` pod klasami Tailwinda, więc stare ekrany wyglądają jak dotąd. Reguły `!important` z `precision.css` (np. `.pui-main h1`) nadal wygrywają z klasami Tailwinda — dlatego nagłówek listy zachowuje klasę `pui-page-head`. Tailwind generuje też klasy z wyrazów w kodzie (`.table`, `.hidden`, `.flex`…) — sprawdzone, że żaden element obecnych ekranów nie ma takiej klasy (wyjątek: `sr-only`, które działa tak samo).
- **Znane ograniczenie (M0.2):** `:is(.pui-main, .portal-shell) * { text-transform: none !important; letter-spacing: normal !important; }` w `precision.css` (sekcja 2b) wyłącza w treści ekranów klasy `tracking-*` i `uppercase` — reguły `!important` z warstwy `legacy` wygrywają z Tailwindem. Zniknie, gdy ekrany przejdą na Tailwind i regułę będzie można usunąć.
- **Kolory osób i etykiet (M0.2):** paleta osób (`src/lib/tasks/labels.ts`) używa `--person-mz/-tl/-kn/-pd`; dwa ostatnie kolory palety (#D6453D, #2F9E5B) i kolory etykiet zadań zostają wartościami, bo w `tokens.css` nie ma tokenów o tych wartościach stałych w obu motywach (`--ic-*`, `--danger`, `--success` zmieniają się w ciemnym). Białe inicjały w awatarze osoby też zostają wartością (`--on-accent` jest ciemny w ciemnym motywie).
- **Rama i lista (M0.2):** okno ramy (Szukaj / Powiadomienia / Profil, `.shell-dialog`) zostaje na starych klasach — jego treść to osobne panele, przejdą z modułem Skrzynki / Ustawień. Tabela listy (`.cv-table`) przechodzi w M0.3. W `list-layout.tsx` zostają klasy-zaczepienia `pui-page-head`, `cv-actions`, `cv-pills` (reguły ekranów podających przyciski i zakładki). Wartości makiety spoza siatki 4 px i tokenów są w stałych `offGrid` z jawnym wyłączeniem reguły ESLint (pytanie niżej), żeby rama wyglądała jak przed zmianą.
- **Tabele (M0.3) — układ:** odstęp kolumn 12 px to prawy odstęp komórki wliczony w szerokość ścieżki (pierwsza komórka +8 px z lewej), a nie `column-gap` — inaczej między przypiętymi komórkami byłaby przezroczysta szczelina. Minimalne szerokości (główna 220 px, pozostałe 112–176 px co 8 px) liczy `columnLayout` jak `tabele_przewijane.py`; kolumny przed główną muszą mieć stałą szerokość. Geometria z danych (`grid-template-columns`, `left` przypiętej komórki, `min-width` treści, pozycja karty podglądu) jest w atrybucie `style` wyłącznie w `src/components/table/` (Tailwind bez wartości dowolnych nie wyrazi danych z obliczeń); ekrany nie mają `style={{}}`.
- **Tabele (M0.3) — ekrany:** Firmy bez pustej kolumny znacznika 32 px z makiety (nie miała funkcji). Zadania nie mają wiersza nagłówka (jak w makiecie); klient to osobna kolumna z samym logo (wcześniej szara nazwa przy tytule). Wiersze Zadań i Magazynu bez linii, Firmy i Osoby z liniami (DECISIONS). W Osobach kolumna Firma = logo + nazwa (jak makieta `osoby`), osoba kontaktowa ma logo bez karty podglądu (karta opisuje klienta, a kontakt nim nie jest). Kolorowe ikony nagłówków dobrane wg konwencji z `design/tools` (`u_th`), bo makiety Firm i Osób mają jeszcze szare ikony. Odstępy z makiety spoza siatki 4 px w przebudowanych ekranach zaokrąglone do siatki (6 → 4 lub 8, 10 → 8 lub 12, 22 px kapsułka → 24 px, kategorie 20 px zostają); przyciski z `ui/Button` (sm = 28 px).
- **Tabele (M0.3) — karta podglądu:** wyzwalacz to link do karty klienta (↵ otwiera, Esc zamyka kartę w fazie przechwytywania, więc nie zamyka panelu szczegółów), najechanie otwiera po 350 ms, fokus klawiatury od razu; przewinięcie lub zmiana rozmiaru okna zamyka kartę. Promień 14 px = `--radius-xl`; odstępy karty 10 px i 6 px (z `HC_CSS`) są w stałej `offGrid` z wyłączeniem reguły ESLint w `customer-logo.tsx`. Wiersze karty pokazują tylko dane z obecnych RPC: Firmy — branża (pierwsze 2 kategorie), miasto, opiekun, telefon, ostatni kontakt; **brak wiersza „Umowa”** (RPC `customer_directory` nie zwraca umowy); Zadania — tylko nazwa klienta (`my_crm_tasks` nie zwraca miasta, opiekuna, telefonu); Osoby (klient indywidualny) — opiekun, telefon, ostatni kontakt. Rozszerzenie RPC — osobny moduł.
- **Tabele (M0.3) — kolor marki:** w danych nie ma logo ani koloru firmy, więc kolor = skrót nazwy (FNV-1a) → token `--ic-*`. Kontrast inicjałów sprawdzony w obu motywach: biel spełnia 4,5:1 tylko na `--ic-indigo` (jasny), ciemny tekst — na teal, orange, green, yellow, slate (jasny) i na wszystkich tokenach w ciemnym (`--on-accent` #0F0F0E). Dla blue, violet, red i pink żaden wariant nie daje 4,5:1 w jasnym motywie (4,0–4,4) — **te kolory są wyłączone**, paleta logo ma 6 kolorów (`src/lib/table/brand.ts`). Inicjały w logo 20 px mają 11 px (`--text-micro`), w makiecie 9 px (brak tokenu).
- **Tabele (M0.3) — kolory etykiet i kategorii:** kropki etykiet zadań i tła kategorii firm (tint 16 %) w przebudowanych ekranach używają tokenów `--ic-*` zamiast wartości rgb z `labels.ts` / `category-colors.ts` (zmieniają się z motywem; odcienie minimalnie inne). Popover filtrów firm (`customer-filters.tsx`), kategorie osób (`person-categories.tsx`) i Opcje widoku (`collection-view.tsx`) zostają na stylach wpisanych — przejdą z silnikiem widoku kolekcji (M0.4).
- **Tabele (M0.3) — semantyka:** wszystkie cztery tabele mają `role="table"` → `row` → `columnheader`/`cell`; grupy to `rowgroup` z wierszem-paskiem (jedna komórka z `aria-colspan`). Zaznaczony wiersz niesie `aria-current` na linku tytułu (`aria-selected` wolno tylko w `grid`). Obszar przewijania ma `tabindex="0"` i etykietę z podpowiedzią ← / →. Panel szczegółów przechodzi w nakładkę poniżej 1100 px przez nowy próg `max-panel:` w `@theme` (zastępuje regułę `.dk .tl-panel` z `precision.css`, usuniętą). Klasa `dk` na `<main>` zostaje jako zaczepienie (wyłącza reguły `!important` dla nagłówków z `precision.css`). Dodany utility `scrollbar-thin` w `tailwind.css`.
- **Rama — poprawka:** zwinięta grupa menu bocznego chowa pozycje (wcześniej `display: flex` z `precision.css` wygrywał z atrybutem `hidden` i pozycje zostawały widoczne). Obrót strzałki grupy trwa 120 ms (`--dur-fast`) zamiast 160 ms (brak tokenu).
- **Motyw ciemny:** nowe ekrany nie są jeszcze sprawdzone w ciemnym motywie.
- **Skróty kart:** przeglądarki zastrzegają ⌘T i ⌘1–9 dla własnych kart, więc w przeglądarce działają ⌥T i ⌥1–9; ⌘ działa tam, gdzie przeglądarka go przepuszcza (np. aplikacja zainstalowana jako okno).
- **„Uzupełnij braki”:** dokument MM ma jedno miejsce docelowe, więc powstaje jedno MM na każdy bus z brakami (jedna akcja, kilka dokumentów).
- **„+” w kolumnie tablicy zadań:** zadanie zawsze należy do firmy, więc „+” prowadzi do listy firm; zadanie dodaje się na karcie firmy.
- **Minimum na bus:** ustawiane dwuklikiem w komórce macierzy „W samochodach” (makieta nie pokazuje, gdzie się je edytuje).
- **Filtry widoku Zadań** działają na wczytanej stronie listy (20 zadań); grupowanie i sortowanie też.

## Pytania do projektu

- **Kategorie osób kontaktowych:** makiety nie pokazują, gdzie się je edytuje; teraz w komórce tabeli Osoby.
- **M0.3 · logo i kolor marki jako dane firmy** (do założenia w Linear: „kod → projekt”): DECISIONS 2026-11-21 mówi o polu „Kolor logo” w karcie firmy (domyślnie z palety 10 kolorów) i o wgranym logo — w danych nie ma ani jednego, ani drugiego. Kod liczy kolor z nazwy i używa 6 z 10 tokenów `--ic-*` (pozostałe 4 nie dają kontrastu 4,5:1 dla inicjałów). Czy paleta „Kolor logo” ma mieć własne tokeny z kontrastem dla białych inicjałów (makieta używa surowych hexów, np. #0E7C86)? Gdzie wgrywa się logo (profil firmy-klienta) i czy kolor wybiera biuro?
- **M0.3 · karta podglądu — brakujące dane:** umowa (numer i termin), branża jako osobne pole (dziś kod pokazuje pierwsze 2 kategorie) oraz dane klienta w Zadaniach (miasto, opiekun, telefon) wymagają rozszerzenia RPC (`customer_directory`, `my_crm_tasks`) — osobny moduł bazy.
- **M0.3 · odstępy karty podglądu:** `HC_CSS` ma gap 10 px i wiersze co 6 px (poza siatką 4 px) — kod trzyma je 1:1 (`offGrid` w `customer-logo.tsx`). Zaokrąglić do 8 / 4 px albo 12 / 8 px?
- **M0.3 · próg panelu 1100 px** (`max-panel:`) nie ma tokenu w `tokens.css` — dopisać obok progu telefonu?
- **M0.2 · wartości ramy spoza siatki 4 px i tokenów** (do założenia w Linear: „kod → projekt”): górny pasek ma odstęp kart 2 px, margines po kartach przypiętych 6 px, w karcie odstęp 6 px i poziomo 10 px, licznik powiadomień 14 px z odstępem 2 px od rogu, wypełnieniem 3 px i tekstem 10 px, inicjały awatara 10 px, pozycje menu co 1 px; pole szukania listy ma odstęp ikony 6 px, nagłówek listy na telefonie 6 px w pionie. Na siatce 4 px i w skali tekstu z `tokens.css` tych wartości nie ma. Propozycja: 2 → 4 (albo 0), 6 → 8 (albo 4), 10 → 8 lub 12, 1 → 0, tekst 10 → `--text-micro` (11 px). Do decyzji kod trzyma wartości 1:1 (`offGrid` w `app-shell.tsx` i `list-layout.tsx`).
- **M0.2 · dodatki spoza `tokens.css`** (w `precision.css`): `--accent-hover` (#5460C6 / #8A92E6), `--info-fg`, `--success-fg`, `--warning-fg`, `--danger-fg` (jasny motyw: osobne ciemniejsze odcienie, ciemny: kolory statusów) i mieszanki `color-mix` (`--*-bg`, `--accent-soft`, `--accent-line`). Czy dopisać je do `tokens.css`? Do tego czasu przycisk główny w `ui/Button` ma najechanie `bg-accent/90` zamiast `--accent-hover`.
- **M0.2 · font w `tokens.css`:** `--font-sans: "Geist", …` — `next/font` ładuje krój pod własną nazwą w `--font-geist`, więc kod nadpisuje to w `tailwind.css` (`var(--font-geist), "Geist", …`). Propozycja dla `tokens.css`: `var(--font-geist, "Geist"), system-ui, sans-serif` (tak samo mono).
- **M0.2 · brakujące tokeny:** próg telefonu (dotąd 760 px w CSS; w `@theme` jako `--breakpoint-desktop: 761px`, wariant `max-desktop:`), wagi 400 / 500 / 600, `letter-spacing` nagłówków (−0,01 em) i wysokość linii (20 px) — w `@theme` wpisane z zasad Precision UI. Pole na telefonie w starych ekranach ma tekst 16 px (iOS powiększa stronę przy mniejszym), a w skali tokenów nie ma 16 px — `ui/Input` ma 13 px. Dodać `--text-input-mobile` albo podobny?
- **M0.2 · kolory stałe:** dodać do `tokens.css` kolory etykiet zadań (Zakupy #E0702A, Oferty #7C85E0, F-gaz #2BB3B1, Klienci / Umowy #4EA7E8, Gwarancje #A87BEA, szare #8A8F98), dwa brakujące kolory osób (#D6453D, #2F9E5B) i biel na kolorze osoby — stałe w obu motywach, jak `--person-*`?
- **M0.2 · pola:** komentarz w `tokens.css` mówi, że `--bg-subtle` to wypełnienie pól, skill Precision UI — że pola i karty mają `bg-raised`. `ui/Input` ma `bg-subtle` (jak `tokens.css` i obecne ekrany). Które obowiązuje?

Rozstrzygnięte przez właściciela 2026-11-22:
- Style: Tailwind v4 na tokenach z `tokens.css`, wprowadzany stopniowo (domyślne skale wyłączone, bez wartości dowolnych); zgoda na `tailwindcss`, `@tailwindcss/postcss` i `@phosphor-icons/react` (ikony Phosphor — zrobione w M0.2). Komentarz w `tokens.css` o `theme.extend` (Tailwind v3) poprawiony po stronie projektu w **KRA-67** (teraz: blok `@theme`).
- Migracja wielofirmowości (D2): zaakceptowana z góry pod warunkami z `docs/PLAN.md` › M0.1.
- Zadania w Linear: Claude Code ustawia In Review, Done ustawia scalenie PR; etykiety „projekt → kod” i „kod → projekt” (`docs/PLAN.md` › Współpraca z czatem projektowym).

Rozstrzygnięte przez właściciela 2026-11-20:
- J = poprzednia, K = następna firma (zgodnie z `screens/04-klienci.md`).
- Ikona „Do sprawdzenia” zostaje jak w makiecie (pełne zielone kółko).
- Minimum na bus ustawiane dwuklikiem w komórce „W samochodach” zostaje.

## Dziennik

- 2026-11-24 — M0.3 (KRA-63): tabele w jednej linii — `src/components/table/` i `src/lib/table/`, Firmy, Osoby, Zadania i Magazyn na wspólnej tabeli (Tailwind), logo z kartą podglądu w portalu, przypięte kolumny i ←/→; testy `tests/table-logic.test.ts`.
- 2026-11-23 — M0.2 (KRA-26): Tailwind v4 na tokenach (`src/app/tailwind.css`, `postcss.config.mjs`), jedna lista zmiennych w `tokens.css`, ikony Phosphor, wspólne elementy `src/components/ui/`, rama i układ list w Tailwindzie, reguła ESLint `avero/tailwind-tokens` (`eslint-rules/`); testy: kompilacja `@theme`, reguła ESLint, klasy elementów i ramy.
- 2026-11-22 — tabela modułów w `docs/PLAN.md` generowana z Linear (`scripts/linear-plan-sync.mjs`, workflow „Linear → plan”, sekret `LINEAR_API_KEY`); CI można uruchomić ręcznie (`workflow_dispatch`).
- 2026-11-22 — CI (GitHub Actions: Aplikacja, Baza danych) i ochrona `main`; gałąź i PR na moduł (`kra-…`). Lint pomija `design/**`.
- 2026-11-22 — plan wdrożenia makiet: `docs/PLAN.md` (29 modułów w 4 fazach, powiązanych z Linear); do decyzji właściciela: D2 (migracja wielofirmowości).
- 2026-11-22 — decyzja właściciela D1: Tailwind v4 na tokenach, wprowadzany stopniowo (M0.2 / KRA-26).
- 2026-11-20 — 9 poprawek zgodności z rozmową projektową (statusy, zadania, magazyn, firmy, osoby, karta firmy, skróty, silnik widoku).
- 2026-11-20 — repozytorium projektu połączone z kodem (merge `Yamal7/avero` do gałęzi `redesign-precision-ui`); uzupełniono stan implementacji.
- 2026-11-20 — utworzono plik (szablon z czatu projektowego).
