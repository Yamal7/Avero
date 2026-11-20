P='design/canvas/Main.dc.html'
s=open(P).read()
src=open('design/tools/zlecenie.py').read()
exec(src.split("H=[]")[0].replace("s=open(P).read()",""))
INFO='<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path>'
HASH='<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"></path>'
TIMER='<path d="M10 2h4M12 14l3-3"></path><circle cx="12" cy="14" r="8"></circle>'
BUILD='<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"></path>'
BOX='<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>'
PEN='<path d="M12 20h9"></path><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.51l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .51-.86z"></path>'
DROP='<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>'
ROUTE='<circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle>'
SHIELD='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
HIST='<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>'
KN='#1FA7A5'; PD='#E0702A'
def cav(ini,c,size=20,fs=9):
    return f'<span aria-hidden="true" style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:50%;background:{c};display:inline-flex;align-items:center;justify-content:center;font-size:{fs}px;font-weight:600;color:#fff">{ini}</span>'
def chip(icon,col,txt,tip,bg='var(--bg-subtle)',mono=False,cls=''):
    t=f'<span class="{"mono" if mono else cls}" style="{"font-size:11px" if mono else ""}">{txt}</span>' if txt else ''
    pad='0 8px 0 6px' if txt else '0'; w='' if txt else 'width:22px;justify-content:center;'
    return f'<span title="{tip}" aria-label="{tip}" style="height:22px;{w}display:inline-flex;align-items:center;gap:4px;padding:{pad};border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{ic(icon,14,col) if icon else ""}{t}</span>'
def meta(icon,txt,tip,col='var(--text-tertiary)'):
    return f'<span title="{tip}" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap">{ic(icon,14,col)}{txt}</span>'
P1=st_svg('drodze')
H=[];a=H.append
a('<sc-if value="{{isZlec}}" hint-placeholder-val="{{false}}">')
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
a('<div style="display:flex;align-items:flex-start;gap:16px;padding:12px 24px 16px">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">')
a('<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Brak chłodzenia w lodziarce</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+
  meta(BUILD,'Delikatesy Morskie','Klient: Delikatesy Morskie sp. z o.o.')+meta(PIN,'Starowiejska 12, Gdynia','Obiekt: sklep, wejście dla dostaw od podwórza')+
  meta(BOX,'Lodziarka Isa Neos 160','Urządzenie UR-3171 · R290 0,12 kg')+'</div></div>')
caps=[capd(st_svg('drodze')+'W drodze','Status  S'),
 capd('<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="8" width="3" height="5" rx="1" style="fill:var(--text-secondary)"></rect><rect x="5.5" y="5" width="3" height="8" rx="1" style="fill:var(--text-secondary)"></rect><rect x="10" y="2" width="3" height="11" rx="1" style="fill:var(--text-secondary)"></rect></svg>Wysoki','Priorytet  P'),
 capd(cav('KN',KN)+'Kamil Nowicki','Technik  A','0 10px 0 4px'),
 capd(ic(CAL,14,'var(--text-tertiary)')+'Dziś, 09:30','Termin wizyty: piątek, 13 listopada 2026, 09:30  ⇧D',extra=';font-weight:500'),
 capd('<span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:#2F9E5B"></span>Umowa serwisowa','Etykieta  L','0 10px'),
 '<button type="button" class="capd" aria-label="Dodaj właściwość" title="Dodaj właściwość" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;color:var(--text-secondary);padding:0">'+ic(PLUS,14)+'</button>']
a('<div aria-label="Właściwości zlecenia" style="display:flex;flex-wrap:wrap;gap:6px">'+''.join(caps)+'</div>')
a('</div>')
a('<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto"><button type="button" class="sec" title="Nowa wizyta  V" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(PLUS,14)+'Nowa wizyta</button></div>')
a('</div>')
# live strip: chips
a('<div style="padding:0 24px 16px"><div role="status" title="Kamil Nowicki wyjechał 09:12, jedzie al. Zwycięstwa" style="display:flex;align-items:center;gap:8px;min-height:40px;padding:8px 8px 8px 12px;border-radius:12px;background:var(--bg-raised)">'
  +ic(TRUCK,16,'var(--st-progress)')+'<span style="font-weight:500;margin-right:4px">W drodze</span>'+
  chip(CLOCK,'var(--text-tertiary)','09:40','Przyjazd ok. 09:40, za 26 min','var(--bg-surface)')+chip(ROUTE,'var(--text-tertiary)','14 km','Dojazd z bazy: 14 km','var(--bg-surface)')+chip(BOX,'var(--success)','','Silnik i łopatka w busie (MM/2026/11/052)','var(--bg-surface)')+SP+
  chip(TIMER,'var(--text-tertiary)','29 h','Usunięcie awarii wg umowy: 48 h od zgłoszenia, do 14 listopada 2026, 14:10','var(--bg-surface)')+
  ib('Zadzwoń do technika','Zadzwoń do Kamila',PHONE,28)+'</div></div>')
tabs=[('Przegląd',''),('Wizyty','2'),('Protokoły','1'),('Materiały','3'),('Dokumenty','4'),('Aktywność','7')]
t=''
for i,(n,c) in enumerate(tabs):
    on=i==0
    t+=f'<button type="button" role="tab" aria-selected="{str(on).lower()}" class="tab" style="height:36px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;margin-bottom:-1px;border:0;border-bottom:2px solid {"var(--text-primary)" if on else "transparent"};background:transparent;color:{"var(--text-primary)" if on else "var(--text-secondary)"};font-weight:{500 if on else 400}">{n}'+(f'<span class="num" style="font-size:12px;color:var(--text-tertiary);font-weight:400">{c}</span>' if c else '')+'</button>'
a('<div role="tablist" aria-label="Sekcje zlecenia" style="display:flex;gap:4px;padding:0 16px;border-bottom:1px solid var(--edge)">'+t+'</div>')
a('<div style="display:flex;flex-direction:column;gap:28px;padding:20px 24px 32px;max-width:880px">')
# zgłoszenie
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Zgłoszenie',SP+'<span class="mono" title="Zgłoszenie źródłowe" style="font-size:11px;color:var(--text-tertiary)">ZG-0914</span>')+
  '<div style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:12px;background:var(--bg-raised)"><p style="margin:0">Lodziarka przy kasie nie trzyma temperatury, lody miękną od rana. Wyświetlacz pokazuje −8 °C, a powinno być −18 °C. Wentylator z tyłu chyba nie chodzi.</p>'
  '<span style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+av('KM','Krzysztof Malinowski, kierownik techniczny',16,8)+'<span title="Kierownik techniczny">Krzysztof Malinowski</span>'+ic(PHONE,12,'var(--text-tertiary)',';margin-left:4px')+'<span class="num" title="12 listopada 2026, 14:10 · przyjęła Anna Wiśniewska" style="color:var(--text-tertiary)">12 lis, 14:10</span></span></div></section>')
# wizyty
def visit(icon,label,date,time,title,ini,col,name,chips,tip):
    return (f'<li><a href="#" class="row" title="{tip}" style="display:grid;grid-template-columns:14px 52px 120px minmax(0,1fr) auto 20px;column-gap:12px;align-items:center;min-height:40px;padding:6px 8px;border-radius:10px">'
     f'<span role="img" aria-label="{label}" title="{label}" style="display:inline-flex">{icon}</span>'
     f'<span class="num" style="color:var(--text-secondary)">{date}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{time}</span>'
     f'<span class="ell" style="font-weight:500">{title}</span><span style="display:flex;gap:4px">{chips}</span>{cav(ini,col)}</a></li>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Wizyty',CNT(2)+SP+ghost(ic(CAL,14)+'W planowaniu','Pokaż w planowaniu  G P'))+
  '<ol style="margin:0 -8px;padding:0;list-style:none;display:flex;flex-direction:column">'+
  visit(st_svg('done'),'Wizyta zakończona','12 lis','16:20–17:25','Diagnoza','PD',PD,'Patryk Dąbrowski',
        chip(FILE,'var(--text-tertiary)','','Protokół PR/2026/11/041')+chip(CLOCK,'var(--text-tertiary)','1 h 05','Czas pracy 1 h 05 min'),
        'Uszkodzony silnik wentylatora skraplacza. Skraplacz wyczyszczony, lody przeniesione do mroźni na zapleczu.')+
  visit(st_svg('drodze'),'W drodze','dziś','09:30 · plan 1 h','Wymiana silnika i łopatki wentylatora','KN',KN,'Kamil Nowicki',
        chip(BOX,'var(--success)','','Części w busie Kamila (MM/2026/11/052)')+chip(PEN,'var(--text-tertiary)','','Wymagany podpis kierownika sklepu'),
        'Po wymianie: pomiary kontrolne w protokole „Naprawa” i podpis kierownika sklepu.')+
  '</ol></section>')
# pomiary
def prow(n,norm,b,warn,tip,c):
    w='<span style="display:inline-flex;color:var(--warning)">'+ic(WARN,14)+'</span>' if warn else ''
    return (f'<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 128px 128px 128px;column-gap:12px;align-items:center;height:36px;border-bottom:1px solid var(--edge)">'
            f'<span role="cell" class="ell">{n}</span><span role="cell" class="num" style="font-size:12px;color:var(--text-secondary)">{norm}</span>'
            f'<span role="cell" class="num" title="{tip}" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;color:{"var(--text-primary)" if warn else "var(--text-secondary)"};font-weight:{500 if warn else 400}">{w}{b}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-tertiary)">{c}</span></div>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Pomiary',SP+chip(FILE,'var(--text-tertiary)','PR/2026/11/041','Protokół diagnozy z telefonu, 12 lis 17:25',mono=True))+
  '<div role="table" aria-label="Pomiary" style="display:flex;flex-direction:column">'
  '<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 128px 128px 128px;column-gap:12px;align-items:center;height:28px;font-size:12px;line-height:16px;color:var(--text-tertiary);border-bottom:1px solid var(--edge)"><span role="columnheader">Parametr</span><span role="columnheader">Norma</span><span role="columnheader" style="text-align:right">12 lis</span>'
  '<span role="columnheader" title="Wypełni się z protokołu dzisiejszej wizyty" style="display:flex;align-items:center;justify-content:flex-end;gap:4px">Po naprawie'+ic(INFO,12,'var(--text-tertiary)')+'</span></div>'+
  prow('Temperatura w komorze','−22 … −18 °C','−8 °C',True,'Powyżej normy o 10 K','—')+
  prow('Temperatura skraplania','do 45 °C','58 °C',True,'Powyżej normy: słabe odprowadzanie ciepła','—')+
  prow('Wentylator skraplacza','pracuje','nie pracuje',True,'Silnik bez obrotów, uzwojenie przerwane','—')+
  prow('Prąd sprężarki','do 3,2 A','2,9 A',False,'','—')+
  prow('Czynnik','R290 · 0,12 kg','bez ubytku',False,'Układ hermetyczny','—')+
  '</div></section>')
# materiały
def mrow(name,code,qty,doc,state,amt):
    return (f'<div role="row" class="trow" title="{code}" style="display:grid;grid-template-columns:minmax(0,1fr) 72px 136px 96px 96px;column-gap:12px;align-items:center;height:40px;padding:0 8px;border-radius:10px">'
            f'<span role="cell" class="ell">{name}</span>'
            f'<span role="cell" class="num" title="Ilość zmienia tylko dokument" style="display:flex;align-items:center;justify-content:flex-end;gap:4px">{qty}{ic(LOCK,12,"var(--text-tertiary)")}</span>'
            f'<a role="cell" href="#" class="mono flink ell" style="font-size:11px;color:var(--text-secondary)">{doc}</a>'
            f'<span role="cell">{state}</span><span role="cell" class="num" style="text-align:right">{amt}</span></div>')
inbus=chip(TRUCK,'var(--st-progress)','KN','W busie Kamila Nowickiego (GD 2N551)')
wyd=chip(CHECKC,'var(--success)','12 lis','Wydane na zlecenie 12 listopada 2026')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Materiały i czynnik',CNT(3)+SP+'<button type="button" class="sec" title="Wydanie na zlecenie (RW)  R" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-subtle);font-size:12px;font-weight:500">'+ic(PLUS,14)+'Wydanie RW</button>')+
  '<div role="table" aria-label="Materiały" style="display:flex;flex-direction:column;margin:0 -8px">'
  '<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 72px 136px 96px 96px;column-gap:12px;align-items:center;height:28px;padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span role="columnheader">Pozycja</span><span role="columnheader" style="text-align:right">Ilość</span><span role="columnheader">Dokument</span><span role="columnheader">Gdzie</span><span role="columnheader" style="text-align:right">Netto</span></div>'+
  mrow('Silnik wentylatora Elco VNT 10-20','CZ-W1020','1 szt.','MM/2026/11/052',inbus,'186,00 zł')+
  mrow('Łopatka wentylatora 230 mm','CZ-L230S · ssąca','1 szt.','MM/2026/11/052',inbus,'24,00 zł')+
  mrow('Preparat do czyszczenia skraplaczy','CH-PCS1','0,5 l','RW/2026/11/074',wyd,'18,50 zł')+
  '<div role="row" style="display:flex;align-items:center;gap:6px;height:36px;padding:0 8px;border-top:1px solid var(--edge);margin-top:4px">'+chip(DROP,'var(--text-tertiary)','R290 bez zmian','Czynnik bez zmian · R290 0,12 kg, poza obowiązkiem F-gaz')+SP+'<span class="num" style="font-weight:500">228,50 zł</span></div>'
  '</div></section>')
# aktywność (unchanged content, compact)
def ev(ini,name,txt,ago,full):
    A=cav(ini,{'KN':KN,'PD':PD}[ini],16,7) if ini in ('KN','PD') else av(ini,name,16,8)
    return (f'<li style="display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)">{A}'
            f'<span class="ell" style="flex:1 1 auto"><span style="color:var(--text-primary);font-weight:500">{name}</span> {txt}</span><span class="num" title="{full}" style="color:var(--text-tertiary);white-space:nowrap">{ago}</span></li>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+h3('Aktywność')+'<ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px">'+
  ev('AW','Anna Wiśniewska','utworzyła zlecenie z <span class="mono" style="font-size:11px">ZG-0914</span>','12 lis 14:10','12 listopada 2026, 14:10')+
  ev('AW','Anna Wiśniewska','przydzieliła Patryka na 16:00','12 lis 14:12','12 listopada 2026, 14:12')+
  ev('PD','Patryk Dąbrowski','wysłał protokół <span class="mono" style="font-size:11px">PR/2026/11/041</span>','12 lis 17:25','12 listopada 2026, 17:25')+
  ev('AW','Anna Wiśniewska','przesunęła części do busa Kamila <span class="mono" style="font-size:11px">MM/2026/11/052</span>','12 lis 17:40','12 listopada 2026, 17:40')+
  ev('KN','Kamil Nowicki','zmienił status na W drodze','09:12','13 listopada 2026, 09:12')+
  '<li style="display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)"><span style="display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px">'+cav('KN',KN,16,7)+'<span style="font-weight:500">Kamil Nowicki</span><span class="num" title="13 listopada 2026, 09:14" style="color:var(--text-tertiary)">09:14</span></span><span>Silnik i łopatka są w busie. Będę ok. 9:40, uprzedziłem kierownika sklepu.</span></li>'
  '</ol>'
  '<div style="display:flex;flex-direction:column;gap:8px;padding:10px 12px 8px;border-radius:12px;background:var(--bg-raised)"><label for="zs-komentarz" class="vh">Komentarz</label><textarea id="zs-komentarz" rows="2" placeholder="Napisz komentarz, @ oznacza osobę…" style="width:100%;resize:none;padding:0;border:0;background:transparent;font:inherit;color:var(--text-primary);box-shadow:none"></textarea>'
  '<div style="display:flex;align-items:center;gap:2px">'+ib('Dodaj załącznik','Dodaj załącznik',CLIP,28,'var(--text-tertiary)')+ib('Oznacz osobę','Oznacz osobę  @',AT,28,'var(--text-tertiary)')+SP+
  '<button type="button" aria-label="Wyślij komentarz" title="Wyślij  ⌘Enter" aria-disabled="true" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:var(--bg-subtle);color:var(--text-tertiary);padding:0">'+ic(SEND,14)+'</button></div></div>'
  '</section>')
a('</div></div>')
# aside: Linear-like property rows
def prop(icon,val,tip,right='',lock=False,iconcol='var(--text-tertiary)',raw_icon=None,plain=False):
    ii=raw_icon or ic(icon,16,iconcol)
    lk=ic(LOCK,12,'var(--text-tertiary)') if lock else ''
    tag='span' if (lock or plain) else 'button type="button" class="prop"'
    end='span' if (lock or plain) else 'button'
    return (f'<{tag} title="{tip}" style="width:100%;min-height:32px;display:flex;align-items:center;gap:10px;padding:6px 8px;border:0;border-radius:8px;background:transparent;text-align:left;line-height:20px">'
            f'<span style="display:inline-flex;flex:0 0 auto">{ii}</span><span class="ell" style="flex:0 1 auto;min-width:0">{val}</span>{lk}{SP}{right}</{end}>')
def kv(k,v,vc='var(--text-primary)',w=400,tip=''):
    return f'<div title="{tip}" style="display:flex;align-items:baseline;gap:8px;min-height:24px"><span style="flex:1 1 auto;color:var(--text-secondary)">{k}</span><span class="num" style="color:{vc};font-weight:{w};white-space:nowrap">{v}</span></div>'
a('<aside aria-label="Szczegóły zlecenia ZS-1047" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Rozliczenie',ghost('Pozycje faktury','Podgląd pozycji faktury'))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Robocizna · 1 h 05','151,67 zł',tip='Wizyta 12 lis, stawka 140 zł/h z umowy')+kv('Robocizna · plan 1 h','140,00 zł','var(--text-tertiary)',tip='Szacunek z planu dzisiejszej wizyty; zastąpi go czas z protokołu')+
  kv('Materiały','228,50 zł')+kv('Dojazd','w umowie','var(--text-secondary)',tip='Dojazd w ryczałcie miesięcznym umowy serwisowej')+
  '<div style="height:1px;margin:6px 0;background:var(--edge)"></div>'+
  '<div title="Faktura powstaje po zmianie statusu na Do rozliczenia" style="display:flex;align-items:center;gap:6px;min-height:24px"><span style="flex:1 1 auto;display:inline-flex;align-items:center;gap:6px;color:var(--text-secondary)">Razem netto'+ic(INFO,12,'var(--text-tertiary)')+'</span><span class="num" style="font-weight:500">520,17 zł</span></div></div></section>')
logo='<span aria-hidden="true" style="width:16px;height:16px;border-radius:5px;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:600;color:var(--text-secondary)">DM</span>'
um='<span title="Umowa serwisowa do 31.12.2026" style="height:20px;display:inline-flex;align-items:center;gap:5px;padding:0 7px;border-radius:10px;background:var(--bg-subtle);font-size:12px;color:var(--text-secondary)"><span style="width:6px;height:6px;border-radius:50%;background:#2F9E5B"></span>Umowa</span>'
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Klient')+
  prop(None,'Delikatesy Morskie','Klient: Delikatesy Morskie sp. z o.o. · Umowa serwisowa do 31.12.2026',um,raw_icon=logo)+
  prop(PIN,'Starowiejska 12, Gdynia','Sklep · wejście dla dostaw od podwórza')+
  prop(None,'Krzysztof Malinowski','Kierownik techniczny · +48 601 482 117',ib('Zadzwoń','Zadzwoń: +48 601 482 117',PHONE,24),raw_icon=av('KM','',16,8),plain=True)+
  '</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Urządzenie')+
  prop(BOX,'Lodziarka Isa Neos 160','UR-3171 · otwórz kartę urządzenia','<span class="mono" style="font-size:11px;color:var(--text-tertiary)">UR-3171</span>')+
  '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:2px 8px 0 34px">'+chip(DROP,'var(--text-tertiary)','R290 0,12 kg','Czynnik i ładunek z karty urządzenia')+chip(SHIELD,'var(--text-tertiary)','','F-gaz nie dotyczy: czynnik naturalny')+chip(HIST,'var(--text-tertiary)','2','2 wcześniejsze zlecenia na tym urządzeniu')+'</div>'
  '</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Szczegóły')+
  prop(WRENCH,'Awaria','Typ zlecenia')+
  prop(FILE,'Naprawa chłodnicza','Szablon protokołu na telefonie')+
  prop(CLOCK,'12 lis, 14:10','Zgłoszono 12 listopada 2026, 14:10 · przyjęła Anna Wiśniewska')+
  prop(CHECKC,'Reakcja 4 h','SLA reakcji z umowy: spełnione, pierwsza wizyta 2 h 10 min od zgłoszenia',lock=True,iconcol='var(--success)')+
  prop(TIMER,'Usunięcie do 14 lis, 14:10','SLA usunięcia awarii z umowy: 48 h',lock=True)+
  prop(HASH,'<span class="mono" style="font-size:12px">ZK/2026/1187</span>','Numer zamówienia klienta')+
  '</section>')
a('</aside></div></sc-if>')
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlec}}"'); j=s.index('<sc-if value="{{isPlan}}"')
s=s[:i]+block+s[j:]
open(P,'w').write(s); print('ok')
