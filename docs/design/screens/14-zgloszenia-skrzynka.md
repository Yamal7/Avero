# Zgłoszenia i Skrzynka

Makiety: ekrany `zgłoszenia` i `skrzynka` w `Main.dc.html` (plansze jasne i ciemne). Scenariusz: piątek 13 lis 2026, 9:14, zalogowana Agnieszka (biuro). Projekt opiera się na `docs/SERVICE_WORKFLOW.md`, `docs/CUSTOMER_PORTAL.md`, `docs/NOTIFICATION_CENTER.md` i `docs/PRODUCT_PLAN.md` (etap 2 pkt 4). Elementy oznaczone **nowe** nie mają jeszcze backendu.

## Zgłoszenia — lista
- Nagłówek: „Zgłoszenia” + widoki w kapsułkach: Otwarte, Bez technika, Z umów, Zamknięte (liczniki). Po prawej: kalendarz wizyt (⇧K), opcje widoku (⇧V), „Nowe zgłoszenie” (C) jako zwykły przycisk — akcent zostaje dla akcji w podglądzie.
- Filtry: prowadzący, rejon, „+ Filtr” (F). Po prawej podsumowanie: pilne / nowe / w obsłudze / oczekuje (ikona + liczba).
- Tabela grupowana po statusie (zwijane grupy na `--bg-raised`). Kolumny: priorytet, status, numer (mono), temat + kapsułka kontekstu, klient · obiekt (adres i urządzenie w podpowiedzi), źródło (ikona: e-mail, portal, telefon, technik, przegląd, formularz www), wizyta, reakcja, prowadzący.
- Statusy (`ticketLabels`): Nowe — przerywane kółko; W obsłudze — półkole `--warning`; Oczekuje — kółko z pauzą; Zamknięte — zielone kółko z ptaszkiem.
- Priorytety (`priorityLabels`): Pilny — czerwony kwadrat z wykrzyknikiem; Normalny — 2 z 3 słupków; Niski — 1 z 3.
- Reakcja: przy umowie z SLA odliczanie do terminu (czerwone, z zegarem), inaczej czas od zgłoszenia. Pełne godziny w podpowiedzi.
- Prowadzący: awatar; propozycja Avero wyblakła (50 %); brak — puste kółko.
- Kapsułki w temacie: numer zlecenia (ZS-1047), „UM” dla umowy, liczba zdjęć, „nowa” wiadomość w Skrzynce, „część 17 lis”, „klient” (czeka na wybór terminu).
- Klawiatura: J/K, ↵ otwiera, X zaznacza, A przydziel, P zaplanuj, C nowe.

## Zgłoszenia — podgląd (360 px)
- Priorytet, numer, otwórz (↵), więcej. Tytuł 15 px, klient · adres.
- **Ścieżka statusu**: Przyjęte → Technik → Wizyta → Protokół → Zamknięte (z godzinami). Mapuje się na status zgłoszenia, wizyty i protokołu z backendu.
- SLA: termin reakcji, pozostały czas, pasek, warunki umowy i kara (z umowy).
- Od klienta: treść zgłoszenia, kanał i czas, link do wątku w Skrzynce.
- Instalacja: urządzenie (kapsułka UR), ostatni przegląd, umowa.
- Propozycja Avero: technik z **przypisaniem do klienta** (warunek z backendu), odległość, wolne okno, następna wizyta. Akcje: „Wybierz innego”, „Przydziel i zaplanuj 9:30” (akcent, ⌘↵) — przydział, wizyta (`scheduleSchema`, czas warszawski, kontrola konfliktów) i potwierdzenie dla klienta w jednej operacji.

## Skrzynka (**nowe**)
- Trzy kolumny: wątki 340 px, wątek, kontekst 340 px.
- Widoki: Do obsłużenia, Moje, Czeka na klienta, Zamknięte. Filtr kanałów: e-mail serwis, e-mail biuro, portal klienta, formularz na stronie.
- Wątek na liście: awatar, nadawca (pogrubiony, gdy nieprzeczytany, + kropka akcentu), firma · adres, temat, początek treści, kanał, przypięcie (ZG-…, „pasuje do ZG-0912”, „zapytanie ofertowe”, „finanse”), prowadzący. Grupy dni.
- Przypięcie: wiadomość z portalu tworzy zgłoszenie automatycznie; e-mail dopasowujemy po nadawcy (kontakt klienta), obiekcie/urządzeniu i numerach dokumentów w treści (ZK/, ZS-, OF-, FV/). Dopasowanie niepewne = propozycja, nie zmiana.
- Wątek: tytuł, liczba wiadomości, akcje: przypisz (A), zamknij (E), więcej. Wcześniejsze wiadomości zwinięte. Wiadomość klienta na `--bg-raised`, nasza odpowiedź bez tła, notatka wewnętrzna z kapsułką kłódki „notatka wewnętrzna”.
- Pole odpowiedzi: przełącznik „Odpowiedź do klienta” (R) / „Notatka wewnętrzna” (N), adresat, treść, podpis z Ustawień, załącz, szablony (/), „Wyślij” (⌘↵).
- Kontekst: nadawca (kontakt dopasowany po e-mailu, telefon), otwarte sprawy klienta (zgłoszenie, urządzenie, wizyta, F-gaz), propozycja Avero (dołącz do zgłoszenia + priorytet, przesunięcie wizyty z planem dnia technika) jako jedna akcja z akcentem, oraz „Albo”: utwórz nowe zgłoszenie (C), oznacz jako nie-serwis.
- Klient nigdy nie widzi notatek wewnętrznych ani propozycji.

## Stany
- Pusta Skrzynka „Do obsłużenia”: jedno zdanie („Wszystko obsłużone. Nowe wiadomości z e-maila i portalu pojawią się tutaj.”) + skrót G I.
- Ładowanie: szkielety wierszy (lista) i bloków (podgląd). Błąd odbioru poczty: wiersz informacyjny nad listą z czasem ostatniej synchronizacji i „Spróbuj ponownie”.
- Lista zgłoszeń bez wyników filtra: „Brak zgłoszeń dla tych filtrów” + „Wyczyść filtry”.

## Kanały (decyzja 20 lis)
- E-mail: połączenie z **Microsoft 365** (Microsoft Graph, zgoda administratora) i **Google Workspace** (aplikacja wewnętrzna domeny), tylko skrzynki firmowe serwis@ i biuro@. Konfiguracja w Ustawienia → Integracje. Bez połączenia Skrzynka pokazuje portal i formularz.
- SMS: kanał przygotowany (wątki, szablony, nadawca), dostawca podłączany po podpisaniu umowy; do tego czasu w filtrze kanałów SMS widoczny jako „po podłączeniu dostawcy”.
- Szczegóły i ograniczenia (audyt Google przy sprzedaży innym firmom): `DECISIONS.md`.
