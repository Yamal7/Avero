# Katalog

Makiety: ekrany `katalog` i `import cennika` w `Main.dc.html` (jasne i ciemne). Scenariusz: piątek 20 lis 2026, 16:00. Lista i pozycja odpowiadają istniejącemu backendowi (`docs/CATALOG.md`, `packages/api-client/src/catalog.ts`); historia kosztu, podpowiedzi przy wzroście kosztu i import cennika są **nowe** (PRODUCT_PLAN, etap 5).

## Lista
- Nagłówek: kategorie w kapsułkach z licznikami (Wszystkie, Urządzenia, Materiały, Usługi, Dojazd); „Importuj cennik”; opcje widoku; „Nowa pozycja” (C).
- Wyszukiwarka (/) po kodzie, nazwie, producencie, modelu; filtr producenta; status Aktywne / Archiwum.
- Fakty: próg marży z Ustawień, liczba pozycji z nieaktualnym kosztem (ostrzeżenie).
- Kolumny: pozycja (ikona rodzaju instalacji, nazwa, kod mono, kapsułka „koszt +X %”), producent (dostawca w podpowiedzi), jednostka, koszt netto, cena netto, marża (poniżej progu: ikona + kolor ostrzeżenia), stan (gdy jest indeks magazynowy), użycie (szablony, oferty, szanse — w podpowiedzi które).
- Stopka: liczba i strona (25 na stronę), przypomnienie o VAT.
- Klient i technik nie widzą katalogu ani kosztów.

## Podgląd pozycji (360 px)
- Kod, edytuj (E), więcej (duplikuj, archiwizuj). Nazwa, kategoria, jednostka, czynnik i t CO₂e dla urządzeń.
- Gdy koszt wzrósł: notatka z dokumentem źródłowym, nowa marża, propozycje „Tylko koszt” / „Koszt i cena X zł” (akcent, ⌘↵).
- Cena: koszt, cena, brutto, marża (kwota w podpowiedzi).
- Historia kosztu: data, źródło (PZ, cennik), kwota.
- Powiązania: indeks magazynowy, szablony instalacji, informacja, że oferty mają własne kopie cen.

## Import cennika (pełny ekran)
- Okruszki Katalog › Import cennika; „Nic nie zmieni się przed zatwierdzeniem”; Esc anuluje.
- Tytuł: dostawca · cennik; meta: plik (wiersze, kto, kiedy), ważny od, rabat z warunków dostawcy.
- Kapsułki wyniku: dopasowane, podwyżki, obniżki, nowe, do sprawdzenia.
- Zakładki jak kapsułki; zasada cen (marża poniżej progu → do marży docelowej, zaokrąglenie 10 zł) — do zmiany.
- Tabela: pozycja, koszt (stary → nowy), zmiana %, cena sprzedaży (stara → nowa albo „bez zmian”), marża (przy obecnej cenie → po decyzji), przełącznik Zachowaj / Podnieś.
- Panel: po zatwierdzeniu (liczby), kiedy (data ważności cennika, „zaplanowane”), na co wpłynie (szablony, oferty bez zmian, zakupy), „Zatwierdź od 1 sty 2027” (akcent).

## Stany
- Pusta kategoria: „Brak pozycji w tej kategorii” + „Nowa pozycja” (C) + „Importuj cennik”.
- Plik nieczytelny: komunikat z wymaganymi kolumnami (kod producenta, nazwa, cena katalogowa, jednostka) i przykładowym plikiem.
- Zakładka „Do sprawdzenia”: wiersz z powodem (nierozpoznany kod, inna jednostka) i akcjami „Dopasuj do pozycji…”, „Pomiń”.
