P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
TRUCK='<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>'
WALLET='<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>'
HOME='<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>'
FLAME='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'
SIGN='<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
LAYERS='<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12"></path><path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17"></path>'
PHONEI='<rect width="14" height="20" x="5" y="2" rx="2"></rect><path d="M12 18h.01"></path>'
CAR='<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle>'
AWARD='<path d="m15.48 12.89 1.52 8.55a.5.5 0 0 1-.81.47l-3.59-2.69a1 1 0 0 0-1.19 0l-3.6 2.7a.5.5 0 0 1-.8-.47l1.51-8.56"></path><circle cx="12" cy="8" r="6"></circle>'
CO2='<path d="M7 18a4 4 0 0 1-.7-7.94A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"></path>'
def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'
def obj(code,tip): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,'var(--bg-surface)')
def line(icon,icol,txt,right='',tip=''):
    return (f'<div title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:36px;padding:2px 8px;border-radius:10px">'
            f'<span style="display:inline-flex">{ic(icon,16,icol)}</span><span class="ell" style="flex:0 1 auto">{txt}</span>{SP}{right}</div>')
def card(inner,pad='8px 4px'): return f'<div style="display:flex;flex-direction:column;padding:{pad};border-radius:12px;background:var(--bg-raised)">{inner}</div>'
def avs(*ps):
    o=''
    for i,(ini,c) in enumerate(ps): o+=f'<span style="display:inline-flex;{"margin-left:-4px" if i else ""}">{cav(ini,c)}</span>'
    return f'<span style="display:inline-flex">{o}</span>'
H=[];a=H.append
a('<sc-if value="{{isZM}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(WRENCH,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Serwis</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Zlecenia</a>'+ic(CHEV,14,'var(--text-tertiary)')+
  '<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">ZS-1052</h1>'+obj('OF-2026-118','Utworzone z zaakceptowanej oferty OF-2026-118 · 18 lis 14:51').replace('var(--bg-surface)','var(--bg-subtle)')+
  SP+ib('Kopiuj link','Kopiuj link  ⌘⇧C',LINK)+ib('Więcej akcji','Więcej akcji',DOTS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
# title
a('<div style="display:flex;align-items:flex-start;gap:16px;padding:12px 24px 16px"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">'
  '<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Montaż pompy ciepła Daikin Altherma 3 R 8 kW</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(HOME,'Marek Zieliński','Klient indywidualny · KL-0388 · +48 604 219 553')+meta(PIN,'Dębogórska 31, Rumia','Dom 160 m² · kotłownia w piwnicy, jednostka zewn. przy ścianie wschodniej')+meta(FILE,'Montaż + uruchomienie','Typ zlecenia: montaż · protokół „Uruchomienie pompy ciepła”')+'</div></div>')
sched='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:#5E6AD2"></circle><path d="M7 4v3l2 1.5" fill="none" stroke-width="1.5" stroke-linecap="round" style="stroke:#5E6AD2"></path></svg>'
caps=[capd(sched+'Zaplanowane','Status  S'),capd(avs(('TL',TL),('MZ',MZC))+'Tomasz, Mateusz','Ekipa: Tomasz Lewandowski (prowadzący), Mateusz Zieliński  A','0 10px 0 4px'),
      capd(ic(CAL,14,'var(--text-tertiary)')+'30 lis – 1 gru','Poniedziałek 30 listopada – wtorek 1 grudnia, 7:30  ⇧D'),capd(dot('#E0702A')+'Pompy ciepła','Etykieta  L','0 10px'),
      capd(ic(WALLET,14,'var(--text-tertiary)')+'44 020,00 zł','Wartość netto z oferty · zaliczka opłacona')]
a('<div style="display:flex;flex-wrap:wrap;gap:6px">'+''.join(caps)+'</div></div>'
  '<div style="display:flex;gap:8px;flex:0 0 auto"><button type="button" class="sec" title="Otwórz w planowaniu  G P" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(CAL,14)+'Planowanie</button></div></div>')
# status path
def ph(t,state,tip):
    if state=='done': mark=ic(CHECK,12,'var(--success)'); st='color:var(--text-secondary)'; bg='transparent'
    elif state=='cur': mark='<span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:var(--accent)"></span>'; st='color:var(--text-primary);font-weight:500'; bg='var(--bg-surface)'
    else: mark='<span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)"></span>'; st='color:var(--text-tertiary)'; bg='transparent'
    return f'<li title="{tip}" style="height:28px;display:inline-flex;align-items:center;gap:8px;padding:0 12px;border-radius:14px;background:{bg};{st};white-space:nowrap">{mark}{t}</li>'
sep='<li aria-hidden="true" style="flex:0 0 12px;height:1px;background:var(--edge)"></li>'
a('<div style="padding:0 24px 20px"><ol aria-label="Etapy zlecenia" style="margin:0;padding:4px;list-style:none;display:flex;align-items:center;gap:2px;border-radius:12px;background:var(--bg-raised);width:max-content">'+
  sep.join([ph('Przyjęte','done','18 lis 14:51 z oferty'),ph('Materiały · 1 z 2','cur','Magazyn gotowy · dostawa od dystrybutora 20 lis'),ph('Dzień 1','todo','pon. 30 lis'),ph('Dzień 2','todo','wt. 1 gru'),ph('Uruchomienie','todo','Protokół w telefonie'),ph('Odbiór','todo','Podpis klienta'),ph('Rozliczenie','todo','Faktura końcowa 33 279,12 zł')])+'</ol></div>')
a('<div style="display:flex;flex-direction:column;gap:28px;padding:0 24px 32px;max-width:960px">')
# readiness
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Gotowość do montażu',sch(dot('var(--warning)')+'4 z 6','2 punkty otwarte'))+
  card(line(WALLET,'var(--success)','Zaliczka opłacona',obj('FZ/2026/11/014','14 262,48 zł · BLIK · 18 lis 14:52'))+
       line(BOX,'var(--success)','Magazyn: moduł, sterownik, bufor',sch('Zarezerwowane','Magazyn główny, regał B2','var(--bg-surface)'))+
       line(TRUCK,'var(--warning)','Jednostka zewnętrzna i fundament',obj('ZD-2026-131','Zamówienie u dystrybutora')+sch(ic(CAL,12,'var(--text-tertiary)')+'20 lis','Potwierdzona dostawa · zapas 10 dni','var(--bg-surface)'))+
       line(CAR,'var(--success)','Narzędzia i rura w busie TL',sch('12 m · azot · pompa','Rura 3/8″ + 5/8″ 12 m, butla azotu, pompa próżniowa, waga','var(--bg-surface)'))+
       line(SHIELD,'var(--success)','Zgoda klienta na montaż przed 14 dniami',sch(ic(SIGN,12,'var(--text-tertiary)')+'18 lis','Podpis w akceptacji oferty','var(--bg-surface)'))+
       '<div style="display:flex;align-items:center;gap:10px;min-height:40px;padding:2px 4px 2px 8px;border-radius:10px">'+ic(WARN,16,'var(--warning)')+'<span style="flex:1 1 auto;min-width:0">Odcięcie gazu przed demontażem kotła — brak instalatora z uprawnieniami</span>'
       '<button type="button" class="sec" title="Wybierz podwykonawcę: Gaz-Serwis Rumia, Instal-Gaz Reda" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500;font-size:12px;white-space:nowrap">Przypisz</button></div>')+'</section>')
# plan of work
def task(t,who,tip='',done=False,mark=None):
    m=mark or ('<span aria-hidden="true" style="width:14px;height:14px;flex:0 0 auto;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)"></span>')
    return (f'<li title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:36px;padding:0 8px;border-radius:10px">{m}'
            f'<span class="ell" style="flex:1 1 auto">{t}</span>{who}</li>')
GAS=sch(ic(FLAME,12,'#E0702A')+'gaz','Instalator gazowy — do przypisania','var(--bg-surface)')
PROT=sch(ic(PHONEI,12,'var(--accent)')+'protokół','Wypełniane w telefonie: szablon „Uruchomienie pompy ciepła”','var(--bg-surface)')
def day(title,sub,tasks):
    return (f'<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px;padding:10px 4px 8px;border-radius:12px;background:var(--bg-raised)">'
            f'<div style="display:flex;align-items:center;gap:8px;padding:0 8px 4px">{ic(CAL,14,"var(--text-tertiary)")}<span style="font-weight:500">{title}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{sub}</span></div>'
            f'<ol style="margin:0;padding:0;list-style:none">{"".join(tasks)}</ol></div>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Plan prac',CNT(10)+SP+ghost(ic(PLUS,14)+'Zadanie','Dodaj zadanie do planu  ⇧A'))+'<div style="display:flex;gap:8px">'+
  day('Pon. 30 lis','7:30 – 16:00',[task('Odcięcie gazu, demontaż kotła',GAS+avs(('MZ',MZC)),'Instalator gazowy odcina i zaślepia; MZ demontuje kocioł'),task('Fundament i jednostka zewnętrzna',avs(('TL',TL),('MZ',MZC))),task('Przepust i trasa chłodnicza 8 m',avs(('TL',TL))),task('Moduł wewnętrzny i bufor 50 l',avs(('MZ',MZC))),task('Zasilanie i zabezpieczenia',avs(('TL',TL)))])+
  day('Wt. 1 gru','7:30 – 15:00',[task('Hydraulika, filtr, naczynie',avs(('MZ',MZC))),task('Próba azotem i próżnia',PROT+avs(('TL',TL))),task('Napełnienie i odpowietrzenie',avs(('MZ',MZC))),task('Uruchomienie i nastawy',PROT+avs(('TL',TL))),task('Instruktaż i odbiór',sch(ic(SIGN,12,'var(--text-tertiary)')+'podpis','Podpis klienta w telefonie technika','var(--bg-surface)')+avs(('TL',TL)))])+
  '</div></section>')
# materials
COLS='minmax(0,1fr) 72px 150px 130px'
def mrow(n,q,src,st,tip=''):
    return (f'<div role="row" class="row" title="{tip}" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;min-height:38px;padding:0 8px;border-radius:10px">'
            f'<span role="cell" class="ell">{n}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{q}</span><span role="cell">{src}</span><span role="cell">{st}</span></div>')
ok=lambda t,tip: sch(dot('var(--success)')+t,tip); wait=lambda t,tip: sch(dot('var(--warning)')+t,tip)
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Materiały',CNT(8)+SP+sch(ic(ARIN if 'ARIN' in globals() else BOX,12,'var(--text-tertiary)')+'RW przy załadunku','Wydanie RW powstanie przy załadunku busa 30 lis 7:00 — stany zmienią się dopiero wtedy'))+
  '<div role="table" aria-label="Materiały zlecenia" style="display:flex;flex-direction:column">'
  f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;height:24px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)"><span>Pozycja</span><span style="text-align:right">Ilość</span><span>Skąd</span><span>Stan</span></div>'+
  mrow('Jednostka zewnętrzna ERGA08EV','1 szt.',sch(ic(TRUCK,12,'var(--text-tertiary)')+'Dystrybutor','ZD-2026-131'),wait('W drodze','Dostawa 20 lis'))+
  mrow('Moduł wewn. EHVH08S23E6V','1 szt.',sch(ic(BOX,12,'var(--text-tertiary)')+'Magazyn B2','Magazyn główny'),ok('Zarezerwowane','Rezerwacja do 30 lis'))+
  mrow('Sterownik Madoka + Wi-Fi','1 kpl',sch(ic(BOX,12,'var(--text-tertiary)')+'Magazyn B2','Magazyn główny'),ok('Zarezerwowane','Rezerwacja do 30 lis'))+
  mrow('Bufor 50 l z osprzętem','1 kpl',sch(ic(BOX,12,'var(--text-tertiary)')+'Magazyn C1','Magazyn główny'),ok('Zarezerwowane','Rezerwacja do 30 lis'))+
  mrow('Rura 3/8″ + 5/8″ z izolacją','8 m',sch(ic(CAR,12,TL)+'Bus TL','W busie Tomasza: 12 m'),ok('W busie','Wystarczy z zapasem 4 m'))+
  mrow('Armatura: filtr, zawory, naczynie 18 l','1 kpl',sch(ic(BOX,12,'var(--text-tertiary)')+'Magazyn A4','Magazyn główny'),ok('Zarezerwowane','Rezerwacja do 30 lis'))+
  mrow('Fundament + antywibracja','1 kpl',sch(ic(TRUCK,12,'var(--text-tertiary)')+'Dystrybutor','ZD-2026-131'),wait('W drodze','Dostawa 20 lis'))+
  mrow('Przewód YDY 5×2,5','12 m',sch(ic(CAR,12,MZC)+'Bus MZ','W busie Mateusza: 40 m'),ok('W busie','—'))+
  '</div></section>')
a('</div></div>')
# aside
a('<aside aria-label="Szczegóły zlecenia ZS-1052" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Rozliczenie')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Wartość brutto','47 541,60 zł',tip='Netto 44 020,00 zł · VAT 8 %')+kv('Zaliczka wpłacona','−14 262,48 zł',tip='FZ/2026/11/014 · 18 lis')+
  '<div style="height:1px;margin:6px 0;background:var(--edge)"></div>'
  '<div style="display:flex;align-items:baseline;gap:8px;min-height:28px"><span style="flex:1 1 auto;color:var(--text-secondary)">Po odbiorze</span><span class="num" style="font-size:15px;font-weight:600">33 279,12 zł</span></div></div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Czynnik i F-gaz')+
  prop(DROP,'R32 · 1,5 kg fabrycznie','Ładunek fabryczny jednostki zewnętrznej · dopełnienie wpisze technik w protokole',sch(ic(CO2,12,'var(--text-tertiary)')+'1,01 t','1,50 kg × GWP 675 = 1,01 t CO₂e'))+
  prop(SHIELD,'Karta CRO','Split z R32 poniżej 7,4 kg (5 t CO₂e) — karta urządzenia w CRO nie jest wymagana',sch(dot('var(--text-tertiary)')+'Nie dotyczy','Avero sprawdzi ponownie po wpisaniu ładunku z protokołu'))+
  prop(CAL,'Kontrola szczelności','Poniżej 5 t CO₂e — bez okresowej kontroli; przegląd roczny z umowy serwisowej',sch(dot('var(--text-tertiary)')+'Nie','—'))+
  prop(AWARD if 'AWARD' in globals() else SHIELD,'Certyfikat F-gaz','Tomasz Lewandowski · certyfikat dla personelu · ważny',sch(dot('var(--success)')+'TL','Ważny'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Urządzenie')+
  prop(BOX,'UR-4127 · powstanie przy uruchomieniu','Karta urządzenia utworzy się z protokołu: numery seryjne, ładunek, parametry pracy, zdjęcia tabliczek')+
  prop(FILE,'Protokół: Uruchomienie pompy ciepła','Szablon przypisany do typu zlecenia „Montaż pompy ciepła”')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Klient')+
  prop(HOME,'Marek Zieliński','Klient indywidualny · KL-0388',ib('Zadzwoń','Zadzwoń: +48 604 219 553',PHONE,24),plain=True)+
  prop(SEND2 if 'SEND2' in globals() else LINK,'SMS przed montażem','Automatyczny SMS 27 lis z godziną przyjazdu ekipy',sch('27 lis','Zaplanowany'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Dokumenty',CNT(4))+'<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+
  sch(ic(FILE,12,'var(--text-tertiary)')+'Umowa','Umowa z akceptacji online · PDF')+sch(ic(FILE,12,'var(--text-tertiary)')+'OF-2026-118','Oferta, wariant B')+sch(ic(FILE,12,'var(--text-tertiary)')+'OZC','Obliczenie obciążenia cieplnego')+sch(ic(FILE,12,'var(--text-tertiary)')+'Instrukcje','Instrukcje montażu Daikin')+'</div></section>')
a('</aside></div></sc-if>')
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isOf = ekran === 'oferta';","const isZM = ekran === 'zlecenie montażu'; const nZlN = navv(isZl || isZM); const nZM = navv(isZM); const isOf = ekran === 'oferta';")
rep("actZl: nZl.act, colZl: nZl.col, wZl: nZl.w, selZl: nZl.sel,","actZl: nZl.act, colZl: nZl.col, wZl: nZl.w, selZl: nZl.sel, isZM, actZM: nZM.act, colZM: nZM.col, wZM: nZM.w, selZM: nZM.sel, actZlN: nZlN.act, colZlN: nZlN.col, wZlN: nZlN.w,")
rep('"zlecenie", "oferta", "planowanie"]','"zlecenie", "zlecenie montażu", "oferta", "planowanie"]')
# nav Zlecenia
i=s.index('<a href="#" class="nav {{actZl}}" title="G Z"'); j=s.index('</a>',i)
seg=s[i:j].replace('{{actZl}}','{{actZlN}}').replace('{{colZl}}','{{colZlN}}').replace('{{wZl}}','{{wZlN}}')
s=s[:i]+seg+s[j:]
# tab
zt=s.index('<button type="button" role="tab" aria-selected="{{selZl}}"'); zte=s.index('</button>',zt)+9
tab=('\n<sc-if value="{{isZM}}" hint-placeholder-val="{{false}}"><button type="button" role="tab" aria-selected="{{selZM}}" class="dtab {{actZM}}" title="ZS-1052 · Montaż pompy ciepła" style="flex:0 1 auto;min-width:0;max-width:200px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;color:{{colZM}};font-size:12px;font-weight:{{wZM}}">'+ic(WRENCH,14)+'<span class="ell">ZS-1052 Montaż pompy</span></button></sc-if>')
s=s[:zte]+tab+s[zte:]
# fix offer "Dalej" CRO line
rep("line(SHIELD,'var(--text-tertiary)','Karta urządzenia i wpis do CRO',sch('po uruchomieniu','Avero utworzy kartę urządzenia z protokołu uruchomienia','var(--bg-surface)'),'Pompa ciepła z R32 · ładunek z protokołu')".replace("'","'"),"line(SHIELD,'var(--text-tertiary)','Karta urządzenia z protokołu uruchomienia',sch('CRO: nie dotyczy','R32 1,5 kg = 1,01 t CO₂e — poniżej progu 5 t, karta CRO niewymagana','var(--bg-surface)'),'Numery seryjne, ładunek i parametry z telefonu technika')") if False else None
open(P,'w').write(s); print('ok',len(s))
