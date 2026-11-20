# Warianty oferty z szablonów

KRA-18, wdrożenie lokalne 1.11.2026. Kreator ofert tworzy od jednego do pięciu wariantów na podstawie zestawów z biblioteki. Działa również dotychczasowe tworzenie bez szablonu i z pojedynczym zestawem.

## Przepływ

1. Wybierz klienta, nazwę oferty i rodzaj prac.
2. W kroku 3 wybierz pierwszy szablon i uzupełnij wymagane parametry instalacji.
3. **Dodaj wariant z szablonu** dołącza niezależną alternatywę. Można dodać do czterech dodatkowych wariantów.
4. Nadaj wariantom różne nazwy (do 80 znaków) i zaznacz jeden **Wariant główny**. Nazwy są porównywane bez rozróżnienia wielkości liter i skrajnych spacji.
5. Sprawdź porównanie: koszt własny, cena netto, brutto, różnica netto i marża. Utwórz kalkulację jednym zapisem.

Wspólne parametry oznaczają te same wymiary instalacji dla wszystkich zestawów. Każdy szablon zachowuje własne mnożniki i stałe ilości; dodatkowy zestaw może wprowadzić kolejne wymagane pole. Usunięcie zestawu usuwa zapotrzebowanie na jego parametry. Ukryte parametry nie blokują pozostałych wariantów.

Szczegóły dodatkowych wariantów są rozwijane i pokazują wyliczone ilości, nie same współczynniki. Usunięcie dodatkowego wariantu głównego przełącza rekomendację na pierwszy wariant. Pierwszy wariant stanowi bazę — można zmienić jego szablon; przycisk **Zacznij bez szablonu** usuwa wszystkie wybory zestawów i wraca do ręcznej kalkulacji. Wybór innego pierwszego zestawu czyści parametry, dodanie alternatywy zachowuje już wpisane wartości.

## Porównanie i bezpieczeństwo zapisu

Koszty i marża są wyłącznie wewnętrzne dla biura/administratora. Marża = (cena netto − koszt) / cena netto. Przy cenie netto równej zero pokazujemy „—”; wynik poniżej kosztu jest oznaczony. Warianty są alternatywami — cen nie sumujemy między wariantami. Wyliczenia stosują istniejący algorytm cen/VAT i tysięcznych ilości.

Przed zapisem ponownie pobieramy wszystkie wybrane szablony. Błąd odczytu dowolnego zestawu wstrzymuje zapis. Zmiana wersji lub cen odświeża całe porównanie, zachowując nazwy, wybór główny i parametry, i wymaga ponownego sprawdzenia przed kolejnym kliknięciem. Szablon archiwalny lub wycofana pozycja blokuje utworzenie oferty. Brak wymaganych parametrów, powtórzone/puste nazwy i przekroczenie pięciu wariantów również blokują tworzenie.

Każdy wariant i każda pozycja otrzymują osobne identyfikatory. Kopie nie współdzielą obiektów, nawet gdy korzystają z tego samego katalogu/szablonu. Identyfikatory zachowują się przy ponowieniu żądania; usunięcie jednej alternatywy nie zmienia pozostałych. Oferta przechowuje własne pozycje/ceny i rekomendację — późniejsze zmiany biblioteki ich nie nadpisują. Nazwy i pozycje można dalej dopracować w istniejącym edytorze.

## API i dane

Bez nowej migracji lub uprawnień: istniejący POST `/api/v1/offers` zapisuje `variants` i `mainVariantId` atomowo, waliduje limit 1–5 i oblicza wartości każdego wariantu po stronie bazy. Ścisłe wspólne kontrakty i role pozostają zachowane. Klient publiczny/PDF korzysta z istniejącej projekcji bez kosztów i wewnętrznych notatek.

Nowe helpery wspólnego pakietu: `templateVariantSelections` i `templateOfferVariants`. Wybór ma `{key,name,detail}`, parametry są wspólne, a fabryka tożsamości otrzymuje klucz wariantu lub wiersza. Helper sprawdza liczbę/nazwy/klucze, aktywność i kompletność zestawów, ilości oraz brak kolizji identyfikatorów. Picker przyjmuje własną etykietę przycisku, aby odróżnić zmianę pierwszego zestawu od dodania alternatywy.

## Sprawdzenie

548 testów aplikacji, 1035 testów bazy, typy, lint i kompilacja produkcyjna poprawne. Nowe zestawy: 13 testów helpera, 2 testy API oraz 17 asercji SQL. Obejmują niezależne kopie/ilości/ceny, identyfikatory i powtórzenia, 1–5 wariantów, błędne nazwy/klucze, główny wariant, nieaktywne zestawy, prywatność podglądu klienta, atomowość błędnego drugiego wariantu oraz role.

Zapis wariantu jako nowego szablonu został wdrożony: [OFFER_VARIANT_TO_TEMPLATE.md](OFFER_VARIANT_TO_TEMPLATE.md).

W przeglądarce sprawdzono dodanie alternatywy, edycję nazw, wybór głównego wariantu i jego usunięcie z automatycznym powrotem do pierwszego. Powtórzona nazwa blokowała utworzenie. Rozwijane pozycje drugiego wariantu pokazywały wyliczone 10 m wobec 8 m pierwszego. Zmiana współczynnika wyłącznie dodatkowego szablonu została wykryta przed zapisem; odświeżenie zachowało parametry, nazwy i rekomendację. Zapisane warianty miały osobne UUID, ilości 8 m i 10,4 m oraz netto 2086,87 zł i 2303,63 zł, a drugi był główny.

Oba motywy przy 1440×1000 i układ 390×844 bez poziomego przewijania całej strony. Szerokie porównanie mieści się w osobnym przewijanym obszarze tabeli na telefonie. Wybór rekomendacji ma kompaktowy układ obok nazwy na szerokim ekranie i pod nazwą na telefonie. Podglądy: `output/qa/template-variants-light.png`, `template-variants-dark.png`, `template-variants-mobile.png`, `template-variants-saved.png`.

Kontrolę prowadzono w osobnej karcie, wyłącznie na tymczasowych szablonach, produktach, kliencie i ofercie. Wszystkie dane demonstracyjne usunięto (0/0/0/0), audyt i numerację pozostawiono; rzeczywistych danych i kont/uprawnień nie zmieniano. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki. Aplikacja działa lokalnie na 127.0.0.1:3100.
