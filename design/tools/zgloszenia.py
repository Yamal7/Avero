# Zgłoszenia (lista + podgląd) i Skrzynka (wspólna korespondencja). Scenariusz: piątek 13 lis 2026, 09:14.
P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'; AWC='#8A8F98'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
INBOX='<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>'
ALERT='<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path>'
MAIL='<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>'
GLOBE='<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"></path>'
PORTAL='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M9 21V9"></path>'
TECHI='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>'
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
REPLY='<path d="m9 17-5-5 5-5"></path><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>'
IMG='<rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"></path>'
MERGE='<path d="M8 6h10a2 2 0 0 1 2 2v3"></path><path d="m17 8 3 3 3-3"></path><path d="M4 4v16"></path><path d="M4 12h9"></path>'
TAG='<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5"></circle>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
WIND='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>'
CONTRACT='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
ARCH='<rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"></path>'
SPARKLE=None  # celowo brak: propozycje Avero bez ikon „AI”

def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def grp(name,n,extra='',open_=True,icon=''):
    car=ic('<path d="m6 9 6 6 6-6"></path>' if open_ else '<path d="m9 18 6-6-6-6"></path>',14,'var(--text-tertiary)')
    return (f'<div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;margin-top:8px;border-radius:10px;background:var(--bg-raised)">{car}{icon}<span style="font-weight:500">{name}</span>{CNT(n)}{SP}{extra}</div>')
def btn(t,tip,icon='',pri=False,h=28):
    if pri: return f'<button type="button" class="pri" title="{tip}" style="height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'

# ---- status zgłoszenia: kształt + kolor (ticketLabels z kodu)
def tst(k):
    if k=='new': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" stroke-dasharray="2.2 1.6" style="stroke:var(--text-tertiary)"></circle></svg>'
    if k=='prog': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--warning)"></circle><path d="M7 7L7 1.25A5.75 5.75 0 0 1 7 12.75Z" style="fill:var(--warning)"></path></svg>'
    if k=='wait': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--text-secondary)"></circle><path d="M5.6 4.8v4.4M8.4 4.8v4.4" stroke-width="1.5" stroke-linecap="round" style="stroke:var(--text-secondary)"></path></svg>'
    if k=='done': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.5" style="fill:var(--success)"></circle><path d="m4.3 7.2 1.8 1.8 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
TSTN={'new':'Nowe','prog':'W obsłudze','wait':'Oczekuje','done':'Zamknięte'}
# ---- priorytet (priorityLabels): Pilny / Normalny / Niski
def prio(k):
    if k=='high': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3" style="fill:var(--danger)"></rect><path d="M7 3.8v3.8M7 10h.01" stroke="#fff" stroke-width="1.6" stroke-linecap="round"></path></svg>'
    bars=[(2,9,3),(6,6,6),(10,3,9)]; on=2 if k=='normal' else 1
    return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">'+''.join(f'<rect x="{x}" y="{y}" width="2.4" height="{12-y}" rx="1" style="fill:{"var(--text-secondary)" if i<on else "var(--border-strong)"}"></rect>' for i,(x,y,_) in enumerate(bars))+'</svg>'
PRN={'high':'Pilny','normal':'Normalny','low':'Niski'}
SRC={'mail':(MAIL,'E-mail'),'portal':(PORTAL,'Portal klienta'),'tel':(PHONE,'Telefon'),'tech':(TECHI,'Zgłosił technik'),'prz':(CYC,'Z przeglądu'),'www':(GLOBE,'Formularz na stronie')}
def src(k,tip=''):
    i,t=SRC[k]; return f'<span title="{t}{(" · "+tip) if tip else ""}" style="display:inline-flex;justify-content:center">{ic(i,14,"var(--text-tertiary)")}</span>'

# =================== ZGŁOSZENIA (lista)
COLS='16px 16px 60px minmax(0,1.7fr) minmax(0,0.9fr) 16px 112px 48px 24px'
def row(pr,stt,num,subj,subjtip,cli,clitip,sk,sktip,visit,visittip,age,agetip,who,sel=False,sub='',agecol='var(--text-tertiary)'):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:10px;align-items:center;min-height:40px;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" title="Priorytet: {PRN[pr]}" style="display:inline-flex">{prio(pr)}</span>'
            f'<span role="cell" title="{TSTN[stt]}" style="display:inline-flex">{tst(stt)}</span>'
            f'<span role="cell" class="mono" style="color:var(--text-tertiary)">{num}</span>'
            f'<span role="cell" title="{subjtip}" style="display:flex;align-items:center;gap:8px;min-width:0"><span class="ell">{subj}</span>{sub}</span>'
            f'<span role="cell" class="ell" title="{clitip}" style="color:var(--text-secondary)">{cli}</span>'
            f'<span role="cell">{src(sk,sktip)}</span>'
            f'<span role="cell" class="ell num" title="{visittip}" style="font-size:12px;color:var(--text-secondary)">{visit}</span>'
            f'<span role="cell" class="num" title="{agetip}" style="text-align:right;font-size:12px;color:{agecol}">{age}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{who}</span>'
            '</div>')
sugg=lambda ini,c,tip: f'<span title="{tip}" style="display:inline-flex;opacity:.5">{cav(ini,c)}</span>'
nobody='<span title="Bez prowadzącego technika" style="width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong);display:inline-block"></span>'
sla=lambda t,tip: f'<span title="{tip}" style="display:inline-flex;align-items:center;gap:3px;font-weight:500;color:var(--danger)">{ic(CLOCK,12,"var(--danger)")}{t}</span>'

H=[];a=H.append
a('<sc-if value="{{isZg}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(ALERT,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Zgłoszenia</h1>'
  '<span style="width:8px"></span>'+''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate([('Otwarte','9'),('Bez technika','3'),('Z umów','4'),('Zamknięte','42')]))+
  SP+ib('Kalendarz wizyt','Kalendarz wizyt  ⇧K',CAL)+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+
  '<span style="width:4px"></span>'+btn('Nowe zgłoszenie','Nowe zgłoszenie  C',PLUS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'+
  capd(ic(USER,14,'var(--text-tertiary)')+'Prowadzący: wszyscy','Filtr: prowadzący technik')+capd(ic(PIN,14,'var(--text-tertiary)')+'Trójmiasto','Rejon')+
  '<button type="button" class="capd" title="Dodaj filtr  F" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border:0;border-radius:14px;color:var(--text-secondary)">'+ic(PLUS,14)+'Filtr</button>'+SP+
  f'<span style="display:flex;align-items:center;gap:14px;font-size:12px;color:var(--text-secondary)"><span style="display:inline-flex;align-items:center;gap:5px" title="Pilne">{prio("high")}2</span><span style="display:inline-flex;align-items:center;gap:5px" title="Nowe">{tst("new")}3</span><span style="display:inline-flex;align-items:center;gap:5px" title="W obsłudze">{tst("prog")}4</span><span style="display:inline-flex;align-items:center;gap:5px" title="Oczekuje">{tst("wait")}2</span></span></div>')
a('<div role="table" aria-label="Zgłoszenia" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:10px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span></span><span></span><span>Numer</span><span>Temat</span><span>Klient · obiekt</span><span></span><span>Wizyta</span><span style="text-align:right" title="Czas do reakcji z umowy albo czas od zgłoszenia">Reakcja</span><span></span></div>')
a(grp('Nowe',3,'<span style="font-size:12px;color:var(--text-secondary)">czekają na technika</span>',icon=tst('new')))
a(row('high','new','ZG-0920','Centrala stoi — alarm zamrożenia','Zgłoszone e-mailem o 6:06 przez Roberta Kamińskiego','Przychodnia Zdrowie','Morska 105, Gdynia · UR-2650','mail','r.kaminski@przychodnia-zdrowie.pl','brak','Proponowany: Piotr, 9:30',sla('0:52','Reakcja do 10:06 · UM-2025-022: 4 h całodobowo'),'',sugg('PD',PD,'Proponowany: Piotr — 6 km, wolny do 11:00'),sel=True,sub=obj('UM','Umowa serwisowa UM-2025-022')))
a(row('normal','new','ZG-0923','Klimatyzator kapie wodą na biurko','Zgłoszenie z portalu klienta · 2 zdjęcia','Biuro Rachunkowe Bilans','Świętojańska 9, Gdynia · split UR-3302','portal','Hanna Bilska, 8:41','brak','Bez terminu','35 min','Zgłoszone 8:41',nobody,sub=sch(ic(IMG,12,'var(--text-tertiary)')+'2','2 zdjęcia od klienta')))
a(row('normal','new','ZG-0924','Komora mroźnicza — oszroniony parownik','Przyjęte telefonicznie przez Agnieszkę o 8:55','Piekarnia Rogal','Chylońska 70, Gdynia · UR-2871','tel','Anna Rogal, 8:55','brak','Bez terminu','19 min','Zgłoszone 8:55',nobody))
a(grp('W obsłudze',4,'',icon=tst('prog')))
a(row('high','prog','ZG-0915','Lodziarka nie chłodzi','Zlecenie ZS-1047','Delikatesy Morskie','Starowiejska 12, Gdynia · UR-3107','tel','12 lis, 16:20','w drodze · 9:40','Kacper w drodze, przyjazd 9:40','17 h','Zgłoszone wczoraj 16:20',cav('KN',KN),sub=obj('ZS-1047','Zlecenie serwisowe')))
a(row('normal','prog','ZG-0912','Agregat często się załącza','Wizyta zaplanowana na dziś 13:00','Hotel Oliwski','Kuchnia · Gdańsk Oliwa · UR-2304','mail','Ewa Malinowska, 11 lis','dziś 13:00','Piątek 13 lis, 13:00–14:30','2 dni','Zgłoszone 11 lis',cav('PD',PD),sub=sch(ic(MAIL,12,'var(--text-tertiary)')+'nowa','Nowa wiadomość od klienta w Skrzynce · 9:02',col='var(--text-primary)')))
a(row('normal','prog','ZG-0909','VRV — głośna praca jednostki 3','Z przeglądu półrocznego','Galeria Bałtycka','Grunwaldzka 141, Gdańsk · maszynownia','prz','PR/2026/10/118','pon 16 lis 8:00','Poniedziałek 16 lis, 8:00–10:00','5 dni','Zgłoszone 8 lis',f'<span style="display:inline-flex">{cav("TL",TL)}</span>',sub=obj('UM','UM-2026-031 · reakcja 4 h')))
a(row('low','prog','ZG-0907','Wymiana filtrów i dezynfekcja','Zgłosił technik po wizycie','Kancelaria Wit','Arkońska 6, Gdańsk · sale 1–3','tech','Mateusz, 6 lis','wt 17 lis 15:00','Wtorek 17 lis, 15:00–16:00','7 dni','Zgłoszone 6 lis',cav('MZ',MZC)))
a(grp('Oczekuje',2,'',icon=tst('wait')))
a(row('normal','wait','ZG-0905','Serwerownia — wymiana wentylatora skraplacza','Czeka na część','Kancelaria Wit','Arkońska 6, Gdańsk · UR-1988','tel','5 lis','—','Termin po dostawie części','8 dni','Zgłoszone 5 lis',cav('MZ',MZC),sub=sch(ic(TRUCK,12,'var(--text-tertiary)')+'część 17 lis','ZD-2026-128 · Klimatech, dostawa wtorek 17 lis')))
a(row('low','wait','ZG-0898','Schładzacz napojów — drzwi nie domykają','Czeka na klienta','Restauracja Przystań','Bulwar Nadmorski 2, Gdynia','portal','2 lis','—','Klient wybiera termin z linku','11 dni','Zgłoszone 2 lis',cav('KN',KN),sub=sch(ic(CLOCK,12,'var(--text-tertiary)')+'klient','SMS z wyborem terminu 10 lis · przypomnienie dziś 12:00')))
a(grp('Zamknięte w listopadzie',42,'',False,icon=tst('done')))
a('</div></div>')
# ---- podgląd ZG-0920
a('<aside aria-label="Zgłoszenie ZG-0920" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><div style="display:flex;align-items:center;gap:8px">'+prio('high')+'<span class="mono" style="color:var(--text-tertiary)">ZG-0920</span>'+SP+ib('Otwórz zgłoszenie','Otwórz  ↵','<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',24)+ib('Więcej akcji','Więcej akcji',DOTS,24)+'</div>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Centrala wentylacyjna stoi — alarm zamrożenia wymiennika</h2><span style="font-size:12px;color:var(--text-secondary)">Przychodnia Zdrowie · Morska 105, Gdynia</span></div>')
# ścieżka statusu (znak rozpoznawczy)
steps=[('Przyjęte','6:06','done'),('Technik','','cur'),('Wizyta','',''),('Protokół','',''),('Zamknięte','','')]
def stp(t,tm,k):
    c={'done':'var(--success)','cur':'var(--text-primary)'}.get(k,'var(--text-tertiary)')
    d={'done':'<span style="width:8px;height:8px;border-radius:50%;background:var(--success)"></span>','cur':'<span style="width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--text-primary)"></span>'}.get(k,'<span style="width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)"></span>')
    return f'<span style="flex:1 1 0;display:flex;flex-direction:column;gap:4px;min-width:0"><span style="display:flex;align-items:center;gap:4px">{d}<span style="flex:1 1 auto;height:1.5px;background:{"var(--success)" if k=="done" else "var(--edge)"}"></span></span><span class="ell" style="font-size:11px;line-height:14px;color:{c};font-weight:{500 if k=="cur" else 400}">{t}</span><span class="num" style="font-size:11px;line-height:14px;color:var(--text-tertiary)">{tm or "&nbsp;"}</span></span>'
a('<div aria-label="Ścieżka statusu" style="display:flex;gap:2px;padding:0 8px">'+''.join(stp(*x) for x in steps)+'</div>')
# SLA
a('<div role="note" style="display:flex;flex-direction:column;gap:8px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:center;gap:8px">'+ic(CLOCK,16,'var(--danger)')+'<span style="flex:1 1 auto">Reakcja do <span class="num" style="font-weight:600">10:06</span></span><span class="num" style="font-weight:600;color:var(--danger)">0:52</span></div>'
  '<div aria-hidden="true" style="height:4px;border-radius:2px;background:var(--bg-subtle);overflow:hidden"><div style="width:78%;height:100%;border-radius:2px;background:var(--danger)"></div></div>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">UM-2025-022 · reakcja 4 h całodobowo · kara 200 zł za każdą rozpoczętą godzinę opóźnienia</span></div>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Od klienta',sch(ic(MAIL,12,'var(--text-tertiary)')+'e-mail 6:06','r.kaminski@przychodnia-zdrowie.pl'))+
  '<p style="margin:0;padding:4px 8px;color:var(--text-secondary);line-height:20px">Od rana centrala w części zabiegowej nie działa, na sterowniku alarm „zamrożenie wymiennika”. W gabinetach robi się duszno, pacjenci od 8:00.</p>'
  '<div style="padding:4px 8px"><a href="#" class="flink" style="font-size:12px;color:var(--text-secondary);display:inline-flex;align-items:center;gap:4px">'+ic(INBOX,12,'var(--text-tertiary)')+'Otwórz wątek w Skrzynce</a></div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Instalacja')+
  prop(WIND,'Centrala wentylacyjna · UR-2650','Rekuperacja, sterownik Siemens · część zabiegowa',obj('UR-2650','Karta urządzenia'))+
  prop(CYC,'Ostatni przegląd: 14 maj','PR/2026/05/022 · wymiana filtrów · Tomasz')+
  prop(CONTRACT,'UM-2025-022 · reakcja 4 h','Umowa serwisowa: przeglądy 2× w roku, reakcja 4 h całodobowo')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Propozycja Avero')+
  '<div style="display:flex;flex-direction:column;gap:10px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:center;gap:10px">'+cav('PD',PD,28,11)+'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="font-weight:500">Piotr Dąbrowski · 9:30</span><span style="font-size:12px;color:var(--text-secondary)">6 km, 14 min · wolny do 13:00 · ma dostęp do klienta</span></div></div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding-left:38px">'+kv('Wizyta','9:30 – 10:30',tip='60 min, typowy czas dla alarmu zamrożenia')+kv('Potem','13:00 Hotel Oliwski',vc='var(--text-secondary)',tip='ZG-0912 — bez zmian')+'</div>'
  '<div style="display:flex;gap:6px">'+btn('Wybierz innego','Lista techników z dostępem do klienta',h=32)+'<span style="flex:1 1 auto;display:flex">'+btn('Przydziel i zaplanuj 9:30','Przydziel Piotra, zaplanuj wizytę i wyślij klientowi potwierdzenie  ⌘↵',pri=True,h=32).replace('justify-content:center;','justify-content:center;flex:1 1 auto;')+'</span></div></div></section>')
a('</aside></div></sc-if>')

# =================== SKRZYNKA
K=[];k=K.append
k('<sc-if value="{{isSk}}" hint-placeholder-val="{{false}}">')
k('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(INBOX,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Skrzynka</h1>'
  '<span style="width:8px"></span>'+''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate([('Do obsłużenia','4'),('Moje','2'),('Czeka na klienta','3'),('Zamknięte','')]))+
  SP+capd(ic(MAIL,14,'var(--text-tertiary)')+'Wszystkie kanały','E-mail serwis, e-mail biuro, portal klienta, formularz na stronie')+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'</div>')
k('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0">')
# lista wątków
def th(name,org,subj,snip,tm,ch,tag='',unread=False,sel=False,ini='',col=AWC,who=''):
    bg='background:var(--bg-subtle);' if sel else ''
    nm=f'<span class="ell" style="flex:1 1 auto;font-weight:{600 if unread else 500}">{name}</span>'
    ud='<span title="Nieprzeczytane" style="width:6px;height:6px;border-radius:50%;background:var(--accent);flex:0 0 auto"></span>' if unread else ''
    return (f'<div role="option" aria-selected="{str(sel).lower()}" class="row" style="display:flex;gap:10px;padding:10px 10px;border-radius:12px;{bg}">'
            f'<span style="display:inline-flex;padding-top:2px">{cav(ini,col,24,10)}</span>'
            '<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px">'
            f'<div style="display:flex;align-items:center;gap:6px;min-width:0">{ud}{nm}<span class="num" style="font-size:12px;color:var(--text-tertiary)">{tm}</span></div>'
            f'<span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{org}</span>'
            f'<span class="ell" style="color:{"var(--text-primary)" if unread else "var(--text-secondary)"};font-weight:{500 if unread else 400}">{subj}</span>'
            f'<span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{snip}</span>'
            f'<div style="display:flex;align-items:center;gap:4px;padding-top:4px">{src(ch)}{tag}{SP}{who}</div>'
            '</div></div>')
k('<div role="listbox" aria-label="Wątki" style="flex:0 0 340px;min-width:0;display:flex;flex-direction:column;gap:2px;padding:0 8px 16px 12px;border-right:1px solid var(--edge)">')
k('<div style="display:flex;align-items:center;gap:8px;height:32px;margin:0 2px 6px;padding:0 10px;border-radius:10px;background:var(--bg-subtle);color:var(--text-tertiary)">'+ic('<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',14)+'<span style="flex:1 1 auto;font-size:12px">Szukaj w wiadomościach</span><span class="mono" style="font-size:11px">/</span></div>')
k(th('Ewa Malinowska','Hotel Oliwski · e.malinowska@hoteloliwski.pl','Re: Agregat często się załącza','Agregat w kuchni znów stanął w nocy, w komorze mięsnej 9 °C…','9:02','mail',sch(ic(MERGE,12,'var(--text-tertiary)')+'pasuje do ZG-0912','Ten sam obiekt i agregat UR-2304 — otwarte zgłoszenie'),unread=True,sel=True,ini='EM',col='#6B7A8F'))
k(th('Hanna Bilska','Biuro Rachunkowe Bilans · portal klienta','Klimatyzator kapie wodą na biurko','Od wczoraj z jednostki w pokoju 2 cieknie woda. Zdjęcia w załączniku.','8:41','portal',obj('ZG-0923','Zgłoszenie utworzone z portalu automatycznie'),unread=True,ini='HB',col='#7E8A6B'))
k(th('Joanna Krawczyk','osoba prywatna · formularz na stronie','Wycena klimatyzacji do mieszkania','3 pokoje, 64 m², 4. piętro, blok w Redłowie. Czy możliwy montaż w grudniu?','8:20','www',sch(ic(TAG,12,'var(--text-tertiary)')+'zapytanie ofertowe','Avero rozpoznał zapytanie o montaż — utwórz lead'),unread=True,ini='JK',col='#8F6B7E'))
k(th('Robert Kamiński','Przychodnia Zdrowie · r.kaminski@przychodnia-zdrowie.pl','Centrala stoi — alarm zamrożenia','Od rana centrala w części zabiegowej nie działa, na sterowniku alarm…','6:06','mail',obj('ZG-0920','Zgłoszenie utworzone przez Agnieszkę o 7:02'),unread=True,ini='RK',col='#6B8F8A',who=f'<span title="Prowadzi: Agnieszka" style="display:inline-flex">{cav("AW",AWC,18,8)}</span>'))
k('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:8px 10px 0;font-size:12px;color:var(--text-tertiary)">Wczoraj</div>')
k(th('Klimatech · zamówienia','dostawca · zamowienia@klimatech.pl','Potwierdzenie zamówienia ZD-2026-128','Wentylator skraplacza EBM — wysyłka 16 lis, dostawa 17 lis.','12 lis','mail',obj('ZG-0905','Przypięte automatycznie po numerze zamówienia ZD-2026-128'),ini='KL',col='#8F8A6B',who=f'<span title="Prowadzi: Agnieszka" style="display:inline-flex">{cav("AW",AWC,18,8)}</span>'))
k(th('Jan Kowalczyk','Galeria Bałtycka · kierownik techniczny','Duplikat faktury za październik','Prosimy o ponowne przesłanie faktury FV/2026/10/087 na adres księgowości.','12 lis','mail',sch(ic(TAG,12,'var(--text-tertiary)')+'finanse','Kategoria: finanse · nie jest zgłoszeniem serwisowym'),ini='JK',col='#6B7A8F',who=f'<span title="Prowadzi: Agnieszka" style="display:inline-flex">{cav("AW",AWC,18,8)}</span>'))
k('</div>')
# wątek
def msg(ini,col,name,meta_,body,tm,kind='in',att=''):
    if kind=='note':
        return (f'<div style="display:flex;gap:10px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'
                f'<span style="display:inline-flex;padding-top:2px">{cav(ini,col,24,10)}</span><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">'
                f'<div style="display:flex;align-items:center;gap:6px"><span style="font-weight:500">{name}</span>{sch(ic(LOCK,12,"var(--text-tertiary)")+"notatka wewnętrzna","Widoczna tylko dla pracowników — klient jej nie zobaczy")}{SP}<span class="num" style="font-size:12px;color:var(--text-tertiary)">{tm}</span></div>'
                f'<span style="line-height:20px">{body}</span></div></div>')
    out=kind=='out'
    return (f'<div style="display:flex;gap:10px;padding:10px 12px;border-radius:12px;{"background:var(--bg-raised);" if not out else ""}">'
            f'<span style="display:inline-flex;padding-top:2px">{cav(ini,col,24,10)}</span><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">'
            f'<div style="display:flex;align-items:center;gap:6px;min-width:0"><span style="font-weight:500">{name}</span><span class="ell" style="font-size:12px;color:var(--text-tertiary)">{meta_}</span>{SP}<span class="num" style="font-size:12px;color:var(--text-tertiary)">{tm}</span></div>'
            f'<span style="line-height:20px;color:{"var(--text-secondary)" if out else "var(--text-primary)"}">{body}</span>{att}</div></div>')
k('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
k('<div style="display:flex;align-items:center;gap:8px;padding:10px 20px 12px"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Re: Agregat często się załącza</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">4 wiadomości · od 11 lis · e-mail serwis</span></div>'+ib('Przypisz','Przypisz  A',USER)+ib('Przenieś do zamkniętych','Zamknij wątek  E',ARCH)+ib('Więcej akcji','Więcej akcji',DOTS)+'</div>')
k('<div style="flex:1 1 auto;display:flex;flex-direction:column;gap:8px;padding:0 20px">')
k('<div style="display:flex;align-items:center;gap:8px;padding:4px 12px;font-size:12px;color:var(--text-tertiary)">'+ic(HIST,14)+'<span>2 wcześniejsze wiadomości z 11 lis</span><a href="#" class="flink" style="color:var(--text-secondary)">Pokaż</a></div>')
k(msg('PD',PD,'Piotr Dąbrowski','','Przy ostatniej wizycie podejrzenie presostatu HP — zabieram nowy (MAG: P-HP-28) i R404A na dolewkę. Kontrola szczelności przypada 15 lis, zrobię przy okazji.','11 lis 15:40','note'))
att=('<div style="display:flex;gap:6px;padding-top:4px">'+sch(ic(IMG,12,'var(--text-tertiary)')+'sterownik.jpg','Zdjęcie sterownika: alarm HP · 1,8 MB')+sch(ic(IMG,12,'var(--text-tertiary)')+'termometr.jpg','Zdjęcie termometru komory · 1,2 MB')+'</div>')
k(msg('EM','#6B7A8F','Ewa Malinowska','do serwis','Dzień dobry, agregat w kuchni znów stanął w nocy, rano w komorze mięsnej było 9 °C. Na sterowniku alarm HP. Państwa technik ma być dziś o 13:00 — czy da się wcześniej? O 11:00 mamy dostawę mięsa.','9:02','in',att))
# odpowiedź (kompozytor)
k('<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;padding:10px 12px 10px;border-radius:12px;background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong)">'
  '<div style="display:flex;align-items:center;gap:4px">'
  '<span role="tab" aria-selected="true" title="Odpowiedź do klienta  R" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:8px;background:var(--bg-subtle);font-size:12px;font-weight:500;white-space:nowrap">'+ic(REPLY,12)+'Odpowiedź do klienta</span>'
  '<span role="tab" aria-selected="false" title="Notatka wewnętrzna  N" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:8px;font-size:12px;color:var(--text-secondary);white-space:nowrap">'+ic(LOCK,12)+'Notatka wewnętrzna</span>'+SP+'</div>'
  '<span class="ell" style="font-size:12px;color:var(--text-tertiary)">Do: Ewa Malinowska &lt;e.malinowska@hoteloliwski.pl&gt; · szkic z propozycji Avero</span>'
  '<p style="margin:0;line-height:20px">Dzień dobry, przesunęliśmy wizytę na dziś <span class="num">10:45</span>. Przyjedzie Piotr Dąbrowski, ma ze sobą nowy presostat i czynnik. Do czasu przyjazdu prosimy nie otwierać komory bez potrzeby.</p>'
  '<span style="font-size:12px;color:var(--text-tertiary)">Kranz HVACR · serwis · podpis z Ustawień</span>'
  '<div style="display:flex;align-items:center;gap:6px">'+ib('Załącz plik','Załącz plik',CLIP,24)+ib('Wstaw szablon','Szablony odpowiedzi  /',FILE,24)+SP+
  '<span style="font-size:12px;color:var(--text-tertiary)">⌘↵ wyślij</span>'+btn('Wyślij','Wyślij odpowiedź  ⌘↵',SEND)+'</div></div>')
k('</div></div>')
# kontekst
k('<aside aria-label="Kontekst wątku" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Nadawca')+
  prop(USER,'Ewa Malinowska · szefowa kuchni','e.malinowska@hoteloliwski.pl · +48 512 408 113',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+
  prop(BLD,'Hotel Oliwski','KL-0217 · kuchnia, Gdańsk Oliwa · kontakt dopasowany po adresie e-mail')+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Otwarte sprawy',CNT(1))+
  '<div style="display:flex;flex-direction:column;gap:6px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:center;gap:8px">'+tst('prog')+'<span class="mono" style="color:var(--text-tertiary)">ZG-0912</span><span class="ell" style="flex:1 1 auto">Agregat często się załącza</span></div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding-left:22px">'+kv('Urządzenie','UR-2304 · Bitzer',tip='Agregat Bitzer · R404A 12,5 kg · 49,0 t CO₂e')+kv('Wizyta','dziś 13:00 · Piotr',tip='13:00–14:30')+kv('F-gaz','kontrola do 15 lis',vc='var(--warning)',tip='Co 12 mies. · 49,0 t CO₂e')+'</div></div></section>')
k('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Propozycja Avero')+
  '<div style="display:flex;flex-direction:column;gap:10px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;gap:10px">'+ic(MERGE,16,'var(--text-secondary)')+'<span>Dołącz wątek do <span class="mono">ZG-0912</span> i podnieś priorytet na <span style="font-weight:500">Pilny</span> — towar w komorze ma 9 °C.</span></div>'
  '<div style="display:flex;gap:10px">'+ic(ROUTE,16,'var(--text-secondary)')+'<span>Przesuń wizytę Piotra z 13:00 na <span class="num" style="font-weight:500">10:45</span> — zaraz po Przychodni Zdrowie, 4 km dalej.</span></div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding-left:26px">'+kv('9:30 – 10:30','Przychodnia Zdrowie',vc='var(--text-secondary)',tip='ZG-0920')+kv('10:45 – 12:15','Hotel Oliwski',tip='ZG-0912 · przed dostawą o 11:00 technik już na miejscu')+'</div>'
  +btn('Dołącz, przesuń i wyślij odpowiedź','Wykonaj obie zmiany i wyślij szkic odpowiedzi  ⌘↵',pri=True,h=32)+
  '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Nic nie zmieni się bez kliknięcia. Klient dostanie tylko treść odpowiedzi — bez notatek wewnętrznych.</span></div></section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Albo')+
  prop(PLUS,'Utwórz nowe zgłoszenie','Z tematu i treści wiadomości · instalacja do wyboru','<span class="mono" title="Skrót" style="font-size:11px;color:var(--text-tertiary)">C</span>') +
  prop(TAG,'Oznacz jako nie-serwis','Finanse, zapytanie ofertowe, dostawca, inne')+'</section>')
k('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isZg = ekran === 'zgłoszenia'; const nZg = navv(isZg); const isSk = ekran === 'skrzynka'; const nSk = navv(isSk);")
rep("isFV, actFV:","isZg, actZg: nZg.act, colZg: nZg.col, wZg: nZg.w, isSk, actSk: nSk.act, colSk: nSk.col, wSk: nSk.w, isFV, actFV:")
rep('"ustawienia", "planowanie"]','"ustawienia", "zgłoszenia", "skrzynka", "planowanie"]')
def navpatch(label,key):
    global s
    j=0
    while True:
        i=s.find('font-weight:400">'+label+'</span>',j); assert i>0,label
        a0=s.rfind('<a href="#" class="nav"',0,i)
        if '</a>' not in s[a0:i]: break
        j=i+1
    e=s.find('</a>',i); seg=s[a0:e]
    seg=seg.replace('class="nav"',f'class="nav {{{{act{key}}}}}"',1).replace('color:var(--text-secondary)">',f'color:{{{{col{key}}}}}">',1).replace(f'font-weight:400">{label}',f'font-weight:{{{{w{key}}}}}">{label}')
    assert '{{col'+key+'}}' in seg and '{{w'+key+'}}' in seg, label
    s=s[:a0]+seg+s[e:]
navpatch('Zgłoszenia','Zg'); navpatch('Skrzynka','Sk')
open(P,'w').write(s); print('ok',len(s))
