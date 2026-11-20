P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])          # helpers: ic, ib, capd, h3, ah3, chip, meta, cav, icons...
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()

TL='#9B6BE0'
STAR='<path d="M11.52 2.3a.53.53 0 0 1 .96 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.17.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .29-.9l5.17-.76a2.12 2.12 0 0 0 1.6-1.16z"></path>'
SPARK='<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"></path>'
THERMO='<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>'
GAUGE='<path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path>'
BOLT='<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'
GRIP='<circle cx="9" cy="6" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="18" r="1"></circle>'
COIN='<circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path>'
WALLET='<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>'
AWARD='<path d="m15.48 12.89 1.52 8.55a.5.5 0 0 1-.81.47l-3.59-2.69a1 1 0 0 0-1.19 0l-3.6 2.7a.5.5 0 0 1-.8-.47l1.51-8.56"></path><circle cx="12" cy="8" r="6"></circle>'
HOME='<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>'
CLIPB='<rect width="8" height="4" x="8" y="2" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>'
IMG='<rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"></path>'
TAG='<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5"></circle>'
LAYERS='<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12"></path><path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17"></path>'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
FILEDOC=FILE
SEND2='<path d="M14.54 21.69a.5.5 0 0 0 .93-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.93l7.93 3.18a2 2 0 0 1 1.11 1.11z"></path><path d="m21.85 2.15-10.94 10.94"></path>'
MINUS='<path d="M5 12h14"></path>'

def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'

H=[];a=H.append
a('<sc-if value="{{isOf}}" hint-placeholder-val="{{false}}">')
# ---- top bar
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">')
a('<span style="display:inline-flex;color:var(--text-secondary)">'+ic(FILE,16)+'</span>')
a('<a href="#" class="flink" style="color:var(--text-secondary);white-space:nowrap">Sprzedaż</a>'+ic(CHEV,14,'var(--text-tertiary)'))
a('<a href="#" class="flink" style="color:var(--text-secondary);white-space:nowrap">Oferty</a>'+ic(CHEV,14,'var(--text-tertiary)'))
a('<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">OF-2026-118</h1>')
a('<span title="Zapisano automatycznie 10:27" style="display:inline-flex;align-items:center;gap:4px;margin-left:4px;font-size:12px;color:var(--text-tertiary)">'+ic(CHECK,12,'var(--text-tertiary)')+'Zapisano</span>')
a(SP+ib('Kopiuj link','Kopiuj link  ⌘⇧C',LINK)+ib('Duplikuj ofertę','Duplikuj  ⌘D',LAYERS)+ib('Więcej akcji','Więcej akcji',DOTS))
a('</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
# ---- title + caps + actions
a('<div style="display:flex;align-items:flex-start;gap:16px;padding:12px 24px 16px">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">')
a('<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Pompa ciepła powietrze–woda, dom 160 m²</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+
  meta(HOME,'Marek Zieliński','Klient indywidualny · +48 604 219 553')+meta(PIN,'Dębogórska 31, Rumia','Dom jednorodzinny 160 m², grzejniki + podłogówka na parterze')+
  meta(CLIPB,'<span class="mono" style="font-size:11px">OG-0412</span>','Oględziny 10 lis · Tomasz Lewandowski · 14 zdjęć, OZC')+meta(TASK if 'TASK' in globals() else CHECKC,'<span class="mono" style="font-size:11px">ZD-121</span>','Zadanie: Oferta na pompę ciepła Daikin, termin jutro')+'</div></div>')
draft='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" stroke-dasharray="2.2 1.6" style="stroke:var(--text-tertiary)"></circle></svg>'
caps=['<sc-if value="{{isOfNA}}" hint-placeholder-val="{{true}}">'+capd(draft+'Szkic','Status oferty  S')+'</sc-if><sc-if value="{{isOfA}}" hint-placeholder-val="{{false}}">'+capd(ic(CHECK,14,'var(--success)')+'Zaakceptowana','Zaakceptowana przez klienta dziś 14:51 · podpis i zaliczka')+'</sc-if>',
 capd(cav('TL',TL)+'Tomasz','Opiekun oferty: Tomasz Lewandowski  A','0 10px 0 4px'),
 '<sc-if value="{{isOfNA}}" hint-placeholder-val="{{true}}">'+capd(ic(CAL,14,'var(--text-tertiary)')+'Ważna do 2 gru','Ważność 14 dni od wysłania · do środy, 2 grudnia 2026  ⇧D')+'</sc-if>',
 capd(dot('#E0702A')+'Pompy ciepła','Etykieta  L','0 10px'),
 '<button type="button" class="capd" aria-label="Dodaj właściwość" title="Dodaj właściwość" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;color:var(--text-secondary);padding:0">'+ic(PLUS,14)+'</button>']
a('<div aria-label="Właściwości oferty" style="display:flex;flex-wrap:wrap;gap:6px">'+''.join(caps)+'</div>')
a('</div>')
a('<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto">'
  '<button type="button" class="sec" title="Podgląd PDF  ⌘P" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(EYE,14)+'Podgląd PDF</button>'
  '<sc-if value="{{isOfNA}}" hint-placeholder-val="{{true}}">'+'<button type="button" class="pri" title="Wyślij ofertę do klienta  ⌘↵" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(SEND2,14)+'Wyślij ofertę</button></sc-if>'+
  '<sc-if value="{{isOfA}}" hint-placeholder-val="{{false}}"><button type="button" class="pri" title="Otwórz zlecenie ZS-1052  G Z" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(WRENCH,14)+'Zlecenie ZS-1052</button></sc-if></div>')
a('</div>')
# ---- wizard steps
def step(n,t,state,tip):
    if state=='done':
        badge=f'<span aria-hidden="true" style="width:18px;height:18px;border-radius:50%;background:var(--bg-surface);display:inline-flex;align-items:center;justify-content:center;color:var(--success)">{ic(CHECK,12)}</span>'
        st='color:var(--text-secondary)'; bg='transparent'
    elif state=='cur':
        badge=f'<span class="num" aria-hidden="true" style="width:18px;height:18px;border-radius:50%;background:var(--text-primary);color:var(--bg-surface);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600">{n}</span>'
        st='color:var(--text-primary);font-weight:500'; bg='var(--bg-surface)'
    else:
        badge=f'<span class="num" aria-hidden="true" style="width:18px;height:18px;border-radius:50%;background:var(--bg-subtle);color:var(--text-tertiary);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:500">{n}</span>'
        st='color:var(--text-tertiary)'; bg='transparent'
    cur=' aria-current="step"' if state=='cur' else ''
    return f'<li><a href="#"{cur} class="sec" title="{tip}" style="height:28px;display:inline-flex;align-items:center;gap:8px;padding:0 12px 0 5px;border-radius:14px;background:{bg};{st};white-space:nowrap">{badge}{t}</a></li>'
sep='<li aria-hidden="true" style="flex:0 0 16px;height:1px;background:var(--edge)"></li>'
for kk,cur in (('P',3),('W',4),('S',5),('A',6)):
    st=lambda n:'done' if n<cur else ('cur' if n==cur else 'todo')
    a('<sc-if value="{{isOf'+kk+'}}" hint-placeholder-val="{{false}}"><div style="padding:0 24px 20px"><ol aria-label="Kroki kreatora oferty" style="margin:0;padding:4px;list-style:none;display:flex;align-items:center;gap:4px;border-radius:12px;background:var(--bg-raised);width:max-content">'+
      step(1,'Klient',st(1),'Marek Zieliński · klient indywidualny')+sep+step(2,'Oględziny',st(2),'OG-0412 · obciążenie cieplne 7,4 kW przy −16 °C')+sep+
      step(3,'Warianty i pozycje',st(3),'3 warianty · 10 pozycji  ⌘3')+sep+step(4,'Warunki',st(4),'Płatność, termin, gwarancja  ⌘4')+sep+step(5,'Wysyłka',st(5),'E-mail i SMS z linkiem do akceptacji online  ⌘5')+'</ol></div></sc-if>')
a('<sc-if value="{{isOfP}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;flex-direction:column;gap:28px;padding:0 24px 32px;max-width:960px">')
# ---- variants
def var(letter,name,model,power,scop,cover,covc,price,sel=False,rec=False,warn=None):
    ring='box-shadow:inset 0 0 0 2px var(--accent);' if sel else ''
    chips=sch(ic(BOLT,12,'var(--text-tertiary)')+power,'Moc grzewcza przy A−7/W35')+sch(ic(GAUGE,12,'var(--text-tertiary)')+scop,'SCOP, klimat umiarkowany, W35')+sch(ic(THERMO,12,covc)+cover,'Pokrycie obciążenia 7,4 kW przy −16 °C')
    r=('<span title="Polecany przez opiekuna" style="display:inline-flex;color:#C98A12">'+ic(STAR,14,'#C98A12')+'</span>') if rec else ''
    w=(f'<span title="{warn}" style="display:inline-flex;color:var(--warning)">'+ic(WARN,14)+'</span>') if warn else ''
    return (f'<button type="button" role="radio" aria-checked="{str(sel).lower()}" class="sec" title="{model}" style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:10px;padding:12px 14px;border:0;border-radius:12px;background:var(--bg-raised);{ring}text-align:left">'
            f'<span style="display:flex;align-items:center;gap:8px;width:100%"><span class="num" aria-hidden="true" style="width:20px;height:20px;border-radius:6px;background:{"var(--accent)" if sel else "var(--bg-subtle)"};color:{"var(--on-accent)" if sel else "var(--text-secondary)"};display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600">{letter}</span>'
            f'<span class="ell" style="flex:1 1 auto;font-weight:500">{name}</span>{w}{r}</span>'
            f'<span style="display:flex;flex-wrap:wrap;gap:4px">{chips}</span>'
            f'<span style="display:flex;align-items:baseline;gap:6px"><span class="num" style="font-size:15px;line-height:22px;font-weight:600">{price}</span><span style="font-size:12px;color:var(--text-tertiary)">netto</span></span></button>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Warianty',CNT(3)+SP+ghost(ic(LAYERS,14)+'Porównaj','Porównanie wariantów w PDF dla klienta  ⌘⇧V'))+
  '<div role="radiogroup" aria-label="Wariant oferty" style="display:flex;gap:8px">'+
  var('A','Panasonic T-CAP','Panasonic Aquarea T-CAP WH-UX09HE8 + WH-SDC0309K3E5','9 kW','4,43','118 %','var(--success)','39 860,00 zł',warn='Brak bufora — instalacja ma zawory termostatyczne')+
  var('B','Daikin Altherma 3 R','Daikin Altherma 3 R ERGA08EV + EHVH08S23E6V, zasobnik 230 l','8 kW','4,52','104 %','var(--success)','44 020,00 zł',sel=True,rec=True)+
  var('C','Daikin Altherma 3 H HT','Daikin Altherma 3 H HT EPRA14DV + ETVH16S18E6V, wysokotemperaturowa','14 kW','4,40','165 %','var(--text-tertiary)','53 480,00 zł')+
  '<button type="button" class="ghost" title="Nowy wariant  ⇧N" aria-label="Dodaj wariant" style="flex:0 0 56px;display:flex;align-items:center;justify-content:center;border:0;border-radius:12px;outline:1.5px dashed var(--border-strong);outline-offset:-1.5px;color:var(--text-tertiary)">'+ic(PLUS,16)+'</button></div></section>')
# ---- Avero suggestions (decision)
a('<div role="note" style="display:flex;flex-direction:column;gap:2px;margin-top:-16px;padding:8px 8px 8px 12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:center;gap:8px;min-height:32px">'+ic(SPARK,16,'var(--accent)')+'<span class="ell" title="Z oględzin OG-0412: parter ma ogrzewanie podłogowe na osobnym obiegu z mieszaczem" style="flex:1 1 auto;min-width:0">Dodać grupę pompową z mieszaczem — podłogówka ma osobny obieg.</span>'+
  sch(ic(IMG,12,'var(--text-tertiary)')+'3','3 zdjęcia rozdzielacza z oględzin OG-0412','var(--bg-surface)')+
  '<button type="button" class="sec" title="Dodaj: grupa pompowa z mieszaczem, 1 kpl, 1 980,00 zł" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500;font-size:12px;white-space:nowrap">Dodaj · 1 980 zł</button>'+
  ib('Odrzuć sugestię','Odrzuć',MINUS if False else '<path d="M18 6 6 18M6 6l12 12"></path>',28,'var(--text-tertiary)')+'</div></div>')
# ---- positions
def stock(kind,txt,tip):
    c={'ok':'var(--success)','order':'var(--warning)','none':'var(--text-tertiary)'}[kind]
    return sch(dot(c)+txt,tip)
COLS='16px minmax(0,1fr) 128px 88px 112px 120px'
def row(name,code,stk,qty,unit,price,val,opt=False,tip=''):
    o=sch(ic(TAG,12,'var(--text-tertiary)')+'Opcja','Pozycja opcjonalna: klient zaznacza w akceptacji online') if opt else ''
    c=f'<span class="mono" style="font-size:11px;color:var(--text-tertiary);white-space:nowrap">{code}</span>' if code else ''
    return (f'<div role="row" class="row" title="{tip}" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;min-height:40px;padding:0 8px;border-radius:10px">'
            f'<span aria-hidden="true" style="display:inline-flex;color:var(--text-tertiary);opacity:.6">{ic(GRIP,14)}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0"><span class="ell" style="color:{"var(--text-secondary)" if opt else "var(--text-primary)"}">{name}</span>{c}{o}</span>'
            f'<span role="cell">{stk}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{qty} <span style="color:var(--text-tertiary)">{unit}</span></span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{price}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-weight:500;color:{"var(--text-secondary)" if opt else "var(--text-primary)"}">{val}</span></div>')
def grp(icon,col,name,n,sum_,mar,mtip,rows):
    return ('<div role="rowgroup" style="display:flex;flex-direction:column">'
            f'<div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 8px;border-radius:10px;background:var(--bg-raised)">{ic(icon,14,col)}<span style="font-weight:500">{name}</span>{CNT(n)}{SP}'
            f'{sch(ic(COIN,12,"var(--text-tertiary)")+mar,mtip,"var(--bg-surface)")}<span class="num" style="width:120px;text-align:right;font-weight:500">{sum_}</span></div>'
            +''.join(rows)+'</div>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Pozycje · wariant B',CNT(10)+SP+ghost(ic(BOX,14)+'Z cennika','Dodaj z cennika Daikin 11/2026  ⌘I')+ghost(ic(PLUS,14)+'Pozycja','Nowa pozycja  ⇧A'))+
  '<div role="table" aria-label="Pozycje oferty, wariant B" style="display:flex;flex-direction:column;gap:6px">'
  f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;height:24px;padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span></span><span role="columnheader">Pozycja</span><span role="columnheader">Dostępność</span><span role="columnheader" style="text-align:right">Ilość</span><span role="columnheader" style="text-align:right">Cena netto</span><span role="columnheader" style="text-align:right">Wartość</span></div>'+
  grp(BOX,'#3B82D6','Urządzenia',3,'32 250,00','17 %','Marża na urządzeniach · cena zakupu z cennika dystrybutora 11/2026',[
    row('Jednostka zewnętrzna 8 kW','ERGA08EV',stock('order','5 dni','Do zamówienia u dystrybutora · dostawa do 20 lis'),'1','szt.','14 900,00','14 900,00',tip='Daikin Altherma 3 R ERGA08EV, R32 1,5 kg'),
    row('Moduł wewn. + zasobnik 230 l','EHVH08S23E6V',stock('ok','Magazyn 1','Magazyn główny, regał B2 · rezerwacja po akceptacji'),'1','szt.','16 200,00','16 200,00'),
    row('Sterownik Madoka + moduł Wi-Fi','BRC1HHDW',stock('ok','Magazyn 3','Magazyn główny'),'1','kpl','1 150,00','1 150,00')])+
  grp(LAYERS,'#2BB3B1','Materiały i armatura',4,'5 470,00','38 %','Marża na materiałach',[
    row('Bufor 50 l z osprzętem','',stock('ok','Magazyn 2','Magazyn główny'),'1','kpl','2 380,00','2 380,00'),
    row('Instalacja freonowa 3/8″ + 5/8″ z izolacją','',stock('ok','Bus TL','W busie Tomasza: 12 m'),'8','m','95,00','760,00'),
    row('Armatura: filtr, zawory, naczynie 18 l','',stock('ok','Magazyn','Magazyn główny'),'1','kpl','1 640,00','1 640,00'),
    row('Fundament + antywibracja','',stock('order','2 dni','Do zamówienia'),'1','kpl','690,00','690,00')])+
  grp(WRENCH,'#9B6BE0','Robocizna',3,'6 300,00','60 %','Marża na robociźnie · 2 osoby, 2 dni',[
    row('Montaż i podłączenie hydrauliczne','',sch(ic(CLOCK,12,'var(--text-tertiary)')+'2 dni','2 techników · TL + MZ'),'1','usł.','4 800,00','4 800,00'),
    row('Uruchomienie i protokół F-gaz','',sch(ic(SHIELD,12,'var(--text-tertiary)')+'F-gaz','Kontrola szczelności i wpis do CRO po uruchomieniu'),'1','usł.','900,00','900,00'),
    row('Demontaż kotła gazowego','',sch(ic(CLOCK,12,'var(--text-tertiary)')+'3 h','Odcięcie gazu przez instalatora z uprawnieniami G3'),'1','usł.','600,00','600,00',opt=True)])+
  '</div></section>')
a('</div></sc-if>')
exec(open('design/tools/oferta_ws.py').read())
a('</div>')
# ---- aside
a('<aside aria-label="Podsumowanie oferty OF-2026-118" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Podsumowanie',sch('B','Wariant B · Daikin Altherma 3 R'))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Urządzenia','32 250,00 zł')+kv('Materiały i armatura','5 470,00 zł')+kv('Robocizna','6 300,00 zł',tip='W tym opcja: demontaż kotła 600,00 zł')+
  '<div style="height:1px;margin:6px 0;background:var(--edge)"></div>'+
  kv('Netto','44 020,00 zł',w=500)+
  '<div title="VAT 8 %: dostawa z montażem w budynku mieszkalnym do 300 m² (dom 160 m²)" style="display:flex;align-items:baseline;gap:8px;min-height:24px"><span style="flex:1 1 auto;display:inline-flex;align-items:center;gap:6px;color:var(--text-secondary)">VAT 8 %'+ic(INFO,12,'var(--text-tertiary)')+'</span><span class="num" style="white-space:nowrap">3 521,60 zł</span></div>'+
  '<div style="display:flex;align-items:baseline;gap:8px;min-height:32px;padding-top:4px"><span style="flex:1 1 auto;color:var(--text-secondary)">Brutto</span><span class="num" style="font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.01em">47 541,60 zł</span></div>'
  '</div>'
  # margin bar
  '<div title="Marża 25,5 % · 11 206 zł · próg firmy 22 %" style="display:flex;flex-direction:column;gap:6px;margin:4px 4px 0;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:center;gap:6px">'+ic(COIN,14,'var(--success)')+'<span style="flex:1 1 auto;color:var(--text-secondary)">Marża</span><span class="num" style="font-weight:500">25,5 %</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">11 206 zł</span></div>'
  '<div aria-hidden="true" style="position:relative;height:6px;border-radius:3px;background:var(--bg-subtle)"><div style="position:absolute;left:0;top:0;bottom:0;width:63.75%;border-radius:3px;background:var(--success)"></div><div style="position:absolute;left:55%;top:-3px;bottom:-3px;width:2px;border-radius:1px;background:var(--text-tertiary)"></div></div>'
  '<div class="num" style="display:flex;justify-content:space-between;font-size:11px;line-height:14px;color:var(--text-tertiary)"><span>0 %</span><span style="margin-left:15%">próg 22 %</span><span>40 %</span></div></div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Warunki',ghost('Krok 4','Przejdź do warunków  ⌘4'))+
  prop(WALLET,'Zaliczka 30 %','Zaliczka 30 % po akceptacji (14 262,48 zł brutto), reszta po uruchomieniu · przelew 7 dni')+
  prop(CAL,'Montaż w tyg. 49','Proponowany termin: 30 lis – 4 gru 2026 · wolne 2 dni TL + MZ w planowaniu')+
  prop(AWARD,'Gwarancja 5 lat','Gwarancja producenta 5 lat pod warunkiem corocznego przeglądu',sch(ic(CYCLE,12,'var(--text-tertiary)') if 'CYCLE' in globals() else '','') if False else sch('12 mies.','Przegląd co 12 miesięcy · propozycja umowy serwisowej'))+
  prop(SHIELD,'Dofinansowanie','Klient planuje wniosek o dofinansowanie · dołącz karty katalogowe i deklaracje zgodności',sch(dot('#2F9E5B')+'Dokumenty','Karty i deklaracje dołączone automatycznie'))+
  '</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Klient')+
  prop(HOME,'Marek Zieliński','Klient indywidualny · KL-0388 · pierwszy kontakt 4 lis z formularza www',sch('Nowy','Nowy klient · źródło: formularz www'))+
  prop(PIN,'Dębogórska 31, Rumia','Dom 160 m², rok budowy 2008 · kocioł gazowy 24 kW do wymiany')+
  prop(AT,'m.zielinski@poczta.onet.pl','E-mail do wysyłki oferty i akceptacji online',ib('Zadzwoń','Zadzwoń: +48 604 219 553',PHONE,24),plain=True)+
  '</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Załączniki',CNT(4))+
  '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+
  sch(ic(FILE,12,'var(--text-tertiary)')+'Karty katalogowe','2 karty katalogowe Daikin · PDF, dołączane do wariantu')+
  sch(ic(THERMO,12,'var(--text-tertiary)')+'OZC','Obliczenie obciążenia cieplnego: 7,4 kW przy −16 °C')+
  sch(ic(IMG,12,'var(--text-tertiary)')+'14','14 zdjęć z oględzin OG-0412 (tylko wewnętrznie)')+
  sch(ic(SHIELD,12,'var(--text-tertiary)')+'Deklaracje','Deklaracje zgodności CE')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Aktywność')+
  '<div style="display:flex;flex-direction:column;gap:8px;padding:4px 8px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+
  f'<span style="display:flex;align-items:center;gap:8px" title="Środa, 18 listopada 2026, 10:21">{cav("TL",TL,16,8)}<span class="ell" style="flex:1 1 auto">Wariant B oznaczony jako polecany</span><span class="num" style="color:var(--text-tertiary)">10:21</span></span>'
  f'<span style="display:flex;align-items:center;gap:8px" title="Wtorek, 17 listopada 2026, 16:05">{cav("TL",TL,16,8)}<span class="ell" style="flex:1 1 auto">Utworzono z oględzin OG-0412</span><span class="num" style="color:var(--text-tertiary)">wczoraj</span></span>'
  '</div></section>')
a('</aside></div></sc-if>')
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"')
s=s[:i]+block+s[i:]
# JS flags
s=s.replace("const isZl = ekran === 'zlecenie'; const nZl = navv(isZl);","const isZl = ekran === 'zlecenie'; const nZl = navv(isZl); const isOf = ekran === 'oferta'; const nOf = navv(isOf);",1)
s=s.replace("isZlec: isZl, actZl: nZl.act,","isZlec: isZl, isOf, isOfP: isOf && krokV === 'pozycje', isOfW: isOf && krokV === 'warunki', isOfS: isOf && krokV === 'wysyłka', isOfA: isOf && krokV === 'zaakceptowana', isOfNA: krokV !== 'zaakceptowana', actOf: nOf.act, colOf: nOf.col, wOf: nOf.w, selOf: nOf.sel, actZl: nZl.act,",1)
s=s.replace('"zlecenie", "planowanie"]','"zlecenie", "oferta", "planowanie"]',1)
s=s.replace(', "$preview":',', "krok": {"editor": "enum", "options": ["pozycje", "warunki", "wysyłka", "zaakceptowana"], "default": "pozycje", "section": "Widok"}, "$preview":',1)
s=s.replace("const planV = this.props.plan ?? 'dzień';","const planV = this.props.plan ?? 'dzień'; const krokV = this.props.krok ?? 'pozycje';",1)
# nav link
old='<a href="#" class="nav" style="display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-radius:8px;color:var(--text-secondary)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"></path></svg><span class="ell" style="flex:1 1 auto;font-weight:400">Oferty</span></a>'
assert s.count(old)==1
new=old.replace('class="nav"','class="nav {{actOf}}" title="G O"').replace('color:var(--text-secondary)">','color:{{colOf}}">',1).replace('font-weight:400">Oferty','font-weight:{{wOf}}">Oferty')
s=s.replace(old,new)
# tab
zt=s.index('<button type="button" role="tab" aria-selected="{{selZl}}"'); zte=s.index('</button>',zt)+9
oft=('\n<sc-if value="{{isOf}}" hint-placeholder-val="{{false}}"><button type="button" role="tab" aria-selected="{{selOf}}" class="dtab {{actOf}}" title="OF-2026-118 · Pompa ciepła, dom 160 m²  ⌘8" style="flex:0 1 auto;min-width:0;max-width:200px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;color:{{colOf}};font-size:12px;font-weight:{{wOf}}">'+ic(FILE,14)+'<span class="ell">OF-2026-118 Pompa ciepła</span></button></sc-if>')
s=s[:zte]+oft+s[zte:]
open(P,'w').write(s); print('ok', len(s))
