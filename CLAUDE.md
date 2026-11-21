# Avero

Program FSM / CRM / ERP dla firmy HVACR (serwis i montaż chłodnictwa, klimatyzacji, pomp ciepła; obowiązki F-gaz / CRO). Język interfejsu i komunikacji: **polski**.

Interfejs jest projektowany w osobnym czacie Claude (makiety). To repozytorium jest wspólnym źródłem wiedzy: projekt zapisuje w `docs/design/`, kod raportuje w `docs/STATUS.md`.

## Zanim zaczniesz pracę nad UI

1. Przeczytaj `docs/design/HANDOFF.md` (stan projektu, rama aplikacji, mapa modułów).
2. Przeczytaj `docs/design/LAYERS.md` — który moduł, sekcja i pole należy do rdzenia, a co do pakietu HVACR lub konfiguracji firmy; rdzeń nie może zależeć od pakietu.
3. Przeczytaj `docs/design/DECISIONS.md` — decyzje mają pierwszeństwo przed Twoimi domysłami.
4. Przeczytaj opis modułu w `docs/design/screens/` i, jeśli potrzeba, makietę w `design/canvas/` (HTML jest czytelny jako kod; ekrany przełącza atrybut `ekran` w `Main.dc.html`).
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

Do uzupełnienia przy pierwszym commicie kodu. Zalecenia ze skilla Precision UI: React + TypeScript, Tailwind (wyłącznie z tokenami, zmapowanymi w `theme.extend`), Radix UI lub React Aria, cmdk (⌘K), Motion, Sonner, ikony Phosphor (Regular), fonty Geist i Geist Mono. Mapa: kafelki OpenStreetMap z nakładką SVG (MapLibre odłożone — patrz DECISIONS). Nową bibliotekę dodawaj dopiero po zgodzie właściciela.

## Zasady, o których łatwo zapomnieć

- Motyw jasny i ciemny od pierwszego dnia, przez `[data-theme="dark"]`.
- Każdy komponent: stany domyślny, hover, aktywny, fokus, wyłączony, ładowanie (skeleton), pusty, błąd.
- Klawiatura: ⌘K, C, /, J/K, Enter, Esc, G + litera; skrót w podpowiedzi przy każdej akcji.
- Pola zablokowane (stany magazynu, ładunek czynnika, częstotliwość kontroli) zmienia wyłącznie dokument.
- Klient (widoki publiczne pod linkiem) nigdy nie widzi marży, cen zakupu, dostępności ani zdjęć wewnętrznych.
- Daty: względne w treści, pełna data z dniem tygodnia w podpowiedzi; kwoty z `tabular-nums`, wyrównane do prawej.
