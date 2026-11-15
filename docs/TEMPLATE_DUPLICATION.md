# Powielanie szablonów instalacji — 3.11.2026

KRA-20. Biuro i administrator mają przycisk **Powiel szablon** na karcie zestawu w bibliotece oraz w edytorze zapisanej wersji. Niezapisane zmiany blokują powielanie z edytora; trzeba je najpierw zapisać. Nowe szablony bez zapisu nie mają tej akcji.

Okno pobiera świeży podgląd źródła. Użytkownik nadaje nazwę kopii (domyślnie nazwa źródła z dopiskiem „— kopia”), widzi wszystkie pozycje, ilości i sposoby liczenia. Kopiowany jest opis, rodzaj prac, odwołania katalogowe, ilości i reguły fixed/length/area/labor/travel. Brak reguły zachowuje starszy sposób liczenia jako stała ilość. Każdy wiersz i nowy szablon otrzymują niezależny UUID, także przy powtarzających się produktach.

Kopia jest aktywna, również gdy źródło jest archiwalne. Wszystkie produkty muszą być aktywne; wycofane/niedostępne pozycje blokują cały zapis i są wskazane w oknie. Żadna pozycja nie jest automatycznie pomijana. Najpierw trzeba poprawić źródło. Ceny pozostają bieżącymi cenami katalogu; szablony nie utrwalają własnych historycznych cen. Oryginał oraz wcześniejsze oferty pozostają bez zmian.

Zmiana wersji źródła w innej sesji zatrzymuje zapis. **Wczytaj aktualny szablon** zachowuje wpisaną nazwę kopii i aktualizuje podgląd. Po sukcesie link **Otwórz kopię** prowadzi do jej edycji. Przy niepotwierdzonej odpowiedzi formularz zachowuje tożsamość i treść żądania, blokuje zmianę nazwy i umożliwia ponowienie potwierdzenia zamiast tworzenia kolejnej kopii. Zamknięcie i ponowne otwarcie tego samego okna w zamontowanym widoku zachowuje oczekującą próbę; odświeżenie strony nie zapewnia trwałej kolejki offline.

## API i baza

POST `/api/v1/templates/{id}/duplicate` przyjmuje wyłącznie `{id,sourceVersion,name}`; id oznacza nowy szablon, id w ścieżce źródło. Wspólny kontrakt `installationTemplateDuplicateSchema` oraz klient `duplicateInstallationTemplate` wspierają przyszłe platformy. Odpowiedź 201 zawiera zapisany szablon; 409 oznacza konflikt, 400 nieprawidłową nazwę/katalog. Sprawdzane są role i tożsamość odpowiedzi, nie ma parametrów cen/ilości do podmiany przez klienta.

Migracja `202611030001_template_duplicates.sql` dodaje `duplicate_installation_template` i prywatny rejestr `installation_template_copies`. Funkcja ponownie sprawdza uprawnienia, wersję źródła oraz aktywność produktów; blokuje wiersze katalogu do zakończenia transakcji. Kopia i wpis rejestru powstają atomowo. Identyczne ponowienie tego samego autora/źródła/żądania zwraca wcześniej utworzony szablon, także po późniejszej edycji źródła lub kopii. Zmieniona treść albo inny autor nie przejmują tożsamości żądania. Rejestr nie jest bezpośrednio dostępny dla użytkowników. Istniejące role i uprawnienia nie zostały rozszerzone.

## Sprawdzenie

590 testów aplikacji (56 plików), 1103 asercje bazy (28 plików), lint i kompilacja produkcyjna z kontrolą typów przeszły. Nowe zestawy: 20 testów kontraktu/klienta/API oraz 35 asercji SQL. Sprawdzono wszystkie reguły, kopie identyfikatorów, niezależność zmian, role, blokadę konta, archiwalne źródło, nieaktywne produkty, wersje i ponowienia. Test 027 mierzy przyrost audytu źródła względem wcześniejszej historii, aby zachowany audyt demonstracyjny nie powodował fałszywej porażki; nowe dane testu 028 mają osobny zakres identyfikatorów.

Przeglądarka: kopiowanie z biblioteki i podgląd z edytora, zachowanie nazwy po konflikcie, odświeżenie współczynnika 1,25 → 1,5, utworzenie i otwarcie kopii na telefonie, blokada przy niezapisanej zmianie, zapis kopii z mnożnikiem 1,75 przy zachowaniu 1,5 w źródle. Baza potwierdziła jeden wpis rejestru i brak wspólnych UUID pozycji. Sprawdzono blokadę archiwalnego zestawu z dwoma wycofanymi wierszami. Oba motywy oraz 390×844: strona 390/390 px, okno 354/354 px, bez przewijania poziomego.

Podglądy: `output/qa/template-copy-dark.png`, `template-copy-light.png`, `template-copy-mobile.png`, `template-copy-success.png`, `template-copy-unavailable.png`. Wyłącznie dane demonstracyjne w osobnej karcie; po kontroli usunięto własne źródła, kopię, rejestr i produkty. Audyt zachowano, rzeczywisty szablon użytkownika oraz konta/uprawnienia pozostały bez zmian. Ciemny motyw i domyślny rozmiar przeglądarki przywrócone. Migracja zastosowana i zarejestrowana lokalnie, aplikacja działa na 127.0.0.1:3100.

Kolejny krok zgodnie z planem: profil firmy, własne logo i domyślne warunki nowych dokumentów z zachowaniem historycznych wersji. Dodatkowe pomysły pozostają na później.
