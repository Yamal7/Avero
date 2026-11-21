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

## Widoki (ekran `tabela widoki`)
- Lista widoków (272 px): **Wspólne** (widzi każdy z dostępem; kolejność = kolejność kapsułek nad listą rekordów) i **Osobiste** (tylko autor). Każdy: ikona rodzaju, nazwa, opis (rodzaj, sortowanie lub „domyślny”), liczba rekordów. „Nowy widok” (⇧N) z obecnych ustawień.
- Zasada pod listą: widok zapisuje filtry, kolumny, sortowanie i grupowanie — nie zmienia danych ani uprawnień.
- Edytor: nazwa; rodzaj Tabela / Kanban / Kalendarz (Kanban grupuje po polu Wybór, Kalendarz po polu daty); kto widzi (Wszyscy z dostępem / Tylko ja — osobisty widok może utworzyć każdy, wspólny tylko administrator).
- Filtry jako zdanie z kapsułek („Gdzie Status jest jednym z … i Termin składania ofert jest w ciągu 14 dni od dziś”); daty względne aktualizują się codziennie.
- Sortowanie (do 3 poziomów), grupowanie (pole Wybór, Osoba, Powiązanie), podsumowania pod tabelą (suma, średnia, liczba).
- Kolumny: widoczne z uchwytem i szerokością, druga linia komórki z innego pola („+ Zamawiający pod spodem”), ukryte przygaszone z okiem. Pole ukryte uprawnieniami ma kapsułkę z kłódką („technicy nie widzą”).
- Podgląd na żywo (320 px): rekordy z dziś, podsumowanie, co wypada z widoku i dlaczego, oraz zdanie „jak to zobaczy technik”.
- „Usuń widok…” (tylko ustawienia, z potwierdzeniem), „Zapisz jako nowy”, „Zapisz widok” (akcent, ⌘S).

## Import z pliku (ekran `tabela import`)
- Wejście: lista tabeli › Więcej › Importuj z pliku (⇧I), XLSX lub CSV. Tylko administrator (zakłada pola i firmy).
- Okruszki tabela › Import z pliku; „Nic nie zapisze się przed zatwierdzeniem · Esc anuluje”.
- Tytuł = nazwa pliku; meta: arkusz, liczba wierszy, kto i kiedy. Kapsułki wyniku: nowe, do uzupełnienia (dopasowane po polu unikalnym), pominięte (brak pola wymaganego), do sprawdzenia.
- Tabela mapowania: kolumna w pliku, przykład z wiersza 2, pole w tabeli (z typem), stan. Dopasowanie wartości do opcji pól Wybór (np. „wygrany” → Wygrany), separator wielokrotnego wyboru, inicjały → osoby, liczby z przecinkiem. Kolumna bez pola: „nowe pole” albo „Pomiń”.
- Panel: zamawiający bez rekordu w Firmach (utwórz firmy z etykietą „z importu” / zostaw puste), istniejące rekordy (uzupełnij tylko puste / nadpisz — każda zmiana w historii), podsumowanie po zatwierdzeniu, „Importuj N wierszy” (akcent, ⌘↵), „Pobierz pominięte wiersze” (CSV).
- Bezpieczeństwo: import nie uruchamia akcji tabeli i nie wysyła wiadomości; można go cofnąć przez 7 dni (nowe rekordy do archiwum, uzupełnione pola wracają).

## Raport z własnej tabeli (ekran `raport tabela`)
- W module Raporty jako kolejna zakładka z ikoną tabeli („Przetargi”); „+ Raport” tworzy raport z modułu albo z własnej tabeli.
- Nad wykresami: źródło (kapsułka „z własnej tabeli Przetargi”, widok i liczba rekordów w podpowiedzi), autor i kto widzi; jedno zdanie podsumowania z liczbami zamiast rzędu kafelków.
- Wykresy jako karty `--bg-raised` z „Pokaż tabelę”: słupki skumulowane wg kwartału (wygrane kolorem serii, reszta neutralna, etykieta „wygrane/złożone” nad słupkiem, legenda), poziome słupki skuteczności wg pola Wybór, poziome słupki powodów (pole „Powód” przy etapie zamykającym) z jednym zdaniem wniosku.
- Panel wykresu (320 px): dane (tabela i widok, miara: liczba / suma / średnia pola liczbowego, warunki, oś daty z grupowaniem, podział — najwyżej 4 grupy), wygląd (Słupki / Skumulowane / Linia / Tabela; kolory nadaje Avero w stałej kolejności), kto widzi. „+ Wykres” (N), „Zapisz raport” (⌘S). Zaznaczony wykres obwiedziony akcentem.
- Raport działa z uprawnieniami oglądającego: wykres oparty na polu ukrytym dla roli nie pokazuje się tej roli.

## Pola własne w modułach rdzenia
Opis w `13-ustawienia.md` (Ustawienia › Pola własne).
