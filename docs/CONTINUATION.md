# Kontynuacja projektu — 24.10.2026

## Zwijane grupy nawigacji — 8.11.2026

Na życzenie użytkownika panel boczny ma mniejsze nazwy (12 px), ikony (18 px) i pozycje (32 px na komputerze, 40 px na telefonie). Przegląd i zadania pozostają na górze; grupy Relacje, Sprzedaż, Realizacja i serwis, Administracja i Portal klienta można niezależnie zwijać przyciskiem z aria-expanded/aria-controls. Uprawnienia modułów pozostają zgodne z rolą. Stan zapisywany lokalnie osobno dla konta i grupy; brak dostępu do localStorage nie blokuje menu. Preferencja nie jest synchronizowana między urządzeniami. Weryfikacja typów/lint oraz UI: zwinięcie, zachowanie po przeładowaniu, oba motywy, menu mobilne. Zrzuty `output/qa/compact-sidebar-*.png`. Brak zmian w bazie.

## Konfiguracja pilotażu — 6.11.2026

KRA-25: użytkownik nie ma jeszcze hostingu/domeny/nadawcy; przygotowano konfigurację do uzupełnienia. `deploy/pilot.env.example`, `scripts/pilot-preflight.mjs` i `pilot:check`, instrukcja `deploy/README.md`: Node/Next + osobny Supabase, sekrety, worker, konfiguracja Auth, kopia bazy i niezależna kopia prywatnego Storage, izolowane odtworzenie i kontrola ról/plików. Walidator statyczny bez sieci i ujawniania wartości; jawnie nie potwierdza dostępności ani podpisu kluczy. 10 nowych testów; pełne 676 testów aplikacji, typy i lint zmienionych plików. Skorygowano typ wejścia mailConfig (bez zmiany runtime). Brak migracji i operacji na bazie. Nie kupowano usług, nie wdrażano aplikacji, nie kopiowano danych ani nie wysyłano poczty. Następny krok: wybór środowiska/domeny/nadawcy i próbne wdrożenie z wyłączoną pocztą.

## Test przekrojowy i pilotaż — 4.11.2026

KRA-24: dodano `supabase/tests/032_full_customer_journey.sql`: jedna fikcyjna sprawa przechodzi przez zapis/publikację oferty i decyzję klienta, planowanie i wykonanie montażu, osobne zakończenie zlecenia, publikację odbioru, rejestrację urządzenia i instalacji, potwierdzenie klienta oraz serwis tej nowej instalacji do protokołu i zamknięcia. 13 nowych asercji, także ponowienie zgłoszenia, prywatność, niezmienność PDF po serwisie i cofnięcie dostępu. Całość rollback, bez trwałych kont i danych. Nie zmieniano kodu aplikacji ani schematu. Weryfikacja bazy nie jest testem pełnego interfejsu. Raport i scenariusz odbioru: [PILOT_READINESS.md](PILOT_READINESS.md). Kolejny krok operacyjny: wybór środowiska, domeny i nadawcy, przygotowanie wdrożenia oraz próby odtworzenia kopii przed pilotażem. Nowe pomysły pozostają odłożone.

Punktem wyjścia jest `hvac-mvp-starter.zip`. Starszy `hvac_mvp_start.zip` zawiera uproszczony schemat i nie jest dodatkową migracją: nie uruchamiaj go razem z migracjami tego projektu.

## Nowy interfejs — 25.10.2026

Pulpit znajduje się na `/dashboard`, lista klientów na `/dashboard/customers`, a rejestr instalacji na `/dashboard/installations`. Wdrożono wspólną oprawę, rozwijaną nawigację i wyszukiwanie w nagłówku. Plan całego produktu: [PRODUCT_PLAN.md](PRODUCT_PLAN.md).

## Import CSV — 25.10.2026

Importer klientów dostępny pod `/dashboard/customers/import`. Obsługuje podgląd, mapowanie, walidację, duplikaty i zatwierdzenie zapisu. Instrukcja: [IMPORT_CUSTOMERS.md](IMPORT_CUSTOMERS.md).

## Użytkownicy i dostęp — 25.10.2026

Panel administratora `/dashboard/users` obsługuje role, przypisania, blokady, zaproszenia i audyt. Instrukcja: [ACCESS_MANAGEMENT.md](ACCESS_MANAGEMENT.md).

## Serwis i kalendarz — 25.10.2026

Moduł `/dashboard/service` i kalendarz `/dashboard/calendar` obejmują zgłoszenia, przydziały, wizyty i zatwierdzane protokoły. Instrukcja: [SERVICE_WORKFLOW.md](SERVICE_WORKFLOW.md).

## Portal klienta — 25.10.2026

Mobilny portal `/portal` obejmuje własne instalacje, wizyty, zgłoszenia i dokumenty. Logowanie kieruje użytkownika według roli. Instrukcja: [CUSTOMER_PORTAL.md](CUSTOMER_PORTAL.md).

## Wiele platform — 25.10.2026

Kierunek zatwierdzony przez użytkownika: przeglądarka + Windows/macOS + Android/iOS. Dodano `/api/v1`, klienta HTTP i wspólne schematy w `packages/api-client`. Szczegóły: [MULTIPLATFORM.md](MULTIPLATFORM.md). Instalatory i aplikacje sklepowe nie są jeszcze gotowe.

## Dokumenty i załączniki — 25.10.2026

Moduł dostępny przez kartę instalacji i zgłoszenia. Dodano migrację `202610250009_document_management.sql`, API `/api/v1/documents` oraz klienta HTTP i walidację współdzieloną. Instrukcja: [DOCUMENTS.md](DOCUMENTS.md). Instalatory pozostają późniejszym etapem, po stabilizacji procesów webowych.

## Załączniki klienta — 25.10.2026

Portal zgłoszenia pozwala klientowi dodać JPG/PNG/PDF. Nowa migracja `202610250010_client_attachments.sql`, osobny endpoint klienta, wspólna finalizacja uploadu i metoda SDK `uploadTicketAttachment`. Instrukcja: [CLIENT_ATTACHMENTS.md](CLIENT_ATTACHMENTS.md). Kolejny etap: harmonogramy przeglądów i terminy.

## Harmonogramy przeglądów — 25.10.2026

Nowa zakładka Przeglądy, liczniki pulpitu i plany instalacji. Migracja `202610250011_maintenance_schedule.sql`, API `/api/v1/maintenance-plans`, wspólne kontrakty i klient HTTP. Firma zarządza planami, technik odczytuje przypisanych klientów, portal pokazuje aktywne nazwy i terminy. Następny termin jest ustawiany ręcznie; nie ma automatycznych powiadomień ani potwierdzenia wykonania. Instrukcja: [MAINTENANCE.md](MAINTENANCE.md).

## Wykonanie i historia przeglądów — 25.10.2026

Migracja `202610250012_maintenance_completion.sql`: historia i transakcyjne potwierdzanie protokołem z aktualizacją terminu. Karta `/dashboard/maintenance/[id]`, historia w portalu instalacji i API/SDK. Instrukcja: [MAINTENANCE_COMPLETION.md](MAINTENANCE_COMPLETION.md). Powiadomienia pozostają kolejnym etapem.

## Jasny i ciemny motyw — 26.10.2026

Nowe wspólne style, przełącznik z zapisem w przeglądarce, responsywne menu i odświeżony pulpit na rzeczywistych danych. Zmiany dotyczą interfejsu i odczytu podsumowania; bez migracji bazy. Instrukcja: [THEMES.md](THEMES.md).

## Zaimplementowany etap CRM

- Lista klientów: paginacja po 25 rekordów, osobny filtr archiwum.
- Wyszukiwanie po nazwie, e-mailu, telefonie, adresie, typie instalacji, producencie, modelu i numerze seryjnym.
- Karta klienta: lokalizacje → instalacje → urządzenia.
- Dodawanie i edycja wszystkich czterech obiektów; archiwizacja klienta i status archiwalny instalacji. Nie dodano fizycznego usuwania, przywracania klientów ani przenoszenia obiektów między klientami.
- Formularze z walidacją na serwerze, komunikatami wyniku i blokadą przycisku podczas zapisu.
- Każdy zapis wymaga sesji pracownika; identyfikatory rodziców są weryfikowane na serwerze. Zapytania używają klucza anon i sesji użytkownika, a baza nadal stosuje RLS.
- Wyszukiwanie działa jako SECURITY INVOKER; nie omija RLS.
- Nowa migracja zapisuje zmiany czterech tabel CRM do audit_logs w tej samej transakcji.
- Klient bez roli pracownika ma dostęp tylko do odczytu własnych rekordów. Nie jest to jeszcze docelowy portal klienta.

## Uruchomienie

Wymagane Node.js 20+ i uruchomiony Docker. Projekt ma `pnpm-lock.yaml`; do powtarzalnej instalacji używaj pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm exec supabase start
cp .env.example .env.local
```

Wstaw do `.env.local` lokalne API URL i anon key z `pnpm exec supabase status`. Nie używaj klucza service_role.

Na nowej, lokalnej bazie testowej:

```sh
pnpm exec supabase db reset
pnpm test
pnpm run db:test
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run dev
```

`db reset` odtwarza lokalną bazę i usuwa jej dotychczasowe dane. Do istniejącej bazy stosuj migracje po wykonaniu kopii zapasowej.

Załóż lokalne konto testowe w Supabase Studio → Authentication. Następnie w SQL Editor nadaj temu kontu uprawnienie pracownika (wyłącznie w zaufanym panelu administratora), zastępując identyfikator:

```sql
insert into public.staff_users(user_id)
values ('UUID-KONTA-TESTOWEGO');
```

Zaloguj się na `/login`. Dodaj klienta, lokalizację, instalację i urządzenie. Sprawdź wyszukiwanie po numerze seryjnym, edycję i archiwizację. Testowe konta klientów uzyskują dostęp dopiero po wpisaniu relacji do `customer_memberships` przez administratora.

## Weryfikacja i ograniczenia

W tej sesji przeszło 10 testów Vitest oraz kompilacja produkcyjna Next.js (z kontrolą typów).

Testy Vitest obejmują walidację formularzy, odrzucenie zapisu bez uprawnień pracownika, odrzucenie podmienionego powiązania instalacji, poprawny zapis oraz brak fałszywego sukcesu przy zerowej liczbie zmienionych rekordów.

Test SQL rozszerzono do 19 asercji, w tym izolacja wyszukiwania, wyszukiwanie po adresie/numerze seryjnym, filtr archiwum i dziennik audytowy. Test SQL uruchomiono 24.10.2026 po włączeniu Dockera: wszystkie 19 asercji przeszło. Potwierdzono również logowanie kontem testowym i odczyt panelu. Pełny scenariusz serwisowy nadal wymaga weryfikacji przed pilotażem. Testy z mockami nie zastępują testów rzeczywistej bazy ani pełnego przepływu logowania.

Archiwizacja ukrywa klienta w domyślnym widoku. Nie odbiera uprawnień członkostwa do historii danych. Przed pilotażem należy określić zasady retencji oraz cofania dostępu.

## Następne etapy

1. Uruchomienie Supabase i testów RLS oraz test pełnego przepływu CRM.
2. Zarządzanie kontami i członkostwem z audytem.
3. Import CSV: podgląd, normalizacja, wykrywanie duplikatów i raport błędów.
4. Zgłoszenia serwisowe, wizyty, dokumenty i przypomnienia.

Lista wymagań produkcyjnych w README pozostaje aktualna. Ten etap nie stanowi kompletnego wdrożenia produkcyjnego.

## 26.10.2026 — katalog produktów i usług

Wdrożono działający katalog dla administratora/biura z czterema kategoriami, cenami netto w PLN, VAT, marżą i archiwum. Migracja `202610260001_catalog.sql` jest zastosowana w lokalnej bazie bez resetowania danych. Interfejs i API są gotowe; szczegóły w [CATALOG.md](CATALOG.md). Testy: 228 Vitest i 371 SQL. Następny proponowany etap: szkice ofert z pozycjami kopiowanymi z katalogu.

## 26.10.2026 — kreator ofert

Dodano trzy kroki kreatora, kalkulację z katalogiem/własnymi pozycjami, warianty, korekty cen, zapis szkiców i wewnętrzny podgląd bez kosztów. Migracja `202610260002_offers.sql` jest zastosowana lokalnie. Testy: 270 Vitest i 415 SQL. Szczegóły i ograniczenia w [OFFERS.md](OFFERS.md). Następny etap: firmowy PDF oferty, potem udostępnianie klientom.

## 26.10.2026 - oferty PDF

Eksport PDF działa w podglądzie ofert. Dane dokumentu są zapisywane przy ofercie, z kontrolą wersji. Instrukcja, API i ograniczenia: [OFFER_PDF.md](OFFER_PDF.md). Przykład w output/pdf/oferta-hvac-projekt.pdf. Następny proponowany etap: publikacja zamrożonej oferty w portalu klienta i akceptacja wybranego wariantu.

## 26.10.2026 - oferty w portalu

Wdrożono publikację zapisanych wersji, prywatny PDF każdej wersji oraz akceptację wariantu przez przypisanego klienta. Szczegóły: [OFFER_PORTAL.md](OFFER_PORTAL.md). Następny proponowany etap: zlecenie realizacji z zaakceptowanego wariantu.

## 26.10.2026 - realizacje i ekipy

Wdrożono zlecenia z zaakceptowanych ofert, terminy z ekipami, wspólny kalendarz serwisu i montaży oraz publiczny plan przy ofercie klienta. Dokumentacja: [WORK_ORDERS.md](WORK_ORDERS.md). Kolejny proponowany etap: odbiór montażu, urządzenia, numery seryjne i gwarancje.

## Odbiór montażu — 28.10.2026

Wdrożono KRA-7 lokalnie: szkic i zatwierdzenie protokołu montażu, istniejąca/nowa instalacja, urządzenia z numerami seryjnymi i jawnie podaną gwarancją, niezmienny PDF oraz osobny odbiór klienta bez uwag lub z uwagami. Zgodnie z decyzją użytkownika zakończenie zlecenia pozostaje niezależne od protokołu i odbioru. Dokument dostępny przy zleceniu, instalacji i w portalu. Technicy zapisują szkice tylko swoich realizacji, biuro zatwierdza, klient odbiera na własnym koncie. Jeden protokół na zlecenie; korekty/rejestr napraw po odbiorze są kolejnym etapem. Instrukcja: [HANDOVERS.md](HANDOVERS.md). Testy: 344 aplikacji, 572 bazy, typy/lint/build. Dane UI usunięto, audyt pozostaje. Program działa lokalnie pod http://localhost:3100.

## Kierunek UX/UI — 28.10.2026

Użytkownik wskazał Linear, Attio i Notion jako inspiracje dla dalszego projektowania; Attio szczególnie dla CRM. Zachowujemy własny pomarańczowy akcent, logo, motywy i zatwierdzony panel boczny. Szczegóły: [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md).

## Poprawki po odbiorze — 28.10.2026

KRA-8: rundy po odbiorze z uwagami, zadania techników z datami wykonania, wersjonowany szkic kolejnego protokołu, osobny niezmienny PDF P1/P2 i nowa decyzja klienta. Pierwszy PDF, wszystkie wcześniejsze decyzje i rejestr urządzeń/gwarancji pozostają zachowane. Aktywna praca i najnowszy odbiór są na początku, historia jest rozwijana; zwarte wiersze inspirowane Linear. Instrukcja [CORRECTIONS.md](CORRECTIONS.md). Testy: 362 aplikacji, 667 bazy, typy/lint/build. Daty zadań nie rezerwują ekip w kalendarzu. Kontrola UI używa wyłącznie własnych tymczasowych rekordów bez nowych kont i uprawnień. Następny proponowany etap: karta klienta i oś historii w kierunku Attio.

## Karta klienta — 28.10.2026

KRA-9: profil inspirowany Attio, zakładki historii/osób/ofert/realizacji/instalacji/serwisu, kontakty główne i odwracalne archiwum, filtrowana wspólna historia źródłowych zdarzeń. Oferty i ceny niedostępne technikom, realizacje/serwis w ich zakresie. Osoby CRM nie tworzą kont. Kreator oferty wybiera klienta po UUID z profilu. Szeroki ekran: panel profilu + obszar pracy; wąski/telefon: rozwijane szczegóły i bezpośrednie dane kontaktowe. Dotychczasowe formularze lokalizacji/instalacji/urządzeń zachowane w zakładce Instalacje. Instrukcja: [CUSTOMER_WORKSPACE.md](CUSTOMER_WORKSPACE.md). Testy: 384 aplikacji, 717 bazy. Następny proponowany etap: notatki, zadania i opiekun klienta w CRM.


## Codzienna praca CRM — 28.10.2026

KRA-10: prywatne dla biura notatki z rozmów/spotkań, zadania z terminem i wykonawcą, opiekun handlowy, następny kontakt wyznaczany przez otwarte zadania kontaktu, historia zmian. Technik widzi tylko własne zadania i zmienia postęp bez uzyskiwania nowych uprawnień. Wspólne API, oba motywy i telefon. Migracja 202610280004 zastosowana lokalnie i zarejestrowana. Instrukcja: [CRM_WORK.md](CRM_WORK.md). Sprawdzenie: 401 testów aplikacji, 776 bazy, typy/lint/build, UI na danych demonstracyjnych; dane usunięto, audyt zachowano. Kolejny krok: zbiorcze **Moje zadania** ze wszystkich klientów: dzisiaj, po terminie, nadchodzące.

## Moje zadania — 28.10.2026

KRA-11: zbiorcza własna agenda CRM `/dashboard/tasks`, menu pod przeglądem, filtry Dzisiaj/Po terminie/Nadchodzące/Otwarte/Zamknięte, wyszukiwanie, liczniki i paginacja. Szybki postęp korzysta z dotychczasowego zapisu wersjonowanego. Link klienta prowadzi do właściwej strony konkretnego zadania. Administrator również widzi wyłącznie własne przypisania; brak cudzych zadań i notatek, odebrany dostęp i klient archiwalny wyłączone z agendy. Daty Europe/Warsaw. Migracja 202610280005 zastosowana lokalnie i zarejestrowana. Instrukcja [MY_TASKS.md](MY_TASKS.md). Sprawdzenie: 420 testów aplikacji, 826 bazy, typy/lint/build oraz UI w dwóch motywach i na telefonie; dane demonstracyjne usuwane, bez zmian kont i uprawnień. Następny krok: zadania w przeglądzie i dzwonku powiadomień wewnątrz aplikacji.

## Zadania w pulpicie i dzwonku — 28.10.2026

KRA-12: Twoje zadania na początku głównej kolumny przeglądu, osobne liczniki zaległych/dzisiejszych, podgląd pięciu najpilniejszych działań i przejścia do klienta lub agendy. Dzwonek uwzględnia własne zadania, zachowuje serwis/przeglądy, pobiera świeże dane przy otwarciu, ma stan ładowania i ponowienie błędu. Postęp i zapis zadania odświeżają oprawę dashboardu. Metadane wyłącznie własnych działań, bez opisów, wyników i notatek; zakres i daty z istniejącej agendy. Migracja 202610280006 dodaje chroniony odczyt; wspólne API GET /api/v1/tasks/alerts. Instrukcja [TASK_ALERTS.md](TASK_ALERTS.md). Sprawdzenie: 440 testów aplikacji, 848 bazy, typy/lint/build oraz UI na odizolowanych danych demonstracyjnych. Bez e-maili/push/nowych kont. Proponowany kolejny etap: zbiorczy widok zadań zespołu dla biura.

## Zadania zespołu — 1.11.2026

KRA-13: widok `/dashboard/team-tasks` wyłącznie dla biura/admin, filtry wykonawcy/terminu/statusu i wyszukiwanie, liczniki otwartych działań, paginacja i szybki postęp. Nieaktywni wykonawcy pozostają widoczni dla biura; można zamknąć zadanie, wznowienie wymaga aktywnego wykonawcy. Własna agenda i dzwonek pozostają osobiste. Migracja `202611010001_team_tasks.sql`: nowy chroniony odczyt, reguła aktywnego wykonawcy również w szybkim postępie. Instrukcja [TEAM_TASKS.md](TEAM_TASKS.md). Sprawdzenie: 461 testów aplikacji, 894 bazy, typy/lint/build, UI obu motywów i telefonu na usuwanych danych demonstracyjnych, bez tworzenia kont i zmian dostępu. Kolejny proponowany etap: zmiana wykonawcy i terminu bezpośrednio z listy zespołu.

## Planowanie zadań — 1.11.2026

KRA-14: **Termin i wykonawca** przy otwartych zadaniach zespołu. Świeże opcje dostępnych osób, ponowna kontrola przy zapisie, częściowa zmiana wyłącznie terminu i wykonawcy, ochrona wersji oraz idempotentne ponowienia. Zachowanie statusu, wyniku i pozostałych danych; możliwość wymiany nieaktywnego przydziału bez nadawania dostępu. Migracja `202611010002_task_planning.sql` zastosowana i zarejestrowana lokalnie. Wspólne GET/PATCH i klient API dla kolejnych platform. Instrukcja [TASK_PLANNING.md](TASK_PLANNING.md). Sprawdzenie: 479 testów aplikacji, 931 bazy, typy/lint/build. W przeglądarce: zapis, liczniki, konflikt równoczesnej zmiany, oba motywy i telefon. Dane demonstracyjne usunięto; bez zmian rzeczywistych zadań, kont i uprawnień. Aplikacja działa pod http://localhost:3100. Następny proponowany etap: czytelna historia zmian terminu i wykonawcy w karcie klienta.

## Historia planowania — 1.11.2026

KRA-15: w Historii karty klienta biuro/admin widzą autora, godzinę oraz poprzednie/nowe wartości terminu i wykonawcy. Odczyt z istniejącego audytu, także starszych zmian, bez surowych obrazów, opisów i wyników. Jedno zdarzenie na zapis, brak pozornych zmian i duplikatów po ponowieniu. Dotychczasowe filtry/strony i zakres technika zachowane; API oraz strona odrzucają nowe szczegóły w projekcji technika. Nazwy osób według obecnych kont, brak konta: Niedostępny użytkownik. Migracja `202611010003_task_plan_history.sql` zastosowana i zarejestrowana lokalnie. Instrukcja [TASK_PLAN_HISTORY.md](TASK_PLAN_HISTORY.md). Sprawdzenie: 493 testy aplikacji, 961 bazy, typy/lint/build, oba motywy/telefon i paginacja w przeglądarce. Tymczasowe dane usunięto, audyt pozostawiono; bez zmian kont, uprawnień i rzeczywistych zadań. Aplikacja uruchomiona na 127.0.0.1:3100. Kolejny proponowany etap: edytowalna biblioteka Szablonów instalacji z katalogu, powiązana z kreatorem ofert.

## Szablony instalacji — 1.11.2026

KRA-16: aktywna zakładka `/dashboard/templates` dla biura/admin, biblioteka z filtrami i paginacją, tworzenie/edycja zestawów do 30 pozycji katalogowych z ilościami, wersje i idempotentne ponowienia, odwracalne archiwum. Aktualne ceny pobierane przy użyciu. Wycofane pozycje blokują użycie/przywrócenie. Kreator: przycisk Użyj szablonu na karcie i picker w kroku 3, podgląd pozycji/ilości/cen; ponowny odczyt przed zapisem i komunikat, jeśli ceny lub wersja się zmieniły. Niezależna kopia do nowej oferty, stałe identyfikatory przy ponowieniu. Własne zapisane oferty nie są aktualizowane przy zmianie szablonu/katalogu. Unikalne etykiety dialogów kreatora, formularz szablonu bez zagnieżdżonych formularzy. Migracja `202611010004_installation_templates.sql` zastosowana i zarejestrowana. Wspólne API/klient dla kolejnych platform. Instrukcja [INSTALLATION_TEMPLATES.md](INSTALLATION_TEMPLATES.md). Sprawdzenie: 508 testów aplikacji, 992 bazy, typy/lint/build; UI tworzenia, edycji, archiwum, kreatora, zmiany cen i niezależności oferty, oba motywy i telefon. Tymczasowe dane usunięte, audyt i numeracja zachowane, bez nowych kont/uprawnień i zmian rzeczywistych ofert. Program działa lokalnie na 127.0.0.1:3100. Kolejny proponowany etap: parametryczne ilości według długości instalacji, powierzchni, roboczogodzin i kilometrów w kreatorze.

## Parametryczne ilości — 1.11.2026

KRA-17: opcjonalna reguła każdego wiersza szablonu: fixed/length/area/labor/travel. Brak pola pozostaje stałą ilością, bez migracji danych. Edytor pokazuje ilość na jednostkę parametru, kreator tylko potrzebne pola i bieżące wyniki z sumą netto. Wspólne wyliczenie w tysięcznych BigInt, zaokrąglenie half-up, limity 0,001–10 000 na wynik, brak wyrażeń/eval. Braki i przekroczenia blokują utworzenie. Nowe oferty kopiują wyliczone ilości; powierzchnia zapisana w opcjonalnym technical.areaMills. Zapisane oferty/PDF/publikacje pozostają niezależne. Odświeżenie zmienionego zestawu zachowuje wpisane parametry, wybór innego je czyści. Migracja 202611010005 zastosowana i zarejestrowana lokalnie. Instrukcja [TEMPLATE_PARAMETERS.md](TEMPLATE_PARAMETERS.md). Sprawdzenie: 533 testy aplikacji, 1018 bazy, typy/lint/build; UI przeliczeń i zapisu (8×1,25=10;40×6,5=260), limity, oba motywy/telefon, oferta zachowana po zmianie mnożnika. Usunięto wyłącznie własne dane demonstracyjne, audyt/numeracja zachowane; istniejącego szablonu użytkownika nie zmieniano. Test 024 odizolowany własnym prefiksem wyszukiwania. Program działa na 127.0.0.1:3100. Kolejny proponowany etap: kilka wariantów oferty z różnych szablonów i porównanie kosztu/ceny/marży przed zapisem.

## Warianty z szablonów — 1.11.2026

KRA-18: do 5 wariantów nowej oferty z biblioteki szablonów, własne unikalne nazwy, usuwanie dodatkowych i wybór głównego. Wspólne parametry, niezależne reguły i kopie pozycji; tabela kosztu/netto/brutto/różnicy/marży i rozwijane szczegóły. Świeży odczyt wszystkich zestawów przed jednym atomowym zapisem, zmiana dodatkowego wariantu odświeża porównanie z zachowaniem parametrów/nazw/rekomendacji. Namespace identyfikatorów wariant/wiersz zachowuje tożsamości przy ponowieniu i usunięciu innej alternatywy. Dotychczasowe tworzenie ręczne/jeden szablon zachowane. Brak nowej migracji lub uprawnień, użycie istniejącego POST save_offer. Instrukcja [OFFER_TEMPLATE_VARIANTS.md](OFFER_TEMPLATE_VARIANTS.md). Sprawdzenie: 548 testów aplikacji, 1035 bazy, typy/lint/build; UI dodania/usunięcia/rekomendacji/nazw/freshness/zapisu, oba motywy i telefon. Zapis dwóch niezależnych wariantów potwierdzony w bazie. Tymczasowe dane usunięte, audyt i numeracja zachowane; bez zmian rzeczywistych danych i kont. Aplikacja lokalna 127.0.0.1:3100. Proponowany kolejny etap: zapis dopracowanego wariantu istniejącej oferty jako nowego szablonu.

## Szablon z wariantu oferty — 1.11.2026

KRA-19: w zapisanej kalkulacji biuro/admin mogą utworzyć nowy szablon z wybranego wariantu. Wszystkie zapisane ilości jako stałe, jawne powiązanie ręcznych/wycofanych pozycji z aktywnym katalogiem o zgodnej jednostce, bez kopiowania historycznych cen, rabatów i notatek. Oryginał pozostaje bez zmian. Ścisłe API/wspólny klient, kontrola wersji źródła, atomowy zapis i bezpieczne ponowienie. Migracja `202611010006_offer_variant_templates.sql` zastosowana i zarejestrowana. Instrukcja [OFFER_VARIANT_TO_TEMPLATE.md](OFFER_VARIANT_TO_TEMPLATE.md). Sprawdzenie: 570 testów aplikacji, 1068 bazy, typy/lint/build; UI obu motywów, telefon, konflikt równoległej zmiany, mapowanie, utworzenie i otwarcie szablonu. Dane demonstracyjne usunięte; audyt/numeracja i rzeczywiste dane zachowane. Lokalna aplikacja 127.0.0.1:3100. Proponowany kolejny krok: powielanie szablonów instalacji dla zestawów Standard/Komfort/Premium.

## Aktualizacja planu rozwoju — 3.11.2026

Na prośbę użytkownika przebudowano [PRODUCT_PLAN.md](PRODUCT_PLAN.md) na aktualny plan: stan lokalny i oczekujący odbiór, domknięcie ofertowania, komunikacja/powiadomienia, przygotowanie pilotażu, lejek sprzedaży, koszty realizacji i magazyn, opieka/rozliczenia oraz aplikacje Windows/macOS i iOS/Android. Plan zawiera zależności, kryteria zakończenia i dodatkowe pomysły. Najbliższa kolejka: powielanie szablonów → profil firmy/warunki → centrum powiadomień → automatyczne e-maile → test pełnego procesu/pilotaż. Plan opracowano na podstawie dokumentów, kodu oraz odczytu zadań Linear; nie zmieniano statusów, danych aplikacji ani implementacji. Wyniki 570/1068 są ostatnimi zapisanymi wynikami z 1.11, nie nowym uruchomieniem testów.

## Powielanie szablonów — 3.11.2026

KRA-20: przycisk na liście i w edytorze zapisanej wersji, nazwa i świeży podgląd, kopia opisu/rodzaju prac/pozycji/ilości/reguł z nowymi UUID. Aktywna kopia także z archiwalnego źródła; nieaktywne produkty blokują całość. Chroniony POST i wspólny klient, wersja źródła, atomowy zapis oraz prywatny rejestr bezpiecznych ponowień; oryginał bez zmian. Migracja 202611030001 zastosowana i zarejestrowana. 590 testów aplikacji, 1103 bazy, lint/build z kontrolą typów. UI konfliktu, kopiowania i edycji niezależnej od źródła, obu motywów i telefonu, blokady wycofanych produktów. Tymczasowe dane usunięte, audyt i rzeczywiste dane zachowane. Instrukcja [TEMPLATE_DUPLICATION.md](TEMPLATE_DUPLICATION.md). Kolejny krok: profil firmy, własne logo i domyślne warunki dokumentów. Dodatkowe pomysły pozostają na później zgodnie z decyzją użytkownika.

## Profil firmy — 3.11.2026

KRA-21: profil w Ustawieniach (admin zmienia, biuro odczytuje), dane wykonawcy/kontakt, własne logo PNG/JPG normalizowane do małego PNG, warunki i ważność 1–365 dni. Pierwszy dokument bez zapisu pobiera domyślne dane, zapisane/publikowane oferty zachowują snapshot. Logo opcjonalne i w nagłówkach PDF ofert; starsze dokumenty zgodne. Chronione API/wspólny klient, wersje i idempotentne ponowienia, prywatna tabela i metadane audytu. Migracja 202611030002 zastosowana i zarejestrowana. 617 testów aplikacji, 1133 bazy, lint/build z typami; UI obu motywów/telefonu, dodania logo, zapisu i konfliktu; oferta z dawnymi 30 dniami i nowy dokument z 15 dniami potwierdzone. Dane demonstracyjne usunięte; profil pozostaje pusty, rzeczywiste dane/uprawnienia bez zmian. Instrukcja [COMPANY_PROFILE.md](COMPANY_PROFILE.md). Kolejny krok: centrum powiadomień, historia/przeczytanie/preferencje.

## Centrum powiadomień — 3.11.2026

KRA-22: `/dashboard/notifications`, trwałe własne przypomnienia tasks/service/maintenance, filtry i strony, odwracalne przeczytanie, własne wersjonowane preferencje. Dzwonek łączy historię i istniejące bieżące alerty; te ostatnie odświeża przy otwarciu. Zbieranie na żądanie, bez harmonogramu/e-mail/push. Deduplikacja per źródło/termin/etap, partie 200. Historia po zakończeniu, ale aktualne nazwy i ponowna kontrola dostępu — po cofnięciu uprawnień również liczniki/metadane ukryte. Prywatne tabele/projekcje, API i wspólny klient. Migracja 202611030003 zastosowana i zarejestrowana. 641 testów aplikacji, 1178 bazy, lint/build; UI przeczytania 3→2→3, filtrów i historycznego zamkniętego źródła, preferencji, dzwonka, motywów i telefonu. Dane demonstracyjne usunięte, oryginalne preferencje przywrócone, audyt źródeł zachowany. Instrukcja [NOTIFICATION_CENTER.md](NOTIFICATION_CENTER.md). Następny krok: kontrolowana kolejka automatycznych e-maili.

## Kolejka e-mail — 3.11.2026

KRA-23: osobny opt-in pracownika w centrum, zweryfikowany adres konta, ogólne przypomnienia tasks/service/maintenance od chwili włączenia. Prywatna kolejka i wersjonowane preferencje, unikalność wiadomości, blokady, ponowne sprawdzanie uprawnień i aktualności przed wysyłką, anulowanie, maksymalnie 5 prób/20 h, zamrożony payload i idempotencja Resend. Historia rozróżnia przyjęcie/dostarczenie/odbicie oraz niepewny wynik; polling dostawcy bez ponownej wysyłki. Serwerowy endpoint z sekretem, jawna lista odbiorców pilotażowych i runner co minutę. Mailpit tylko loopback; domyślnie disabled. Wspólne API/SDK, oba motywy i telefon. Migracja 202611030004 zastosowana i zarejestrowana. 666 testów aplikacji i 1218 bazy, typy/lint/build; rzeczywista lokalna próba z Mailpit, bez wysyłki poza komputer. Dane demonstracyjne usunięte, preferencje odtworzone; brak nowych kont i grantów. Instrukcja [NOTIFICATION_EMAIL.md](NOTIFICATION_EMAIL.md). Nie skonfigurowano produkcyjnego nadawcy ani harmonogramu. Kolejny krok: test pełnego procesu i przygotowanie pilotażu; e-maile do klientów nadal wymagają osobnego zakresu zdarzeń.
