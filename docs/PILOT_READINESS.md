# Przekrojowa weryfikacja i przygotowanie pilotażu

Aktualizacja: 4.11.2026. Zadanie KRA-24. Wynik dotyczy lokalnej implementacji, a nie odbioru użytkownika ani uruchomienia produkcji.

Aktualizacja 6.11.2026, KRA-25: użytkownik potwierdził brak hostingu, domeny i nadawcy i zlecił konfigurację do uzupełnienia. Przygotowano [pakiet wdrożenia](../deploy/README.md), `deploy/pilot.env.example` oraz `npm run pilot:check`. Instrukcja obejmuje osobny projekt Supabase, start Next, worker, kopię bazy i osobną kopię Storage oraz izolowaną próbę odtworzenia. Usługi, harmonogramy i odtworzenie nie są jeszcze uruchomione. Sprawdzenia: 676 testów aplikacji (10 nowych dla walidatora), typy oraz lint zmienionych plików. Typ parametru konfiguracji poczty poprawiono, aby przyjmował zestaw zmiennych bez wymaganego przez Next pola NODE_ENV; zachowanie runtime pozostaje takie samo.

## Sprawdzony scenariusz integracyjny

`supabase/tests/032_full_customer_journey.sql` przeprowadza jedną fikcyjną sprawę przez rzeczywiste funkcje bazy, w tej samej transakcji:

1. Biuro zapisuje ofertę z katalogową usługą i materiałem, warunki dokumentu i publikację.
2. Klient podejmuje decyzję o wariancie; biuro tworzy zlecenie z tej publikacji i planuje ekipę.
3. Technik rozpoczyna i kończy montaż. Biuro zamyka zlecenie osobno od odbioru klienta.
4. Zatwierdzony protokół rejestruje nową instalację i urządzenie. Klient widzi tę kartotekę bez wewnętrznych notatek i kosztów, a następnie potwierdza odbiór.
5. Klient zgłasza serwis tej samej nowej instalacji. Ponowienie formularza zwraca to samo zgłoszenie.
6. Biuro przypisuje technika i termin. Technik publikuje protokół, kończy wizytę i zamyka zgłoszenie.
7. Klient widzi zakończenie i opublikowany protokół. Pierwotny PDF odbioru pozostaje niezmienny po serwisie. Cofnięcie członkostwa odbiera dostęp także do serwisu.

13 asercji przekrojowych oraz wywołania funkcji przygotowujących proces. Wyniki z 4.11: 666 testów aplikacji i 1231 asercji bazy (32 pliki), wszystkie poprawne. Syntetyczne konta, przypisania, decyzje i rekordy istnieją wyłącznie wewnątrz transakcji zakończonej `ROLLBACK`. Test nie zakłada kont dostępnych do logowania i nie wysyła poczty. Publikacja używa znacznika PDF fixture; renderowanie prawdziwego PDF sprawdzają istniejące testy aplikacji. To test integracji funkcji bazy, nie automatyzacja formularzy i logowania w przeglądarce.

Uruchomienie na działającym lokalnym Supabase:

```sh
pnpm exec supabase test db supabase/tests/032_full_customer_journey.sql
pnpm test
pnpm exec supabase test db
```

Nie wykonuj `db reset` na istniejącej bazie użytkownika. Nowy test nie wymaga migracji ani zmiany aplikacji.

## Scenariusz odbioru w docelowej instalacji

Poniższe kroki pozostają do wykonania z właścicielem produktu na wydzielonym środowisku testowym. Dla każdego zapisać datę, wykonawcę, numery rekordów, wynik i zgłoszone błędy. Używać fikcyjnego klienta i dedykowanych odbiorców testowych.

| Krok | Oczekiwany wynik |
| --- | --- |
| Logowanie biura, technika i klienta | Właściwa rola i zakres; klient nie otwiera kart innego klienta, technik widzi przypisaną pracę |
| Klient → oferta → PDF | Dane klienta, warianty, ceny i warunki zgodne w kalkulacji, podglądzie i pobranym PDF |
| Publikacja → decyzja | Klient potwierdza właściwy wariant; pracowniczy podgląd nie składa decyzji za klienta |
| Zlecenie → kalendarz | Zakres pochodzi z zaakceptowanej wersji; kolizja ekip odrzucona, prawidłowy termin widoczny w obu widokach |
| Montaż → protokół | Szkic nie tworzy urządzeń; publikacja tworzy je raz, PDF pobiera się po ponownym logowaniu |
| Odbiór | Zakończenie prac i decyzja klienta osobne; uwagi prowadzą do procesu poprawek, zachowując historię |
| Serwis nowej instalacji | Zgłoszenie, termin, protokół i zakończenie widoczne we właściwych kontach |
| Przegląd | Potwierdzenie wykonania wiąże protokół, zapisuje historię i następny termin |
| E-mail pilotażowy | Wyłącznie wskazany odbiorca, jedna wiadomość, prawidłowy link, osobny status przyjęcia i dostarczenia |
| Telefon i komputer | Przejście procesu na rzeczywistym telefonie oraz w obu motywach; czytelne błędy i brak utraty szkicu |

W tej iteracji nie wykonywano tych decyzji w interfejsie klienta ani nie wysyłano wiadomości zewnętrznych. Wcześniejsze kontrole UI poszczególnych modułów pozostają opisane w dokumentach tych modułów; nie zastępują wspólnego odbioru na docelowym środowisku.

## Warunki rozpoczęcia pilotażu

| Warunek | Stan / konkretne działanie |
| --- | --- |
| Lokalna ciągłość danych między modułami | Sprawdzona nowym testem integracyjnym |
| Odbiór funkcji przez użytkownika | Do wykonania; statusy In Review nie oznaczają akceptacji |
| Środowisko testowe i produkcyjne | Potrzebny wybór hostingu i domeny, HTTPS oraz rozdzielenie danych i sekretów |
| Poczta | Resend przygotowany w kodzie; wymagane zweryfikowany nadawca, bezpieczna konfiguracja klucza, lista odbiorców i harmonogram. Wysyłka pozostaje wyłączona |
| Kopie bazy i plików | Wykonać kopię i udokumentowaną próbę odtworzenia na osobnym środowisku; nie przywracać testu na bazę użytkownika |
| Monitoring | Sprawdzać dostępność aplikacji i workera, błędy kolejki oraz procedurę obsługi niepewnej wysyłki |
| Konta pilotażowe | Właściciel wskazuje osoby i zakresy; nadanie dostępu przez istniejący panel administratora |
| Pełny proces w przeglądarce | Wykonać powyższy scenariusz z osobnymi kontami i pobraniem dokumentów na docelowym środowisku |

Decyzja: można kontynuować lokalny rozwój i przygotowanie środowiska; gotowość do produkcyjnego pilotażu nie została jeszcze potwierdzona. Dodatkowe moduły i pomysły pozostają na później. Najbliższe działanie operacyjne: wybrać środowisko pilotażu, domenę i nadawcę poczty, następnie przygotować wdrożenie oraz próbę odtworzenia kopii.
