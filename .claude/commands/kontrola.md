---
description: Jeden moduł z pełną kontrolą właściciela — akceptacja planu i review PR przed scaleniem.
argument-hint: "[KRA-… — domyślnie następny wolny moduł]"
---

Tryb **kontrola** (`docs/PLAN.md` › „Tryby pracy”). Właściciel ma czas i chce zatwierdzić plan oraz sam przejrzeć PR.

Moduł: $ARGUMENTS (jeśli pusty — pierwszy moduł z tabeli w `docs/PLAN.md`, który nie jest Done i ma scalone wszystkie zależności).

1. Start sesji jak w `CLAUDE.md` › „Sposób pracy”: `git pull` na `main`, stan z tabeli modułów, porządki w Linear.
2. Przeczytaj kryteria odbioru modułu w `docs/PLAN.md` (przy rozbieżności obowiązuje zadanie w Linear) i źródła z `docs/design/`.
3. **Tryb planowania**: przedstaw plan — pliki, migracje, testy, ryzyka, ewentualne „Warunki zatrzymania”. **Czekaj na akceptację.**
4. Po akceptacji: gałąź `kra-…` z aktualnego `main`, subagent `wykonawca` z planem i kryteriami.
5. Sprawdź raport wykonawcy, uruchom weryfikację sam, potem agent `reviewer`; błędy z grupy „Błędy” poprawia wykonawca.
6. PR `[do akceptacji] KRA-… M… …` z `Closes KRA-…`, planem, odstępstwami i wynikiem `reviewer`. **Bez `--auto`.**
7. Zatrzymaj się i podaj link do PR. Następny moduł dopiero na polecenie właściciela.
