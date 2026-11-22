# Serwis › Reklamacje: lista (od klientów / do dostawców / kończące się gwarancje) z panelem RK-2026-011
# i rekord RK-2026-017 (naprawa gwarancyjna z roszczeniem do dystrybutora). Scenariusz: sobota 21 lis 2026.
SRCZ=open('design/tools/zakupy.py').read()
exec(SRCZ.split("# =================== ZAPOTRZEBOWANIE")[0])
exec(open('design/tools/ui1.py').read())
P='design/canvas/Main.dc.html'; s=open(P).read()
KNC='#1FA7A5'; TLC='#9B6BE0'; PKC='#5E6AD2'; PDC='#E0702A'
RET='<path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"></path>'
BADGE='<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><path d="m9 12 2 2 4-4"></path>'
SCALE='<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>'
XC='<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6M9 9l6 6"></path>'
DOTI='<circle cx="12" cy="12" r="10"></circle>'
SEARCH='<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>'
ARR='<path d="M5 12h14M12 5l7 7-7 7"></path>'
dot=lambda c: f'<span aria-hidden="true" style="width:6px;height:6px;border-radius:50%;background:{c};flex:0 0 auto"></span>'
STEPS=['Zgłoszona','Diagnoza','Decyzja','Naprawa','Rozliczenie','Zamknięta']
def stico(i,cur,rej=False):
    if rej: return ic(XC,14,'var(--text-tertiary)')
    if i<cur: return ic(CHECK,14,'var(--success)')
    if i==cur: return f'<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--text-primary)" stroke-width="2"></circle><path d="M12 3a9 9 0 0 1 9 9h-9z" fill="var(--text-primary)"></path></svg>'
    return ic(DOTI,14,'var(--text-tertiary)')
def status(cur,rej=False,label=None):
    t=label or STEPS[cur]
    return f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap">{stico(cur,cur,rej)}<span>{t}</span></span>'
def basis(t,tip): return sch(ic(BADGE,12,'var(--text-tertiary)')+t,tip)
def cav(ini,c,size=20): return f'<span title="{ini}" style="width:{size}px;height:{size}px;border-radius:50%;background:{c};color:#fff;font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto">{ini}</span>'
def head(title,tabsh,right):
    return ('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(RET,16,'var(--text-secondary)')+
            f'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">{title}</h1><span style="width:8px"></span>'+tabsh+SP+right+'</div>')

# =================== LISTA
RC='88px 84px minmax(0,1.6fr) 20px minmax(0,1fr) 136px 104px 20px'
def rrow(st,no,title,cli,dev,devtip,bas,term,termtip,termcol,who,sel=False,muted=False):
    bg='background:var(--bg-subtle);' if sel else ''
    op='opacity:.6;' if muted else ''
    f=cli.split(' · ')[0]; kons=' · konsument' in cli
    k='pc' if ('Aquarea' in dev[0] or 'Altherma' in dev[0]) else ('chł' if 'Parownik' in dev[0] else 'klima')
    kf=f'<span title="Konsument — rękojmia, odpowiedź w 14 dni" style="display:inline-flex">{u_ci("user","pink",12)}</span>' if kons else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{RC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}{op}">'
            f'<span role="cell" style="font-size:12px">{st}</span>'
            f'<span role="cell" class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{no}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:6px;min-width:0"><span class="ell" style="font-weight:500">{title}</span>{kf}</span>'
            f'<span role="cell" style="display:flex">{u_logo(f)}</span>'
            f'<span role="cell" title="{dev[1]} · {devtip}" style="display:flex;align-items:center;gap:6px;min-width:0;font-size:12px">{u_kind(k)}<span class="ell">{dev[0]}</span></span>'
            f'<span role="cell" style="display:flex;min-width:0">{bas}</span>'
            f'<span role="cell" class="num" title="{termtip}" style="display:flex;align-items:center;gap:4px;font-size:12px;color:{termcol}">{u_ci("cal",termcol if termcol.startswith("var(--w") else "blue",12)}<span class="ell">{term}</span></span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{who}</span></div>')
H=[];a=H.append
a('<sc-if value="{{isRek}}" hint-placeholder-val="{{false}}">')
a(head('Reklamacje',tabs([('Od klientów','4'),('Do dostawców','4'),('Gwarancje kończą się','6')],0),
       ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowa reklamacja','Nowa reklamacja — ze zgłoszenia, zlecenia albo urządzenia  C',PLUS)))
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd('Otwarte i z ostatnich 30 dni','4 otwarte · 1 zamknięta w listopadzie')+capd(ic(BADGE,14,'var(--text-tertiary)')+'Każda podstawa','Gwarancja montażu, gwarancja producenta, rękojmia, gwarancja naprawy')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Koszt firmy z zamkniętych reklamacji od 1 stycznia: robocizna, dojazdy i części bez zwrotu">Koszt 2026 <span class="num" style="color:var(--text-primary);font-weight:500">6 840 zł</span></span>'
  '<span title="Zwroty od dostawców i producentów od 1 stycznia">Zwroty <span class="num" style="color:var(--text-primary);font-weight:500">3 920 zł</span></span></span></div>')
# do decyzji
a('<div role="note" style="display:flex;align-items:center;gap:10px;margin:0 20px 8px;padding:8px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(BADGE,16,'var(--text-secondary)')+
  '<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="font-weight:500">ZG-0923 Biuro Bilans — klimatyzator na gwarancji montażu</span>'
  '<span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">UR-2961 Daikin Perfera, montaż 4 kwi 2025 (ZS-0742), gwarancja do 4 kwi 2027. Zgłoszenie z portalu: „kapie wodą na biurko”.</span></span>'+
  btn('Zwykłe zgłoszenie','Obsłuż jako płatne zgłoszenie')+btn('Utwórz reklamację','Reklamacja RK-2026-018 powiązana z ZG-0923 i UR-2961',PLUS)+'</div>')
a('<div role="table" aria-label="Reklamacje od klientów" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{RC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('Stan','flag','green')+u_th('Nr','hash')+u_th('Reklamacja','ret','red')+u_th('','bld','indigo',tip='Klient')+u_th('Urządzenie','box','teal')+u_th('Podstawa','shield','violet')+u_th('Termin','cal','blue')+'<span></span></div>')
a(rrow(status(2),'RK-2026-011','Pompa ciepła nie grzeje wody użytkowej','Ewa Sobczak · Rumia · konsument',('Panasonic Aquarea 9 kW','UR-3540'),'Montaż 22 maj 2025 · ZS-0688',
       basis('rękojmia','Konsument — odpowiedź w 14 dni, inaczej reklamacja uznana'),'odp. do czw 26 lis','Odpowiedź do czwartku 26 listopada · zgłoszona 12 lis · 5 dni na odpowiedź','var(--warning)',cav('TL',TLC),sel=True))
a(rrow(status(3),'RK-2026-017','Błąd E7 jednostki zewnętrznej','Kancelaria Wit · Gdańsk',('Daikin Perfera 5 kW','UR-1990'),'Montaż 14 mar 2025 · ZS-0711',
       basis('gwarancja producenta','Daikin przez Termo-Bud, do 14 mar 2028'),'naprawa pon 23 lis','Poniedziałek 23 listopada, 9:00 · ZS-1078 · części dostarczone 18 lis','var(--text-secondary)',cav('KN',KNC)))
a(rrow(status(1),'RK-2026-015','Hałas jednostki zewnętrznej w nocy','Osiedle Leśne Zacisze · dom 2',('Daikin Altherma 3 R 8 kW','UR-4102'),'PJ-2026-008 · uruchomiona 23 paź',
       basis('gwarancja montażu','24 mies. od odbioru, do 23 paź 2028'),'pomiar śr 25 lis','Pomiar hałasu nocą, 22:00 · TL','var(--text-secondary)',cav('TL',TLC)))
a(rrow(status(4),'RK-2026-016','Wyciek skroplin z klimatyzatora sali','Restauracja Przystań · Gdynia',('Daikin Perfera 3,5 kW','UR-3033'),'Montaż 9 cze 2026 · ZS-0905',
       basis('gwarancja montażu','24 mies., do 9 cze 2028'),'zwrot od Klimatech','Pompka skroplin wymieniona 10 lis · roszczenie do Klimatech wysłane 10 lis, odpowiedź do 24 lis','var(--text-secondary)',cav('KN',KNC)))
a(rrow(status(2,rej=True,label='Odrzucona'),'RK-2026-012','Szron na parowniku po naprawie','Piekarnia Rogal · Gdynia',('Parownik komory mroźniczej','UR-2873'),'Naprawa ZS-0998, 2 paź',
       basis('gwarancja naprawy','3 mies. od naprawy, do 2 sty 2027'),'zamknięta 6 lis','Przyczyna: wlot powietrza zastawiony skrzynkami · protokół z 4 zdjęciami · wizyta płatna 220 zł','var(--text-tertiary)',cav('PD',PDC),muted=True))
a('</div></div>')
# panel RK-2026-011
def step_row(items):
    o='<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">'
    for i,(t,state) in enumerate(items):
        col={'done':'var(--text-secondary)','cur':'var(--text-primary)','todo':'var(--text-tertiary)'}[state]
        o+=f'<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:{col};{"font-weight:500" if state=="cur" else ""}">{stico(0 if state=="done" else (1 if state=="cur" else 2),1)}{t}</span>'
        if i<len(items)-1: o+=ic(ARR,12,'var(--text-tertiary)')
    return o+'</div>'
a('<aside aria-label="Reklamacja RK-2026-011" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">RK-2026-011</span>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Pompa ciepła nie grzeje wody użytkowej</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">Ewa Sobczak · Rumia · zgłoszona e-mailem czw 12 lis</span>'+
  step_row([('Zgłoszona','done'),('Diagnoza','done'),('Decyzja','cur')])+'</div>')
a('<div role="note" style="display:flex;gap:10px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(SCALE,16,'var(--warning)')+
  '<div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">Odpowiedź do czw 26 lis — zostało 5 dni</span>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Klientka jest konsumentem. Brak odpowiedzi w 14 dni oznacza uznanie reklamacji (ustawa o prawach konsumenta). Termin liczy się od 12 lis.</span></div></div>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Diagnoza')+
  '<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span style="line-height:20px">Siłownik zaworu 3-drogowego nie przełącza na zasobnik. Ogrzewanie działa, woda podgrzewana tylko grzałką.</span>'
  '<span style="display:flex;gap:6px;flex-wrap:wrap">'+obj('ZS-1066','Wizyta diagnostyczna wt 17 lis · Tomasz · 1 h')+sch(ic(CAM,12,'var(--text-tertiary)')+'3 zdjęcia','Zdjęcia wewnętrzne — klient ich nie widzi')+sch('kod H23 w historii','Odczyt ze sterownika')+'</span></div></section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Gwarancje UR-3540')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Rękojmia','do 22 maj 2027',tip='2 lata od wydania — wobec konsumenta odpowiada Kranz HVACR')+
  kv('Gwarancja montażu','do 22 maj 2027',vc='var(--text-secondary)',tip='24 mies. od protokołu odbioru PR/2025/05/021')+
  kv('Gwarancja producenta','do 22 maj 2028',vc='var(--text-secondary)',tip='Panasonic przez Termo-Bud · warunek: przegląd co 12 mies. — wykonany 20 maj 2026')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Propozycja')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Klientka płaci','0 zł',w=500)+kv('Siłownik','roszczenie do Termo-Bud',vc='var(--text-secondary)',tip='Wymiana na gwarancji producenta · dostawa 2–3 dni robocze')+
  kv('Koszt firmy','ok. 380 zł',vc='var(--text-secondary)',tip='Robocizna 2 h (diagnoza i wymiana) i 2 dojazdy — bez zwrotu')+kv('Naprawa','do pt 4 gru',vc='var(--text-secondary)')+'</div></section>')
a('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+
  btn('Uznaj i przygotuj odpowiedź','Szkic odpowiedzi do klientki z terminem naprawy — wyślesz po sprawdzeniu  ⌘↵',CHECK,pri=True,h=32)+
  btn('Odrzuć…','Wymaga uzasadnienia i protokołu; odpowiedź z pouczeniem — wyślesz po sprawdzeniu',h=32)+'</div>')
a('</aside></div></sc-if>')

# =================== REKORD RK-2026-017
R=[];r=R.append
r('<sc-if value="{{isRekR}}" hint-placeholder-val="{{false}}">')
r('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(RET,16,'var(--text-secondary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Reklamacje</a>'+ic(CHEV,14,'var(--text-tertiary)')+
  '<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">RK-2026-017</h1>'+SP+ib('Więcej','Więcej  ⋯',DOTS)+'</div>')
r('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:20px;padding:8px 32px 32px">')
r('<div style="display:flex;flex-direction:column;gap:8px"><h2 style="margin:0;font-size:22px;line-height:30px;font-weight:600;letter-spacing:-0.02em">Błąd E7 jednostki zewnętrznej</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--text-secondary)">'+meta(BLD,'Kancelaria Wit · Gdańsk','Klient z umową serwisową do 28 lut 2027')+meta(USER,'Krzysztof Lis','Kierownik biura · zgłosił telefonicznie')+
  meta(CAL,'zgłoszona czw 12 lis','12 listopada 2026, 9:20 · ZG-0918')+'</div>'
  '<div style="display:flex;align-items:center;gap:4px;padding-top:6px;flex-wrap:wrap">'+
  ''.join(f'<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);font-weight:500" if i==3 else ""};font-size:12px;color:{"var(--text-primary)" if i<=3 else "var(--text-tertiary)"}">{stico(i,3)}{t}</span>'+(ic(ARR,12,'var(--text-tertiary)') if i<5 else '') for i,t in enumerate(STEPS))+'</div></div>')
def ev(icon,col,date_,tip,title,body,chips=''):
    return (f'<div style="display:grid;grid-template-columns:24px 92px minmax(0,1fr);column-gap:10px;padding:8px 0">'
            f'<span style="display:inline-flex;padding-top:2px">{ic(icon,16,col)}</span><span class="num" title="{tip}" style="font-size:12px;line-height:20px;color:var(--text-tertiary)">{date_}</span>'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0"><span style="font-weight:500">{title}</span><span style="font-size:12px;line-height:18px;color:var(--text-secondary)">{body}</span>{"<span style=\"display:flex;gap:6px;flex-wrap:wrap\">"+chips+"</span>" if chips else ""}</div></div>')
r('<div style="display:flex;gap:24px;align-items:flex-start">')
r('<section style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">'+ah3('Przebieg')+'<div style="display:flex;flex-direction:column;padding:0 8px">'+
  ev(PHONE,'var(--text-secondary)','czw 12 lis','12 listopada 2026, 9:20','Zgłoszenie','Klimatyzator w pokoju zarządu nie chłodzi, na jednostce zewnętrznej kod E7.',obj('ZG-0918','Zgłoszenie telefoniczne, przyjęła Agnieszka'))+
  ev(WRENCH,'var(--text-secondary)','pt 13 lis','13 listopada 2026, 10:40','Diagnoza — Kacper','Silnik wentylatora jednostki zewnętrznej zablokowany (łożysko). Instalacja szczelna, ciśnienia w normie. Urządzenie zabezpieczone, pokój chłodzi przenośny klimatyzator klienta.',obj('ZS-1064','1 h · dojazd 80 zł')+sch(ic(CAM,12,'var(--text-tertiary)')+'4 zdjęcia','Zdjęcia wewnętrzne'))+
  ev(CHECK,'var(--success)','pt 13 lis','13 listopada 2026, 12:05','Uznana — gwarancja producenta','Odpowiedź do klienta wysłana e-mailem: naprawa bezpłatna, termin po dostawie części.',sch(ic(MAIL,12,'var(--text-tertiary)')+'e-mail do K. Lisa','Wysłane 13 lis 12:05 po zatwierdzeniu przez Agnieszkę'))+
  ev(SEND,'var(--text-secondary)','pt 13 lis','13 listopada 2026, 12:30','Roszczenie do Termo-Bud','Formularz dystrybutora z numerem seryjnym, kodem błędu i zdjęciami. Numer zgłoszenia u dystrybutora: TB-RMA-0412.')+
  ev(CHECK,'var(--success)','pon 16 lis','16 listopada 2026, 14:10','Dystrybutor uznał roszczenie','Silnik wysłany bezpłatnie; ryczałt za robociznę 350 zł po przesłaniu protokołu naprawy. Stary silnik do odesłania w 14 dni od naprawy.')+
  ev(BOX,'var(--text-secondary)','śr 18 lis','18 listopada 2026, 11:00','Części dostarczone','Silnik wentylatora przyjęty na magazyn z oznaczeniem „do reklamacji RK-2026-017”.',obj('PZ/2026/11/024','Przyjęcie zewnętrzne · 0,00 zł'))+
  ev(CAL,'var(--accent)','pon 23 lis','23 listopada 2026, 9:00–11:00','Naprawa zaplanowana — Kacper','Wymiana silnika, test pracy, protokół naprawy gwarancyjnej do podpisu klienta.',obj('ZS-1078','pon 23 lis 9:00 · 2 h'))+
  '</div></section>')
# karta rozliczenia
r('<section style="flex:0 0 300px;display:flex;flex-direction:column;gap:6px">'+ah3('Rozliczenie')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Klient płaci','0 zł',w=500)+kv('Zwrot od Termo-Bud','+350 zł',vc='var(--text-secondary)',tip='Ryczałt za robociznę · nota po naprawie')+
  kv('Robocizna','−285 zł',vc='var(--text-secondary)',tip='Diagnoza 1 h + naprawa 2 h × 95 zł koszt godziny')+kv('Dojazdy','−160 zł',vc='var(--text-secondary)',tip='2 × 80 zł')+
  '<div style="height:1px;background:var(--edge);margin:6px 0"></div>'+kv('Wynik reklamacji','−95 zł',w=500,tip='Koszt firmy po zwrocie od dystrybutora')+'</div>'
  '<div style="display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'
  '<span style="font-size:12px;font-weight:500;color:var(--text-secondary)">Po naprawie</span>'+
  ''.join(f'<span style="display:flex;gap:8px;font-size:12px;line-height:16px">{ic(DOTI,14,"var(--text-tertiary)")}<span>{t}</span></span>' for t in ['Protokół naprawy do Termo-Bud (z TB-RMA-0412)','Stary silnik do odesłania do pon 7 gru','Nota na 350 zł dla Termo-Bud — szkic do sprawdzenia'])+
  '</div></section></div>')
r('</div>')
# panel urządzenia
r('<aside aria-label="Urządzenie UR-1990" style="flex:0 0 320px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
r('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">UR-1990</span><span style="font-size:15px;line-height:22px;font-weight:600">Daikin Perfera 5 kW</span>'
  '<span style="font-size:12px;color:var(--text-secondary)">Pokój zarządu · R32 1,15 kg · 0,78 t CO₂e</span></div>')
r('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Gwarancje')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Producent','do 14 mar 2028',tip='Daikin przez Termo-Bud · 36 mies. od montażu')+
  '<span style="display:flex;align-items:center;gap:6px;padding:0 0 4px;font-size:12px;color:var(--text-secondary)">'+ic(CHECK,12,'var(--success)')+'warunek: przegląd co 12 mies. — 11 mar 2026</span>'+
  kv('Montaż','do 14 mar 2027',vc='var(--text-secondary)',tip='24 mies. od protokołu odbioru PR/2025/03/009')+'</div></section>')
r('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Historia urządzenia',CNT(4))+
  ''.join(f'<div title="{tip}" style="display:grid;grid-template-columns:64px minmax(0,1fr) auto;column-gap:8px;align-items:center;min-height:30px;padding:0 8px;font-size:12px"><span class="num" style="color:var(--text-tertiary)">{d}</span><span class="ell">{t}</span><span class="mono" style="font-size:11px;color:var(--text-tertiary)">{c}</span></div>'
          for d,t,c,tip in [('13 lis','Diagnoza E7','ZS-1064','Kacper'),('11 mar','Przegląd roczny, umowa','ZS-0874','Piotr · w ramach UW-2025-006'),('14 mar 25','Montaż i uruchomienie','ZS-0711','Tomasz i Mateusz'),('14 mar 25','Protokół odbioru','PR/2025/03/009','Podpisał K. Lis')])+'</section>')
r('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Inne reklamacje klienta')+
  '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Brak — pierwsza reklamacja Kancelarii Wit.</span></section>')
r('</aside></div></sc-if>')

# =================== DO DOSTAWCÓW
DC='88px minmax(0,1.4fr) 20px 112px minmax(0,1fr) 64px minmax(0,1fr)'
def drow(st,what,sup_,ref,src,srctip,req,val,valtip,nxt,nxttip,nxtcol='var(--text-secondary)',sel=False,muted=False):
    bg='background:var(--bg-subtle);' if sel else ''
    op='opacity:.6;' if muted else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{DC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}{op}">'
            f'<span role="cell" style="font-size:12px">{st}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:6px;min-width:0">{u_ci("box","orange")}<span class="ell" title="Nr po stronie dostawcy: {ref}" style="font-weight:500">{what}</span></span>'
            f'<span role="cell" style="display:flex">{u_logo(sup_)}</span>'
            f'<span role="cell" class="mono ell" title="{srctip}" style="font-size:11px;color:var(--text-secondary)">{src}</span>'
            f'<span role="cell" class="ell" style="font-size:12px;color:var(--text-secondary)">{req}</span>'
            f'<span role="cell" class="num" title="{valtip}" style="text-align:right">{val}</span>'
            f'<span role="cell" class="ell" title="{nxttip}" style="font-size:12px;color:{nxtcol}">{nxt}</span></div>')
def dst(t,kind):
    icn={'draft':ic(PEN if 'PEN' in globals() else FILE,14,'var(--text-tertiary)'),'sent':ic(SEND,14,'var(--text-secondary)'),'ok':ic(CHECK,14,'var(--success)'),'done':ic(CHECK,14,'var(--text-tertiary)')}[kind]
    return f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap">{icn}<span>{t}</span></span>'
D=[];d=D.append
d('<sc-if value="{{isRekD}}" hint-placeholder-val="{{false}}">')
d(head('Reklamacje',tabs([('Od klientów','4'),('Do dostawców','4'),('Gwarancje kończą się','6')],1),
       ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowe roszczenie','Roszczenie do dostawcy — z reklamacji albo z przyjęcia towaru (PZ)  C',PLUS)))
d('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
d('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd('Otwarte i z ostatnich 30 dni','3 otwarte · 1 szkic · 1 zamknięte w listopadzie')+capd(ic(BLD,14,'var(--text-tertiary)')+'Wszyscy dostawcy','Termo-Bud, Klimatech, Frigo-Serwis, Chłodpol')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Uznane albo wysłane roszczenia, jeszcze nierozliczone: ryczałt Termo-Bud 350 + pompka Klimatech 240 + korekta Frigo-Serwis 182">Do odzyskania <span class="num" style="color:var(--text-primary);font-weight:500">772 zł</span></span>'
  '<span title="Stary silnik do Termo-Bud do 7 gru · pompka Klimatech czeka na decyzję dostawcy">Do odesłania <span class="num" style="color:var(--text-primary);font-weight:500">1 część/span></span></span></div>')
d('<div role="table" aria-label="Roszczenia do dostawców" style="display:flex;flex-direction:column;padding:0 16px 24px">')
d(f'<div role="row" style="display:grid;grid-template-columns:{DC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('Stan','flag','green')+u_th('Towar','box','orange')+u_th('','truck','indigo',tip='Dostawca')+u_th('Źródło','file','violet')+u_th('Żądanie','text','teal')+u_th('Wartość','coin','yellow','right')+u_th('Dalej','arrow','blue')+'</div>')
d(drow(dst('Wysłane','sent'),'Pompka skroplin 12 l/h','Klimatech Gdańsk','e-mail 10 lis','RK-2026-016','Restauracja Przystań · pompka z ZK/2026/06/012, przyjęta PZ/2026/06/018',
       'zwrot kosztu albo nowa pompka','240 zł','Cena zakupu netto z PZ/2026/06/018','odpowiedź do wt 24 lis','14 dni wg warunków Klimatech · zostały 3 dni','var(--warning)',sel=True))
d(drow(dst('Uznane','ok'),'Silnik wentylatora jedn. zewn.','Termo-Bud Pomorze','TB-RMA-0412','RK-2026-017','Kancelaria Wit · Daikin Perfera 5 kW UR-1990',
       'część + ryczałt robocizny','350 zł','Ryczałt za robociznę po protokole naprawy · część 0 zł (PZ/2026/11/024)','odesłać stary silnik do 7 gru','Po naprawie pon 23 lis · etykieta zwrotna od dystrybutora'))
d(drow(dst('Uznane','ok'),'Presostat HP 28 bar — wada fabryczna','Frigo-Serwis Gdańsk','RF-2026-118','PZ/2026/10/031','Przyjęcie z ZK/2026/10/019 · nie trzymał nastawy przy próbie',
       'korekta faktury','182 zł','Uznane 12 lis · korekta faktury FZ 3315/10/2026','czeka na korektę','Korekta obiecana do 27 lis · wada wykryta przed montażem'))
d(drow(dst('Szkic','draft'),'Siłownik zaworu 3-drogowego','Termo-Bud Pomorze','—','RK-2026-011','Ewa Sobczak · Panasonic Aquarea 9 kW UR-3540',
       'część na gwarancji producenta','690 zł','Cena zakupu netto wg cennika Panasonic 2026','wyślij po uznaniu RK-2026-011','Formularz dystrybutora wypełniony z diagnozy ZS-1066 — wysyłka po decyzji w reklamacji','var(--text-tertiary)'))
d(drow(dst('Zamknięte','done'),'Butla R32 9 kg — nieszczelny zawór','Chłodpol Gdynia','e-mail 3 lis','PZ/2026/11/004','Butla zwrotna wymieniona przy dostawie 4 lis',
       'wymiana butli','0 zł','Wymieniona bez kosztów','wymieniona 4 lis','Zamknięte 4 listopada','var(--text-tertiary)',muted=True))
d('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">'+ic(BOX,14,'var(--text-tertiary)')+
  '<span>Części do reklamacji leżą w magazynie na półce R-2 z etykietą roszczenia — nie trafiają do wydań ani inwentaryzacji.</span></div>')
d('</div></div>')
# panel Klimatech
d('<aside aria-label="Roszczenie do Klimatech" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
d('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span style="font-size:12px;color:var(--text-tertiary)">Klimatech Gdańsk · DS-003</span>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Pompka skroplin 12 l/h</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">Z reklamacji RK-2026-016 · Restauracja Przystań</span></div>')
d('<div role="note" style="display:flex;gap:10px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(CLOCK,16,'var(--warning)')+
  '<div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">Odpowiedź do wt 24 lis — zostały 3 dni</span>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Warunki handlowe Klimatech: 14 dni na rozpatrzenie od zgłoszenia. Po terminie Avero przygotuje przypomnienie.</span></div></div>')
d('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Towar')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Zamówienie','ZK/2026/06/012',vc='var(--text-secondary)')+kv('Przyjęcie','PZ/2026/06/018 · 3 cze',vc='var(--text-secondary)')+
  kv('Zamontowana','9 cze · UR-3033',vc='var(--text-secondary)',tip='Daikin Perfera 3,5 kW, sala restauracji')+kv('Awaria','po 5 mies. pracy',vc='var(--text-secondary)',tip='Pływak zablokowany, silnik nie startuje')+kv('Gwarancja dostawcy','24 mies.',vc='var(--text-secondary)')+'</div></section>')
d('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Zgłoszenie do dostawcy')+
  '<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span style="line-height:20px">E-mail do działu reklamacji z numerem PZ, opisem awarii i 3 zdjęciami.</span>'
  '<span style="display:flex;gap:6px;flex-wrap:wrap">'+sch(ic(MAIL,12,'var(--text-tertiary)')+'wysłany 10 lis 15:20','Wysłała Agnieszka po sprawdzeniu szkicu')+sch(ic(CAM,12,'var(--text-tertiary)')+'3 zdjęcia','Zdjęcia wewnętrzne')+'</span></div></section>')
d('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Żądanie')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Zwrot kosztu albo nowa pompka','240 zł',w=500)+kv('Robocizna','bez zwrotu',vc='var(--text-secondary)',tip='Klimatech nie pokrywa robocizny — koszt w RK-2026-016')+
  kv('Uszkodzona pompka','R-2, do dyspozycji',vc='var(--text-secondary)',tip='Odeślemy, jeśli dostawca poprosi')+'</div></section>')
d('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+
  btn('Zapisz odpowiedź dostawcy','Uznane / odrzucone, kwota i co odesłać  ⌘↵',CHECK,pri=True,h=32)+
  btn('Przygotuj przypomnienie','Szkic e-maila do Klimatech — wyślesz po sprawdzeniu',MAIL,h=32)+'</div>')
d('</aside></div></sc-if>')

# =================== GWARANCJE KOŃCZĄ SIĘ
GC='minmax(0,1.3fr) 20px 20px minmax(0,1fr) 108px minmax(0,1.4fr) 20px'
def grow_(dev,code,cli,clitip,kind,end,endtip,endcol,nxt,nxttip,who,sel=False,muted=False):
    bg='background:var(--bg-subtle);' if sel else ''
    op='opacity:.6;' if muted else ''
    f=cli.split(' · ')[0]
    um='Umowa' in clitip
    k='pc' if 'Aquarea' in dev else ('chł' if 'Witryna' in dev else 'klima')
    ui=f'<span title="{clitip}" style="display:inline-flex">{u_ci("contract","green") if um else u_ci("contract","var(--border-strong)")}</span>'
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{GC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}{op}">'
            f'<span role="cell" style="display:flex;align-items:center;gap:6px;min-width:0">{u_kind(k)}<span class="ell" title="{code}" style="font-weight:500">{dev}</span></span>'
            f'<span role="cell" style="display:flex">{u_logo(f)}</span>'
            f'<span role="cell" style="display:flex">{ui}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;color:var(--text-secondary)">{u_ci("shield","violet",12)}<span class="ell">{kind}</span></span>'
            f'<span role="cell" class="num" title="{endtip}" style="font-size:12px;color:{endcol}">{end}</span>'
            f'<span role="cell" class="ell" title="{nxttip}" style="font-size:12px;color:var(--text-secondary)">{nxt}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{who}</span></div>')
G=[];g=G.append
g('<sc-if value="{{isRekG}}" hint-placeholder-val="{{false}}">')
g(head('Reklamacje',tabs([('Od klientów','4'),('Do dostawców','4'),('Gwarancje kończą się','6')],2),
       ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)))
g('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
g('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd(ic(CAL,14,'var(--text-tertiary)')+'W ciągu 60 dni','Do 20 stycznia 2027 · 6 urządzeń u 5 klientów')+capd(ic(BADGE,14,'var(--text-tertiary)')+'Montaż i producent','Gwarancja montażu (nasza) i producenta')+SP+
  '<span style="font-size:12px;color:var(--text-secondary)" title="Klienci bez umowy, którym zaproponowano przegląd lub umowę">Bez umowy <span class="num" style="color:var(--text-primary);font-weight:500">4</span></span></div>')
g('<div role="table" aria-label="Gwarancje kończące się w 60 dni" style="display:flex;flex-direction:column;padding:0 16px 24px">')
g(f'<div role="row" style="display:grid;grid-template-columns:{GC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('Urządzenie','box','teal')+u_th('','bld','indigo',tip='Klient')+u_th('','contract','green',tip='Umowa serwisowa')+u_th('Gwarancja','shield','violet')+u_th('Koniec','cal','orange')+u_th('Dalej','arrow','blue')+'<span></span></div>')
g(grow_('2 × Daikin Perfera 2,5 kW','UR-2742, UR-2743','Przychodnia Zdrowie · Gdynia','Bez umowy serwisowej','gwarancja montażu, 24 mies.','pt 28 lis · 7 dni','Piątek 28 listopada 2026','var(--warning)',
        ic(CHECK,12,'var(--success)')+' przegląd umówiony wt 24 lis','ZS-1081 · Piotr · usterki zgłoszone do 28 lis naprawimy w ramach gwarancji',cav('PD',PDC)))
g(grow_('Panasonic Aquarea 7 kW','UR-2655','Jolanta Mazur · Reda · konsument','Osoba prywatna, bez umowy','gwarancja producenta, 36 mies.','śr 9 gru · 18 dni','Środa 9 grudnia 2026','var(--text-primary)',
        'e-mail 16 lis nieotwarty — zadzwoń','Propozycja: przegląd przed końcem gwarancji 380 zł i umowa 590 zł/rok',cav('TL',TLC),sel=True))
g(grow_('Witryna chłodnicza 1,25 m','UR-2588','Restauracja Port · Gdynia','Należność po terminie 2 420 zł (74 dni)','gwarancja montażu, 24 mies.','wt 15 gru · 24 dni','Wtorek 15 grudnia 2026','var(--text-primary)',
        ic(WARN,12,'var(--warning)')+' wstrzymane — należność po terminie','Propozycja czeka do spłaty FV/2026/09/018 — decyzja Pascala',cav('PK',PKC)))
g(grow_('Daikin split 5 kW · serwerownia','UR-2611','Biuro Rachunkowe Saldo · Gdynia','Umowa serwisowa UW-2025-011 do 31 sty 2028','gwarancja producenta, 36 mies.','pon 11 sty 2027','Poniedziałek 11 stycznia 2027','var(--text-secondary)',
        'umowa obejmuje — nic do zrobienia','Przegląd roczny w umowie, ostatni 8 paź 2026',cav('PD',PDC),muted=True))
g(grow_('Daikin Sensira 3,5 kW','UR-2634','Apteka Pod Lipami · Rumia','Bez umowy','gwarancja montażu, 24 mies.','pon 18 sty 2027','Poniedziałek 18 stycznia 2027','var(--text-secondary)',
        'przypomnienie 19 gru (30 dni przed)','Avero przygotuje propozycję umowy ok. 690 zł/rok — wysyłka po zatwierdzeniu',cav('KN',KNC)))
g('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">'+ic(CLOCK,14,'var(--text-tertiary)')+
  '<span>Avero przygotowuje propozycję 60 i 30 dni przed końcem gwarancji. Wysyłka zawsze po zatwierdzeniu; klient z umową i klient z należnością po terminie są pomijani.</span></div>')
g('</div></div>')
# panel Jolanta Mazur
g('<aside aria-label="Gwarancja UR-2655" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
g('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">UR-2655</span>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Panasonic Aquarea 7 kW</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">Jolanta Mazur · Reda, Gdańska 41 · montaż 9 gru 2023 (ZS-0412)</span></div>')
g('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Gwarancje')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Producent','do śr 9 gru',w=500,tip='36 mies. od montażu · Panasonic przez Termo-Bud')+
  '<span style="display:flex;align-items:center;gap:6px;padding:0 0 4px;font-size:12px;color:var(--text-secondary)">'+ic(CHECK,12,'var(--success)')+'warunek: przegląd co 12 mies. — ostatni 2 gru 2025</span>'+
  kv('Montaż','wygasła 9 gru 2025',vc='var(--text-tertiary)',tip='24 mies. od odbioru')+kv('Reklamacje','brak',vc='var(--text-secondary)')+'</div></section>')
g('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Propozycja')+
  '<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span style="line-height:20px">Przegląd przed końcem gwarancji: usterki wykryte do 9 gru naprawimy na koszt producenta. Potem umowa serwisowa z przeglądem w cenie.</span></div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Przegląd gwarancyjny','380 zł brutto',tip='Szablon „Przegląd pompy ciepła” · ok. 1,5 h')+kv('Umowa serwisowa','590 zł netto / rok',vc='var(--text-secondary)',tip='Przegląd roczny, czas reakcji 48 h, −10 % na części')+'</div></section>')
g('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Kontakt',CNT(1))+
  prop(MAIL,'E-mail 16 lis — nieotwarty','Wysłany po zatwierdzeniu przez Tomasza')+
  '<div style="display:flex;align-items:center;gap:8px;min-height:32px;padding:0 8px;font-size:12px;color:var(--text-tertiary)">'+ic(INFO if 'INFO' in globals() else CLOCK,14,'var(--text-tertiary)')+'<span>SMS niedostępny — kanał czeka na dostawcę (Ustawienia › Integracje).</span></div></section>')
g('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+
  btn('Zadzwoń i umów przegląd','+48 601 334 270 · po rozmowie wybierz termin w Planowaniu',PHONE,pri=True,h=32)+
  btn('Nie proponuj więcej','Klientka odmówiła — wpis w historii, bez kolejnych przypomnień',h=32)+'</div>')
g('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(R)+'\n'+'\n'.join(D)+'\n'+'\n'.join(G)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x_,y_):
    global s; assert s.count(x_)==1,x_[:60]; s=s.replace(x_,y_)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isRek = ekran === 'reklamacje'; const isRekR = ekran === 'reklamacja'; const isRekD = ekran === 'reklamacje dostawcy'; const isRekG = ekran === 'reklamacje gwarancje'; const nRek = navv(isRek || isRekR || isRekD || isRekG);")
rep("isFV, actFV:","isRek, isRekR, isRekD, isRekG, actRek: nRek.act, colRek: nRek.col, wRek: nRek.w, isFV, actFV:")
rep('"planowanie"]','"reklamacje", "reklamacje dostawcy", "reklamacje gwarancje", "reklamacja", "planowanie"]')
# pozycja w pasku: Serwis › po Przeglądach
NAVI=('<a href="#" class="nav {{actRek}}" style="display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-radius:8px;color:{{colRek}}">'
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto">'+RET+'</svg>'
      '<span class="ell" style="flex:1 1 auto;font-weight:{{wRek}}">Reklamacje</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">4</span></a>')
x_='Przeglądy</span></a>'
i=s.find(x_); assert i>0 and s.count(x_)==1
s=s[:i+len(x_)]+NAVI+s[i+len(x_):]
open(P,'w').write(s); print('ok reklamacje',len(s))
