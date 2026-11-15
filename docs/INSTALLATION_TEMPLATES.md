# Szablony instalacji

KRA-16, wdrożenie lokalne 1.11.2026. Biblioteka **Szablony instalacji** w menu firmy jest dostępna dla administratora i biura pod `/dashboard/templates`. Technicy i klienci nie mają dostępu do szablonów ani cen. Kontrola ról działa na poziomie strony, API i bazy.

## Praca z biblioteką

**Nowy szablon**: nazwa, rodzaj prac (split, multi-split, pompa ciepła, podłogówka, wod-kan lub własny), krótki opis i od 1 do 30 pozycji katalogowych. Każda pozycja ma dodatnią ilość, z dokładnością do 3 miejsc po przecinku, w jednostce katalogowej. Dostępne urządzenia, materiały, usługi i dojazd. Można dodawać, usuwać oraz zmieniać ilości. Powiązania i kolejność są zapisane; cen nie zapisujemy w szablonie.

Lista ma wyszukiwanie nazwy/opisu, filtry rodzaju i aktywności oraz strony po 25 zestawów. Archiwizacja jest odwracalna. Szablon z wycofaną/niedostępną pozycją można zarchiwizować; ponowna aktywacja wymaga aktywnych produktów. Edytor oznacza brakującą pozycję i wymaga zastąpienia jej lub usunięcia przed użyciem.

Zapisy mają oczekiwaną wersję i ochronę przed nadpisaniem równoczesnych zmian. Przy konflikcie należy wczytać aktualną wersję. Ponowienie identycznego tworzenia/edycji nie dodaje wersji i audytu. Blokady kont sprawdzane przy zapisie. Brak kasowania szablonów w aplikacji, brak nowych kont lub uprawnień.

## Tworzenie oferty

**Użyj szablonu** otwiera dotychczasowy kreator ofert. Można też wybrać zestaw w kroku 3 dowolnego kreatora — wyszukiwarka szablonów ma paginację. Wybór uzupełnia rodzaj prac i pokazuje komplet pozycji, ilości oraz aktualne jednostkowe ceny netto z katalogu. Można wrócić do tworzenia bez szablonu.

Przed utworzeniem kalkulacji ponownie pobieramy szczegóły. Jeżeli zmieni się wersja szablonu albo dane/ceny jego pozycji, odświeżamy podgląd i wymagamy ponownego kliknięcia po sprawdzeniu. Szablon archiwalny lub wycofane produkty blokują użycie. Jest to sprawdzenie świeżego podglądu, nie blokada cen katalogu na czas całej sesji.

Nowa oferta otrzymuje niezależne pozycje z nowymi identyfikatorami i skopiowanymi kosztami/cenami/VAT. Identyfikatory są zachowywane przy ponowieniu żądania po błędzie połączenia. Ilości i pozycje można zmienić w kalkulacji. Edycja katalogu lub szablonu nie aktualizuje zapisanych ofert, PDF ani publikacji. Nie zmieniono reguł wyliczeń i dostępu do ofert.

KRA-17 dodaje wybór stałej ilości lub mnożnika długości, powierzchni, czasu pracy i kilometrów. Szczegóły: [TEMPLATE_PARAMETERS.md](TEMPLATE_PARAMETERS.md). Szablon rozpoczyna nową ofertę; nie dopisuje pozycji do istniejącej kalkulacji i nie tworzy wariantów cenowych automatycznie. Nie dodano fikcyjnych produktów ani gotowych zestawów do stałej bazy — własne zestawy tworzy biuro na podstawie swojego katalogu.

## API

- GET `/api/v1/templates?search=&state=active&workType=all&page=1`: total, items; strony po 25.
- GET `/api/v1/templates/{id}`: template (id, version, fields, createdAt, updatedAt), lines (bieżące pełne pozycje kalkulacji), unavailable (identyfikatory nierozwiązanych wierszy szablonu).
- PUT `/api/v1/templates`: `{id,version,fields:{name,description,workType,archived,lines:[{id,catalogId,quantityMills}]}}`. Przy tworzeniu `version:null`; przy edycji aktualna wersja. Zwraca zapisany szablon.

Ścisłe wspólne schematy odrzucają ceny w zapisie, nieznane pola, powtórzone identyfikatory, błędne ilości i niespójną projekcję rozwiązanych pozycji. Klient API: `installationTemplates`, `installationTemplate`, `saveInstallationTemplate`; helper `templateOfferLines` tworzy niezależną kopię do oferty i odrzuca niekompletne/archiwalne zestawy.

Migracja `202611010004_installation_templates.sql` dodaje prywatną tabelę z istniejącym audytem i chronione RPC do listy/szczegółów/zapisu. Brak bezpośrednich uprawnień do tabeli dla klienta; pomocnicza projekcja nie jest publicznym RPC. Zapis korzysta z istniejącej blokady zmian uprawnień. Nie nadpisuje tabel ofert ani katalogu.

## Sprawdzenie

508 testów aplikacji, 992 testy bazy, typy, lint i kompilacja produkcyjna. Nowe zestawy: 15 testów kontraktów/API i 31 asercji SQL. Obejmują role, zakres danych, wersje, ponowienia, archiwizację/przywrócenie, wycofane produkty, aktualne ceny, niezależne kopie pozycji i ścisłą walidację.

Parametryczne ilości wdrożono w KRA-17; aktualne sprawdzenie i dalszy proponowany etap: [TEMPLATE_PARAMETERS.md](TEMPLATE_PARAMETERS.md).

Kontrola w przeglądarce: utworzenie nowego zestawu przez picker katalogu, zapis ilości, archiwizacja i przywrócenie, start kreatora z karty szablonu, wykrycie zmienionej ceny, odświeżenie podglądu i zapis kalkulacji. Potwierdzono, że oferta zachowała ilość 8 m i cenę 40 zł/m po zmianie szablonu na 9 m. Oba motywy przy 1440×1000 oraz lista/edytor przy 390×844 bez poziomego przewijania. Podglądy: `output/qa/templates-light.png`, `templates-dark.png`, `templates-mobile.png`, `template-editor-mobile.png`, `template-created.png`, `template-price-change.png`, `template-offer-created.png`.

Wszystkie testy UI dotyczyły własnych, tymczasowych produktów, szablonów i klienta. Nie tworzono kont ani dostępu, nie zmieniano rzeczywistych ofert/katalogu. Dane demonstracyjne usunięto (0 szablonów, produktów, klientów i ofert); audyt oraz sekwencja numeracji pozostają zachowane. Migracja zastosowana i zarejestrowana lokalnie. Aplikacja uruchomiona wyłącznie na 127.0.0.1:3100.

Powielanie z biblioteki i zapisanego edytora wdrożono 3.11.2026: [TEMPLATE_DUPLICATION.md](TEMPLATE_DUPLICATION.md).
