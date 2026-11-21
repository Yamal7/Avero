# Projekty: oś czasu wszystkich projektów w realizacji + obciążenie zespołu. Scenariusz: sobota 21 lis 2026.
from datetime import date
SRCP=open('design/tools/projekty.py').read()
exec(SRCP.split("# =================== LISTA")[0])     # helpery, ikony, kolory osób, s
P='design/canvas/Main.dc.html'; s=open(P).read()
SER='#2a78d6'
D0=date(2026,8,17); D1=date(2027,2,15); TOT=(D1-D0).days
def x(d): return (d-D0).days/TOT*100
def span(a,b): return f'left:{x(a):.3f}%;width:{max(x(b)-x(a),0.6):.3f}%'
TODAY=date(2026,11,21)
MONTHS=[(date(2026,8,17),'sie'),(date(2026,9,1),'wrz'),(date(2026,10,1),'paź'),(date(2026,11,1),'lis'),(date(2026,12,1),'gru'),(date(2027,1,1),'sty 2027'),(date(2027,2,1),'lut')]
LW='300px'
def grid(h='100%'):
    g=''.join(f'<span aria-hidden="true" style="position:absolute;top:0;bottom:0;left:{x(d):.3f}%;width:1px;background:var(--edge)"></span>' for d,_ in MONTHS[1:])
    return g
def today_line(label=False):
    t=f'<span aria-hidden="true" style="position:absolute;top:0;bottom:0;left:{x(TODAY):.3f}%;width:1.5px;background:var(--accent)"></span>'
    return t
def axis():
    labs=''.join(f'<span style="position:absolute;left:calc({x(d):.3f}% + 6px);top:4px;font-size:12px;color:var(--text-tertiary);white-space:nowrap">{m}</span>' for d,m in MONTHS[1:])
    tl=f'<span title="Sobota 21 listopada 2026" style="position:absolute;left:{x(TODAY):.3f}%;top:2px;transform:translateX(-50%);height:20px;display:inline-flex;align-items:center;padding:0 6px;border-radius:6px;background:var(--accent);color:var(--on-accent);font-size:11px;font-weight:500;white-space:nowrap">dziś 21 lis</span>'
    return (f'<div style="display:grid;grid-template-columns:{LW} minmax(0,1fr);height:28px;padding:0 20px 0 20px">'
            f'<span style="font-size:12px;color:var(--text-tertiary);align-self:center;padding-left:10px">Projekt</span><div style="position:relative">{labs}{tl}</div></div>')
def pbar(a,b,pct,tip,warn=False):
    fill=f'<span style="position:absolute;left:0;top:0;bottom:0;width:{pct}%;background:{SER};border-radius:6px 0 0 6px{";border-radius:6px" if pct>=99 else ""}"></span>'
    ring='box-shadow:inset 0 0 0 1.5px var(--warning);' if warn else ''
    return f'<span title="{tip}" style="position:absolute;top:10px;height:20px;{span(a,b)};border-radius:6px;background:var(--bg-subtle);overflow:hidden;{ring}">{fill}</span>'
def mark(d,tip,kind='odb'):
    return f'<span title="{tip}" style="position:absolute;top:13px;left:calc({x(d):.3f}% - 7px);width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center">{ic(FLAG,12,"var(--text-secondary)")}</span>'
FLAG='<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.33 2q2 0 3.67-.8a1 1 0 0 1 1 .8v11a1 1 0 0 1-.4.8 6 6 0 0 1-3.6 1.2c-3 0-5-2-7.33-2q-2 0-3.67.8"></path>'
CHEVD='<path d="m6 9 6 6 6-6"></path>'; CHEVR='<path d="m9 18 6-6-6-6"></path>'
def prow(no,icon,col,name,cli,who,pct,end,bars,open_=False,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    car=ic(CHEVD if open_ else CHEVR,14,'var(--text-tertiary)')
    return (f'<div role="row" class="row" aria-expanded="{str(open_).lower()}" style="display:grid;grid-template-columns:{LW} minmax(0,1fr);align-items:stretch;min-height:44px;padding:0 20px;{bg}">'
            f'<div style="display:flex;align-items:center;gap:8px;min-width:0;padding:4px 12px 4px 4px">{car}<span style="width:24px;height:24px;border-radius:8px;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto">{ic(icon,14,col)}</span>'
            f'<span style="display:flex;flex-direction:column;min-width:0;flex:1 1 auto"><span class="ell" style="font-weight:500">{name}</span><span style="display:flex;gap:6px;min-width:0;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span class="mono" style="font-size:11px;white-space:nowrap">{no}</span><span class="ell">{cli}</span></span></span>'
            f'<span class="num" style="font-size:12px;color:var(--text-secondary);white-space:nowrap">{pct} %</span>{who}</div>'
            f'<div style="position:relative">{grid()}{bars}{today_line()}</div></div>')
def stage(name,a,b,state,pct=0,tip=''):
    if state=='done': inner=f'<span style="position:absolute;inset:0;background:var(--success);opacity:.8"></span>'; lab=ic(CHECK,12,'var(--success)')
    elif state=='cur': inner=f'<span style="position:absolute;left:0;top:0;bottom:0;width:{pct}%;background:{SER}"></span>'; lab=f'<span class="num" style="font-size:12px;color:var(--text-secondary)">{pct} %</span>'
    else: inner=''; lab=''
    bar_=f'<span title="{tip}" style="position:absolute;top:8px;height:16px;{span(a,b)};border-radius:5px;background:var(--bg-subtle);overflow:hidden">{inner}</span>'
    return (f'<div role="row" style="display:grid;grid-template-columns:{LW} minmax(0,1fr);align-items:stretch;min-height:32px;padding:0 20px">'
            f'<div style="display:flex;align-items:center;gap:8px;min-width:0;padding:0 12px 0 66px;font-size:12px"><span class="ell" style="flex:1 1 auto;color:{"var(--text-secondary)" if state!="todo" else "var(--text-tertiary)"}">{name}</span>{lab}</div>'
            f'<div style="position:relative">{grid()}{bar_}{today_line()}</div></div>')
H=[];a=H.append
a('<sc-if value="{{isPjO}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(LAYERS,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Projekty</h1><span style="width:8px"></span>'+
  tabs([('W realizacji','4'),('Moje','2'),('Zakończone 2026','7')])+SP+
  '<span role="radiogroup" aria-label="Widok" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">'
  '<span role="radio" aria-checked="false" title="Lista" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border-radius:8px;color:var(--text-secondary);font-size:12px">Lista</span>'
  '<span role="radio" aria-checked="true" title="Oś czasu  ⇧G" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border-radius:8px;background:var(--bg-surface);font-size:12px;font-weight:500">Oś czasu</span></span>'+
  ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowy projekt','Nowy projekt — z wygranej szansy albo pusty  C',PLUS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;flex-direction:column;min-height:0;min-width:0">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd(ic(CAL,14,'var(--text-tertiary)')+'sie 2026 – lut 2027','Zakres osi · ← → przesuwa o miesiąc')+capd('Tygodnie','Skala: tygodnie / miesiące / kwartały')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Suma wartości kontraktów netto w realizacji">W realizacji <span class="num" style="color:var(--text-primary);font-weight:500">1 334 800 zł</span></span>'
  '<span title="Do zafakturowania w grudniu wg harmonogramów płatności">Do zafakturowania w gru. <span class="num" style="color:var(--text-primary);font-weight:500">384 360 zł</span></span>'
  '<span title="Kacper: 23–30 lis dwa projekty jednocześnie" style="display:inline-flex;align-items:center;gap:4px;color:var(--warning)">'+ic(WARN,12,'var(--warning)')+'1 konflikt ludzi</span></span></div>')
a(axis())
# projekty
a(prow('PJ-2026-011',WIND,'#2BB3B1','Klimatyzacja VRV · 42 pokoje','Hotel Bryza · Sopot',cav('TL',TL),60,'18 gru',
       pbar(date(2026,9,14),date(2026,12,18),60,'14 wrz – 18 gru · 60 % · montaż jednostek 28 z 42',warn=False)+mark(date(2026,12,18),'Odbiór 14–18 gru · transza 30 % 145 800 zł'),open_=True,sel=True))
for n,a_,b_,st_,p_,t_ in [
    ('Przygotowanie',date(2026,9,14),date(2026,10,2),'done',0,'14 wrz – 2 paź'),
    ('Dostawy',date(2026,9,28),date(2026,10,16),'done',0,'ZK/2026/09/044, 047'),
    ('Instalacja freonowa i skropliny',date(2026,10,5),date(2026,11,6),'done',0,'Próba ciśnieniowa 6 lis, PC-011'),
    ('Montaż jednostek wewn.',date(2026,10,26),date(2026,12,4),'cur',67,'28 z 42 · piętro 3 od pon 23 lis (ZS-1071)'),
    ('Elektryka i sterowanie',date(2026,11,9),date(2026,12,4),'cur',45,'Elektro-Bud · sterowniki grupowe wt 24 lis'),
    ('Uruchomienie',date(2026,12,7),date(2026,12,11),'todo',0,'7–11 gru · TL'),
    ('Odbiór',date(2026,12,14),date(2026,12,18),'todo',0,'14–18 gru')]:
    a(stage(n,a_,b_,st_,p_,t_))
a(prow('PJ-2026-009',FAN,'#C98A12','Wentylacja z odzyskiem ciepła','Szkoła Podstawowa nr 4 · Rumia',cav('PK',PKC),92,'30 lis',
       pbar(date(2026,8,24),date(2026,11,30),92,'24 sie – 30 lis · odbiory, 6 z 6 central')+mark(date(2026,11,30),'Odbiór końcowy pon 30 lis')))
a(prow('PJ-2026-008',FLAME,'#E0702A','Pompy ciepła w 6 domach','Osiedle Leśne Zacisze · Chwaszczyno',cav('TL',TL),50,'22 sty',
       pbar(date(2026,10,5),date(2026,12,22),55,'5 paź – 22 gru: montaż · domy 1–3 gotowe')+
       f'<span title="Przerwa świąteczna 23 gru – 6 sty" style="position:absolute;top:10px;height:20px;{span(date(2026,12,23),date(2027,1,6))};border-radius:6px;background:repeating-linear-gradient(135deg,var(--bg-subtle) 0 3px,transparent 3px 6px)"></span>'+
       pbar(date(2027,1,7),date(2027,1,22),0,'7–22 sty: uruchomienia i odbiory domów 4–6')+mark(date(2027,1,22),'Odbiór końcowy pt 22 sty')))
a(prow('PJ-2026-013',SNOW,'#3B82D6','Chłodzenie serwerowni · 2 agregaty','Biurowiec Kwadrant · Gdynia',cav('PK',PKC),10,'12 lut',
       pbar(date(2026,11,9),date(2027,2,12),10,'9 lis – 12 lut · przygotowanie · montaż od pon 7 gru')+mark(date(2027,2,12),'Odbiór pt 12 lut')))
# zespół
a(f'<div style="display:grid;grid-template-columns:{LW} minmax(0,1fr);height:36px;padding:12px 20px 0"><span style="display:flex;align-items:center;gap:8px;padding-left:10px;font-size:12px;font-weight:500;color:var(--text-secondary)">{ic(PEOPLE,14,"var(--text-tertiary)")}Zespół w projektach</span><span></span></div>')
def tb(a_,b_,label,tip,lane=0,warn=False,muted=False):
    top=6 if lane==0 else 22
    h=14 if lane in (0,1) else 14
    bg='var(--bg-subtle)'
    ring='box-shadow:inset 0 0 0 1.5px var(--warning);' if warn else ''
    return (f'<span title="{tip}" style="position:absolute;top:{top}px;height:{h}px;{span(a_,b_)};border-radius:4px;background:{bg};{ring}overflow:hidden;display:flex;align-items:center;padding:0 6px">'
            +(f'<span class="mono ell" style="font-size:10px;line-height:14px;color:{"var(--text-tertiary)" if muted else "var(--text-secondary)"}">{label}</span>' if x(b_)-x(a_)>4 else '')+'</span>')
def person(ini,col,name,bars,note=''):
    return (f'<div role="row" style="display:grid;grid-template-columns:{LW} minmax(0,1fr);align-items:stretch;min-height:42px;padding:0 20px">'
            f'<div style="display:flex;align-items:center;gap:8px;min-width:0;padding:0 12px 0 28px">{cav(ini,col)}<span class="ell" style="flex:1 1 auto">{name}</span>{note}</div>'
            f'<div style="position:relative">{grid()}{bars}{today_line()}</div></div>')
a(person('TL',TL,'Tomasz Lewandowski',tb(date(2026,10,26),date(2026,12,4),'PJ-011 montaż','Montaż jednostek wewn. · Hotel Bryza')+tb(date(2026,12,7),date(2026,12,11),'PJ-011','Uruchomienie VRV')+
         tb(date(2027,1,7),date(2027,1,22),'PJ-008 uruchomienia','Pompy ciepła, domy 4–6')+tb(date(2026,9,14),date(2026,10,23),'PJ-011','Przygotowanie i instalacja freonowa',lane=0,muted=True)))
a(person('MZ',MZC,'Mateusz Zieliński',tb(date(2026,10,26),date(2026,12,4),'PJ-011 montaż','Montaż jednostek wewn. · Hotel Bryza')+tb(date(2026,12,7),date(2027,1,22),'PJ-013 montaż','Chłodzenie serwerowni — montaż agregatów i rurociągów')))
a(person('KN',KN,'Kacper Nowak',tb(date(2026,10,19),date(2026,11,20),'PJ-008 domy 1–3','Montaż pomp ciepła, domy 1–3 — gotowe',muted=True)+
         tb(date(2026,11,23),date(2026,12,22),'PJ-008 domy 4–6','Montaż pomp ciepła, domy 4–6',lane=0,warn=True)+tb(date(2026,11,16),date(2026,11,30),'PJ-009 odbiory','Pomiary i odbiory central — SP nr 4',lane=1,warn=True),
         note=f'<span title="23–30 lis: PJ-008 i PJ-009 jednocześnie" style="display:inline-flex">{ic(WARN,14,"var(--warning)")}</span>'))
a(person('PD',PD,'Piotr Dąbrowski',tb(date(2026,12,7),date(2027,1,22),'PJ-013 montaż','Chłodzenie serwerowni — z Mateuszem')+
         f'<span style="position:absolute;top:6px;left:{x(date(2026,8,17)):.3f}%;font-size:11px;line-height:14px;color:var(--text-tertiary);padding-left:6px">serwis i przeglądy do 4 gru</span>'))
a(person('EB','#8A8F98','Elektro-Bud · podwykonawca',tb(date(2026,11,9),date(2026,12,4),'PJ-011 elektryka','Elektryka i sterowanie · umowa 28 000 zł')))
# notatka
a('<div role="note" style="display:flex;align-items:flex-start;gap:10px;margin:16px 20px 24px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(WARN,16,'var(--warning)')+
  '<div style="display:flex;flex-direction:column;gap:2px;flex:1 1 auto"><span style="font-weight:500">Kacper: 23–30 lis dwa projekty jednocześnie</span>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Montaż pomp ciepła w domach 4–6 (PJ-2026-008) i odbiory wentylacji w SP nr 4 (PJ-2026-009, pomiary 25–27 lis). Przesunięcie odbiorów nie zagraża terminowi 30 lis, albo pomiary przejmie Piotr w czwartek 26 lis (ma wtedy tylko przeglądy).</span></div>'+
  btn('Pokaż w Planowaniu','Otwórz Planowanie na tydzień 23–27 lis, filtr: Kacper',CAL)+'</div>')
a('</div></sc-if>')
block='\n'.join(H)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x_,y_):
    global s; assert s.count(x_)==1,x_[:60]; s=s.replace(x_,y_)
rep("const nPj = navv(isPjL || isPjR);","const isPjO = ekran === 'projekty oś'; const nPj = navv(isPjL || isPjR || isPjO);")
rep("isPjL, isPjR, actPj:","isPjL, isPjR, isPjO, actPj:")
rep('"projekty", "projekt", ','"projekty", "projekty oś", "projekt", ')
open(P,'w').write(s); print('ok projekty2',len(s))
