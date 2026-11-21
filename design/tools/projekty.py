# Projekty: lista realizacji wieloetapowych i rekord PJ-2026-011 (Hotel Bryza, VRV 42 pokoi). Scenariusz: sobota 21 lis 2026.
from datetime import date
P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'; PKC='#5F636B'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
LAYERS='<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
PEOPLE='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
COIN='<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"></path>'
WIND='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>'
FLAME='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
FAN='<circle cx="12" cy="12" r="2"></circle><path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4l-4 4M14 12c4 0 7 1 7 4 0 2-2 3-4 2l-4-4M12 14c0 4-1 7-4 7-2 0-3-2-2-4l4-4M10 12c-4 0-7-1-7-4 0-2 2-3 4-2l4 4"></path>'
CART='<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def btn(t,tip,icon='',pri=False,h=28):
    if pri: return f'<button type="button" class="pri" title="{tip}" style="height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'
def tabs(items,cur=0):
    return ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))
def bar(p,col='var(--text-secondary)',w='100%'):
    return f'<span aria-hidden="true" style="display:block;width:{w};height:4px;border-radius:2px;background:var(--bg-subtle);overflow:hidden"><span style="display:block;width:{p}%;height:100%;border-radius:2px;background:{col}"></span></span>'
def marg(plan,prog,warn=False,done=False):
    col='var(--warning)' if warn else 'var(--text-primary)'
    w_=f'<span style="display:inline-flex">{ic(WARN,12,"var(--warning)")}</span>' if warn else ''
    lab='wynik' if done else 'prognoza'
    return (f'<span title="Plan {plan} · {lab} {prog}" style="display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;white-space:nowrap" class="num">'
            f'<span style="color:var(--text-tertiary)">{plan}</span><span style="color:var(--text-tertiary)">→</span>{w_}<span style="color:{col};font-weight:500">{prog}</span></span>')

# =================== LISTA
COLS='92px minmax(0,1.7fr) minmax(0,1fr) 112px 104px 104px 132px 24px'
def row(no,icon,col,name,cli,phase,phasetip,pct,end,endtip,val,mg,who,endcol='var(--text-secondary)'):
    return (f'<div role="row" class="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;min-height:52px;padding:4px 10px;border-radius:10px">'
            f'<span role="cell" class="mono" style="font-size:12px;color:var(--text-tertiary);white-space:nowrap">{no}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:10px;min-width:0">{ic(icon,14,col)}<span style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:500">{name}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{cli}</span></span></span>'
            f'<span role="cell" class="ell" title="{phasetip}" style="font-size:12px;color:var(--text-secondary)">{phase}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px"><span style="flex:1 1 auto">{bar(pct)}</span><span class="num" style="font-size:12px;color:var(--text-secondary);width:40px;text-align:right;white-space:nowrap">{pct} %</span></span>'
            f'<span role="cell" class="num" title="{endtip}" style="text-align:right;font-size:12px;color:{endcol};white-space:nowrap">{end}</span>'
            f'<span role="cell" class="num" style="text-align:right">{val}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end;font-size:12px">{mg}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{who}</span></div>')
H=[];a=H.append
a('<sc-if value="{{isPjL}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(LAYERS,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Projekty</h1><span style="width:8px"></span>'+
  tabs([('W realizacji','4'),('Moje','2'),('Zakończone 2026','7')])+SP+ib('Harmonogram wszystkich projektów','Oś czasu  ⇧G',CAL)+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowy projekt','Nowy projekt — z wygranej szansy albo pusty  C',PLUS)+'</div>')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'+capd(ic(USER,14,'var(--text-tertiary)')+'Kierownik: wszyscy','Kierownik projektu')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Suma wartości kontraktów netto w realizacji">W realizacji <span class="num" style="color:var(--text-primary);font-weight:500">1 334 800 zł</span></span>'
  '<span title="Średnia ważona wartością · plan 23,7 %">Marża — prognoza <span class="num" style="color:var(--text-primary);font-weight:500">23,2 %</span></span>'
  '<span title="Do zafakturowania w grudniu wg harmonogramów płatności">Do zafakturowania w gru. <span class="num" style="color:var(--text-primary);font-weight:500">384 360 zł</span></span>'
  '<span title="PJ-2026-011 — prognoza marży 2,2 pp poniżej planu" style="display:inline-flex;align-items:center;gap:4px;color:var(--warning)">'+ic(WARN,12,'var(--warning)')+'1 poniżej planu</span></span></div>')
a('<div role="table" aria-label="Projekty" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Nr</span><span>Projekt · klient</span><span>Etap</span><span>Postęp</span><span style="text-align:right">Koniec</span><span style="text-align:right">Wartość netto</span><span style="text-align:right" title="Plan → prognoza na koniec">Marża</span><span></span></div>')
a(row('PJ-2026-011',WIND,'#2BB3B1','Klimatyzacja VRV · 42 pokoje','Hotel Bryza · Sopot','Montaż jednostek wewn. · 4 z 7','28 z 42 jednostek zamontowanych',60,'18 gru','Piątek 18 grudnia · bez opóźnień','486 000',marg('24,0 %','21,8 %',True),cav('TL',TL)))
a(row('PJ-2026-009',FAN,'#C98A12','Wentylacja z odzyskiem ciepła','Szkoła Podstawowa nr 4 · Rumia','Odbiory · 6 z 6','Odbiór końcowy pon 30 lis',92,'30 lis','Poniedziałek 30 listopada','312 000',marg('22,0 %','23,1 %'),cav('PK',PKC)))
a(row('PJ-2026-008',FLAME,'#E0702A','Pompy ciepła w 6 domach','Osiedle Leśne Zacisze · Chwaszczyno','Montaż · 3 z 6 domów','Etap 3 z 5 · domy 1–3 uruchomione',50,'22 sty 2027','Piątek 22 stycznia 2027 · przerwa świąteczna 23 gru – 6 sty','268 800',marg('25,0 %','25,4 %'),cav('TL',TL)))
a(row('PJ-2026-013',SNOW,'#3B82D6','Chłodzenie serwerowni · 2 agregaty wody lodowej','Biurowiec Kwadrant · Gdynia','Przygotowanie · 1 z 5','Projekt wykonawczy w uzgodnieniu · start montażu pon 7 gru',10,'12 lut 2027','Piątek 12 lutego 2027','268 000',marg('23,5 %','23,5 %'),cav('PK',PKC)))
a('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">Zakończone ostatnio</div>')
a(row('PJ-2026-006',SNOW,'#3B82D6','Modernizacja maszynowni','Galeria Portowa · Gdańsk','Zakończony · 23 paź','Odbiór końcowy bez uwag',100,'23 paź','Piątek 23 października','154 000',marg('22,0 %','24,6 %',done=True),cav('PK',PKC)))
a('</div></sc-if>')

# =================== REKORD PJ-2026-011
K=[];k=K.append
k('<sc-if value="{{isPjR}}" hint-placeholder-val="{{false}}">')
k('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(LAYERS,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Projekty</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 class="mono" style="margin:0;font-size:13px;line-height:20px;font-weight:500">PJ-2026-011</h1>'+SP+
  ib('Kopiuj link','Kopiuj link',LINK)+ib('Więcej akcji','Edytuj, zamknij projekt, archiwizuj',DOTS)+'</div>')
k('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
k('<div style="display:flex;flex-direction:column;gap:12px;padding:12px 24px 16px"><div style="display:flex;align-items:flex-start;gap:12px"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">'
  '<h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Klimatyzacja VRV · 42 pokoje</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(BLD,'Hotel Bryza · Sopot','Klient KL-0402 · obiekt OB-0611, Haffnera 22, Sopot')+meta(CAL,'14 wrz – 18 gru 2026','14 tygodni · dziś tydzień 10')+meta(USER,'Kierownik: Tomasz','Tomasz Lewandowski')+'</div></div>'+
  btn('Nowe zlecenie w projekcie','Zlecenie montażu lub prac do bieżącego etapu  C',PLUS)+'</div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd('<span class="num" style="font-weight:500">486 000 zł</span><span style="color:var(--text-tertiary)">netto</span>','Umowa UW-2026-014 z 9 wrz · z oferty OF-2026-097 v2')+
  capd('Postęp 60 %','Ważony budżetem etapów · 28 z 42 jednostek')+capd(ic(WARN,14,'var(--warning)')+'Marża 21,8 % · plan 24,0 %','Prognoza na koniec: koszty 380 040 zł wobec planu 369 360 zł')+capd(ic(CHECK,14,'var(--success)')+'Termin bez zagrożenia','Bufor 3 dni robocze przed odbiorem')+'</div></div>')
k('<div style="display:flex;align-items:center;gap:4px;padding:0 24px 12px">'+tabs([('Przegląd',''),('Zlecenia','9'),('Zakupy','6'),('Faktury','2'),('Dokumenty','31'),('Zdjęcia','212')])+'</div>')
# --- harmonogram (oś czasu etapów)
S0=date(2026,9,14); S1=date(2026,12,18); TOT=(S1-S0).days; TODAY=date(2026,11,21)
def pos(d): return round((d-S0).days/TOT*100,2)
PH=[('Przygotowanie i projekt wykonawczy',date(2026,9,14),date(2026,10,2),100,'done','PK · uzgodnienia z hotelem, projekt tras'),
    ('Dostawy urządzeń',date(2026,9,28),date(2026,10,16),100,'done','ZK/2026/09/044 i 047 · 1 jednostka zewnętrzna, 42 wewnętrzne'),
    ('Instalacja freonowa i skropliny',date(2026,10,5),date(2026,11,6),100,'done','Próba ciśnieniowa 6 lis · protokół PC-011'),
    ('Montaż jednostek wewnętrznych',date(2026,10,26),date(2026,12,4),67,'cur','28 z 42 · piętra 1–2 gotowe, piętro 3 w toku'),
    ('Elektryka i sterowanie',date(2026,11,9),date(2026,12,4),45,'cur','Podwykonawca Elektro-Bud · zasilanie i magistrala sterowania'),
    ('Uruchomienie i regulacja',date(2026,12,7),date(2026,12,11),0,'todo','Uruchomienie z serwisem producenta · karta CRO po uruchomieniu'),
    ('Odbiór i dokumentacja',date(2026,12,14),date(2026,12,18),0,'todo','Protokół odbioru, dokumentacja powykonawcza, szkolenie obsługi')]
MON=[('wrz',date(2026,9,14)),('paź',date(2026,10,1)),('lis',date(2026,11,1)),('gru',date(2026,12,1))]
def ph(name,d0,d1,p,k_,tip):
    l=pos(d0); w=pos(d1)-l
    col={'done':'var(--success)','cur':'var(--text-secondary)','todo':'var(--border-strong)'}[k_]
    fill=(f'<span style="position:absolute;left:0;top:0;bottom:0;width:{p}%;border-radius:4px;background:{col}"></span>' if k_!='todo' else '')
    track='var(--bg-subtle)' if k_!='todo' else 'var(--border-strong)'
    lab=f'{p} %' if k_=='cur' else ('gotowe' if k_=='done' else '')
    return (f'<div role="row" title="{tip}" style="display:grid;grid-template-columns:240px minmax(0,1fr);column-gap:12px;align-items:center;min-height:30px">'
            f'<span style="display:flex;align-items:center;gap:6px;min-width:0"><span class="ell" style="font-size:12px;color:{"var(--text-primary)" if k_=="cur" else "var(--text-secondary)"};font-weight:{500 if k_=="cur" else 400}">{name}</span>{SP}<span class="num" style="font-size:11px;color:var(--text-tertiary)">{lab}</span></span>'
            f'<span style="position:relative;height:16px"><span style="position:absolute;left:{l}%;width:{w}%;top:4px;height:8px;border-radius:4px;background:{track};overflow:hidden">{fill}</span></span></div>')
tl=pos(TODAY)
k('<section style="display:flex;flex-direction:column;gap:4px;padding:0 24px 20px"><div style="display:flex;align-items:center;gap:8px">'+h3('Harmonogram')+'<span style="font-size:12px;color:var(--text-tertiary)">przeciągnij etap, aby zmienić termin · zlecenia etapu przesuną się razem</span></div>'
  '<div style="display:grid;grid-template-columns:240px minmax(0,1fr);column-gap:12px;height:20px"><span></span><span style="position:relative">'+''.join(f'<span style="position:absolute;left:{pos(d)}%;font-size:11px;color:var(--text-tertiary)">{m}</span>' for m,d in MON)+
  f'<span style="position:absolute;left:{tl}%;transform:translateX(-50%);font-size:11px;font-weight:500;color:var(--accent)">dziś</span></span></div>'
  '<div style="position:relative;display:flex;flex-direction:column">'+''.join(ph(*x) for x in PH)+
  f'<span aria-hidden="true" style="position:absolute;top:0;bottom:0;left:calc(252px + (100% - 252px) * {tl/100});width:1.5px;background:var(--accent);opacity:.7"></span></div></section>')
# --- budżet
BC='minmax(0,1fr) 76px 76px 76px 64px'
def brow(name,pl,rz,pr,d,warn=False,b=False):
    w_=f'color:{"var(--warning)" if warn else "var(--text-secondary)"};{"font-weight:500;" if warn else ""}'
    fw='font-weight:600;' if b else ''
    return (f'<div role="row" style="display:grid;grid-template-columns:{BC};column-gap:12px;align-items:center;min-height:32px;padding:0 10px;border-radius:8px;{"border-top:1px solid var(--edge);border-radius:0;" if b else ""}">'
            f'<span class="ell" style="{fw}">{name}</span><span class="num" style="text-align:right;color:var(--text-secondary);{fw}">{pl}</span><span class="num" style="text-align:right;{fw}">{rz}</span><span class="num" style="text-align:right;{fw}">{pr}</span><span class="num" style="text-align:right;{w_}{fw}">{d}</span></div>')
k('<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:24px;padding:0 24px 24px">')
k('<section style="display:flex;flex-direction:column;gap:2px">'+h3('Koszty')+
  f'<div role="row" style="display:grid;grid-template-columns:{BC};column-gap:12px;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span></span><span style="text-align:right">Plan</span><span style="text-align:right" title="Zaksięgowane: PZ, RW, czas pracy, faktury podwykonawców">Do dziś</span><span style="text-align:right" title="Do dziś + pozostała praca wg postępu etapów">Prognoza</span><span style="text-align:right">Różnica</span></div>'+
  brow('Materiały','252 000','196 400','254 300','+2 300')+
  brow('Robocizna','78 000','31 800','86 480','+8 480',True)+
  brow('Usługi obce','28 000','9 500','28 000','0')+
  brow('Dojazdy, sprzęt','11 360','4 200','11 260','−100')+
  brow('Razem','369 360','241 900','380 040','+10 680',True,True)+
  '<div role="note" style="display:flex;gap:10px;margin-top:8px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(WARN,16,'var(--warning)')+
  '<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:12px;line-height:16px;color:var(--text-secondary)"><span style="color:var(--text-primary);font-weight:500">Robocizna +64 h</span> — przebudowa trasy skroplin na 2. piętrze (kolizja z instalacją tryskaczową, protokół konieczności PK-03 z 12 lis). Zmiana nie jest jeszcze w aneksie.</span>'
  '<div style="display:flex;gap:6px">'+btn('Przygotuj aneks · +11 200 zł','64 h × 175 zł/h · aneks z protokołu konieczności PK-03 do akceptacji klienta online — marża wróci do 23,6 %',FILE)+'</div></div></div></section>')
# --- płatności
def pay(name,amt,st,stc,tip,chips=''):
    return (f'<div style="display:flex;flex-direction:column;gap:4px;padding:8px 10px;border-radius:10px" title="{tip}"><div style="display:flex;align-items:center;gap:8px"><span style="flex:1 1 auto">{name}</span><span class="num" style="font-weight:500">{amt}</span></div>'
            f'<div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:{stc}">{st}</span>{SP}{chips}</div></div>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+h3('Harmonogram płatności')+
  pay('Zaliczka 30 %','145 800 zł','zapłacona 18 wrz','var(--success)','FZ/2026/09/021',obj('FZ/2026/09/021','Faktura zaliczkowa'))+
  pay('Po instalacji freonowej 40 %','194 400 zł','wystawiona 9 lis · termin pt 4 gru','var(--text-secondary)','FV/2026/11/031 · 14 dni od odbioru częściowego',obj('FV/2026/11/031','Faktura częściowa'))+
  pay('Po odbiorze końcowym 30 %','145 800 zł','po protokole odbioru · ok. 18 gru','var(--text-tertiary)','Wystawiana automatycznie po podpisaniu protokołu odbioru')+
  '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px 0;border-top:1px solid var(--edge);margin-top:4px;font-size:12px;color:var(--text-secondary)"><span>Zapłacono</span>'+SP+'<span class="num" style="color:var(--text-primary);font-weight:500">145 800 z 486 000 zł</span></div>'
  '<div style="padding:4px 10px">'+bar(30,'var(--success)')+'</div></section>')
k('</div></div>')
# --- aside
k('<aside aria-label="Projekt PJ-2026-011 — szczegóły" style="flex:0 0 320px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Najbliższe dni',CNT(3))+
  prop(WRENCH,'Montaż · piętro 3, pokoje 301–308','pon–śr · Tomasz i Mateusz · ZS-1071',obj('ZS-1071','Zlecenie w projekcie'))+
  prop(TRUCK,'Dostawa sterowników grupowych','wt 24 lis · ZK/2026/11/036 · Klimatech')+
  prop(PEOPLE,'Narada z hotelem','czw 26 lis 10:00 · kierownik techniczny, Tomasz')+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Zespół',CNT(4))+
  prop(USER,'Tomasz Lewandowski · kierownik','Montaż, uruchomienie',cav('TL',TL))+
  prop(USER,'Mateusz Zieliński · montażysta','Montaż jednostek, trasy',cav('MZ',MZC))+
  prop(BLD,'Elektro-Bud · podwykonawca','Zasilanie i sterowanie · umowa 28 000 zł')+
  prop(USER,'Pascal Kranz · rozliczenia','Aneksy, faktury, odbiory',cav('PK',PKC))+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Ryzyka',CNT(2))+
  prop(COIN,'Aneks niepodpisany','+64 h robocizny poza umową · marża 21,8 % zamiast 24,0 %',sch('wysokie','Wpływ na wynik',col='var(--warning)'))+
  prop(CART,'Sterowniki grupowe','Dostawa wt 24 lis — bez niej uruchomienie 7 gru zagrożone',sch('średnie','Śledzone w Zakupach'))+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Powiązane')+
  '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+obj('SZ-0142','Szansa — wygrana 4 wrz')+obj('OF-2026-097 v2','Oferta zaakceptowana')+obj('UW-2026-014','Umowa wykonawcza')+obj('OB-0611','Obiekt: Hotel Bryza, Haffnera 22')+'</div></section>')
k('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isPjL = ekran === 'projekty'; const isPjR = ekran === 'projekt'; const nPj = navv(isPjL || isPjR);")
rep("isFV, actFV:","isPjL, isPjR, actPj: nPj.act, colPj: nPj.col, wPj: nPj.w, isFV, actFV:")
rep('"obiekt", "planowanie"]','"obiekt", "projekty", "projekt", "planowanie"]')
i=s.find('font-weight:400">Projekty</span></a>'); a0=s.rfind('<a href="#" class="nav"',0,i); assert '</a>' not in s[a0:i]
e=s.find('</a>',i); seg=s[a0:e]
seg=seg.replace('class="nav"','class="nav {{actPj}}"',1).replace('color:var(--text-secondary)">','color:{{colPj}}">',1).replace('font-weight:400">Projekty','font-weight:{{wPj}}">Projekty')
assert '{{colPj}}' in seg; s=s[:a0]+seg+s[e:]
open(P,'w').write(s); print('ok projekty',len(s))
