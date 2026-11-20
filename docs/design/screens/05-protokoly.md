# Protokoły: szablony i aplikacja technika (telefon)

Makiety: ekran `szablony` (desktop), `design/canvas/Technik.dc.html` z ustawieniem `szablon`: kontrola szczelności / montaż split / **uruchomienie pompy ciepła**, `wynik` (nieszczelność), `theme`.

## Szablony (Ustawienia)
- Szablon = uporządkowana lista sekcji z biblioteki: Pomiary, Checklista, Wybór, Czynnik, Części z magazynu, Czas pracy, Zdjęcia, Tekst, Zalecenia, Podpis, **Karta urządzenia**.
- Sekcja: wymagana (gwiazdka) / opcjonalna (kropka), warunek wyświetlenia (np. gdy Wynik = Nieszczelność — pod ikoną „i”), pola z normami z karty urządzenia.
- Szablon przypisany do typu zlecenia; „zapisuje do”: F-gaz/CRO, magazyn, parametry urządzenia, PDF (kapsułki z ikonami).

## Telefon technika
- 1 kolumna, pola 44 px, tekst 15 px, promienie: pola 14, przyciski 16, karty 20–24. Offline, stan synchronizacji w nagłówku.
- Nagłówek: kapsułki (status, priorytet, technik, etykieta), tytuł, ID zlecenia, klient i miejsce, urządzenie z kapsułkami (czynnik i ładunek, CO₂e lub moc, „Nowe”).
- Sekcja: tytuł + stan jako ikona (zielony ptaszek = gotowe, „2 z 4” = częściowo, szara kropka = opcjonalna, kapsułka „Wymagane”). Warunek wyświetlenia pod ikoną „i”.
- Pomiar: wartość + jednostka + kapsułka normy z ikoną celu (brak normy → brak kapsułki); poza normą — ostrzeżenie.
- Czynnik: „Zapisze do” + kapsułki RW / F-gaz / CRO.
- **Karta urządzenia** (uruchomienie pompy): numery seryjne ze skanowaniem tabliczki (przycisk „Skanuj”), ładunek fabryczny / dopełnienie / CO₂e zablokowane, kapsułki: „CRO: nie dotyczy” (z wyjaśnieniem progu), „Kontrola szczelności: nie”, „Certyfikat TL”.
- Pasek na dole przyklejony: postęp i „Zakończ” aktywny dopiero po wymaganych sekcjach. Po zakończeniu Avero tworzy/aktualizuje kartę urządzenia.
