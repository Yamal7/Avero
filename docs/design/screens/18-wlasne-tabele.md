# Warstwa elastyczna — własne tabele

Makiety: ekrany `przetargi`, `tabela pola`, `tabela panel` w `Main.dc.html` (jasne i ciemne). Scenariusz: piątek 20 lis 2026, 18:00; tabelę „Przetargi” utworzył Pascal (administrator). Całość **nowa** — bez backendu. Decyzje: `DECISIONS.md` („Kierunek produktu”, „Warstwa elastyczna: własne tabele”).

## Pasek boczny
- Grupa „Własne tabele” pod Projektami: każda tabela z ikoną i licznikiem rekordów w domyślnym widoku; „+ Nowa tabela” (tylko administrator).

## Lista rekordów (przykład: Przetargi)
- Nagłówek: ikona i nazwa tabeli + kapsułka „własna tabela” (autor, liczba pól i dostęp w podpowiedzi); zapisane widoki jako kapsułki z licznikami; „+ Widok” zapisuje bieżące filtry; rodzaj widoku Tabela / Kanban / Kalendarz; „Ustawienia tabeli”; „Nowy przetarg” (C — nazwa przycisku z nazwy rekordu w tabeli).
- Filtry po dowolnym polu (F). Podsumowania z pól po prawej (suma kwoty, skuteczność liczona z etapów pola Status).
- Kolumny = pola tabeli w kolejności z ustawień widoku. Pole „Wybór · etapy” jako kropka + tekst; daty z formułą „Dni do terminu” (ostrzeżenie ≤ 7 dni); powiązanie z Firmami jako druga linia.
- Rekordy zakończone (etapy zamykające) w osobnej grupie lub poza widokiem „W toku”.

## Panel boczny (360 px)
- Składa się z sekcji z ustawień „Panel boczny”: nagłówek (nazwa, status, opiekun), sekcje pól, karta powiązanego rekordu rdzenia (Zamawiający → Firmy), pliki, przycisk akcji, historia.
- Ikona „Dostosuj panel” w nagłówku panelu (administrator) prowadzi do edytora.
- Akcja „Utwórz szansę z przetargu” (akcent, ⌘↵) z krótkim opisem, co zostanie przeniesione.

## Ustawienia tabeli — wspólny nagłówek
- Okruszki: nazwa tabeli › Ustawienia tabeli; zakładki Pola, Widoki, Panel boczny, Akcje, Uprawnienia (z licznikami). Informacja: „Zmiany widzą wszyscy z dostępem do tabeli”.

## Pola
- Lista pól: uchwyt przeciągania, ikona typu, nazwa, typ (z detalem: „Powiązanie → Firmy”, „Kwota · PLN netto”), kapsułki „wymagane” / „unikalne”, kłódka przy polach systemowych (numer automatyczny).
- „Dodaj pole” (N). Panel pola: nazwa, typ (zablokowany po zapisaniu danych — podpowiedź), opcje (przeciągane, kolor z palety, „zamyka” dla etapów końcowych), zachowanie (wymagane, domyślna, kanban grupuje po tym polu, pytanie o powód przy wybranym etapie), paleta typów do dodania.

## Panel boczny — edytor
- „Układ dla”: Wszyscy + układy dla zespołów. Rekord podglądu do wyboru.
- Karty sekcji: uchwyt, nazwa, rodzaj (pola / karta powiązanego rekordu / pliki / przycisk / system), pola jako kapsułki („+ pole”), warunek widoczności (oko + zdanie), ukryj, więcej. Sekcje systemowe z kłódką.
- „Dodaj sekcję”: pola, karta powiązania, lista powiązanych, przycisk akcji, podsumowanie.
- Podgląd na żywo po prawej, na prawdziwym rekordzie; zaznaczona sekcja obrysowana akcentem; sekcje z niespełnionym warunkiem ukryte jak u użytkownika.
- „Przywróć domyślny” i „Zapisz układ” (akcent, ⌘S).

## Nowa tabela (ekran `tabela nowa`)
- Okruszki Własne tabele › Nowa tabela; „Pola, widoki i panel zmienisz później”; Esc anuluje.
- „Zacznij od”: karty szablonów (Pusta, Reklamacje do producentów, Przetargi, Rejestr floty, Szkolenia i uprawnienia, Rekrutacja) z liczbą pól. Zaznaczona karta obrysowana akcentem.
- **Ochrona przed dublowaniem rdzenia**: szablon, który pokrywa się z modułem rdzenia lub pakietu, ma ostrzeżenie (np. Rejestr floty → „jest w Ustawieniach”, bo busy są w Technicy i busy; Szkolenia → „częściowo w rdzeniu”, certyfikaty F-gaz i SEP). Istniejąca tabela — „już masz”.
- Tabela: nazwa, nazwa rekordu (do przycisku „Nowa …”), prefiks numeru, ikona (zestaw Phosphor), dostęp na start (administrator, biuro; technicy wyłączeni).
- Panel: pola szablonu z typami, etapy statusu, „W zestawie” (akcje, przypomnienia). Szablon „Reklamacje do producentów” powiązany z Urządzeniami, Zgłoszeniami i Katalogiem.
- „Utwórz tabelę” (akcent, ⌘↵) dodaje tabelę do paska bocznego.

## Akcje (ekran `tabela akcje`)
- Lista akcji z przełącznikiem włączenia: przycisk w panelu albo automat (zmiana pola, termin daty). Przykłady: Utwórz szansę z przetargu; Przypomnij o terminie (3 i 1 dzień przed, e-mail i w aplikacji); Wygrany → zadanie „Przygotuj umowę”.
- Edytor akcji: „Kiedy” jako zdanie z kapsułek (pole, wartość, warunki), „Co przenieść” — mapowanie pól (źródło → cel, wymagane w celu, sposób: skopiuj, to samo powiązanie, data + N dni, stała wartość), „Potem” (powiązanie obu rekordów, historia, otwórz cel).
- Zasady bezpieczeństwa (notatka): akcja działa z uprawnieniami klikającego; akcje nie usuwają danych ani nie wysyłają wiadomości do klientów bez potwierdzenia.
- „Wypróbuj na PR-013” (podgląd bez zapisu), „Zapisz akcję” (akcent, ⌘S).

## Uprawnienia (ekran `tabela uprawnienia`)
- Macierz ról × Widzi / Dodaje / Edytuje / Archiwizuje / Ustawienia. Administrator zablokowany (pełne prawa); technicy „swoje” — tylko rekordy, w których są opiekunem; klient (portal) zawsze bez dostępu.
- Wyjątki dla pól per rola: ukryte / tylko odczyt / edytuje, oraz eksport i API (np. „Nasza cena” — ukryta dla techników, w eksporcie tylko administrator).
- Notatka: uprawnienia sprawdza serwer — ukryte pole nie trafia do przeglądarki, eksportu, aplikacji technika, API ani akcji.
- „Podgląd jako technik”, „Zapisz uprawnienia” (akcent).
- Ekrany ustawień tabeli są tylko dla administratora (rama pokazuje Pascala).

## Do zaprojektowania później
Zakładka Widoki (kolumny, sortowanie, grupowanie, widok kalendarza), import CSV do własnej tabeli, raport z własnej tabeli, dokładanie sekcji własnych pól do modułów rdzenia (np. pola firmy w panelu Zgłoszenia).
