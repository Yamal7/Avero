# Jeden produkt, trzy formy korzystania

Decyzja użytkownika: 25.10.2026. Przeglądarka, instalowane programy Windows/macOS i aplikacje Android/iOS należą do planu produktu.

## Wspólne zachowanie

Jedno konto i jedna baza danych. Administrator zarządza dostępem, biuro obsługuje CRM i serwis, technik widzi przypisane prace, klient swoje lokalizacje, instalacje, zgłoszenia i udostępnione dokumenty. Ograniczenia obowiązują we wszystkich aplikacjach, także po zablokowaniu konta z już wydaną sesją. Aktualizacje danych widoczne są po ponownym pobraniu z serwera; aktualizacja na żywo wymaga późniejszego wdrożenia.

Na komputerze: duży pulpit, tabele, wyszukiwanie, import i dokumenty. Na telefonie: krótkie formularze, wizyty, zgłoszenia i wygodna obsługa jedną ręką. Aparat, push, systemowe zapisywanie plików i udostępnianie wymagają adapterów oraz zgód systemowych. Nie każda funkcja sprzętowa ma odpowiednik na każdym urządzeniu.

## Architektura

Serwer Next.js i Supabase pozostają centralne. Reguły biznesowe, RLS, audyt i transakcje są wspólne. Klienci aplikacji korzystają z wersjonowanego API. Serwer nigdy nie udostępnia klucza service_role. W tej iteracji nie zmieniono schematu bazy ani polityk dostępu.

`packages/api-client` zawiera kontrakty Zod i klienta HTTP bez zależności od Next.js, React i przeglądarkowego magazynu sesji. Obecna aplikacja webowa używa wspólnych schematów ról i nowych zgłoszeń; pozostałe formularze nadal mogą korzystać z istniejących akcji serwera. Nowe klienty będą współdzielić kontrakty i reguły, a interfejs dostosują do urządzenia.

Obecnego Next.js z obsługą po stronie serwera nie można po prostu spakować jako samodzielnego klienta. Kandydatem na programy instalowane jest Tauri ze statycznym klientem React, po weryfikacji prototypu logowania i pobierania dokumentów na obu systemach. Dokumentacja [Tauri — frontend](https://tauri.app/start/frontend/) opisuje rozdzielenie statycznego interfejsu i usług serwera, a [capabilities](https://tauri.app/security/capabilities/) ograniczanie uprawnień systemowych. Dla telefonów wybór między wspólną powłoką a osobnym klientem mobilnym nastąpi po próbach aparatu, push i dostępności. Nie dodano jeszcze zależności ani projektów natywnych.

## Dostarczony zakres API v1

| Metoda i ścieżka pod `/api/v1` | Zakres |
| --- | --- |
| GET `/capabilities` | Publiczna wersja API, platformy, stan: web available; desktop/mobile planned; online |
| GET `/session` | Zweryfikowany użytkownik, rola i możliwości interfejsu |
| GET `/portal/context?customer=UUID&search=...` | Dostępne konta klienta, jawny podgląd pracownika; maksymalnie 50 wyników wyszukiwania |
| GET `/portal/overview?customer=UUID` | Liczniki, terminy i pierwsza strona wizyt/zgłoszeń |
| GET `/service/tickets` | Lista pracownika/technika, wyszukiwanie, status, strona; 25 rekordów |
| GET `/service/tickets?customer=UUID` | Lista portalu dla wskazanego klienta; 20 rekordów, status open/all/closed, bez wyszukiwania |
| POST `/service/tickets` | Nowe zgłoszenie; walidacja, istniejące limity i idempotencja bazy |
| GET `/portal/documents/UUID/download?customer=UUID` | Chroniony plik udostępniony klientowi |

Podgląd pracownika jest tylko do odczytu. W POST klient musi przesłać `customerId` oraz priorytet `normal`; pracownik podaje instalację bez `customerId`. Pozostałe pola: `installationId`, `subject`, `description`, `priority`, `requestId`. Przy ponowieniu tej samej operacji należy użyć tego samego `requestId`. Klient HTTP nie ponawia zapisów automatycznie.

API nie obejmuje jeszcze całego CRM: edycji klientów, list instalacji, zarządzania kontami, harmonogramu i protokołów. Te moduły działają w aplikacji internetowej i będą otrzymywać kolejne kontrakty podczas budowy klientów instalowanych.

Odpowiedzi JSON mają `apiVersion: "1"`; błędy mają `{error:{code,message}}` oraz odpowiedni status HTTP. Dane prywatne nie są buforowane. API nie zwraca wewnętrznych błędów SQL. Kontrakty odpowiedzi są sprawdzane zarówno na serwerze, jak i w kliencie HTTP. Aktualizacja kontraktów musi zachować zgodność z opublikowanymi klientami; zmiany zrywające zgodność wymagają następnej wersji API.

## Logowanie i konfiguracja

API przyjmuje `Authorization: Bearer <access_token>` Supabase. Token jest weryfikowany przez Auth, a rola i blokada odczytywane z bazy przy każdym żądaniu. Nieprawidłowy Bearer nie przechodzi na sesję cookie. Baza wykonuje zapytania jako ten użytkownik, z RLS.

Przeglądarka może używać istniejącej sesji cookie w tej samej domenie. Zapis z cookie wymaga nagłówka Origin zgodnego z `APP_URL`; zapisy przyjmują wyłącznie JSON, do 64 KiB. Źródła aplikacji natywnych dodaje się jawnie do `NATIVE_ALLOWED_ORIGINS` (lista rozdzielona przecinkami). Domyślnie lista jest pusta. Brak wildcard i `null`, brak przesyłania cookies między domenami. CORS nie zastępuje uwierzytelniania ani RLS. `APP_URL` jest adresem kanonicznym HTTPS; HTTP dozwolone lokalnie na loopback.

Klient HTTP wymaga adresu HTTPS bez ścieżki i danych logowania. `allowLocalHttp: true` dopuszcza wyłącznie loopback w środowisku lokalnym. Token dostarcza funkcja `getAccessToken`. Moduł go nie zapisuje i nie implementuje jeszcze logowania, odświeżania ani wylogowania. Aplikacje natywne muszą dodać przechowywanie tokenów w zabezpieczonym magazynie systemu, obsługę odświeżania/wylogowania, linków powrotnych i wygasania sesji. Nie należy kopiować przeglądarkowych cookies do aplikacji ani zapisywać tokenów w zwykłych plikach.

SDK zwraca dokument jako Blob z oczyszczoną nazwą. Adapter systemowy ma wybrać bezpieczny katalog, obsłużyć zapis/udostępnienie i nie używać nazwy jako dowolnej ścieżki. API pobierania obejmuje pliki, nie wydruki protokołów HTML. Obsługa drukowania i eksportu protokołów wymaga osobnego adaptera.

## Kolejność kolejnych etapów

1. Prototyp Windows/macOS: własny statyczny klient, logowanie, bezpieczna sesja, wybór klienta, odczyt i zgłoszenie, dokument. Próby na rzeczywistych systemach.
2. Uzupełnienie API dla instalacji, wizyt, protokołów i CRM; dopasowanie pulpitu oraz nawigacji do programu komputerowego.
3. Pakiety instalacyjne, podpisy Windows/macOS, aktualizacje, środowisko testowe HTTPS i pilotaż.
4. Klient Android/iOS: portal klienta oraz widok technika; aparat, pliki i push; testy uprawnień, dostępności i publikacja testowa.
5. Synchronizacja offline: ograniczony zakres, szyfrowany magazyn lokalny, kolejka zmian, rozwiązywanie konfliktów, usuwanie danych po wylogowaniu. Do tego czasu aplikacje wymagają internetu.

Nie wdrażamy lokalnych, niezależnych baz firm na każdym komputerze. Instalacja aplikacji nie oznacza pracy bez internetu. Powiadomienia systemowe, automatyczne aktualizacje i sklepy wymagają osobnych wdrożeń oraz konfiguracji kont wydawcy.

## Weryfikacja tej iteracji

Testy jednostkowe obejmują klienta HTTP, Bearer i cookies, blokady, CORS/Origin, limit JSON, zakres klienta, role, zapis zgłoszeń oraz chronione pobieranie dokumentów. Nie zastępują prób instalatorów, prawdziwego logowania natywnego i testów na urządzeniach — te elementy jeszcze nie istnieją.

Wynik 25.10.2026: 112 testów Vitest, ESLint i kompilacja produkcyjna Next.js z kontrolą typów zakończone sukcesem. Lokalnie potwierdzono przez prawdziwą sesję administratora: `/session`, `/portal/context`, `/portal/overview` i listę zgłoszeń. Test HTTP potwierdził publiczne capabilities (200), brak sesji i błędny Bearer (401), obcy Origin (403). Próby rzeczywistego Bearer z odświeżaniem sesji pozostają częścią prototypu natywnego. Nie dodawano ani nie zmieniano danych klienta podczas tych prób.

## Korekta kolejności — 25.10.2026

Po rozmowie z użytkownikiem priorytetem jest stabilna pierwsza wersja użytkowa w przeglądarce. Pełne klienty instalowane powstaną po sprawdzeniu podstawowych procesów; wcześniej można wykonać ograniczoną próbę techniczną logowania/plików. Dodany moduł dokumentów korzysta już z `/api/v1/documents`, `/api/v1/documents/:id` i `/api/v1/documents/:id/download`. Klient HTTP udostępnia `installationDocuments`, `uploadDocument`, `changeDocument`; portalowe pobieranie zachowuje jawny kontekst klienta.
