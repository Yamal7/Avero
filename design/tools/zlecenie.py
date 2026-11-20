import re
P='design/canvas/Main.dc.html'
s=open(P).read()

def ic(paths, size=16, color=None, extra=''):
    st='flex:0 0 auto'+(';color:'+color if color else '')+extra
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="{st}">{paths}</svg>'
CHEV='<path d="m9 18 6-6-6-6"></path>'
UP='<path d="m18 15-6-6-6 6"></path>'; DOWN='<path d="m6 9 6 6 6-6"></path>'
DOTS='<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>'
LINK='<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>'
PLUS='<path d="M5 12h14M12 5v14"></path>'
CAL='<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>'
TRUCK='<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>'
CLOCK='<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>'
WARN='<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4M12 17h.01"></path>'
LOCK='<rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
PIN='<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>'
PHONE='<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>'
CHECKC='<circle cx="12" cy="12" r="10"></circle><path d="m8 12 3 3 5-6"></path>'
CLIP='<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>'
AT='<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>'
SEND='<path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path>'
FILE='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path>'
WRENCH='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>'

def ib(label, title, paths, size=24, color='var(--text-secondary)'):
    return f'<button type="button" class="ib" aria-label="{label}" title="{title}" style="width:{size}px;height:{size}px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:{color};padding:0">{ic(paths,16)}</button>'

def st_svg(kind):
    if kind=='drodze':
        return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--st-progress)"></circle><path d="M7 7L7 4A3 3 0 0 1 9.60 8.50Z" style="fill:var(--st-progress)"></path></svg>'
    if kind=='done':
        return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="6.5" style="fill:var(--accent)"></circle><path d="M4.4 7.2 6.2 9 9.6 5.4" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--bg-surface)"></path></svg>'
def av(ini, name, size=20, fs=10):
    return f'<span title="{name}" aria-hidden="true" style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:50%;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;font-size:{fs}px;line-height:10px;font-weight:500;color:var(--text-secondary)">{ini}</span>'
def capd(inner, title, pad='0 10px 0 8px', extra=''):
    return f'<button type="button" class="capd" title="{title}" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:{pad};border:0;border-radius:14px{extra}">{inner}</button>'
def h3(t, right=''):
    return f'<div style="display:flex;align-items:center;gap:8px;height:28px"><h3 style="margin:0;font-size:13px;line-height:20px;font-weight:500">{t}</h3>{right}</div>'
def ah3(t, right=''):
    return f'<div style="display:flex;align-items:center;gap:8px;height:24px;padding:0 0 0 8px"><h3 style="flex:1 1 auto;margin:0;font-size:12px;line-height:16px;font-weight:500;color:var(--text-secondary)">{t}</h3>{right}</div>'
CNT=lambda n: f'<span class="num" style="font-size:12px;color:var(--text-tertiary)">{n}</span>'
SP='<span style="flex:1 1 auto"></span>'
def ghost(t, title=''):
    return f'<button type="button" class="ghost" title="{title}" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;border:0;border-radius:8px;color:var(--text-secondary);font-size:12px">{t}</button>'

H=[]
a=H.append
a('<sc-if value="{{isZlec}}" hint-placeholder-val="{{false}}">')
# view header
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">')
a('<span style="display:inline-flex;color:var(--text-secondary)">'+ic(WRENCH,16)+'</span>')
a('<a href="#" class="flink" style="color:var(--text-secondary);white-space:nowrap">Serwis</a>'+ic(CHEV,14,'var(--text-tertiary)'))
a('<a href="#" class="flink" style="color:var(--text-secondary);white-space:nowrap">Zlecenia</a>'+ic(CHEV,14,'var(--text-tertiary)'))
a('<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">ZS-1047</h1>')
a(SP+'<span class="num" style="font-size:12px;color:var(--text-tertiary);margin-right:4px;white-space:nowrap">3 z 7 na dziś</span>')
a(ib('Poprzednie zlecenie','Poprzednie  K',UP)+ib('Następne zlecenie','Następne  J',DOWN)+ib('Kopiuj link','Kopiuj link  ⌘⇧C',LINK)+ib('Więcej akcji','Więcej akcji',DOTS))
a('</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
# title block
a('<div style="display:flex;align-items:flex-start;gap:16px;padding:12px 24px 16px">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">')
a('<div style="display:flex;flex-direction:column;gap:2px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Brak chłodzenia w lodziarce</h2>'
  '<p style="margin:0;font-size:12px;line-height:16px;color:var(--text-secondary)">Awaria · Delikatesy Morskie, Gdynia, ul. Starowiejska 12 · Lodziarka Isa Neos 160 <span class="mono" style="font-size:11px;color:var(--text-tertiary)">UR-3171</span></p></div>')
caps=[capd(st_svg('drodze')+'W drodze','Status  S'),
 capd('<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="8" width="3" height="5" rx="1" style="fill:var(--text-secondary)"></rect><rect x="5.5" y="5" width="3" height="8" rx="1" style="fill:var(--text-secondary)"></rect><rect x="10" y="2" width="3" height="11" rx="1" style="fill:var(--text-secondary)"></rect></svg>Wysoki','Priorytet  P'),
 capd(av('KN','Kamil Nowicki',20,9).replace('background:var(--bg-subtle)','background:var(--bg-surface)')+'Kamil Nowicki','Technik  A','0 10px 0 4px'),
 capd(ic(CAL,14,'var(--text-tertiary)')+'Dziś, 09:30','Termin wizyty: piątek, 13 listopada 2026, 09:30  ⇧D',extra=';font-weight:500'),
 capd('<span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:#2F9E5B"></span>Umowa serwisowa','Etykieta  L','0 10px'),
 '<button type="button" class="capd" aria-label="Dodaj właściwość" title="Dodaj właściwość" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;color:var(--text-secondary);padding:0">'+ic(PLUS,14)+'</button>']
a('<div aria-label="Właściwości zlecenia" style="display:flex;flex-wrap:wrap;gap:6px">'+''.join(caps)+'</div>')
a('</div>')
a('<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto"><button type="button" class="sec" title="Nowa wizyta  V" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(PLUS,14)+'Nowa wizyta</button></div>')
a('</div>')
# status strip
a('<div style="padding:0 24px 16px"><div role="status" style="display:flex;align-items:center;gap:12px;min-height:44px;padding:10px 12px 10px 14px;border-radius:12px;background:var(--bg-raised)">'
  +ic(TRUCK,16,'var(--st-progress)')+
  '<span style="flex:1 1 auto;min-width:0;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:8px"><span style="font-weight:500">Kamil Nowicki jedzie na miejsce</span><span style="color:var(--text-secondary)">wyjechał 09:12, przyjazd ok. 09:40 · 14 km</span></span>'
  '<span title="SLA z umowy: usunięcie awarii w 48 h od zgłoszenia, do 14 listopada 2026, 14:10" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;white-space:nowrap">'+ic(CLOCK,14,'var(--text-tertiary)')+'<span style="color:var(--text-secondary)">Usunięcie awarii</span><span class="num" style="font-weight:500">29 h</span></span>'
  +ib('Zadzwoń do technika','Zadzwoń do technika',PHONE,28)+
  '</div></div>')
# tabs
tabs=[('Przegląd',''),('Wizyty','2'),('Protokoły','1'),('Materiały','3'),('Dokumenty','4'),('Aktywność','7')]
t=''
for i,(n,c) in enumerate(tabs):
    on=i==0
    t+=f'<button type="button" role="tab" aria-selected="{str(on).lower()}" class="tab" style="height:36px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;margin-bottom:-1px;border:0;border-bottom:2px solid {"var(--text-primary)" if on else "transparent"};background:transparent;color:{"var(--text-primary)" if on else "var(--text-secondary)"};font-weight:{500 if on else 400}">{n}'+(f'<span class="num" style="font-size:12px;color:var(--text-tertiary);font-weight:400">{c}</span>' if c else '')+'</button>'
a('<div role="tablist" aria-label="Sekcje zlecenia" style="display:flex;gap:4px;padding:0 16px;border-bottom:1px solid var(--edge)">'+t+'</div>')
a('<div style="display:flex;flex-direction:column;gap:28px;padding:20px 24px 32px;max-width:880px">')
# zgłoszenie
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Zgłoszenie',SP+'<span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZG-0914</span>')+
  '<div style="display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;background:var(--bg-raised)"><p style="margin:0">Lodziarka przy kasie nie trzyma temperatury, lody miękną od rana. Wyświetlacz pokazuje −8 °C, a powinno być −18 °C. Wentylator z tyłu chyba nie chodzi.</p>'
  '<span title="12 listopada 2026, 14:10" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Krzysztof Malinowski, telefonicznie · 12 lis, 14:10 · przyjęła Anna Wiśniewska</span></div></section>')
# wizyty
def visit(icon, date, time, title, ini, name, dur, durc, note, label):
    return (f'<li><a href="#" class="row" style="display:grid;grid-template-columns:14px 64px 92px minmax(0,1fr) 20px 88px;column-gap:12px;row-gap:2px;align-items:center;padding:8px;border-radius:10px">'
     f'<span role="img" aria-label="{label}" title="{label}" style="display:inline-flex">{icon}</span>'
     f'<span class="num" style="color:var(--text-secondary)">{date}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{time}</span>'
     f'<span class="ell" style="font-weight:500">{title}</span>{av(ini,name)}<span class="num" style="text-align:right;font-size:12px;color:{durc}">{dur}</span>'
     f'<span></span><span class="ell" style="grid-column:2 / span 5;font-size:12px;line-height:16px;color:var(--text-secondary)">{note}</span></a></li>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Wizyty',CNT(2)+SP+ghost(ic(CAL,14)+'Pokaż w planowaniu','Planowanie  G P'))+
  '<ol style="margin:0 -8px;padding:0;list-style:none;display:flex;flex-direction:column">'+
  visit(st_svg('done'),'12 lis','16:20–17:25','Diagnoza','PD','Patryk Dąbrowski','1 h 05 min','var(--text-primary)','Uszkodzony silnik wentylatora skraplacza. Skraplacz wyczyszczony, lody przeniesione do mroźni na zapleczu. Protokół PR/2026/11/041.','Wizyta zakończona')+
  visit(st_svg('drodze'),'dziś','09:30 · plan 1 h','Wymiana silnika i łopatki wentylatora skraplacza','KN','Kamil Nowicki','w drodze','var(--text-secondary)','Części w busie Kamila (MM/2026/11/052). Po wymianie: pomiary kontrolne i podpis kierownika sklepu.','W drodze')+
  '</ol></section>')
# pomiary
def prow(n,norm,b,warn,tip,c):
    w='<span style="display:inline-flex;color:var(--warning)">'+ic(WARN,14)+'</span>' if warn else ''
    return (f'<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 128px 128px 128px;column-gap:12px;align-items:center;height:36px;border-bottom:1px solid var(--edge)">'
            f'<span role="cell" class="ell">{n}</span><span role="cell" class="num" style="font-size:12px;color:var(--text-secondary)">{norm}</span>'
            f'<span role="cell" class="num" title="{tip}" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;color:{"var(--text-primary)" if warn else "var(--text-secondary)"};font-weight:{500 if warn else 400}">{w}{b}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-tertiary)">{c}</span></div>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Pomiary',SP+'<a href="#" class="flink" title="Otwórz protokół z telefonu" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">'+ic(FILE,14,'var(--text-tertiary)')+'<span class="mono" style="font-size:11px">PR/2026/11/041</span> · diagnoza 12 lis</a>')+
  '<div role="table" aria-label="Pomiary" style="display:flex;flex-direction:column">'
  '<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 128px 128px 128px;column-gap:12px;align-items:center;height:28px;font-size:12px;line-height:16px;color:var(--text-tertiary);border-bottom:1px solid var(--edge)"><span role="columnheader">Parametr</span><span role="columnheader">Norma</span><span role="columnheader" style="text-align:right">12 lis · diagnoza</span><span role="columnheader" style="text-align:right">Po naprawie</span></div>'+
  prow('Temperatura w komorze','−22 … −18 °C','−8 °C',True,'Powyżej normy o 10 K','—')+
  prow('Temperatura skraplania','do 45 °C','58 °C',True,'Powyżej normy: słabe odprowadzanie ciepła','—')+
  prow('Wentylator skraplacza','pracuje','nie pracuje',True,'Silnik bez obrotów, uzwojenie przerwane','—')+
  prow('Prąd sprężarki','do 3,2 A','2,9 A',False,'','—')+
  prow('Czynnik','R290 · 0,12 kg','bez ubytku',False,'Układ hermetyczny','—')+
  '</div><p style="margin:0;font-size:12px;line-height:16px;color:var(--text-secondary)">Kolumna „Po naprawie” wypełni się z protokołu dzisiejszej wizyty; wartości poza normą zostaną oznaczone tak samo.</p></section>')
# materiały
def mrow(name, code, qty, doc, dot, stt, amt):
    return (f'<div role="row" class="trow" style="display:grid;grid-template-columns:minmax(0,1fr) 72px 136px 120px 96px;column-gap:12px;align-items:center;height:40px;padding:0 8px;border-radius:10px">'
            f'<span role="cell" style="display:flex;align-items:baseline;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto">{name}</span><span class="mono ell" style="flex:0 10000 auto;font-size:11px;color:var(--text-tertiary)">{code}</span></span>'
            f'<span role="cell" class="num" title="Ilość zmienia tylko dokument" style="display:flex;align-items:center;justify-content:flex-end;gap:4px">{qty}{ic(LOCK,12,"var(--text-tertiary)")}</span>'
            f'<a role="cell" href="#" class="mono flink ell" style="font-size:11px;color:var(--text-secondary)">{doc}</a>'
            f'<span role="cell" style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)"><span aria-hidden="true" style="width:6px;height:6px;border-radius:50%;background:{dot};flex:0 0 auto"></span>{stt}</span>'
            f'<span role="cell" class="num" style="text-align:right">{amt}</span></div>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Materiały i czynnik',CNT(3)+SP+'<button type="button" class="sec" title="Wydanie na zlecenie (RW)  R" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-subtle);font-size:12px;font-weight:500">'+ic(PLUS,14)+'Wydanie RW</button>')+
  '<div role="table" aria-label="Materiały" style="display:flex;flex-direction:column;margin:0 -8px">'
  '<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 72px 136px 120px 96px;column-gap:12px;align-items:center;height:28px;padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span role="columnheader">Pozycja</span><span role="columnheader" style="text-align:right">Ilość</span><span role="columnheader">Dokument</span><span role="columnheader">Stan</span><span role="columnheader" style="text-align:right">Netto</span></div>'+
  mrow('Silnik wentylatora Elco VNT 10-20','CZ-W1020','1 szt.','MM/2026/11/052','var(--st-progress)','W busie KN','186,00 zł')+
  mrow('Łopatka wentylatora 230 mm, ssąca','CZ-L230S','1 szt.','MM/2026/11/052','var(--st-progress)','W busie KN','24,00 zł')+
  mrow('Preparat do czyszczenia skraplaczy','CH-PCS1','0,5 l','RW/2026/11/074','var(--success)','Wydane 12 lis','18,50 zł')+
  '<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 96px;column-gap:12px;align-items:center;height:36px;padding:0 8px;border-top:1px solid var(--edge);margin-top:4px"><span style="font-size:12px;color:var(--text-secondary)">Czynnik: bez zmian · R290, poza obowiązkiem F-gaz</span><span class="num" style="text-align:right;font-weight:500">228,50 zł</span></div>'
  '</div></section>')
# aktywność
def ev(ini,name,txt,ago,full):
    return (f'<li style="display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)">{av(ini,name,16,8)}'
            f'<span class="ell" style="flex:1 1 auto"><span style="color:var(--text-primary);font-weight:500">{name}</span> {txt}</span><span class="num" title="{full}" style="color:var(--text-tertiary);white-space:nowrap">{ago}</span></li>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+h3('Aktywność')+'<ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px">'+
  ev('AW','Anna Wiśniewska','utworzyła zlecenie ze zgłoszenia <span class="mono" style="font-size:11px">ZG-0914</span>','12 lis 14:10','12 listopada 2026, 14:10')+
  ev('AW','Anna Wiśniewska','przydzieliła Patryka Dąbrowskiego na 16:00','12 lis 14:12','12 listopada 2026, 14:12')+
  ev('PD','Patryk Dąbrowski','zakończył wizytę i wysłał protokół <span class="mono" style="font-size:11px">PR/2026/11/041</span>','12 lis 17:25','12 listopada 2026, 17:25')+
  ev('AW','Anna Wiśniewska','przesunęła części do busa Kamila <span class="mono" style="font-size:11px">MM/2026/11/052</span>','12 lis 17:40','12 listopada 2026, 17:40')+
  ev('KN','Kamil Nowicki','zmienił status na W drodze','09:12','13 listopada 2026, 09:12')+
  '<li style="display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)"><span style="display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px">'+av('KN','Kamil Nowicki',16,8)+'<span style="font-weight:500">Kamil Nowicki</span><span class="num" title="13 listopada 2026, 09:14" style="color:var(--text-tertiary)">09:14</span></span><span>Silnik i łopatka są w busie. Będę ok. 9:40, uprzedziłem kierownika sklepu.</span></li>'
  '</ol>'
  '<div style="display:flex;flex-direction:column;gap:8px;padding:10px 12px 8px;border-radius:12px;background:var(--bg-raised)"><label for="zs-komentarz" class="vh">Komentarz</label><textarea id="zs-komentarz" rows="2" placeholder="Napisz komentarz, @ oznacza osobę…" style="width:100%;resize:none;padding:0;border:0;background:transparent;font:inherit;color:var(--text-primary);box-shadow:none"></textarea>'
  '<div style="display:flex;align-items:center;gap:2px">'+ib('Dodaj załącznik','Dodaj załącznik',CLIP,28,'var(--text-tertiary)')+ib('Oznacz osobę','Oznacz osobę  @',AT,28,'var(--text-tertiary)')+SP+
  '<button type="button" aria-label="Wyślij komentarz" title="Wyślij  ⌘Enter" aria-disabled="true" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:var(--bg-subtle);color:var(--text-tertiary);padding:0">'+ic(SEND,14)+'</button></div></div>'
  '</section>')
a('</div></div>')
# aside
def kv(k,v,vc='var(--text-primary)',w=400,tip=''):
    return f'<div style="display:flex;align-items:baseline;gap:8px;min-height:24px"><span style="flex:1 1 auto;color:var(--text-secondary)">{k}</span><span class="num" title="{tip}" style="color:{vc};font-weight:{w};white-space:nowrap">{v}</span></div>'
a('<aside aria-label="Szczegóły zlecenia ZS-1047" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Rozliczenie',ghost('Pozycje faktury','Podgląd pozycji faktury'))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Robocizna 12 lis · 1 h 05 min','151,67 zł')+kv('Robocizna dziś · plan 1 h','140,00 zł','var(--text-tertiary)',tip='Szacunek z planu wizyty; zastąpi go czas z protokołu')+
  kv('Materiały','228,50 zł')+kv('Dojazd','w umowie','var(--text-secondary)',tip='Umowa serwisowa: dojazd w ryczałcie miesięcznym')+
  '<div style="height:1px;margin:6px 0;background:var(--edge)"></div>'+kv('Razem netto, szacunek','520,17 zł',w=500)+
  '<p style="margin:4px 0 0;font-size:12px;line-height:16px;color:var(--text-tertiary)">Stawka 140 zł/h z umowy. Faktura powstaje po zmianie statusu na Do rozliczenia.</p></div></section>')
def arow(left, main, sub, right=''):
    return (f'<a href="#" class="row" style="display:grid;grid-template-columns:20px minmax(0,1fr) auto;column-gap:10px;row-gap:2px;align-items:center;padding:6px 8px;border-radius:10px">'
            f'<span style="grid-row:1 / span 2;align-self:start;margin-top:2px;display:inline-flex">{left}</span><span class="ell" style="font-weight:500">{main}</span>'
            f'<span style="grid-row:1 / span 2;display:inline-flex">{right}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{sub}</span></a>')
logo='<span aria-hidden="true" style="width:20px;height:20px;border-radius:6px;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--text-secondary)">DM</span>'
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Klient i miejsce')+
  arow(logo,'Delikatesy Morskie','Umowa serwisowa do 31.12.2026')+
  arow('<span style="display:inline-flex;color:var(--text-tertiary)">'+ic(PIN,16)+'</span>','Gdynia, ul. Starowiejska 12','sklep · wejście dla dostaw od podwórza')+
  arow(av('KM','Krzysztof Malinowski'),'Krzysztof Malinowski','Kierownik techniczny · +48 601 482 117',ib('Zadzwoń','Zadzwoń: +48 601 482 117',PHONE,28))+
  '</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Urządzenie')+
  arow('<span class="mono" style="font-size:10px;color:var(--text-tertiary);line-height:16px">UR</span>','Lodziarka Isa Neos 160 <span class="mono" style="font-size:11px;font-weight:400;color:var(--text-tertiary)">UR-3171</span>','<span title="Czynnik naturalny poniżej progów: bez obowiązku kontroli szczelności">R290 · 0,12 kg · F-gaz nie dotyczy</span>')+
  '<a href="#" class="row" style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:10px;font-size:12px;color:var(--text-secondary)"><span style="flex:1 1 auto">Wcześniejsze zlecenia na tym urządzeniu</span><span class="num">2</span></a></section>')
def dd(k,v,lock=False,tip='',cls=''):
    if lock:
        val=f'<span title="{tip}" style="min-height:32px;display:flex;align-items:center;gap:6px;padding:6px 8px;line-height:20px"><span class="{cls}">{v}</span>{ic(LOCK,12,"var(--text-tertiary)")}</span>'
    else:
        val=f'<button type="button" class="prop" title="{tip}" style="width:100%;min-height:32px;display:flex;align-items:center;gap:6px;padding:6px 8px;border:0;border-radius:8px;text-align:left;line-height:20px;background:transparent"><span class="{cls}">{v}</span></button>'
    return f'<dt style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-secondary)">{k}</dt><dd style="margin:0;min-width:0">{val}</dd>'
a('<section style="display:flex;flex-direction:column;gap:4px">'+ah3('Szczegóły')+
  '<dl style="margin:0;display:grid;grid-template-columns:120px minmax(0,1fr);row-gap:2px;align-items:center">'+
  dd('Typ','Awaria')+dd('Szablon protokołu','Naprawa chłodnicza')+dd('Zgłoszono','12 lis, 14:10',tip='12 listopada 2026, 14:10',cls='num')+
  dd('Reakcja','4 h · spełniona '+ic(CHECKC,14,'var(--success)'),True,'Z umowy serwisowej. Pierwsza wizyta 2 h 10 min od zgłoszenia')+
  dd('Usunięcie awarii','48 h · do 14 lis, 14:10',True,'Z umowy serwisowej','num')+
  dd('Zamówienie klienta','ZK/2026/1187',cls='mono')+dd('Przyjęła','Anna Wiśniewska')+
  '</dl></section>')
a('</aside></div></sc-if>')
block='\n'.join(H)+'\n'
anchor='<sc-if value="{{isDoc}}" hint-placeholder-val="{{false}}">'
assert s.count(anchor)==1 and '{{isZlec}}' not in s
s=s.replace(anchor, block+anchor)

# prop enum
old='"urządzenie", "szablony"]'
assert old in s; s=s.replace(old,'"urządzenie", "szablony", "zlecenie"]',1)
# script
old='    const fView = {'
assert s.count(old)==1
s=s.replace(old,"    const isZl = ekran === 'zlecenie'; const nZl = navv(isZl);\n"+old,1)
old='      isUrz: isU, uTabs,'
assert old in s
s=s.replace(old,'      isZlec: isZl, actZl: nZl.act, colZl: nZl.col, wZl: nZl.w, selZl: nZl.sel,\n'+old,1)
# desktop tab
old='<button type="button" role="tab" aria-selected="false" class="dtab" title="ZS-1047 · Brak chłodzenia w lodziarce  ⌘4" style="flex:0 1 auto;min-width:0;max-width:200px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;font-weight:400">'
assert old in s, 'tab'
s=s.replace(old,'<button type="button" role="tab" aria-selected="{{selZl}}" class="dtab {{actZl}}" title="ZS-1047 · Brak chłodzenia w lodziarce  ⌘7" style="flex:0 1 auto;min-width:0;max-width:200px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;color:{{colZl}};font-size:12px;font-weight:{{wZl}}">',1)
# nav item
m=re.search(r'<a href="#" class="nav" style="([^"]*)color:var\(--text-secondary\)">(<svg[^>]*><path d="M14\.7 6\.3[^<]*</path></svg>)<span class="ell" style="flex:1 1 auto;font-weight:400">Zlecenia</span></a>',s)
assert m, 'nav'
s=s[:m.start()]+f'<a href="#" class="nav {{{{actZl}}}}" title="G Z" style="{m.group(1)}color:{{{{colZl}}}}">{m.group(2)}<span class="ell" style="flex:1 1 auto;font-weight:{{{{wZl}}}}">Zlecenia</span></a>'+s[m.end():]
# fTab: ensure tab label for firmy unaffected; done
open(P,'w').write(s)
print('ok', len(s))
