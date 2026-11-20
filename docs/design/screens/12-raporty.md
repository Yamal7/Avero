# Raporty

Makieta: ekran `raporty`. Wykresy wg skilla dataviz: jedna oś, paleta `--series-1…4` w stałej kolejności, legenda + etykiety bezpośrednie, podpowiedzi po najechaniu, widok tabeli.

- Pasek: zapisane raporty (Przegląd miesiąca, Marża zleceń, Technicy, Umowy, Należności, F-gaz), okres (miesiąc, porównanie z poprzednim), eksport do Excela.
- **4 fakty** (bloki `--bg-raised`, nie kafelki z ikonami): wartość, mały wykres 12 mies., zmiana m/m (kolor = dobrze/źle).
- **Przychód wg rodzaju prac**: słupki skumulowane 12 mies., odstęp 2 px między segmentami, zaokrąglona góra, etykiety przy ostatnim słupku.
- **Avero zauważa**: 3 obserwacje z jedną akcją.
- **Marża wg rodzaju prac**: tabela z paskiem marży i znacznikiem progu 22 %, poniżej progu na czerwono, zmiana w pp.
- **Należności**: pasek wieku (przed terminem / 1–30 / 31–60 / > 60), najwięksi dłużnicy.
- **Technicy**: wykorzystanie (pasek w kolorze osoby), przychód, zł/h, usunięte przy 1. wizycie, powroty, dojazd; słabe wyniki na czerwono; kapsułka „urlop” obniża dostępne godziny.
- Pozostałe zakładki raportów — do zaprojektowania jako rozwinięcia sekcji.
