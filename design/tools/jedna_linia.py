# Tabele „jedna linia” + kolorowe ikony (21 lis 2026) — krok bazowy.
#  1. Tokeny --ic-* (jasny/ciemny) i CSS karty podglądu logo (.lg .hc) w ramie.
#  2. Firmy i osoby: szare inicjały → kolorowe logo firmy (kwadrat) / osoby (koło), wiersze 36 px.
# Moduły późniejsze używają helperów z ui1.py we własnych skryptach.
P = 'design/canvas/Main.dc.html'
exec(open('design/tools/ui1.py').read())
s = open(P).read()
s = inject_css(s)

def rep(a, b, n=1):
    global s
    assert s.count(a) >= n, a[:80]
    s = s.replace(a, b, n)

# kolory logo po inicjałach (dane listy Firmy po mojdzien2)
LG = {'DM': 'Delikatesy Morskie', 'GB': 'Galeria Portowa', 'HN': 'Hotel Nadmorski', 'BK': 'Biurowiec Kwadrant',
      'LZ': 'Osiedle Leśne Zacisze', 'HO': 'Hotel Oliwski', 'RP': 'Restauracja Przystań', 'WK': 'Wspólnota Kasztanowa 7',
      'PZ': 'Przychodnia Zdrowie', 'PR': 'Piekarnia Rogal', 'KW': 'Kancelaria Wit', 'SM': 'Sushi Bar Molo'}
js = '{' + ','.join(f"'{k}':'{u_firm(v)[1]}'" for k, v in LG.items()) + '}'

# Firmy: logo kolorowe
old_f = ('<span aria-hidden="true" style="width:20px;height:20px;flex:0 0 auto;border-radius:6px;background:var(--bg-subtle);border:0;'
         'display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--text-secondary)">{{r.ini}}</span>')
new_f = ('<span aria-hidden="true" style="width:20px;height:20px;flex:0 0 auto;border-radius:6px;background:{{r.lgC}};border:0;'
         'display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff">{{r.ini}}</span>')
rep(old_f, new_f)
rep("fRows.forEach((r) => { ", f"const LGC = {js};\n    fRows.forEach((r) => {{ r.lgC = LGC[r.ini] || 'var(--ic-slate)'; ")

# Osoby: firma jako kolorowe logo 16 px, osoba prywatna — kolorowe koło
old_o = ('<span aria-hidden="true" style="width:16px;height:16px;flex:0 0 auto;border-radius:6px;background:var(--bg-subtle);border:0;'
         'display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;color:var(--text-secondary)">{{r.fIni}}</span>')
new_o = ('<span aria-hidden="true" style="width:16px;height:16px;flex:0 0 auto;border-radius:5px;background:{{r.fC}};border:0;'
         'display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;color:#fff">{{r.fIni}}</span>')
rep(old_o, new_o)
rep("const PR = (name, ini, firm, fIni, role, cats, phone, contact, contactFull, op) => ({ name, ini, firm, fIni,",
    f"const LGC2 = {js};\n    const PR = (name, ini, firm, fIni, role, cats, phone, contact, contactFull, op) => ({{ name, ini, firm, fIni, fC: LGC2[fIni] || 'var(--ic-slate)',")

# wiersze tabel Firmy/Osoby 40 → 36 px
rep('<div role="row" class="trow" style="display:grid;grid-template-columns:{{fColsV}};align-items:center;height:40px;',
    '<div role="row" class="trow" style="display:grid;grid-template-columns:{{fColsV}};align-items:center;height:36px;')
rep('<div role="row" class="trow" style="display:grid;grid-template-columns:{{oColsV}};align-items:center;height:40px;',
    '<div role="row" class="trow" style="display:grid;grid-template-columns:{{oColsV}};align-items:center;height:36px;')

open(P, 'w').write(s)
print('jedna_linia: tokeny ikon, logo firm w Firmy/Osoby')
