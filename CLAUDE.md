# Avero

Program FSM / CRM / ERP dla firmy HVACR (serwis i montaż chłodnictwa, klimatyzacji, pomp ciepła; obowiązki F-gaz / CRO). Język interfejsu i komunikacji: **polski**.

Interfejs jest projektowany w osobnym czacie Claude (makiety). To repozytorium jest wspólnym źródłem wiedzy: projekt zapisuje w `docs/design/`, kod raportuje w `docs/STATUS.md`.

## Zanim zaczniesz pracę nad UI

1. Przeczytaj `docs/design/HANDOFF.md` (stan projektu, rama aplikacji, mapa modułów).
2. Przeczytaj `docs/design/LAYERS.md` — który moduł, sekcja i pole należy do rdzenia, a co do pakietu HVACR lub konfiguracji firmy; rdzeń nie może zależeć od pakietu.
3. Przeczytaj `docs/design/DECISIONS.md` — decyzje mają pierwszeństwo przed Twoimi domysłami.
4. Przeczytaj opis modułu w `docs/design/screens/` i, jeśli potrzeba, makietę w `design/canvas/` (HTML jest czytelny jako kod; ekrany przełącza atrybut `ekran` w `Main.dc.html` i `Main2.dc.html` — makieta podzielona na dwa pliki z tą samą ramą, ekrany od Zgłoszeń są w `Main2`).
5. Załaduj skill `precision-ui` (`.claude/skills/precision-ui/`).
6. Używaj wyłącznie tokenów z `docs/design/tokens.css` — żadnych surowych hexów i promieni w komponentach.
7. Dane przykładowe (seedy, testy, Storybook) bierz z `docs/design/data-scenario.md`.

## Po każdej zmianie

Zaktualizuj `docs/STATUS.md`:
- co zaimplementowano (moduł, ekran, stan),
- co **świadomie odbiega** od makiety i dlaczego (np. ograniczenie biblioteki, wydajność),
- pytania do projektu.

Nie zmieniaj plików w `docs/design/` ani `design/` — to obszar czatu projektowego. Jeśli coś w projekcie jest błędne lub niewykonalne, zapisz to w `docs/STATUS.md` w sekcji „Pytania do projektu”.

## Stos technologiczny

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (`strict`). Menedżer pakietów: **pnpm** (nigdy npm/yarn).
- **Supabase**: Postgres z RLS; aplikacja korzysta z tabel **wyłącznie przez funkcje RPC**. Klienci: `src/lib/supabase/browser.ts` i `server.ts`.
- **Zod** — schematy i klient API w `packages/api-client` (alias `@hvac/api-client`), walidacja w `src/lib/validation`.
- **Style**: **Tailwind v4 na tokenach** (decyzja właściciela 2026-11-22, wprowadzany stopniowo — moduł M0.2 w `docs/PLAN.md`). Tokeny w bloku `@theme`, domyślne skale Tailwinda wyłączone, bez wartości dowolnych (`w-[13px]`). Do czasu przeniesienia stare ekrany działają na zwykłym CSS (`src/app/precision.css` po `globals.css`); nowych klas tam nie dopisuj, a ekran przebudowywany w module przenieś na Tailwind. Nowe komponenty piszemy wyłącznie klasami z `src/app/tailwind.css` (wspólne elementy: `src/components/ui/`, ikony: Phosphor Regular z `@phosphor-icons/react/ssr`). Reguła ESLint `avero/tailwind-tokens` zgłasza wartości dowolne (`w-[13px]`, `text-[#fff]`, `w-(--x)`) i odstępy spoza siatki 4 px (`p-0.5`, `gap-1.5`, `p-px`).
- **Testy**: Vitest (`tests/*.test.ts`), testy SQL pgTAP (`supabase/tests/`).
- Mapa: kafelki OpenStreetMap z nakładką SVG (MapLibre odłożone — patrz DECISIONS).
- Docelowe biblioteki UI ze skilla Precision UI (Radix/React Aria, cmdk, Motion, Sonner, Phosphor, Geist) — **każdą nową zależność dodawaj dopiero po zgodzie właściciela**.

## Obieg zmian i monitoring

Zadanie KRA w Linear → gałąź `kra-…` → PR z `Closes KRA-…` → CI („Aplikacja”, „Baza danych”) → scalenie do `main` → wdrożenie → błędy produkcji w **Sentry** (`avero-bg/avero`, region UE) → zgłoszenie KRA z błędu.

- Sentry konfiguruje `src/lib/monitoring/sentry-options.ts`; bez `NEXT_PUBLIC_SENTRY_DSN` jest wyłączone. Nie włączaj Session Replay ani `sendDefaultPii` — w danych są klienci i ich adresy.
- Nowe miejsca, przez które mogą przejść dane osobowe do Sentry (własne `captureException` z kontekstem, `setUser`, `setExtra`), przepuszczaj przez `src/lib/monitoring/scrub.ts`; użytkownika zgłaszaj wyłącznie po `id`.
- Błąd zgłoszony z Sentry: przeczytaj go przez konektor Sentry (stack trace, wydanie), napisz test odtwarzający, potem poprawkę.
- Hosting: **Vercel** (zespół `avero18`, decyzja właściciela 2026-11-27). Push na `main` = wdrożenie produkcyjne; każdy PR dostaje podgląd. Zmienne Supabase są ustawione **tylko dla produkcji** — podgląd PR nie łączy się z bazą „Avero” (branche Supabase świadomie pominięte). Sekrety (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `SENTRY_AUTH_TOKEN`) wpisuje właściciel w panelu Vercel, nie Claude.

## Komendy

```bash
pnpm dev            # serwer deweloperski
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest (całość); pojedynczy plik: pnpm vitest run tests/x.test.ts
pnpm db:reset       # lokalna baza od zera + migracje
pnpm db:lint        # lint SQL
pnpm db:test        # testy pgTAP
```

## Sposób pracy

Kolejność modułów, zależności, kryteria odbioru i zasady pracy bez potwierdzeń między modułami: **`docs/PLAN.md`**.

Tryby pracy (`docs/PLAN.md` › „Tryby pracy”): `/kontrola` — jeden moduł z akceptacją planu i PR; `/plany N` — jedna akceptacja planów, potem bez pytań; `/paczka N` — w tle, tylko „Warunki zatrzymania”. Sesja główna koordynuje, moduł realizuje subagent `wykonawca`, przegląd robi `reviewer`. Subagenci działają na Sonnecie; przy module trudnym koordynator uruchamia ich na Opusie (`docs/PLAN.md` › „Modele i oszczędzanie limitu”).

Linear (zespół Kranz_) — szczegóły w `docs/PLAN.md` › „Statusy zadań” i „Współpraca z czatem projektowym”:
- **Linear jest źródłem prawdy o modułach.** Tabela modułów w `docs/PLAN.md` jest generowana z Linear (workflow „Linear → plan”) — nie edytuj jej ręcznie. Na starcie sesji: `git pull`, weź kolejność i stan z tabeli; zadaniom „M?” (bez numeru) nadaj numer w opisie zadania w Linear; zadania In Review ze scalonym PR zamknij jako Done.
- Pytanie lub błąd w `docs/design/` → zadanie z etykietą **„kod → projekt”** + wpis w STATUS.md z numerem; pracuj dalej nad innym modułem.
- **Gałąź i PR na moduł**: gałąź `kra-34-m1-3-…` z aktualnego `main`, PR `KRA-34 M1.3 …` z `Closes KRA-34`, potem `gh pr merge --auto --squash <nr>` (scali się sam po zielonym CI). PR z warunku zatrzymania — tytuł `[do akceptacji] …`, bez `--auto`. Statusy w Linear przesuwa integracja; Ty tylko jako zapas. Nie zamykaj zadania jako Done przed scaleniem.
- `main` jest chroniony: scalenie tylko przy zielonym CI („Aplikacja” i „Baza danych”). Nie pushuj na `main`.

1. **Najpierw plan.** Zmiana dotykająca więcej niż ~3 plików, bazy danych albo uprawnień → najpierw tryb planowania. Moduł z `docs/PLAN.md` jest już zaakceptowany: zapisz plan w commicie / opisie PR i działaj dalej, zatrzymując się tylko przy „Warunkach zatrzymania”. Zmiana spoza planu → plan do akceptacji właściciela.
2. **Logika najpierw testem.** Reguły biznesowe (magazyn, F-gaz, terminy kontroli, oferty) → najpierw test w `tests/` lub `supabase/tests/`, potem kod.
3. **Małe kroki.** Jedna funkcja = jeden commit na gałęzi modułu; nie pracuj na `main`, nie rób `git push --force`.
4. **Sprawdź, zanim powiesz „gotowe”.** `pnpm lint && pnpm typecheck && pnpm test`; przy zmianach w SQL także `pnpm db:lint && pnpm db:test`. Ekran UI — otwórz go i sprawdź w obu motywach.

## Baza danych i bezpieczeństwo

- Każda zmiana schematu = **nowy plik** w `supabase/migrations/` w formacie `RRRRMMDDNNNN_opis.sql`. Istniejących migracji **nigdy nie edytuj**.
- Każda nowa tabela: RLS włączone, polityki od razu, dostęp przez funkcję RPC, test pgTAP sprawdzający, że inna firma / klient portalu **nie widzi** danych.
- Wielofirmowość (M0.1): każda nowa tabela danych ma `org_id uuid not null default public.org_default() references public.organizations(id)`, indeks na `org_id` i polityki `org_isolation` (restrictive) oraz `rpc_access` — wzór w `supabase/migrations/202611230002_org_id_columns.sql`. Unikalności biznesowe zawierają `org_id`. Każda nowa funkcja `security definer` dostaje `alter function … owner to avero_rpc;` (rola bez BYPASSRLS, więc izolacja działa wewnątrz RPC). Wyjątki są wymienione w `supabase/tests/044_org_guard.sql`, który pilnuje obu zasad.
- Granty: rolom `anon` i `authenticated` nie dawaj `truncate` ani niczego poza tym, czego wymaga RPC; nowa funkcja: `revoke all … from public, anon` i `grant execute … to authenticated` tylko wtedy, gdy wywołuje ją aplikacja.
- Klucz service role tylko po stronie serwera (worker, `src/lib/email`), nigdy w komponentach klienckich ani w `NEXT_PUBLIC_*`.
- Wejście każdej server action i endpointu `src/app/api` waliduj schematem Zod.
- Nie czytaj i nie wypisuj plików `.env*` (poza `.env.example`); nowe zmienne dopisuj do `.env.example`.

## Definicja ukończenia

Lint, typy i testy przechodzą · stany komponentu z listy poniżej są obsłużone · obie wersje motywu działają · `docs/STATUS.md` zaktualizowany.

Hooki w `.claude/settings.json` pilnują części tych zasad automatycznie (blokada plików projektu i migracji, ESLint po edycji, typy + testy + STATUS.md przed zakończeniem). Do przeglądu przed commitem użyj agenta `reviewer`.

## Zasady, o których łatwo zapomnieć

- Motyw jasny i ciemny od pierwszego dnia, przez `[data-theme="dark"]`.
- Każdy komponent: stany domyślny, hover, aktywny, fokus, wyłączony, ładowanie (skeleton), pusty, błąd.
- Klawiatura: ⌘K, C, /, J/K, Enter, Esc, G + litera; skrót w podpowiedzi przy każdej akcji.
- Pola zablokowane (stany magazynu, ładunek czynnika, częstotliwość kontroli) zmienia wyłącznie dokument.
- Klient (widoki publiczne pod linkiem) nigdy nie widzi marży, cen zakupu, dostępności ani zdjęć wewnętrznych.
- Daty: względne w treści, pełna data z dniem tygodnia w podpowiedzi; kwoty z `tabular-nums`, wyrównane do prawej.
