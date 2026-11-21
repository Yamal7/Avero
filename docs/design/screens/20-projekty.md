# Projekty

Makiety: ekrany `projekty` i `projekt` w `Main.dc.html` (jasne i ciemne). Scenariusz: sobota 21 lis 2026. Moduł **nowy** (bez backendu) — realizuje PRODUCT_PLAN etap 5 (plan vs rzeczywiste koszty, wynik) dla prac wieloetapowych. Projekt spina istniejące rekordy: szansa, oferta, zlecenia, zakupy, faktury, obiekt.

## Lista
- Nagłówek: W realizacji / Moje / Zakończone; oś czasu wszystkich projektów (⇧G); opcje widoku; „Nowy projekt” (C — z wygranej szansy albo pusty).
- Filtr kierownika. Fakty: wartość w realizacji, marża — prognoza (plan w podpowiedzi), do zafakturowania w miesiącu, liczba projektów poniżej planu (ostrzeżenie).
- Kolumny: numer (mono), projekt (ikona rodzaju instalacji, nazwa, klient · miasto), etap (nazwa · n z m, szczegóły w podpowiedzi), postęp (pasek + %), koniec (opóźnienie na czerwono), wartość netto, marża plan → prognoza (ostrzeżenie przy spadku), kierownik.
- Zakończone ostatnio pod listą: marża plan → wynik.

## Rekord projektu
- Okruszki Projekty › PJ-…; link; więcej (edytuj, zamknij projekt, archiwizuj).
- Tytuł, meta (klient · miasto, okres i tydzień, kierownik), „Nowe zlecenie w projekcie” (C).
- Kapsułki: wartość (umowa i oferta w podpowiedzi), postęp, marża prognoza vs plan (ostrzeżenie), stan terminu (bufor).
- Zakładki: Przegląd, Zlecenia, Zakupy, Faktury, Dokumenty, Zdjęcia.
- **Harmonogram**: wiersze etapów (nazwa, % albo „gotowe”), pasek na osi miesięcy; ukończone — zielone, w toku — wypełnienie postępem, przyszłe — szare; pionowa linia i etykieta „dziś” w akcencie. Przeciąganie przesuwa etap i jego zlecenia.
- **Koszty**: plan / do dziś / prognoza / różnica dla materiałów, robocizny, usług obcych, dojazdów i sprzętu; razem. Odchylenie z ostrzeżeniem, notatka z przyczyną (protokół konieczności) i akcją „Przygotuj aneks · +kwota” (podpowiedź: wycena i marża po aneksie).
- **Harmonogram płatności**: transze z kwotą, stanem (zapłacona / wystawiona z terminem / po odbiorze) i dokumentem; zapłacono X z Y + pasek.
- Panel 320 px: Najbliższe dni (prace, dostawy, spotkania), Zespół (własny i podwykonawcy), Ryzyka (z wagą), Powiązane (szansa, oferta, umowa, obiekt).
- Klient widzi w portalu tylko harmonogram etapów, protokoły do podpisu, aneksy i faktury — bez kosztów i marży.

## Oś czasu wszystkich projektów (ekran `projekty oś`)
- Przełącznik Lista / Oś czasu (⇧G) w nagłówku listy; te same zakładki (W realizacji, Moje, Zakończone).
- Zakres i skala: „sie 2026 – lut 2027”, Tygodnie / Miesiące / Kwartały; ← → przesuwa o miesiąc. Fakty: w realizacji, do zafakturowania w miesiącu, konflikty ludzi (ostrzeżenie).
- Kolumna 300 px: rozwiń, ikona rodzaju instalacji, nazwa, numer i klient, postęp %, kierownik. Pasek projektu od startu do końca, wypełniony postępem (kolor serii), flaga odbioru końcowego (podpowiedź: transza po odbiorze).
- Rozwinięty projekt pokazuje etapy jak w rekordzie: gotowe — zielone ze znakiem, w toku — wypełnione postępem z %, przyszłe — szare.
- Przerwy (np. świąteczna) jako kreskowanie w pasku.
- „Dziś” — pionowa linia i etykieta w akcencie na całej wysokości.
- **Zespół w projektach**: osoby i podwykonawcy z przydziałami do etapów (kod projektu i etap w pasku). Nakładające się przydziały jednej osoby — dwa paski jeden pod drugim z obwódką ostrzeżenia i ikoną przy nazwisku.
- Notatka konfliktu pod osią: kto, kiedy, które projekty, propozycja rozwiązania; „Pokaż w Planowaniu” (tydzień i filtr osoby). Avero niczego nie przesuwa samo.
- Przeciąganie paska etapu przesuwa etap i jego zlecenia (jak w rekordzie, z potwierdzeniem, gdy dotyczy zleceń z klientem).

## Stany
- Nowy projekt z szansy: etapy z szablonu rodzaju prac (np. VRV: przygotowanie, dostawy, instalacja, montaż, elektryka, uruchomienie, odbiór), budżet z oferty, harmonogram płatności z warunków oferty.
- Projekt bez prognozy (brak postępu): „Prognoza po pierwszym raporcie postępu”.
