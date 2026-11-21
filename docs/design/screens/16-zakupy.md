# Zakupy

Makiety: ekrany `zakupy` (zapotrzebowanie) i `zamówienie zakupowe` w `Main.dc.html` (jasne i ciemne). Scenariusz: piątek 20 lis 2026, 8:40. Opiera się na magazynie z backendu (`packages/api-client/src/stock.ts`: dokumenty PZ/RW/MM/WZ, rezerwacje, minima magazynu i busów, uzupełnianie busów) i PRODUCT_PLAN etap 5 (dostawcy, cenniki, zapotrzebowanie i zamówienia). Rejestr dostawców, cenniki i zamówienia zakupowe są **nowe** (bez backendu).

## Zapotrzebowanie (domyślny widok)
- Nagłówek: Zapotrzebowanie / Zamówienia / Dostawcy / Cenniki; opcje widoku; „Nowe zamówienie” (C).
- Filtry: miejsca (magazyn główny + busy), horyzont („Potrzebne do 4 gru” = 2 tygodnie). Fakty: w drodze, zakupy w miesiącu.
- Jedno zdanie zasady liczenia nad tabelą (do zamówienia = potrzeby + minima − dostępne − w drodze).
- Grupy po dostawcy z najlepszą ceną (`--bg-raised`): nazwa, liczba pozycji, termin dostawy (warunki w podpowiedzi), próg darmowej dostawy (zielony „darmowa dostawa” albo ostrzeżenie „brakuje X zł” z podpowiedzią, co dołożyć), suma, „Utwórz zamówienie”.
- Kolumny: pozycja (nazwa + indeks mono + ewentualna kapsułka zgodności), skąd potrzeba (ZS-, ZG-, „min. …”), potrzebne do, dostępne (wyliczenie w podpowiedzi), zamówić (pole liczby — jedyne edytowalne), cena netto (inne ceny w podpowiedzi), wartość.
- Podsumowanie pod tabelą: liczba pozycji i dostawców, razem netto.

## Podgląd pozycji (340 px)
- Indeks, nazwa, rodzaj, GWP / butla zwrotna.
- Uwaga zgodności (F-gaz) — tylko gdy dotyczy: zasada, termin, co Avero blokuje, czego wymaga przy PZ.
- Ceny zakupu: cennik dostawców, oferta handlowca (ważność), ostatni zakup (PZ) + trend.
- Stan: magazyn, busy, rezerwacje, minimum, po dostawie.
- Urządzenia z tym czynnikiem (ładunek, t CO₂e, częstotliwość kontroli).

## Zamówienie ZK/… (rekord)
- Okruszki Zakupy › Zamówienia › ZK/2026/11/031; PDF, link, więcej.
- Tytuł: dostawca · cel (np. „pompa ciepła dla ZS-1052”); meta: dostawca, zlecenie, kto utworzył. Kapsułki: stan dostawy, wartość netto (brutto w podpowiedzi), zapas do terminu zlecenia.
- Ścieżka statusu: Szkic → Wysłane → Potwierdzone → Przyjęcie → Faktura (KSeF) → Rozliczone.
- Przyjęcie dostawy: pozycje z ilością zamówioną, potwierdzoną i przyjmowaną (pole), cena, stan („zgodne” / „brak · data”). Urządzenie wymaga numeru seryjnego. Zdjęcie WZ dostawcy.
- „Po zatwierdzeniu Avero”: PZ, rezerwacja pod zlecenie, karta urządzenia, przypomnienie o brakującej pozycji.
- Akcje: „Zgłoś rozbieżność…” (⇧R) i „Przyjmij N z M pozycji” (akcent, ⌘↵).
- Panel: dostawca (handlowiec, warunki), wartość (netto, VAT, brutto, w kosztach zlecenia), faktura zakupowa z KSeF, historia.

## Stany
- Puste zapotrzebowanie: „Nic do zamówienia. Stany są powyżej minimów, a zlecenia mają materiały.”
- Pozycja bez ceny u żadnego dostawcy: grupa „Bez dostawcy” z akcją „Przypisz dostawcę”.
- Szkielety wierszy przy ładowaniu; błąd wysyłki e-maila do dostawcy: zamówienie zostaje „Szkic” + komunikat z „Spróbuj ponownie”.

## Dostawcy i Cenniki
Opisane w `21-dostawcy-cenniki.md`.
