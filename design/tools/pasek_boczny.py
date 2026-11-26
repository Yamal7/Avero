# Lewy panel nawigacji: rozwinięty / zwinięty (same ikony) / ukryty — 23 lis 2026.
#  - nowy prop ramy `pasek` (Widok): rozwinięty | zwinięty | ukryty,
#  - przycisk w górnym pasku obok przełącznika firmy: „Zwiń panel boczny  [” (cyklicznie: rozwinięty → zwinięty → ukryty),
#  - zwinięty: 52 px, ikony wyśrodkowane, nazwy w podpowiedzi, nagłówki grup jako cienka linia, liczniki jako kropka,
#  - ukryty: panel znika, główny obszar zajmuje całą szerokość; najechanie na lewą krawędź (8 px) wysuwa panel nad treścią.
P = 'design/canvas/Main.dc.html'
s = open(P).read()
def rep(a, b, n=1):
    global s
    assert s.count(a) >= n, a[:90]
    s = s.replace(a, b, n)

# 1. prop
rep('"stan": {"editor": "enum", "options": ["dane", "pusty", "wczytywanie"], "default": "dane", "section": "Widok"}',
    '"stan": {"editor": "enum", "options": ["dane", "pusty", "wczytywanie"], "default": "dane", "section": "Widok"}, '
    '"pasek": {"editor": "enum", "options": ["rozwinięty", "zwinięty", "ukryty"], "default": "rozwinięty", "section": "Widok"}')
rep("    const theme = this.props.theme ?? 'jasny';",
    "    const theme = this.props.theme ?? 'jasny';\n    const pasek = this.props.pasek ?? 'rozwinięty';")
rep("      themeClass: theme === 'ciemny' ? 'dark' : '',",
    "      themeClass: theme === 'ciemny' ? 'dark' : '',\n"
    "      pasekCls: pasek === 'zwinięty' ? 'p-zw' : (pasek === 'ukryty' ? 'p-uk' : ''),\n"
    "      pasekTip: pasek === 'rozwinięty' ? 'Zwiń panel boczny  [' : (pasek === 'zwinięty' ? 'Ukryj panel boczny  [' : 'Pokaż panel boczny  ['),")
rep('<div class="av {{themeClass}}" style="position:relative;display:flex;flex-direction:column;min-height:1120px;width:100%;background:var(--bg-shell)">',
    '<div class="av {{themeClass}} {{pasekCls}}" style="position:relative;display:flex;flex-direction:column;min-height:1120px;width:100%;background:var(--bg-shell)">')
# 2. przycisk w górnym pasku (przed Szukaj)
PANEL = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">'
         '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>')
rep('<button type="button" class="shellbtn" aria-label="Szukaj" title="Szukaj  ⌘K"',
    f'<button type="button" class="shellbtn pbtn" aria-label="{{{{pasekTip}}}}" title="{{{{pasekTip}}}}" style="width:28px;height:28px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:var(--text-secondary);padding:0">{PANEL}</button>'
    '<button type="button" class="shellbtn" aria-label="Szukaj" title="Szukaj  ⌘K"')
# 3. CSS
N = 'nav[aria-label="Nawigacja główna"]'
CSS = (f'.av.p-zw {N}{{flex:0 0 52px!important;padding:4px 6px 16px!important;gap:8px!important}}'
       f'.av.p-zw {N} a.nav{{justify-content:center;padding:0!important;height:32px!important;position:relative}}'
       f'.av.p-zw {N} a.nav>span.ell{{display:none}}'
       f'.av.p-zw {N} a.nav>span.num{{position:absolute;top:5px;right:6px;width:6px;height:6px;border-radius:50%;background:var(--accent);font-size:0!important;overflow:hidden}}'
       f'.av.p-zw {N} .grp-h{{font-size:0!important;height:9px!important;padding:0 8px!important;pointer-events:none}}'
       f'.av.p-zw {N} .grp-h .caret,.av.p-zw {N} .grp-h svg{{display:none}}'
       f'.av.p-zw {N} .grp-h::after{{content:"";flex:1 1 auto;height:1px;background:var(--edge)}}'
       f'.av.p-zw header>div:first-child{{flex-basis:auto!important}}'
       f'.av.p-zw header>div:first-child .shellbtn:first-child .ell,.av.p-zw header>div:first-child .shellbtn:first-child>svg{{display:none}}'
       f'.av.p-uk {N}{{display:none!important}}'
       f'.av.p-uk {N}+main{{margin-left:8px!important}}'
       f'.av.p-uk header>div:first-child{{flex-basis:auto!important}}'
       f'.av .pbtn:hover{{color:var(--text-primary)}}'
       f'.av.p-zw .pbtn,.av.p-uk .pbtn{{color:var(--accent)}}')
rep('</style>', CSS + '</style>')
open(P, 'w').write(s)
print('pasek_boczny: prop pasek (rozwinięty/zwinięty/ukryty), przycisk [ w górnym pasku')
