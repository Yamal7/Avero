# Dokumenty instalacji i załączniki zgłoszeń

Wersja lokalna, 25.10.2026.

## Obsługa

1. W karcie klienta przy instalacji wybierz „Dokumenty instalacji”. Ten sam widok jest dostępny z rejestru instalacji przez „Dokumenty”.
2. Dla pliku dotyczącego konkretnego zgłoszenia otwórz zgłoszenie → „Otwórz załączniki”. Plik pozostaje powiązany z instalacją oraz zgłoszeniem.
3. Wybierz PDF, JPG lub PNG do 10 MB i rodzaj: instrukcja, gwarancja, zdjęcie, inny dokument. Dodawanie wymaga roli administratora lub biura. Wybór instalacji/klienta archiwalnego blokuje nowe pliki.
4. Nowy plik jest wewnętrzny. „Udostępnij klientowi” pokazuje go w portalu. „Cofnij udostępnienie” odbiera dostęp przez portal oraz prywatny Storage. Pliku wcześniej pobranego na urządzenie nie można zdalnie usunąć.
5. „Archiwizuj” zachowuje plik, ale blokuje pobieranie. W archiwum można „Przywrócić jako wewnętrzny”, a następnie osobno udostępnić. Fizyczne kasowanie nie jest częścią tego modułu.

Lista ma po 20 pozycji na stronę. Zapisany plik nie jest nadpisywany; nową wersję dodaje się jako kolejny dokument i archiwizuje poprzednią. Równoczesne zmiany uprawnień są chronione numerem wersji: przy konflikcie odśwież stronę.

Administrator i biuro zarządzają plikami. Technik może pobrać pliki klientów przypisanych mu w panelu dostępu, w tym dokumenty wewnętrzne; nie dodaje ani nie udostępnia plików w tej iteracji. Klient widzi wyłącznie udostępnione, ukończone i niearchiwalne dokumenty swoich instalacji. Podgląd portalu przez pracownika stosuje te same ograniczenia widoczności co portal klienta.

## Przesyłanie i ochrona danych

Pliki trafiają do prywatnego koszyka `hvac-documents`. Ścieżka jest wyznaczana z identyfikatorów instalacji i dokumentu oraz rozszerzenia formatu; nazwa wyświetlana nie jest ścieżką Storage. Interfejs i serwer sprawdzają limity; serwer dodatkowo sprawdza sygnaturę PDF/JPEG/PNG. Sprawdzenie nagłówka pliku nie zastępuje skanowania antywirusowego — skanera nie wdrożono.

Zapis przebiega: rezerwacja metadanych → upload bez nadpisywania → potwierdzenie istnienia obiektu o właściwym rozmiarze i MIME → publikacja metadanych jako ukończonych. Wcześniej plik jest niewidoczny na listach i niedostępny do pobrania. Ponowienie tej samej operacji z tym samym identyfikatorem i treścią nie tworzy duplikatu. Zmiana treści przy tym samym identyfikatorze powoduje konflikt.

Baza i Storage niezależnie kontrolują sesję, blokadę konta, przypisania, widoczność i archiwizację. Bezpośrednie zapisy metadanych i nadpisywanie obiektów przez klienta są zablokowane. Przygotowanie pliku, zakończenie przesłania i zmiany stanu zapisują audyt. Gotowy plik jest udostępniany wyłącznie jako chronione pobranie z nagłówkiem attachment, no-store i nosniff. Nie generujemy publicznych ani długotrwałych podpisanych linków.

Baza i Storage nie tworzą jednej transakcji. Zerwanie sesji albo zamknięcie strony może pozostawić niewidoczny wpis pending i obiekt. Ponowienie na tej samej stronie zachowuje identyfikator; zmiana pliku lub rodzaju rozpoczyna nową operację. Automatyczne sprzątanie starych pending, limity łącznej przestrzeni oraz polityka retencji wymagają osobnego zadania przed większym wdrożeniem. Nie usuwaj istniejących plików bez uzgodnienia zasad retencji.

## API i przyszłe aplikacje

| Metoda | Ścieżka | Działanie |
| --- | --- | --- |
| GET | `/api/v1/documents?installation=UUID` | Lista instalacji, opcjonalnie `ticket`, `customer`, `archived`, `page` |
| POST | `/api/v1/documents` | Multipart: `file`, `requestId`, `installationId`, opcjonalne `ticketId`, `documentType`; domyślnie wewnętrzny |
| PATCH | `/api/v1/documents/:id` | JSON: `version`, `visible`, `archived` |
| GET | `/api/v1/documents/:id/download` | Plik zgodnie z uprawnieniami użytkownika |
| GET | `/api/v1/portal/documents/:id/download?customer=UUID` | Pobranie w jawnym kontekście portalu, wyłącznie udostępnionego pliku |

Lista portalu wymaga `customer`; nie pozwala łączyć dwóch kontekstów nawet wtedy, gdy użytkownik ma oba członkostwa. `archived=true` dostępne wyłącznie dla administratora/biura poza podglądem portalu. Udostępnione załączniki pojawiają się przy odpowiednim zgłoszeniu, w karcie instalacji i ogólnej bibliotece dokumentów. Karty portalu pokazują maksymalnie 20 plików i odsyłają do biblioteki z paginacją.

API używa istniejącego Bearer lub sesji cookie z tej samej domeny. Wspólne kontrakty i metody `installationDocuments`, `uploadDocument`, `changeDocument` są w `packages/api-client`. Zapis pliku z Blob na urządzeniu nadal wymaga adaptera przyszłej aplikacji natywnej. Nie dodano aplikacji mobilnej ani instalatorów.

## Zakres kolejnej iteracji

Dodawanie zdjęć przez klienta do otwartego zgłoszenia jest dostępne w osobnym przepływie: [CLIENT_ATTACHMENTS.md](CLIENT_ATTACHMENTS.md). Administrator i biuro nadal dodają dokumenty jako wewnętrzne, a klient przesyła załączniki widoczne dla firmy i uprawnionych członków tego klienta. Kolejne procesy to harmonogramy przeglądów i przypomnienia.

## Weryfikacja 25.10.2026

- 131 testów Vitest oraz 203 asercje SQL, wraz z dotychczasowymi modułami.
- ESLint, TypeScript i kompilacja produkcyjna Next.js.
- Rzeczywisty test HTTP Bearer i prywatnego Storage: upload, finalizacja, powtórzenie bez duplikatu, udostępnienie, pobranie, konflikt wersji, archiwizacja i przywrócenie jako wewnętrzny.
- Odczyt nowego widoku w przeglądarce. Zrzut `documents-ready-2026-10-25.png` pokazuje wyłącznie tymczasowe dane testowe; po próbie zostały usunięte wraz z obiektem Storage. Dane istniejącego klienta pozostały bez zmian.

Test HTTP korzystał z istniejącego lokalnego konta administratora. Izolację klientów, technika i blokad kont sprawdzono w transakcyjnych testach SQL. Nie wykonano jeszcze próby na fizycznym telefonie ani skanowania antywirusowego.
