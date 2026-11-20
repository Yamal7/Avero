# Import klientów z CSV

Moduł: `/dashboard/customers/import`, przycisk „Importuj CSV” na liście klientów.

## Zakres

Importer dodaje nowych klientów: nazwa / imię i nazwisko, e-mail, telefon oraz typ klienta. Nie zmienia istniejących klientów i nie tworzy kont logowania. Import lokalizacji, instalacji i urządzeń będzie osobnym rozszerzeniem.

1. Pobierz szablon lub zapisz własny arkusz jako CSV z nagłówkiem.
2. Wybierz plik (do 1 MB i 2000 wierszy danych).
3. Wskaż kodowanie UTF-8 albo Windows-1250 oraz separator: średnik, przecinek lub tabulator. Separator może zostać rozpoznany automatycznie.
4. Przypisz kolumny do pól. Wymagana jest nazwa. Nieprzypisane pola kontaktowe są pomijane. Brak typu oznacza osobę prywatną.
5. Wybierz „Sprawdź dane przed importem”. Podgląd nie dodaje klientów.
6. Sprawdź wiersze gotowe, błędne i możliwe duplikaty. Możesz pobrać raport CSV oraz zmienić mapowanie albo plik.
7. Zaznacz potwierdzenie i zatwierdź import. Dodane zostaną tylko wiersze „Gotowy”.

## Typ klienta i walidacja

Typ klienta: `firma` / `company` albo `osoba prywatna` / `individual` (obsługiwane również `osoba`, `prywatny`, `indywidualny`). Pusta wartość oznacza `individual`.

Nazwa jest przycinana, a wielokrotne białe znaki zamieniane na pojedyncze spacje. E-mail jest przycinany i zapisywany małymi literami. Niepoprawny e-mail, nieznany typ, błędna liczba kolumn lub niepoprawny numer telefonu wykluczają wiersz z importu. Telefon może zawierać 7–15 cyfr oraz typowe znaki formatowania. Nie naprawiamy automatycznie niejednoznacznych danych.

## Duplikaty

Zgodność dowolnego z pól: nazwa, e-mail lub telefon, oznacza możliwy duplikat. Porównanie obejmuje aktywnych i zarchiwizowanych klientów oraz wcześniejsze gotowe wiersze pliku.

- Nazwa: ignorujemy wielkość liter i wielokrotne białe znaki.
- E-mail: ignorujemy wielkość liter i skrajne spacje.
- Telefon: ignorujemy znaki formatowania; dla polskich numerów porównujemy również zapis z +48 i bez niego.

Ta zasada jest zachowawcza: różne osoby o identycznym imieniu i nazwisku albo wspólnym telefonie zostaną oznaczone do ręcznej weryfikacji. Nie ma automatycznego scalania ani nadpisywania. Taki rekord można dodać ręcznie po sprawdzeniu.

## Zapis i uprawnienia

Podgląd i zatwierdzenie wymagają konta pracownika. Podgląd jest przechowywany po stronie bazy i przypisany do konkretnego użytkownika; inny pracownik ani klient nie może go odczytać lub zatwierdzić. Formularz zatwierdzenia przekazuje wyłącznie identyfikator podglądu.

Podgląd wygasa po godzinie. Anulowanie usuwa oczekujący podgląd, a przygotowanie następnego usuwa wygasłe podglądy tego samego pracownika. Po zakończeniu importu kopia danych kontaktowych w podglądzie jest usuwana, pozostaje wynik z identyfikatorami dodanych klientów. Przed wdrożeniem produkcyjnym należy włączyć zaplanowane sprzątanie wygasłych podglądów również dla pracowników, którzy nie powrócą do modułu.

Funkcje RPC używają SECURITY DEFINER ze stałym search_path oraz jawną kontrolą roli i właściciela podglądu. Bezpośredni zapis tabeli podglądów jest zablokowany. Frontend korzysta z sesji użytkownika i publicznego klucza anon; nie korzysta z service_role.

Podczas zapisu duplikaty są sprawdzane ponownie. Krótka blokada zapisu tabeli klientów zapobiega wyścigowi pomiędzy sprawdzeniem a zapisem. Import jest jedną transakcją: nieoczekiwany błąd wycofuje całą paczkę. Ponowne zatwierdzenie tego samego podglądu zwraca wcześniejszy wynik bez ponownego dodawania klientów. Standardowy audyt klientów rejestruje autora i dane zapisu.

Nie wdrożono automatycznego cofania zakończonego importu. Korekty wykonuje się na kartach klientów; przed migracją rzeczywistej bazy potrzebna jest kopia zapasowa.

## Weryfikacja — 25.10.2026

- 26 testów Vitest: parser, mapowanie, walidacja, raport CSV i akcje serwera, wraz z dotychczasowymi testami CRM.
- 38 testów SQL: dotychczasowe 19 oraz 19 nowych asercji importu, m.in. izolacja podglądu, powtórzony zapis, duplikat dodany po podglądzie, wygaśnięcie i atomowość transakcji.
- Test wydajności na 2000 syntetycznych rekordów: podgląd około 1,1 s, zapis około 0,6 s, ponowne zatwierdzenie bez dodawania rekordów; cała transakcja wycofana. Wyniki dotyczą lokalnego środowiska testowego.
- Kompilacja produkcyjna, kontrola typów i lint przeszły.
- Podgląd w przeglądarce na syntetycznym pliku: 2 poprawne wiersze, 1 duplikat, 1 błędny e-mail. Nie importowano tych klientów do bazy.
