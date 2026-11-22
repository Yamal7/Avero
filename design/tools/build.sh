#!/usr/bin/env bash
# Przebudowuje Main.dc.html od bazy (stan sprzed modułu ofert) przez wszystkie kolejne moduły.
# Uruchamiaj z katalogu głównego repozytorium: bash design/tools/build.sh
set -euo pipefail
cp design/tools/base/Main.base.html design/canvas/Main.dc.html
python3 design/tools/mojdzien2.py   # porządki: Mój dzień, spójne osoby i firmy w bazie
python3 design/tools/jedna_linia.py # tabele w jednej linii: tokeny ikon, logo firm, karta podglądu
python3 design/tools/oferta.py      # oferta: pozycje, warunki, wysyłka, po akceptacji
python3 design/tools/zm.py          # zlecenie montażu ZS-1052
python3 design/tools/faktura.py     # faktura końcowa
python3 design/tools/przeglady.py   # przeglądy + umowa serwisowa
python3 design/tools/raporty.py     # raporty
python3 design/tools/ustawienia.py  # ustawienia: profil firmy, użytkownicy, integracje
python3 design/tools/ustawienia2.py # ustawienia: dokumenty, katalog, technicy, mój profil, powiadomienia, wygląd
python3 design/tools/ustawienia3.py # ustawienia: pola własne w modułach rdzenia
python3 design/tools/ustawienia4.py # ustawienia: moduły i pakiety
python3 design/tools/zgloszenia.py  # zgłoszenia (lista + podgląd) i skrzynka
python3 design/tools/leady.py       # leady (lista + podgląd) i szanse (tablica etapów)
python3 design/tools/szansa.py      # rekord szansy SZ-0179
python3 design/tools/zakupy.py      # zakupy: zapotrzebowanie i zamówienie ZK z przyjęciem
python3 design/tools/katalog.py     # katalog i import cennika
python3 design/tools/dostawcy.py    # zakupy: dostawcy (rejestr) i cenniki
python3 design/tools/flex.py        # warstwa elastyczna: przetargi, pola, panel boczny
python3 design/tools/flex2.py       # warstwa elastyczna: kreator tabeli, akcje, uprawnienia
python3 design/tools/flex3.py       # warstwa elastyczna: widoki, import z pliku
python3 design/tools/obiekty.py     # obiekty: lista i rekord Hotel Oliwski
python3 design/tools/projekty.py    # projekty: lista i rekord PJ-2026-011
python3 design/tools/projekty2.py   # projekty: oś czasu i zespół
python3 design/tools/raport_tabela.py # raporty: raport z własnej tabeli Przetargi
python3 design/tools/reklamacje.py   # serwis: reklamacje i gwarancje
python3 design/tools/faktury.py      # finanse: należności i do wystawienia
python3 design/tools/faktury2.py     # finanse: wszystkie faktury (KSeF, eksport) i zaliczki
python3 design/tools/test_rdzen.py    # sprawdzian rdzenia: firma elektryczna bez pakietu
python3 design/tools/klient.py      # ekrany klienta (osobne pliki Klient-*.dc.html)
python3 design/tools/klient2.py      # portal klienta firmowego
python3 design/tools/tabele_przewijane.py # tabele: przewijanie w poziomie, przypięta kolumna główna
python3 design/tools/split.py       # podział na Main + Main2 (limit rozmiaru pliku na kanwie)
echo "Gotowe: design/canvas/Main.dc.html"
