# Historia planowania zadań

KRA-15, wdrożenie lokalne 1.11.2026. W karcie klienta, zakładka **Historia**, zdarzenia zmiany planu zadania zawierają autora oraz poprzednie i nowe wartości terminu/wykonawcy. Godzina zdarzenia i nagłówek dnia są według Europe/Warsaw. Filtr **Zadania CRM** zawęża oś do działań CRM.

## Dane i uprawnienia

Wykorzystujemy istniejący audyt `crm_tasks`, również dla zapisów sprzed wdrożenia. Zapis z listy zespołu i pełny formularz zadania tworzą tę samą historię. Zmiana obu pól daje jedno zdarzenie z dwoma porównaniami. Utworzenie zadania, zmiana opisu/wyniku/postępu i identyczne ponowienie nie tworzą pozornych zmian planu. Gdy plan zmieniono razem ze statusem, nagłówek zachowuje informację o postępie.

Daty i identyfikatory stron zmiany pochodzą z niezmienianych przez aplikację obrazów audytu. Etykiety osób są rozwiązywane przy odczycie z obecnych kont (jak w pozostałym CRM), a nie zamrażane historycznie. Usunięte konto/brak autora: **Niedostępny użytkownik**. Dwie osoby mogą mieć tę samą etykietę; zmiana jest wykrywana po identyfikatorach, a nie po nazwie.

Szczegóły planu i autora dostępne wyłącznie administratorowi oraz biuru po dotychczasowej kontroli dostępu do klienta. Technik zachowuje dotychczasowe warunki widoczności zdarzeń swoich zadań, bez nowych porównań przydziału. Klient portalowy, konto bez roli, zablokowane biuro i anonimowy nie mają dostępu. API i strona dodatkowo odrzucają szczegóły planu w projekcji technika.

Nie udostępniamy surowych `old_data`/`new_data`, UUID użytkowników, opisu zadania, wyniku ani notatek. Odczyt nie zmienia uprawnień, zadań i audytu. Dotychczasowe filtry, kolejność i strony po 20 zdarzeń są zachowane; wzbogacenie następuje dopiero dla bieżącej strony. Brak osobnej tabeli historii lub dodatkowego zapisu.

## Kontrakt

Istniejący GET `/api/v1/customers/{customer}/activity?kind=crm_task&page=1` i `createHvacClient().customerActivity()` otrzymują opcjonalne `planChange` przy zdarzeniu `crm_task`:

- `actorLabel`: etykieta autora;
- `dueOn`: `{from,to}` w ISO YYYY-MM-DD lub `null`, jeśli bez zmiany;
- `assignee`: `{fromLabel,toLabel}` lub `null`, jeśli bez zmiany.

Obiekt występuje wyłącznie dla rzeczywistej zmiany przynajmniej jednego pola. Stare odpowiedzi bez niego pozostają poprawne. Ścisłe schematy wspólnego klienta odrzucają dodatkowe pola i błędne daty. Migracja `202611010003_task_plan_history.sql` rozszerza chroniony odczyt `customer_activity`; nie zmienia funkcji zapisujących. Zastosowana i zarejestrowana lokalnie.

## Sprawdzenie

493 testy aplikacji i 961 testów bazy, typy, lint oraz kompilacja produkcyjna zakończone powodzeniem. Nowe: 14 testów kontraktu/API i 30 asercji SQL. Weryfikacja obejmuje role, zakres klienta, częściowe/łączne zmiany, brak prywatnych pól, autora niedostępnego, zachowanie historii technika, ponowienia i niepowielone strony historii.

W przeglądarce potwierdzono daty i wykonawcę przed/po, autora, godzinę, filtr Zadania CRM i kolejną stronę z zachowanym filtrem. Oba motywy przy 1440×1000 oraz 390×844 bez poziomego przewijania. Podglądy: `output/qa/task-plan-history-dark.png`, `task-plan-history-light.png`, `task-plan-history-mobile.png`. Użyto wyłącznie tymczasowych klientów/zadań demonstracyjnych i istniejącego administratora; nie tworzono kont ani uprawnień. Dane demonstracyjne usunięto (0 klientów i 0 zadań), audyt zachowano. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki. Aplikacja działa pod http://localhost:3100.

Proponowany kolejny etap: uruchomienie **Szablonów instalacji** — zestawów produktów, materiałów, robocizny i dojazdu z katalogu, używanych w kreatorze ofert.
