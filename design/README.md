# Makiety i narzędzia projektowe

Obszar czatu projektowego. Claude Code tylko czyta (nie edytuje).

## `canvas/`
Kopia plików kanwy projektowej z claude.ai (format „design canvas”: `*.dc.html` + `canvas.json` z rozmieszczeniem plansz).

- `Main.dc.html` — wszystkie ekrany desktop w jednym komponencie. Ekran wybiera atrybut `ekran` (np. `oferta`, `faktura`, `przeglądy`), dodatkowe stany: `theme`, `krok`, `plan`, `sekcja`, `uklad`, `opcje`, `dokument`, `widok`, `filtr`, `stan`. Lista opcji: `data-props` w skrypcie na końcu pliku. Logika (`renderVals()`) wylicza dane i flagi; szablon używa `<sc-if>`, `<sc-for>` i `{{zmiennych}}`.
- Pliki-plansze (np. `Oferta-warunki.dc.html`) to małe opakowania: `<dc-import name="Main" ekran="oferta" krok="warunki" …>`.
- `Technik.dc.html` — telefon technika (ustawienia `szablon`, `wynik`, `theme`).
- `Klient-*.dc.html` — widoki klienta (link publiczny), samodzielne pliki.
- `Paleta.dc.html` — paleta ⌘K nad ekranem Mój dzień.

Makiety wymagają środowiska kanwy (`support.js`) do pełnego renderu. Do szybkiego podglądu w przeglądarce służy `tools/preview/render.js`.

## `tools/`
Skrypty Pythona, które generują ekrany w `canvas/Main.dc.html` i pliki klienta.

```bash
# z katalogu głównego repozytorium
bash design/tools/build.sh
```

`build.sh` kopiuje `tools/base/Main.base.html` (stan przed modułem ofert) i stosuje kolejno: `oferta.py` (+ `oferta_ws.py`), `zm.py`, `faktura.py`, `przeglady.py`, `raporty.py`, a potem `klient.py`. Wynik jest bajt w bajt równy `canvas/Main.dc.html`.

- `zl2.py` / `zlecenie.py` — wspólne pomocniki (ikony, kapsułki `capd`, nagłówki `h3`/`ah3`, `prop`, `kv`, awatary `cav`); kolejne skrypty wykonują ich nagłówek przez `exec`.
- Starsze skrypty (`soft.py`, `plan.py`, `mapa.py`, `v2.py`–`v6.py`) zbudowały wcześniejsze moduły; ich wynik jest już w `Main.base.html`, są tu dla historii (część ma ścieżki z poprzedniego środowiska).

### Podgląd
```bash
node design/tools/preview/render.js design/canvas/Main.dc.html '{"ekran":"oferta","krok":"warunki"}' /tmp/out.html
google-chrome --headless=new --window-size=1440,1120 --screenshot=/tmp/out.png file:///tmp/out.html
```
`render2.js` obsługuje telefon technika, `render3.js` widoki klienta.
