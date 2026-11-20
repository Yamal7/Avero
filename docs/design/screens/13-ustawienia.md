# Ustawienia

Makieta: ekran `ustawienia` z ustawieniem `ust`: profil firmy / użytkownicy / integracje. Szablony protokołów to istniejący ekran `szablony` (ta sama sekcja menu).

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
- Grupy: Płatności i dokumenty, Komunikacja, Mapa i dane. Wiersz: ikona na białym kwadracie, nazwa + kapsułka stanu (Połączono / Tryb testowy / Wymaga konfiguracji / Wyłączone), opis, kapsułki szczegółów, jedna akcja.
- **Klucze tylko na serwerze**: kapsułka z ikoną serwera pokazuje nazwę zmiennej środowiskowej (np. `NOTIFICATION_MAIL_MODE=local`), nigdy wartość.
- Przelewy24 (sandbox, powiadomienia działają, „Przełącz na produkcję” — zwykły przycisk, nie akcent), KSeF (B2B; B2C poza KSeF; najpierw środowisko testowe), Poczta (Mailpit lokalnie, nadawca niezweryfikowany, „Wyślij test”), SMS (brak dostawcy → „3 funkcje czekają”), Mapa (OSM/Nominatim, pamięć podręczna, limit 1 zapytanie/s), Biała lista VAT i CEIDG.

## Do zaprojektowania w tej sekcji
Dokumenty i numeracja, Katalog i marże (progi marży, np. 22 %), Technicy i busy, Mój profil, Powiadomienia (preferencje z NOTIFICATION_CENTER), Wygląd (motyw).
