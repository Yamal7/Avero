# Portal klienta na telefon

Stan: 25.10.2026. Adres lokalny: `/portal`.

## Zakres

Osobny portal webowy z mobilną nawigacją: Start, Instalacje, Serwis, Dokumenty, Konto. Wersja działa w przeglądarce telefonu i komputera. Ten etap nie obejmuje publikacji aplikacji Android/iOS w sklepach ani pracy offline.

- **Start:** liczby instalacji, otwartych zgłoszeń i dostępnych dokumentów, wizyty, bieżące sprawy i najbliższy zapisany termin przeglądu.
- **Instalacje:** wyszukiwanie po adresie, typie, producencie/modelu i numerze seryjnym. Karta instalacji pokazuje urządzenia, dane gwarancji, plany przeglądów i ostatnie 10 zgłoszeń. Pełna historia zgłoszeń dostępna w Serwisie.
- **Serwis:** własne zgłoszenia, statusy, ustalone wizyty i nowe zgłoszenie do dostępnej instalacji. Klient nie zmienia priorytetu, technika ani terminów.
- **Wizyty:** lista zaplanowanych/w trakcie oraz historia zakończonych i odwołanych. Termin planowany, który już minął, jest oznaczany jako wymagający sprawdzenia statusu.
- **Dokumenty:** opublikowane protokoły oraz pliki świadomie udostępnione przez firmę. Protokoły można drukować lub zapisywać jako PDF przez okno drukowania przeglądarki; pliki pobiera się z prywatnego Storage.
- **Konto:** e-mail logowania, potwierdzenie adresu, dane klienta zapisane w firmie oraz wylogowanie. Dane kontaktowe są w tym etapie tylko do odczytu.

Listy mają paginację po 20 rekordów. Pola wyszukiwania i wybór instalacji uwzględniają zapisane przypisania. Konto z dostępem do kilku klientów może przełączać kontekst; zmiana dotyczy instalacji, wizyt, zgłoszeń, dokumentów i profilu firmy klienta. Jeden klient nadal może mieć wiele lokalizacji i instalacji.

## Logowanie i role

Po logowaniu i przyjęciu zaproszenia użytkownik przechodzi przez `/start`: klient trafia do `/portal`, pracownicy do `/dashboard`. Próba wejścia klienta w panel firmy kończy się przejściem do portalu. Konto zablokowane trafia do informacji o blokadzie, a konto bez przypisań — do informacji o braku dostępu.

Uprawnienia są nadal sprawdzane przez bazę. Ukrycie panelu firmy nie zastępuje RLS.

## Podgląd dla firmy

Administrator i biuro mają w nawigacji „Portal klienta”. Podgląd wymaga jawnego wyboru klienta; bez wyboru nie są pobierane zbiorcze dane wszystkich klientów. Przejście bezpośrednio do wybranego podglądu jest również dostępne z karty klienta w CRM.

Podgląd jest oznaczony i nie zmienia sesji ani roli. Nie można przez niego tworzyć zgłoszeń jako klient. Formularz w panelu firmy nadal działa jako konto pracownika.

Podgląd pokazuje tylko to, co przeznaczono dla klienta: bez roboczych protokołów i plików wewnętrznych, nawet jeśli konto pracownika ma do nich dostęp w CRM. Baza pozostaje pusta, dopóki firma nie doda/importuje klientów i ich instalacji; ekran podglądu wówczas poprosi o dodanie klienta.

## Dokumenty i prywatność

Każda funkcja portalu sprawdza wybranego klienta. Oprócz RLS stosowane jest jawne ograniczenie zapytań do tego kontekstu. Identyfikator rekordu należącego do innego kontekstu zwraca brak danych również wtedy, gdy użytkownik ma członkostwo w obu kontekstach.

Dokumenty plikowe muszą mieć `visible_to_customer=true`, a protokoły `status=published`. Te warunki dotyczą również podglądu pracownika.

Pobranie pliku przez `/portal/documents/[id]/download` ponownie sprawdza sesję, członkostwo, widoczność dokumentu i RLS Storage. Nie tworzy publicznego ani długotrwałego podpisanego linku. Odpowiedź ma `Cache-Control: private, no-store`, `Content-Disposition: attachment` i `X-Content-Type-Options: nosniff`; nazwa pliku jest kodowana i pozbawiona znaków sterujących.

Nie wdrożono w tej iteracji przesyłania plików przez firmę. Istniejący prywatny bucket i tabela dokumentów są obsługiwane do odczytu; protokoły generowane w module serwisu pojawiają się automatycznie po zatwierdzeniu. Zarządzanie uploadem i załączniki zgłoszeń są kolejnym etapem.

## Aktualność i brak automatycznych wysyłek

Przycisk „Odśwież” pobiera aktualny stan. Zapis zgłoszenia i operacje firmy unieważniają cache odpowiednich widoków. Ten etap nie wprowadza komunikacji w czasie rzeczywistym, e-maili przy zmianie statusu ani powiadomień push.

Plany przeglądów pokazują dane już zapisane w bazie; interfejs planowania cykli i automatyczne przypomnienia pozostają do wdrożenia. Portal nie zapisuje prywatnych danych w service workerze ani pamięci offline.

## Jak sprawdzić

1. W panelu firmy dodaj/importuj klienta, lokalizację, instalację i urządzenia.
2. Z karty klienta otwórz podgląd portalu.
3. Zaproś konto klienta i przypisz je do tego klienta.
4. Po potwierdzeniu adresu i przyjęciu zaproszenia konto trafi do portalu.
5. Zgłoś problem; biuro zobaczy sprawę w module Serwis.
6. Zaplanuj wizytę i zatwierdź protokół. Klient zobaczy termin i gotowy dokument.

## Weryfikacja

- 75 testów aplikacji: dotychczasowe 56 oraz testy kontekstu, tras, formularza zgłoszeń, nagłówków pobierania i blokowania odczytu pliku.
- 160 asercji SQL: dotychczasowe 117 oraz 43 nowe. Obejmują izolację kontekstów, wiele członkostw, prywatność plików i protokołów, podgląd tylko do odczytu, ponowienie zgłoszenia, archiwizację oraz odcięcie istniejącej zablokowanej sesji.
- Dane i konta scenariuszy SQL są tworzone w wycofywanych transakcjach. Nie pozostawiono dodatkowych rzeczywistych kont ani klientów.
- Kompilacja produkcyjna, kontrola typów i lint przeszły.
- W przeglądarce sprawdzono podgląd na obecnym koncie administratora, mobilną nawigację, zachowanie wybranego klienta między zakładkami, ograniczenie tworzenia zgłoszeń w podglądzie oraz dane sesji w Koncie. Potwierdzono podgląd istniejącego klienta; nie zmieniano jego danych. W pustej bazie widok prosi o wybór/dodanie klienta. Pełny pilotaż z realnym kontem klienta i rzeczywistymi plikami pozostaje do wykonania.
