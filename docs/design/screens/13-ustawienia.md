# Ustawienia

Makieta: ekran `ustawienia` z ustawieniem `ust`: profil firmy / dokumenty / katalog i marże / użytkownicy / technicy i busy / integracje / mój profil / powiadomienia / wygląd. Szablony protokołów to istniejący ekran `szablony` (ta sama sekcja menu).

Projekt oparty na tym, co już działa w kodzie: `docs/COMPANY_PROFILE.md`, `docs/ACCESS_MANAGEMENT.md`, `docs/NOTIFICATION_EMAIL.md`, `docs/NOTIFICATION_CENTER.md`, `docs/THEMES.md`, `docs/CATALOG.md`.

## Układ
- Panel boczny aplikacji zostaje (podświetlone „Ustawienia”). W panelu głównym druga kolumna 204 px z nawigacją ustawień:
  - **Firma**: Profil firmy, Dokumenty i numeracja, Katalog i marże, Szablony protokołów
  - **Zespół**: Użytkownicy i role, Technicy i busy
  - **Połączenia**: Integracje
  - **Moje konto**: Profil, Powiadomienia, Wygląd
- Treść: nagłówek 18 px + jedno zdanie, sekcje jako bloki `--bg-raised`; formularz w dwóch kolumnach (200 px etykieta + podpowiedź, reszta pole). Pola bez ramek na `--bg-subtle`, ikona w polu.

## Profil firmy
- Dane firmy: nazwa (z CEIDG), nazwa skrócona (nagłówki, SMS), NIP z kapsułką „suma kontrolna”, adres (ulica / kod / miasto), kontakt (telefon, e-mail, www), logo (podgląd 64 px, Zmień / Usuń, ograniczenia z COMPANY_PROFILE).
- Płatności: konto bankowe **zamaskowane** (ikona kłódki odsłania), kapsułka „konto na białej liście”.
- Domyślne warunki ofert: ważność (1–365 dni), wprowadzenie, warunki.
- Kapsułka wersji („wersja 4 · 3 lis”, autor w podpowiedzi) — zapis z kontrolą wersji; przy konflikcie komunikat jak w COMPANY_PROFILE.
- Stopka: informacja, że zmiana profilu nie zmienia wystawionych dokumentów + „Zapisz zmiany” (⌘S).

## Użytkownicy i role
- Pigułki: Pracownicy / Klienci / Zaproszenia (z liczbami), przycisk „Zaproś” (I).
- Wiersz: awatar w kolorze osoby, imię + e-mail · zakres (np. „14 klientów”), kapsułka roli z kolorową ikoną (Administrator, Biuro, Technik, Klient — opis w podpowiedzi), kapsułka dostępu (Aktywne / Zaproszenie „wygasa za N dni” / Zablokowane), ostatnia aktywność.
- Ostatni administrator: podpowiedź, że nie można go zablokować ani zdegradować.
- **Uprawnienia ról**: macierz funkcja × rola (✓ / „swoje” / —) zgodna z ACCESS_MANAGEMENT i CATALOG (technik i klient nie widzą cen zakupu).
- Prawy panel (300 px): rola, przypisani klienci (+ Przypisz), bus, **kolor osoby** (7 próbek; używany w awatarze, planowaniu, mapie, raportach), historia dostępu z audytu, „Zablokuj dostęp” (czerwony tekst, potwierdzenie; przypisania zostają).

## Integracje
- Grupy: Płatności i dokumenty, Komunikacja, Mapa i dane. Wiersz: ikona na białym kwadracie, nazwa + kapsułka stanu (Połączono / Tryb testowy / Czeka na dostawcę / Wymaga konfiguracji / Wyłączone), opis, kapsułki szczegółów, jedna akcja.
- **Klucze tylko na serwerze**: kapsułka z ikoną serwera pokazuje nazwę zmiennej środowiskowej (np. `NOTIFICATION_MAIL_MODE=local`), nigdy wartość.
- Przelewy24 (sandbox, powiadomienia działają, „Przełącz na produkcję” — zwykły przycisk, nie akcent), KSeF (B2B; B2C poza KSeF; najpierw środowisko testowe), Microsoft 365 (skrzynki serwis@ i biuro@ do Skrzynki; „Połącz z Microsoft 365”, logowanie u dostawcy), Gmail i inne skrzynki (przekierowanie na adres Avero, DNS: SPF i DKIM, „Skonfiguruj przekierowanie”), Wysyłka automatyczna (Mailpit lokalnie, nadawca niezweryfikowany, „Wyślij test”), SMS (stan „Czeka na dostawcę”: kanał gotowy, „3 funkcje czekają”, nadawca, `SMS_*`, „Podłącz dostawcę”), Mapa (OSM/Nominatim, pamięć podręczna, limit 1 zapytanie/s), Biała lista VAT i CEIDG.

## Dokumenty i numeracja
- **Serie numeracji** (tabela): dokument z kolorową ikoną, format ze znacznikami `{RRRR}` `{MM}` `{N}` `{NNN}` `{TYP}` (kapsułki mono), następny numer, kiedy licznik od nowa (nigdy / co miesiąc), akcja.
- Oferty, zlecenia i zgłoszenia — **kłódka**: numer nadaje baza (globalna sekwencja, możliwe luki — zgodnie z `docs/OFFERS.md`).
- Faktury, zaliczkowe, korekty, protokoły, dokumenty magazynowe — edytowalne; zmiana formatu działa od nowego miesiąca, wystawione dokumenty bez zmian, numeracja w miesiącu ciągła.
- Faktury: termin płatności (od wystawienia / od wykonania), przelew + przełącznik linku P24, domyślna stawka VAT z podpowiedzią o 8 % przy montażu w budynku mieszkalnym, KSeF (B2B automatycznie, B2C opcjonalnie; stan z Integracji), uwagi w stopce.
- Protokoły i PDF: podpis klienta wymagany, PDF do klienta, wydruki zawsze jasne.

## Katalog i marże
- Marża = (sprzedaż − koszt) / sprzedaż (jak w `docs/CATALOG.md`).
- Progi: próg całej oferty (22 %, znacznik na pasku w kreatorze) + progi kategorii (urządzenia, materiały, usługi, dojazd) z paskiem średniej z 90 dni i znacznikiem progu.
- Poniżej progu: „Tylko ostrzeżenie” / „Zgoda administratora”.
- Robocizna i dojazd: roboczogodzina, dopłaty (noc i weekend, święta), strefy dojazdu jako kapsułki, sposób ustalania cen sprzedaży (narzut od kosztu / ręcznie).
- Cenniki dostawców: dostawca, wersja cennika, liczba pozycji, stan (aktualny / „ceny +9 % od 1 wrz” z ostrzeżeniem / brak pliku), Importuj / Zaktualizuj.

## Technicy i busy
- Technicy: uprawnienia jako kapsułki (F-gaz kat. I, SEP E1, gaz G3) z ptaszkiem / ostrzeżeniem o wygaśnięciu („41 dni”) / szarą kropką przy braku; godziny pracy; bus; koszt godziny (widzi tylko administrator — do marży i raportów).
- Busy: rejestracja, pojazd z awatarem kierowcy, czynnik na pokładzie (butle z kolorową kroplą), waga (kalibracja), badanie i OC. Stany butli tylko do odczytu (zmienia RW i ważenie); minimum na bus w Magazynie.
- Avero używa tych danych przy podpowiadaniu technika (np. brak G3 → podwykonawca przy demontażu kotła).

## Mój profil
- Zdjęcie / inicjały, imię i nazwisko, e-mail logowania (potwierdzony; zmiana wymaga potwierdzenia), telefon, podpis e-maili.
- Bezpieczeństwo: zmiana hasła linkiem, aktywne sesje (urządzenie, miasto, kiedy) z „Wyloguj” i „Wyloguj wszystkie inne”.
- W ustawieniach awatar w górnym pasku pokazuje zalogowanego administratora (PK).

## Powiadomienia
- Główny przełącznik e-maili (domyślnie wyłączony w kodzie) + „Wyślij test”; e-mail bez nazw klientów i kwot (zgodnie z `docs/NOTIFICATION_EMAIL.md`).
- Macierz kategoria × kanał (W aplikacji, E-mail, Telefon — „wkrótce”): Moje zadania, Pilny serwis, Przeglądy (istniejące) + **nowe**: Oferty, Płatności, Magazyn.
- Cisza nocna (pilny serwis zawsze) i podsumowanie dnia e-mailem — **nowe**.

## Wygląd
- Motyw: karty z miniaturą — Jasny / Ciemny / **Jak system (nowe)**; przełącznik „Zapamiętaj na koncie” (**nowe** — dziś motyw tylko w przeglądarce, `docs/THEMES.md`).
- Gęstość list, panel boczny (rozwinięty / zwinięty, `[`), pierwszy dzień tygodnia, format daty, lista skrótów (`?`).
- Wydruki i PDF zawsze jasne.

Elementy oznaczone „nowe” nie istnieją jeszcze w kodzie — do wyceny i decyzji właściciela.


## Pola własne (Firma › Pola własne, ekran `ustawienia`, `ust="pola własne"`)
- Tylko administrator. Nagłówek z zasadą: pola systemowe i to, co Avero liczy samo (stany, F-gaz, ceny), zostają bez zmian. „Dodaj pole” (N).
- Moduły jako kapsułki z licznikami: Firmy, Obiekty, Urządzenia, Zlecenia, Zgłoszenia, Oferty.
- Lista pól modułu: uchwyt, ikona typu, nazwa, typ (te same typy co we własnych tabelach), gdzie widać (kapsułki miejsc), kto zmienia.
- Wybrane pole — „Gdzie pokazać”: przełączniki miejsc (karta rekordu, panel zgłoszenia i zlecenia, telefon technika, lista jako kolumna i filtr, portal klienta) z warunkiem („tylko gdy tak”) i regułą (np. faktura: bez numeru PO nie da się wystawić — działa też w API i przy fakturach z umów).
- Portal klienta: pola wewnętrzne nigdy; włączyć można tylko pole oznaczone „dla klienta”.
- Podgląd (340 px): prawdziwy panel (ZG-0912 Hotel Oliwski) z polami własnymi w istniejących sekcjach, pod polami systemowymi; edytowane pole obwiedzione akcentem.
- Pola obiektu (godziny dostępu, parking) widzi technik; kodów do drzwi i alarmów Avero nie przechowuje.

## Moduły i pakiety (Firma › Moduły i pakiety, `ust="moduły i pakiety"`)
- Tylko administrator. Zasada w nagłówku: wyłączenie ukrywa moduł w menu i ⌘K — dane zostają i wracają po ponownym włączeniu. Warstwy i zasady: `LAYERS.md`.
- **Pakiety branżowe** jako kafle (można łączyć): nazwa, co obejmuje, stan — aktywny (kropka), w przygotowaniu, planowany (przygaszone). Wybrany kafel obwiedziony akcentem.
- **Moduły** rdzenia z przełącznikami i opisem. Moduł wymagany przez aktywny pakiet — przełącznik zablokowany, kapsułka „wymagany przez HVACR”. Lista modułów zawsze włączonych pod spodem.
- **Konfiguracja firmy**: skróty do własnych tabel, pól własnych, szablonów (ile z pakietu), ról.
- Panel pakietu: wersja i dostawca (Avero), kto i kiedy włączył; **co dodaje** (typy urządzeń, typ przeglądu z zasadą częstotliwości, reguły, szablony, sekcje i kolumny, raporty i widżety, słownik — szczegóły w podpowiedziach); dane w programie; od czego zależy. „Wyłącz pakiet…” (tekst w kolorze błędu) — wymaga potwierdzenia; obowiązki prawne pakietu zostają po stronie firmy.
