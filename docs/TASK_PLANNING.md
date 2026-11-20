# Planowanie zadań zespołu

KRA-14, wdrożenie lokalne 1.11.2026. Administrator i biuro mogą zmienić termin oraz wykonawcę otwartego zadania przyciskiem **Termin i wykonawca** w `/dashboard/team-tasks`.

## Zasady

Formularz pobiera bieżącą wersję zadania oraz dostępne osoby przy otwarciu. Wybór obejmuje aktywne konta administratora/biura i techników już mających dostęp do konkretnego klienta. Zapis ponownie sprawdza dostęp. Nie tworzy kont ani uprawnień. Nieaktywny stary przydział wymaga wyboru dostępnej osoby.

Zapis zmienia wyłącznie `assigneeId` i `dueOn`. Zachowuje tytuł, opis, rodzaj, kontakt, status, wynik i datę ukończenia. Zadania wykonane/anulowane oraz klient archiwalny nie mogą być przeplanowane. Powtórzenie identycznego zapisu z bieżącą lub poprzednią wersją nie tworzy kolejnej zmiany/audytu; taki brak zmiany jest dopuszczalny również po zamknięciu zadania.

Konkurencyjna zmiana daje konflikt i blokuje ponowny zapis ze starego formularza. Przycisk **Odśwież listę** pobiera aktualny stan. Nie nadpisujemy pracy drugiej osoby. Udany zapis odświeża kartę klienta, agendy i oprawę pulpitu z powiadomieniami. Osobista agenda nadal zawiera tylko własne zadania w zakresie dostępu.

Termin jest dniem, bez godziny; klasyfikacja agendy według Europe/Warsaw. Można świadomie wybrać datę przeszłą (zadanie zaległe). Zakres dat 2000–2100. Termin nie rezerwuje ekipy ani wizyty w kalendarzu. Bez e-maili/push i synchronizacji na żywo.

## API i baza

`GET /api/v1/customers/{customer}/tasks/{task}/plan` zwraca bieżące `task` i `assignees` (UUID, etykieta). `PATCH` tej samej ścieżki przyjmuje wyłącznie `{version, assigneeId, dueOn}` i zwraca zapisane zadanie. Ścisła walidacja wejścia, odpowiedzi i zgodności identyfikatorów ze ścieżką. Role sprawdzane niezależnie w API i bazie. Brak uprawnień lub obcy zakres: 403; nieaktualna wersja/zamknięcie/archiwizacja: 409; błędne dane lub niedostępny wykonawca przy zapisie: 400.

Wspólny klient: `taskPlanContext(customer,id,signal?)`, `changeTaskPlan(customer,id,input,signal?)`. Migracja `202611010002_task_planning.sql` dodaje chronione RPC `crm_task_plan_context` i `change_crm_task_plan`, korzysta z istniejącej blokady zapisów i audytu. Zastosowana i zarejestrowana lokalnie.

## Sprawdzenie

479 testów aplikacji, 931 asercji bazy, typy, lint i kompilacja produkcyjna zakończone powodzeniem. Nowe zestawy: 18 testów kontraktów/API i 37 asercji SQL, w tym kontrola ról i zakresu, aktywność wykonawcy, zachowanie pozostałych pól, konflikty i ponowienia, usunięcie zadania z agendy poprzedniego wykonawcy, daty i zadania zamknięte.

W przeglądarce potwierdzono wymianę nieaktywnego przydziału oraz zmianę daty, aktualizację liczników, a także odrzucenie formularza po równoczesnej zmianie i zachowanie nowszego terminu. Sprawdzono oba motywy przy 1440×1000 i formularz przy 390×844, bez poziomego przewijania. Podglądy w `output/qa/task-planning-{dark,light,mobile,conflict,result}.png`.

Użyto wyłącznie tymczasowych klientów i zadań demonstracyjnych. Nieaktywny przydział wskazywał syntetyczny identyfikator bez konta. Nie tworzono użytkowników ani dostępu; dane demonstracyjne usunięto, audyt zachowano. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki.

Historię zmian terminu i wykonawcy w karcie klienta wdrożono w KRA-15: [TASK_PLAN_HISTORY.md](TASK_PLAN_HISTORY.md).
