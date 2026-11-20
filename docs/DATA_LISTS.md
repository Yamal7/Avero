# Wspólny wygląd list danych

Wdrożenie 26.10.2026 według czterech zrzutów użytkownika. Pierwszy zrzut wyznacza wygląd tabel; pozostałe podpowiadają przyszłe informacje w modułach, bez kopiowania przykładowych rekordów.

## Panel firmy

- Nagłówek z kategorią i tytułem, główne działanie po prawej.
- Wyszukiwarka z lupą, segmentowe filtry, tabela z zaokrąglonym obramowaniem, czytelnymi odstępami, opisami w drugim wierszu i kapsułkami statusów.
- Pomarańczowy akcent #FD4B01 zamiast niebieskiego; jasny i ciemny motyw.
- Przycisk „•••” otwiera okno działań rekordu. Escape zamyka okno i przywraca fokus. Nie dodaje nowych uprawnień.
- Tabele przewijają się we własnym obszarze na małym ekranie. Wyszukiwanie jest zatwierdzane Enterem lub przyciskiem strzałki. Zmiana filtra zachowuje zapytanie i rozpoczyna od pierwszej strony.

## Działające listy

| Zakładka | Informacje w tabeli |
| --- | --- |
| Katalog | Kod i nazwa, kategoria i jednostka, koszt netto, cena netto i VAT, marża |
| Klienci | Nazwa, kontakt, typ, status archiwizacji |
| Instalacje | Typ, klient i adres, status, urządzenia z numerami seryjnymi, data montażu |
| Serwis | Numer i temat, klient i adres, status, priorytet |
| Przeglądy | Plan, klient i instalacja, stan, termin, cykl |
| Użytkownicy | E-mail, rola, status, zakres przypisania |
| Dokumenty instalacji / załączniki | Nazwa, rodzaj, dostęp, rozmiar, data |

Wyszukiwanie instalacji filtruje **typ instalacji**; pole jest tak podpisane. Wyszukiwanie po kliencie, adresie i numerze seryjnym pozostaje dostępne w module Klienci oraz pod lupą w bocznym menu.

Istniejące formularze, import CSV, stronicowanie i kontrola dostępu pozostają dostępne. Edycja i wstrzymywanie planów, zarządzanie kontami i plikami są w oknach działań rekordów. Zapraszanie użytkowników i dodawanie planu rozwijają istniejące formularze. Nie zmieniono schematu bazy ani API.

## Planowane moduły

Magazyn i Szablony instalacji mają wyłącznie nieaktywne przyciski w menu z oznaczeniem „Wkrótce”. Nie utworzono pozornie działających stron ani formularzy tych planowanych modułów. Ich funkcje pozostają do wdrożenia później. Portal klienta zachowuje swój dotychczasowy układ.

## Weryfikacja

Kompilacja produkcyjna, TypeScript, ESLint i 179 istniejących testów Vitest. Podgląd istniejącej listy klientów, wyszukiwania, filtrów, pustych list instalacji/serwisu/przeglądów, okna użytkownika i otwierania formularza planu. Nie zmieniano danych klientów, uprawnień ani nie wysyłano zaproszeń. Brak zapisanych instalacji, zgłoszeń i dokumentów ogranicza wizualną weryfikację wierszy tych list na obecnej bazie.

Sprawdzono oba motywy przy 1440 × 1000 i układ przy 390 × 844. Dokument zachowuje szerokość 390 px; tabela przewija się osobno (334 px dostępnego miejsca, 670 px treści). Menu ma własne przewijanie listy zakładek i stały obszar ustawień/profilu. Zrzuty: `list-light-2026-10-26.png`, `list-dark-2026-10-26.png`.

Katalog jest już działającym modułem. Zakres opisuje [CATALOG.md](CATALOG.md).

Oferty są już działającym modułem szkiców i kalkulacji. Zakres opisuje [OFFERS.md](OFFERS.md).
