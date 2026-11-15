# Oferty PDF

W podglądzie zapisanej kalkulacji jest przycisk **Pobierz PDF** oraz rozwijane dane wykonawcy i warunki oferty. Przy pierwszym użyciu formularz jest otwarty. Wymagane są nazwa i adres firmy oraz data wystawienia i ważności. Dane kontaktowe, identyfikator podatkowy, wprowadzenie, warunki płatności, termin realizacji, wyłączenia i dodatkowe informacje są edytowalne. Puste sekcje są pomijane. Nie wstawiamy fikcyjnych danych do ofert użytkownika.

Dane dokumentu zapisujemy osobno przy ofercie, jako wersjonowany zapis danych wykonawcy i warunków. Profil firmy może już podpowiadać dane nowego dokumentu; zapis przy ofercie pozostaje niezależny od profilu. Szczegóły: [COMPANY_PROFILE.md](COMPANY_PROFILE.md). Zapis metadanych wymaga aktualnej wersji kalkulacji. Powtórzenie identycznego zapisu po utracie odpowiedzi jest bezpieczne. Pobranie wymaga zgodności wersji oferty i dokumentu; zmiana w drugiej karcie wymusza odświeżenie. Każdy wariant musi mieć przynajmniej jedną pozycję.

## Dokument

A4, jasne tło, pomarańczowy #FD4B01, logo aplikacji w postaci wektorowej i osadzone fonty DejaVu Sans z polskimi znakami (licencja w assets/fonts). Przy wielu wariantach pierwsza strona zawiera porównanie cen brutto. Wariant główny jest prezentowany pierwszy; warianty są alternatywami, a ich ceny nie są sumowane. Każdy wariant ma tabelę zakresu, ilości, VAT, wartości netto/brutto i podsumowanie VAT według stawek. Długie tabele otrzymują powtarzane nagłówki; strony mają numerację. Warunki realizacji znajdują się po wycenach.

Kwoty pochodzą z zapisanych obliczeń serwera, po rabatach i proporcjonalnym rozłożeniu ręcznej korekty kwoty końcowej. Nie pokazujemy pierwotnych cen jednostkowych, które po takiej korekcie nie odpowiadałyby wartościom wierszy. Waluta: PLN, tak jak w obecnym katalogu i kalkulacji.

Generator przyjmuje wyłącznie `customerOfferPreview` oraz publiczne dane dokumentu. Nie dostaje kosztów, marży, identyfikatorów katalogu ani notatek wewnętrznych. Eksport nie wysyła oferty, nie zmienia jej statusu i nie publikuje pliku. Klient i technik nie mają dostępu do tych wewnętrznych endpointów. Przyszłe udostępnianie w portalu wymaga osobnego procesu publikacji i zamrożenia wersji.

## API

- `GET /api/v1/offers/{id}/document`: bieżąca wersja kalkulacji i zapis metadanych PDF lub null.
- `PUT /api/v1/offers/{id}/document`: `{version, offerVersion, data}`; zapis optymistyczny, admin/biuro.
- `GET /api/v1/offers/{id}/pdf?offerVersion=N&documentVersion=M`: prywatny załącznik application/pdf, no-store, nosniff. Brak dokumentu, pusty wariant lub niezgodność wersji: 409.
- Wspólny klient API ma `offerDocument`, `saveOfferDocument`, `downloadOfferPdf`, zgodne z autoryzacją Bearer dla przyszłych aplikacji desktop/mobile. To nie jest jeszcze gotowa aplikacja natywna.

Fonty są dołączone do śledzenia plików Next; generator działa w środowisku Node, bez przeglądarki do drukowania i bez zewnętrznych zapytań o zasoby.

## Weryfikacja (26.10.2026)

286 testów aplikacji i 437 testów bazy przeszło. Sprawdzone: role i blokady kont, RLS, niedozwolone zapisy bezpośrednie, konflikt wersji, ponowienia zapisu, prawdziwe daty, ograniczenia tekstu, nagłówki pobierania, brak danych wewnętrznych w danych generatora i wyciągniętym tekście PDF. Typy, lint i kompilacja produkcyjna sprawdzone.

Przykład `output/pdf/oferta-hvac-projekt.pdf` powstaje z tego samego generatora co eksport aplikacji. Zawiera wyraźnie oznaczone dane przykładowe i nie jest rzeczywistą ofertą użytkownika. Dodatkowy test 30 pozycji po 500 znaków oraz długich uwag zweryfikował stronicowanie; strony wyrenderowano i obejrzano. Test w przeglądarce potwierdził zapis metadanych i pobranie działającego PDF z prawidłowymi cenami. Własne dane testowe są usuwane po sprawdzeniu, bez zmiany prawdziwych klientów, produktów i ofert; historia audytowa pozostaje.

Odtworzenie przykładów: `PDF_REVIEW=1 pnpm test -- tests/offer-pdf.test.ts`. Dane testowe są w tests/helpers/offer-pdf-fixture.ts; ta komenda nie zapisuje ich do bazy.

## Aktualizacja: portal klienta

Udostępnianie wersji z zamrożonym PDF jest już wdrożone: [OFFER_PORTAL.md](OFFER_PORTAL.md). Pobranie PDF bieżącej kalkulacji nadal samo nie udostępnia oferty.

Aktualizacja 3.11.2026: własne logo PNG z profilu lub konkretnej oferty jest utrwalane w danych dokumentu i renderowane w nagłówkach PDF. Starsze dokumenty zachowują dotychczasowy znak.
