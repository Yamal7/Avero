---
description: N kolejnych modułów w tle, bez żadnych pytań — tylko „Warunki zatrzymania”, raport na końcu.
argument-hint: "[N — liczba modułów, domyślnie do końca bieżącej fazy]"
---

Tryb **paczka** (`docs/PLAN.md` › „Tryby pracy”). Właściciela nie ma — nikt nie odpowie na pytanie, więc nie zadawaj żadnego.

Zakres: $ARGUMENTS (liczba modułów; jeśli pusty — do końca bieżącej fazy).

1. Start sesji jak w `CLAUDE.md` › „Sposób pracy”: `git pull` na `main`, stan z tabeli modułów, porządki w Linear.
2. Moduły z `docs/PLAN.md` są zaakceptowane z góry. Dla każdego: plan zapisz w opisie PR (bez czekania na akceptację) i realizuj według „Pętli modułu” — osobny subagent `wykonawca`, weryfikacja, `reviewer`, PR z `gh pr merge --auto --squash`.
3. Kolejność z tabeli; moduł z niescaloną zależnością — weź następny wolny albo poczekaj na scalenie (`gh pr checks <nr> --watch`).
4. „Warunki zatrzymania”: grupa A — PR `[do akceptacji]` bez `--auto` i następny moduł, który od niego nie zależy; grupa B — przerwij paczkę.
5. Pytania do projektu → zadanie „kod → projekt” + wpis w `docs/STATUS.md`, praca idzie dalej.
6. Na koniec (także po przerwaniu) raport dla właściciela, na początku najważniejsze:
   - **Wymaga decyzji** — PR `[do akceptacji]`, powód przerwania,
   - **Scalone** i **czekają na CI** — moduły z linkami do PR,
   - **Pytania do projektu** — numery zadań „kod → projekt”,
   - **Odstępstwa od makiet**.
