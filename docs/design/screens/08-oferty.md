# Oferty: kreator, widok klienta, akceptacja online

Makiety: ekran `oferta` z ustawieniem `krok`: pozycje / warunki / wysyłka / zaakceptowana. Widok klienta: `Klient-oferta.dc.html` (desktop), `Klient-oferta-telefon.dc.html`, akceptacja: `Klient-akceptacja-podpis|platnosc|gotowe.dc.html`.

## Kreator (biuro) — jedna strona z paskiem kroków
Klient ✓ → Oględziny ✓ → Warianty i pozycje → Warunki → Wysyłka. Oferta powstaje z oględzin / zadania i przejmuje klienta, obciążenie cieplne i zdjęcia.

**Krok 3 — Warianty i pozycje**
- Warianty jako karty obok siebie (radio): litera, nazwa, kapsułki (moc, SCOP, pokrycie zapotrzebowania), cena netto; polecany z gwiazdką; ostrzeżenie ikoną (np. brak bufora). Karta „+” z przerywanym obrysem.
- Podpowiedź Avero (decyzja, pełne zdanie) z akcją „Dodaj · 1 980 zł”.
- Pozycje w grupach (Urządzenia / Materiały / Robocizna) z kolorową ikoną, kapsułką marży i sumą. Wiersz: uchwyt, nazwa + kod mono, **dostępność** (Magazyn N / Bus TL / Zamów · N dni), ilość, cena, wartość. Pozycja opcjonalna z kapsułką „Opcja”.
- Prawy panel: podsumowanie netto / VAT 8 % (powód w podpowiedzi) / brutto, pasek marży ze znacznikiem progu 22 %, warunki, klient, załączniki, aktywność.

**Krok 4 — Warunki**: model płatności (segment: po montażu / zaliczka i reszta / etapy), zaliczka %, termin, formy płatności; harmonogram płatności; terminy montażu jako karty z awatarami ekipy i „Sprzęt na czas”; przełącznik „Klient wybiera termin”; gwarancja i umowa serwisowa jako opcja; dokumenty (zdjęcia z oględzin z kłódką — tylko wewnętrznie); wiadomość w ofercie.

**Krok 5 — Wysyłka**: sprawdzenie (4 z 5 + decyzja), odbiorca (e-mail, SMS, DW opiekun), wiadomość z linkiem wygasającym z ofertą, akceptacja online (jeden / kilka wariantów, podpis, zaliczka online, wybór terminu), przypomnienia (nieotwarta 3 dni → SMS, bez decyzji 5 dni → zadanie „zadzwoń” dla opiekuna, 2 dni przed wygaśnięciem → e-mail). Po wysłaniu zmiana tworzy nową wersję.

**Po akceptacji**: status „Zaakceptowana”, karta z podpisem i kapsułkami (zaliczka opłacona, termin, zgoda na wcześniejszy montaż, umowa PDF); „Avero wykonał” (zlecenie, rezerwacja, zamówienie u dystrybutora, planowanie, faktura zaliczkowa, zamknięcie pozostałych wariantów) z godzinami i numerami dokumentów; „Do decyzji”; „Dalej”.

## Widok klienta (link)
- Spokojniejsza typografia (14 px), te same kolory i zaokrąglenia; marka firmy w nagłówku.
- Powitanie, adres, zapotrzebowanie; karta doradcy z rekomendacją i telefonem.
- 1 Wybierz wariant (wiersze z kapsułkami parametrów, ceny **brutto**, „Polecamy”), 2 Co zawiera wariant (bez cen zakupu i marży), 3 Dodatki (checkboxy, polecane zaznaczone), 4 Termin montażu, Warunki i dokumenty.
- Desktop: prawy panel „Twój wybór” (sticky) z sumą, zaliczką, „Akceptuję i płacę zaliczkę”, „Poproś o zmianę”. Telefon: pasek z sumą i przyciskiem przyklejony do dołu.

## Akceptacja na telefonie (3 kroki z paskiem postępu)
1. Podpis: podsumowanie wyboru, zgoda na ofertę i OWU, zgoda na montaż przed upływem 14 dni (tylko gdy dotyczy), pole podpisu palcem + „Wyczyść”.
2. Zaliczka: kwota, metody z logo (BLIK z polem na 6 cyfr, szybki przelew P24, karta Visa/MC, Apple Pay, Google Pay), „Płatność obsługuje Przelewy24”.
3. Gotowe: potwierdzenie, oś kolejnych kroków, „Do kalendarza”, „Umowa PDF”, kontakt do doradcy.
