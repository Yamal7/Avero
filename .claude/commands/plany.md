---
description: Plany N kolejnych modułów do jednej akceptacji, potem realizacja bez pytań i scalanie automatyczne.
argument-hint: "[N — liczba modułów, domyślnie 3]"
---

Tryb **plany** (`docs/PLAN.md` › „Tryby pracy”). Właściciel ma chwilę na przejrzenie planów, potem jest zajęty.

Liczba modułów: $ARGUMENTS (jeśli pusty — 3).

1. Start sesji jak w `CLAUDE.md` › „Sposób pracy”: `git pull` na `main`, stan z tabeli modułów, porządki w Linear.
2. Wybierz N kolejnych modułów z tabeli, które nie są Done. Moduł może zależeć od wcześniejszego z tej samej paczki — wtedy realizujesz go dopiero po scaleniu poprzedniego.
3. **Tryb planowania**: dla każdego modułu krótki plan (zakres, pliki, migracje, testy, ryzyka) i wyraźnie oznaczone punkty z „Warunków zatrzymania”. Pokaż wszystkie plany naraz. **Czekaj na jedną akceptację** — właściciel może skreślić lub poprawić pojedyncze plany.
4. Po akceptacji realizuj moduły po kolei według „Pętli modułu” w `docs/PLAN.md`: osobny subagent `wykonawca` na moduł, weryfikacja, `reviewer`, PR z `gh pr merge --auto --squash`. Moduł zależny od poprzedniego — poczekaj na scalenie (`gh pr checks <nr> --watch`).
5. Nie pytaj między modułami. Stosuj „Warunki zatrzymania”: grupa A — PR `[do akceptacji]` i następny niezależny moduł; grupa B — stop.
6. Na końcu raport: moduły i linki do PR (scalone / czekają na CI / do akceptacji), odstępstwa od makiet, zadania „kod → projekt”, co wymaga uwagi właściciela.
