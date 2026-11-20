# Planowanie (tablica dyspozytora) i mapa

Makieta: ekran `planowanie`, ustawienie `plan` (dzień / przeciąganie / mapa). **Plansze 1920 px** — monitor w biurze.

## Oś dnia
- Lewa kolumna „Do zaplanowania”: zgłoszenia i przeglądy z umów, kolejność wg czasu do terminu SLA, szacowany czas pracy.
- Oś 07–17: technik w wierszu z obciążeniem dnia; wizyty jako bloki (status = kształt + kolor), dojazdy jako linia przerywana z minutami, linia „teraz”. Krótkie bloki: tylko godzina i tytuł, reszta w podpowiedzi. Nagłówek wiersza z `min-width:0` (inaczej przesuwa bloki).
- Przeciąganie: pod każdym technikiem jego dopasowanie (wolny, odległość, czynnik w busie); podgląd bloku i okienko kontroli: dostępność, czynnik, SLA, kolizja z kolejną wizytą + akcje Przydziel / Przesuń kolejną.
- Do sprawdzenia: brak R32 w busie na montaż (ZD-118), brak części dla wizyty czekającej.
- **Avero podpowiada technika**; decyzja zostaje u dyspozytora.

## Mapa
- MapLibre + OpenStreetMap, styl przygaszony z tokenów `--map-*`.
- Każdy technik ma stały kolor (awatar, trasa, piny, znacznik busa). Linia ciągła = przejechane, przerywana = plan, romb = zgłoszenie bez technika, K = baza.
- Wybrany bus: trasa wyróżniona, pozostałe przygaszone, karta z prędkością, czasem przyjazdu i częściami na pokładzie.
- Lewa kolumna: busy ze stanem i kolorowymi ikonami (km, czynnik, braki) oraz zgłoszenia z proponowanym technikiem.
