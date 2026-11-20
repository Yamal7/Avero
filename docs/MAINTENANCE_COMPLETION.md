# Wykonanie i historia przeglądów

Wersja lokalna, 25.10.2026.

## Obsługa

1. Wykonaj wizytę i zatwierdź jej protokół w module serwisowym. Zatwierdzenie kończy wizytę zgodnie z istniejącym procesem.
2. Otwórz **Przeglądy → Wykonanie i historia** przy odpowiednim planie.
3. Wybierz protokół zakończonej wizyty tej samej instalacji. Sprawdź jego treść przez link do protokołu.
4. Program pokaże datę wykonania, dotychczasowy termin, cykl i proponowany następny termin. Zaznacz, że protokół potwierdza zakres tego planu i zatwierdzasz datę, a następnie zapisz.
5. W historii pojawi się wpis z powiązaniem protokołu, datami i cyklem. Aktualny termin planu zmieni się w tej samej operacji i będzie widoczny w portalu klienta oraz licznikach harmonogramu.

Potwierdzają administrator i biuro. Technik odczytuje historię planów przypisanych klientów. Link do treści protokołu jest pokazywany tylko wtedy, gdy ma do niego dostęp w istniejącym module serwisowym. Klient widzi historię swojej instalacji w portalu, bez możliwości potwierdzania lub edycji wpisów. Podgląd pracownika stosuje jawny kontekst klienta.

Zatwierdzenie protokołu nie rozlicza automatycznie wszystkich planów instalacji. Firma wybiera plan odpowiadający faktycznie wykonanej pracy. Jeden protokół może potwierdzić różne plany tej samej instalacji, jeśli jego zakres je obejmuje; dany protokół może wystąpić tylko raz w jednym planie. Nie wysyłamy powiadomień ani nie rezerwujemy kolejnej wizyty.

## Daty i historia

Datą wykonania jest dzień zakończenia wizyty w `Europe/Warsaw`, a nie dzień późniejszego potwierdzenia w planie. Kolejny termin to ta data plus bieżący cykl planu w miesiącach. Końcówki miesięcy są dopasowywane do ostatniego dnia miesiąca, np. 31.01.2024 + 1 miesiąc = 29.02.2024, a 29.02.2024 + 12 miesięcy = 28.02.2025.

Wybór historycznego protokołu może wyznaczyć termin wcześniejszy od aktualnej daty; taki plan nadal będzie zaległy. Podgląd przed zapisem pokazuje konkretną zmianę. Wykonanie wcześniejsze niż ostatnie zapisane w tym planie, albo o tym samym momencie zakończenia, jest odrzucane, aby nie cofnąć chronologii. Dane planu można później edytować zgodnie z dotychczasowymi uprawnieniami, ale nie zmienia to wpisów historii.

Historia zachowuje nazwę planu, cykl, poprzedni i wyznaczony termin, datę wykonania, datę zapisu i identyfikatory wizyty/protokołu/zgłoszenia z chwili potwierdzenia. Wpisów nie edytuje się ani nie kasuje przez aplikację. Korekta błędnego potwierdzenia z zachowaniem śladu audytowego wymaga osobnego etapu; ręczna zmiana terminu planu nie cofa wpisu historii. Z tego powodu formularz wymaga sprawdzenia protokołu i jawnego zatwierdzenia podglądu.

Plan wstrzymany lub należący do archiwalnej instalacji/klienta nie przyjmuje nowych potwierdzeń. Dotychczasowa historia pozostaje czytelna zgodnie z uprawnieniami. Protokoły robocze, wizyty nieukończone, przyszłe oraz protokoły innej instalacji są odrzucane. Historia i lista dostępnych protokołów są stronicowane po 20 pozycji.

## Spójność i API

Baza zapisuje historię i przesuwa termin w jednej transakcji. Blokada planu, numer wersji i unikatowość `(plan, protokół)` zapobiegają równoczesnemu podwójnemu rozliczeniu tej samej wizyty w tym planie. Powtórzenie dokładnie tego samego żądania tego samego użytkownika zwraca pierwotny wynik, nawet gdy plan ma już nowszą wersję; nie dopisuje wpisu ani nie przesuwa daty ponownie. Zmiana treści przy tym samym identyfikatorze żądania daje konflikt. Blokada konta jest sprawdzana także przy ponowieniu.

Obliczenia terminu są wykonywane w bazie. Oczekiwana data z podglądu musi być zgodna z wynikiem, a wersja planu aktualna. Zmiana cyklu lub terminu przez inną osobę powoduje konflikt i wymaga odświeżenia podglądu. Zapis historii i zmiana planu są audytowane. Sesja aplikacji nie może bezpośrednio dopisywać ani przepisywać tabeli historii.

| Metoda | Endpoint | Zakres |
| --- | --- | --- |
| GET | `/api/v1/maintenance-plans/:id?historyPage=1&protocolPage=1` | Karta planu, dostępne protokoły i historia; pracownicy zgodnie z przypisaniami |
| POST | `/api/v1/maintenance-plans/:id/complete` | JSON: `requestId`, `protocolId`, `version`, `expectedNextDueOn`; administrator/biuro |
| GET | `/api/v1/portal/maintenance-history?customer=UUID&installation=UUID&page=1` | Historia wybranej instalacji w jawnym kontekście klienta |

Odpowiedź zapisu zawiera `apiVersion`, `completionId`, `planId`, `nextDueOn`. Kody 409 obejmują nieaktualny podgląd/wersję, protokół już użyty w planie, starsze wykonanie i plan wstrzymany. Nieprawidłowy dostęp ma 403; szczegóły wewnętrznych błędów nie trafiają do klienta. Wywołania korzystają ze wspólnych Bearer/cookies i kontroli Origin. SDK oferuje `maintenancePlan`, `completeMaintenancePlan` i `portalMaintenanceHistory`; nie ponawia zapisów automatycznie.

## Weryfikacja 25.10.2026

- 179 testów Vitest i 331 asercji SQL, wraz z dotychczasowymi modułami.
- Testy dat obejmują końcówki miesięcy, rok przestępny i wykonanie na granicy dnia UTC/Europe-Warsaw.
- Testy bazy sprawdzają atomowość: błąd zapisu planu po dodaniu wpisu cofa także ten wpis historii.
- Sprawdzono ponowienia, duplikaty, chronologię, zmieniony cykl, plany wstrzymane/archiwalne, izolację klientów i blokadę konta.
- Rzeczywisty test HTTP: opublikowanie protokołu istniejącym procesem, pobranie propozycji, potwierdzenie, ponowienie bez drugiej zmiany terminu, konflikt duplikatu oraz historia w portalu.
- Potwierdzenie drugiego planu wykonano przez formularz w przeglądarce, zaznaczając sprawdzenie protokołu i daty. Program zapisał jeden wpis oraz przesunął termin dokładnie raz.
- Próbę przeprowadzono wyłącznie na nowej instalacji testowej bez kont klientów. Jej plany, protokół, historia i rekordy zostały usunięte po próbie; istniejące dane klientów i protokoły pozostały bez zmian.
- Zrzut `maintenance-completion-ready-2026-10-25.png` przedstawia wyłącznie dane testowe. Nie wykonano testu na fizycznym telefonie ani wysyłki powiadomień.

Końcowa kompilacja produkcyjna, ESLint i kontrola typów zakończone sukcesem. Po próbie potwierdzono aktywną ochronę zatwierdzonych protokołów oraz brak testowego klienta w bazie.
