# Profil firmy i domyślne oferty — 3.11.2026

KRA-21, wdrożenie lokalne. W **Ustawieniach** administrator zapisuje nazwę, pełny adres, identyfikator podatkowy, kontakt, stronę internetową, własne logo, domyślną ważność (1–365 dni), wprowadzenie i warunki oferty. Biuro odczytuje profil i może zmieniać dane w poszczególnych dokumentach. Technik, klient i konto zablokowane nie mają dostępu do profilu ani jego API. To jeden profil wykonawcy dla obecnego programu, nie obsługa wielu niezależnych firm.

## Działanie

Profil podpowiada dane przy pierwszym przygotowaniu dokumentu oferty, gdy nie zapisano jeszcze jej danych PDF. Dotyczy także starszej kalkulacji, która nie ma dokumentu. Data wystawienia to bieżący dzień w Europe/Warsaw; ważność wyliczana jest według ustawionej liczby dni. Użytkownik może zmienić treść przed zapisem. Sam odczyt profilu nie zapisuje dokumentu, nie publikuje oferty i nie wysyła wiadomości.

Po zapisie dokument ma własną kopię danych wykonawcy, logo i warunków. Dalsza zmiana profilu nie nadpisuje zapisanych dokumentów, ich dat, wersji ani opublikowanych ofert/PDF. Nie ma automatycznego zastosowania nowych danych do istniejącego dokumentu. Nie zmieniono generatorów protokołów serwisu/montażu — własne logo w tym etapie dotyczy ofert PDF.

Bez profilu pozostaje dotychczasowy formularz do ręcznego uzupełnienia, bez fikcyjnych danych firmy. Usunięcie logo z formularza wymaga zapisu. Zapis bez logo używa dotychczasowego znaku aplikacji. Historyczne dokumenty bez nowego pola pozostają poprawne.

## Logo

Formularz przyjmuje PNG/JPG do 512 KB i maksymalnie 16 mln pikseli. Przygotowuje proporcjonalny PNG do 512 px i 64 KiB, zmniejszając dalej do 256/128 px, jeśli potrzeba. W podglądzie zachowujemy proporcje. Zapis i pobranie dokumentu są wstrzymane podczas przygotowywania logo.

Do danych dokumentu trafia opcjonalne `logoPng` — mała kopia obrazu w formacie data URL, nigdy adres do zewnętrznego zasobu. API weryfikuje strukturę PNG, sumy CRC, format RGB/RGBA 8-bit bez przeplotu, rozmiar oraz ograniczoną dekompresję. Generator powtarza tę kontrolę przed przekazaniem danych silnikowi PDF, także dla danych zapisanych bezpośrednio przez chronioną funkcję bazy. Baza sprawdza ograniczenia rozmiaru, nagłówek, wymiary i format. SVG, zdalne obrazy i animacje nie są obsługiwane.

Logo trafia do zarezerwowanego pola nagłówka każdej strony oferty. Pełna nazwa wykonawcy pozostaje w danych sprzedawcy; długi nagłówek jest ograniczony do dwóch wierszy. Obrazy nie są przechowywane w publicznym katalogu plików ani pobierane z sieci podczas generowania.

## Zapis i API

Migracja `202611030002_company_profile.sql`: prywatna tabela `company_profiles` z jednym rekordem, odczyt `company_profile` dla admin/biura, zapis `save_company_profile` dla admina, istniejąca blokada zapisów i kontrola wersji. Identyczne ponowienie ostatniego zapisu nie zmienia wersji ani nie dodaje zdarzenia audytu. Inna treść ze starą wersją daje konflikt i wymaga wczytania aktualnego profilu. Audyt zapisuje autora, operację i metadane wersji/czasu, bez powielania logo i pełnej treści profilu. Baza nie nadaje nowych ról ani uprawnień.

- GET `/api/v1/company-profile`: profil `{version,data}` lub null, bez dodatkowych parametrów.
- PUT tej ścieżki: `{version,data}`; version null wyłącznie przy pierwszym utworzeniu.
- Wspólne kontrakty i metody `companyProfile`, `saveCompanyProfile`, `documentFromCompanyProfile` dla przyszłych klientów.
- Zapis profilu i dokumentu ma limit treści 128 KiB, aby pomieścić ograniczone logo; pozostałe endpointy zachowują istniejące limity.

## Weryfikacja

617 testów aplikacji (58 plików), 1133 asercje SQL (29 plików), lint oraz build z kontrolą typów przeszły. Nowe testy obejmują role, brak profilu, wersje i ponowienia, walidację danych/ważności/logo, współdzielony klient, PNG z błędną zawartością, rendering PDF z obrazem, brak zmiany zapisanego dokumentu i zgodność starszych dokumentów bez logo.

Przeglądarka: dodanie PNG przez wybór pliku, zapis profilu z 30 dniami i warunkami, skopiowanie logo/danych do dokumentu demonstracyjnej oferty i zapis. Zmiana profilu w drugiej sesji na 15 dni/nową nazwę spowodowała konflikt starego formularza. Po odświeżeniu wcześniejsza oferta zachowała nazwę i datę 3.12.2026, nowy dokument otrzymał nową nazwę i datę 18.11.2026. Oba motywy, formularz 390×844 bez przewijania poziomego (390/390 px). Bez wysyłek i publikacji do rzeczywistych klientów.

Przykład czterostronicowego PDF z demonstracyjnym logo: `output/pdf/oferta-profil-firmy-przyklad.pdf`; wszystkie cztery strony wyrenderowane i sprawdzone wizualnie, podgląd pierwszej w `output/qa/company-profile-pdf.png`. Podglądy formularza: `company-profile-dark.png`, `company-profile-light.png`, `company-profile-mobile.png` w `output/qa`. Zapis przykładu jest oznaczony jako dane przykładowe. Test renderowania potwierdza osadzenie obrazu w PDF.

Tymczasowy profil, dwie oferty i klient demonstracyjny zostały usunięte, audyt i numeracja zachowane. Przed próbą profil nie istniał i po próbie pozostaje pusty (0 rekordów), gotowy do uzupełnienia przez użytkownika. Nie zmieniano rzeczywistych ofert, użytkowników ani uprawnień. Migracja zastosowana i zarejestrowana lokalnie; aplikacja na 127.0.0.1:3100. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki. Próby na fizycznym telefonie pozostają częścią pilotażu.

Następny krok planu: centrum powiadomień z historią, oznaczaniem przeczytania i preferencjami, przed automatyczną wysyłką e-mail.
