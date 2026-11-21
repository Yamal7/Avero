# Dostawcy i cenniki

Makiety: ekrany `dostawcy` i `cenniki` w `Main.dc.html` (jasne i ciemne), zakładki modułu Zakupy. Scenariusz: piątek 20 lis 2026, 8:40 (jak Zapotrzebowanie). Rejestr dostawców, warunki handlowe, cenniki i historia cen są **nowe** (PRODUCT_PLAN, etap 5: „rejestr dostawców, import i aktualizacja cenników z podglądem zmian; historia cen i kilka cen zakupu produktu”).

## Dostawcy (rejestr)
- Nagłówek Zakupy z zakładkami Zapotrzebowanie / Zamówienia / Dostawcy / Cenniki; „Nowy dostawca” (C).
- Filtry: kategorie, aktywni. Fakty: zakupy 12 mies. (przyjęte PZ), odsetek dostaw na czas.
- Kolumny: dostawca (nazwa, kod `DS-NNN` mono, co sprzedaje), warunki (dwie linie: płatność, dostawa / próg darmowej dostawy), cennik (stan: aktywny — zielona kropka, zaplanowany — zegar, wygasa — ostrzeżenie, „bez cennika” — ceny z faktur), zakupy 12 mies., na czas, otwarte zamówienia.
- Kolejność: wartość zakupów malejąco.
- Pod tabelą uwaga o wygasającym cenniku z akcją „Poproś o cennik…” — tworzy **szkic** e-maila do handlowca; nic nie wychodzi bez wysłania przez użytkownika.

## Panel dostawcy (340 px)
- Kod, nazwa, co sprzedaje, adres; „Nowe zamówienie”, „Importuj cennik”.
- Kontakt: handlowiec (telefon), adres e-mail zamówień (tam Avero wysyła PDF ZK).
- Warunki: płatność, dostawa, próg darmowej dostawy, rabat od cennika producenta, limit kupiecki (otwarte zamówienia + niezapłacone faktury).
- Cenniki dostawcy ze stanem.
- Zakupy 12 mies.: słupki miesięczne (jedna seria, podświetlony najwyższy i bieżący miesiąc, kwoty w podpowiedziach); na czas, otwarte zamówienia.

## Cenniki
- Zdanie zasady: Avero porównuje ceny z cenników, ofert handlowców i ostatnich faktur; koszt w katalogu zmienia się dopiero po zatwierdzeniu importu (import opisany w `17-katalog.md`).
- Kolumny: cennik i dostawca, ważność, liczba pozycji, rabat, ostatnia zmiana (liczba zmian, średnia), stan (aktywny / zaplanowany / oferta / wygasa).
- **Oferty handlowców** to osobny rodzaj cennika: ceny z e-maili przypisane do pozycji, z datą ważności.
- Dostawcy bez cennika: podpis pod tabelą („ceny z faktur”).

## Panel cennika
- Dostawca, nazwa, liczba pozycji, skąd plik (e-mail dostawcy, wczytany automatycznie) i kto zatwierdził.
- Zmiany ostatniej aktualizacji: pozycja, stary → nowy koszt, zmiana %; „N kolejnych zmian”.
- Historia ceny wybranej pozycji (linia 2 px, kropki na ostatnim zakupie i bieżącej cenie, etykiety tylko tych dwóch wartości, oś z trzema liniami siatki); trend od ostatniego zakupu.
- Ten sam towar u innych dostawców (najniższa wyróżniona wagą, nie kolorem).
- Na co wpływa: koszt w katalogu, cena dla klienta (koszt + marża), wysłane oferty bez zmian.

## Stany
- Brak dostawców: „Dodaj pierwszego dostawcę albo zaimportuj listę z pliku” + „Nowy dostawca” (C).
- Brak cenników: „Ceny zakupu pochodzą z faktur. Zaimportuj cennik, żeby porównywać dostawców.” + „Importuj cennik”.
- Automatyczny import z e-maila nie powiódł się (inny układ pliku): wiersz cennika z ostrzeżeniem „do sprawdzenia” i akcja „Dopasuj kolumny”.
- Szkielety wierszy przy ładowaniu.

## Uprawnienia
Ceny zakupu, rabaty i limity widzi biuro i właściciel. Technik widzi dostawcę i adres odbioru (zakupy awaryjne), bez cen zakupu. Klient nigdy.
