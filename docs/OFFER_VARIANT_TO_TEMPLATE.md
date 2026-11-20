# Szablon z zapisanego wariantu oferty — 1.11.2026

Administrator i biuro mogą w kalkulacji wybrać **Zapisz wariant jako szablon**. Najpierw trzeba zapisać zmiany oferty. Okno pokazuje nazwę wariantu, wszystkie jego pozycje i zapisane ilości. Nazwa nowego szablonu jest wymagana, opis opcjonalny. Po utworzeniu można otworzyć szablon i dopracować reguły ilości.

Aktywne produkty o zgodnej jednostce są powiązane automatycznie. Pozycje ręczne, wycofane lub ze zmienioną jednostką wymagają jawnego wyboru aktywnego produktu o tej samej jednostce. Żadna pozycja nie jest pomijana; program nie tworzy automatycznie produktów w katalogu. Powtarzające się produkty pozostają osobnymi wierszami. Nazwy i ceny w nowym szablonie pochodzą z wybranych pozycji katalogowych.

Zapisane ilości stają się stałymi. Rabaty, historyczne ceny/koszty, ręczna cena końcowa oraz notatki klienta/wewnętrzne nie trafiają do zestawu. Nazwa domyślna pochodzi z nazwy wariantu, bez danych klienta. Opis jest pusty do samodzielnego uzupełnienia. Oryginalna oferta nie jest zmieniana. Można wykorzystać także zapisany wariant oferty archiwalnej.

## API i kontrola zapisu

GET i POST `/api/v1/offers/{id}/variants/{variantId}/template`, sesja lub Bearer zgodnie z istniejącym API. GET zwraca bezpieczny kontekst i wersję źródła; POST przyjmuje UUID nowego szablonu, oczekiwaną wersję, nazwę/opis oraz powiązania lineId/catalogId. Ilości, rodzaj prac i pozycje są ponownie odczytywane z bazy. Klient nie może ich podmienić w żądaniu. Nowe metody wspólnego klienta: `offerVariantTemplateContext` i `createTemplateFromOfferVariant`.

Migracja `202611010006_offer_variant_templates.sql` dodaje dwie funkcje kontrolujące role i prywatny rejestr ponowień `offer_template_exports`. Wszystkie wybrane produkty są blokowane do końca transakcji i sprawdzane pod kątem aktywności/jednostek. Utworzenie szablonu oraz rejestru jest atomowe; pozycje mają nowe UUID. Identyczne ponowienie tego samego autora zwraca wcześniej utworzony szablon, także po późniejszej zmianie źródła. Użycie tej samej tożsamości dla innych danych jest konfliktem. Rejestr nie jest dostępny bezpośrednio dla użytkowników.

Zmiana wersji źródła blokuje zapis (409). Przycisk **Wczytaj aktualny wariant** zachowuje nazwę/opis, pobiera świeże ilości i wymaga ponownego potwierdzenia brakujących powiązań. Wycofanie produktu po odczycie również blokuje tworzenie. Zmiany wymagają istniejącej roli biura/admin; technik, klient, konto zablokowane i anonimowy użytkownik nie mają dostępu.

## Weryfikacja

570 testów aplikacji i 1068 asercji SQL (27 plików) przeszło pomyślnie. Nowe zestawy: 22 testy kontraktów/API/klienta HTTP oraz 33 asercje SQL. Typy, lint i kompilacja produkcyjna poprawne. Migracja zastosowana i zarejestrowana lokalnie.

W przeglądarce: blokada niezapisanej oferty, automatyczne powiązanie katalogowe, wymagane mapowanie pozycji ręcznej i wycofanej, wyłączony wybór produktu o innej jednostce, konflikt równoległej zmiany i odświeżenie z zachowaniem nazwy/opisu. Utworzono szablon na telefonie, otwarto jego edycję i potwierdzono stałe ilości 8/2/1 godz. oraz bieżącą cenę katalogową 65 zł zamiast historycznej 100 zł. Baza potwierdziła jeden eksport, nowe UUID i brak dodatkowej aktualizacji oferty. Sprawdzono oba motywy oraz 390×844 (strona 390/390 px, okno 354/354 px — bez przewijania poziomego).

Podglądy: `output/qa/offer-template-dark.png`, `offer-template-light.png`, `offer-template-mobile.png`, `offer-template-success-mobile.png`. Sprawdzenie wykonano na odrębnych, tymczasowych danych. Po teście usunięto własną ofertę, klienta, katalog i utworzony szablon/rejestr eksportu, pozostawiając audyt i numerację. Rzeczywistych danych i uprawnień nie zmieniano. Przywrócono ciemny motyw i domyślny rozmiar przeglądarki. Aplikacja działa na 127.0.0.1:3100.

Proponowany kolejny krok: powielanie szablonów instalacji, aby przygotowywać zestawy Standard/Komfort/Premium bez zmieniania oryginału.
