SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
D='design/canvas/'
TL='#9B6BE0'
THERMO='<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>'
GAUGE='<path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path>'
BOLT='<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>'
HOME='<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
AWARD='<path d="m15.48 12.89 1.52 8.55a.5.5 0 0 1-.81.47l-3.59-2.69a1 1 0 0 0-1.19 0l-3.6 2.7a.5.5 0 0 1-.8-.47l1.51-8.56"></path><circle cx="12" cy="8" r="6"></circle>'
WALLET='<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>'
DL='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path>'
MSG='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>'
LAYERS='<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12"></path><path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17"></path>'
TANK='<rect x="6" y="2" width="12" height="20" rx="4"></rect><path d="M6 8h12"></path>'
LOCKI='<rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
STAR='<path d="M11.52 2.3a.53.53 0 0 1 .96 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.17.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .29-.9l5.17-.76a2.12 2.12 0 0 0 1.6-1.16z"></path>'

CSS='''body{margin:0}
.ko{--bg-page:#F5F4F2;--bg-surface:#FFFFFF;--bg-subtle:#EDECE9;--bg-raised:#F4F3F0;--edge:rgba(27,26,25,.07);--border-strong:#D6D4D0;--text-primary:#1B1A19;--text-secondary:#63605B;--text-tertiary:#9C9893;--accent:#5E6AD2;--on-accent:#FFFFFF;--success:#2F9E5B;--warning:#C98A12;--ease:cubic-bezier(0.2,0,0,1);font-family:"Geist",system-ui,sans-serif;font-size:14px;line-height:22px;color:var(--text-primary);background:var(--bg-page);-webkit-font-smoothing:antialiased}
.ko *{box-sizing:border-box}
.ko a{color:inherit;text-decoration:none}
.ko button{font:inherit;color:inherit;cursor:pointer}
.ko .opt{transition:box-shadow 120ms var(--ease),background-color 120ms var(--ease)}
.ko .opt:hover{background:var(--bg-raised)}
.ko .pri:hover{filter:brightness(1.06)}
.ko .sec:hover{filter:brightness(0.97)}
.ko :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ko .mono{font-family:"Geist Mono",ui-monospace,monospace;letter-spacing:0}
.ko .num{font-variant-numeric:tabular-nums}
.ko .ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
@media (prefers-reduced-motion:reduce){.ko *{transition:none!important}}'''
def page(title,w,h,inner):
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
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:24px;display:inline-flex;align-items:center;gap:5px;padding:0 9px 0 7px;border-radius:12px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'
def radio(on):
    return (f'<span aria-hidden="true" style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;{"background:var(--accent)" if on else "box-shadow:inset 0 0 0 1.5px var(--border-strong)"};display:inline-flex;align-items:center;justify-content:center">'
            +('<span style="width:8px;height:8px;border-radius:50%;background:#fff"></span>' if on else '')+'</span>')
def cbox(on):
    return (f'<span aria-hidden="true" style="width:20px;height:20px;flex:0 0 auto;border-radius:6px;{"background:var(--accent);color:#fff" if on else "box-shadow:inset 0 0 0 1.5px var(--border-strong)"};display:inline-flex;align-items:center;justify-content:center">'
            +(ic(CHECK,14,'#fff') if on else '')+'</span>')
def h2(n,t,right=''):
    return (f'<div style="display:flex;align-items:center;gap:10px;min-height:28px"><span class="num" aria-hidden="true" style="width:22px;height:22px;border-radius:50%;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--text-secondary)">{n}</span>'
            f'<h2 style="margin:0;flex:1 1 auto;font-size:16px;line-height:24px;font-weight:600;letter-spacing:-0.01em">{t}</h2>{right}</div>')
VARS=[('A','Panasonic Aquarea T-CAP','9 kW','118 %','4,43','43 048,80',False,False),
      ('B','Daikin Altherma 3 R','8 kW','104 %','4,52','47 541,60',True,True),
      ('C','Daikin Altherma 3 H HT','14 kW','165 %','4,40','57 758,40',False,False)]
def spec(icon,col,label,val):
    return f'<span title="{label}" style="display:flex;align-items:center;gap:8px;font-size:13px;line-height:20px"><span style="display:inline-flex">{ic(icon,14,col)}</span><span style="flex:1 1 auto;color:var(--text-secondary)">{label}</span><span class="num" style="font-weight:500">{val}</span></span>'
def vcard(v,phone=False):
    L,name,p,cov,scop,price,sel,rec=v
    ring='box-shadow:inset 0 0 0 2px var(--accent);' if sel else ''
    recb=('<span title="Polecamy dla Pana domu" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:var(--bg-subtle);font-size:12px;color:var(--text-secondary)">'+ic(STAR,12,'#C98A12')+'Polecamy</span>') if rec else ''
    r=20 if phone else 14
    return (f'<button type="button" role="radio" aria-checked="{str(sel).lower()}" class="opt" style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:12px;padding:16px;border:0;border-radius:{r}px;background:var(--bg-surface);{ring}text-align:left">'
            f'<span style="display:flex;align-items:center;gap:10px;width:100%">{radio(sel)}<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Wariant {L}</span><span class="ell" style="font-weight:600">{name}</span></span>{recb}</span>'
            f'<span style="display:flex;flex-direction:column;gap:6px">{spec(BOLT,"#E0702A","Moc grzewcza",p)}{spec(THERMO,"#3B82D6","Pokrycie potrzeb domu",cov)}{spec(GAUGE,"#2BB3B1","Sprawność SCOP",scop)}</span>'
            f'<span style="display:flex;align-items:baseline;gap:6px"><span class="num" style="font-size:20px;line-height:28px;font-weight:600;letter-spacing:-0.01em">{price} zł</span><span style="font-size:12px;color:var(--text-tertiary)">brutto</span></span></button>')
GROUPS=[(BOX,'#3B82D6','Urządzenia','34 830,00',[('Jednostka zewnętrzna Daikin 8 kW','1 szt.'),('Moduł wewnętrzny z zasobnikiem 230 l','1 szt.'),('Sterownik z Wi-Fi — obsługa z telefonu','1 kpl')]),
        (LAYERS,'#2BB3B1','Materiały i armatura','5 907,60',[('Bufor 50 l','1 kpl'),('Instalacja chłodnicza z izolacją','8 m'),('Filtr magnetyczny, zawory, naczynie wzbiorcze','1 kpl'),('Fundament i podkładki antywibracyjne','1 kpl')]),
        (WRENCH,'#9B6BE0','Montaż i uruchomienie','6 156,00',[('Montaż i podłączenie do instalacji','2 dni'),('Uruchomienie, próba szczelności, nastawy','1 usł.')])]
def groups(phone=False):
    o=''
    for icon,col,n,s,items in GROUPS:
        li=''.join(f'<li style="display:flex;align-items:center;gap:10px;min-height:36px;padding:0 4px 0 30px"><span style="flex:1 1 auto;min-width:0;color:var(--text-secondary)">{t}</span><span class="num" style="font-size:13px;color:var(--text-tertiary);white-space:nowrap">{q}</span></li>' for t,q in items)
        o+=(f'<div style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:10px;min-height:40px;padding:0 4px">{ic(icon,16,col)}<span style="flex:1 1 auto;font-weight:500">{n}</span><span class="num" style="font-weight:500">{s} zł</span></div>'
            f'<ul style="margin:0;padding:0;list-style:none">{li}</ul></div>')
    return o
def opt(on,title,price,tag,tip):
    return (f'<button type="button" role="checkbox" aria-checked="{str(on).lower()}" class="opt" title="{tip}" style="width:100%;display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 16px;border:0;border-radius:14px;background:var(--bg-surface);text-align:left">'
            f'{cbox(on)}<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">{title}</span><span style="display:flex;gap:4px">{tag}</span></span><span class="num" style="font-weight:500;white-space:nowrap">{price}</span></button>')
OPTS=lambda: (opt(True,'Demontaż starego kotła gazowego','+648,00 zł',sch(ic(STAR,12,'#C98A12')+'Polecamy','Kocioł zostaje odłączony i wywieziony; gaz odcina instalator z uprawnieniami'),'Demontaż i wywóz kotła')+
              opt(False,'Przegląd roczny pompy ciepła','+637,20 zł / rok',sch(ic(AWARD,12,'#C98A12')+'Warunek gwarancji 5 lat','Gwarancja producenta 5 lat wymaga corocznego przeglądu'),'Umowa serwisowa: przegląd i kontrola szczelności raz w roku'))
def slot(on,d,days):
    return (f'<button type="button" role="radio" aria-checked="{str(on).lower()}" class="opt" style="flex:1 1 0;min-width:0;display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 16px;border:0;border-radius:14px;background:var(--bg-surface);{"box-shadow:inset 0 0 0 2px var(--accent);" if on else ""}text-align:left">'
            f'{radio(on)}<span style="display:flex;flex-direction:column"><span class="num" style="font-weight:500">{d}</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{days}</span></span></button>')
def cond(icon,col,t,v,tip=''):
    return f'<div title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:40px">{ic(icon,16,col)}<span style="flex:1 1 auto;color:var(--text-secondary)">{t}</span><span class="num" style="font-weight:500;text-align:right">{v}</span></div>'
CONDS=lambda: (cond(WALLET,'#2F9E5B','Zaliczka po akceptacji','14 262,48 zł','30 % kwoty brutto')+cond(CHECK,'var(--text-tertiary)','Reszta po uruchomieniu','33 279,12 zł','Przelew w 7 dni od faktury')+
               cond(AWARD,'#C98A12','Gwarancja producenta','5 lat','Przy corocznym przeglądzie')+cond(WRENCH,'#9B6BE0','Gwarancja na montaż','24 mies.')+cond(CAL,'var(--text-tertiary)','Oferta ważna do','2 gru 2026'))
DOCS=lambda: ''.join(f'<a href="#" class="sec" title="Pobierz PDF" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border-radius:16px;background:var(--bg-surface);font-size:13px;color:var(--text-secondary)">{ic(FILE,14,"var(--text-tertiary)")}{t}</a>' for t in ['Karty katalogowe','Deklaracje CE','Ogólne warunki','Obliczenie OZC'])
LOGO='<span aria-hidden="true" style="width:28px;height:28px;border-radius:8px;background:#1B1A19;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">K</span>'
def advisor(r=14):
    return (f'<div style="display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:{r}px;background:var(--bg-surface)">'
            f'<div style="display:flex;align-items:center;gap:10px">{cav("TL",TL,32,12)}<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">Tomasz Lewandowski</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Twój doradca · był na oględzinach 10 lis</span></span>'
            f'<a href="#" class="sec" aria-label="Zadzwoń do doradcy" title="+48 501 337 214" style="width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bg-subtle)">{ic(PHONE,16,"var(--text-secondary)")}</a></div>'
            '<p style="margin:0;color:var(--text-secondary)">Polecamy wariant B: pokrywa zapotrzebowanie domu z zapasem i pracuje cicho. Montaż zajmie 2 dni, a ogrzewanie wyłączymy tylko na kilka godzin w drugim dniu.</p></div>')
def summary(phone=False):
    rows=(f'<div style="display:flex;align-items:center;gap:10px"><span class="num" style="width:22px;height:22px;border-radius:6px;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">B</span><span style="flex:1 1 auto;font-weight:500">Daikin Altherma 3 R</span><span class="num">46 893,60 zł</span></div>'
          f'<div style="display:flex;align-items:center;gap:10px;color:var(--text-secondary)">{ic(CHECK,16,"var(--success)")}<span style="flex:1 1 auto">Demontaż kotła</span><span class="num">648,00 zł</span></div>'
          f'<div style="display:flex;align-items:center;gap:10px;color:var(--text-secondary)">{ic(CAL,16,"var(--text-tertiary)")}<span style="flex:1 1 auto">Montaż</span><span class="num">30 lis – 1 gru</span></div>')
    return ('<div style="display:flex;flex-direction:column;gap:14px;padding:20px;border-radius:16px;background:var(--bg-surface)">'
            '<h2 style="margin:0;font-size:16px;line-height:24px;font-weight:600">Twój wybór</h2>'+rows+
            '<div style="height:1px;background:var(--edge)"></div>'
            '<div style="display:flex;align-items:baseline;gap:8px"><span style="flex:1 1 auto;color:var(--text-secondary)">Razem</span><span class="num" style="font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.015em">47 541,60 zł</span></div>'
            '<div style="display:flex;justify-content:space-between;margin-top:-10px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span>brutto, z VAT 8 %</span><span class="num">netto 44 020,00 zł</span></div>'
            '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(WALLET,16,'#2F9E5B')+'<span style="flex:1 1 auto">Zaliczka teraz</span><span class="num" style="font-weight:600">14 262,48 zł</span></div>'
            '<button type="button" class="pri" style="height:48px;border:0;border-radius:14px;background:var(--accent);color:var(--on-accent);font-weight:600;font-size:15px">Akceptuję i płacę zaliczkę</button>'
            '<button type="button" class="sec" style="height:44px;border:0;border-radius:14px;background:var(--bg-subtle);font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:8px">'+ic(MSG,16,'var(--text-secondary)')+'Poproś o zmianę</button>'
            '<div style="display:flex;align-items:center;justify-content:center;gap:6px">'+sch('BLIK','Płatność BLIK')+sch('Karta','Karta płatnicza')+sch('Przelew','Szybki przelew')+'</div>'
            '<p style="margin:0;display:flex;gap:8px;font-size:12px;line-height:18px;color:var(--text-tertiary)">'+ic(LOCKI,14,'var(--text-tertiary)')+'<span>Akceptację potwierdzasz podpisem i kodem SMS. Termin montażu można zmienić do 3 dni przed.</span></p></div>')

def vrow(v):
    L,name,p,cov,scop,price,sel,rec=v
    ring='box-shadow:inset 0 0 0 2px var(--accent);' if sel else ''
    recb=(sch(ic(STAR,12,'#C98A12')+'Polecamy','Polecamy dla Pana domu')) if rec else ''
    chips=sch(ic(BOLT,12,'#E0702A')+p,'Moc grzewcza')+sch(ic(THERMO,12,'#3B82D6')+cov,'Pokrycie zapotrzebowania domu (7,4 kW przy −16 °C)')+sch(ic(GAUGE,12,'#2BB3B1')+'SCOP '+scop,'Sprawność sezonowa — im wyższa, tym niższe rachunki')
    return (f'<button type="button" role="radio" aria-checked="{str(sel).lower()}" class="opt" style="width:100%;display:flex;align-items:center;gap:14px;min-height:72px;padding:12px 18px 12px 16px;border:0;border-radius:14px;background:var(--bg-surface);{ring}text-align:left">'
            f'{radio(sel)}<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px"><span style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-tertiary)">{L}</span><span class="ell" style="font-weight:600">{name}</span>{recb}</span>'
            f'<span style="display:flex;gap:4px">{chips}</span></span>'
            f'<span style="display:flex;flex-direction:column;align-items:flex-end"><span class="num" style="font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.01em;white-space:nowrap">{price} zł</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">brutto</span></span></button>')
# ---------------- desktop
H=['<div class="ko" style="width:100%;min-height:1960px">']
a=H.append
a('<header style="display:flex;align-items:center;gap:12px;height:64px;padding:0 40px;background:var(--bg-surface)">'+LOGO+'<span style="font-weight:600">Kranz HVACR</span>'
  '<span style="flex:1 1 auto"></span><span class="mono" style="font-size:12px;color:var(--text-tertiary)">OF-2026-118</span>'+sch(ic(CAL,12,'var(--text-tertiary)')+'Ważna do 2 gru','Oferta ważna do środy, 2 grudnia 2026')+
  '<a href="#" class="sec" style="height:36px;display:inline-flex;align-items:center;gap:8px;padding:0 14px 0 12px;border-radius:12px;background:var(--bg-subtle);font-weight:500">'+ic(DL,16,'var(--text-secondary)')+'PDF</a></header>')
a('<main style="max-width:1120px;margin:0 auto;padding:40px 40px 64px;display:flex;gap:32px;align-items:flex-start">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:36px">')
a('<div style="display:flex;flex-direction:column;gap:16px"><div style="display:flex;flex-direction:column;gap:8px"><span style="color:var(--text-secondary)">Dzień dobry, Panie Marku. Oto oferta po naszych oględzinach.</span>'
  '<h1 style="margin:0;font-size:28px;line-height:36px;font-weight:600;letter-spacing:-0.02em">Pompa ciepła dla domu w Rumi</h1>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+sch(ic(HOME,12,'var(--text-tertiary)')+'Dębogórska 31, Rumia','Adres montażu','var(--bg-surface)')+sch(ic(HOME,12,'var(--text-tertiary)')+'160 m²','Powierzchnia ogrzewana','var(--bg-surface)')+sch(ic(THERMO,12,'#3B82D6')+'7,4 kW przy −16 °C','Zapotrzebowanie na ciepło z obliczeń OZC','var(--bg-surface)')+'</div></div>'+advisor()+'</div>')
a('<section style="display:flex;flex-direction:column;gap:14px">'+h2(1,'Wybierz wariant',sch(ic(LAYERS,12,'var(--text-tertiary)')+'Porównaj szczegóły','Pełne porównanie parametrów w PDF','var(--bg-surface)'))+
  '<div role="radiogroup" aria-label="Wariant" style="display:flex;flex-direction:column;gap:8px">'+''.join(vrow(v) for v in VARS)+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:14px">'+h2(2,'Co zawiera wariant B')+'<div style="display:flex;flex-direction:column;gap:8px;padding:12px 16px;border-radius:14px;background:var(--bg-surface)">'+groups()+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:14px">'+h2(3,'Dodatki')+'<div style="display:flex;flex-direction:column;gap:8px">'+OPTS()+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:14px">'+h2(4,'Termin montażu')+'<div role="radiogroup" aria-label="Termin montażu" style="display:flex;gap:12px">'+slot(True,'30 lis – 1 gru','poniedziałek i wtorek')+slot(False,'7 – 8 gru','poniedziałek i wtorek')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:14px"><h2 style="margin:0;font-size:16px;line-height:24px;font-weight:600">Warunki i dokumenty</h2><div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:14px;background:var(--bg-surface)">'+CONDS()+'</div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+DOCS()+'</div></section>')
a('</div>')
a('<aside style="flex:0 0 360px;position:sticky;top:24px">'+summary()+'</aside></main></div>')
open(D+'Klient-oferta.dc.html','w').write(page('Avero — oferta OF-2026-118, widok klienta',1440,1960,'\n'.join(H)))

# ---------------- phone
H=['<div class="ko" style="position:relative;width:100%;min-height:2700px;padding-bottom:120px">']
a=H.append
a('<header style="display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;background:var(--bg-surface)">'+LOGO+'<span style="font-weight:600">Kranz HVACR</span><span style="flex:1 1 auto"></span>'
  '<a href="#" class="sec" aria-label="Pobierz PDF" style="width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bg-subtle)">'+ic(DL,18,'var(--text-secondary)')+'</a></header>')
a('<main style="display:flex;flex-direction:column;gap:28px;padding:20px 16px 24px">')
a('<div style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;gap:6px;align-items:center"><span class="mono" style="font-size:12px;color:var(--text-tertiary)">OF-2026-118</span>'+sch(ic(CAL,12,'var(--text-tertiary)')+'do 2 gru','Oferta ważna do 2 grudnia 2026','var(--bg-surface)')+'</div>'
  '<h1 style="margin:0;font-size:24px;line-height:30px;font-weight:600;letter-spacing:-0.02em">Pompa ciepła dla domu w Rumi</h1>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+sch(ic(HOME,12,'var(--text-tertiary)')+'160 m²','Dom 160 m², Dębogórska 31','var(--bg-surface)')+sch(ic(THERMO,12,'#3B82D6')+'7,4 kW','Zapotrzebowanie na ciepło przy −16 °C','var(--bg-surface)')+'</div>'+advisor(20)+'</div>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+h2(1,'Wybierz wariant')+'<div role="radiogroup" aria-label="Wariant" style="display:flex;flex-direction:column;gap:10px">'+''.join(vcard(v,True) for v in VARS)+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+h2(2,'Co zawiera wariant B')+'<div style="display:flex;flex-direction:column;gap:4px;padding:8px 12px;border-radius:20px;background:var(--bg-surface)">'+groups(True)+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+h2(3,'Dodatki')+'<div style="display:flex;flex-direction:column;gap:8px">'+OPTS().replace('border-radius:14px','border-radius:20px')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+h2(4,'Termin montażu')+'<div role="radiogroup" aria-label="Termin montażu" style="display:flex;flex-direction:column;gap:8px">'+(slot(True,'30 lis – 1 gru','poniedziałek i wtorek')+slot(False,'7 – 8 gru','poniedziałek i wtorek')).replace('border-radius:14px','border-radius:20px')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:12px"><h2 style="margin:0;font-size:16px;line-height:24px;font-weight:600">Warunki</h2><div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:20px;background:var(--bg-surface)">'+CONDS()+'</div><div style="display:flex;flex-wrap:wrap;gap:6px">'+DOCS()+'</div></section>')
a('</main>')
a('<div style="position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:10px;padding:12px 16px 28px;background:var(--bg-surface);box-shadow:0 -8px 24px rgba(0,0,0,.06)">'
  '<div style="display:flex;align-items:baseline;gap:8px"><span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Wariant B + demontaż · brutto</span><span class="num" style="font-size:20px;line-height:28px;font-weight:600">47 541,60 zł</span></span>'
  '<span style="display:flex;flex-direction:column;align-items:flex-end"><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">zaliczka</span><span class="num" style="font-weight:500">14 262,48 zł</span></span></div>'
  '<button type="button" class="pri" style="height:52px;border:0;border-radius:16px;background:var(--accent);color:var(--on-accent);font-weight:600;font-size:16px">Akceptuję i płacę zaliczkę</button></div>')
a('</div>')
open(D+'Klient-oferta-telefon.dc.html','w').write(page('Avero — oferta OF-2026-118, widok klienta na telefonie',390,2700,'\n'.join(H)))
print('ok')

# ================= akceptacja na telefonie: podpis, płatność, gotowe
SIGP='<path d="M24 92c14-40 26-58 34-52s-10 46 0 42 22-48 30-42-4 36 6 34 14-22 22-22 4 16 14 14 20-16 30-16 6 10 16 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>'
def topbar(title,back=True):
    return ('<header style="display:flex;align-items:center;gap:8px;height:56px;padding:0 8px;background:var(--bg-page)">'
            +('<a href="#" aria-label="Wstecz" style="width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%">'+ic('<path d="m15 18-6-6 6-6"></path>',20,'var(--text-primary)')+'</a>' if back else '<span style="width:8px"></span>')+
            f'<span style="flex:1 1 auto;font-weight:600;font-size:16px">{title}</span><span class="num" style="padding-right:12px;font-size:13px;color:var(--text-tertiary)">{"" }</span></header>')
def steps(n):
    d=''.join(f'<span style="flex:1 1 0;height:4px;border-radius:2px;background:{"var(--accent)" if i<=n else "var(--bg-subtle)"}"></span>' for i in (1,2,3))
    return f'<div aria-label="Krok {n} z 3" style="display:flex;gap:6px;padding:0 16px 12px">{d}</div>'
def chk(on,txt,sub='',tip=''):
    s2=f'<span style="font-size:12px;line-height:18px;color:var(--text-tertiary)">{sub}</span>' if sub else ''
    return (f'<button type="button" role="checkbox" aria-checked="{str(on).lower()}" title="{tip}" style="width:100%;display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:0;border-radius:20px;background:var(--bg-surface);text-align:left">'
            f'<span style="padding-top:1px">{cbox(on)}</span><span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:14px;line-height:20px">{txt}</span>{s2}</span></button>')
def ptile(t,w=40,bg='#FFFFFF'):
    return f'<span aria-hidden="true" style="min-width:{w}px;height:24px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:{bg};box-shadow:inset 0 0 0 1px var(--edge);font-size:10px;line-height:12px;font-weight:600;letter-spacing:0.02em;color:var(--text-secondary)">{t}</span>'
def pm(on,name,sub,tiles,extra=''):
    ring='box-shadow:inset 0 0 0 2px var(--accent);' if on else ''
    return (f'<div style="display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-radius:20px;background:var(--bg-surface);{ring}">'
            f'<button type="button" role="radio" aria-checked="{str(on).lower()}" style="display:flex;align-items:center;gap:12px;border:0;background:transparent;padding:0;text-align:left">{radio(on)}'
            f'<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">{name}</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span><span style="display:flex;gap:4px">{tiles}</span></button>{extra}</div>')
def bottom(btn,note=''):
    n=f'<p style="margin:0;display:flex;gap:6px;justify-content:center;font-size:12px;line-height:16px;color:var(--text-tertiary)">{note}</p>' if note else ''
    return (f'<div style="position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;gap:10px;padding:12px 16px 28px;background:var(--bg-surface);box-shadow:0 -8px 24px rgba(0,0,0,.06)">{n}'
            f'<button type="button" class="pri" style="height:52px;border:0;border-radius:16px;background:var(--accent);color:var(--on-accent);font-weight:600;font-size:16px">{btn}</button></div>')
mini=('<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:20px;background:var(--bg-surface)">'
      '<span class="num" style="width:28px;height:28px;border-radius:8px;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:600">B</span>'
      '<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">Daikin Altherma 3 R + demontaż</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">montaż 30 lis – 1 gru</span></span>'
      '<span class="num" style="font-weight:600;white-space:nowrap">47 541,60 zł</span></div>')
# 1 podpis
H=['<div class="ko" style="position:relative;width:100%;height:900px;overflow:hidden">',topbar('Akceptacja oferty'),steps(1),
   '<main style="display:flex;flex-direction:column;gap:12px;padding:4px 16px">',mini,
   chk(True,'Akceptuję ofertę i <a href="#" style="text-decoration:underline">ogólne warunki umowy</a>'),
   chk(True,'Proszę o montaż przed upływem 14 dni na odstąpienie od umowy','Termin 30 lis wypada w tym okresie. Jeśli odstąpię po rozpoczęciu prac, zapłacę za wykonaną część.','Wymagane przy umowie zawartej na odległość, gdy montaż ma się zacząć wcześniej niż po 14 dniach'),
   '<div style="display:flex;flex-direction:column;gap:8px;padding:14px 16px 12px;border-radius:20px;background:var(--bg-surface)">'
   '<div style="display:flex;align-items:center"><span style="flex:1 1 auto;font-weight:500">Podpis</span><button type="button" style="height:32px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:var(--text-secondary)">Wyczyść</button></div>'
   '<div role="img" aria-label="Pole podpisu — podpisz palcem" style="position:relative;height:180px;border-radius:14px;background:var(--bg-raised);color:var(--text-primary)">'
   '<svg width="100%" height="100%" viewBox="0 0 330 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+SIGP+'</svg>'
   '<span aria-hidden="true" style="position:absolute;left:20px;right:20px;bottom:40px;height:1px;background:var(--border-strong)"></span>'
   '<span style="position:absolute;left:20px;bottom:16px;font-size:12px;color:var(--text-tertiary)">Marek Zieliński · podpisz palcem</span></div></div>',
   '</main>',bottom('Dalej: zaliczka 14 262,48 zł'),'</div>']
open(D+'Klient-akceptacja-podpis.dc.html','w').write(page('Avero — akceptacja oferty: podpis',390,900,'\n'.join(H)))
# 2 płatność
blik=('<div style="display:flex;flex-direction:column;gap:6px;padding-left:32px"><label for="blik" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Kod BLIK z aplikacji banku</label>'
      '<input id="blik" class="num" inputmode="numeric" value="482 916" style="height:52px;border:0;border-radius:14px;background:var(--bg-subtle);padding:0 16px;font:inherit;font-size:22px;letter-spacing:0.18em;font-weight:500;color:var(--text-primary)"></div>')
H=['<div class="ko" style="position:relative;width:100%;height:900px;overflow:hidden">',topbar('Zaliczka'),steps(2),
   '<main style="display:flex;flex-direction:column;gap:12px;padding:4px 16px">',
   '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0 4px"><span style="font-size:13px;color:var(--text-tertiary)">Do zapłaty teraz · 30 %</span><span class="num" style="font-size:32px;line-height:40px;font-weight:600;letter-spacing:-0.02em">14 262,48 zł</span><span style="font-size:12px;color:var(--text-tertiary)">faktura zaliczkowa trafi na e-mail</span></div>',
   pm(True,'BLIK','kod z aplikacji banku',ptile('BLIK'),blik),
   pm(False,'Szybki przelew','wybór banku · Przelewy24',ptile('P24')),
   pm(False,'Karta płatnicza','debetowa lub kredytowa',ptile('VISA')+ptile('MC',32)),
   pm(False,'Apple Pay','',ptile('Apple Pay',64)),
   pm(False,'Google Pay','',ptile('G Pay',48)),
   '</main>',bottom('Zapłać 14 262,48 zł',ic(LOCKI,14,'var(--text-tertiary)')+'<span>Płatność obsługuje Przelewy24</span>'),'</div>']
open(D+'Klient-akceptacja-platnosc.dc.html','w').write(page('Avero — akceptacja oferty: zaliczka',390,900,'\n'.join(H)))
# 3 gotowe
def tl(icon,col,t,sub,state):
    dotc={'done':'var(--success)','next':'var(--accent)','todo':'var(--border-strong)'}[state]
    return (f'<li style="display:flex;gap:12px;align-items:flex-start;min-height:52px"><span style="width:28px;height:28px;flex:0 0 auto;border-radius:50%;background:var(--bg-raised);display:inline-flex;align-items:center;justify-content:center">{ic(icon,14,col)}</span>'
            f'<span style="flex:1 1 auto;display:flex;flex-direction:column;padding-top:3px"><span style="font-weight:500;color:{"var(--text-primary)" if state!="todo" else "var(--text-secondary)"}">{t}</span><span class="num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span>'
            f'<span aria-hidden="true" style="margin-top:11px;width:6px;height:6px;border-radius:50%;background:{dotc}"></span></li>')
H=['<div class="ko" style="position:relative;width:100%;height:900px;overflow:hidden">',topbar('Gotowe',False),steps(3),
   '<main style="display:flex;flex-direction:column;gap:16px;padding:8px 16px">',
   '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 0 4px;text-align:center"><span style="width:56px;height:56px;border-radius:50%;background:var(--bg-surface);display:inline-flex;align-items:center;justify-content:center">'+ic(CHECK,28,'var(--success)')+'</span>'
   '<h1 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.015em">Oferta zaakceptowana</h1><span style="color:var(--text-secondary)">Umowę i fakturę zaliczkową wysłaliśmy na<br>m.zielinski@poczta.onet.pl</span></div>',
   '<div style="padding:8px 16px;border-radius:20px;background:var(--bg-surface)"><ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column">'+
   tl(WALLET,'#2F9E5B','Zaliczka opłacona','14 262,48 zł · BLIK · dziś 14:52','done')+
   tl(BOX,'#3B82D6','Zamawiamy urządzenia','dostawa do 20 lis','next')+
   tl(WRENCH,'#9B6BE0','Montaż','pon. 30 lis – wt. 1 gru · przypomnimy SMS-em','todo')+
   tl(CHECK,'var(--text-tertiary)','Uruchomienie i odbiór','protokół, instrukcja, aplikacja','todo')+
   tl(FILE,'var(--text-tertiary)','Faktura końcowa','33 279,12 zł po odbiorze','todo')+'</ol></div>',
   '<div style="display:flex;gap:8px"><a href="#" class="sec" style="flex:1 1 0;height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:16px;background:var(--bg-surface);font-weight:500">'+ic(CAL,16,'var(--text-secondary)')+'Do kalendarza</a>'
   '<a href="#" class="sec" style="flex:1 1 0;height:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:16px;background:var(--bg-surface);font-weight:500">'+ic(DL,16,'var(--text-secondary)')+'Umowa PDF</a></div>',
   '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:20px;background:var(--bg-surface)">'+cav('TL',TL,32,12)+'<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">Pytania? Tomasz Lewandowski</span><span class="num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">+48 501 337 214</span></span>'
   '<a href="#" aria-label="Zadzwoń" style="width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bg-subtle)">'+ic(PHONE,16,'var(--text-secondary)')+'</a></div>',
   '</main></div>']
open(D+'Klient-akceptacja-gotowe.dc.html','w').write(page('Avero — akceptacja oferty: gotowe',390,900,'\n'.join(H)))
print('ok3')

# ================= po montażu: dokumenty i dopłata (telefon klienta)
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
SIGN='<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
RECEIPT='<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path>'
BOOK='<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>'
def doc(icon,col,t,sub):
    return (f'<a href="#" style="display:flex;align-items:center;gap:12px;min-height:60px;padding:0 4px;border-bottom:1px solid var(--edge)"><span style="width:36px;height:36px;flex:0 0 auto;border-radius:12px;background:var(--bg-raised);display:inline-flex;align-items:center;justify-content:center">{ic(icon,18,col)}</span>'
            f'<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span class="ell" style="font-weight:500">{t}</span><span class="ell num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span>{ic(DL,18,"var(--text-tertiary)")}</a>')
H=['<div class="ko" style="position:relative;width:100%;height:960px;overflow:hidden">',
   '<header style="display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;background:var(--bg-surface)">'+LOGO+'<span style="font-weight:600">Kranz HVACR</span></header>',
   '<main style="display:flex;flex-direction:column;gap:16px;padding:20px 16px">',
   '<div style="display:flex;flex-direction:column;gap:6px"><span style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--success)">'+ic(CHECK,16,'var(--success)')+'Montaż zakończony 1 gru</span>'
   '<h1 style="margin:0;font-size:24px;line-height:30px;font-weight:600;letter-spacing:-0.02em">Pompa ciepła działa</h1><span style="color:var(--text-secondary)">Poniżej dokumenty i pozostała płatność. Wszystko zostaje pod tym linkiem.</span></div>',
   '<div style="display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:20px;background:var(--bg-surface)">'
   '<div style="display:flex;align-items:baseline;gap:8px"><span style="flex:1 1 auto;color:var(--text-secondary)">Do zapłaty</span><span class="num" style="font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.015em">33 279,12 zł</span></div>'
   '<div class="num" style="display:flex;justify-content:space-between;margin-top:-8px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span>termin 8 grudnia</span><span>zaliczka 14 262,48 zł zapłacona</span></div>'
   '<button type="button" class="pri" style="height:52px;border:0;border-radius:16px;background:var(--accent);color:var(--on-accent);font-weight:600;font-size:16px">Zapłać</button>'
   '<div style="display:flex;justify-content:center;gap:4px">'+ptile('BLIK')+ptile('P24')+ptile('VISA')+ptile('MC',32)+ptile('Apple Pay',64)+ptile('G Pay',48)+'</div></div>',
   '<section style="display:flex;flex-direction:column;gap:8px"><h2 style="margin:0;font-size:16px;line-height:24px;font-weight:600">Dokumenty</h2><div style="display:flex;flex-direction:column;padding:0 12px;border-radius:20px;background:var(--bg-surface)">'+
   doc(RECEIPT,'#2F9E5B','Faktura końcowa','FV/2026/12/003 · PDF')+doc(RECEIPT,'var(--text-tertiary)','Faktura zaliczkowa','FZ/2026/11/014 · PDF')+doc(SIGN,'#9B6BE0','Protokół uruchomienia i odbioru','podpisany 1 gru · PDF')+
   doc(AWARD,'#C98A12','Gwarancja producenta 5 lat','zarejestrowana · do 1 gru 2031')+doc(BOOK,'#3B82D6','Instrukcja obsługi','Daikin Altherma 3 R · PDF').replace('border-bottom:1px solid var(--edge)','',1 if False else 0)+'</div></section>',
   '<div style="display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:20px;background:var(--bg-surface)">'
   '<div style="display:flex;align-items:center;gap:10px">'+ic(CYC,18,'#2BB3B1')+'<span style="flex:1 1 auto;font-weight:600">Przegląd roczny</span>'+sch(ic(AWARD,12,'#C98A12')+'warunek gwarancji','Gwarancja 5 lat wymaga przeglądu co 12 miesięcy')+'</div>'
   '<span style="color:var(--text-secondary)">Pierwszy przegląd przypada w grudniu 2027. Z umową przypomnimy o nim sami i przyjedziemy w ustalonym terminie.</span>'
   '<div style="display:flex;align-items:center;gap:10px"><span class="num" style="flex:1 1 auto;font-weight:500">637,20 zł / rok</span>'
   '<button type="button" class="sec" style="height:44px;padding:0 18px;border:0;border-radius:16px;background:var(--bg-subtle);font-weight:500">Dodaj umowę</button></div></div>',
   '</main></div>']
open(D+'Klient-po-montazu.dc.html','w').write(page('Avero — klient: po montażu',390,960,'\n'.join(H)))
print('ok4')

# ================= klient firmowy: wybór terminu kontroli szczelności
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
SHIELD2='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
def tslot(on,d,h,tag=''):
    return (f'<button type="button" role="radio" aria-checked="{str(on).lower()}" class="opt" style="width:100%;display:flex;align-items:center;gap:12px;min-height:60px;padding:10px 16px;border:0;border-radius:20px;background:var(--bg-surface);{"box-shadow:inset 0 0 0 2px var(--accent);" if on else ""}text-align:left">'
            f'{radio(on)}<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">{d}</span><span class="num" style="font-size:13px;line-height:18px;color:var(--text-secondary)">{h}</span></span>{tag}</button>')
H=['<div class="ko" style="position:relative;width:100%;height:844px;overflow:hidden">',
   '<header style="display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;background:var(--bg-surface)">'+LOGO+'<span style="font-weight:600">Kranz HVACR</span></header>',
   '<main style="display:flex;flex-direction:column;gap:14px;padding:20px 16px">',
   '<div style="display:flex;flex-direction:column;gap:8px"><span style="color:var(--text-secondary)">Piekarnia Rogal · Chylońska 70</span>'
   '<h1 style="margin:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.015em">Wybierz termin kontroli szczelności</h1>'
   '<div style="display:flex;flex-wrap:wrap;gap:6px">'+sch(ic(SNOW,12,'#3B82D6')+'Komora mroźnicza','R452A 8 kg · UR-2871','var(--bg-surface)')+sch(ic(SHIELD2,12,'#D6453D')+'obowiązek do 9 gru','Kontrola szczelności co 12 miesięcy wynika z przepisów F-gaz; ostatnia 9 gru 2025','var(--bg-surface)')+sch(ic(CLOCK,12,'var(--text-tertiary)')+'ok. 1,5 h','Komora pracuje w trakcie kontroli','var(--bg-surface)')+'</div></div>',
   '<div role="radiogroup" aria-label="Termin kontroli" style="display:flex;flex-direction:column;gap:8px">'+
   tslot(True,'Środa, 9 grudnia','8:00 – 9:30',sch(ic(STAR,12,'#C98A12')+'technik w okolicy','Tego dnia jesteśmy 2 km od Państwa — najszybszy termin'))+
   tslot(False,'Czwartek, 10 grudnia','13:00 – 14:30')+tslot(False,'Piątek, 11 grudnia','6:30 – 8:00','<span style="font-size:12px;color:var(--text-tertiary)">przed otwarciem</span>')+'</div>',
   '<a href="#" style="display:flex;align-items:center;justify-content:center;gap:8px;height:44px;border-radius:16px;color:var(--text-secondary)">'+ic(PHONE,16,'var(--text-secondary)')+'Żaden nie pasuje — zadzwońcie do mnie</a>',
   '<div style="display:flex;gap:10px;align-items:center;padding:12px 16px;border-radius:20px;background:var(--bg-surface)">'+cav('KN','#1FA7A5',32,12)+'<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">Przyjedzie Kacper Nowak</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">robił kontrolę w zeszłym roku</span></span></div>',
   '</main>',bottom('Potwierdź 9 grudnia, 8:00'),'</div>']
open(D+'Klient-przeglad-termin.dc.html','w').write(page('Avero — klient: wybór terminu kontroli',390,844,'\n'.join(H)))
print('ok5')
