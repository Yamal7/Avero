# Zadania w przeglądzie i powiadomieniach

KRA-12, wdrożenie lokalne 28.10.2026. Zadania CRM są widoczne na pulpicie `/dashboard` i pod dzwonkiem przy logo, zgodnie z dotychczasowym układem aplikacji.

## Zachowanie

Sekcja **Twoje zadania** na początku głównej kolumny przeglądu pokazuje osobno zaległe i dzisiejsze działania. Kliknięcie licznika otwiera odpowiedni filtr „Moich zadań”. Podgląd ma maksymalnie pięć rekordów: najpierw najstarsze terminy zaległe, potem dzisiejsze. Tytuł prowadzi do konkretnego zadania i właściwej strony karty klienta. Przy większej liczbie działań podgląd informuje, ile z całości pokazuje. Puste podsumowanie nie ukrywa linku do przyszłych otwartych zadań.

Dzwonek uwzględnia własne zadania po terminie i na dzisiaj w kropce oraz dostępnej nazwie z liczbą bieżących spraw. Okno ma oddzielne skróty do obu filtrów i całej otwartej agendy. Istniejące alerty pilnego serwisu i przeglądów pozostają w osobnej grupie. To bieżące terminy, a nie skrzynka nieprzeczytanych wiadomości: samo otwarcie nie usuwa alertu.

Otwarcie okna pobiera aktualne podsumowanie z API. W trakcie widoczny jest stan odświeżania. Błąd nie staje się zerowym licznikiem; okno pokazuje komunikat i możliwość ponowienia odczytu. Zamknięcie okna przerywa rozpoczęty odczyt. Nie dodano okresowego odpytywania, synchronizacji na żywo ani automatycznego odświeżania o północy. Pulpit aktualizuje się przy wejściu, przeładowaniu i odświeżeniu po zapisie.

Szybki zapis postępu oraz zapis zadania odświeżają całą oprawę dashboardu, kartę klienta i agendę. Wykonanie, anulowanie lub przełożenie terminu na przyszłość usuwa zadanie z bieżących alertów. Ponowne otwarcie zadania może je przywrócić.

## Dane i dostęp

Jedna definicja własnej agendy: nowy odczyt `my_task_alerts()` korzysta z `my_crm_tasks('open','',1)`. Zachowuje jego datę **Europe/Warsaw**, role i zakres klientów. Administrator i biuro również otrzymują tylko własne przypisania. Zablokowane konta, użytkownicy bez roli, klienci portalowi i anonimowi są wyłączeni. Klienci zarchiwizowani i odebrane przypisania nie trafiają do podsumowania.

Podgląd zawiera wyłącznie identyfikator zadania, tytuł, nazwę i identyfikator klienta, numer strony, termin i otwarty status. Nie wysyła do oprawy aplikacji opisów, wyników, kontaktów ani prywatnych notatek. Schemat sprawdza ograniczenie do pięciu rekordów, zgodność liczników, terminy, kolejność i tożsamość odbiorcy.

`getTaskAlerts` używa React cache wyłącznie w obrębie pojedynczego renderowania serwerowego: wspólny odczyt pulpitu i layoutu nie jest przechowywany globalnie ani współdzielony między użytkownikami. Odczyt przy otwarciu dzwonka jest osobnym, świeżym żądaniem.

Migracja `202610280006_task_alerts.sql` dodaje tylko chroniony odczyt. Bez nowych tabel, kont i uprawnień do klientów.

## API

GET `/api/v1/tasks/alerts` — bez parametrów; odczyt własnego podsumowania.

Odpowiedź: `{viewerId,today,counts:{today,overdue},items:[{id,customerId,customerName,customerPage,title,dueOn,state}]}`. Maksymalnie pięć wierszy. Uwierzytelnienie sesją lub Bearer, prywatna odpowiedź bez cache. Parametry próbujące wybrać użytkownika/klienta lub filtr są odrzucane. Nieprawidłowa projekcja odpowiedzi jest błędem, a nie udanym pustym podsumowaniem.

Wspólny kontrakt `taskAlertsSchema` i metoda `createHvacClient().taskAlerts()` są dostępne dla przyszłych aplikacji mobilnych i komputerowych.

## Weryfikacja

440 testów aplikacji, 848 testów bazy (22 nowe asercje SQL), typy, lint i kompilacja produkcyjna. Testy obejmują zgodność z agendą, limit i kolejność, metadane bez prywatnej treści, zakończenie, archiwizację klienta, odebranie dostępu, blokadę konta, role i anonimowość, projekcje API, klienta HTTP i odświeżanie oprawy po zapisie.

Kontrola przeglądarkowa na odizolowanych danych demonstracyjnych: liczniki pulpitu i dzwonka, przejście do zaległych, wykonanie zadania i aktualizacja obu podsumowań, ciemny/jasny motyw oraz telefon. Dane demonstracyjne są automatycznie usuwane; audyt pozostaje. Bez tworzenia kont lub rozszerzania dostępu, bez zmian prawdziwych zadań.

Nie uruchomiono e-maili, push ani zewnętrznych automatyzacji. Widok **zadań zespołu dla biura** wdrożono w KRA-13: [TEAM_TASKS.md](TEAM_TASKS.md). Kolejny proponowany etap: zmiana wykonawcy i terminu bezpośrednio z listy zespołu.

Aktualizacja 3.11.2026: dzwonek prowadzi też do trwałego centrum przypomnień z przeczytaniem i preferencjami kategorii. Dotychczasowe bieżące alerty pozostają oddzielne: [NOTIFICATION_CENTER.md](NOTIFICATION_CENTER.md).
