# Mój dzień (pulpit biura / dyspozytora)

Makieta: `design/canvas/Main.dc.html`, ekran `mój dzień` (domyślny). Plansze: Mój dzień · jasny / ciemny, Paleta ⌘K.

## Układ
- Rama aplikacji (patrz HANDOFF). Lista dnia w panelu głównym, po prawej widgety (zwijane pojedynczo; cały panel chowany przyciskiem w nagłówku).
- Grupy listy zwijane. Znak rozpoznawczy: **ścieżka statusu** zlecenia (etapy jako krótka linia kroków).
- Stany ekranu: dane / pusty / wczytywanie (skeleton) — przełączane w makiecie ustawieniem `stan`.

## Kolejność sekcji (porządki 21 lis)
Lista idzie od tego, co pali się najbardziej, do tego, co może poczekać. Licznik w nagłówku: „Sprawy: N” (suma sekcji, tu 22).
1. **Zagrożone SLA** — zgłoszenia z umową, którym kończy się czas reakcji (ZG-0920 Przychodnia Zdrowie, 0:52).
2. **Wizyty** — dzisiejsze zlecenia według godziny, ze ścieżką statusu i technikami (7).
3. **Bez technika** — nowe zgłoszenia bez przydziału (ZG-0923 Biuro Bilans, ZG-0924 Piekarnia Rogal).
4. **Skrzynka** — nieprzypisane wiadomości (e-mail, portal, formularz) z powiązaniem do zgłoszenia albo oznaczeniem „zapytanie ofertowe”.
5. **Leady do kontaktu** — termin pierwszego kontaktu (2 h od wpłynięcia), źródło po lewej.
6. **Po terminie** — kontrole F-gaz i wyceny po terminie.
7. **Wzmianki** — @Agnieszka w zleceniach, ofertach i zgłoszeniach.

Widgety: Zespół dziś, Ten tydzień, Umowy w tym miesiącu, **Sprzedaż** (leady do kontaktu, oferty u klientów, szanse po terminie, wygrane w miesiącu) — każdy wiersz otwiera filtrowaną listę modułu.

## Paleta komend ⌘K (`design/canvas/Paleta.dc.html`)
- Okno 640 px, promień 14, krawędź `--edge`, cień modalny, tło przygaszone `--scrim`.
- Pole z ikoną lupy + kapsułka zakresu „Wszędzie” + `Esc`.
- Sekcje: Akcje (z klawiszem, np. `C` nowe zlecenie), Rekordy, Przejdź do (`G K`, `G P`).
- Wiersz 36 px, promień 10: ikona typu · ID mono · tytuł · po prawej kapsułka zamiast drugiej linii (klient z umową → „Umowa” z zieloną kropką; obiekt → adres z pinezką; zlecenie → ikona statusu + awatary techników; urządzenie → czynnik z kroplą). Szczegóły w podpowiedzi.
- Stopka: `↑ ↓` wybierz, `↵` otwórz, `⌘↵` w panelu. Klawisze `kbd` bez ramek, tło `--bg-subtle`, promień 6.
