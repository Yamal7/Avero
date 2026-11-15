# Ilości według parametrów instalacji

KRA-17, wdrożenie lokalne 1.11.2026. W edytorze szablonu przy każdym wierszu znajduje się **Sposób liczenia**:

- **Stała ilość** — dotychczasowe działanie;
- **Długość instalacji (m)** — ilość na 1 m;
- **Powierzchnia (m²)** — ilość na 1 m²;
- **Czas pracy (godz.)** — ilość na 1 godzinę;
- **Dojazd łącznie (km)** — ilość na 1 km.

Jednostka wynikowej pozycji nadal pochodzi z katalogu. Dlatego np. rura liczona w metrach może mieć regułę 6,5 m na 1 m² powierzchni. Nie narzucamy automatycznie reguł według kategorii produktu. Zmian dokonuje biuro/admin; dotychczasowe role, wersje, archiwum i kontrola aktywności katalogu pozostają bez zmian.

## Kreator i kalkulacja

Po wybraniu szablonu krok 3 pokazuje tylko używane parametry. Dodatnie wartości można podać z kropką lub przecinkiem, maksymalnie 3 miejsca po przecinku. Podgląd aktualizuje ilości, opis reguły i sumę netto. Puste/zerowe wymagane parametry, błędny format i zbyt duży/za mały wynik blokują **Utwórz kalkulację**. Nie pomijamy po cichu wierszy z zerową ilością.

Przykłady:

- 1,25 m materiału na metr × 8 m instalacji = 10 m materiału;
- 6,5 m rury na m² × 40 m² = 260 m rury;
- 1 godz. robocizny na godzinę × 6 godz. = 6 godz.;
- 1 km na kilometr × 30 km = 30 km dojazdu.

Wyliczenie opiera się na całkowitych tysięcznych: `round(coefficientMills × parameterMills / 1000)`. Zaokrąglenie do 0,001 jednostki, połówki w górę, bez błędów mnożenia liczb zmiennoprzecinkowych. Parametr 0–10 000; wymagany parametr >0. Mnożnik i końcowa ilość 0,001–10 000. Brak dowolnych wyrażeń, skryptów lub eval. Przy wyniku zaokrąglonym do zera albo przekroczeniu limitu należy zmienić parametr/mnożnik.

Przed utworzeniem oferty nadal sprawdzamy bieżącą wersję szablonu i katalog. Jeśli zmieniono regułę, ilość lub ceny, odświeżamy zestaw z zachowaniem wpisanych parametrów i prosimy o ponowne sprawdzenie. Zmiana wybranego zestawu czyści parametry, aby ukryte wartości z poprzedniej kalkulacji nie blokowały pracy.

Do nowej oferty kopiujemy wyliczone ilości jako niezależne pozycje. Zapisane wcześniej oferty, PDF i publikacje nie przeliczają się po zmianie parametrów szablonu lub katalogu. Parametry długości/godzin/km oraz opcjonalna powierzchnia są zapisane w danych technicznych oferty. Edytor istniejącej kalkulacji nadal pozwala ręcznie zmieniać jej pozycje; nie dodano automatycznego przeliczania już zapisanych wariantów.

## Zgodność i API

Wiersz szablonu ma opcjonalne `quantitySource`: `fixed | length | area | labor | travel`. Brak pola oznacza **stałą ilość**, bez przepisywania historycznych rekordów. `quantityMills` przy regule parametrycznej oznacza współczynnik na jedną jednostkę parametru. Odpowiedź szczegółów nadal zwraca ten współczynnik; końcowe ilości wylicza wspólny helper używany przez kreator i dostępny dla przyszłych klientów mobilnych/komputerowych.

Wspólny pakiet zawiera `templateQuantitySourceSchema`, `templateParametersSchema`, `templateRequiredParameters`, `templateLineQuantity` i rozszerzony `templateOfferLines(detail, newId, parameters?)`. Parametry to `{lengthMills,areaMills,laborMills,travelMills}`. Kontrakt `offerTechnicalSchema` przyjmuje opcjonalne `areaMills`; stare oferty bez powierzchni pozostają poprawne. Zapis oferty nadal waliduje skończone, edytowalne pozycje kalkulacji i liczy ceny po stronie bazy, a nie traktuje reguł szablonu jako ograniczenia ręcznej edycji.

Migracja `202611010005_template_parameters.sql` rozszerza wyłącznie walidację źródła ilości w `save_installation_template` i opcjonalnej powierzchni w `save_offer`. Nie zmienia danych ani uprawnień i jest zastosowana oraz zarejestrowana lokalnie.

## Sprawdzenie

533 testy aplikacji i 1018 testów bazy, typy, lint oraz kompilacja produkcyjna zakończone powodzeniem. Nowe: 25 testów kontraktów/wyliczeń/API i 26 asercji SQL. Testy obejmują wszystkie źródła, zgodność starych zestawów/ofert, precyzję i granice zaokrągleń, brakujące/błędne parametry, odrzucanie wyrażeń, wersje/ponowienia i role. Testy listy z poprzedniego etapu odizolowano przez własny prefiks, aby nie zakładały pustej bazy i nie kolidowały z szablonami użytkownika.

UI: zapis mnożnika 1,25 w edytorze, wymagane pola, obliczenie 10 m i 260 m, blokada wyniku ponad limit, zapis oferty z powierzchnią 40 m². Po zmianie mnożnika z 6,5 na 7 oferta nadal miała 260 m, zgodnie ze snapshotem. Ciemny kreator, jasny/ciemny edytor, ekran 1440×1000 oraz 390×844 bez poziomego przewijania. Podglądy w `output/qa/template-parameters-dark.png`, `template-parameters-mobile.png`, `template-parameters-offer.png`, `template-rules-editor.png`, `template-rules-light.png`, `template-rules-mobile.png`.

Testowano wyłącznie własne tymczasowe produkty, szablon, klienta i ofertę. Dane usunięto (0/0/0/0); audyt i sekwencje zachowano. Nie zmieniano rzeczywistych szablonów, katalogu, ofert, kont lub uprawnień. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki. Istniejąca karta użytkownika pozostała nienaruszona; kontrolę prowadzono w osobnej karcie. Aplikacja działa na 127.0.0.1:3100.

Warianty z różnych szablonów oraz porównanie przed zapisem wdrożono w KRA-18: [OFFER_TEMPLATE_VARIANTS.md](OFFER_TEMPLATE_VARIANTS.md).
