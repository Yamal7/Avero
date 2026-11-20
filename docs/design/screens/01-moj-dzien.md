# Mój dzień (pulpit biura / dyspozytora)

Makieta: `design/canvas/Main.dc.html`, ekran `mój dzień` (domyślny). Plansze: Mój dzień · jasny / ciemny, Paleta ⌘K.

## Układ
- Rama aplikacji (patrz HANDOFF). Lista dnia w panelu głównym, po prawej widgety (zwijane pojedynczo; cały panel chowany przyciskiem w nagłówku).
- Grupy listy zwijane. Znak rozpoznawczy: **ścieżka statusu** zlecenia (etapy jako krótka linia kroków).
- Stany ekranu: dane / pusty / wczytywanie (skeleton) — przełączane w makiecie ustawieniem `stan`.

## Paleta komend ⌘K (`design/canvas/Paleta.dc.html`)
- Okno 640 px, promień 14, krawędź `--edge`, cień modalny, tło przygaszone `--scrim`.
- Pole z ikoną lupy + kapsułka zakresu „Wszędzie” + `Esc`.
- Sekcje: Akcje (z klawiszem, np. `C` nowe zlecenie), Rekordy, Przejdź do (`G K`, `G P`).
- Wiersz 36 px, promień 10: ikona typu · ID mono · tytuł · po prawej kapsułka zamiast drugiej linii (klient z umową → „Umowa” z zieloną kropką; obiekt → adres z pinezką; zlecenie → ikona statusu + awatary techników; urządzenie → czynnik z kroplą). Szczegóły w podpowiedzi.
- Stopka: `↑ ↓` wybierz, `↵` otwórz, `⌘↵` w panelu. Klawisze `kbd` bez ramek, tło `--bg-subtle`, promień 6.
