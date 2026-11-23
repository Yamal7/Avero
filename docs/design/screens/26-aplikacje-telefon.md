# Aplikacje na telefon — technik i klient (wzór: Linear mobile)

Makiety (390 px): `Telefon-dzien.dc.html` (+ `-ciemny`), `Telefon-menu.dc.html`, `Telefon-wizyta.dc.html`, `Klient-telefon.dc.html` (+ `-ciemny`). Generator: `design/tools/telefon.py`. Protokoły pomiarowe bez zmian: `Technik*.dc.html` (`05-protokoly.md`).

## Wzór (wspólny)
- **Duży tytuł** 30 px u góry ekranu, pod nim jedna linia kontekstu (data, liczba wizyt / umowa). Po prawej okrągły przycisk 44 px (Szukaj) albo awatar.
- **Kapsułki zakresu** pod tytułem (Dziś / Jutro / Tydzień) — 40 px, wybrana na `--bg-subtle`.
- **Listy w jednej linii, 56 px**: priorytet (paski jak w Linear, „!” na pomarańczowym = pilne) → **ikona stanu** → tytuł 16 px → logo firmy 22 px → godzina / termin po prawej. Ikony stanu: kreskowane koło = zaplanowana, puste = do zrobienia, połówka (`--warning`) = w trakcie, pełne z ptaszkiem (`--accent`) = zrobione, czerwone z „!” = wstrzymana / brak podpisu. Szczegóły w podpowiedzi i po wejściu.
- **Grupy** jak w Linear: nagłówek 14 px szary z liczbą, „+” po prawej tam, gdzie można dodać (Teraz / Dziś / Do protokołu / Zrobione).
- **Pływający pasek kart** — pigułka nad treścią (rozmycie tła, `--shadow-pop`), 4 ikony 24 px bez podpisów, aktywna na `--bg-subtle`; obok **osobny okrągły przycisk 68 px** z główną akcją. Długie przytrzymanie paska otwiera **menu** (arkusz 30 px promienia: nazwa firmy z przełącznikiem, wszystkie sekcje z licznikami).
- Oba motywy przez tokeny; teksty 15–17 px, cele dotyku ≥ 44 px, bez poziomego przewijania.

## Technik
- Karty: Mój dzień · Zlecenia · Magazyn auta · Skrzynka; przycisk: szybkie zdjęcie / zgłoszenie z terenu.
- **Mój dzień**: Teraz (wizyta w trakcie), Dziś, Do protokołu (np. brak podpisu klienta — czerwony stan), Zrobione (załadunek auta).
- **Wizyta** jak zadanie w Linear: pasek (wstecz, numer w mono, więcej), firma z logo, tytuł 26 px, opis dla technika; **właściwości** w wierszach 48 px z ikoną (Stan, Priorytet, Adres z „Nawiguj”, Kontakt z „Zadzwoń”, Urządzenie, Podstawa); **Kroki** jako podzadania z ikonami stanu (zrobione przekreślone, z godziną); **Części** (z auta); **Aktywność**. Na dole: pole „Notatka do wizyty…” z dyktowaniem, aparat, główny przycisk „Zakończ i podpisz” (otwiera protokół / podpis).
- Kody do drzwi i alarmów nie są pokazywane ani przechowywane.

## Klient
- Karty: Przegląd · Urządzenia · Faktury · Zgłoszenia; przycisk: **Zgłoś usterkę**.
- Przegląd: Teraz (wizyta, decyzje z akcją, oferta), Zgłoszenia (stan dla klienta), Urządzenia (stan: po terminie / w naprawie / sprawny), Faktury (do zapłaty).
- Klient nigdy nie widzi marży, cen zakupu, dostępności ani zdjęć wewnętrznych.

## Klient — dwa kierunki do wyboru (23 lis 2026, czeka na decyzję właściciela)
Wersja „jak Linear” (`Klient-telefon`) za bardzo przypomina narzędzie do pracy. Klient otwiera aplikację kilka razy w roku i chce wiedzieć: „czy wszystko w porządku i czy mam coś zrobić?”. Pasek na dole zostaje (standard iOS), zmienia się treść. Obie wersje w barwach firmy instalatorskiej (logo, nazwa, kolor marki z Ustawień — white-label; tu Kranz HVACR, `--brand`). Pasek: Start · Urządzenia · Dokumenty (z podpisami).
- **A „Co teraz”** (`Klient-A-co-teraz`, + ciemny): prawie pusty ekran, jedna sprawa dużym tekstem z przyciskiem głównym i „Później”; niżej „Poza tym” w zdaniach (technik dziś o 9:00, oferta czeka, faktury opłacone). Nad paskiem stałe pole „Opisz usterkę…” z dyktowaniem i aparatem.
- **B „Moje urządzenia”** (`Klient-B-urzadzenia`, `Klient-B-urzadzenie`, + ciemne): urządzenia z **pierścieniem czasu** do przeglądu / kontroli F-gaz (zielony daleko, pomarańczowy w naprawie / blisko, czerwony po terminie, w środku liczba dni). Główna akcja: **skan naklejki QR** na jednostce → karta urządzenia z pierścieniem, danymi, „Wybierz termin kontroli” i „Zgłoś usterkę tego urządzenia”.
- Propozycja do decyzji: Start z kierunku A + zakładka Urządzenia z kierunku B.
