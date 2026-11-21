# Portal klienta firmowego

Makieta: `Klient-portal.dc.html` (1440 px, jasny — ton widoków klienta jak w ofercie). Klient: Kancelaria Wit (Krzysztof Lis). Scenariusz: sobota 21 lis 2026. PRODUCT_PLAN, etap 6: portal klienta — pakiety, rozliczenia i faktury, ponowne zamówienie usługi.

## Zasady
- Link stały i osobisty (logowanie linkiem e-mail, bez hasła w Avero); stopka „Link osobisty — nie przekazuj go dalej”.
- Klient widzi tylko swoje dane. **Nigdy**: marży, cen zakupu, dostępności, zdjęć wewnętrznych, roszczeń do dostawców, notatek wewnętrznych, pól własnych bez oznaczenia „dla klienta”.
- Ton jak w widokach klienta: ciepłe tło, karty 14 px, większe teksty, mniej gęsto niż w aplikacji.

## Układ
- Nagłówek: logo firmy, zakładki Przegląd / Faktury / Urządzenia / Zgłoszenia / Umowa, nazwa klienta i osoby.
- Tytuł: nazwa klienta, umowa i liczba urządzeń; „Zamów usługę”, „Zgłoś usterkę” (akcent).
- Trzy karty stanu: do zapłaty (0 zł — „wszystkie opłacone”, albo kwota z „Zapłać”), najbliższa wizyta (kiedy, kto, czy płatna), co wymaga decyzji klienta (np. termin kontroli szczelności po terminie → wybór terminu, ekran `Klient-przeglad-termin`).
- Zgłoszenia i reklamacje: reklamacja z opisem dla klienta (bez kosztów firmy) i ścieżką etapów.
- Faktury: opis, numer, data, brutto, stan zapłaty, PDF; „Pobierz wszystkie z roku (ZIP)”.
- Urządzenia: nazwa i miejsce, kod, gwarancja albo przegląd w umowie, stan (kontrola po terminie z „Wybierz termin”, naprawa zaplanowana, sprawny).
- Prawa kolumna: umowa (okres, przeglądy, czas reakcji, rabat, PDF), oferta czekająca na decyzję (link do widoku oferty), **Zamów ponownie** (usługi z historii klienta z ceną netto po rabacie z umowy; termin proponuje biuro).
- Stopka: dane kontaktowe firmy z Ustawień.
