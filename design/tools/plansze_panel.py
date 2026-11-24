# Plansze stanów lewego panelu (prop `pasek` z pasek_boczny.py), 23 lis 2026.
# Wariant „jedna linia” w Skrzynce, Planowaniu i Ustawieniach był tu do porównania; właściciel wybrał dotychczasowe
# dwie linie (DECISIONS 2026-11-23), więc prop `wiersze` i jego plansze usunięte.
import json
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
]
c = json.load(open(D + 'canvas.json'))
# wariant „jedna linia” odrzucony 23 lis — usuń jego plansze, jeśli zostały
for f in [k for k in c['boards'] if k.startswith('Linia-')]:
    del c['boards'][f]
c['order'] = [f for f in c['order'] if not f.startswith('Linia-')]
for f, t, name, attrs, x, y in BOARDS:
    open(D + f, 'w').write(wrapper(t, name, attrs))
    c['boards'][f] = {'expand': 'fill', 'h': 1120, 'w': 1440, 'title': t, 'x': x, 'y': y}
    if f not in c['order']:
        c['order'].append(f)
json.dump(c, open(D + 'canvas.json', 'w'), ensure_ascii=False, indent=2)
print('plansze_panel: ' + str(len(BOARDS)) + ' plansze stanów lewego panelu')
