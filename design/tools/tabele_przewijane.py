# Tabele przewijane w poziomie z przypiętą kolumną główną (jak Attio) — 22 lis 2026.
# Dotyczy tabel w jednej linii (wiersze .row1 / nagłówki z u_th). Dla każdej tabeli role="table":
#  - kolumny minmax(0,Xfr) dostają minimalną szerokość (główna 220 px, pozostałe 120–160 px),
#  - treść tabeli ma min-width = suma minimów; gdy się nie mieści, tabela przewija się w poziomie (Shift+kółko, gładzik),
#  - kolumny do głównej włącznie (nr, ikona, tytuł) są przypięte (sticky) z nieprzezroczystym tłem,
#  - karta podglądu logo wychodzi poza obszar przewijania (w kodzie: portal/Popover).
import re
P = 'design/canvas/Main.dc.html'
s = open(P).read()
VOID = {'input', 'br', 'img', 'hr', 'meta', 'link'}
TAG = re.compile(r'<(/?)([a-zA-Z][\w-]*)([^>]*?)(/?)>')

def match_close(h, i):
    """i = index of '<' of an opening tag; return index just after its matching close tag."""
    depth = 0
    for m in TAG.finditer(h, i):
        cl, name, _, selfc = m.groups()
        if name.lower() in VOID or selfc: continue
        depth += -1 if cl else 1
        if depth == 0: return m.end()
    raise ValueError('unclosed')

def children(h, a, b):
    """direct child start-tag spans between a (after open tag) and b (before close tag)."""
    out = []; i = a
    while True:
        m = TAG.search(h, i)
        if not m or m.start() >= b: break
        if m.group(1): i = m.end(); continue
        name = m.group(2).lower()
        end = m.end() if (name in VOID or m.group(4)) else match_close(h, m.start())
        out.append((m.start(), m.end(), end)); i = end
    return out

def parse_cols(g):
    toks = re.findall(r'minmax\([^)]*\)|repeat\([^)]*\)|\S+', g)
    return toks

def widen(g):
    toks = parse_cols(g)
    frs = [float(re.match(r'minmax\(0,([\d.]+)fr\)', t).group(1)) for t in toks if t.startswith('minmax(0,')]
    if not frs: return None
    big = max(frs); main_i = None; out = []; W = 0
    for k, t in enumerate(toks):
        m = re.match(r'minmax\(0,([\d.]+)fr\)', t)
        if m:
            x = float(m.group(1))
            if main_i is None and x == big:
                mn = 220; main_i = k
            else:
                mn = max(112, min(176, int(round(140 * x / 8)) * 8))
            out.append(f'minmax({mn}px,{m.group(1)}fr)'); W += mn
        elif t.endswith('px'):
            out.append(t); W += int(float(t[:-2]))
        elif t.startswith('repeat('):
            n, w = re.match(r'repeat\((\d+),(\d+)px\)', t).groups(); out.append(t); W += int(n) * int(w)
        else:
            out.append(t); W += 64
    return ' '.join(out), W, main_i, toks

n_tables = 0
pos = 0
while True:
    i = s.find('<div role="table"', pos)
    if i < 0: break
    j = match_close(s, i)
    block = s[i:j]
    if 'row1' not in block or 'class="tx"' in block[:300]:
        pos = j; continue
    grids = set(re.findall(r'grid-template-columns:([^;"]+)', block))
    plan = {g: widen(g) for g in grids}
    plan = {g: v for g, v in plan.items() if v}
    if not plan:
        pos = j; continue
    gap = 12
    Wmax = max(v[1] + gap * (len(v[3]) - 1) + 24 for v in plan.values())
    # rows: pin children up to main column
    new = block
    rows = [m.start() for m in re.finditer(r'<div role="row"', new)]
    for r0 in reversed(rows):
        r1 = match_close(new, r0)
        head = TAG.match(new, r0)
        gm = re.search(r'grid-template-columns:([^;"]+)', head.group(0))
        if not gm or gm.group(1) not in plan:
            continue
        g2, W, main_i, toks = plan[gm.group(1)]
        kids = children(new, head.end(), r1 - len('</div>'))
        seg = new[r0:r1]
        # pin cells 0..main_i
        offs = []; acc = 0
        for k, t in enumerate(toks[:main_i + 1]):
            offs.append(acc); acc += (int(float(t[:-2])) if t.endswith('px') else 0) + gap
        for k in reversed(range(min(main_i + 1, len(kids)))):
            st, se, _ = kids[k]
            st -= r0; se -= r0
            tag = seg[st:se]
            cls = 'pin pin-l' if k == main_i else 'pin'
            extra = f'left:{offs[k]}px;'
            if k == 0: extra += 'margin-left:-10px;padding-left:10px;'
            if 'style="' in tag:
                tag2 = tag.replace('style="', f'style="position:sticky;{extra}', 1)
            else:
                tag2 = tag[:-1] + f' style="position:sticky;{extra}">'
            if 'class="' in tag2:
                tag2 = tag2.replace('class="', f'class="{cls} ', 1)
            else:
                tag2 = tag2.replace('<span', f'<span class="{cls}"', 1).replace('<div', f'<div class="{cls}"', 1) if not tag2.startswith('<span class') else tag2
            seg = seg[:st] + tag2 + seg[se:]
        seg = seg.replace(f'grid-template-columns:{gm.group(1)}', f'grid-template-columns:{g2}', 1)
        new = new[:r0] + seg + new[r1:]
    # paski grup (dzieci bez role=row): treść w przyklejonym spanie, żeby etykieta grupy nie uciekała w bok
    def wrap_groups(h):
        hd = TAG.match(h, 0)
        inner_a = hd.end(); inner_b = len(h) - len('</div>')
        out = []; last = inner_a
        for st, se, en in children(h, inner_a, inner_b):
            tag = h[st:se]
            if 'role="row"' in tag or not tag.startswith('<div'):
                continue
            out.append((se, en - len('</div>')))
        for se, ce in reversed(out):
            h = h[:se] + '<span class="gsticky">' + h[se:ce] + '</span>' + h[ce:]
        return h
    new = wrap_groups(new)
    # wrap content
    h = TAG.match(new, 0)
    open_tag = h.group(0)
    open2 = open_tag.replace('role="table"', 'role="table" class="tx"', 1).replace('style="', 'style="overflow-x:auto;overflow-y:hidden;', 1)
    inner = new[h.end():-len('</div>')]
    new = open2 + f'<div style="min-width:{Wmax}px;display:flex;flex-direction:column">' + inner + '</div></div>'
    s = s[:i] + new + s[j:]
    n_tables += 1
    pos = i + len(new)

CSS = ('.av .tx{scrollbar-width:thin;max-width:100%}'
       '.av .tx .pin-l{box-shadow:1px 0 0 var(--edge)}'
       '.av .tx .gsticky{position:sticky;left:10px;display:inline-flex;align-items:center;gap:8px;min-width:0}'
       '.av .tx .pin:hover,.av .tx .pin:focus-within,.av .tx .pin:has(.hc.open),.av .tx [role=row]:hover>[role=cell]:has(.lg),.av .tx [role=cell]:has(.hc.open){z-index:30;position:relative}'
       '.av .tx .pin:has(.hc.open),.av .tx .pin:hover,.av .tx .pin:focus-within{position:sticky}'
       '.av .tx .pin{z-index:2;background:var(--bg-surface)}'
       '.av .tx [role=row][aria-selected=true] .pin,.av .tx .row:hover .pin{background:var(--bg-subtle)}'
       '.av .tx [role=row]:not(.row) .pin{background:var(--bg-surface)}'
       '.av .tx .lg{align-items:flex-start!important}'
       '.av .tx .lg .hc{position:fixed;left:auto;top:auto;margin:28px 0 0 -8px}')
if '.av .tx .pin' not in s:
    s = s.replace('</style>', CSS + '</style>', 1)
open(P, 'w').write(s)
print(f'tabele_przewijane: {n_tables} tabel z przewijaniem i przypiętą kolumną')
