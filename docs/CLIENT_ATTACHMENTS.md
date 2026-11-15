# Załączniki klienta do zgłoszenia

Wersja lokalna, 25.10.2026.

## Użycie

Po zalogowaniu jako klient otwórz Portal → Serwis → wybrane zgłoszenie. Sekcja „Dodaj zdjęcie lub dokument” przyjmuje pojedynczy JPG, PNG lub PDF. Można wybrać plik z telefonu lub komputera. Nie dodano osobnego interfejsu aparatu ani obsługi HEIC.

Przed przesłaniem formularz informuje, że plik zobaczy firma oraz użytkownicy mający dostęp do wybranego klienta. Po potwierdzeniu zapisu pojawia się komunikat, a plik jest dostępny przy zgłoszeniu, w karcie instalacji i bibliotece dokumentów. Dokumenty zgłoszenia otrzymują oznaczenie źródła „Dodane przez klienta” / „Od klienta”. Nie wysyłamy automatycznie e-maila ani push do firmy.

Dodawanie jest dostępne dla otwartych zgłoszeń aktywnych klientów i niearchiwalnych instalacji. Dotyczy członków klienta wskazanego w portalu, również gdy zgłoszenie założyła firma lub inny uprawniony członek. Podgląd pracownika jest tylko do odczytu; administrator i biuro korzystają z dotychczasowego modułu dokumentów.

Klient nie nadpisuje pliku, nie zmienia jego powiązań ani udostępnienia, nie archiwizuje i nie kasuje dokumentów. Firma może cofnąć udostępnienie lub zarchiwizować załącznik. Ponowienie pierwotnego uploadu nie cofa tej decyzji. Po zamknięciu zgłoszenia załączniki nadal można pobierać zgodnie z uprawnieniami, ale nie można przesyłać kolejnych.

## Limity i ponowienia

- Do 10 MiB na plik (w interfejsie opisane jako 10 MB).
- Do 10 załączników klienta i 50 MiB zarezerwowanego rozmiaru na zgłoszenie, łącznie dla wszystkich członków.
- Do 10 nowych rezerwacji na godzinę na użytkownika, łącznie dla wszystkich jego klientów.

Limity uwzględniają pending, gotowe i archiwalne załączniki klienta. Dokumenty dodane przez biuro nie zużywają tej puli. Rezerwacje są liczone pod blokadą użytkownika i zgłoszenia, aby równoczesne żądania nie pomijały limitu. Nieudana próba po rezerwacji może zużyć pulę; ponowienie na tej samej stronie z tym samym plikiem zachowuje identyfikator i nie zużywa następnej pozycji. Zmiana pliku rozpoczyna nową operację. Po przeładowaniu strony identyfikator roboczy nie jest zachowywany.

W razie limitu zgłoszenia użytkownik otrzymuje informację o kontakcie z firmą; limit godzinowy wymaga odczekania. Archiwizacja nie zeruje puli. Automatyczne sprzątanie nieukończonych rezerwacji i odzyskiwanie ich po ponownym otwarciu strony pozostają osobnym zadaniem przed pilotażem. Są to limity aplikacji, a nie globalny limit rozliczeniowy Storage. W produkcji potrzebne są również limity całej przestrzeni i polityka retencji.

## API i ochrona dostępu

`POST /api/v1/portal/service/:ticketId/attachments` przyjmuje multipart z `file`, `customerId`, `requestId`. Format, nazwa, rozmiar i sygnatura pliku są walidowane. Typ dokumentu jest wyznaczany z MIME: zdjęcie dla JPG/PNG, inny dokument dla PDF. Klient nie wskazuje instalacji ani dowolnego adresu zapisu; instalację wyznacza baza z danego zgłoszenia. Kontrola nagłówka pliku nie jest skanowaniem antywirusowym.

Endpoint przyjmuje Bearer lub sesję cookie z tej samej domeny, z istniejącą kontrolą Origin. Baza wymaga aktualnego członkostwa we wskazanym kliencie. Nie pozwala mieszać dwóch własnych kontekstów ani korzystać z uprawnień technika/pracownika do udawania klienta. Podmienione identyfikatory, zamknięcie zgłoszenia, blokada konta, archiwizacja i odebranie członkostwa są sprawdzane niezależnie od widoczności formularza.

Zapis korzysta z dotychczasowej rezerwacji pending → prywatny Storage bez nadpisania → sprawdzenie rzeczywistego rozmiaru/MIME obiektu → gotowy dokument. W przypadku klienta widoczność jest ustawiana przy rezerwacji, ale RLS nie udostępnia pending. Dostęp do zarezerwowanej ścieżki ma tylko jej twórca. Utrata dostępu podczas przesyłania uniemożliwia finalizację. Pobieranie i dalsze udostępnienie podlegają zasadom opisanym w [DOCUMENTS.md](DOCUMENTS.md).

Odpowiedź sukcesu jest zgodna z `documentSavedSchema`. Błędy limitu mają status 429 i kod `ATTACHMENT_RATE_LIMIT` albo `ATTACHMENT_TICKET_LIMIT`. SDK udostępnia `uploadTicketAttachment(ticketId, {customerId, requestId, fileName}, blob)`, bez automatycznego ponawiania. Interfejs natywny aparatu/plików pozostaje przyszłym adapterem.

## Weryfikacja

- 143 testy Vitest i 243 asercje SQL, wraz z dotychczasowymi modułami.
- ESLint, TypeScript i kompilacja produkcyjna Next.js.
- Rzeczywiste logowanie jednorazowego klienta, przesłanie PNG do prywatnego Storage, pobranie, ponowienie bez duplikatu, odrzucenie obcego kontekstu i zamkniętego zgłoszenia.
- Podgląd formularza i listy na prawdziwej sesji klienta w osobnym lokalnym podglądzie; konto, plik i rekordy testowe zostały usunięte po próbie. Konta i dane istniejących klientów nie były zmieniane.
- Zrzut `client-attachments-ready-2026-10-25.png` pokazuje tymczasowe dane testowe. Nie wykonano próby na fizycznym telefonie.

Następny etap produktu: harmonogramy przeglądów i lista terminów, później przypomnienia i powiadomienia.
