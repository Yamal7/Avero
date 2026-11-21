# Leady i Szanse

Makiety: ekrany `leady` i `szanse` w `Main.dc.html` (jasne i ciemne). Scenariusz: piątek 13 lis 2026, 9:14. Backendu jeszcze nie ma (PRODUCT_PLAN, etap 4); projekt korzysta z istniejących klientów, opiekuna handlowego i zadań CRM (`docs/CRM_WORK.md`), szablonów instalacji i ofert (`docs/OFFERS.md`).

## Leady — lista
- Nagłówek: widoki Do kontaktu / W kwalifikacji / Zakwalifikowane / Odrzucone; opcje widoku (⇧V); „Nowy lead” (C).
- Filtry: opiekun, „+ Filtr”. Po prawej fakt: średni czas pierwszego kontaktu w miesiącu i cel (2 h).
- Tabela grupowana (Do pierwszego kontaktu / W kwalifikacji). Kolumny: źródło (ikona: formularz, telefon, e-mail, polecenie, od technika — szczegóły w podpowiedzi), kontakt (nazwa + osoba/telefon), zainteresowanie (kapsułka z ikoną rodzaju: klimatyzacja, pompa ciepła, chłodnictwo, wentylacja), miejsce, szacunek (z szablonów instalacji, w podpowiedzi który), „Kontakt do” (zegar; ostrzeżenie < 1 h, czerwony po terminie) albo następny krok (np. „oddzwonić 10:00”, „uchwała 24 lis”), opiekun (puste kółko = brak).
- Lead z Skrzynki (np. zapytanie ofertowe) trafia tu z przypiętym wątkiem.

## Leady — podgląd (360 px)
- Źródło i godzina, telefon (⇧C), więcej. Nazwa, temat · miejsce. Kapsułki: termin kontaktu, opiekun (A).
- Z formularza: telefon/e-mail (zgoda na kontakt), lokal, pomieszczenia, oczekiwany termin.
- Wstępny dobór: szablon instalacji, moce, widełki ceny netto, czy termin jest możliwy (z obłożenia ekip) — oznaczony „szablon”, do potwierdzenia na oględzinach.
- „Do ustalenia w rozmowie”: lista kontrolna kwalifikacji (np. zgoda wspólnoty, skropliny, termin oględzin).
- Akcje: „Odrzuć…” (⇧D, powód: poza zasięgiem, za mała wartość, rezygnacja, duplikat) i „Zakwalifikuj i umów oględziny” (akcent, ⌘↵) — tworzy szansę, oględziny i ustawia opiekuna.

## Szanse — tablica etapów
- Nagłówek: Otwarte / Moje / Wygrane / Przegrane; przełącznik Tablica (⇧B) / Tabela (⇧T); opcje widoku; „Nowa szansa” (C).
- Filtry: opiekun, termin decyzji, „+ Filtr”. Linia faktów: w lejku, ważona (prawdopodobieństwa etapów w podpowiedzi), wygrane w miesiącu, „N po terminie” (czerwone, lista w podpowiedzi).
- Kolumny: Kwalifikacja, Oględziny, Wycena, Oferta, Negocjacje — nagłówek z liczbą i sumą (ważona w podpowiedzi). Pod Negocjacjami podsumowanie wygranych i przegranych z powodami.
- Karta (`--bg-raised`, 12 px): ikona rodzaju + tytuł, klient · miasto, kapsułki (oferta mono z wersją, otwarcia oferty przez klienta, następne działanie z terminem — czerwone po terminie, oględziny OG-…), wartość netto (`tabular-nums`) i opiekun.
- Przeciąganie kart między etapami; przejście do „Oferta” wymaga oferty, do „Wygrana” — akceptacji (online sama) lub potwierdzenia, „Przegrana” — powodu.
- Tabela (widok alternatywny): te same pola jako kolumny + termin decyzji, źródło, dni w etapie.

## Stany
- Pusta lista leadów „Do kontaktu”: „Brak nowych zapytań. Formularz na stronie i Skrzynka dodają je tutaj.” + „Nowy lead” (C).
- Pusta kolumna tablicy: tylko „+ Dodaj”.
- Ładowanie: szkielety wierszy / kart. Błąd zapisu przeniesienia: karta wraca na miejsce + komunikat z „Spróbuj ponownie”.

## Rekord szansy (ekran `szansa`, plansza 1480 px)
Przykład: **SZ-0179** Marek Zieliński, stan na czwartek 19 lis 2026 (po akceptacji).
- Nagłówek: okruszki Sprzedaż › Szanse › SZ-0179, pozycja na liście („3 z 6 wygranych”, J/K), link, więcej.
- Tytuł 18 px, meta (klient, adres, obciążenie cieplne), kapsułki: status (Wygrana · 18 lis), wartość netto (brutto w podpowiedzi), czas od zapytania (średnia dla rodzaju w podpowiedzi), opiekun.
- Ścieżka etapów na `--bg-raised`: kropka + linia + nazwa + data; pominięty etap szary z „pominięte”; wygrana zielonym kółkiem z ptaszkiem.
- Historia (najnowsze na górze, grupy dni z dniem tygodnia): ikona rodzaju zdarzenia w kółku, tytuł, autor (awatar), godzina, opis, kapsułki dokumentów (mono). Rodzaje: formularz, rozmowa, oględziny, wysłanie oferty (wersja), otwarcia oferty przez klienta, akceptacja z podpisem, płatność, działania Avero.
- Panel 340 px: Klient (telefon), Wartość (netto, brutto z powodem stawki VAT, marża z progiem, zaliczka, pozostało), Sprzedaż (źródło, pierwszy kontakt w godzinach pracy vs cel 2 h, opiekun), Dalej (montaż, propozycja umowy serwisowej, przegląd gwarancyjny), Powiązane (OG, OF, FZ, ZS, ZD), „Otwórz zlecenie ZS-1052”.
- Szansa otwarta: zamiast „Dalej” — następne działanie z terminem i akcje „Zaplanuj działanie”, „Wygrana”, „Przegrana…” (powód).
