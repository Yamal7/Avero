# Dziennik decyzji projektowych

Najnowsze na górze. Każda decyzja: data, co, dlaczego. Zmiana decyzji = nowy wpis, stary zostaje.

## 2026-11-20 (Kierunek produktu — decyzja właściciela)
- **Avero będzie w przyszłości sprzedawany innym firmom.** Dziś backend jest jednofirmowy; PRODUCT_PLAN (tabela ryzyk, „Wiele niezależnych firm”) wymaga wtedy osobnego projektu izolacji danych, konfiguracji i rozliczeń. Zalecenie dla kodu: zaplanować to wcześnie — każda tabela należy do organizacji (identyfikator firmy + RLS), konfiguracja firmy (dane, numeracje, progi, integracje) per organizacja; im później, tym droższa migracja.
- **Model produktu: wspólny rdzeń + pakiety branżowe + warstwa elastyczna** (wzór: Attio, HubSpot, Salesforce, Odoo Studio).
  - Rdzeń dla każdej firmy: klienci i obiekty, zadania, Skrzynka, leady i szanse, oferty, zlecenia, faktury, katalog i magazyn, zakupy, raporty, ustawienia.
  - Pakiet HVACR jako pierwszy: F-gaz i CRO, czynniki (świeży / regenerowany), protokoły kontroli i uruchomienia, przeglądy, busy techników. Inne branże — kolejne pakiety.
  - Warstwa elastyczna (projekt w toku): 1) własne pola na istniejących obiektach i konfigurowalny panel boczny (sekcje, kolejność, warunki widoczności, układy per zespół); 2) własne tabele (np. „Przetargi”) z typami pól, powiązaniami z rdzeniem, widokami tabela / kanban / kalendarz i akcjami do rdzenia (np. przetarg → szansa).
- Konsekwencje do uwzględnienia: przełącznik firmy w lewym górnym rogu ramy (dziś „Kranz HVACR ▾”) jest przełącznikiem organizacji; w rdzeniu unikamy słownictwa tylko z HVACR; integracja z Gmailem przy sprzedaży innym firmom wymaga weryfikacji Google i audytu bezpieczeństwa (CASA); Avero jako dostawca SaaS przetwarza dane klientów swoich klientów — umowa powierzenia (RODO) i regulamin; abonamenty, wdrożenie i import danych nowej firmy.

## 2026-11-20 (Katalog)
- **Katalog zostaje zgodny z backendem** (`docs/CATALOG.md`): kategorie Urządzenia / Materiały / Usługi / Dojazd, kod, jednostka, koszt i cena netto, VAT pozycji (23 % domyślnie; 8 % dla budynku mieszkalnego ustawia oferta), producent, model, dostawca, archiwum zamiast kasowania. Marża = (cena − koszt) / cena, nie narzut.
- **Próg marży firmy (22 %) widoczny w katalogu**: marża poniżej progu — ostrzeżenie (ikona + kolor), w ofercie wymaga zgody administratora.
- **Koszt katalogowy a ostatni zakup**: gdy przyjęcie (PZ) lub oferta dostawcy ma wyższy koszt, pozycja dostaje kapsułkę „koszt +X %”, a podgląd proponuje „Tylko koszt” albo „Koszt i cena” dla marży docelowej 25 %. Nic nie zmienia się samo.
- **Historia kosztu** z dokumentem źródłowym (PZ, cennik) — zgodnie z PRODUCT_PLAN etap 5.
- **Oferty zachowują kopię cen z dnia wyceny** (już w backendzie); zmiana w katalogu wpływa na nowe wyceny i szablony instalacji.
- **Import cennika dostawcy z podglądem zmian** (**nowe**): dopasowanie po kodzie producenta; zakładki Podwyżki / Obniżki / Nowe / Do sprawdzenia / Bez zmian; zasada cen „marża poniżej 22 % → podnieś do 25 %, zaokrąglij do 10 zł” z wyborem per wiersz (Zachowaj / Podnieś); zatwierdzenie z datą ważności cennika (zaplanowane na 1 sty 2027). Każda zmiana w historii z plikiem i osobą.
- **Decyzja właściciela: pozycja katalogu i indeks magazynowy to jeden rekord.** Dziś w backendzie są osobno (`catalog_items` i pozycje magazynu) — do połączenia migracją: jeden kod, nazwa, jednostka, koszt i cena; pola magazynowe (czy prowadzimy stan, minimum magazynu i busów, lokalizacja, numer seryjny wymagany, czynnik świeży / regenerowany) na tym samym rekordzie. Usługi i dojazd nie mają stanu. Przyjęcie (PZ) aktualizuje historię kosztu tej samej pozycji; koszt katalogowy zmienia się dopiero po decyzji („Tylko koszt” / „Koszt i cena”). Kod pozycji musi pozostać unikalny także w archiwum.

## 2026-11-20 (Zakupy)
- **Numeracja zamówień do dostawców: `ZK/RRRR/MM/NNN`** (jak PZ/RW/MM/WZ). Dotychczasowe `ZD-2026-131` i `ZD-2026-128` zmienione na `ZK/2026/11/031` i `ZK/2026/11/028`, bo `ZD-…` to zadania.
- **Zapotrzebowanie liczone, nie wpisywane**: potrzeby zleceń/zgłoszeń + minima magazynu i busów − dostępne (stan − rezerwacje) − w drodze. Rezerwacje i zamówienia w drodze nie liczą się podwójnie (PRODUCT_PLAN, etap 5). Każda pozycja pokazuje źródło potrzeby (ZS-, ZG-, minimum).
- **Grupowanie po dostawcy z najlepszą ceną**; nagłówek grupy: termin dostawy, próg darmowej dostawy (z podpowiedzią, co dołożyć), suma, „Utwórz zamówienie” (szkic do sprawdzenia, nie wysyła sam).
- **Kilka cen zakupu jednej pozycji** (cennik, oferta handlowca, ostatni zakup) z trendem — rejestr dostawców i cenniki w zakładkach Dostawcy / Cenniki.
- **F-gaz w zakupach i wydaniach**: od 2026 świeże czynniki o GWP > 2500 (np. R404A) nie mogą służyć do serwisu urządzeń chłodniczych; regenerowane / z recyklingu — do końca 2029 r. Pozycja czynnika ma atrybut „świeży / regenerowany”; Avero nie wyda świeżego R404A na zlecenie, a przy PZ regenerowanego wymaga certyfikatu regeneracji. Notatka PD w Skrzynce poprawiona na „regenerowany R404A”.
- **Przyjęcie dostawy na zamówieniu**: ilość przyjmowana per pozycja (częściowe przyjęcie zostawia otwartą pozycję z przypomnieniem), numer seryjny wymagany dla urządzeń. Zatwierdzenie tworzy PZ, rezerwację pod zlecenie i kartę urządzenia.
- **Faktura zakupowa z KSeF** dopasowywana automatycznie po NIP dostawcy i numerze ZK; koszt trafia do wyniku zlecenia.

## 2026-11-20 (Leady i Szanse — zatwierdzone; rekord szansy)
- Właściciel zatwierdził: cel pierwszego kontaktu 2 h, prawdopodobieństwa etapów 10 / 25 / 40 / 55 / 75 %, Pascal Kranz (PK) jako drugi opiekun handlowy obok Agnieszki.
- **Rekord szansy**: ścieżka etapów z datami (etap pominięty — szary „pominięte”), historia od leada do realizacji w jednej osi (najnowsze na górze, grupy dni, filtry: Wszystko / Rozmowy / Dokumenty / Klient), po prawej klient, wartość (netto, brutto, marża, zaliczka, pozostało), sprzedaż (źródło, czas pierwszego kontaktu liczony w godzinach pracy, opiekun), „Dalej” i powiązane dokumenty.
- Zdarzenia automatyczne (akceptacja, płatność, zlecenie, zamówienie) wpisuje Avero z godziną i numerami; zdjęcia z oględzin zawsze wewnętrzne.

## 2026-11-20 (Leady i Szanse)
- **Lead ≠ szansa.** Lead to niezweryfikowane zapytanie (formularz, telefon, e-mail ze Skrzynki, polecenie, technik po wizycie). Po rozmowie: „Zakwalifikuj i umów oględziny” tworzy szansę (i oględziny) albo „Odrzuć” z powodem. Zgodnie z PRODUCT_PLAN etap 4.
- **Cel pierwszego kontaktu: 2 h od wpłynięcia, w godzinach pracy** — kolumna „Kontakt do” i średnia w nagłówku. Wartość do ustawienia w Ustawieniach (domyślnie 2 h).
- **Etapy szansy**: Kwalifikacja → Oględziny → Wycena → Oferta → Negocjacje → Wygrana / Przegrana. Prawdopodobieństwa do wartości ważonej: 10 / 25 / 40 / 55 / 75 % (edytowalne w Ustawieniach).
- **Etap szansy nie jest statusem oferty**: karta pokazuje ofertę (numer, wersja, otwarcia przez klienta) osobno. Akceptacja oferty online sama zamyka szansę jako wygraną; przegrana wymaga powodu (cena, termin, konkurencja, rezygnacja, inne).
- **Każda otwarta szansa ma następne działanie z terminem**; po terminie — czerwone, licznik w nagłówku tablicy.
- **Technik może zgłosić lead** po wizycie (np. wymiana starego urządzenia) — źródło „Od technika”, z numerem zlecenia.
- Tablica bez kafelków KPI: suma w lejku, wartość ważona i wygrane w miesiącu jako jedna linia faktów.

## 2026-11-20 (poczta i SMS — decyzje właściciela)
- **Poczta w Skrzynce przez bezpośrednie połączenie z Microsoft 365 i Google Workspace** (OAuth, logowanie u dostawcy — hasło nigdy nie trafia do Avero). Dostęp tylko do wskazanych skrzynek firmowych (serwis@, biuro@), nie do skrzynek pracowników. Microsoft 365: Microsoft Graph, jednorazowa zgoda administratora. Google: aplikacja wewnętrzna domeny.
- **Uwaga na przyszłość (Google)**: zakresy Gmail do odczytu poczty są „restricted”. Dla aplikacji używanej tylko we własnej domenie nie ma audytu; jeśli Avero będzie sprzedawane innym firmom, wymagana weryfikacja Google i coroczny audyt bezpieczeństwa (CASA). Microsoft 365 nie ma takiego wymogu.
- **SMS przygotowany teraz, dostawca po umowie**: kanał w Skrzynce, szablony, nadawca „Kranz HVACR” i miejsca użycia (akceptacja oferty, prośba o termin przeglądu, przypomnienie przed montażem) gotowe; w Integracjach stan „Czeka na dostawcę”. Do czasu podłączenia SMS-y nie wychodzą — kod ma być niezależny od dostawcy (adapter), klucz w zmiennej środowiskowej serwera.
- Wysyłka automatyczna (powiadomienia przez Resend) zostaje osobno od skrzynek odbiorczych.

## 2026-11-20 (Zgłoszenia i Skrzynka)
- **Zgłoszenia projektowane pod istniejący backend** (`docs/SERVICE_WORKFLOW.md`): statusy Nowe / W obsłudze / Oczekuje / Zamknięte i priorytety Niski / Normalny / Pilny z kodu. Status i priorytet zawsze kształtem + kolorem, nigdy samym kolorem.
- **Lista grupowana po statusie**, kolumna „Reakcja”: przy umowie z SLA odliczanie do terminu reakcji (czerwone), bez umowy — czas od zgłoszenia.
- **Ścieżka statusu w podglądzie** (Przyjęte → Technik → Wizyta → Protokół → Zamknięte) — ten sam znak rozpoznawczy co w Mój dzień.
- **Propozycja technika uwzględnia przypisanie do klienta** (biuro może wybrać tylko technika z dostępem do klienta — reguła z backendu), odległość i wolne okno. Akcja jedną kontrolką: przydziel + zaplanuj + potwierdzenie do klienta.
- **Skrzynka = jedno miejsce na korespondencję** (e-mail serwis/biuro, portal klienta, formularz na stronie). Każdy wątek ma przypięcie: zgłoszenie, lead lub kategoria nie-serwisowa. Dopasowanie po nadawcy, obiekcie i numerze dokumentu (np. ZK/2026/11/028 → ZG-0905).
- **Odpowiedź do klienta i notatka wewnętrzna w jednym polu z przełącznikiem** (R / N); notatka zawsze oznaczona kłódką. Klient nigdy nie widzi notatek (zgodnie z PRODUCT_PLAN, etap 2 pkt 4).
- **Propozycje Avero nic nie zmieniają bez kliknięcia**; szkic odpowiedzi tworzony z propozycji jest edytowalny.

## 2026-11-20 (decyzje właściciela: ikony i mapa)
- **Phosphor zatwierdzony** — własne ikony SVG w kodzie zastąpić biblioteką `@phosphor-icons/react` (wariant Regular, 16/20 px, kolor z tokenów tekstu). Nazwy ikon z makiet odpowiadają nazwom Phosphor.
- **MapLibre odłożone** — na razie zostaje mapa na kafelkach OpenStreetMap z nakładką SVG. MapLibre wdrażamy dopiero, gdy pojawi się realna potrzeba (np. dużo pinezek, warstwy tras, mapa w trybie ciemnym z własnym stylem).

## 2026-11-20 (odpowiedzi na STATUS)
- **Kategorie osób kontaktowych** — edycja jak kategorie firm: kliknięcie komórki „Kategorie” w tabeli Osoby (oraz pole w panelu osoby) otwiera ten sam popover co filtr kategorii firm: wyszukiwanie, lista z kolorowymi kropkami i ptaszkiem, „Utwórz «…»” gdy brak wyniku, na dole „Zarządzaj” z ikoną zębatki. „Zarządzaj” otwiera okno listy kategorii (nazwa, kolor z 8 próbek, liczba osób, usuń z potwierdzeniem). Kategorie osób i firm to osobne listy. Obecna edycja w komórce zostaje — dochodzi „Zarządzaj”.
- **Odstępstwa przyjęte**: mapa na kafelkach OSM z SVG i własne ikony SVG (MapLibre i Phosphor — decyzja właściciela), ⌥T / ⌥1–9 w przeglądarce, jedno MM na każdy bus, „+” w kolumnie tablicy → lista firm, filtry na wczytanej stronie (docelowo po stronie serwera).
- **Tokeny**: źródłem prawdy jest `docs/design/tokens.css`; `src/app/precision.css` ma odwzorować go 1:1. Przy różnicach wygrywa `tokens.css`.
- **Motyw ciemny**: każdy nowy ekran sprawdzany w ciemnym motywie przed oznaczeniem „działa” w STATUS.

## 2026-11-20 (Ustawienia — pozostałe zakładki)
- **Numery ofert, zleceń i zgłoszeń nadaje baza** (kłódka w Ustawieniach); edytowalne są serie faktur, korekt, protokołów i dokumentów magazynowych — zmiana działa od nowego miesiąca.
- **Progi marży per kategoria** (urządzenia 15 %, materiały 30 %, usługi 45 %, dojazd 0 %) obok progu całej oferty 22 %; domyślnie poniżej progu tylko ostrzeżenie.
- **Uprawnienia techników (F-gaz, SEP, gaz) i wyposażenie busów** są danymi, z których korzysta podpowiadanie technika; wygasające uprawnienia ostrzegają z wyprzedzeniem.
- **Koszt godziny technika widzi tylko administrator.**
- Propozycje nowych funkcji (do decyzji właściciela): motyw „Jak system” i zapis motywu na koncie, cisza nocna i podsumowanie dnia, nowe kategorie powiadomień (Oferty, Płatności, Magazyn).

## 2026-11-20 (Ustawienia)
- **Ustawienia jako druga kolumna nawigacji** w panelu głównym (panel boczny aplikacji zostaje). Sekcje: Firma, Zespół, Połączenia, Moje konto.
- **Projekt Ustawień opiera się na istniejącym backendzie** (profil firmy z wersją i logo, role Administrator/Biuro/Technik/Klient, zaproszenia 7 dni, blokada przez RLS, audyt, poczta przez zmienne środowiskowe).
- **Sekrety nigdy w przeglądarce**: integracje pokazują stan, nazwę zmiennej środowiskowej i test połączenia — bez pól na klucze.
- **Numer konta zamaskowany** w profilu firmy; odsłonięcie ikoną kłódki.
- **Kolor osoby ustawia administrator** w panelu użytkownika (paleta 7 kolorów), a nie stała w kodzie.
- Ryzykowne przełączenia (np. P24 na produkcję) jako zwykły przycisk, nie akcent.

## 2026-11-20
- **Repozytorium `Yamal7/avero` jest wspólnym źródłem wiedzy** dla czatu projektowego i Claude Code. Projekt pisze w `docs/design/`, kod raportuje w `docs/STATUS.md`.

## 2026-11-19
- **Raporty bez kafelków KPI.** Przegląd miesiąca: 4 fakty w blokach `--bg-raised` z małym wykresem liniowym i zmianą m/m (zielona/czerwona wg tego, czy to dobrze, nie wg kierunku). Jeden wykres słupkowy skumulowany (przychód wg rodzaju prac, 12 mies.), etykiety bezpośrednie przy ostatnim słupku, legenda zawsze. Bez dwóch osi Y.
- **Paleta wykresów** `--series-1…4` przeszła walidację dla daltonistów (CVD ΔE ≥ 8) w obu motywach; dwa kolory mają < 3:1 na jasnym tle, więc każdy wykres ma widok tabeli.
- **„Avero zauważa”**: obserwacje z jedną akcją (np. „Zaktualizuj cennik”). To jedyne miejsce na pełne zdania w raporcie.
- **Przeglądy**: status = kształt + kolor (przerywane kółko = do zaplanowania, ćwiartka żółta = klient wybiera termin, ¾ akcent = zaplanowane, czerwone z wykrzyknikiem = po terminie, przekreślone = bez umowy). Podstawa przeglądu jako kapsułka: F-gaz (tarcza, czerwona ikona), Umowa (numer), Gwarancja (medal).
- **Daty zawsze z poprawnym dniem tygodnia** (2026: 30 lis pon., 1 gru wt., 9 gru śr.).

## 2026-11-18
- **Faktura końcowa pomniejsza netto i VAT o zaliczkę** (art. 106f ust. 3 ustawy o VAT) i podaje numer faktury zaliczkowej; nie wystarczy odjąć zaliczki w sekcji „Rozliczenie”.
- **KSeF dla faktur B2C jest dobrowolny** — domyślnie „Poza KSeF” dla osób prywatnych, z podpowiedzią dlaczego; B2B → KSeF.
- **CRO**: pompy ciepła typu split rejestruje się od 5 t CO₂e (monoblok hermetyczny od 10 t). R32: od 7,4 kg. Avero liczy to z ładunku × GWP i pokazuje „CRO: nie dotyczy” z wyjaśnieniem; przelicza ponownie po zmianie ładunku.
- **Kontrola szczelności**: progi 5 / 50 / 500 t CO₂e → co 12 / 6 / 3 mies. (z systemem wykrywania wycieków ×2), wg (UE) 2024/573.
- **Akceptacja oferty online**: podpis palcem na ekranie klienta (bez kodu SMS). Przy umowie zawartej na odległość, gdy montaż wypada w 14 dniach od akceptacji, wymagane osobne zaznaczenie „Proszę o montaż przed upływem 14 dni na odstąpienie” (pokazywane tylko wtedy). Treść zgody i OWU do sprawdzenia przez prawnika.
- **Płatności**: jeden operator — Przelewy24 (BLIK, szybki przelew, karty Visa/Mastercard, Apple Pay, Google Pay). Przy każdej metodzie małe logo operatora (w makiecie zastępcze kafelki tekstowe — w kodzie oficjalne logotypy z brand kitów).
- **Oferta**: warianty obok siebie (dobry / lepszy / najlepszy), polecany w środku z gwiazdką; pozycje opcjonalne zaznaczane przez klienta, polecane domyślnie zaznaczone; po wysłaniu oferta jest nieedytowalna — zmiana tworzy nową wersję. Klient nigdy nie widzi marży, dostępności, cen zakupu ani zdjęć wewnętrznych.
- **Po akceptacji Avero samo**: tworzy zlecenie, rezerwuje magazyn, zamawia brakujące u dystrybutora, wstawia bloki do planowania, wystawia fakturę zaliczkową; otwarte kwestie pokazuje w „Do decyzji”.

## 2026-11-17
- **Zasada „ikona → kapsułka → karta podglądu”.** Informację pokazuj najkrócej: sama ikona (z podpowiedzią), kapsułka = ikona + 1–2 słowa lub liczba, pełne szczegóły w karcie po najechaniu. Pełne zdania tylko przy decyzjach. Etykiety nad polami → ikona w polu (etykieta zostaje dla czytników ekranu). Druga linia tekstu w wierszu → kapsułki po prawej.
- **Małe, kolorowe ikony informacyjne na szarej bazie** (12–16 px). Kolor ikony niesie znaczenie (status, typ urządzenia, czynnik, osoba), nie dekoruje. Ikony „dla ozdoby” zabronione.
- **Stałe kolory osób** w całym programie: MZ #3B82D6, TL #9B6BE0, KN #1FA7A5, PD #E0702A, biuro szare.
- **Avero podpowiada technika** (odległość, wolne okno, czynnik w busie, części, SLA) — decyzja zostaje u dyspozytora.
- **Planowanie na 1920 px** (monitor w biurze).
- **Odświeżony ekran projektuje się obok starego**; stary usuwa właściciel po akceptacji.

## 2026-11-16
- **Większe zaokrąglenia, linie prawie niewidoczne lub brak.** Wypełnienie zamiast ramki; ramka tylko gdy niesie znaczenie. Promień wg wysokości elementu: 6 / 8 / 10 px, karty 12, popovery i okna 14. Telefon: pola 14, przyciski 16, karty 20–24. Kapsułki właściwości w pełni zaokrąglone (jedyny wyjątek od zakazu „pill buttons”).

## Wcześniej (do 2026-11-15)
- **Styl Precision UI** (wzór: Linear): treść przed chromem, niemal monochromatycznie, jeden akcent `#5E6AD2`, Geist + Geist Mono, baza 13 px, siatka 4 px, statusy jako kształt + kolor, klawiatura pierwszorzędna (⌘K, C, /, J/K, G+litera), motyw jasny i ciemny od pierwszego dnia.
- **Wzorzec „Widok kolekcji”**: zapisane widoki jako pigułki, przełącznik Lista / Tablica, Opcje widoku, rekord w prawym panelu. Ten sam wzorzec w Zadaniach, Magazynie, Firmach, Przeglądach.
- **Pola zablokowane (kłódka)**: stany magazynowe, ładunek czynnika, częstotliwość kontroli — zmienia je tylko dokument (PZ/RW/WZ/MM, protokół).
- **Firmy w stylu Attio**: wiele kategorii z kolorem, kolumna Firma przypięta, podsumowanie na dole tabeli.
