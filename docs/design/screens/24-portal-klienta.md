# Portal klienta firmowego

Makieta: `Klient-portal.dc.html` (1440 px, jasny — ton widoków klienta jak w ofercie). Klient: Kancelaria Wit (Krzysztof Lis). Scenariusz: sobota 21 lis 2026. PRODUCT_PLAN, etap 6: portal klienta — pakiety, rozliczenia i faktury, ponowne zamówienie usługi.

## Zasady
- Link stały i osobisty (logowanie linkiem e-mail, bez hasła w Avero); stopka „Link osobisty — nie przekazuj go dalej”.
- Klient widzi tylko swoje dane. **Nigdy**: marży, cen zakupu, dostępności, zdjęć wewnętrznych, roszczeń do dostawców, notatek wewnętrznych, pól własnych bez oznaczenia „dla klienta”.
- Ton spokojny, jak dokument (zmiana 22 lis 2026): białe tło, **bez kart i kafelków**. Sekcje to nagłówek z linią i lista wierszy w jednej linii (44 px) z kolorową ikoną; większe teksty niż w aplikacji.

## Układ
- Nagłówek: logo firmy, zakładki Przegląd / Faktury / Urządzenia / Zgłoszenia / Umowa, nazwa klienta i osoby.
- Tytuł: nazwa klienta, umowa i liczba urządzeń; „Zamów usługę”, „Zgłoś usterkę” (akcent).
- Sekcja **Teraz** (zamiast trzech kart stanu): wiersze — najbliższa wizyta (kiedy, kto, czy płatna), co wymaga decyzji klienta z akcją w wierszu (termin kontroli → „Wybierz termin”, ekran `Klient-przeglad-termin`; oferta → „Zobacz”), do zapłaty (0 zł — „wszystkie opłacone”, albo kwota z „Zapłać”).
- Zgłoszenia i reklamacje: wiersz z numerem, krótkim stanem dla klienta (bez kosztów firmy) i najbliższym krokiem; pełna ścieżka etapów w podpowiedzi i w szczegółach.
- Faktury: opis, numer, data, brutto, stan zapłaty, PDF; „Pobierz wszystkie z roku (ZIP)”.
- Urządzenia: nazwa i miejsce, kod, gwarancja albo przegląd w umowie, stan (kontrola po terminie z „Wybierz termin”, naprawa zaplanowana, sprawny).
- Prawa kolumna (288 px, bez kart): umowa jako lista właściwości (okres, przeglądy, czas reakcji, rabat, PDF), **Zamów ponownie** (usługi z historii klienta z ceną netto po rabacie z umowy; termin proponuje biuro).
- Stopka: dane kontaktowe firmy z Ustawień.

## Aplikacja klienta na telefon (22 lis 2026)
Makiety `Klient-telefon.dc.html` i `-ciemny` (390 px), wzór jak aplikacja Linear na telefon — szczegóły w `26-aplikacje-telefon.md`. Ta sama treść co portal: Teraz, Zgłoszenia, Urządzenia, Faktury; pływający pasek kart (Przegląd, Urządzenia, Faktury, Zgłoszenia) i okrągły przycisk „Zgłoś usterkę”.
