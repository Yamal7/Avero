# Zadania zespołu

KRA-13 — wdrożenie lokalne, 1.11.2026. Widok `/dashboard/team-tasks` jest dostępny dla administratora i biura. Link znajduje się pod „Moje zadania” w menu oraz w osobistej agendzie. Inspiracja układem pracy Linear/Attio, z zachowaniem kolorów, logo i motywów projektu.

## Działanie

Lista zbiera istniejące zadania CRM aktywnych klientów w dostępie biura. Nie tworzy nowego rodzaju zadania. W każdym wierszu widoczne są wykonawca, klient, termin, status i rozwijany opis/wynik.

Filtry można łączyć:

- **Osoba odpowiedzialna**: cały zespół albo konkretny wykonawca. Opcje pochodzą z zadań aktywnych klientów, również zamkniętych; nie jest to pełna lista kont firmy.
- **Termin**: wszystkie, dzisiaj, przed dzisiaj lub po dzisiaj. Przy statusie wykonanym/anulowanym jest to historyczny termin, nie informacja o aktualnej zaległości.
- **Status**: otwarte (do wykonania i w trakcie), do wykonania, w trakcie, wykonane, anulowane lub wszystkie.
- **Zadanie lub klient**: fragment tytułu/nazwy, bez rozróżnienia wielkości liter. `%` i `_` są zwykłymi znakami. Opisy, wyniki i notatki nie są przeszukiwane.

Trzy liczniki dotyczą wyłącznie otwartych zadań: zaległych, dzisiejszych i nadchodzących. Uwzględniają wykonawcę i wyszukiwanie, niezależnie od filtra statusu i daty listy. Kliknięcie licznika wybiera odpowiedni termin i status otwarty, zachowując wykonawcę/wyszukiwanie. Zatwierdzenie filtrów wraca na pierwszą stronę. Stronicowanie po 20 wierszy, stabilna kolejność według terminu i UUID, zachowuje wszystkie filtry.

Kliknięcie klienta prowadzi do konkretnego zadania na właściwej stronie karty. **Aktualizuj** zmienia postęp i wynik przez dotychczasowy zapis z kontrolą wersji. Biuro może zmienić postęp także zadania innego wykonawcy. **Termin i wykonawca** zmienia plan otwartego zadania bezpośrednio na liście, z kontrolą wersji i aktualnego dostępu. Zmiana zakresu i anulowanie pozostają w karcie klienta. Szczegóły: [TASK_PLANNING.md](TASK_PLANNING.md).

## Nieaktywni wykonawcy

Odebranie technikowi dostępu lub blokada konta nie ukrywa niewykonanych zadań przed biurem. Wiersz jest oznaczony jako nieaktywny przydział. Można go zamknąć jako wykonany, ale przed wznowieniem należy zmienić wykonawcę na aktywnego w karcie klienta. Dotyczy to również szybkiego RPC postępu — dotychczasowa reguła aktywnego wykonawcy przy pełnym zapisie jest teraz stosowana także do wznowienia przez szybki postęp.

Wybór osoby w filtrze nie nadaje uprawnień. Informacja o dostępności jest liczona dla konkretnego zadania i jego klienta. Opcja w filtrze jest dostępna, jeśli wykonawca ma aktywny przydział do przynajmniej jednego ze swoich klientów w tej liście.

## Dostęp i dane

Nowy widok opiera się na istniejących uprawnieniach administratora/biura. Technik, klient portalowy, konto bez roli, zablokowane biuro i anonimowy nie mogą odczytać listy ani opcji wykonawców. Własna agenda i dzwonek pozostają osobiste. Klienci archiwalni są wyłączeni z listy zespołu; ich historia pozostaje w kartach według dotychczasowych zasad.

Nie dodano kont, przypisań klientów ani uprawnień do tabel. Projekcja zawiera dotychczasowy bezpieczny kontrakt zadania i metadane klienta/dostępności. Nie zawiera prywatnych notatek CRM, surowego audytu ani danych uwierzytelniania. Kontrolę ról wykonują niezależnie strona, API i baza. Odpowiedź jest dodatkowo sprawdzana względem zalogowanej osoby, zdolności zarządzania, liczników i listy wykonawców.

Daty według Europe/Warsaw. Zadania nadal nie rezerwują wizyt ekip. Brak automatycznych e-maili, push i synchronizacji na żywo.

## API

Migracja `202611010001_team_tasks.sql` dodaje `team_crm_tasks` i ujednolica regułę wznowienia w `crm_task_progress`. Zastosowana i zarejestrowana lokalnie.

GET `/api/v1/tasks/team?date=all&state=open&assignee=all&search=&page=1`:

- `date`: `all | today | overdue | upcoming`;
- `state`: `open | todo | in_progress | done | cancelled | all`;
- `assignee`: `all` lub UUID;
- `search`: do 160 znaków; `page`: 1–100000;
- ścisłe odrzucanie nieznanych parametrów;
- odpowiedź: `viewerId`, `canManage:true`, `today`, `total`, `counts`, `items`, `assignees`;
- wiersz: dotychczasowy kontrakt zadania z `customerName`, `customerPage` i `assigneeAvailable`;
- opcje: UUID, etykieta, informacja o dostępności.

Wspólne schematy i `createHvacClient().teamTasks()` są dostępne dla przyszłych kanałów mobilnych i komputerowych. Zapis postępu używa istniejącej ścieżki klienta/zadania; odświeża listę zespołu, agendę, profil i oprawę pulpitu.

## Sprawdzenie

461 testów aplikacji, 894 testy bazy, typy, lint i kompilacja produkcyjna. Nowe zestawy: 21 testów kontraktów/API i 46 asercji SQL. Weryfikują role, filtrowanie łączone, własną agendę bez zmian, niedostępnych wykonawców, blokadę wznowienia, liczby, paginację, link do właściwej strony klienta i zamknięcie przez biuro.

Przeglądarka: filtr nieaktywnego wykonawcy i zamknięcie demonstracyjnego zadania z aktualizacją liczników, połączony filtr osoby/terminu/statusu/wyszukiwania, druga strona wykonanych i przejście do zadania na drugiej stronie klienta. Motywy ciemny/jasny i 390×844 bez poziomego przewijania; układ komputerowy 1440×1000.

Testowano wyłącznie odizolowanych klientów demonstracyjnych. Nieaktywny wykonawca był syntetycznym odwołaniem bez konta — nie utworzono użytkowników ani nie nadano dostępu. Dane usuwał harness z limitem 300 sekund; audyt pozostał. Rzeczywiste zadania i konta nie były zmieniane. Podglądy: `output/qa/team-tasks-light.png`, `team-tasks-dark.png`, `team-tasks-mobile.png`.

Zmiana wykonawcy i terminu z listy zespołu została wdrożona w KRA-14. Aktualne sprawdzenie i dalszy proponowany etap: [TASK_PLANNING.md](TASK_PLANNING.md).
