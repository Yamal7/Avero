---
name: "precision-ui"
description: "Projektowanie i kodowanie UI programów użytkownika w jego stylu Precision UI (Linear-style): ekrany, makiety, komponenty, przeglądy designu. Używaj przy każdym zadaniu UI."
---

# Precision UI — projektowanie bez wyglądu „z szablonu AI”

Źródło prawdy: dokument „Precision UI — wytyczne stylu projektowania”
https://claude.ai/artifact/7cnC7v2WG1evNbVnS23ost

Na początku zadania przeczytaj ten dokument narzędziami Claude Docs, bo mógł się zmienić od czasu zapisania tego skilla. Jeśli dokument i ten skill się różnią, wygrywa dokument. Jeśli nie da się go odczytać, pracuj na skrócie poniżej.

Domyślny język interfejsu i komunikacji: polski.

## 1. Zanim cokolwiek narysujesz

Ustal (z rozmowy, pamięci lub krótkim pytaniem, maks. jedno):
- **Produkt i domena**: co to za program (CRM, ERP, FSM, serwis HVACR itd.), kto go używa i do czego.
- **Prawdziwe dane**: realne rekordy z branży (np. zlecenia serwisowe, klienci, urządzenia, czynniki chłodnicze, ciśnienia, terminy przeglądów F-gazowych). Nigdy lorem ipsum, „John Doe”, „Acme Inc.”.
- **Znak rozpoznawczy**: jeden charakterystyczny detal tego produktu (kolor akcentu, sposób pokazywania statusów, nietypowa nawigacja, sposób prezentacji danych). Jeśli nie ma go jeszcze, zaproponuj 2–3 konkretne opcje i wybierz jedną.
- **Referencje**: jeśli użytkownik dał zrzuty dobrych i złych przykładów, przeanalizuj je najpierw i nazwij, co z nich bierzesz, a czego unikasz.

## 2. Twarde zasady (skrót dokumentu)

- Treść przed chromem. Interfejs niemal monochromatyczny, neutralne lekko ciepłe szarości, nigdy #000; sidebar i nawigacja przygaszone względem treści.
- JEDEN akcent, tylko akcja główna / zaznaczenie / fokus; w 1–3 miejscach na ekranie.
- Kolory semantyczne tylko dla statusów: kropka lub ikona + tekst, nigdy samo tło wiersza. Status = kształt ikony + kolor fazy (jak w Linear).
- Typografia: bazowo 13 px, wagi tylko 400/500/600, nagłówki letter-spacing −0.01…−0.02 em, liczby `tabular-nums` wyrównane do prawej, bez wersalików i kursywy.
- Siatka 4 px (4, 8, 12, 16, 24, 32, 48, 64). Kontrolki 32 px, wiersze 36 px, sidebar ~232 px, panel szczegółów 400–480 px.
- Wypełnienie przed linią, linia przed cieniem: przyciski, pola, karty i bloki oddziela tło (bg-subtle dla przycisków drugorzędnych i kapsułek, bg-raised dla pól i kart), nie ramka. Linia tylko w kolorze `edge` (ok. 7% krycia) dla separatorów w tabelach, krawędzi panelu treści i warstw pływających. Ramka zostaje tylko gdy niesie znaczenie: pole wyboru, pole poza normą (warning), wybrana opcja, miejsce do dodania (przerywana), tryb zwiększonego kontrastu (border-strong). Fokus pola: wewnętrzny pierścień akcentu 1,5 px. Cień tylko dla warstw pływających (menu, popover, modal, na telefonie też dolny pasek i pole kompozycji).
- Promień zależy od wysokości (ok. 30%), tak samo na komputerze i telefonie: 6 px (do 20 px: checkbox, badge, kbd), 8 px (24–28 px: sidebar, karty okna, małe przyciski), 10 px (32–40 px: przyciski, pola, wiersze), 12 px (karty, bloki), 14 px (popovery, widgety, modale, panel treści). Telefon: pola 14 px, przyciski i opcje 16 px, karty 24 px. Pełna kapsułka dla awatarów, kropek statusu, kapsułek właściwości (status, priorytet, osoba, etykieta), przełączników widoku, okrągłych przycisków z ikoną i pływających pasków.
- Ikony informacyjne: małe (12–16 px), często różnokolorowe ikony na szarej, monochromatycznej bazie pomagają szybciej znaleźć informację. Kolor ikony niesie znaczenie (status, typ, czynnik, osoba, termin), nie dekoruje; baza kolorystyczna programu się nie zmienia, a ikony jej nie dominują. Kolory techników/osób są stałe w całym programie (awatar, blok w planie, trasa na mapie).
- Skracanie treści: ikona → kapsułka → karta podglądu. Informację pokazuj najkrócej, jak się da bez utraty sensu: (1) sama ikona, gdy jej znaczenie jest oczywiste z kontekstu (status, priorytet, „gotowe”, ostrzeżenie), z podpowiedzią po najechaniu; (2) kapsułka = ikona + 1–2 słowa lub liczba (np. „R404A 5,4 kg”, „21,2 t”, „PDF dla klienta”, „Zapisze do: RW · F-gaz · CRO”); (3) pełne szczegóły w karcie podglądu po najechaniu / przytrzymaniu (hover card, tooltip). Pełne zdania na ekranie tylko tam, gdzie użytkownik podejmuje decyzję (ostrzeżenie, potwierdzenie, sugestia systemu) — wyjaśnienia typu „Widoczne, bo…”, „Trafi do…”, normy, daty kalibracji idą do ikony „i” lub podpowiedzi. Etykiety nad polami zastępuj ikoną w polu, gdy pole jest jednoznaczne (etykieta zostaje dla czytników ekranu). Drugą linię tekstu w wierszu listy zamieniaj na kapsułki po prawej.
- Klawiatura pierwszorzędna: ⌘K, C, /, J/K, Enter, Esc, X, G+litera, ?. Skrót przy każdej akcji.
- Ruch 120–200 ms, tylko opacity/transform, `cubic-bezier(0.2,0,0,1)`, szanuj `prefers-reduced-motion`.
- Motyw jasny i ciemny od pierwszego dnia, wyłącznie przez tokeny.
- Każdy komponent ma stany: domyślny, hover, aktywny, fokus, wyłączony, ładowanie (skeleton), pusty, błąd.
- Biblioteki tylko z listy: Radix UI lub React Aria, Tailwind v4 wyłącznie z tokenami (blok `@theme`, domyślne skale wyłączone, bez wartości dowolnych), cmdk, Motion, Sonner, Lucide lub Phosphor. shadcn/ui tylko jako punkt startu, zawsze przestylowany. Nowej biblioteki nie dodajesz bez zgody.

### Tokeny (jasny / ciemny)

Aktualne wartości są zawsze w dokumencie (sekcje Kolor i Tokeny CSS). Poniższy blok odpowiada stanowi z 16 listopada 2026.

```css
:root {
  --bg-app:#FBFBFA; --bg-surface:#FFFFFF; --bg-sidebar:#F5F4F2; --bg-subtle:#EDECE9; --bg-raised:#F4F3F0;
  --material:rgba(251,251,250,.78); --edge:rgba(27,26,25,.07);
  --border:#E7E6E3; --border-strong:#D6D4D0;
  --text-primary:#1B1A19; --text-secondary:#63605B; --text-tertiary:#9C9893;
  --accent:#5E6AD2; --success:#2F9E5B; --warning:#C98A12; --danger:#D6453D;
  --st-progress:#B38600; --st-blocked:#D2691E;
  --font-sans:"Geist",system-ui,sans-serif; --font-mono:"Geist Mono",ui-monospace,monospace;
  --text-micro:11px; --text-small:12px; --text-body:13px; --text-heading:15px; --text-title:18px; --text-display:24px;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-6:24px; --space-8:32px; --space-12:48px; --space-16:64px;
  --radius-xs:6px; --radius-sm:8px; --radius-md:10px; --radius-lg:12px; --radius-xl:14px; --radius-card-mobile:24px;
  --shadow-pop:0 4px 16px rgba(0,0,0,.08); --shadow-modal:0 16px 48px rgba(0,0,0,.16);
  --ease:cubic-bezier(0.2,0,0,1); --dur-fast:120ms; --dur-base:180ms;
  --control-h:32px; --row-h:36px; --sidebar-w:232px;
}
[data-theme="dark"] {
  --bg-app:#0F0F0E; --bg-surface:#171716; --bg-sidebar:#0B0B0A; --bg-subtle:#1F1E1D; --bg-raised:#232220;
  --material:rgba(35,34,32,.72); --edge:rgba(255,255,255,.07);
  --border:#282725; --border-strong:#363532;
  --text-primary:#EEEDEB; --text-secondary:#9C9893; --text-tertiary:#64615C;
  --accent:#7C85E0; --success:#4CC27A; --warning:#E0A63A; --danger:#EF6A62;
  --st-progress:#E2B93B; --st-blocked:#F08A3E;
  --shadow-pop:0 4px 16px rgba(0,0,0,.4); --shadow-modal:0 16px 48px rgba(0,0,0,.6);
}
```

Domyślny zestaw: font Geist + Geist Mono, ikony Phosphor Regular. Inter, JetBrains Mono i Lucide to tylko zapas (gdy projekt ma powód). Akcent i font można zmienić per produkt (np. akcent jako znak rozpoznawczy, IBM Plex Sans jako alternatywa), ale zawsze jeden akcent i kontrast tekstu na nim min. 4.5:1.

## 3. Lista anty-szablonowa (sprawdzaj aktywnie)

Te elementy zdradzają „UI z AI”. Nie używaj ich, chyba że użytkownik wprost poprosi:
- gradienty (zwłaszcza fiolet–niebieski), świecące obramowania, szkło lub rozmycie na tle sekcji, kart treści i tabel (materiał z rozmyciem wolno tylko na warstwach pływających na telefonie, bez refrakcji, z wersją bez przezroczystości);
- karty z miękkim cieniem jako główny element układu (karta to wypełnienie tłem, bez cienia i bez ramki; promień 12–14 px na komputerze, 24 px na telefonie);
- ramka 1 px wokół każdego przycisku, pola i karty (domyślne `border` z shadcn/Tailwind);
- siatka identycznych „kafelków KPI” z ikoną w kolorowym kółku na górze dashboardu;
- hero z wielkim nagłówkiem i podtytułem w aplikacji roboczej;
- emoji, wykrzykniki, frazy typu „Welcome back! 👋”, „Oops! Something went wrong”, „Get started”, „Unlock the power of…”;
- kapsułki jako główne przyciski CTA i badge we wszystkich kolorach tęczy (kapsułki właściwości, przełączniki widoku, przyciski z ikoną i pływające paski są dozwolone);
- niezmienione style shadcn (domyślny `slate`/`zinc`, `rounded-lg shadow-sm` wszędzie), domyślna paleta Tailwind (`indigo-500`, `gray-100`);
- zestaw Inter + Lucide jako odruchowy wybór (domyślnie Geist + Phosphor);
- ikony „dla ozdoby” (bez znaczenia, ten sam kolor i kształt wszędzie) — ikony informacyjne z sekcji 2 są pożądane;
- długie opisy, podpowiedzi i drugie linie tekstu tam, gdzie wystarczy ikona lub kapsułka z podpowiedzią;
- spinner na cały ekran, ilustracje w pustych stanach;
- sztuczne dane: „John Doe”, „Acme Corp”, okrągłe liczby (100, 1 000, 50%).

Wyróżnik budujesz detalem, nie dekoracją: precyzyjne wyrównania, przemyślana gęstość, identyfikatory w mono, dobre puste stany z jedną akcją i skrótem, tooltip z pełną datą, spójny własny ton mikrocopy.

## 4. Proces pracy

1. **Kierunki**: przy nowym ekranie lub produkcie najpierw 2–3 wyraźnie różne kierunki (różnią się układem / nawigacją / prezentacją danych, nie tylko kolorem). Użytkownik wybiera, potem dopiero szlifujesz.
2. **Forma wyniku**:
   - makieta / projekt ekranu do oceny i edycji → artefakt typu Design (jeśli dostępny);
   - projekt w Figmie → tylko gdy użytkownik o to prosi; wtedy przez konektor Figma;
   - implementacja → kod React + Tailwind v4 (tokeny z `docs/design/tokens.css` w bloku `@theme`, domyślne skale wyłączone, bez `theme.extend` i bez wartości dowolnych typu `w-[13px]`) + biblioteki z listy.
3. **Odświeżanie istniejących ekranów**: nową wersję umieść obok starej, żeby użytkownik mógł porównać; starą usuwa on sam po akceptacji (chyba że poprosi, by usunąć od razu).
4. **Szlif**: dopisz wszystkie stany komponentów, skróty klawiszowe, motyw ciemny, puste stany, błędy, ładowanie.
5. **Mikrocopy**: czasownik + obiekt („Utwórz zlecenie”), wielka litera tylko na początku, błąd mówi co się stało i co zrobić, daty względne z pełną datą w tooltipie.

## 5. Samoprzegląd przed oddaniem (obowiązkowy)

Obejrzyj wynik (zrzut ekranu lub podgląd), nie tylko kod. Przejdź checklistę:
- [ ] Akcent w maks. 1–3 miejscach i tylko jako akcja / zaznaczenie / fokus.
- [ ] Zero „magicznych” hexów i odstępów; wszystko z tokenów, wielokrotności 4 px.
- [ ] Działa i dobrze wygląda w motywie jasnym i ciemnym.
- [ ] Cały proces przechodzi się klawiaturą, fokus widoczny, akcje są w ⌘K.
- [ ] Są stany: ładowanie (skeleton), pusty, błąd.
- [ ] Kontrast tekstu ≥ 4.5:1, elementów UI ≥ 3:1.
- [ ] Brak cieni poza warstwami pływającymi, brak gradientów i emoji.
- [ ] Przyciski, pola i karty bez ramek (chyba że ramka niesie znaczenie); promienie pasują do wysokości elementu.
- [ ] Informacje skrócone do ikony / kapsułki / karty podglądu; pełne zdania tylko przy decyzjach; kolor ikon niesie znaczenie.
- [ ] Żaden punkt z listy anty-szablonowej (sekcja 3).
- [ ] Znak rozpoznawczy produktu jest widoczny i konsekwentny.
- [ ] Dane są realne i z branży.
- [ ] Pytanie końcowe: „Czy to wygląda jak Precision UI i jak ten konkretny produkt, czy jak domyślny szablon?” Jeśli jak szablon — nazwij 3 najbardziej generyczne elementy i popraw je przed oddaniem.

Oddając pracę, napisz krótko: jaki kierunek wybrano, jaki jest znak rozpoznawczy i co ewentualnie zostało do decyzji.