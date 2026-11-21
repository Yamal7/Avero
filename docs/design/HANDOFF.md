# Avero — przekazanie projektu interfejsu

Avero to program FSM / CRM / ERP dla firmy HVACR (serwis, montaż chłodnictwa, klimatyzacji i pomp ciepła). Właściciel: Pascal Kranz. Interfejs projektowany jest w osobnym czacie Claude (makiety), kod pisze Claude Code w tym repozytorium.

**To repozytorium jest wspólnym źródłem wiedzy dla obu stron.** Projekt zapisuje tu opisy ekranów i decyzje; Claude Code zapisuje postęp w `docs/STATUS.md`.

## Gdzie co jest

| Ścieżka | Zawartość |
|---|---|
| `docs/design/HANDOFF.md` | ten plik: stan projektu, mapa modułów, sposób pracy |
| `docs/design/DECISIONS.md` | dziennik decyzji z datami — czytaj przed każdą zmianą UI |
| `docs/design/tokens.css` | tokeny (kolory, promienie, odstępy, typografia, kolory osób, paleta wykresów) |
| `docs/design/data-scenario.md` | spójne dane przykładowe (klienci, urządzenia, dokumenty, kwoty) |
| `docs/design/screens/*.md` | opis każdego modułu: układ, stany, dane, interakcje |
| `.claude/skills/precision-ui/SKILL.md` | zasady stylu Precision UI (styl Linear) — ładuj przy każdym zadaniu UI |
| `design/canvas/*.dc.html` | makiety HTML (kopia kanwy projektowej); otwierają się w przeglądarce z `support.js` kanwy, ale da się je czytać jako kod |
| `design/tools/` | skrypty, które generują makiety (patrz `design/README.md`) |
| `docs/STATUS.md` | prowadzi Claude Code: co zaimplementowano, odstępstwa, pytania do projektu |

Kanwa projektowa (claude.ai, prywatna, wymaga zalogowania): https://claude.ai/artifact/Y4pGZr32HdJb4kp36kZx4C
Dokument wytycznych Precision UI (claude.ai, prywatny): https://claude.ai/artifact/7cnC7v2WG1evNbVnS23ost
Claude Code nie otworzy tych linków — wszystko, co potrzebne do kodu, jest w tym repozytorium.

## Rama aplikacji (wspólna dla wszystkich ekranów desktop)

- Górny pasek 44 px na tle `--bg-shell`: przełącznik firmy, szukaj (⌘K), nowy, skrzynka, kalendarz, **karty otwartych rekordów** (jak w przeglądarce: Mój dzień, Zadania, Magazyn, Firmy, ZS-1047…), stan synchronizacji, powiadomienia, awatar.
- Panel boczny 232 px na tym samym tle, zwijany. Sekcje (zwijane): Skrzynka, Mój dzień · **Sprzedaż**: Leady, Szanse, Oferty · **Klienci**: Firmy i osoby, Obiekty, Urządzenia, Umowy · **Serwis**: Zgłoszenia, Zlecenia, Planowanie, Przeglądy · **Projekty**: Projekty, Zadania · **Finanse i magazyn**: Faktury, Katalog, Magazyn, Zakupy · na dole Raporty, Ustawienia.
- Panel główny osadzony w ramie: odstęp 8 px, promień 12 px, tło `--bg-surface`.
- Ekran rekordu: pasek 44 px (okruszki, ID mono, akcje ikonowe) → tytuł 18 px + linia meta z ikonami → kapsułki właściwości → treść (max ~960 px) + prawy panel szczegółów 340 px z cienką linią `--edge`.

## Moduły — stan projektu (20 lis 2026)

| Moduł | Plik opisu | Plansze na kanwie |
|---|---|---|
| Mój dzień (pulpit biura) | `screens/01-moj-dzien.md` | Mój dzień · jasny / ciemny, Paleta ⌘K |
| Zadania (widok kolekcji) | `screens/02-zadania.md` | Zadania · lista / tablica / opcje widoku |
| Magazyn | `screens/03-magazyn.md` | Magazyn · tabela / wydanie RW / w samochodach |
| Firmy i osoby, karta firmy, urządzenia, F-gaz | `screens/04-klienci.md` | Firmy, Osoby, Karta firmy, Urządzenia, Historia F-gaz |
| Protokoły i telefon technika | `screens/05-protokoly.md` | Szablony, Telefon · kontrola / montaż / uruchomienie pompy |
| Zlecenie serwisowe | `screens/06-zlecenie.md` | Zlecenie ZS-1047 |
| Planowanie i mapa | `screens/07-planowanie.md` | Planowanie · dzień / przeciąganie / mapa (1920 px) |
| Oferty (kreator + widok klienta + akceptacja) | `screens/08-oferty.md` | Oferta · pozycje / warunki / wysyłka / po akceptacji; Klient · oferta, podpis, zaliczka, gotowe |
| Zlecenie montażu | `screens/09-zlecenie-montazu.md` | Zlecenie montażu ZS-1052 |
| Faktura końcowa | `screens/10-faktura.md` | Faktura końcowa FV/2026/12/003; Klient · po montażu |
| Przeglądy i umowy serwisowe | `screens/11-przeglady-umowy.md` | Przeglądy, Umowa serwisowa UM-2026-031, Klient · wybór terminu |
| Raporty | `screens/12-raporty.md`, `screens/18-wlasne-tabele.md` | Raporty · przegląd miesiąca, Raporty · z własnej tabeli Przetargi |
| Projekty | `screens/20-projekty.md` | Projekty · lista, Projekty · oś czasu, Projekt PJ-2026-011 · Hotel Bryza (jasny / ciemny) |
| Obiekty | `screens/19-obiekty.md` | Obiekty · lista, Obiekt OB-0230 · Hotel Oliwski (jasny / ciemny) |
| Warstwa elastyczna (własne tabele) | `screens/18-wlasne-tabele.md` | Przetargi · lista i panel, Ustawienia tabeli · Pola / Widoki / Panel boczny / Akcje / Uprawnienia, Import z pliku, Nowa tabela (jasny / ciemny) |
| Katalog | `screens/17-katalog.md` | Katalog · urządzenia i pozycja ERGA08EV, Import cennika · Termo-Bud Daikin 2027 (jasny / ciemny) |
| Dostawcy i Cenniki (zakładki Zakupów) | `screens/21-dostawcy-cenniki.md` | Zakupy · dostawcy (panel Termo-Bud), Zakupy · cenniki (panel Chłodpol, historia R404A) (jasny / ciemny) |
| Faktury: należności, do wystawienia, wszystkie, zaliczki | `screens/23-faktury-naleznosci.md` | Faktury · należności (panel Hotel Oliwski), do wystawienia (panel ZS-1047), wszystkie (panel miesiąca, KSeF, eksport), zaliczki (panel PJ-2026-013) (jasny / ciemny) |
| Sprawdzian rdzenia (firma elektryczna bez pakietu) | `screens/25-sprawdzian-rdzenia.md` | Sprawdzian · Mój dzień, urządzenie UR-0318, zlecenie ZL-0734 (jasny / ciemny) — makiety przeglądowe z adnotacjami |
| Portal klienta | `screens/24-portal-klienta.md` | Klient · portal Kancelaria Wit (`Klient-portal.dc.html`) |
| Reklamacje i gwarancje | `screens/22-reklamacje.md` | Reklamacje · od klientów (panel RK-2026-011), do dostawców (panel Klimatech), gwarancje kończą się (panel UR-2655), Reklamacja RK-2026-017 (jasny / ciemny) |
| Zakupy | `screens/16-zakupy.md` | Zakupy · zapotrzebowanie, Zamówienie ZK/2026/11/031 · przyjęcie dostawy (jasny / ciemny) |
| Leady i Szanse | `screens/15-leady-szanse.md` | Leady · lista i podgląd, Szanse · tablica etapów, Szansa SZ-0179 · rekord (jasny / ciemny) |
| Zgłoszenia i Skrzynka | `screens/14-zgloszenia-skrzynka.md` | Zgłoszenia · lista i podgląd ZG-0920, Skrzynka · wątek Hotel Oliwski (jasny / ciemny) |
| Ustawienia (11 zakładek) | `screens/13-ustawienia.md` | Ustawienia · profil firmy, dokumenty, katalog i marże, pola własne, moduły i pakiety, użytkownicy, technicy i busy, integracje, mój profil, powiadomienia, wygląd |

Każdy ekran desktop istnieje w motywie jasnym i ciemnym.

## Sposób pracy między czatem projektowym a Claude Code

1. Czat projektowy po każdym zaakceptowanym ekranie: aktualizuje `screens/*.md`, dopisuje decyzje do `DECISIONS.md`, odświeża `design/canvas/` — na gałęzi `design/*`, przez pull request.
2. Claude Code przed pracą nad UI czyta `HANDOFF.md`, `DECISIONS.md` i opis modułu; ładuje skill `precision-ui`; używa wyłącznie tokenów z `tokens.css`.
3. Claude Code po każdej zmianie dopisuje do `docs/STATUS.md`: co zaimplementowano, co świadomie odbiega od makiety (i dlaczego), pytania do projektu.
4. Czat projektowy przed każdym nowym modułem czyta `docs/STATUS.md` i ostatnie commity.
5. Odświeżony ekran projektuje się **obok** starego (do porównania); stary usuwa właściciel po akceptacji.

## Kierunek produktu

**Mapa warstw (rdzeń / pakiet HVACR / konfiguracja) i zasady dla kodu: `LAYERS.md` — czytaj przed projektowaniem bazy danych i struktury modułów.**

Avero ma być sprzedawany innym firmom: wspólny rdzeń + pakiety branżowe (HVACR pierwszy) + warstwa elastyczna (własne pola, konfigurowalny panel boczny, własne tabele). Szczegóły i konsekwencje dla kodu: `DECISIONS.md`, wpis „Kierunek produktu” z 20 lis 2026.
