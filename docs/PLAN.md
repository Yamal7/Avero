# Plan wdrożenia makiet — dla Claude Code

Stan: 22 lis 2026. Prowadzi właściciel; Claude Code odhacza moduły i dopisuje wnioski do `docs/STATUS.md`.
Każdy moduł ma zadanie w Linear (zespół **Kranz_**, projekty „Interfejs Precision UI — wdrożenie makiet” i „Architektura wielofirmowa i pakiety branżowe”). Ten plik ustala **kolejność, zależności i kryteria odbioru**; szczegóły ekranów są w `docs/design/screens/`.

## Jak pracować z tym planem

Polecenie na start (przykład):

> Zrealizuj fazę 1 z `docs/PLAN.md` po kolei, bez pytania o zgodę między modułami. Trzymaj się „Pętli modułu” i „Warunków zatrzymania”.

### Pętla modułu

Dla każdego modułu, w kolejności z tabeli:

1. Sprawdź zależności — moduły z „Zależy od” muszą być **scalone na `main`**. Jeśli nie są, weź następny moduł bez blokad albo poczekaj na scalenie (`gh pr checks <nr> --watch`).
2. Gałąź z aktualnego `main` o nazwie z numerem zadania: `kra-34-m1-3-karta-urzadzenia` (małe litery). Numer w nazwie gałęzi łączy ją z zadaniem w Linear.
3. Uruchom **osobnego subagenta** na moduł (świeży kontekst). Przekaż mu: numer modułu, zadanie Linear, pliki źródłowe i kryteria odbioru z tego planu. Główna sesja tylko koordynuje.
4. Subagent: czyta źródła (`HANDOFF.md`, `LAYERS.md`, `DECISIONS.md`, opis ekranu, makieta), ładuje skill `precision-ui`, pisze najpierw testy logiki, potem kod.
5. Weryfikacja lokalna: `pnpm lint && pnpm typecheck && pnpm test`; przy SQL także `pnpm db:lint && pnpm db:test`; ekran otwarty i sprawdzony w obu motywach.
6. Agent `reviewer` przegląda zmiany; błędy z grupy „Błędy” poprawić przed commitem.
7. Commity z numerem zadania (`KRA-34 M1.3 Karta urządzenia: …`), odhaczenie `[x]` w tabeli poniżej i wpis w `docs/STATUS.md` w tej samej gałęzi.
8. **PR na moduł** do `main`: tytuł `KRA-34 M1.3 Karta urządzenia`, w opisie `Closes KRA-34`, podsumowanie, odstępstwa od makiet, wynik `reviewer`. Potem `gh pr merge --auto --squash <nr>` — PR scali się sam, gdy CI przejdzie.
9. CI czerwone → popraw na tej samej gałęzi (maks. 3 próby, potem warunek zatrzymania).

**PR do akceptacji właściciela** (bez `--auto`, z `[do akceptacji]` na początku tytułu): migracja zmieniająca istniejące dane, poszerzenie uprawnień, nowa zależność, zmiana spoza planu. Claude Code bierze wtedy kolejny moduł, który od tego PR nie zależy.

### CI i ochrona `main`

- **CI** (`.github/workflows/ci.yml`) na każdym PR: zadanie **„Aplikacja”** (lint, typy, testy, build) i **„Baza danych”** (wszystkie migracje na czystej bazie, lint SQL, pgTAP).
- **Ochrona `main`**: scalenie możliwe tylko, gdy oba zadania CI są zielone; zakaz force-push i usuwania gałęzi. Hooki Claude Code sprawdzają to samo wcześniej, w sesji — CI jest ostatecznym strażnikiem dla każdego PR, także z czatu projektowego.

### Statusy zadań w Linear

| Status | Kto ustawia | Kiedy |
|---|---|---|
| In Progress | **automatycznie** (integracja GitHub ↔ Linear) | pierwszy push gałęzi `kra-…` albo otwarcie PR |
| In Review | **automatycznie** | PR gotowy do przeglądu (jeśli tak ustawiono w Linear) |
| **Done** | **automatycznie** | scalenie PR z `Closes KRA-…` / gałęzią `kra-…` |
| Done (ręcznie) | Claude Code | tylko gdy PR jest scalony, a zadanie zostało otwarte (sprawdź na starcie sesji) |

Automatyczne przejścia ustawia się w Linear: Settings › Teams › Kranz_ › Workflow › Pull request automations. Claude Code ustawia status ręcznie tylko jako zapas, gdy automat nie zadziałał. **Nie zamyka** zadania jako Done przed scaleniem — Done oznacza „jest na `main`”. Zadania „kod → projekt” zamyka czat projektowy po poprawce w `docs/design/`.

### Współpraca z czatem projektowym

Dwie etykiety w Linear:

- **„projekt → kod”** — czat projektowy po zatwierdzeniu ekranu lub zmiany tworzy (albo aktualizuje) zadanie z kryteriami odbioru i dopisuje wiersz do tabeli modułów w tym pliku. Claude Code na starcie sesji sprawdza otwarte zadania z tą etykietą, które nie mają jeszcze wiersza w planie, i dopisuje je w odpowiedniej fazie.
- **„kod → projekt”** — Claude Code przy pytaniu, sprzeczności albo błędzie w `docs/design/` lub makiecie tworzy zadanie z tą etykietą (powiązane z zadaniem modułu), dopisuje pytanie w `docs/STATUS.md` z numerem zadania i **przechodzi do innego modułu bez blokad** — nie czeka na odpowiedź, chyba że pytanie blokuje wszystko (wtedy warunek zatrzymania).

### Zmiany planu

Kto zmienia (czat projektowy, Claude Code albo właściciel), zmienia **oba miejsca naraz** i dopisuje jedną linię w „Dzienniku planu”.

| Zmiana | Co zrobić |
|---|---|
| Nowa faza | Nowa sekcja i wiersze w tabeli modułów; nowy kamień milowy w Linear o tej samej nazwie. |
| Nowy moduł | Wiersz w tabeli + sekcja z kryteriami; zadanie „projekt → kod” z kamieniem milowym fazy. |
| Zmiana modułu **niezrobionego** | Poprawić kryteria tutaj i w zadaniu Linear. |
| Zmiana modułu **zrobionego** (jest na `main`) | Nowe zadanie „projekt → kod” powiązane ze starym (`related`) i nowy wiersz w planie, np. `M1.3b`. Starego zadania nie otwierać — historia ma się zgadzać z kodem. |
| Moduł niepotrzebny | Zadanie → Canceled z jednym zdaniem dlaczego; wiersz w planie przekreślony (`~~…~~`), nie usuwany. |

Przy rozbieżności: **zakres i kryteria odbioru — rozstrzyga Linear; kolejność i fazy — rozstrzyga ten plik.** Claude Code na starcie sesji porównuje zadania „projekt → kod” zmienione od ostatniego wpisu w dzienniku z planem i wyrównuje plan (osobny commit `Plan: …`).

### Warunki zatrzymania

Zatrzymaj się i zapytaj właściciela tylko, gdy:

- makieta lub opis ekranu są niejasne albo sprzeczne z `DECISIONS.md`,
- potrzebna jest **nowa zależność** (biblioteka),
- migracja **zmienia lub przenosi istniejące dane** (nie dotyczy nowych tabel),
- testy nie przechodzą po 3 próbach naprawy,
- zmiana dotyka uprawnień w sposób, który poszerza dostęp (klient, technik, inna firma).

Wszystko inne rozstrzygnij sam, wybierając rozwiązanie bezpieczniejsze i łatwiejsze do cofnięcia, i zapisz decyzję w `docs/STATUS.md` (sekcja „Odstępstwa od makiet” albo „Pytania do projektu”).

### Definicja ukończenia (każdy moduł)

- Lint, typy i testy przechodzą; nowa logika ma testy; nowe tabele mają RLS i test pgTAP, że **inna firma i klient portalu nie widzą** danych.
- Komponenty mają stany: domyślny, hover, aktywny, fokus, wyłączony, ładowanie (skeleton), pusty, błąd.
- Oba motywy; tylko tokeny (`var(--…)`); klawiatura zgodna z opisem ekranu.
- Rdzeń nie importuje pakietu HVACR (`LAYERS.md`); pojęcia F-gaz tylko z pakietu.
- Dane przykładowe z `docs/design/data-scenario.md`.
- `docs/STATUS.md` zaktualizowany; zadanie w Linear zaktualizowane.

## Decyzje właściciela przed startem

| # | Decyzja | Blokuje |
|---|---|---|
| D1 | ✅ **Rozstrzygnięte 2026-11-22: Tailwind v4, wprowadzany stopniowo** (zgoda na zależności `tailwindcss` i `@tailwindcss/postcss`). Szczegóły w M0.2. | — |
| D2 | ✅ **Zaakceptowane z góry 2026-11-22, pod warunkami** z M0.1 (lokalna baza, test liczności, organizacja „Kranz HVACR”, skrypt cofający, wgranie na Supabase „Avero” ręcznie przez właściciela). Plan spełniający warunki — bez zatrzymania; plan, który od nich odbiega — zatrzymanie. | — |

## Stan wyjściowy

Działa (szczegóły w `docs/STATUS.md`): rama aplikacji i skróty, Mój dzień (pierwsza wersja), Zadania (lista, tablica, panel, silnik widoku kolekcji), Firmy i Osoby (lista, filtry, karta firmy — przegląd), Magazyn (tabela, w samochodach, PZ/MM/RW/WZ), Planowanie (dzień, przeciąganie, mapa OSM), Zlecenie serwisowe, Kreator oferty (wygląd).

## Moduły

| | Moduł | Linear | Zależy od |
|---|---|---|---|
| **Faza 0 — Fundament** | | | |
| [ ] | M0.1 Wielofirmowość: organizacje, `org_id`, RLS | KRA-27 | — |
| [ ] | M0.2 Tailwind v4 na tokenach z `tokens.css`, ikony Phosphor | KRA-26 | — |
| [ ] | M0.3 Tabele w jednej linii, logo z kartą podglądu, przypięta kolumna | KRA-63 | M0.2 |
| [ ] | M0.4 Silnik widoku kolekcji w Magazynie, Firmach, Przeglądach | KRA-31 | M0.3 |
| [ ] | M0.5 Rejestr rozszerzeń i pakiet HVACR | KRA-29 | M0.1 |
| **Faza 1 — Serwis** | | | |
| [ ] | M1.1 Obiekty: lista i karta obiektu | KRA-48 | M0.4 |
| [ ] | M1.2 Karta firmy: pozostałe zakładki, lista Urządzeń | KRA-64 | M0.4, M1.1 |
| [ ] | M1.3 Karta urządzenia z F-gaz i CRO (pakiet) | KRA-34 | M0.5, M1.2 |
| [ ] | M1.4 RW czynnika aktualizuje ładunek urządzenia | KRA-35 | M1.3 |
| [ ] | M1.5 Szablony protokołów: edytor sekcji | KRA-65 | M0.2, M0.5 |
| [ ] | M1.6 Telefon technika: dzień, wizyta, protokół | KRA-36 | M1.3, M1.5 |
| [ ] | M1.7 Zgłoszenia: lista i podgląd | KRA-37 | M0.4 |
| [ ] | M1.8 Przeglądy i umowy serwisowe | KRA-41 | M1.3, M1.7 |
| **Faza 2 — Sprzedaż i realizacja** | | | |
| [ ] | M2.1 Katalog i import cennika | KRA-47 | M0.4 |
| [ ] | M2.2 Zakupy: zapotrzebowanie, zamówienia, dostawcy, cenniki | KRA-46 | M2.1 |
| [ ] | M2.3 Leady, Szanse, Oferty (nowy wygląd i logika) | KRA-45 | M2.1 |
| [ ] | M2.4 Widoki klienta i portal klienta | KRA-40 | M2.3 |
| [ ] | M2.5 Zlecenie montażu | KRA-38 | M2.3, M2.2 |
| [ ] | M2.6 Faktury i należności, faktura końcowa | KRA-39 | M2.5 |
| [ ] | M2.7 Projekty: lista, rekord, oś czasu | KRA-49 | M2.5 |
| [ ] | M2.8 Reklamacje i gwarancje | KRA-50 | M1.3, M2.2 |
| [ ] | M2.9 Mój dzień: kolejność sekcji, widżet Sprzedaż | KRA-66 | M1.7, M2.3 |
| **Faza 3 — Konfiguracja i raporty** | | | |
| [ ] | M3.1 Ustawienia: wszystkie zakładki | KRA-43 | M0.1 |
| [ ] | M3.2 Ustawienia › Moduły i pakiety | KRA-33 | M0.5, M3.1 |
| [ ] | M3.3 Wymagania rdzenia ze sprawdzianu (reszta) | KRA-28 | M1.5, M3.2 |
| [ ] | M3.4 Warstwa elastyczna: pola własne, własne tabele | KRA-30 | M0.1, M3.2 |
| [ ] | M3.5 Raporty | KRA-42 | M2.6 |
| [ ] | M3.6 Skrzynka (najpierw portal i formularz, poczta po KRA-58) | KRA-44 | M1.7 |
| [ ] | M3.7 Audyt motywu ciemnego na wszystkich ekranach | KRA-32 | wszystkie |

Poza tym planem: zadania czatu projektowego (KRA-53, KRA-54, KRA-55) i pilotaż (projekt „Pilotaż i wdrożenie”, KRA-51–62).

---

## Faza 0 — Fundament

Bez tej fazy każdy kolejny moduł trzeba by potem przerabiać: nowe tabele bez `org_id`, kolory poza tokenami, pojęcia F-gaz w rdzeniu.

### M0.1 Wielofirmowość — KRA-27
Źródła: `DECISIONS.md` 2026-11-20 „Kierunek produktu”, `LAYERS.md` › Zasady dla kodu, `docs/PRODUCT_PLAN.md` (ryzyko „Wiele niezależnych firm”).
**Najpierw plan migracji w trybie planowania.** Właściciel zaakceptował go z góry (D2), jeśli spełnia **wszystkie** warunki:
1. migracja tworzona i testowana wyłącznie na lokalnej bazie (`pnpm db:reset`, `pnpm db:test`);
2. test liczności przed i po migracji — żaden rekord nie ginie;
3. każdy istniejący rekord trafia do organizacji „Kranz HVACR”;
4. dołączony skrypt cofający (osobny plik, opisany w PR) i sprawdzony lokalnie;
5. **nic nie jest wgrywane na projekt Supabase „Avero”** — robi to właściciel ręcznie po scaleniu PR (instrukcja w opisie PR).

Plan spełnia warunki → zapisz go w opisie PR i działaj dalej. Plan musi od któregoś odejść → zatrzymaj się i zapytaj.
- [ ] Tabele organizacji i członkostw; `org_id` w każdej tabeli danych; RPC filtrują po organizacji bieżącego użytkownika.
- [ ] Obecne dane przeniesione do organizacji „Kranz HVACR”; nic nie ginie (test liczności przed / po).
- [ ] pgTAP: użytkownik firmy A nie odczyta ani nie zmieni danych firmy B w żadnej tabeli i RPC; klient portalu widzi tylko swoje.
- [ ] Numeracje dokumentów, profil firmy, NIP i konto — per organizacja, z Ustawień.
- [ ] Przełącznik firmy w ramie przełącza organizację (gdy użytkownik należy do kilku).
- [ ] Pełna regresja (`pnpm test`, `pnpm db:test`) przechodzi.

### M0.2 Tailwind v4 na tokenach, Phosphor — KRA-26
Źródła: `docs/design/tokens.css`, skill `precision-ui`, `DECISIONS.md` (ikony Phosphor zatwierdzone), `STATUS.md` › Odstępstwa (tokeny).
Decyzja D1: **Tailwind v4, stopniowo**. Zależności zatwierdzone: `tailwindcss`, `@tailwindcss/postcss`, `@phosphor-icons/react`. Geist i Geist Mono już są (`next/font/google` w `src/app/layout.tsx`).
- [ ] Tailwind v4 przez PostCSS; konfiguracja w CSS blokiem `@theme` (nie `tailwind.config.js` / `theme.extend` — to zapis z v3, komentarz w `tokens.css` jest nieaktualny, zgłosić w „Pytaniach do projektu”).
- [ ] **Tylko tokeny:** domyślne skale Tailwinda wyłączone (`--color-*: initial`, tak samo promienie, cienie, odstępy spoza siatki 4 px), a w `@theme` wyłącznie wartości z `tokens.css`. Klasa typu `bg-indigo-500` nie generuje stylu.
- [ ] Motyw ciemny przez `[data-theme="dark"]` (wariant `dark` zmapowany na ten atrybut), bez drugiego zestawu klas.
- [ ] `precision.css` i `tokens.css` mają jedną listę zmiennych (bez rozjazdu wartości); stare klasy działają dalej.
- [ ] **Bez rozbijania obecnych ekranów:** reset stylów Tailwinda (preflight) nie zmienia wyglądu istniejących ekranów — warstwy CSS ułożone tak, by `globals.css` / `precision.css` wygrywały tam, gdzie trzeba (zrzuty przed / po w PR).
- [ ] Wspólne elementy przeniesione na Tailwind: rama aplikacji, przyciski, pola, kapsułki, wiersz tabeli (pod M0.3). Pozostałe ekrany przechodzą na Tailwind **przy okazji swojego modułu**, nie wszystkie naraz; style wpisane w komponenty (`style={{…}}`) usuwane przy tej samej okazji.
- [ ] Ikony `@phosphor-icons/react` (Regular) zamiast `design-icons.tsx`.
- [ ] ESLint zgłasza klasy Tailwinda z dowolną wartością (`w-[13px]`, `text-[#fff]`) w `src/components` i `src/app`; hook `after-edit` nadal zgłasza surowe kolory.
- [ ] Opis zasad w `CLAUDE.md` › Stos technologiczny: nowe komponenty tylko w Tailwindzie, bez nowych klas w `precision.css`.

Reguła dla kolejnych modułów: moduł, który przebudowuje ekran, przenosi go na Tailwind i usuwa jego martwe reguły z `precision.css`.

### M0.3 Tabele w jednej linii — KRA-63
Źródła: `DECISIONS.md` 2026-11-21 i 2026-11-22, `design/tools/ui1.py`, `design/tools/tabele_przewijane.py`.
- [ ] Wiersz 36 px (`--row-h`), jedna linia; numer mono w kolumnie „Nr”.
- [ ] Firma jako logo 20 px (kwadrat r6 = firma, koło = osoba), inicjały na kolorze marki, karta podglądu 280 px w portalu (najechanie i fokus).
- [ ] Kolorowe ikony nagłówków i rodzaju prac z `--ic-*`; tekst szary.
- [ ] Przewijanie w poziomie z przypiętymi kolumnami do głównej, cienka linia `--edge`, ← / → o kolumnę.
- [ ] Zastosowane w Firmach, Osobach, Zadaniach, Magazynie.

### M0.4 Silnik widoku kolekcji — KRA-31
Źródła: `screens/02-zadania.md`, `screens/03-magazyn.md`, `screens/04-klienci.md`, `screens/11-przeglady-umowy.md`.
- [ ] Magazyn i Firmy na wspólnym silniku (grupowanie, sortowanie, kolumny, filtry, zapisane widoki, J/K/X); Przeglądy gotowe do podpięcia w M1.8.
- [ ] Filtry i sortowanie po stronie serwera (dziś działają tylko na wczytanej stronie — `STATUS.md`).
- [ ] Pusty stan i skeleton; telefon bez poziomego przewijania strony.

### M0.5 Rejestr rozszerzeń i pakiet HVACR — KRA-29
Źródła: `LAYERS.md` (całość), `DECISIONS.md` 2026-11-21 „Warstwy”.
- [ ] Rejestr punktów rozszerzeń: typy rekordów, sekcje, kolumny, reguły, szablony, widżety, słownik, uprawnienia.
- [ ] Pakiet HVACR włączany per organizacja; dane pakietu w tabelach z prefiksem, z `org_id` i RLS.
- [ ] Istniejące elementy F-gaz (magazyn czynnika, blokada GWP, sekcja F-gaz) wpięte przez rejestr, nie importowane przez rdzeń.
- [ ] Wyłączenie pakietu ukrywa, nie usuwa; ponowne włączenie przywraca (test).
- [ ] „Busy” → „Pojazdy” w tekstach rdzenia.

## Faza 1 — Serwis

### M1.1 Obiekty — KRA-48
Źródła: `screens/19-obiekty.md`, `Obiekty.dc.html`, `Obiekt.dc.html` (+ ciemne).
- [ ] Lista obiektów na silniku kolekcji; kolumna t CO₂e tylko z pakietem.
- [ ] Karta obiektu OB-… z urządzeniami, zleceniami, kontaktami, zgodnie z makietą.

### M1.2 Karta firmy i Urządzenia — KRA-64
Źródła: `screens/04-klienci.md`, `Firma.dc.html`, `Firma-urzadzenia.dc.html`.
- [ ] Zakładki: Obiekty, Urządzenia, Zlecenia, Umowy, Aktywność; Historia F-gaz z pakietu (M1.3).
- [ ] Przegląd: alert o wygasającej umowie, 4 fakty, otwarte sprawy.
- [ ] Lista Urządzeń: szukanie po nr / modelu / SN, filtr typu, grupy wg obiektów, stan Sprawne / Awaria / Wyłączone.
- [ ] J / K działa na każdej zakładce.

### M1.3 Karta urządzenia z F-gaz i CRO — KRA-34
Źródła: `screens/04-klienci.md` (Urządzenia, Historia F-gaz), `Urzadzenie-nowa.dc.html`, `Firma-fgaz-nowa.dc.html`, `LAYERS.md` (pakiet HVACR).
- [ ] Nagłówek ogólny (rdzeń); sekcja „Czynnik i F-gaz” z pakietu.
- [ ] Częstotliwość kontroli z t CO₂e: 5–50 t co 12 mies., 50–500 t co 6, ≥ 500 t co 3; system wykrywania wycieków wydłuża; < 5 t lub czynnik naturalny = „nie dotyczy” (testy graniczne 4,99 / 5 / 50 / 500 t).
- [ ] Pola zablokowane (czynnik, ładunek, częstotliwość) zmienia tylko dokument; próba zmiany poza dokumentem odrzucona przez serwer.
- [ ] Parametry pracy z normą (przed / po naprawie), historia serwisu z dokumentami, wpisy CRO ze statusem.
- [ ] Klient nie widzi zdjęć wewnętrznych ani cen zakupu.

### M1.4 RW czynnika → ładunek — KRA-35
Źródła: `screens/03-magazyn.md` (Wydanie RW), `Magazyn-wydanie.dc.html`.
- [ ] Ilość z ważenia butli (masa przed − po) trafia do karty urządzenia i dziennika F-gaz z CO₂e.
- [ ] Podgląd skutków przed zatwierdzeniem: stan magazynu, karta urządzenia, F-gaz/CRO, koszt na zleceniu.
- [ ] Blokada GWP > 2500 (świeży) w serwisie; regenerowany dozwolony do 2029 (testy dat).
- [ ] Korekta RW koryguje ładunek (test).

### M1.5 Szablony protokołów — KRA-65
Źródła: `screens/05-protokoly.md`, `screens/25-sprawdzian-rdzenia.md`, `Szablony.dc.html`.
- [ ] Biblioteka sekcji, wymagane / opcjonalne, warunki wyświetlenia, normy z karty urządzenia.
- [ ] Tabela pomiarów z wartościami granicznymi i oceną (wymóg rdzenia KRA-28).
- [ ] Trzy szablony z makiety odtworzone na danych; sekcje Czynnik / F-gaz tylko z pakietem.

### M1.6 Telefon technika — KRA-36
Źródła: `screens/05-protokoly.md` (Telefon technika), `Technik.dc.html`, `Technik-montaz.dc.html`, `Technik-pompa.dc.html`, `Technik-wyciek.dc.html`.
- [ ] 390 px, jedna kolumna, pola 44 px, bez poziomego przewijania.
- [ ] Pomiary z kapsułką normy i ostrzeżeniem poza normą; „Zakończ” aktywny po wymaganych sekcjach.
- [ ] Offline: zapis lokalny i ponowienie bez duplikatów (test idempotencji).
- [ ] Po zakończeniu: karta urządzenia utworzona lub zaktualizowana; czynnik zapisany przez RW (M1.4).
- [ ] Technik widzi tylko swoje wizyty (test ról); kody do drzwi i alarmów nie są przechowywane.

### M1.7 Zgłoszenia — KRA-37
Źródła: `screens/14-zgloszenia-skrzynka.md` (Zgłoszenia), `Zgloszenia.dc.html`.
- [ ] Widoki Otwarte / Bez technika / Z umów / Zamknięte z licznikami; tabela grupowana po statusie.
- [ ] SLA z umowy: odliczanie, pełne godziny w podpowiedzi.
- [ ] Podgląd 360 px ze ścieżką statusu i propozycją technika (z przypisaniem do klienta); „Przydziel i zaplanuj” tworzy wizytę w czasie warszawskim.
- [ ] Klawiatura: J/K, ↵, X, A, P, C.

### M1.8 Przeglądy i umowy — KRA-41
Źródła: `screens/11-przeglady-umowy.md`, `Przeglady.dc.html`, `Umowa-serwisowa.dc.html`, `Klient-przeglad-termin.dc.html`.
- [ ] Rdzeń: przeglądy okresowe z umów i gwarancji, częstotliwość ustawiana przez firmę; pakiet dokłada typ „kontrola szczelności” i widok F-gaz.
- [ ] Zaznaczenie wielu → „Poproś o termin” (SMS tylko po potwierdzeniu) i „Zaplanuj w trasie”.
- [ ] Umowa UM-…: harmonogram 12 mies., rozliczenie ryczałtu, decyzja o odnowieniu z waloryzacją.
- [ ] Klient wybiera termin z linku; wybór trafia do Planowania.

## Faza 2 — Sprzedaż i realizacja

### M2.1 Katalog i import cennika — KRA-47
Źródła: `screens/17-katalog.md`, `Katalog.dc.html`, `Import-cennika.dc.html`, `docs/CATALOG.md`.
- [ ] Kategorie, kod, jednostka, koszt i cena netto, VAT pozycji, archiwum zamiast kasowania; marża = (cena − koszt) / cena.
- [ ] Import cennika z podglądem zmian i potwierdzeniem; technik i klient nie widzą cen zakupu.

### M2.2 Zakupy, dostawcy, cenniki — KRA-46
Źródła: `screens/16-zakupy.md`, `screens/21-dostawcy-cenniki.md`, `Zakupy.dc.html`, `Zamowienie-zakupowe.dc.html`, `Dostawcy.dc.html`, `Cenniki.dc.html`.
- [ ] Zapotrzebowanie: do zamówienia = potrzeby + minima − dostępne − w drodze (testy); grupy po najlepszym dostawcy, próg darmowej dostawy.
- [ ] Zamówienie ZK/…: ścieżka statusu, przyjęcie dostawy tworzy PZ; urządzenie wymaga numeru seryjnego.
- [ ] Wysłanie zamówienia do dostawcy tylko po potwierdzeniu.

### M2.3 Leady, Szanse, Oferty — KRA-45
Źródła: `screens/15-leady-szanse.md`, `screens/08-oferty.md`, `Leady.dc.html`, `Szanse.dc.html`, `Szansa.dc.html`, `Oferta*.dc.html`.
- [ ] Leady: widoki, podgląd, „Zakwalifikuj i umów oględziny” tworzy szansę, oględziny i opiekuna; „Odrzuć” wymaga powodu.
- [ ] Szanse: tablica etapów z sumami i ważoną wartością; reguły przejść (Oferta wymaga oferty, Wygrana — akceptacji, Przegrana — powodu).
- [ ] Kreator oferty: logika kroków 3–5 (warianty, pozycje z dostępnością, marża z progiem 22 %, warunki, wysyłka); parametry pompy ciepła z pakietu.
- [ ] Wysyłka oferty do klienta tylko po potwierdzeniu.

### M2.4 Widoki klienta i portal — KRA-40
Źródła: `screens/08-oferty.md` (Widok klienta, Akceptacja), `screens/24-portal-klienta.md`, `Klient-*.dc.html`.
- [ ] Oferta pod linkiem: ceny brutto, **bez cen zakupu, marży, dostępności i zdjęć wewnętrznych** (test na odpowiedzi API, nie tylko na UI).
- [ ] Akceptacja: podpis, zgoda na montaż przed 14 dniami (gdy dotyczy), zaliczka (P24 w trybie testowym), potwierdzenie.
- [ ] Portal klienta zgodny z makietą; link wygasa zgodnie z ustawieniem.

### M2.5 Zlecenie montażu — KRA-38
Źródła: `screens/09-zlecenie-montazu.md`, `Zlecenie-montaz.dc.html`.
- [ ] Powstaje automatycznie z zaakceptowanej oferty (test przepływu oferta → zlecenie).
- [ ] Gotowość do montażu N z 6, plan prac na dni, materiały ze źródłem i stanem; RW przy załadunku busa.

### M2.6 Faktury i należności — KRA-39
Źródła: `screens/10-faktura.md`, `screens/23-faktury-naleznosci.md`, `Faktura-koncowa.dc.html`, `Faktury-*.dc.html`.
- [ ] Do wystawienia, wszystkie (stan KSeF), zaliczki, należności z wiekowaniem.
- [ ] Faktura końcowa: rozliczenie zaliczki z osobnym pomniejszeniem netto i VAT (art. 106f ust. 3) — testy kwot.
- [ ] Konto zamaskowane; NIP i konto z Ustawień; token KSeF tylko jako zmienna środowiskowa.
- [ ] Przypomnienia o należnościach tylko po potwierdzeniu.

### M2.7 Projekty — KRA-49
Źródła: `screens/20-projekty.md`, `Projekty.dc.html`, `Projekty-os.dc.html`, `Projekt.dc.html`.
- [ ] Lista, oś czasu, rekord projektu z etapami; szablony etapów (rdzeń), szablon „Montaż VRV” z pakietu.
- [ ] Etap gotowy do rozliczenia pojawia się w „Faktury do wystawienia”.

### M2.8 Reklamacje i gwarancje — KRA-50
Źródła: `screens/22-reklamacje.md`, `Reklamacje*.dc.html`, `Reklamacja.dc.html`.
- [ ] Od klientów, do dostawców, gwarancje kończące się; rekord RK-… ze ścieżką statusu.

### M2.9 Mój dzień — porządki — KRA-66
Źródła: `screens/01-moj-dzien.md`, `DECISIONS.md` 2026-11-21.
- [ ] Kolejność sekcji: Zagrożone SLA → Wizyty → Bez technika → Skrzynka → Leady → Po terminie → Wzmianki; licznik „Sprawy: N”.
- [ ] Widżet Sprzedaż; sekcje pakietu znikają bez pakietu.

## Faza 3 — Konfiguracja i raporty

### M3.1 Ustawienia — KRA-43
Źródła: `screens/13-ustawienia.md`, `Ustawienia-*.dc.html`, `docs/COMPANY_PROFILE.md`, `docs/ACCESS_MANAGEMENT.md`.
- [ ] Wszystkie zakładki z makiety; zapis z kontrolą wersji (konflikt jak w COMPANY_PROFILE); ⌘S.
- [ ] Ostatniego administratora nie da się zablokować ani zdegradować (test).
- [ ] Macierz uprawnień ról zgodna z ACCESS_MANAGEMENT; egzekwowana przez serwer.

### M3.2 Moduły i pakiety — KRA-33
Źródła: `screens/13-ustawienia.md` (Moduły i pakiety), `Ustawienia-moduly.dc.html`, `LAYERS.md`.
- [ ] Włączanie modułów i pakietów per organizacja; moduły wymagane przez aktywny pakiet nie dają się wyłączyć.
- [ ] Wyłączenie pakietu z obowiązkami prawnymi wymaga potwierdzenia z ostrzeżeniem.

### M3.3 Wymagania rdzenia ze sprawdzianu — KRA-28
Źródła: `screens/25-sprawdzian-rdzenia.md`, `Sprawdzian-*.dc.html`.
- [ ] Własne typy urządzeń z polami; zalecenie z protokołu → szkic oferty; pola użytkownika z datą ważności; dowolne jednostki w magazynie.
- [ ] Organizacja testowa „Volt-Serwis” bez pakietu przechodzi przebieg: Mój dzień → urządzenie → zlecenie → protokół, bez słów branżowych HVACR.

### M3.4 Warstwa elastyczna — KRA-30
Źródła: `screens/18-wlasne-tabele.md`, `Tabela-*.dc.html`, `Ustawienia-pola-wlasne.dc.html`, `DECISIONS.md` 2026-11-20 „Warstwa elastyczna”.
Duży moduł — podziel na kroki z osobnymi commitami: pola własne → własne tabele → widoki → panel boczny z sekcji → import → akcje → uprawnienia.
- [ ] Definicje tabel, pól, widoków i układów per organizacja; wartości walidowane według definicji.
- [ ] Pola własne nie nadpisują pól rdzenia ani pakietu; typu pola nie zmienia się po zapisaniu danych.
- [ ] Akcje działają z uprawnieniami klikającego, nie usuwają danych i nie piszą do klientów bez potwierdzenia.
- [ ] Wyjątki uprawnień per pole obowiązują też w eksporcie i API (test).

### M3.5 Raporty — KRA-42
Źródła: `screens/12-raporty.md`, `Raporty.dc.html`, `Raport-przetargi.dc.html`.
- [ ] Przegląd miesiąca: 4 fakty, przychód wg rodzaju prac, marża z progiem 22 %, należności, technicy; widok tabeli dla każdego wykresu.
- [ ] Kwoty zgodne z modułami źródłowymi (test sum); zakładka F-gaz z pakietu; raporty z własnych tabel.

### M3.6 Skrzynka — KRA-44
Źródła: `screens/14-zgloszenia-skrzynka.md` (Skrzynka), `Skrzynka.dc.html`, `DECISIONS.md` (poczta, Gmail przez przekierowanie).
- [ ] Trzy kolumny, widoki, kanały; wiadomości z portalu i formularza działają bez integracji poczty.
- [ ] Utworzenie zgłoszenia lub leada z wiadomości; odpowiedź do klienta tylko po potwierdzeniu.
- [ ] Poczta e-mail podłączana po KRA-58 (projekt Pilotaż) — do tego czasu zatrzymaj się na tej części.

### M3.7 Audyt motywu ciemnego — KRA-32
- [ ] Każdy ekran porównany z planszą „-ciemny”; kontrast tekstu i ikon zgodny z WCAG AA.

---

## Dziennik planu

- 2026-11-22 — pierwsza wersja planu: 29 modułów w 4 fazach, powiązanych z zadaniami w Linear (nowe: KRA-63, KRA-64, KRA-65, KRA-66).
- 2026-11-22 — D1 rozstrzygnięta: Tailwind v4 na tokenach, stopniowo (M0.2 przepisane).
- 2026-11-22 — D2 zaakceptowana z góry pod warunkami (M0.1); statusy zadań w Linear i współpraca z czatem projektowym przez etykiety „projekt → kod” / „kod → projekt”.
- 2026-11-22 — sekcja „Zmiany planu”: nowe fazy i moduły, zmiany modułów zrobionych i niezrobionych, rozstrzyganie rozbieżności między planem a Linear.
- 2026-11-22 — CI w GitHub Actions i ochrona `main`; gałąź i PR na moduł z numerem KRA (zamiast gałęzi na fazę), scalanie automatyczne po zielonym CI, statusy w Linear przesuwa integracja.
