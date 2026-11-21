# Mapa warstw: rdzeń, pakiety branżowe, konfiguracja

Stan: 21 lis 2026. Dokument wiąże **każdy zaprojektowany moduł, sekcję i pole** z jedną z trzech warstw i daje zasady dla kodu. Uzupełnia wpis „Kierunek produktu” w `DECISIONS.md` (20 lis 2026). Ekran, w którym firma włącza pakiety i moduły: Ustawienia › Moduły i pakiety (`screens/13-ustawienia.md`).

## Trzy warstwy

| Znak | Warstwa | Kto ją tworzy | Jak się zmienia |
|---|---|---|---|
| **R** | Rdzeń — każda firma usługowa, która jeździ do klienta | Avero | wersje programu |
| **P** | Pakiet branżowy (pierwszy: **P:HVACR**) — prawo, słownictwo, szablony i reguły jednej branży | Avero | wersje pakietu (kod + migracje), włączany per firma |
| **K** | Konfiguracja — własne pola, tabele, widoki, raporty, akcje, szablony, nazwy statusów | firma (administrator) | dane konfiguracji per firma, bez wdrożenia |

Docelowy rynek rdzenia: firmy serwisowo-instalacyjne (HVACR, elektryka, wod-kan, fotowoltaika, wentylacja, ppoż., windy i bramy, serwis maszyn) — **nie** „każda branża”.

## Moduły

| Moduł | Warstwa | Wyłączalny | Zależy od | Uwagi |
|---|---|---|---|---|
| Skrzynka, Mój dzień, Zadania | R | nie | — | Widżety i sekcje Mój dzień mogą pochodzić z pakietu |
| Firmy i osoby, Obiekty | R | nie | — | Sekcja F-gaz w karcie firmy i kolumna t CO₂e w Obiektach — P:HVACR |
| Urządzenia | R | tak | Obiekty | Rekord ogólny (typ, producent, model, numer seryjny, miejsce, montaż, gwarancje); sekcja czynnika i F-gaz — P:HVACR |
| Zgłoszenia, Zlecenia, Planowanie | R | nie | Firmy | Protokoły z szablonów (szablony branżowe — P) |
| Przeglądy | R | tak | Urządzenia, Umowy | Rdzeń: przeglądy okresowe z umów i gwarancji. Typ „kontrola szczelności” z częstotliwością z prawa — P:HVACR |
| Reklamacje i gwarancje | R | tak | Urządzenia | Bez elementów branżowych |
| Leady, Szanse, Oferty | R | tak (razem jako Sprzedaż) | Firmy | Warianty oferty — R; parametry wariantu pompy ciepła (moc, SCOP, pokrycie) — P:HVACR |
| Projekty | R | tak | Zlecenia | Etapy i szablony etapów — R; szablon „Montaż VRV” — P:HVACR |
| Umowy | R | tak | Firmy | — |
| Faktury | R | nie | Firmy | KSeF, zaliczki, należności — R (prawo polskie, nie branżowe) |
| Katalog, Magazyn | R | tak | — | Partie, numery seryjne, jednostki (kg), opakowania zwrotne z kaucją — R. Czynnik świeży / regenerowany, rejestr czynnika, blokada GWP — P:HVACR |
| Zakupy (dostawcy, cenniki) | R | tak | Katalog | — |
| Raporty | R | nie | — | Zakładka F-gaz — P:HVACR; raporty z własnych tabel — K |
| Portal klienta | R | tak | Faktury | Wybór terminu kontroli szczelności — typ przeglądu z P:HVACR |
| Ustawienia | R | nie | — | Technicy i pojazdy — R; uprawnienia F-gaz techników (certyfikat osoby) — P:HVACR |
| Własne tabele, pola własne, widoki, import, raporty z tabel, akcje | K | — | — | Szablony tabel (np. Przetargi) to K dostarczane przez Avero lub pakiet |

## Pakiet HVACR — spis

| Co | Gdzie się wpina (punkt rozszerzenia) |
|---|---|
| Typy urządzeń chłodniczych, klimatyzacji, pomp ciepła z polami: czynnik, ładunek kg, GWP, t CO₂e, hermetyczność | Typ urządzenia + sekcja rekordu urządzenia |
| Kontrola szczelności: częstotliwość z t CO₂e (5–50 t co 12 mies., 50–500 t co 6, ≥ 500 t co 3; system wykrywania wycieków wydłuża), termin, blokada zmiany częstotliwości poza dokumentem | Typ przeglądu + reguła |
| Zakazy: świeży czynnik GWP > 2500 w serwisie, regenerowany do 2029 | Reguła walidacji (wydanie z magazynu, protokół) |
| Czynnik w magazynie: świeży / regenerowany, butle, ewidencja ilości (przyjęcie, odzysk, zużycie) | Typ pozycji katalogu + rejestr pakietu |
| Raport F-gaz / CRO, karta urządzenia | Raport + dokument |
| Protokoły: kontrola szczelności, pomiar ciśnień, uruchomienie pompy ciepła, odbiór VRV | Szablony protokołów |
| Uprawnienia osób (certyfikat F-gaz technika) i firmy | Sekcja użytkownika / profilu firmy |
| Parametry oferty pompy ciepła (moc, SCOP, pokrycie zapotrzebowania), dobór | Pola wariantu oferty |
| Widżety: kontrole po terminie, czynnik w busach | Mój dzień, Raporty |
| Słownictwo: czynnik, ładunek, t CO₂e, CRO | Słownik pakietu (rdzeń używa słów neutralnych) |

## Przecieki HVACR do rdzenia — do oznaczenia w makietach i kodzie

| Miejsce | Dziś | Docelowo |
|---|---|---|
| Rekord urządzenia | czynnik, ładunek, t CO₂e w nagłówku | nagłówek ogólny; sekcja „Czynnik i F-gaz” z pakietu |
| Przeglądy | jedna lista przeglądów i kontroli | rdzeń: przeglądy okresowe; pakiet dodaje typ i kolumny F-gaz |
| Magazyn i wydanie | „czynnik” jako osobny blok | rdzeń: pozycje z partią i jednostką; blok czynnika i blokada GWP z pakietu |
| Karta firmy | zakładka F-gaz | zakładka dokładana przez pakiet |
| Obiekty | kolumna t CO₂e | kolumna dokładana przez pakiet |
| Mój dzień, Raporty | sekcja i zakładka F-gaz | z pakietu; znikają bez pakietu |
| Ustawienia › Technicy i busy | „busy” | rdzeń: „Pojazdy”; certyfikaty F-gaz z pakietu |
| Oferta pompy ciepła (widok klienta) | parametry pompy w rdzeniu oferty | warianty — rdzeń; parametry — pakiet |

Ekranów nie przerysowujemy — oznaczamy, które części pochodzą z pakietu. Sprawdzian: kluczowe ekrany bez pakietu (firma elektryczna) — kolejny krok projektu.

## Punkty rozszerzeń (co pakiet i konfiguracja mogą dodać)

1. Typy rekordów (urządzenia, przeglądu, pozycji katalogu) z zestawem pól.
2. Sekcje w panelach i rekordach (miejsce: po sekcjach rdzenia).
3. Kolumny i filtry list.
4. Reguły: walidacje i blokady (np. GWP, numer PO na fakturze), terminy wyliczane z pól.
5. Szablony protokołów, dokumentów i etapów projektów.
6. Widżety Mój dzień i zakładki Raportów.
7. Słownik (nazwy pojęć branżowych).
8. Uprawnienia do pól i sekcji (te same role co rdzeń).

Pakiet używa tych samych punktów co konfiguracja firmy — różni się tym, że jest wersjonowany przez Avero, może mieć własne tabele i logikę, a firma nie może go edytować (może tylko włączyć lub wyłączyć).

## Zasady dla kodu

- Rdzeń **nie importuje** kodu pakietu. Pakiet rejestruje swoje typy, sekcje, reguły, widżety i szablony w rejestrze rozszerzeń.
- Dane pakietu w osobnych tabelach (prefiks pakietu) z kluczami do encji rdzenia; każda tabela z identyfikatorem organizacji i RLS.
- Włączenie pakietu = wpis per organizacja (+ migracja danych startowych: typy, szablony, słownik). **Wyłączenie ukrywa, nie usuwa** danych; ponowne włączenie przywraca.
- Obowiązki prawne pakietu (np. kontrole szczelności) przy wyłączaniu wymagają potwierdzenia administratora z ostrzeżeniem o konsekwencjach.
- Pola własne firmy (K) nie mogą nadpisać pól rdzenia ani pakietu; nazwy w osobnej przestrzeni.
- Uprawnienia egzekwuje serwer — także dla sekcji i pól pakietu.
- Tekst interfejsu rdzenia bez słownictwa jednej branży; słowa branżowe tylko ze słownika pakietu.
