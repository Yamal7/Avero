# Scenariusz danych przykładowych

Wszystkie makiety używają tych samych danych, żeby ekrany były spójne. Używaj ich w seedach, testach i Storybooku. Kwoty netto, jeśli nie zaznaczono inaczej.

## Firma i ludzie
- Firma: **Kranz HVACR** (Gdynia / Trójmiasto). Dane NIP i konto — z Ustawień (nie wpisywać w kod).
- Biuro: **Agnieszka Wiśniewska (AW)** — opiekun umów, dyspozytor. Kolor szary.
- Technicy (stałe kolory): **Mateusz Zieliński MZ** `#3B82D6`, **Tomasz Lewandowski TL** `#9B6BE0` (certyfikat F-gaz, prowadzi montaże pomp), **Kacper Nowak KN** `#1FA7A5`, **Piotr Dąbrowski PD** `#E0702A`.

## Scenariusz serwisowy (piątek 13 lis 2026, 09:14)
- **ZS-1047** — lodziarka nie chłodzi, Delikatesy Morskie, Starowiejska 12, Gdynia. KN w drodze, przyjazd 09:40. Części: MM/2026/11/052, protokół PR/2026/11/041. SLA 29 h, rozliczenie 520,17 zł.
- **ZG-0920** — zgłoszenie alarmowe (0:52 do reakcji), proponowany PD na 09:30, 6 km. Przychodnia Zdrowie (Morska 105, Gdynia), centrala wentylacyjna UR-2650 — alarm zamrożenia wymiennika; e-mail Roberta Kamińskiego 6:06; umowa **UM-2025-022** (reakcja 4 h całodobowo → do 10:06, kara 200 zł/rozpoczęta h).
- Pozostałe otwarte zgłoszenia (13 lis): ZG-0923 Biuro Bilans — klimatyzator kapie (portal, 8:41, 2 zdjęcia); ZG-0924 Piekarnia Rogal — oszroniony parownik (telefon, 8:55); ZG-0915 → ZS-1047 (KN); ZG-0912 Hotel Oliwski — agregat Bitzer UR-2304 często się załącza (PD, dziś 13:00); ZG-0909 Galeria Bałtycka — VRV jednostka 3 głośna (TL, pon 16 lis 8:00); ZG-0907 Kancelaria Wit — filtry (MZ, wt 17 lis 15:00); ZG-0905 Kancelaria Wit — wentylator skraplacza, czeka na część ZK/2026/11/028 (Klimatech, dostawa 17 lis); ZG-0898 Restauracja Przystań (Bulwar Nadmorski 2) — schładzacz, klient wybiera termin.
- Skrzynka (13 lis): Ewa Malinowska (Hotel Oliwski, szefowa kuchni) 9:02 — agregat znów stanął, komora 9 °C, dostawa 11:00 → propozycja: dołącz do ZG-0912, priorytet Pilny, przesuń PD na 10:45 (po Przychodni, 4 km). Joanna Krawczyk — formularz www, wycena klimatyzacji 3 pokoje 64 m² w Redłowie → lead.
- **ZS-1045** — montaż wstrzymany: brak R32 w busie (zadanie ZD-118).
- Urządzenie **UR-3107** lodziarka, R404A 5,4 kg = 21,2 t CO₂e → kontrola co 12 mies.
- Urządzenie **UR-3109** agregat Bitzer 4FES-5Y, Delikatesy Morskie (maszynownia, Starowiejska 12), R404A 18,5 kg = 72,6 t → kontrola co 6 mies., następna 4 gru; regały UR-3110 w tym układzie. Rekord urządzenia w makiecie pokazuje UR-3109.

## Scenariusz sprzedaży (pompa ciepła)
- Klient: **Marek Zieliński** (osoba prywatna, KL-0388), Dębogórska 31, 84-230 Rumia, dom 160 m², tel. +48 604 219 553, m.zielinski@poczta.onet.pl.
- Oględziny **OG-0412** (10 lis, TL): obciążenie cieplne 7,4 kW przy −16 °C, 14 zdjęć, OZC. Zadanie **ZD-121**.
- Oferta **OF-2026-118**, opiekun TL, ważna do 2 gru 2026, VAT 8 %:
  - A: Panasonic Aquarea T-CAP 9 kW — 39 860,00 zł netto (pokrycie 118 %, SCOP 4,43) — ostrzeżenie: brak bufora.
  - **B (polecany): Daikin Altherma 3 R 8 kW** — 44 020,00 zł netto / 47 541,60 brutto (pokrycie 104 %, SCOP 4,52).
  - C: Daikin Altherma 3 H HT 14 kW — 53 480,00 zł netto.
  - Pozycje B: urządzenia 32 250,00 (ERGA08EV 14 900, EHVH08S23E6V 16 200, sterownik Madoka 1 150), materiały 5 470,00 (bufor 50 l 2 380, rura 8 m × 95 = 760, armatura 1 640, fundament 690), robocizna 6 300,00 (montaż 4 800, uruchomienie 900, demontaż kotła 600 — opcja).
  - Marża 25,5 % (11 206 zł), próg firmy 22 %.
- Akceptacja **18 lis 14:51**: wariant B + demontaż kotła, termin montażu 30 lis – 1 gru (pon.–wt.), zgoda na montaż przed upływem 14 dni.
- Zaliczka 30 %: **14 262,48 zł** brutto (13 206,00 netto + 1 056,48 VAT), BLIK przez Przelewy24 → **FZ/2026/11/014**.
- Zamówienie u dystrybutora **ZK/2026/11/031** (jednostka zewn. + fundament), dostawa 20 lis.
- Zlecenie montażu **ZS-1052** (TL + MZ), urządzenie po uruchomieniu **UR-4127**: R32 1,5 kg = 1,01 t CO₂e → CRO i kontrola szczelności nie dotyczą.
- Protokół odbioru **PR/2026/12/007** (1 gru 14:20).
- Faktura końcowa **FV/2026/12/003**: do zapłaty 33 279,12 zł brutto (30 814,00 netto + 2 465,12 VAT), termin 8 gru, poza KSeF (B2C).
- Przegląd gwarancyjny 1 gru 2027; propozycja umowy serwisowej 590 zł netto / rok (637,20 brutto), e-mail 15 gru.

## Projekty (sobota 21 lis 2026)
- W realizacji 4 / 1 334 800 zł netto, marża prognoza 23,2 % (plan 23,7 %), do zafakturowania w grudniu 384 360 zł.
- **PJ-2026-011 Klimatyzacja VRV · 42 pokoje** — Hotel Bryza (KL-0402), obiekt OB-0611 Haffnera 22, Sopot; 14 wrz – 18 gru 2026; kierownik TL, zespół TL, MZ, Elektro-Bud (podwykonawca, 28 000 zł), rozliczenia PK. Z SZ-0142 (wygrana 4 wrz), OF-2026-097 v2, umowa UW-2026-014 z 9 wrz; 486 000 zł netto.
  - Etapy: przygotowanie 14 wrz–2 paź ✓; dostawy 28 wrz–16 paź ✓ (ZK/2026/09/044, 047); instalacja freonowa i skropliny 5 paź–6 lis ✓ (próba ciśnieniowa 6 lis, PC-011); montaż jednostek wewn. 26 paź–4 gru (28 z 42, 67 %); elektryka i sterowanie 9 lis–4 gru (45 %); uruchomienie 7–11 gru; odbiór 14–18 gru. Postęp 60 %.
  - Koszty plan / do dziś / prognoza: materiały 252 000 / 196 400 / 254 300; robocizna 78 000 / 31 800 / 86 480 (+64 h, przebudowa trasy skroplin na 2. piętrze, PK-03 z 12 lis); usługi obce 28 000 / 9 500 / 28 000; dojazdy i sprzęt 11 360 / 4 200 / 11 260; razem 369 360 / 241 900 / 380 040. Marża plan 24,0 % → prognoza 21,8 %; aneks 64 h × 175 zł = 11 200 zł → 23,6 %.
  - Płatności: zaliczka 30 % 145 800 (FZ/2026/09/021, zapł. 18 wrz); 40 % 194 400 po instalacji freonowej (FV/2026/11/031, wyst. 9 lis, termin pt 4 gru); 30 % 145 800 po odbiorze (~18 gru).
  - Najbliższe: montaż piętro 3, pokoje 301–308 (pon–śr, ZS-1071, TL+MZ); dostawa sterowników grupowych wt 24 lis (ZK/2026/11/036, Klimatech); narada z hotelem czw 26 lis 10:00.
- **PJ-2026-009** Wentylacja z odzyskiem ciepła — Szkoła Podstawowa nr 4, Rumia; 312 000; odbiory, 92 %, koniec pon 30 lis; marża 22,0 → 23,1 %; PK.
- **PJ-2026-008** Pompy ciepła w 6 domach — Osiedle Leśne Zacisze, Chwaszczyno; 268 800; montaż 3 z 6, 50 %; koniec 22 sty 2027; 25,0 → 25,4 %; TL.
- **PJ-2026-013** Chłodzenie serwerowni, 2 agregaty wody lodowej — Biurowiec Kwadrant, Gdynia; 268 000; przygotowanie 10 %, montaż od pon 7 gru, koniec 12 lut 2027; 23,5 %; PK.
- Zakończony: **PJ-2026-006** Modernizacja maszynowni — Galeria Bałtycka; 154 000; 23 paź; 22,0 → wynik 24,6 %.

## Obiekty (piątek 20 lis 2026)
- 84 obiekty, 312 urządzeń, 1 284 t CO₂e; 3 kontrole po terminie (UR-3107 12 lis, UR-2304 15 lis, UR-1988 17 lis), 21 obiektów z umową.
- **OB-0230 Hotel Oliwski · kuchnia i restauracja**, Opacka 12, 80-338 Gdańsk Oliwa (klient KL-0217, opiekun PD). Instalacja „Chłodnictwo kuchni” (2014): UR-2304 agregat Bitzer R404A 12,5 kg 49,0 t (sn 1408 22 517, karta w CRO; kontrola co 12 mies., ostatnia 15 lis 2025 — szczelna, KS/2025/11/009; termin 15 lis 2026 — po terminie), UR-2305 parownik komory mięsnej (0…+2 °C), UR-2306 parownik komory warzywnej (+4…+6 °C). Instalacja „Klimatyzacja restauracji” (2021, sala 120 m²): UR-2310 i UR-2311 Daikin split 3,5 kW R32 0,95 kg (0,64 t), gwarancja wygasła 3 cze 2026.
- Wizyty: 13 lis ZG-0912 (PD) — presostat HP, +1,2 kg R404A regenerowanego (RW/2026/11/044), kontrola przełożona; 2 cze PR/2026/06/017 (MZ); 15 lis 2025 kontrola szczelności (PD).
- Dostęp: wjazd od ul. Opackiej (rampa — nie blokować 10:30–11:30), klucz do maszynowni w recepcji (całodobowa), kuchnia 6:00–23:00, prace przy komorach najlepiej 14:00–17:00. Na miejscu: Ewa Malinowska (szefowa kuchni, +48 512 408 113), Paweł Grabowski (kierownik techniczny, +48 601 772 905).
- Finanse: obrót 2026 7 420 zł (6 wizyt), należność po terminie 9 860 zł (FV/2026/10/061 i FV/2026/11/012, najstarsza 31 dni). Propozycja umowy ok. 5 400 zł netto/rok.
- Pozostałe obiekty: Galeria Bałtycka · maszynownia (14 urządzeń, 50,1 t, następna kontrola 16 maj 2027), Delikatesy Morskie (3, 38,6 t), Kancelaria Wit (4, 6,7 t), Piekarnia Rogal (2, 17,1 t, kontrola 9 gru), Przychodnia Zdrowie (4, 3,1 t), Biuro Bilans (3, 2,4 t), dom Marka Zielińskiego OB-0511 (montaż 30 lis).

## Katalog (piątek 20 lis 2026, 16:00)
- Liczby: 248 pozycji (Urządzenia 64, Materiały 131, Usługi 41, Dojazd 12); próg marży 22 %, docelowa 25 %.
- Urządzenia (koszt / cena netto / marża): ERGA08EV 14 920 / 19 900 / 25,0 % (ostatni zakup 15 480, PZ/2026/11/019; wcześniej 14 380 w marcu); EHVH08S23E6V 9 840 / 13 350 / 26,3 %; EPRA14DV 21 600 / 28 900 / 25,3 %; Panasonic Aquarea 9 kW (PAN-AQ9) 11 200 / 14 600 / 23,3 %; Daikin Perfera 2,5 kW FTXM25A + RXM25A 2 840 / 3 990 / 28,8 %; 3MXM68A 5 120 / 6 900 / 25,8 % (Klimatech 5 228); agregat Bitzer 4 kW R449A BTZ-LH44 14 300 / 17 900 / 20,1 % (poniżej progu); centrala Klimor 2 000 m³/h CW-2000-R 38 400 / 52 800 / 27,3 %.
- Import **TermoBud_Daikin_2027-01.xlsx** (214 wierszy, wczytany 15:40 przez AW, ważny od 1 sty 2027, rabat 18 %): 187 dopasowanych (151 bez zmian), 33 podwyżki (śr. +5,1 %), 3 obniżki, 18 nowych, 9 do sprawdzenia. Przykłady: EPRA14DV 21 600 → 22 900, cena 28 900 → 30 530; ERGA08EV 14 920 → 15 940, cena 19 900 → 21 250; EHVH08S23E6V 9 840 → 10 380 (cena bez zmian, 22,2 %); FTXM25A + RXM25A 2 840 → 2 990; 3MXM68A 5 120 → 5 310; BRC1HHDW 410 → 438 (cena 590). Wynik: 36 nowych kosztów, 21 cen bez zmian, 12 podniesionych.

## Zakupy (piątek 20 lis 2026, 8:40)
- Dostawcy (fikcyjni): **Chłodpol Gdynia** (czynniki, części chłodnicze; zamówienie do 14:00, dostawa pon 23 lis), **Klimatech Gdańsk** (klimatyzacja; darmowa dostawa od 800 zł), **Termo-Bud Pomorze** DS-007 (pompy ciepła, hydraulika; Gdańsk, Budowlanych 19; handlowiec Kamil Nowicki; przelew 14 dni, darmowa dostawa od 500 zł, rabat 18 % od cennika Daikin). Razem 7 dostawców w rejestrze.
- Zapotrzebowanie (6 pozycji, 3 464,80 zł netto): R404A regenerowany 10,9 kg × 142,00 zł/kg = 1 547,80 (stan 3,1 kg, min 10; Klimatech 149,00; ost. zakup 128,50 PZ/2026/09/014); R32 9 kg × 58,00 = 522,00 (ZS-1045 + min 9 kg; dostępne 2,4 kg); presostat HP P-HP-28 1 × 186,00 (ZG-0912; w drodze 1 w ZK/2026/11/030); pompka skroplin 289,00 (ZG-0923, wizyta wt 24 lis 10:00, MZ); rura Cu 1/4″+3/8″ 20 m 2 × 312,00; grupa bezpieczeństwa 3 bar 2 × 148,00 (ZS-1052).
- W drodze 16 512 zł (ZK/2026/11/030 Klimatech, ZK/2026/11/031 Termo-Bud); zakupy w listopadzie 38 940 zł (październik 21 760 zł).
- **ZK/2026/11/031** (Termo-Bud, dla ZS-1052): szkic śr 18 lis 14:52 z akceptacji, wysłane 15:10 (AW), potwierdzone czw 19 lis 8:05, dostawa pt 20 lis 8:20 (WZ 4471/11). Pozycje: ERGA08EV 15 480,00 (nr seryjny E8 2611 04573), fundament 1000 mm 420,00, podkładki antywibracyjne kpl 270,00 — brak, dosłanie wt 24 lis. Razem 16 170,00 netto / 19 889,10 brutto. Przyjęcie → PZ/2026/11/019, rezerwacja ZS-1052, karta UR-4127.

## Leady i szanse (piątek 13 lis 2026, 9:14)
- Opiekunowie handlowi: **Pascal Kranz (PK)** `#5F636B` i **Agnieszka (AW)**; doradcy techniczni na oględzinach: TL (pompy ciepła), MZ/KN.
- Leady do kontaktu: **Gabinet DentSopot** (dr Karolina Mazur, Monte Cassino 41, Sopot; polecenie Przychodni Zdrowie, e-mail 7:50 → kontakt do 9:50; ~22 tys.); **Joanna Krawczyk** (formularz 8:20, Redłowo, blok 4. p., 64 m², 3 pokoje, montaż w grudniu; multi-split 2,5/2,5/3,5 kW, 14–17 tys. netto; kontakt do 10:20); **Adam Wróbel** (telefon 12 lis 17:40, Chwaszczyno, Leśna 8, dom 180 m², gaz z 2009, ~45 tys.; oddzwonić 10:00, PK).
- Leady w kwalifikacji: **Delikatesy Morskie** — wymiana lodziarki UR-3107 na R290, ~28 tys. (od KN po ZS-1047, AW); **Wspólnota Kasztanowa 7**, Rumia — wentylacja garażu 42 miejsca, ~38 tys., uchwała 24 lis (PK).
- Szanse otwarte (10, 450 020 zł, ważona 219 081 zł): Kwalifikacja — DentSopot 22 000 (AW), Wspólnota 38 000 (PK); Oględziny — Adam Wróbel 45 000, OG-0418 pon 16 lis 15:00 (TL), Restauracja Przystań komora 6 m² 31 000, wt 17 lis 9:00 (KN); Wycena — Piekarnia Rogal szafa mroźnicza 18 400 (2 dni po terminie, AW), Biuro Bilans 2 sale 9 800 (dziś, AW); Oferta — **Marek Zieliński OF-2026-118 44 020** (otwarta 3×, ost. czw 12 lis 21:14, TL), Kancelaria Wit OF-2026-114 27 300 (nieotwarta 4 dni, PK), Galeria Bałtycka VRV sala eventowa OF-2026-109 86 500 (zarząd 30 lis, PK); Negocjacje — Przychodnia Zdrowie 2 centrale OF-2026-102 v3 128 000 (prośba o rabat 5 %, marża po rabacie 24,1 %, PK).
- **SZ-0179** Marek Zieliński: lead z formularza wt 3 lis 19:42 (kocioł węglowy z 2006 r.), kwalifikacja PK śr 4 lis 9:10, OG-0412 wt 10 lis (TL), OF-2026-118 v1 śr 11 lis 16:20 (3 warianty), otwarcia 3× do czw 12 lis 21:14, telefon pt 13 lis 11:30 (hałas, bufor), v2 pon 16 lis 10:05 (bufor 50 l w A +2 380 zł, terminy), akceptacja śr 18 lis 14:51 → wygrana; cykl 15 dni (średnio dla pomp 23).
- Wygrane w listopadzie: 6 / 214 300 zł (październik 5 / 168 900 zł); przegrane 3 (cena 2, termin 1). Średni pierwszy kontakt w listopadzie: 1 h 25 min.

## Przeglądy i umowy
- **UM-2026-031** Galeria Bałtycka sp. z o.o. (KL-0142, Grunwaldzka 141, Gdańsk): 1 lut 2026 – 31 sty 2027, ryczałt 2 400 zł/mies., reakcja 4 h 7:00–20:00, poza ryczałtem 140 zł/h, części −10 %. 14 urządzeń (VRV 6 jedn. R410A 24 kg = 50,1 t → co 6 mies.; wytwornica wody lodowej; 3 centrale; 4 klimatyzatory w rozdzielni). Rentowność 51 %, SLA 7/7. Wygasa za 73 dni (od 19 lis) → propozycja aneksu +4 %.
- **UR-2871** Piekarnia Rogal (Chylońska 70, Gdynia) — komora mroźnicza R452A 8 kg = 17,1 t → kontrola co 12 mies., ostatnia 9 gru 2025, termin 9 gru 2026 (środa). Proponowane połączenie z przeglądem witryn w Delikatesach Morskich (UM-2025-014, 2 km dalej), technik KN.
- Po terminie: UR-3107 Delikatesy Morskie (12 lis), UR-2304 Hotel Oliwski agregat Bitzer R404A 12,5 kg = 49,0 t (15 lis), UR-1988 Kancelaria Wit serwerownia R410A 3,2 kg = 6,7 t (17 lis).

## Raport październik 2026
- Przychód 172 400 zł (wrz 171 300): serwis 61 200 (marża 42 %), montaże klimatyzacji 54 800 (14 % — poniżej progu 22 %, ceny Gree +9 % od 1 wrz), pompy ciepła 29 600 (27 %), umowy 26 800 (52 %). Marża brutto 32,1 % (wrz 33,9 %). Zlecenia zamknięte 68.
- Technicy: TL 96 % / 52 300 zł / 94 % za 1. razem / 1 powrót; MZ 90 % / 44 100 / 91 % / 2; KN 88 % / 41 800 / 96 % / 0; PD 78 % (urlop 2 dni) / 34 200 / 83 % / 4 powroty (3 przy agregatach Bitzer).
- Należności 58 940 zł: przed terminem 35 460, 1–30 dni 14 820, 31–60 dni 6 240, > 60 dni 2 420 (po terminie razem 23 480). Najwięksi: Hotel Oliwski 9 860 (31 dni), Kancelaria Wit 4 960 (18 dni), Restauracja Port 2 420 (74 dni).
