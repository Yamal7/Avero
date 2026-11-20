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

## Do zaprojektowania później
Kreator nowej tabeli (nazwa, ikona, szablony startowe: Przetargi, Rejestr floty, Rekrutacja), zakładki Widoki, Akcje (mapowanie pól, warunki) i Uprawnienia, import CSV do własnej tabeli, raport z własnej tabeli.
