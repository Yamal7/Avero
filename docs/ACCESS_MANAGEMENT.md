# Konta, role i zaproszenia

Stan: 25.10.2026. Panel administratora: `/dashboard/users`.

## Role

| Rola | Zakres |
| --- | --- |
| Administrator | Cały CRM oraz konta, role, przypisania, blokady i historia dostępu |
| Biuro | Cały CRM, dodawanie i edycja danych oraz import CSV; bez zarządzania dostępem |
| Technik | Odczyt przypisanych klientów i instalacji; obsługa własnych zgłoszeń, wizyt i protokołów; bez zapisu CRM i importu |
| Klient | Własne dane i instalacje oraz dokumenty świadomie udostępnione przez firmę |

Przypisanie do klienta obejmuje jego lokalizacje, instalacje i urządzenia. W tej iteracji nie ma oddzielnego wyboru pojedynczej lokalizacji. Technik może mieć wiele przypisań, klient wiele członkostw. Zmiany w rolach nie opierają się na edytowalnych metadanych konta Auth.

## Pierwszy administrator

Migracja zachowuje dotychczasowym pracownikom rolę `office`. Nie promuje automatycznie żadnego konta i nie udostępnia publicznej funkcji bootstrapu. Pierwszego administratora wskazuje właściciel i nadaje mu rolę w zaufanym panelu bazy.

W lokalnym projekcie, na wyraźne polecenie użytkownika, rolę `admin` otrzymało istniejące konto `admin@hvac.local`. Pozostawiono dotychczasowe hasło. Nadanie roli zapisano w audycie jako konfigurację systemu.

## Zaproszenie

1. Administrator wybiera adres, rolę i — dla klienta obowiązkowo — istniejącego klienta z CRM. Technik może zostać zaproszony bez przypisań, otrzyma je później.
2. Formularz wymaga potwierdzenia odbiorcy i zakresu dostępu.
3. W bazie powstaje oczekujące zaproszenie. Nie nadaje ono jeszcze uprawnień.
4. Supabase Auth wysyła wiadomość potwierdzającą adres. Oddzielny klient anonimowy z przepływem implicit umożliwia otwarcie wiadomości w innej przeglądarce niż przeglądarka administratora. Nie używamy klucza service_role.
5. Strona `/accept-invitation` ustanawia sesję z linku i usuwa fragment zawierający tokeny z adresu. Odbiorca widzi e-mail, rolę i przypisanie. Nowe konto musi ustawić hasło; istniejące konto może zachować swoje hasło.
6. Dopiero przyjęcie zaproszenia tworzy rolę pracownika lub członkostwo. Baza sprawdza identyfikator zalogowanego konta i jego potwierdzony e-mail w `auth.users`, a nie dane dostarczone przez formularz.

Zaproszenie jest ważne 7 dni. Link logowania Auth ma osobny termin ważności (lokalnie domyślnie godzinę); administrator może ponowić wysyłkę. Powtórzenie ograniczono do jednej próby na zaproszenie na 60 sekund, niezależnie od limitów pocztowych Supabase.

Istniejący pracownicy oraz zablokowane konta są obsługiwani przez ustawienia konta, nie przez kolejne zaproszenie. Konto już istniejące, lecz bez roli pracownika, może otrzymać dodatkowe członkostwo po przyjęciu zaproszenia. Powtórne przyjęcie tego samego zaproszenia nie tworzy kolejnych wpisów.

Przekazanie wiadomości do usługi pocztowej nie oznacza potwierdzenia jej dostarczenia. Panel odróżnia przygotowanie, próbę wysyłki, przekazanie do poczty i błąd.

## Zmiana dostępu

- Rola, blokada i dodanie przypisania wymagają potwierdzenia w formularzu.
- Zablokowane konto zachowuje swoją tożsamość Auth i przypisania, ale od razu traci dostęp do danych programu przez RLS — także w już istniejącej sesji. Nie jest to usunięcie konta ani globalne wylogowanie z Auth.
- Przywrócenie dostępu ponownie udostępnia zapisany zakres.
- Ostatniego aktywnego administratora nie można zablokować ani zdegradować.
- Zmiana roli lub blokada unieważnia oczekujące zaproszenia tego adresu. Odebranie przypisania unieważnia oczekujące zaproszenia do tego klienta.
- Cofnięte, wygasłe i kierowane do innego adresu zaproszenia nie nadają dostępu. Zaproszenie nie może też zostać przyjęte po utracie uprawnień przez administratora, który je utworzył.
- Operacje administracyjne są serializowane blokadą transakcyjną. Kontrola administratora następuje po uzyskaniu blokady, aby uniknąć wykonania oczekującej operacji po odebraniu roli.

## Audyt

Osobna tabela historii rejestruje role, członkostwa, przypisania techników, blokady i obsługę zaproszeń. Obejmuje autora, czas oraz poprzedni i nowy stan. Bezpośredni zapis i odczyt tych tabel przez klientów API pozostaje zablokowany; panel korzysta z funkcji sprawdzających rolę administratora. Widok pokazuje ostatnie 50 zdarzeń i ostatnie 50 zaproszeń. Lista kont ma wyszukiwanie i paginację po 25 rekordów.

## Poczta lokalna i produkcja

- `.env.local`: `APP_URL=http://localhost:3100`. Adres pochodzi z konfiguracji, nigdy z niezaufanego nagłówka Host.
- Lokalne wiadomości: [Mailpit](http://127.0.0.1:54324). Nie trafiają do Internetu.
- `supabase/config.toml` włącza obowiązkowe potwierdzanie e-maili, adresy powrotu na localhost oraz polskie szablony pocztowe.
- Na produkcji trzeba ustawić własny SMTP, obowiązkowe potwierdzanie adresów e-mail, właściwe szablony oraz dokładnie dozwolone adresy powrotu. Ustawić `APP_URL` na domenę HTTPS aplikacji. Nie wyłączać weryfikacji e-mail: przyjęcie zaproszenia opiera się na potwierdzonej tożsamości Auth.

Dokumentacja implementacyjna: [Supabase Auth — klient SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs), [konfiguracja Auth, szablonów i SMTP](https://supabase.com/docs/guides/local-development/cli/config).

## Weryfikacja

- 38 testów aplikacji, w tym kontrola ról, blokady sesji, walidacja zaproszeń i śledzenie nieudanej wysyłki.
- 71 asercji SQL, w tym 33 asercje nowych uprawnień: brak samodzielnej promocji, zakres technika i klienta, blokada istniejącej sesji, tożsamość adresata, ponowne przyjęcie, wygaśnięcie i cofnięcie zaproszenia, ograniczenie ponowień oraz ochrona ostatniego administratora.
- Scenariusz ostatniego administratora wymaga maksymalnie jednego istniejącego administratora bootstrapu; przy większej liczbie istniejących administratorów te dwie asercje są pomijane. Żadna rzeczywista rola nie jest zmieniana przez testy.
- Kompilacja produkcyjna, kontrola typów i lint przeszły.
- W przeglądarce sprawdzono panel na rzeczywistym koncie administratora.
- Sprawdzono dostarczenie lokalnej wiadomości Auth do istniejącego konta testowego, polski szablon i poprawny adres powrotu do zaproszenia. Test poczty nie tworzył nowych kont ani nie nadawał uprawnień. Przyjmowanie zaproszeń jest sprawdzone w testach SQL; pełny przepływ nowego użytkownika z hasłem wymaga pilotażu z odbiorcą.

## Dalszy zakres

Portal klienta i obsługa zleceń technika są wdrożone w kolejnych iteracjach; opis w CUSTOMER_PORTAL.md oraz SERVICE_WORKFLOW.md. Do produkcji pozostają m.in. MFA administratorów, retencja historii i zaproszeń, monitorowanie dostarczalności oraz pilotaż całego procesu w docelowym środowisku pocztowym. Dokument nie oznacza audytu bezpieczeństwa całego produktu.
