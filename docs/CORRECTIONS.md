# Uwagi po odbiorze i kolejne protokoły — 28.10.2026

## Proces dla firmy

Realizacje → wybrane zlecenie → Protokół odbioru otwiera **Odbiór i poprawki**. Bieżąca praca jest na początku; pierwszy protokół i decyzja klienta pozostają w rozwijanej historii. Zwarte wiersze zadań pokazują status, nazwę i termin, a formularz jest dostępny po rozwinięciu. Kierunek UX/UI: [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) — inspiracje Linear, Attio i Notion, z zachowaniem własnej identyfikacji.

1. Klient potwierdza pierwszy odbiór z uwagami. Bez tej decyzji nie rozpoczynamy rundy poprawek.
2. Biuro dodaje pierwsze zadanie, tworząc rundę. Zadanie ma nazwę, termin wykonania, odpowiedzialnego technika z ekipy montażowej i opcjonalną notatkę wewnętrzną. Technik musi nadal być aktywny i przypisany do tego klienta. Limit: 20 zadań na rundę, 100 rund na protokół.
3. Zadania mają stany: do wykonania, w trakcie, wykonane lub anulowane. Technik może rozpocząć i zakończyć wyłącznie zadanie przypisane do niego. Nie zmienia osoby, terminu, tytułu ani notatki biura. Biuro może przeplanować otwarte zadania lub je anulować z uzasadnieniem.
4. Wykonanie wymaga opisu wyniku; anulowanie wymaga podania przyczyny. Zamknięte zadanie pozostaje w historii bez edycji. Identyczne ponowienie ostatniego zapisu zachowuje wersję i czas.
5. Szkic kolejnego protokołu obejmuje datę faktycznego wykonania, wykonawcę, zakres poprawek, sprawdzenia, uwagi i zalecenia oraz osobną notatkę wewnętrzną. Przed zmianą zadań należy zapisać rozpoczętą edycję szkicu.
6. Biuro zatwierdza kolejny protokół po wykonaniu co najmniej jednego zadania i zamknięciu pozostałych. Otwarte zadania blokują publikację. Data prac nie może być przyszła, wcześniejsza od pierwszego montażu ani wcześniejsza od zakończenia zadań.
7. Powstaje odrębny, niezmienny dokument `PM-…/P1`, `PM-…/P2` itd. Serwer dodaje do niego podstawę rundy — uwagi klienta, opisy wykonanych zadań oraz jawne powody anulowania zadań niewykonanych. Szkic i notatki wewnętrzne nie są udostępniane.

**Termin zadania jest datą wykonania, a nie rezerwacją godzinową ekipy.** Ten etap nie tworzy wizyty w kalendarzu ani nie sprawdza kolizji godzinowych. Pusta lista techników oznacza, że biuro musi najpierw sprawdzić konta, role i przypisania do klienta oraz istniejącą ekipę realizacji. Moduł nie nadaje dostępu automatycznie.

## Proces dla klienta

Klient otwiera ten sam dokument z zakładki Moje dokumenty lub karty instalacji. Najnowszy odbiór po poprawkach jest na początku; wcześniejsze rundy i pierwszy protokół są w rozwijanej historii. Każda runda ma swój PDF i własną decyzję klienta: potwierdzenie albo odbiór z uwagami. Pracownik w podglądzie nie potwierdza odbioru za klienta.

Uwagi do kolejnej rundy pozwalają biuru uruchomić następną. Akceptacja kończy ten proces — nowe zgłoszenie problemu należy obsłużyć w module serwisowym. Nie można otworzyć kolejnej rundy, gdy poprzednia oczekuje na klienta lub ma otwarty szkic. Pierwszy PDF i każda wcześniejsza decyzja pozostają niezmienne. Nowe decyzje nie przepisują PDF.

Zakończenie zlecenia pozostaje niezależne, zgodnie z decyzją użytkownika. Poprawki można prowadzić przy zakończonej realizacji. Anulowana realizacja i archiwalny klient blokują nowe zapisy. Dane urządzeń i gwarancji w dokumencie uzupełniającym pochodzą z pierwszego protokołu; ten proces nie tworzy urządzeń, nie zmienia rejestru ani nie przedłuża gwarancji.

## API i dane

Migracja `202610280002_handover_corrections.sql`: osobne rundy, zadania i prywatne bajty PDF. Bez bezpośrednich uprawnień do tabel. Operacje przechodzą przez kontrolowane funkcje bazy. Zapisy używają wspólnej blokady operacji, wersji rundy i stabilnego UUID zadania; publikacja porównuje obraz dokumentu z tym, z którego wygenerowano PDF.

- GET `/api/v1/work-orders/{id}/corrections` — wewnętrzna historia i uprawnione opcje.
- PUT `/api/v1/work-orders/{id}/corrections/{round}/tasks` — zapis zadania.
- PUT `/api/v1/work-orders/{id}/corrections/{round}` — zapis szkicu.
- POST `/api/v1/work-orders/{id}/corrections/{round}/publish` — osobne zatwierdzenie firmy.
- GET `/api/v1/work-orders/{id}/corrections/{round}/pdf` — zapisany PDF dla pracownika.
- GET `/api/v1/portal/handovers/{id}/corrections?customer={customerId}` — wyłącznie opublikowana publiczna historia.
- GET `/api/v1/portal/handovers/{id}/corrections/{round}/pdf?customer={customerId}` — zapisany PDF dla klienta.
- POST `/api/v1/portal/handovers/{id}/corrections/{round}/receipt` — osobne potwierdzenie konkretnej rundy.

Wspólne schematy i metody HTTP są dostępne w `packages/api-client` dla wersji web i przyszłych aplikacji natywnych.

## Weryfikacja i ograniczenia

362 testy aplikacji i 667 testów bazy; typy, lint i kompilacja produkcyjna. Nowy zestaw bazy zawiera 95 asercji, także wcześniejsze warunki wejściowe odbioru. Testy obejmują dwie rundy, zakres technika, obce dane, odebranie przypisania, notatki prywatne, blokowanie publikacji przy otwartych zadaniach, uzasadnienia anulowania, idempotencję i niezmienność PDF oraz pierwszych decyzji.

Przeglądarka: zapis szkicu, publikacja osobnego dokumentu, historia i publiczny podgląd bez notatek kontrolnych; ekran 390 px bez poziomego przewijania. Ze względu na brak rzeczywistych kont techników lokalnie, zadanie do kontroli widoku było syntetycznym, zakończonym rekordem — przypisania i przebieg pracy technika sprawdzono transakcyjnie w testach bazy. Nie tworzono kont ani nie rozszerzano dostępu, nie wykonywano rzeczywistego potwierdzenia odbioru klienta. Dane demonstracyjne usuwamy po sprawdzeniu; audyt pozostaje.

Przykład PDF kolejnego odbioru: `output/pdf/protokol-ponownego-odbioru-projekt.pdf`, z jawnym oznaczeniem danych demonstracyjnych. Układ A4, polskie znaki, dwa arkusze i osobna historia decyzji w portalu.

Nie dodano powiadomień e-mail/push, rezerwacji terminów poprawek w kalendarzu ekip, podpisu kwalifikowanego ani zmiany danych zatwierdzonego pierwotnego dokumentu. Dokument kolejnego odbioru uzupełnia oryginał.

## Proponowany następny krok

Odświeżenie karty klienta w kierunku Attio: czytelny profil, relacje firma–osoba–lokalizacja, oferty, instalacje i jedna oś historii obejmująca realizacje, odbiory, poprawki oraz serwis.
