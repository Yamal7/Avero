# Sprawdzian rdzenia: firma elektryczna bez pakietu

Makiety: ekrany `test dzień`, `test urządzenie`, `test zlecenie` w `Main.dc.html` (jasne i ciemne). Firma: **Volt-Serwis**, Gdynia — instalacje i serwis elektryczny, 4 techników, **bez pakietu branżowego** (tylko rdzeń R i konfiguracja firmy K). Scenariusz: czwartek 19 lis 2026. Cel: sprawdzić, czy rdzeń z `LAYERS.md` wystarcza innej branży serwisowej.

Na ekranach jest **adnotacja sprawdzianu** (przerywana ramka) i znaczniki warstw przy sekcjach: `R` — rdzeń, `K` — konfiguracja firmy. Adnotacje nie są częścią produktu. Liczniki w pasku bocznym pochodzą ze scenariusza Kranz HVACR — rama jest wspólna; nazwa firmy i karta otwartego zlecenia zmieniają się per firma.

## Co pokazują ekrany
- **Mój dzień** — ta sama struktura co w Kranz HVACR (Zagrożone SLA, Wizyty, Bez technika, Skrzynka, Po terminie; widżety Zespół, Umowy, Sprzedaż). Wszystko rdzeń; jedyny element K: częstotliwość badania instalacji wpisana ręcznie.
- **Urządzenie UR-0318 „Rozdzielnica główna RG-1”** — typ urządzenia i sekcja „Dane techniczne” (prąd znamionowy, układ sieci, IP, obwody, ochrona przepięciowa) utworzone przez firmę; dane ogólne, przeglądy okresowe, historia, obiekt, umowa, dokumenty — rdzeń. Brak sekcji branżowej (w HVACR tu jest „Czynnik i F-gaz” z pakietu).
- **Zlecenie ZL-0734** — protokół z szablonu firmy „Pomiary instalacji elektrycznej” z **tabelą pomiarów i oceną wyniku** (Zs zmierzona ≤ dopuszczalna, wynik negatywny → zalecenie → „Utwórz ofertę”); materiały z wydania, rozliczenie (część w umowie, część płatna), czas pracy, dokumenty, podpis — rdzeń; uprawnienia technika jako pole własne użytkownika.

## Wnioski — rdzeń wystarcza, ale musi umieć
1. **Własne typy urządzeń z zestawem pól** (K) — nie tylko typy z pakietu. Ikona i nazwa typu z konfiguracji, nie z kodu.
2. **Przeglądy okresowe z częstotliwością ustawianą przez firmę** dla urządzenia lub obiektu, niezależnie od umowy. Pakiet może ją podpowiadać i blokować (F-gaz); bez pakietu wpisuje firma.
3. **Szablony protokołów z sekcją-tabelą**: wiersze (np. obwody), kolumny z typami i jednostkami, wartość graniczna, reguła oceny (≤, ≥, zakres), wynik wiersza i protokołu; wynik negatywny wymaga zalecenia.
4. **Zalecenie z protokołu → oferta** (rdzeń, nie pakiet).
5. **Pola własne użytkownika** (uprawnienia zawodowe z datą ważności) i przypomnienie o końcu ważności; sprawdzanie przy przydziale — pakiet.
6. **Numeracja dokumentów per firma** (ZL zamiast ZS) — Ustawienia › Dokumenty i numeracja (już w rdzeniu).
7. **Rama**: nazwa i znak firmy z konfiguracji; brak słów branżowych w ramie i pasku bocznym.
8. **Jednostki** w magazynie: m, szt., kpl. — rdzeń (kg dla czynnika to tylko przypadek).

## Czego rdzeń nie potrzebuje
Rejestrów prawnych branży (F-gaz, CRO, pomiary wymagane przepisami z terminami), słownika i blokad — to zadanie pakietów (np. przyszły pakiet Elektro: terminy badań z przepisów, wzory protokołów, kontrola uprawnień przy przydziale).
