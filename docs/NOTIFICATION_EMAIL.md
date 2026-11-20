# Automatyczne przypomnienia e-mail — 3.11.2026

KRA-23. Pierwszy zakres to przypomnienia **dla pracowników** z centrum powiadomień: własne zadania, pilny serwis i przeglądy. Nie dodano jeszcze e-maili ofert, wizyt i odbiorów do klientów. Ustawienia i historia: `/dashboard/notifications`.

## Zachowanie

- Domyślnie wyłączone; każdy pracownik włącza e-maile dla siebie. Odbiorcą jest potwierdzony adres konta Auth, a nie adres przekazany przez formularz. Obowiązuje też wybór kategorii w centrum.
- Kolejka obejmuje nieprzeczytane przypomnienia zarejestrowane od momentu włączenia. Starsza historia nie jest wysyłana po włączeniu lub ponownym włączeniu. Worker może sam zbierać nowe przypomnienia bez otwierania aplikacji.
- Jedna pozycja kolejki na przypomnienie. Przed przejęciem i ponownie tuż przed wysyłką sprawdzane są bieżący dostęp, blokada konta, rola, adres, preferencje, przeczytanie i aktualność zdarzenia. Zakończona sprawa lub cofnięty dostęp anuluje oczekującą wiadomość. Nie można odwołać wiadomości już przekazanej dostawcy.
- E-mail zawiera ogólną kategorię i link do centrum wymagającego logowania. Nie zawiera nazwy klienta, opisu sprawy, cen ani prywatnych notatek.
- Historia jest własna i stronicowana. Po utracie dostępu do źródła jego metadane również znikają z widoku. Prywatne tabele nie są dostępne klientowi API.
- Stany obejmują oczekiwanie, wysyłanie, ponowienie, przyjęcie przez dostawcę, dostarczenie, odbicie, błąd, anulowanie, niepewny wynik i lokalną skrzynkę testową. Przyjęcie nie jest potwierdzeniem dostarczenia; dostarczenie nie jest potwierdzeniem przeczytania ani wykonania zadania.

## Konfiguracja i uruchomienie

Domyślny `NOTIFICATION_MAIL_MODE=disabled`. Bez kompletu konfiguracji endpoint nie uruchamia kolejki. `.env.local` nie został zmieniony podczas wdrożenia. Dostępne adaptery: lokalny Mailpit albo Resend przez HTTPS. Zaproszenia i poczta logowania Supabase Auth mają odrębną konfigurację.

Zmienne opisuje `.env.example`:

| Zmienna | Znaczenie |
| --- | --- |
| `NOTIFICATION_MAIL_MODE` | `disabled`, `local` lub `resend` |
| `NOTIFICATION_MAIL_FROM` | Pojedynczy adres nadawcy; w Resend musi być uprzednio skonfigurowany |
| `NOTIFICATION_MAIL_RECIPIENTS` | Jawna lista 1–100 adresów pilotażowych, rozdzielona przecinkami; bez wildcardów |
| `APP_URL` | Kanoniczny adres aplikacji, HTTPS dla Resend; lokalnie loopback |
| `SUPABASE_SERVICE_ROLE_KEY` | Wyłącznie serwerowy klucz odpowiedniego środowiska; nigdy `NEXT_PUBLIC_*` |
| `NOTIFICATION_WORKER_SECRET` | Osobny losowy sekret co najmniej 32 znaków, wyłącznie na serwerze |
| `RESEND_API_KEY` | Serwerowy klucz dostawcy, wymagany w trybie `resend` |

Po skonfigurowaniu i uruchomieniu aplikacji:

```sh
npm run notifications:worker
# Pojedynczy kontrolowany cykl:
npm run notifications:worker -- --once
```

Skrypt wymaga Node obsługującego `--env-file`. Wczytuje `.env.local`, wykonuje pierwszy cykl od razu, następne co minutę i nie nakłada własnych cykli. Wywołuje `POST /api/internal/email/dispatch` z nagłówkiem Bearer. Samo uruchomienie aplikacji nie uruchamia workera. Na hostingu trzeba jawnie wdrożyć proces stale działający lub harmonogram wywołujący ten endpoint. Nie utworzono zadania systemowego ani harmonogramu hostingu. Nie należy umieszczać sekretu w URL.

Cykl skanuje do 20 kont, przetwarza do 5 wysyłek i do 5 kontroli dostarczenia. To ograniczony pilotaż, nie rozwiązanie do masowego mailingu. Dane wysyłek obejmują adres i zamrożoną treść; dostęp administracyjny do bazy nadal wymaga ochrony. Retencja historii i monitorowanie procesu pozostają częścią przygotowania produkcji.

## Ponowienia i dostarczenie

Blokada pojedynczej próby trwa 2 minuty. Kolejne próby korzystają z tego samego identyfikatora i identycznej zamrożonej treści, nadawcy oraz URL. Dla Resend używany jest klucz `hvac-notification/{UUID}`. Odstępy po błędach: 30 s, 2 min, 10 min, 30 min; faktyczny czas zależy też od cyklu workera. Limit 5 prób i 20 godzin od pierwszej próby prowadzi do stanu wymagającego sprawdzenia zamiast automatycznej ponownej wysyłki. Uwzględnia to [24-godzinne okno idempotencji Resend](https://resend.com/blog/engineering-idempotency-keys).

429 i przejściowe błędy Resend są ponawiane; trwałe odrzucenie kończy wysyłkę. Niepewna lokalna próba nie jest automatycznie powtarzana. Nie ma przycisku wymuszającego ponowną wysyłkę niepewnego wyniku. Administrator powinien najpierw sprawdzić stan u dostawcy. Przed zmianą konta dostawcy lub konfiguracji nadawcy należy zatrzymać worker i rozliczyć trwające próby; nie zakładamy idempotencji pomiędzy różnymi kontami dostawcy.

Po przyjęciu wiadomości worker odpytuje [API odczytu Resend](https://resend.com/docs/api-reference/emails/retrieve-email) co najmniej co 2 minuty przez maksymalnie 24 godziny. Sprawdza identyfikator oraz odbiorcę przed zapisaniem wyniku. Brak potwierdzenia pozostawia stan „Przyjęto do wysyłki”, bez ponownego wysłania. Potwierdzenie dostarczenia oznacza przyjęcie przez serwer odbiorcy. Nie wdrożono webhooków ani pomiaru otwarć.

## Weryfikacja lokalna

- 666 testów Vitest i 1218 asercji pgTAP; lint, typy i kompilacja produkcyjna.
- Testy uprawnień, własnych preferencji, konfliktów wersji, niepotwierdzonego adresu, braku dostępu do prywatnej kolejki, deduplikacji, równoległego przejęcia, zmiany adresu, zakończenia sprawy, przeczytania, wyłączenia i cofnięcia dostępu.
- Transport: stabilny klucz i treść, utracona odpowiedź, 429/409/5xx, trwałe odrzucenie, odróżnienie przyjęcia od dostarczenia i weryfikacja odbiorcy.
- Rzeczywista próba przez uruchomioną aplikację, runner i lokalny [Mailpit](https://mailpit.axllent.org/docs/usage/sending-messages/): jedna wiadomość na fikcyjne zadanie do `admin@hvac.local`; bez prywatnej treści. Kolejny cykl nie tworzy duplikatu.
- Interfejs w jasnym/ciemnym motywie i przy szerokości 390 px. Zrzuty w `output/qa/notification-email-*.png`, przykładowy HTML w `output/qa/notification-email-example.html`.

Nie wysyłano wiadomości poza komputer. Testowe rekordy i wiadomość usunięto po próbie, oryginalne preferencje przywrócono; audytu źródeł nie kasowano. Klucze tymczasowej konfiguracji nie trafiają do dokumentacji ani logów. Standardowo aplikacja wraca do trybu wyłączonego.

Następny krok: test pełnego procesu i przygotowanie pilotażu; przed rzeczywistymi e-mailami skonfigurować zweryfikowanego nadawcę, dostawcę, odbiorców pilotażowych i działający harmonogram. Lokalny test nie potwierdza dostarczalności przez Resend ani gotowości produkcyjnej.
