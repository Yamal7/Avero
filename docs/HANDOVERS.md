# Odbiór montażu — 28.10.2026

## Uzgodniony proces

Zakończenie zlecenia i odbiór klienta są osobne — decyzja właściciela produktu z 28.10.2026. Dotychczasowa serwerowa reguła zamknięcia zlecenia pozostaje bez zmian: co najmniej jeden zakończony termin, bez terminów planowanych lub trwających. Zatwierdzenie protokołu nie zamyka zlecenia i nie potwierdza odbioru za klienta.

1. Realizacje → wybrane zlecenie → **Protokół odbioru**.
2. Biuro lub technik przydzielony do realizacji zapisuje szkic: data wykonania, osoba wykonująca, zakres, uruchomienie/sprawdzenia, uwagi i zalecenia. Notatka wewnętrzna pozostaje dostępna tylko dla firmy.
3. Wybierz istniejącą instalację tego klienta albo świadomie utwórz nową, w istniejącej lokalizacji lub pod adresem zlecenia. Formularz pokazuje do 100 najnowszych instalacji i do 100 lokalizacji klienta.
4. Dodaj nowe urządzenia albo wybierz urządzenie z rejestru wybranej instalacji. Producent i model są wymagane przy zatwierdzeniu, numer seryjny i gwarancja opcjonalne. Nie zakładamy domyślnej gwarancji. Istniejące dane urządzenia są kopiowane dokładnie, bez przedłużania gwarancji lub nadpisywania rejestru.
5. Po zakończeniu terminów biuro zapisuje szkic i osobno zatwierdza udostępnienie. Powstaje niezmienny protokół PM, zapisany PDF oraz nowe wskazane karty instalacji i urządzeń. Na zlecenie przypada jeden protokół; korekty zatwierdzonego dokumentu wymagają przyszłego procesu rewizji.
6. Klient widzi dokument w **Moje dokumenty → Protokoły odbioru montażu** oraz przy instalacji. Może pobrać PDF i potwierdzić odbiór bez uwag lub z opisanymi uwagami. Decyzja wymaga zaznaczenia oświadczenia i osobnego potwierdzenia. Podgląd pracownika nie pozwala odbierać prac za klienta.

Pierwsza decyzja klienta jest niezmienna. Identyczne ponowienie zachowuje oryginalny czas i treść. PDF zawiera stan zatwierdzony przez firmę; późniejszy odbiór jest oddzielnym wpisem, bez przepisywania dokumentu. Ten etap nie obejmuje podpisu kwalifikowanego, wysyłek wiadomości, faktur ani magazynu.

## Dane i zabezpieczenia

Migracja `202610280001_installation_handovers.sql` dodaje raporty, prywatne bajty PDF oraz jawne warunki gwarancji i datę montażu urządzenia. Plik ma limit 2 MB; maksymalnie 20 urządzeń. Szkic niczego nie rejestruje w kartotece urządzeń. Utworzenie kart i zapis dokumentu stanowią jedną transakcję. Wersje zlecenia i szkicu oraz ponowne porównanie publicznego obrazu dokumentu zapobiegają publikacji nieaktualnych danych. Stabilne identyfikatory i idempotentne ponowienia zapobiegają duplikatom.

Technik wymaga aktywnego przypisania do klienta i udziału w ekipie tego zlecenia. Biuro zatwierdza. Klient wymaga aktywnego członkostwa i widzi wyłącznie opublikowany dokument własnego klienta. Szkice, ceny, koszty i notatki wewnętrzne nie są częścią publicznego kontraktu. Zmiana rejestru urządzenia po publikacji nie zmienia archiwalnego protokołu.

## API dla wersji web, mobilnej i komputerowej

- GET/PUT `/api/v1/work-orders/{id}/handover`: kontekst lub wersjonowany zapis szkicu.
- POST `/api/v1/work-orders/{id}/handover/publish`: zatwierdzenie firmy; generuje PDF z serwerowego obrazu i zapisuje go niezmiennie.
- GET `/api/v1/work-orders/{id}/handover/pdf`: pobranie zapisanego dokumentu przez uprawnionego pracownika.
- GET `/api/v1/portal/handovers/{id}?customer={customerId}`: wyłącznie publiczny dokument.
- GET `/api/v1/portal/handovers/{id}/pdf?customer={customerId}`: ten sam zapisany PDF dla klienta.
- POST `/api/v1/portal/handovers/{id}/receipt`: osobny odbiór klienta.

Wspólne schematy i metody klienta znajdują się w `packages/api-client/src/handovers.ts` i `client.ts`. Pobrania PDF mają prywatne nagłówki, brak cache i ochronę typu treści. Wersje natywne pozostają przyszłymi aplikacjami wykorzystującymi to API.

## Weryfikacja

344 testy aplikacji, 572 testy bazy (w tym 46 dla odbiorów), typy, lint i kompilacja produkcyjna. Testy obejmują role i izolację klientów, nieaktualne wersje, ponowienia zapisu i publikacji, obce urządzenia/lokalizacje, istniejące gwarancje, jawnie podaną gwarancję, brak domyślnego okresu, duplikaty numerów seryjnych, niezmienny dokument, osobne zamykanie zleceń oraz decyzje klienta.

Przeglądarka: zapis szkicu, zatwierdzenie, zapis jednego PDF, utworzenie instalacji i urządzenia, publiczny podgląd, filtr dokumentów i powiązanie z kartą instalacji. Telefon 390 px: brak poziomego przewijania i brak notatki kontrolnej. Test UI użył tymczasowego fikcyjnego klienta i syntetycznej realizacji, bez kont testowych, nadania dostępu ani akceptacji umowy klienta. Wszystkie własne rekordy demonstracyjne usunięto; audyt pozostaje. Potwierdzenie odbioru klienta sprawdzono w transakcyjnych testach wycofywanych po zakończeniu, bez wykonywania rzeczywistego odbioru w przeglądarce.

Przykład dokumentu: `output/pdf/protokol-odbioru-projekt.pdf`, oznaczony jako dane przykładowe. Sprawdzono wydruk A4 z polskimi znakami, jedną stronę przykładu i paginację długiego dokumentu.

## Kolejny krok

Obsługa uwag klienta po odbiorze: zadania poprawkowe, terminy, historia wykonania i ponowny odbiór przez nową wersję protokołu. Oryginalny dokument i pierwsza decyzja muszą pozostać zachowane.

Aktualizacja 28.10.2026: obsługa uwag po odbiorze, zadania i kolejne protokoły są dostępne — [CORRECTIONS.md](CORRECTIONS.md). Pierwszy dokument pozostaje niezmienny; dodatkowe dokumenty otrzymują oznaczenie rundy P1/P2. Najnowszy odbiór jest prezentowany przed rozwijaną historią.
