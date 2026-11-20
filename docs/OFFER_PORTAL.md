# Udostępnianie ofert i akceptacja wariantu

## Obsługa

Firma: Oferty → otwórz kalkulację → Podgląd oferty → zapisz dane PDF → Udostępnij w portalu. Potwierdzenie pokazuje odbiorcę i wymaga sprawdzenia cen i warunków. Niezapisana edycja danych PDF blokuje publikowanie. Klient potrzebuje aktywnego konta przypisanego do odbiorcy; udostępnianie nie tworzy konta ani nie wysyła wiadomości.

Portal: zakładka Oferty → wybrana wersja → zakresy, ceny i warunki → PDF zapisanej wersji → wybór wariantu → osobne potwierdzenie ceny i warunków → Akceptuję ofertę. Konto firmy ma podgląd tylko do odczytu. Akceptacja na cudzym koncie ani automatyczna akceptacja przez pracownika nie są dostępne.

Firma widzi status w historii wersji i na liście ofert, wraz z wybranym wariantem i datą decyzji w szczegółach. Na liście zaakceptowanych ofert prezentujemy zamrożoną cenę wybranego wariantu; marża jest pomijana, ponieważ pokazywane koszty bieżącej kalkulacji mogły się zmienić. Pozostałe wiersze pokazują wartości bieżącej kalkulacji. Odświeżanie pobiera najnowszy stan; powiadomień e-mail/push jeszcze nie ma.

## Zapisane wersje i prywatność

Każda publikacja zamraża bezpieczną projekcję danych klienta, wszystkie warianty, wyliczone kwoty, dane wykonawcy i warunki oraz dokładne bajty wygenerowanego PDF. Generator otrzymuje ten sam jawny zestaw danych klienta co w poprzednim etapie. W publikacji nie ma kosztów firmy, marży, notatek wewnętrznych ani identyfikatorów katalogu. SQL buduje projekcję z zapisanej kalkulacji, nie z przesłanej przez klienta treści.

Aktualizacja roboczej kalkulacji, katalogu lub danych PDF nie zmienia istniejącego udostępnienia. Nowsza publikacja zastępuje poprzednią w akceptacji, ale stara wersja pozostaje w historii klienta z własnym PDF. Wycofanie również blokuje akceptację, zachowując historię. Zaakceptowanej oferty nie można zastąpić ani wycofać; nową propozycję należy utworzyć jako osobną ofertę. Archiwizacja roboczej kalkulacji nie zastępuje jawnego wycofania publikacji.

Data ważności sprawdzana jest po stronie bazy w Europe/Warsaw, z włączeniem całego ostatniego dnia. Data wystawienia w przyszłości, wygasły termin, archiwalny klient lub oferta robocza nie pozwalają na nowe udostępnienie. Archiwalny klient nie może zaakceptować oczekującej oferty. Historyczne dokumenty są czytelne dla nadal przypisanych kont. Cofnięcie przypisania lub blokada konta odbiera dostęp także do historii i PDF.

Na tym etapie PDF jest przechowywany w prywatnej tabeli bazy (bytea, do 2 MB na wersję), bez publicznych adresów plików ani tokenów udostępniających. Tabela bajtów nie ma uprawnień bezpośredniego odczytu przez użytkowników; odczyt odbywa się przez funkcję weryfikującą kontekst klienta. Większa skala przechowywania będzie wymagać archiwizacji lub migracji do prywatnego magazynu obiektowego. Treści PDF nie duplikujemy w dzienniku audytowym.

Publikowanie, zastępowanie, wycofanie i akceptacja używają wspólnej blokady wiersza oferty. Kontrola wersji zapobiega udostępnieniu innych danych niż obejrzane, a przy konflikcie decyzji pierwsza zapisana decyzja pozostaje wiążącym stanem aplikacji. Powtórzenie tej samej decyzji nie zmienia czasu i autora; inny wariant nie może nadpisać akceptacji. Autor i czas pochodzą z sesji i zegara bazy, ceny z zamrożonego wariantu. Decyzja jest rejestrowana w audycie. Nie jest to kwalifikowany podpis elektroniczny ani integracja płatności.

## API i aplikacje mobilne/desktop

- GET/POST `/api/v1/offers/{id}/publications`: historia (ostatnie 20) i publikowanie przez admin/biuro; POST `{requestId,offerVersion,documentVersion}`.
- POST `/api/v1/offer-publications/{id}/withdraw`: wycofanie oczekującej wersji.
- GET `/api/v1/portal/offers?customer={customerId}&page=1`: stronicowana historia klienta, 20 na stronę.
- GET `/api/v1/portal/offers/{id}?customer={customerId}`: wyłącznie jawne dane udostępnionej wersji.
- GET `/api/v1/portal/offers/{id}/pdf?customer={customerId}`: prywatny załącznik PDF, no-store/nosniff; bez ponownego generowania z kalkulacji.
- POST `/api/v1/portal/offers/{id}/accept`: `{customerId,variantId,confirm:true}`. Dozwolone wyłącznie konto klienta. Kwoty przesłane przez wywołującego są odrzucane.

Wspólny klient API udostępnia offerPublications, publishOffer, withdrawOffer, portalOffers, portalOffer, acceptOffer i downloadPublishedOfferPdf; obsługuje te same wersje i uwierzytelnienie Bearer na przyszłych platformach.

## Sprawdzenie

306 testów aplikacji i 480 testów bazy, typy, lint i kompilacja produkcyjna. Testy obejmują izolację klientów i ról, blokady kont, brak danych wewnętrznych, niezmienność snapshotu i bajtów PDF po edycji kalkulacji, ręczne korekty ceny i mieszane VAT, powtórzenia zapisów, wygasanie, zastąpienie, wycofanie, akceptację i blokadę nadpisania decyzji. Testy bazy są wycofywane transakcyjnie.

Przeglądarka: na własnym fikcyjnym kliencie sprawdzono publikowanie z potwierdzeniem, historię, odczyt oferty w portalu w trybie firmy, listę na telefonie i wycofanie. Finalnej akceptacji umowy nie wykonywano z konta użytkownika; decyzje klientów sprawdzają testy transakcyjne i API. Zrzuty dokumentują dane kontrolne, usuwane po testach. Żadnej rzeczywistej oferty nie udostępniono i nie wysłano wiadomości.

Następny etap: utworzenie zlecenia realizacji z zaakceptowanego wariantu, ze skopiowanym zakresem i ustaleniem terminu montażu. Nie tworzymy go automatycznie w tym etapie.

Końcowa kontrola telefonu: przy szerokości 390 px strona ma dokładnie 390 px szerokości; tabele przewijają się osobno (600 px zawartości w 316 px kontenerze). Wycofanie z panelu firmy natychmiast zmienia status wersji w portalu i blokuje wybór do akceptacji. Zweryfikowano również rzeczywisty PDF zapisany przez endpoint publikowania (4 strony, właściwe kwoty, brak wewnętrznych znaczników testowych). Własna publikacja, klient i oferta kontrolna zostały usunięte, historia audytowa pozostała.

## Aktualizacja: realizacje

Tworzenie zlecenia z zaakceptowanego wariantu i plan montażu są już wdrożone. Szczegóły: [WORK_ORDERS.md](WORK_ORDERS.md).
