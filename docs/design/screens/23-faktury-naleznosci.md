# Faktury: należności i rozliczenie zleceń

Makiety: ekrany `faktury` (zakładka Należności, panel Hotel Oliwski) i `faktury do wystawienia` (panel ZS-1047), jasne i ciemne. Pasek boczny: Finanse i magazyn › Faktury (rekord faktury — `10-faktura.md`). Scenariusz: czwartek 19 lis 2026, 16:00 (jak Raporty). PRODUCT_PLAN, etap 6: terminy płatności, zaliczki, należności i statusy rozliczenia zlecenia.

## Nagłówek modułu
Zakładki: Należności, Do wystawienia, Wszystkie, Zaliczki. „Nowa faktura” (C) — ze zlecenia, oferty albo pusta.

## Należności
- Karta „Do zapłaty”: suma, po terminie (kwota i liczba faktur), średni czas zapłaty z 90 dni; pasek wieku (przed terminem przygaszony, 1–30 ostrzeżenie, 31–60 pomarańczowy, > 60 błąd) z legendą i kwotami — te same progi co w Raportach.
- **Wpłata do dopasowania**: wpłata z wyciągu (import lub integracja banku), propozycja faktury po kwocie i tytule; „Dopasuj do …” albo „Inna faktura…”. Bez dopasowania faktura nie jest zapłacona.
- Lista po terminie, od najstarszej: klient (miasto, umowa, „usługi wstrzymane”), faktura (kilka faktur klienta w jednym wierszu „+1”), brutto, dni po terminie (kolor wg wieku), ostatni krok.
- Pod listą: liczba faktur i klientów; przed terminem z największą pozycją.

## Panel należności klienta (360 px)
- Klient, opiekun, suma, najstarsza.
- Faktury klienta z terminami.
- **Przypomnienia** (oś): przed terminem (automatycznie 3 dni przed), 7 dni po (automatycznie, z linkiem do płatności), telefon z notatką i obietnicą zapłaty, niedotrzymana obietnica (ostrzeżenie), proponowany kolejny krok.
- **Wezwanie do zapłaty** (proponowane przy 30 dniach): należność główna, odsetki ustawowe za opóźnienie w transakcjach handlowych (stawka z Ustawień), rekompensata za koszty odzyskiwania (40 € do 5 000 zł, 70 € do 50 000 zł, 100 € powyżej — za każdą fakturę; tylko firmy; doliczenie opcjonalne).
- **Prace u klienta**: otwarte zgłoszenia i obowiązki F-gaz — awarii i obowiązków prawnych nie wstrzymujemy; wstrzymujemy propozycje sprzedażowe.
- „Przygotuj wezwanie do zapłaty” (akcent, ⌘↵) — szkic PDF i e-maila, wysyłka po sprawdzeniu; „Zapisz nową obietnicę zapłaty”.

## Do wystawienia (rozliczenie zleceń)
- Zakończone zlecenia i etapy projektów bez faktury. Fakty: gotowe (netto), wstrzymane, najdłużej czeka.
- Kolumny: zlecenie (tytuł, numer, klient, technik, data), rozliczenie (z czego się składa), netto, stan: **Gotowe** (protokół podpisany), **Brak numeru PO** (pole własne firmy blokuje wystawienie), **Po odbiorze** (transza projektu), **Z faktury zbiorczej** (umowa — 1. dnia miesiąca), **Bez faktury** (gwarancja — rozliczenie w reklamacji, wiersz przygaszony).
- „Wystaw N faktury” (akcent) — tylko gotowe, z podglądem przed wysłaniem.
- Zasada: faktury dla firm przez KSeF po wystawieniu; dla osób prywatnych e-mail z linkiem do płatności.

## Panel rozliczenia zlecenia
- Pozycje z protokołu (część z wydania RW z marżą w podpowiedzi, robocizna z czasem z protokołu, materiały, dojazd wg strefy), netto / VAT / brutto.
- Sprawdzenie: protokół podpisany, części zgodne z wydaniem, umowa nie obejmuje (zlecenie płatne), nabywca z NIP → KSeF.
- Płatność: termin z karty firmy, wysyłka, konto (zamaskowane, z Ustawień).
- „Podgląd faktury” — numer nadawany przy wystawieniu.

## Stany
- Brak należności po terminie: „Wszystkie faktury zapłacone w terminie.” + przed terminem.
- Brak do wystawienia: „Wszystkie zakończone zlecenia są rozliczone.”
- Integracja banku niepodłączona: zamiast wpłat do dopasowania — „Zaimportuj wyciąg (MT940, CSV)”.
- Szkielety przy ładowaniu.

## Uprawnienia
Biuro i właściciel. Technik nie widzi należności ani kwot; widzi tylko, że zlecenie czeka na podpis protokołu. Klient (portal): swoje faktury, terminy i „Zapłać”.
