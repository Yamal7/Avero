# Aplikacja klienta — dwa kierunki do porównania (23 lis 2026). Obie w barwach firmy instalatorskiej (white-label:
# logo, nazwa i kolor marki z Ustawień firmy; tu Kranz HVACR, kolor marki --brand). Pasek na dole zostaje (standard iOS),
# zmienia się treść:
#  A „Co teraz” — prawie pusty ekran, jedna sprawa i jeden przycisk; pole „Opisz usterkę…” nad paskiem.
#  B „Moje urządzenia” — urządzenia z pierścieniem czasu do przeglądu / kontroli F-gaz; skan naklejki QR na jednostce.
import json
SRC = open('design/tools/telefon.py').read()
exec(SRC.split('\nOUT = [')[0])
U1['qr'] = ('<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>'
            '<path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"></path>')
U1['docs'] = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h8M8 17h5"></path>'
BRAND_L, BRAND_D = '#0F7B8A', '#3FB3C2'   # kolor marki Kranz HVACR (z Ustawień firmy)
CSS_EXTRA = (f'.ph{{--brand:{BRAND_L};--brand-soft:rgba(15,123,138,.10);--on-brand:#FFFFFF}}'
             f'.ph.dark{{--brand:{BRAND_D};--brand-soft:rgba(63,179,194,.14);--on-brand:#0F0F0E}}')

def brandrow(right_av=True):
    return ('<div style="display:flex;align-items:center;gap:10px;padding:8px 20px 4px">'
            '<span aria-hidden="true" style="width:32px;height:32px;border-radius:9px;background:var(--brand);color:var(--on-brand);font-size:15px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">K</span>'
            '<span style="flex:1;display:flex;flex-direction:column;line-height:18px"><span style="font-size:15px;font-weight:600">Kranz HVACR</span>'
            '<span style="font-size:12px;color:var(--text-tertiary)">Kancelaria Wit</span></span>' + (av('KL', '#5A4636', 40) if right_av else '') + '</div>')

def tabs3(cur):
    items = [('home', 'Start'), ('snow', 'Urządzenia'), ('docs', 'Dokumenty')]
    b = ''.join(
        f'<button type="button" aria-current="{"page" if i == cur else "false"}" style="flex:1 1 0;height:60px;border:0;border-radius:30px;{"background:var(--bg-subtle);" if i == cur else "background:transparent;"}'
        f'display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px;font-weight:500;color:{"var(--brand)" if i == cur else "var(--text-secondary)"}">'
        f'{I(ic_, "var(--brand)" if i == cur else "var(--text-secondary)", 22)}{t}</button>' for i, (ic_, t) in enumerate(items))
    return (f'<nav aria-label="Nawigacja" style="display:flex;gap:2px;padding:6px;border-radius:36px;background:var(--glass);backdrop-filter:blur(16px);'
            f'box-shadow:var(--shadow-pop),inset 0 0 0 1px var(--edge)">{b}</nav>')

# ------------------------------------------------------------------ A: Co teraz
def kier_a(dark=False):
    H = [f'<div class="ph{" dark" if dark else ""}" style="position:relative;width:100%;height:844px;overflow:hidden">', statusbar('7:41'), brandrow()]
    a = H.append
    # główna sprawa — bez karty: duży tekst, ikona marki, dwa przyciski
    a('<section aria-label="Co teraz" style="padding:56px 24px 0;display:flex;flex-direction:column;gap:20px">'
      '<span style="width:52px;height:52px;border-radius:50%;background:var(--brand-soft);display:inline-flex;align-items:center;justify-content:center">' + I('cal', 'var(--brand)', 26) + '</span>'
      '<div style="display:flex;flex-direction:column;gap:8px"><span style="font-size:13px;color:var(--text-secondary)">Jedna sprawa czeka na Pana</span>'
      '<h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.02em">Wybierz dzień kontroli szczelności w serwerowni</h1>'
      '<p style="margin:0;font-size:16px;line-height:24px;color:var(--text-secondary)">Termin minął 17 listopada. Kontrola jest obowiązkowa (F-gaz) i mieści się w umowie.</p></div>'
      '<div style="display:flex;gap:10px">'
      '<button type="button" style="height:52px;padding:0 24px;border:0;border-radius:26px;background:var(--brand);color:var(--on-brand);font-size:16px;font-weight:600">Wybierz termin</button>'
      '<button type="button" style="height:52px;padding:0 20px;border:0;border-radius:26px;background:var(--bg-subtle);font-size:16px;font-weight:500">Później</button></div></section>')
    # reszta — spokojnie, w zdaniach
    def line(icon, col, t, m=''):
        mm = f'<span class="num" style="font-size:14px;color:var(--text-tertiary)">{m}</span>' if m else ''
        return f'<a href="#" class="r" style="display:flex;align-items:center;gap:14px;min-height:52px;padding:0 24px">{I(icon, col, 20)}<span class="ell" style="flex:1;font-size:16px">{t}</span>{mm}</a>'
    a('<div style="margin-top:44px;padding:0 24px 6px;font-size:13px;color:var(--text-tertiary)">Poza tym</div>')
    a(line('wrench', 'orange', 'Technik przyjedzie dziś o 9:00', 'naprawa'))
    a(line('file', 'violet', 'Oferta na salę konferencyjną czeka', '33 579 zł'))
    a(line('check', 'green', 'Wszystkie faktury opłacone'))
    # pole zgłoszenia nad paskiem
    a('<div style="position:absolute;left:16px;right:16px;bottom:24px;display:flex;flex-direction:column;gap:10px">'
      '<div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 8px 0 20px;border-radius:28px;background:var(--glass);backdrop-filter:blur(16px);box-shadow:var(--shadow-pop),inset 0 0 0 1px var(--edge)">'
      '<span style="flex:1;font-size:16px;color:var(--text-tertiary)">Opisz usterkę…</span>' + I('mic', 'var(--text-secondary)', 22) +
      '<button type="button" aria-label="Zdjęcie usterki" style="width:42px;height:42px;border:0;border-radius:50%;background:var(--brand);display:inline-flex;align-items:center;justify-content:center">' + I('camera', 'var(--on-brand)', 20) + '</button></div>'
      + tabs3(0) + '</div>')
    a('</div>')
    return '\n'.join(H)

# ------------------------------------------------------------------ B: Moje urządzenia
def ring(pct, col, center, sub, size=128, icon=None):
    r = 52; c = 2 * 3.14159 * r; d = c * pct
    mid = (f'<span style="display:flex;flex-direction:column;align-items:center;line-height:1">{I(icon, col, 26) if icon else ""}'
           f'<span class="num" style="font-size:{18 if icon else 24}px;font-weight:600;margin-top:{4 if icon else 0}px">{center}</span>'
           f'<span style="font-size:12px;color:var(--text-tertiary);margin-top:4px">{sub}</span></span>')
    return (f'<span style="position:relative;width:{size}px;height:{size}px;display:inline-flex;align-items:center;justify-content:center">'
            f'<svg width="{size}" height="{size}" viewBox="0 0 120 120" style="position:absolute;inset:0;transform:rotate(-90deg)" aria-hidden="true">'
            f'<circle cx="60" cy="60" r="{r}" fill="none" stroke="var(--bg-subtle)" stroke-width="8"></circle>'
            f'<circle cx="60" cy="60" r="{r}" fill="none" stroke="{col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="{d:.1f} {c:.1f}"></circle></svg>{mid}</span>')
def tile(name, code, rg, note, ncol='var(--text-secondary)'):
    return (f'<a href="#" style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0 4px;text-align:center">{rg}'
            f'<span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:500">{name}</span>'
            f'<span style="font-size:13px;color:{ncol}">{note}</span><span class="mono" style="font-size:11px;color:var(--text-tertiary)">{code}</span></span></a>')
def kier_b(dark=False):
    H = [f'<div class="ph{" dark" if dark else ""}" style="position:relative;width:100%;height:844px;overflow:hidden">', statusbar('7:41'), brandrow()]
    a = H.append
    a('<div style="padding:16px 24px 4px;display:flex;flex-direction:column;gap:4px"><h1 style="margin:0;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.02em">Twoje urządzenia</h1>'
      '<span style="font-size:14px;color:var(--text-secondary)">Pierścień pokazuje czas do następnego przeglądu</span></div>')
    a('<div style="display:grid;grid-template-columns:1fr 1fr;row-gap:18px;padding:18px 12px 0">' +
      tile('Serwerownia', 'UR-1988', ring(1, 'var(--danger)', '6 dni', 'po terminie'), 'kontrola szczelności', 'var(--danger)') +
      tile('Pokój zarządu', 'UR-1990', ring(.5, 'var(--warning)', 'dziś', 'naprawa', icon='wrench'), 'technik o 9:00', 'var(--warning)') +
      tile('Sala konferencyjna', 'UR-1991', ring(.62, 'var(--success)', '108', 'dni'), 'przegląd 11 mar') +
      tile('Recepcja', 'UR-1992', ring(.62, 'var(--success)', '108', 'dni'), 'przegląd 11 mar') + '</div>')
    # skan naklejki — główna akcja w tym kierunku
    a('<div style="position:absolute;left:16px;right:16px;bottom:24px;display:flex;flex-direction:column;gap:10px">'
      '<button type="button" style="height:56px;border:0;border-radius:28px;background:var(--brand);color:var(--on-brand);display:flex;align-items:center;justify-content:center;gap:10px;font-size:16px;font-weight:600">'
      + I('qr', 'var(--on-brand)', 22) + 'Zeskanuj naklejkę na urządzeniu</button>' + tabs3(1) + '</div>')
    a('</div>')
    return '\n'.join(H)

# B2: po zeskanowaniu naklejki — karta jednego urządzenia
def kier_b2(dark=False):
    H = [f'<div class="ph{" dark" if dark else ""}" style="position:relative;width:100%;height:844px;overflow:hidden">', statusbar('7:43')]
    a = H.append
    a('<div style="display:flex;align-items:center;gap:8px;padding:4px 16px">' + circ('back', 'Wstecz') + '<span style="flex:1"></span>' + circ('more', 'Więcej') + '</div>')
    a('<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:12px 24px 0;text-align:center">' +
      ring(1, 'var(--danger)', '6 dni', 'po terminie', size=168) +
      '<div style="display:flex;flex-direction:column;gap:4px"><h1 style="margin:0;font-size:26px;line-height:32px;font-weight:600;letter-spacing:-0.02em">Klimatyzacja serwerowni</h1>'
      '<span style="font-size:14px;color:var(--text-secondary)">Daikin FTXM35 · R410A 3,2 kg · <span class="mono">UR-1988</span></span></div></div>')
    def kv(icon, col, k, v):
        return f'<div style="display:flex;align-items:center;gap:14px;min-height:48px;padding:0 24px">{I(icon, col, 20)}<span style="flex:1;font-size:15px;color:var(--text-secondary)">{k}</span><span class="num" style="font-size:15px">{v}</span></div>'
    a('<div style="margin-top:20px;border-top:1px solid var(--edge);padding-top:6px">' +
      kv('shield', 'violet', 'Kontrola szczelności', 'co 12 mies.') + kv('cal', 'blue', 'Ostatnia wizyta', '17 lis 2025') +
      kv('contract', 'green', 'Umowa serwisowa', 'do 28 lut 2027') + kv('file', 'slate', 'Protokoły', '4') + '</div>')
    a('<div style="position:absolute;left:16px;right:16px;bottom:28px;display:flex;flex-direction:column;gap:10px">'
      '<button type="button" style="height:56px;border:0;border-radius:28px;background:var(--brand);color:var(--on-brand);font-size:16px;font-weight:600">Wybierz termin kontroli</button>'
      '<button type="button" style="height:56px;border:0;border-radius:28px;background:var(--bg-subtle);font-size:16px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px">' + I('alert', 'orange', 20) + 'Zgłoś usterkę tego urządzenia</button></div>')
    a('</div>')
    return '\n'.join(H)

def page2(title, h, inner):
    return page(title, 390, h, inner).replace('</style>', CSS_EXTRA + '\n</style>', 1)
OUT2 = [('Klient-A-co-teraz.dc.html', 'Klient · kierunek A „Co teraz”', kier_a()),
        ('Klient-A-co-teraz-ciemny.dc.html', 'Klient · kierunek A „Co teraz” · ciemny', kier_a(True)),
        ('Klient-B-urzadzenia.dc.html', 'Klient · kierunek B „Moje urządzenia”', kier_b()),
        ('Klient-B-urzadzenia-ciemny.dc.html', 'Klient · kierunek B „Moje urządzenia” · ciemny', kier_b(True)),
        ('Klient-B-urzadzenie.dc.html', 'Klient · kierunek B · po skanie naklejki', kier_b2()),
        ('Klient-B-urzadzenie-ciemny.dc.html', 'Klient · kierunek B · po skanie naklejki · ciemny', kier_b2(True))]
for f, t, inner in OUT2:
    open(D + f, 'w').write(page2('Avero — ' + t, 844, inner))
c = json.load(open(D + 'canvas.json'))
# rząd pod aplikacjami na telefon: A (jasny, ciemny) | przerwa | B (jasny, ciemny, po skanie jasny, ciemny)
xs = [7640, 8080, 8760, 9200, 9640, 10080]
for (f, t, _), x in zip(OUT2, xs):
    c['boards'][f] = {'h': 844, 'title': t, 'w': 390, 'x': x, 'y': 57260}
    if f not in c['order']:
        c['order'].append(f)
json.dump(c, open(D + 'canvas.json', 'w'), ensure_ascii=False, indent=2)
print('klient_tel: ' + ', '.join(f for f, *_ in OUT2))
