# Obiekty

Makiety: ekrany `obiekty` i `obiekt` w `Main.dc.html` (jasne i ciemne). Scenariusz: piątek 20 lis 2026. Opiera się na backendzie: `locations` (obiekt) → `installations` → `devices`; listę urządzeń w kodzie pokazuje dziś `dashboard/installations`. Pola nazwy, rodzaju, dostępu, opiekuna i osób na miejscu są **nowe**.

## Lista
- Nagłówek: Wszystkie / F-gaz po terminie / Z umową / Archiwum; przełącznik Lista / Mapa (⇧M, OSM); opcje widoku; „Nowy obiekt” (C).
- Wyszukiwarka (/) po nazwie, adresie, kliencie; filtry rodzaju i rejonu. Fakty: liczba urządzeń, suma t CO₂e, liczba kontroli po terminie (lista w podpowiedzi).
- Kolumny: obiekt (pinezka, nazwa, adres), klient, rodzaj, urządzenia · t CO₂e (skład w podpowiedzi), kontrola F-gaz (tarcza + data; po terminie czerwone, ≤ 30 dni ostrzeżenie, poniżej 5 t „nie dotyczy”), umowa (kapsułka mono), otwarte sprawy, ostatnia wizyta (data · technik).
- Domyślne sortowanie: najpilniejsza kontrola F-gaz. Obiekt przed montażem: kapsułka „montaż 30 lis” zamiast liczby urządzeń.

## Rekord obiektu
- Okruszki Obiekty › OB-…; nawiguj (otwiera nawigację do adresu), link, więcej (edytuj, scal, archiwizuj).
- Tytuł, meta (adres, klient, opiekun), akcje „Nowe zgłoszenie” (C) i akcja wynikająca ze stanu obiektu (tu: „Zaplanuj kontrolę szczelności”, akcent).
- Kapsułki stanu: kontrola F-gaz, liczba urządzeń i t CO₂e, należność po terminie, umowa.
- Zakładki: Przegląd, Urządzenia, Historia serwisu, Dokumenty, Zdjęcia (wewnętrzne).
- Instalacje i urządzenia: nagłówek instalacji (ikona rodzaju, nazwa, rok montażu, miejsce, „+ urządzenie”), wiersze urządzeń (kod, nazwa, miejsce i numer seryjny, czynnik i ładunek, t CO₂e, kontrola szczelności, gwarancja). Parowniki i jednostki wewnętrzne z jednego obiegu — „obieg agregatu”, ładunek liczony na jednostce głównej.
- Ostatnie wizyty: data, ikona rodzaju, tytuł, technik, opis, dokumenty (ZG, RW, PR, KS), zdjęcia.
- Panel 340 px: Dostęp (wjazd, klucze, godziny pracy, najlepsza pora prac), Na miejscu (osoby z rolą i telefonem), Propozycje Avero (modernizacja → lead; umowa serwisowa → oferta umowy), Finanse (obrót w roku, należność po terminie, warunki płatności).
- Technik w aplikacji widzi dostęp, osoby na miejscu, urządzenia i historię, bez finansów i propozycji.

## Stany
- Obiekt bez urządzeń: „Dodaj instalację” + import z protokołu uruchomienia.
- Adres bez współrzędnych: ostrzeżenie „Nie znaleziono na mapie — popraw adres albo wskaż punkt”.
