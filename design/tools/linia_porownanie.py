# Jedna linia w pozostałych listach — wersja do porównania (23 lis 2026).
# Nowy prop ramy `wiersze`: „dwie linie” (dotychczas) | „jedna linia”. Bez kopiowania ekranów (limit rozmiaru pliku):
# klasa .l1 na ramie przestawia CSS-em Skrzynkę (lista wątków), Planowanie (technicy i wizyty) i wiersze w Ustawieniach.
# Plansze porównawcze: stara i nowa wersja obok siebie + plansze stanów lewego panelu (pasek_boczny.py).
import json
P = 'design/canvas/Main.dc.html'
s = open(P).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) >= n, a[:90]
    s = s.replace(a, b, n)
rep('"pasek": {"editor": "enum", "options": ["rozwinięty", "zwinięty", "ukryty"], "default": "rozwinięty", "section": "Widok"}',
    '"pasek": {"editor": "enum", "options": ["rozwinięty", "zwinięty", "ukryty"], "default": "rozwinięty", "section": "Widok"}, '
    '"wiersze": {"editor": "enum", "options": ["dwie linie", "jedna linia"], "default": "dwie linie", "section": "Widok"}')
rep("      pasekCls: pasek === 'zwinięty'",
    "      wierszeCls: (this.props.wiersze ?? 'dwie linie') === 'jedna linia' ? 'l1' : '',\n      pasekCls: pasek === 'zwinięty'")
rep('<div class="av {{themeClass}} {{pasekCls}}"', '<div class="av {{themeClass}} {{pasekCls}} {{wierszeCls}}"')

W = '.av.l1 [aria-label="Wątki"] [role=option]'
CSS = (
    # Skrzynka: jeden wiersz 40 px — kropka, awatar, nadawca (112 px), temat, kanał, godzina; firma, fragment i znaczniki w podpowiedzi
    '.av.l1 [aria-label="Wątki"]{flex:0 0 440px!important}'
    f'{W}{{padding:0 10px!important;height:40px;align-items:center!important;gap:8px!important}}'
    f'{W}>span:first-child{{padding-top:0!important}}'
    f'{W}>div{{flex-direction:row!important;align-items:center;gap:8px!important}}'
    f'{W}>div>div:nth-child(1),{W}>div>div:nth-child(5){{display:contents!important}}'
    f'{W}>div>div:nth-child(1)>.ell{{flex:0 0 104px!important;order:1}}'
    f'{W}>div>div:nth-child(1)>span[title=Nieprzeczytane]{{order:0}}'
    f'{W}>div>div:nth-child(1)>.num{{order:4;flex:0 0 auto}}'
    f'{W}>div>span:nth-child(2),{W}>div>span:nth-child(4){{display:none!important}}'
    f'{W}>div>span:nth-child(3){{order:2;flex:1 1 auto!important;min-width:0}}'
    f'{W}>div>div:nth-child(5)>*{{display:none!important}}'
    f'{W}>div>div:nth-child(5)>:first-child{{display:inline-flex!important;order:3}}'
    # Planowanie: technik w jednej linii (awatar, nazwisko, pasek obciążenia, godziny), wiersz 52 px, wizyty jednolinijkowe
    '.av.l1 [role=row]:has(>[role=rowheader]){min-height:52px!important}'
    '.av.l1 [role=rowheader]{flex-direction:row!important;align-items:center!important;gap:10px!important;padding:0 10px 0 16px!important}'
    '.av.l1 [role=rowheader]>span:first-child{flex:1 1 auto}'
    '.av.l1 [role=rowheader]>span:last-child{flex-direction:row-reverse!important;align-items:center!important;gap:8px!important;padding-left:0!important;flex:0 0 auto}'
        '.av.l1 [role=gridcell] a.card{flex-direction:row!important;align-items:center!important;gap:6px!important;top:8px!important;bottom:8px!important}'
    '.av.l1 [role=gridcell] a.card>span:first-child .num,.av.l1 [role=gridcell] a.card>span:first-child .mono{display:none!important}'
    '.av.l1 [role=gridcell] a.card>span:first-child{flex:0 0 auto!important;min-width:0}'
    '.av.l1 [role=rowheader]>span:last-child .num{display:none!important}'
    '.av.l1 [role=rowheader]>span:last-child>span[aria-hidden]{width:56px!important;flex:0 0 56px!important}'
    '.av.l1 [role=rowheader]>span:first-child{min-width:0}'
    '.av.l1 [role=gridcell] a.card>span:nth-child(2){-webkit-line-clamp:1!important;white-space:nowrap;text-overflow:ellipsis;display:block!important;min-width:0}'
    '.av.l1 [role=gridcell] a.card>span:nth-child(n+3){display:none}'
    # Ustawienia: tytuł i opis w jednej linii (opis szary, przycięty), wiersz 36 px
    '.av.l1 nav[aria-label="Ustawienia"]~* [role=row]{min-height:36px!important}'
    '.av.l1 nav[aria-label="Ustawienia"]~* [role=row] span[style*="flex-direction:column"]{flex-direction:row!important;align-items:baseline;gap:8px;min-width:0}'
    '.av.l1 nav[aria-label="Ustawienia"]~* [role=row] span[style*="flex-direction:column"]>span+span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'
)
rep('</style>', CSS + '</style>')
open(P, 'w').write(s)

# --- plansze
D = 'design/canvas/'
def wrapper(title, name, attrs):
    return f'''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Avero — {title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500&amp;display=swap">
<style>body{{margin:0}}</style>
</helmet>
<div style="width:100%">
<dc-import name="{name}" {attrs} hint-size="100%,1120px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1440,"height":1120}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
BOARDS = [
    # (plik, tytuł, komponent, atrybuty, x, y)
    ('Panel-zwiniety.dc.html', 'Lewy panel zwinięty · Faktury', 'Main2', 'ekran="faktury" pasek="zwinięty" theme="jasny"', 0, 61400),
    ('Panel-ukryty.dc.html', 'Lewy panel ukryty · Faktury', 'Main2', 'ekran="faktury" pasek="ukryty" theme="jasny"', 1520, 61400),
    ('Panel-zwiniety-ciemny.dc.html', 'Lewy panel zwinięty · Firmy · ciemny', 'Main', 'ekran="firmy" pasek="zwinięty" theme="ciemny"', 3040, 61400),
    ('Linia-skrzynka-dwie.dc.html', 'Skrzynka · dwie linie (dotychczas)', 'Main2', 'ekran="skrzynka" theme="jasny"', 0, 62660),
    ('Linia-skrzynka-jedna.dc.html', 'Skrzynka · jedna linia', 'Main2', 'ekran="skrzynka" wiersze="jedna linia" theme="jasny"', 1520, 62660),
    ('Linia-planowanie-dwie.dc.html', 'Planowanie · dwie linie (dotychczas)', 'Main', 'ekran="planowanie" plan="dzień" theme="jasny"', 3040, 62660),
    ('Linia-planowanie-jedna.dc.html', 'Planowanie · jedna linia', 'Main', 'ekran="planowanie" plan="dzień" wiersze="jedna linia" theme="jasny"', 4560, 62660),
    ('Linia-ustawienia-dwie.dc.html', 'Ustawienia · powiadomienia · dwie linie (dotychczas)', 'Main', 'ekran="ustawienia" ust="powiadomienia" theme="jasny"', 6080, 62660),
    ('Linia-ustawienia-jedna.dc.html', 'Ustawienia · powiadomienia · jedna linia', 'Main', 'ekran="ustawienia" ust="powiadomienia" wiersze="jedna linia" theme="jasny"', 7600, 62660),
]
c = json.load(open(D + 'canvas.json'))
for f, t, name, attrs, x, y in BOARDS:
    open(D + f, 'w').write(wrapper(t, name, attrs))
    c['boards'][f] = {'expand': 'fill', 'h': 1120, 'w': 1440, 'title': t, 'x': x, 'y': y}
    if f not in c['order']:
        c['order'].append(f)
json.dump(c, open(D + 'canvas.json', 'w'), ensure_ascii=False, indent=2)
print('linia_porownanie: prop wiersze, ' + str(len(BOARDS)) + ' plansz')
