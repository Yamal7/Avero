# Aplikacja na telefon w stylu Linear mobile (22 lis 2026): duży tytuł, listy w jednej linii z ikoną stanu,
# pływający pasek kart (pigułka) + osobny okrągły przycisk tworzenia, menu jako arkusz.
#  - Telefon-dzien(.ciemny): technik — Mój dzień (Kacper Nowak, pon 23 lis)
#  - Telefon-menu: menu aplikacji technika (arkusz nad listą, ciemny)
#  - Telefon-wizyta: wizyta jak „issue” w Linear — właściwości, kroki, części, pole notatki
#  - Klient-telefon: aplikacja klienta firmowego (Kancelaria Wit) — ekran główny
import json
exec(open('design/tools/ui1.py').read())
D = 'design/canvas/'
LIGHT = ('--bg-app:#FBFBFA;--bg-surface:#FFFFFF;--bg-subtle:#EDECE9;--bg-raised:#F4F3F0;--edge:rgba(27,26,25,.07);--border-strong:#D6D4D0;'
         '--text-primary:#1B1A19;--text-secondary:#63605B;--text-tertiary:#9C9893;--accent:#5E6AD2;--on-accent:#FFFFFF;--success:#2F9E5B;--warning:#C98A12;--danger:#D6453D;'
         '--glass:rgba(255,255,255,.82);--shadow-pop:0 8px 28px rgba(27,26,25,.14);'
         + ';'.join(f'--ic-{k}:{v}' for k, v in IC_LIGHT.items()))
DARK = ('--bg-app:#0F0F0E;--bg-surface:#171716;--bg-subtle:#1F1E1D;--bg-raised:#232220;--edge:rgba(255,255,255,.07);--border-strong:#363532;'
        '--text-primary:#EEEDEB;--text-secondary:#9C9893;--text-tertiary:#64615C;--accent:#7C85E0;--on-accent:#0F0F0E;--success:#4CC27A;--warning:#E0A63A;--danger:#EF6A62;'
        '--glass:rgba(35,34,32,.86);--shadow-pop:0 8px 28px rgba(0,0,0,.5);'
        + ';'.join(f'--ic-{k}:{v}' for k, v in IC_DARK.items()))
CSS = ('body{margin:0}'
       f'.ph{{{LIGHT};font-family:"Geist",system-ui,sans-serif;font-size:15px;line-height:22px;color:var(--text-primary);background:var(--bg-app);-webkit-font-smoothing:antialiased}}'
       f'.ph.dark{{{DARK}}}'
       '.ph *{box-sizing:border-box}.ph a{color:inherit;text-decoration:none}.ph button{font:inherit;color:inherit;cursor:pointer}'
       '.ph .mono{font-family:"Geist Mono",ui-monospace,monospace;letter-spacing:0}.ph .num{font-variant-numeric:tabular-nums}'
       '.ph .ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'
       '.ph .r:active{background:var(--bg-subtle)}.ph :focus-visible{outline:2px solid var(--accent);outline-offset:2px}')

def page(title, w, h, inner):
    return f'''<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&amp;family=Geist+Mono:wght@400;500&amp;display=swap">
<style>
{CSS}
</style>
</helmet>
{inner}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

def I(name, col='slate', size=20): return u_ci(name, col, size)
# --- ikony stanu jak w Linear (18 px)
def st(kind, size=18):
    c = {'plan': 'var(--text-tertiary)', 'todo': 'var(--text-secondary)', 'prog': 'var(--warning)', 'done': 'var(--accent)', 'stop': 'var(--danger)'}[kind]
    if kind == 'plan':
        g = f'<circle cx="9" cy="9" r="7" fill="none" stroke="{c}" stroke-width="1.6" stroke-dasharray="2.2 2.2"></circle>'
    elif kind == 'todo':
        g = f'<circle cx="9" cy="9" r="7" fill="none" stroke="{c}" stroke-width="1.6"></circle>'
    elif kind == 'prog':
        g = f'<circle cx="9" cy="9" r="7" fill="none" stroke="{c}" stroke-width="1.6"></circle><path d="M9 4.5 A4.5 4.5 0 0 1 9 13.5 Z" fill="{c}"></path>'
    elif kind == 'done':
        g = f'<circle cx="9" cy="9" r="8" fill="{c}"></circle><path d="m5.6 9.2 2.3 2.3 4.5-4.6" fill="none" stroke="var(--bg-surface)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>'
    else:
        g = f'<circle cx="9" cy="9" r="8" fill="{c}"></circle><path d="M9 5v5M9 12.6v.1" stroke="var(--bg-surface)" stroke-width="1.8" stroke-linecap="round"></path>'
    tip = {'plan': 'Zaplanowana', 'todo': 'Do zrobienia', 'prog': 'W trakcie', 'done': 'Zrobione', 'stop': 'Wstrzymana'}[kind]
    return f'<svg width="{size}" height="{size}" viewBox="0 0 18 18" role="img" aria-label="{tip}" style="flex:0 0 auto">{g}</svg>'
def prio(p):
    if p == 'pilne':
        return '<span title="Pilne" aria-label="Pilne" style="width:18px;height:18px;flex:0 0 auto;border-radius:5px;background:var(--ic-orange);color:#fff;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">!</span>'
    n = {'wysoki': 3, 'średni': 2, 'niski': 1, '': 0}[p]
    bars = ''.join(f'<rect x="{1+i*6}" y="{12-4*i}" width="4" height="{5+4*i}" rx="1" fill="{"var(--text-secondary)" if i < n else "var(--border-strong)"}"></rect>' for i in range(3))
    return f'<svg width="18" height="18" viewBox="0 0 18 18" role="img" aria-label="Priorytet {p or "brak"}" style="flex:0 0 auto">{bars}</svg>'
def logo(name, size=22):
    ini, col, k = u_firm(name)[:3]
    r = '7px' if k == 'f' else '50%'
    return f'<span aria-label="{name}" style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:{r};background:{col};color:#fff;font-size:{9 if size < 24 else 11}px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">{ini}</span>'
def av(ini, col, size=28): return f'<span style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:50%;background:{col};color:#fff;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">{ini}</span>'
def circ(icon, label, size=44):
    return f'<button type="button" aria-label="{label}" style="width:{size}px;height:{size}px;flex:0 0 auto;border:0;border-radius:50%;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center">{I(icon,"var(--text-primary)",20)}</button>'
def statusbar(t='9:41'):
    return (f'<div aria-hidden="true" style="display:flex;align-items:center;height:48px;padding:0 28px 0 32px;font-size:15px;font-weight:600"><span class="num">{t}</span><span style="flex:1"></span>'
            '<svg width="68" height="12" viewBox="0 0 68 12"><rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor"></rect><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor"></rect><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"></rect><rect x="15" y="1" width="3" height="11" rx="1" fill="currentColor" opacity=".35"></rect>'
            '<rect x="40" y="1" width="22" height="10" rx="3" fill="none" stroke="currentColor" opacity=".5"></rect><rect x="42" y="3" width="15" height="6" rx="1.5" fill="currentColor"></rect></svg></div>')
def head(title, right='', sub=''):
    s_ = f'<span style="font-size:13px;color:var(--text-secondary)">{sub}</span>' if sub else ''
    return (f'<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 20px 8px"><div style="flex:1 1 auto;display:flex;flex-direction:column;gap:2px;min-width:0">'
            f'<h1 style="margin:0;font-size:30px;line-height:38px;font-weight:600;letter-spacing:-0.02em">{title}</h1>{s_}</div>{right}</div>')
def seg(items, cur):
    return ('<div role="tablist" style="display:flex;gap:4px;padding:4px 16px 8px">' + ''.join(
        f'<button type="button" role="tab" aria-selected="{"true" if i == cur else "false"}" style="height:40px;padding:0 16px;border:0;border-radius:20px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i == cur else "background:transparent;color:var(--text-secondary)"}">{t}</button>'
        for i, t in enumerate(items)) + '</div>')
def gh(t, n='', plus=True):
    p = I('arrow', 'var(--text-tertiary)', 0) if False else ''
    pl = '<span aria-label="Dodaj" style="color:var(--text-tertiary);font-size:22px;line-height:22px">+</span>' if plus else ''
    nn = f'<span class="num" style="color:var(--text-tertiary)">{n}</span>' if n != '' else ''
    return f'<div style="display:flex;align-items:center;gap:8px;height:40px;padding:12px 20px 0;font-size:14px;color:var(--text-tertiary)"><span>{t}</span>{nn}<span style="flex:1"></span>{pl}</div>'
def row(lead, title, right='', sub_icon='', tip=''):
    return (f'<a href="#" class="r" title="{tip}" style="display:flex;align-items:center;gap:12px;height:56px;padding:0 20px">{lead}'
            f'<span class="ell" style="flex:1 1 auto;font-size:16px">{title}</span>{sub_icon}{right}</a>')
def meta(t, col='var(--text-secondary)'): return f'<span class="num" style="flex:0 0 auto;font-size:14px;color:{col}">{t}</span>'
def tabbar(items, cur, compose_icon, compose_label):
    btns = ''.join(
        f'<button type="button" aria-label="{lab}" aria-current="{"page" if i == cur else "false"}" style="flex:1 1 0;height:56px;border:0;border-radius:28px;{"background:var(--bg-subtle);" if i == cur else "background:transparent;"}display:inline-flex;align-items:center;justify-content:center">{I(ic_, "var(--text-primary)" if i == cur else "var(--text-secondary)", 24)}</button>'
        for i, (ic_, lab) in enumerate(items))
    return (f'<div style="position:absolute;left:16px;right:16px;bottom:24px;display:flex;align-items:center;gap:12px">'
            f'<nav aria-label="Nawigacja" style="flex:1 1 auto;display:flex;gap:2px;padding:6px;border-radius:34px;background:var(--glass);backdrop-filter:blur(16px);box-shadow:var(--shadow-pop),inset 0 0 0 1px var(--edge)">{btns}</nav>'
            f'<button type="button" aria-label="{compose_label}" title="{compose_label}" style="width:68px;height:68px;flex:0 0 auto;border:0;border-radius:50%;background:var(--glass);backdrop-filter:blur(16px);box-shadow:var(--shadow-pop),inset 0 0 0 1px var(--edge);display:inline-flex;align-items:center;justify-content:center">{I(compose_icon,"var(--text-primary)",26)}</button></div>')

TECH_TABS = [('home', 'Mój dzień'), ('wrench', 'Zlecenia'), ('truck', 'Magazyn auta'), ('mail', 'Skrzynka')]
# ------------------------------------------------------------ technik: Mój dzień
def dzien(dark=False):
    H = [f'<div class="ph{" dark" if dark else ""}" style="position:relative;width:100%;height:844px;overflow:hidden">', statusbar('7:52'),
         head('Mój dzień', circ('search', 'Szukaj'), 'poniedziałek 23 listopada · 4 wizyty'),
         seg(['Dziś', 'Jutro', 'Tydzień'], 0)]
    a = H.append
    a(gh('Teraz', '', False))
    a(row(prio('wysoki') + st('prog'), 'Naprawa klimatyzatora · pokój zarządu', logo('Kancelaria Wit') + meta('9:00'), tip='RK-2026-017 · gwarancja producenta · Arkońska 6, Gdańsk'))
    a(gh('Dziś', 3))
    a(row(prio('pilne') + st('todo'), 'Brak chłodzenia w komorze', logo('Delikatesy Morskie') + meta('11:30', 'var(--warning)'), tip='ZS-1047 · reakcja do 13:40 · Starowiejska 12, Gdynia'))
    a(row(prio('średni') + st('todo'), 'Kontrola szczelności · maszynownia', logo('Galeria Portowa') + meta('14:00'), tip='UR-3109 · R448A 24 kg · obowiązek F-gaz'))
    a(row(prio('niski') + st('plan'), 'Przegląd klimatyzacji · kuchnia', logo('Hotel Oliwski') + meta('16:00'), tip='ZL-0921 · umowa · 3 jednostki'))
    a(gh('Do protokołu', 1, False))
    a(row(prio('') + st('stop'), 'Brak podpisu klienta', logo('Piekarnia Rogal') + meta('wczoraj', 'var(--danger)'), tip='ZL-0905 · protokół czeka na podpis'))
    a(gh('Zrobione', 1, False))
    a(row(prio('') + st('done'), 'Załadunek auta · R32, silnik wentylatora', I('truck', 'teal', 22) + meta('7:30', 'var(--text-tertiary)'), tip='WZ-2026-118 · wydanie na auto GD 4K221'))
    a(tabbar(TECH_TABS, 0, 'camera' if 'camera' in U1 else 'send', 'Szybkie zgłoszenie lub zdjęcie'))
    a('</div>')
    return '\n'.join(H)
U1['camera'] = '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>'
U1['search'] = '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>'
U1['more'] = '<circle cx="5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="19" cy="12" r="1.2"></circle>'
U1['back'] = '<path d="m15 18-6-6 6-6"></path>'
U1['nav'] = '<path d="M3 11 22 2l-9 19-2-8-8-2z"></path>'
U1['sign'] = '<path d="M20 19.5v.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-.5"></path><path d="m15 5 3 3"></path><path d="M17.5 2.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"></path>'
U1['mic'] = '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"></path>'

# ------------------------------------------------------------ technik: menu (arkusz)
def menu():
    base = dzien(True).replace('<div class="ph dark" style="position:relative;width:100%;height:844px;overflow:hidden">',
                               '<div class="ph dark" style="position:relative;width:100%;height:844px;overflow:hidden">', 1)
    # przyciemnienie + arkusz
    items = [('mail', 'Skrzynka', '2'), ('home', 'Mój dzień', ''), ('wrench', 'Zlecenia', '6'), ('truck', 'Magazyn auta', ''), ('cal', 'Kalendarz', ''),
             ('shield', 'Uprawnienia F-gaz', ''), ('gear', 'Ustawienia', ''), ('search', 'Szukaj', '')]
    li = ''.join(
        f'<a href="#" class="r" aria-current="{"page" if t == "Mój dzień" else "false"}" style="display:flex;align-items:center;gap:16px;height:52px;padding:0 16px;border-radius:16px;{"background:var(--bg-subtle);" if t == "Mój dzień" else ""}">'
        f'{I(i, "var(--text-primary)", 22)}<span style="flex:1;font-size:17px">{t}</span><span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i, t, n in items)
    sheet = ('<div aria-hidden="true" style="position:absolute;inset:0;background:rgba(0,0,0,.45)"></div>'
             '<div role="dialog" aria-label="Menu" style="position:absolute;left:16px;right:96px;bottom:24px;display:flex;flex-direction:column;gap:2px;padding:10px;border-radius:30px;background:var(--bg-raised);box-shadow:var(--shadow-pop),inset 0 0 0 1px var(--edge)">'
             '<div style="display:flex;align-items:center;gap:10px;height:52px;padding:0 12px;border-bottom:1px solid var(--edge);margin-bottom:6px">'
             '<span style="width:28px;height:28px;border-radius:8px;background:#1B1A19;color:#fff;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">K</span>'
             '<span style="flex:1;font-size:17px;font-weight:600">Kranz HVACR</span>' + av('KN', '#1FA7A5', 28) + '</div>' + li + '</div>')
    return base.replace('\n</div>', '\n' + sheet + '</div>', 1) if False else base[:-len('</div>')] + sheet + '</div>'

# ------------------------------------------------------------ technik: wizyta
def wizyta():
    H = ['<div class="ph" style="position:relative;width:100%;height:1300px;overflow:hidden;background:var(--bg-surface)">', statusbar('9:14')]
    a = H.append
    a('<div style="display:flex;align-items:center;gap:8px;padding:4px 16px">' + circ('back', 'Wstecz') +
      '<span style="flex:1;text-align:center" class="mono"><span style="font-size:13px;color:var(--text-secondary)">RK-2026-017</span></span>' + circ('more', 'Więcej') + '</div>')
    a('<div style="padding:12px 20px 4px;display:flex;flex-direction:column;gap:6px"><span style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-secondary)">' + logo('Kancelaria Wit', 18) + 'Kancelaria Wit · reklamacja</span>'
      '<h1 style="margin:0;font-size:26px;line-height:32px;font-weight:600;letter-spacing:-0.02em">Naprawa klimatyzatora · pokój zarządu</h1>'
      '<p style="margin:0;color:var(--text-secondary)">Uznana 13 lis: uszkodzony silnik wentylatora jednostki zewnętrznej. Część w aucie. Koszt dla klienta 0 zł.</p></div>')
    def prop(icon, col, k, v, right=''):
        return (f'<div style="display:flex;align-items:center;gap:12px;height:48px;padding:0 20px">{icon if icon.startswith("<") else I(icon, col, 20)}'
                f'<span style="width:96px;flex:0 0 auto;font-size:14px;color:var(--text-secondary)">{k}</span><span class="ell" style="flex:1;font-size:15px">{v}</span>{right}</div>')
    a('<div style="display:flex;flex-direction:column;padding:8px 0;border-top:1px solid var(--edge);border-bottom:1px solid var(--edge);margin-top:12px">' +
      prop(st('prog', 20), '', 'Stan', 'W trakcie · od 9:06') +
      prop(prio('wysoki'), '', 'Priorytet', 'Wysoki') +
      prop('pin', 'red', 'Adres', 'Arkońska 6, Gdańsk · II p.', f'<a href="#" aria-label="Nawiguj" style="display:inline-flex">{I("nav", "blue", 20)}</a>') +
      prop('phone', 'teal', 'Kontakt', 'Krzysztof Lis', f'<a href="#" aria-label="Zadzwoń" style="display:inline-flex">{I("phone", "teal", 20)}</a>') +
      prop('snow', 'blue', 'Urządzenie', 'UR-1990 · Daikin Perfera 3,5 kW') +
      prop('shield', 'violet', 'Podstawa', 'Gwarancja producenta do 14 mar 2028') + '</div>')
    a(gh('Kroki', '2 z 4', False))
    for k, t, m in [('done', 'Zdjęcie przed naprawą', '9:08'), ('done', 'Odłączenie zasilania, demontaż osłony', '9:15'),
                    ('prog', 'Wymiana silnika wentylatora', ''), ('todo', 'Test działania i pomiar temperatury', ''), ('todo', 'Podpis klienta', '')]:
        a(f'<div style="display:flex;align-items:center;gap:12px;height:48px;padding:0 20px">{st(k)}<span class="ell" style="flex:1;font-size:16px;{"color:var(--text-tertiary);text-decoration:line-through" if k == "done" else ""}">{t}</span>{meta(m, "var(--text-tertiary)")}</div>')
    a(gh('Części', 1, True))
    a('<div style="display:flex;align-items:center;gap:12px;height:52px;padding:0 20px">' + I('box', 'orange', 20) +
      '<span class="ell" style="flex:1;font-size:16px">Silnik wentylatora jednostki zewn.</span><span class="num" style="color:var(--text-secondary)">1 szt. · z auta</span></div>')
    a(gh('Aktywność', '', False))
    for ini, col, t, m in [('AW', '#C2305A', 'Agnieszka W. potwierdziła termin z klientem', '20 lis'), ('KN', '#1FA7A5', 'Kacper N. rozpoczął wizytę', '9:06')]:
        a(f'<div style="display:flex;align-items:center;gap:12px;min-height:44px;padding:0 20px">{av(ini, col, 24)}<span class="ell" style="flex:1;font-size:14px;color:var(--text-secondary)">{t}</span>{meta(m, "var(--text-tertiary)")}</div>')
    # dół: notatka + akcja
    a('<div style="position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:10px;padding:12px 16px 28px;background:var(--bg-surface);border-top:1px solid var(--edge)">'
      '<div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:48px;display:flex;align-items:center;gap:10px;padding:0 16px;border-radius:24px;background:var(--bg-subtle);color:var(--text-tertiary);font-size:16px">Notatka do wizyty…<span style="flex:1"></span>' + I('mic', 'var(--text-secondary)', 20) + '</div>' +
      circ('camera', 'Zdjęcie', 48) + '</div>'
      '<button type="button" style="height:52px;border:0;border-radius:26px;background:var(--accent);color:var(--on-accent);font-size:16px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:8px">' + I('sign', 'var(--on-accent)', 20) + 'Zakończ i podpisz</button></div>')
    a('</div>')
    return '\n'.join(H)

# ------------------------------------------------------------ klient: aplikacja (Kancelaria Wit)
CLI_TABS = [('home', 'Przegląd'), ('snow', 'Urządzenia'), ('receipt', 'Faktury'), ('ret', 'Zgłoszenia')]
def klient(dark=False):
    H = [f'<div class="ph{" dark" if dark else ""}" style="position:relative;width:100%;height:960px;overflow:hidden">', statusbar('10:24')]
    a = H.append
    a(head('Kancelaria Wit', av('KL', '#5A4636', 44), 'umowa serwisowa do 28 lut 2027 · 4 urządzenia'))
    a(gh('Teraz', '', False))
    a(row(I('cal', 'blue', 20), 'Wizyta · naprawa klimatyzatora', meta('pn 9:00'), tip='Poniedziałek 23 lis, 9:00–11:00 · Kacper Nowak · w ramach gwarancji'))
    a(row(I('alert', 'orange', 20), 'Wybierz termin kontroli szczelności', I('chev', 'var(--text-tertiary)', 18), tip='Serwerownia · termin minął 17 lis'))
    a(row(I('file', 'violet', 20), 'Oferta · klimatyzacja sali konf.', meta('33 579 zł'), tip='OF-2026-114 · ważna do 4 gru'))
    a(gh('Zgłoszenia', 1, True))
    a(row(st('prog'), 'Klimatyzator nie chłodzi (E7)', meta('naprawa 23 lis'), tip='RK-2026-017 · uznana 13 lis · koszt 0 zł'))
    a(gh('Urządzenia', 4, False))
    for t, m, c in [('Serwerownia · UR-1988', 'kontrola po terminie', 'var(--warning)'), ('Pokój zarządu · UR-1990', 'w naprawie', 'var(--text-secondary)'),
                    ('Sala konferencyjna · UR-1991', 'sprawny', 'var(--text-tertiary)')]:
        a(row(I('snow', 'blue', 20), t, meta(m, c)))
    a(gh('Faktury', '', False))
    a(row(I('check', 'green', 20) if 'check' in U1 else st('done'), 'Do zapłaty 0,00 zł', meta('ost. wpłata 19 lis', 'var(--text-tertiary)'), tip='Wszystkie faktury opłacone'))
    a(tabbar(CLI_TABS, 0, 'wrench', 'Zgłoś usterkę'))
    a('</div>')
    return '\n'.join(H)


OUT = [('Telefon-dzien.dc.html', 'Telefon technika · Mój dzień', 844, dzien()),
       ('Telefon-dzien-ciemny.dc.html', 'Telefon technika · Mój dzień · ciemny', 844, dzien(True)),
       ('Telefon-menu.dc.html', 'Telefon technika · menu', 844, menu()),
       ('Telefon-wizyta.dc.html', 'Telefon technika · wizyta (jak zadanie w Linear)', 1300, wizyta()),
       ('Klient-telefon.dc.html', 'Klient · aplikacja · przegląd', 960, klient()),
       ('Klient-telefon-ciemny.dc.html', 'Klient · aplikacja · przegląd · ciemny', 960, klient(True))]
for f, t, h, inner in OUT:
    open(D + f, 'w').write(page('Avero — ' + t, 390, h, inner))
# plansze na kanwie: rząd obok portalu klienta
c = json.load(open(D + 'canvas.json'))
x0, y0 = 7640, 55860
for i, (f, t, h, _) in enumerate(OUT):
    c['boards'][f] = {'h': h, 'title': t, 'w': 390, 'x': x0 + i * 440, 'y': y0}
    if f not in c['order']:
        c['order'].append(f)
json.dump(c, open(D + 'canvas.json', 'w'), ensure_ascii=False, indent=2)
print('telefon: ' + ', '.join(f for f, *_ in OUT))
