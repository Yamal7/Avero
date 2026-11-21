# Reklamacje i gwarancje

Makiety: ekrany `reklamacje` (lista z panelem) i `reklamacja` (rekord RK-2026-017), jasne i ciemne. Pasek boczny: Serwis › Reklamacje (po Przeglądach). Scenariusz: sobota 21 lis 2026. Moduł jest **nowy** (PRODUCT_PLAN, etap 6: reklamacje i naprawy gwarancyjne powiązane z urządzeniem i historią serwisową, przypomnienia o końcu gwarancji).

## Pojęcia
- **Reklamacja od klienta** (`RK-RRRR-NNN`) — zawsze przy urządzeniu (i zgłoszeniu, z którego powstała). Podstawa: gwarancja montażu (nasza), gwarancja producenta, rękojmia (konsument), gwarancja naprawy.
- **Roszczenie do dostawcy** — część reklamacji albo samodzielne (wadliwy towar z dostawy): dostawca, numer zgłoszenia u dostawcy, co uznał (część, ryczałt robocizny, korekta faktury), co trzeba odesłać i do kiedy.
- Etapy: Zgłoszona → Diagnoza → Decyzja → Naprawa → Rozliczenie → Zamknięta; albo Odrzucona (z uzasadnieniem i protokołem).

## Lista
- Zakładki: Od klientów, Do dostawców, Gwarancje kończą się (urządzenia, którym gwarancja kończy się w 60 dni — propozycja przeglądu lub umowy).
- Filtry: otwarte i z ostatnich 30 dni, podstawa. Fakty: koszt firmy i zwroty od dostawców od początku roku.
- **Do decyzji**: zgłoszenie dotyczy urządzenia na gwarancji — Avero pyta, czy obsłużyć je jako reklamację, czy jako zwykłe (płatne) zgłoszenie. Sam nie zmienia statusu.
- Kolumny: stan (ikona + słowo; odrzucona przekreślonym kółkiem, wiersz przygaszony), reklamacja (tytuł, numer, klient), urządzenie (nazwa, kod), podstawa (kapsułka z datą końca w podpowiedzi), termin (najbliższa rzecz do zrobienia; termin odpowiedzi konsumentowi w kolorze ostrzeżenia), opiekun.

## Do dostawców (ekran `reklamacje dostawcy`)
- Roszczenia z reklamacji klientów i z przyjęć towaru (wada wykryta przed montażem). Fakty: do odzyskania (uznane lub wysłane, nierozliczone), części do odesłania.
- Kolumny: stan (Szkic / Wysłane / Uznane / Odrzucone / Zamknięte — ikona + słowo), towar i dostawca z numerem zgłoszenia u dostawcy, źródło (RK albo PZ) i żądanie (część, ryczałt robocizny, korekta faktury, zwrot kosztu), wartość (cena zakupu netto), dalej (termin odpowiedzi dostawcy w kolorze ostrzeżenia, gdy zostały ≤ 3 dni).
- Szkic roszczenia powstaje z diagnozy w reklamacji klienta i czeka na jej uznanie.
- Pod tabelą zasada magazynu: części do reklamacji leżą na osobnej półce z etykietą roszczenia, poza wydaniami i inwentaryzacją.
- Panel roszczenia: termin odpowiedzi wg warunków dostawcy, towar (ZK, PZ, gdzie zamontowany, kiedy awaria, gwarancja dostawcy), zgłoszenie (kanał, zdjęcia), żądanie (kwota, czy obejmuje robociznę, co z uszkodzoną częścią). „Zapisz odpowiedź dostawcy” (⌘↵), „Przygotuj przypomnienie” (szkic).

## Gwarancje kończą się (ekran `reklamacje gwarancje`)
- Urządzenia, którym gwarancja montażu lub producenta kończy się w 60 dni. Fakt: ilu klientów bez umowy.
- Kolumny: urządzenie (kilka urządzeń jednego obiektu w jednym wierszu), klient i rodzaj gwarancji, koniec (≤ 7 dni ostrzeżeniem, pełna data w podpowiedzi), dalej, opiekun.
- Stany „dalej”: przegląd umówiony, kontakt bez odpowiedzi (podpowiedź kanału), **wstrzymane — należność po terminie** (decyzja właściciela), umowa obejmuje (wiersz przygaszony), przypomnienie zaplanowane.
- Zasada pod tabelą: propozycje 60 i 30 dni przed końcem, wysyłka po zatwierdzeniu; pomijani klienci z umową i z należnością po terminie.
- Panel: gwarancje z warunkiem (przegląd co 12 mies.), propozycja (przegląd przed końcem gwarancji — usterki wykryte do końca naprawiane na koszt producenta; potem umowa), kontakt (e-mail nieotwarty; SMS niedostępny, dopóki kanał czeka na dostawcę). „Zadzwoń i umów przegląd”, „Nie proponuj więcej”.

## Panel reklamacji (360 px)
- Numer, tytuł, klient i kanał, ścieżka etapów.
- **Rękojmia wobec konsumenta**: odpowiedź w 14 dni od zgłoszenia, inaczej reklamacja uznana — licznik dni w nocie ostrzegawczej.
- Diagnoza z wizytą, zdjęciami (wewnętrzne — klient ich nie widzi) i odczytami.
- Gwarancje urządzenia: rękojmia, montaż, producent (warunek, np. przegląd co 12 mies., ze znakiem wykonania).
- Propozycja: ile płaci klient, co idzie do dostawcy, szacowany koszt firmy, termin naprawy.
- „Uznaj i przygotuj odpowiedź” (akcent, ⌘↵) tworzy **szkic** odpowiedzi; „Odrzuć…” wymaga uzasadnienia i protokołu. Nic nie wychodzi do klienta bez zatwierdzenia.

## Rekord
- Okruszki, tytuł, klient, osoba zgłaszająca, data i zgłoszenie źródłowe; etapy jako kapsułki (bieżący wyróżniony tłem).
- **Przebieg**: zdarzenia z datą (pełna data w podpowiedzi), autorem i powiązanymi dokumentami (ZG, ZS, PZ, e-mail). Zaplanowana naprawa ikoną kalendarza w akcencie.
- **Rozliczenie**: klient płaci, zwrot od dostawcy, robocizna (koszt godziny), dojazdy, wynik reklamacji. **Po naprawie**: lista do zrobienia (protokół do dostawcy, odesłanie części z terminem, nota — szkic do sprawdzenia).
- Panel urządzenia: gwarancje z warunkami, historia urządzenia, inne reklamacje klienta.

## Stany
- Brak reklamacji: „Brak otwartych reklamacji. Zgłoszenia urządzeń na gwarancji pokażą się tu do decyzji.”
- Termin odpowiedzi konsumentowi minął bez odpowiedzi: wiersz z ikoną błędu „Uznana z mocy prawa” i akcja „Zaplanuj naprawę”.
- Szkielety przy ładowaniu.

## Uprawnienia
Biuro i właściciel: wszystko. Technik: reklamacje swoich zleceń, diagnoza i zdjęcia, bez kosztów i rozliczeń z dostawcą. Klient (portal): stan reklamacji i odpowiedź — bez kosztów, zdjęć wewnętrznych i roszczeń do dostawców.
