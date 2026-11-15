# Jasny i ciemny motyw programu

Wdrożenie: 26.10.2026, na podstawie dwóch wizualizacji użytkownika.

## Korzystanie

W panelu firmy kapsułkowy przełącznik motywu znajduje się na dole bocznego menu, nad Ustawieniami i profilem. Kółko przesuwa się między jasnym a ciemnym wariantem. Przełącznik jest również dostępny w Ustawieniach i portalu klienta. Na stronach logowania pozostają podpisane przyciski motywów.

Domyślny motyw to jasny. Wybór zapamiętywany jest w przeglądarce dla adresu aplikacji (`hvac-theme`) i przywracany przed wyświetleniem strony. Zmiana synchronizuje się między otwartymi kartami tego samego adresu, także między panelem firmy i portalem. W razie blokady zapisu w przeglądarce przełącznik nadal zmienia bieżący widok, ale wybór może nie przetrwać ponownego otwarcia.

Preferencja nie jest przypisana do konta i nie synchronizuje się automatycznie między różnymi urządzeniami ani adresami localhost/127.0.0.1. Nie dodano trybu automatycznego według systemu.

## Wdrożony wygląd

- Spójne kolory tekstu, powierzchni, formularzy, tabel, przycisków i statusów w obu wariantach.
- Spokojniejsze jednolite powierzchnie i subtelne obramowania; pomarańczowy akcent do głównych działań i aktywnej nawigacji.
- Czytelne, stale rozwinięte menu na komputerze z sekcjami Firma / Portal klienta. Samo logo bez nazwy; obok po prawej lupa i dzwonek. Bez górnego paska. Na dole kolejno kapsułka motywu, Ustawienia oraz avatar i nazwa użytkownika, bez separatora i widocznego przycisku wylogowania.
- Na telefonie menu otwierane osobnym przyciskiem, z tłem zasłaniającym treść. Escape zamyka menu i przywraca fokus przycisku; otwarta nawigacja wyłącza interakcje z zasłoniętą treścią.
- Tabele przewijają się we własnym obszarze zamiast poszerzać całą stronę.
- Wydruki protokołów mają wymuszony jasny wygląd, niezależnie od wybranego motywu aplikacji.

Paleta jest zdefiniowana przez wspólne zmienne CSS. Stany nie opierają się wyłącznie na kolorze: zachowano teksty statusów, nazwy i informacje o działaniach. Akcent i główne przyciski używają nasyconego pomarańczowego `#FD4B01`, pobranego z jasnej wizualizacji użytkownika. Poprzedni odcień zastąpiono w obu motywach. Nie wykonano pełnego audytu dostępności.

## Pulpit Przegląd

Pulpit przyjmuje układ nowych projektów i pokazuje dane istniejących modułów:

- Podsumowanie: aktywni klienci, otwarte zgłoszenia, wizyty dzisiaj i zaległe przeglądy.
- Wymagają uwagi: pilne zgłoszenia, przeglądy po terminie, zgłoszenia bez technika (dla biura/administratora) i nadchodzące przeglądy. Przycisk zgłoszenia otwiera pierwszy rzeczywisty rekord wymagający obsługi. Liczba w nagłówku oznacza grupy spraw; liczniki przy wierszach oznaczają rekordy w danej grupie.
- Plan na dziś: wizyty bieżącego dnia według Europe/Warsaw, z pominięciem anulowanych. Wizyty rozpoczęte poprzedniego dnia i nadal trwające są uwzględniane jako kontynuacja. Zakończone wizyty zachowują oznaczenie stanu.
- Ostatni klienci i plany wymagające uwagi, z odnośnikami do działających modułów.

Link Dzisiaj prowadzi do kalendarza bieżącego tygodnia. Nie udaje wspólnego filtra wszystkich statystyk — liczba klientów jest bieżąca, lista klientów pokazuje ostatnio dodanych, a przeglądy używają opisanego horyzontu 30 dni. Przy braku danych pokazywane są puste stany, bez przykładowych rekordów.

Kreator szkiców ofert jest już dostępny; magazyn i aktywność otwarcia ofert pozostają do wdrożenia. Pulpit nie prezentuje przykładowych liczb z wizualizacji. Projekt można rozwijać o te sekcje wraz z ich wdrożeniem. Zmiana motywów nie wymaga migracji bazy ani instalacji nowych zależności.

## Przyciski bocznego menu

- Lupa otwiera wyszukiwanie klientów, adresów, instalacji i numerów seryjnych przez istniejący moduł klientów. Obsługuje również ⌘K / Ctrl+K.
- Dzwonek otwiera bieżące pilne zgłoszenia i terminy przeglądów w zakresie uprawnień użytkownika. Kropka pojawia się tylko przy rzeczywistych alertach. To panel bieżących spraw, bez historii odczytu i powiadomień push.
- Profil otwiera dane zalogowanego konta. Wylogowanie jest dostępne dopiero wewnątrz tego okna.
- Ustawienia otwierają osobną stronę z motywem i informacjami o koncie. Nazwa pochodzi z metadanych konta, a przy ich braku z części adresu e-mail przed @.

## Weryfikacja

- 179 istniejących testów Vitest; ESLint, TypeScript i kompilacja produkcyjna.
- Sprawdzenie przełączania motywów, wyszukiwania klienta oraz okien powiadomień i profilu.
- Podgląd komputerowy przy 1440 × 1000 i wąski układ przy 390 × 844.
- Zrzuty `theme-light-2026-10-26.png` i `theme-dark-2026-10-26.png` pokazują rzeczywisty lokalny pulpit po korekcie bocznego menu.

Weryfikacja nie wymagała edycji rekordów klientów. Nie wykonano testu na fizycznym telefonie. Docelowe aplikacje instalowane pozostają odrębnymi etapami.

Nowy wspólny wygląd list i planowane pozycje menu opisuje [DATA_LISTS.md](DATA_LISTS.md).
