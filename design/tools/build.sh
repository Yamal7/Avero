#!/usr/bin/env bash
# Przebudowuje Main.dc.html od bazy (stan sprzed modułu ofert) przez wszystkie kolejne moduły.
# Uruchamiaj z katalogu głównego repozytorium: bash design/tools/build.sh
set -euo pipefail
cp design/tools/base/Main.base.html design/canvas/Main.dc.html
python3 design/tools/oferta.py      # oferta: pozycje, warunki, wysyłka, po akceptacji
python3 design/tools/zm.py          # zlecenie montażu ZS-1052
python3 design/tools/faktura.py     # faktura końcowa
python3 design/tools/przeglady.py   # przeglądy + umowa serwisowa
python3 design/tools/raporty.py     # raporty
python3 design/tools/ustawienia.py  # ustawienia: profil firmy, użytkownicy, integracje
python3 design/tools/ustawienia2.py # ustawienia: dokumenty, katalog, technicy, mój profil, powiadomienia, wygląd
python3 design/tools/zgloszenia.py  # zgłoszenia (lista + podgląd) i skrzynka
python3 design/tools/leady.py       # leady (lista + podgląd) i szanse (tablica etapów)
python3 design/tools/szansa.py      # rekord szansy SZ-0179
python3 design/tools/zakupy.py      # zakupy: zapotrzebowanie i zamówienie ZK z przyjęciem
python3 design/tools/katalog.py     # katalog i import cennika
python3 design/tools/flex.py        # warstwa elastyczna: przetargi, pola, panel boczny
python3 design/tools/flex2.py       # warstwa elastyczna: kreator tabeli, akcje, uprawnienia
python3 design/tools/obiekty.py     # obiekty: lista i rekord Hotel Oliwski
python3 design/tools/klient.py      # ekrany klienta (osobne pliki Klient-*.dc.html)
echo "Gotowe: design/canvas/Main.dc.html"
