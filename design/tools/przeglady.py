P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
HOME='<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>'
SEND2='<path d="M14.54 21.69a.5.5 0 0 0 .93-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.93l7.93 3.18a2 2 0 0 1 1.11 1.11z"></path><path d="m21.85 2.15-10.94 10.94"></path>'
MSG='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'
AWARD='<path d="m15.48 12.89 1.52 8.55a.5.5 0 0 1-.81.47l-3.59-2.69a1 1 0 0 0-1.19 0l-3.6 2.7a.5.5 0 0 1-.8-.47l1.51-8.56"></path><circle cx="12" cy="8" r="6"></circle>'
CONTRACT='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
WIND='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>'
FLAME='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'
TREND='<path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path>'
ROUTE='<circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle>'
def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def line(icon,icol,txt,right='',tip=''):
    return (f'<div title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:36px;padding:2px 8px;border-radius:10px">'
            f'<span style="display:inline-flex">{ic(icon,16,icol)}</span><span class="ell" style="flex:0 1 auto">{txt}</span>{SP}{right}</div>')
def card(inner,pad='8px 4px'): return f'<div style="display:flex;flex-direction:column;padding:{pad};border-radius:12px;background:var(--bg-raised)">{inner}</div>'
def avs(*ps):
    o=''
    for i,(ini,c) in enumerate(ps): o+=f'<span style="display:inline-flex;{"margin-left:-4px" if i else ""}">{cav(ini,c)}</span>'
    return f'<span style="display:inline-flex">{o}</span>'
# status icons (shape + colour)
def st(kind):
    if kind=='todo': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" stroke-dasharray="2.2 1.6" style="stroke:var(--text-tertiary)"></circle></svg>'
    if kind=='asked': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:#C98A12"></circle><path d="M7 7L7 1.25A5.75 5.75 0 0 1 12.75 7Z" style="fill:#C98A12"></path></svg>'
    if kind=='plan': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:#5E6AD2"></circle><path d="M7 7L7 1.25A5.75 5.75 0 1 1 1.25 7Z" style="fill:#5E6AD2"></path></svg>'
    if kind=='late': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.5" style="fill:var(--danger)"></circle><path d="M7 3.8v3.6M7 9.8h.01" stroke="#fff" stroke-width="1.5" stroke-linecap="round"></path></svg>'
    if kind=='none': return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--text-tertiary)"></circle><path d="M3 11 11 3" stroke-width="1.5" style="stroke:var(--text-tertiary)"></path></svg>'
STN={'todo':'Do zaplanowania','asked':'Klient wybiera termin','plan':'Zaplanowane','late':'Po terminie','none':'Bez umowy'}
BASIS={'fgaz':(SHIELD,'#D6453D','F-gaz'),'um':(CONTRACT,'#5E6AD2','Umowa'),'gw':(AWARD,'#C98A12','Gwarancja')}
TYPEI={'chl':(SNOW,'#3B82D6'),'kl':(WIND,'#2BB3B1'),'pc':(FLAME,'#E0702A')}

# =================== PRZEGLĄDY (lista)
COLS='18px 24px minmax(0,1.3fr) minmax(0,1fr) 128px 76px 56px'
def row(stk,typ,dev,devtip,cli,clitip,basis,btxt,btip,when,whentip,tech,sel=False,sub=''):
    ti,tc=TYPEI[typ]; bi,bc,bl=BASIS[basis]
    bg='background:var(--bg-subtle);' if sel else ''
    chk=(f'<span aria-hidden="true" style="width:16px;height:16px;border-radius:5px;{"background:var(--accent);" if sel else "box-shadow:inset 0 0 0 1.5px var(--border-strong);"}display:inline-flex;align-items:center;justify-content:center">'+(ic(CHECK,12,'#fff') if sel else '')+'</span>')
    whenc='var(--danger)' if stk=='late' else 'var(--text-secondary)'
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:10px;align-items:center;min-height:40px;padding:0 12px 0 10px;border-radius:10px;{bg}">'
            f'<span role="cell">{chk}</span>'
            f'<span role="cell" title="{STN[stk]}" style="display:inline-flex;justify-content:center">{st(stk)}</span>'
            f'<span role="cell" title="{devtip}" style="display:flex;align-items:center;gap:8px;min-width:0">{ic(ti,14,tc)}<span class="ell">{dev}</span>{sub}</span>'
            f'<span role="cell" class="ell" title="{clitip}" style="color:var(--text-secondary)">{cli}</span>'
            f'<span role="cell" style="display:flex;gap:4px;min-width:0">{sch(ic(bi,12,bc)+btxt,btip)}</span>'
            f'<span role="cell" class="num" title="{whentip}" style="text-align:right;color:{whenc}">{when}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{tech}</span>'
            '</div>')
def grp(name,n,extra='',open_=True,icon=''):
    car=ic('<path d="m6 9 6 6 6-6"></path>' if open_ else '<path d="m9 18 6-6-6-6"></path>',14,'var(--text-tertiary)')
    return (f'<div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;margin-top:8px;border-radius:10px;background:var(--bg-raised)">{car}{icon}<span style="font-weight:500">{name}</span>{CNT(n)}{SP}{extra}</div>')
NOT=lambda: avs()  # unused
sugg=lambda ini,c,tip: f'<span title="{tip}" style="display:inline-flex;opacity:.55">{cav(ini,c)}</span>'
H=[];a=H.append
a('<sc-if value="{{isPrz}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CYC,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Przeglądy</h1>'
  '<span style="width:8px"></span>'+''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate([('Najbliższe 60 dni','24'),('F-gaz','17'),('Z umów','31'),('Bez umowy','8')]))+
  SP+ib('Kalendarz','Widok kalendarza  ⇧K',CAL)+ib('Opcje widoku','Opcje widoku  ⇧V','<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>')+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
# filters + summary
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'+
  capd(ic(CAL,14,'var(--text-tertiary)')+'Termin do 18 sty','Filtr: termin w najbliższych 60 dniach')+capd(ic(PIN,14,'var(--text-tertiary)')+'Trójmiasto','Rejon')+
  '<button type="button" class="capd" title="Dodaj filtr  F" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border:0;border-radius:14px;color:var(--text-secondary)">'+ic(PLUS,14)+'Filtr</button>'+SP+
  f'<span style="display:flex;align-items:center;gap:14px;font-size:12px;color:var(--text-secondary)"><span style="display:inline-flex;align-items:center;gap:5px" title="Po terminie">{st("late")}3</span><span style="display:inline-flex;align-items:center;gap:5px" title="Do zaplanowania">{st("todo")}12</span><span style="display:inline-flex;align-items:center;gap:5px" title="Klient wybiera termin">{st("asked")}4</span><span style="display:inline-flex;align-items:center;gap:5px" title="Zaplanowane">{st("plan")}5</span></span></div>')
# selection bar
a('<div style="display:flex;align-items:center;gap:8px;margin:0 20px 8px;height:40px;padding:0 6px 0 12px;border-radius:12px;background:var(--bg-raised)">'
  '<span class="num" style="font-weight:500">2 zaznaczone</span><span style="font-size:12px;color:var(--text-tertiary)">· 2 km od siebie · ~3 h pracy</span>'+SP+
  '<button type="button" class="sec" title="Wyślij klientom SMS z prośbą o wybór terminu" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-size:12px;font-weight:500">'+ic(MSG,14)+'Poproś o termin</button>'
  '<button type="button" class="pri" title="Zaplanuj razem w jednej trasie  P" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:8px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500">'+ic(ROUTE,14)+'Zaplanuj w trasie</button>'+ib('Odznacz','Odznacz  Esc','<path d="M18 6 6 18M6 6l12 12"></path>',28)+'</div>')
# table
a('<div role="table" aria-label="Przeglądy" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:10px;align-items:center;height:24px;padding:0 12px 0 10px;font-size:12px;color:var(--text-tertiary)"><span></span><span></span><span>Urządzenie</span><span>Klient · obiekt</span><span>Podstawa</span><span style="text-align:right">Termin</span><span style="text-align:right">Technik</span></div>')
a(grp('Po terminie',3,'<span style="font-size:12px;color:var(--danger)">kontrole F-gaz</span>'))
a(row('late','chl','Lodziarka','UR-3107 · R404A 5,4 kg · 21,2 t CO₂e','Delikatesy Morskie','Starowiejska 12, Gdynia','fgaz','12 mies.','Kontrola szczelności — obowiązek: 21,2 t CO₂e','12 lis','Termin minął 7 dni temu',cav('KN',KN),sub=obj('ZS-1047','Technik jest dziś na miejscu w ZS-1047 — wykonaj kontrolę przy okazji')))
a(row('late','chl','Agregat Bitzer','UR-2304 · R404A 12,5 kg · 49,0 t CO₂e','Hotel Oliwski','Kuchnia · Gdańsk Oliwa','fgaz','12 mies.','Kontrola szczelności — 49,0 t CO₂e','15 lis','4 dni po terminie',sugg('PD',PD,'Proponowany: Piotr — w pobliżu w czwartek')))
a(row('late','kl','Serwerownia','UR-1988 · klimatyzacja R410A 3,2 kg · 6,7 t CO₂e','Kancelaria Wit','Arkońska 6, Gdańsk','fgaz','12 mies.','Kontrola szczelności — 6,7 t CO₂e','17 lis','2 dni po terminie',sugg('MZ',MZC,'Proponowany: Mateusz')))
a(grp('Grudzień',11,sch('2 bez odpowiedzi klienta','Klienci otworzyli SMS, ale nie wybrali terminu')))
a(row('plan','kl','VRV · 6 jednostek','R410A 24 kg · maszynownia na dachu','Galeria Portowa','Grunwaldzka 212, Gdańsk','um','UM-2026-031','Przegląd półroczny z umowy + kontrola szczelności','2 gru','Środa, 2 grudnia · 8:00',avs(('TL',TL),('MZ',MZC))))
a(row('asked','chl','Komora mroźnicza','UR-2871 · R452A 8 kg · 17,1 t CO₂e','Piekarnia Rogal','Chylońska 70, Gdynia','fgaz','12 mies.','Kontrola szczelności — 17,1 t CO₂e','9 gru','Środa, 9 grudnia',sugg('KN',KN,'Proponowany: Kacper'),sel=True))
a(row('todo','chl','Witryny chłodnicze 3×','UR-3110…3112 · R290, czynnik naturalny','Delikatesy Morskie','Starowiejska 12, Gdynia — 2 km od Piekarni Rogal','um','UM-2025-014','Przegląd półroczny z umowy · F-gaz nie dotyczy','10 gru','Czwartek, 10 grudnia',sugg('KN',KN,'Proponowany: Kacper'),sel=True))
a(row('todo','kl','Split 4×','UR-3301…3304 · R32','Biuro Bilans','Biuro Rachunkowe Bilans · Świętojańska 9, Gdynia','um','UM-2026-008','Przegląd z umowy · raz w roku','11 gru','Piątek, 11 grudnia',sugg('MZ',MZC,'Proponowany: Mateusz')))
a(row('asked','kl','Centrala wentylacyjna','UR-2650 · rekuperacja','Przychodnia Zdrowie','Morska 105, Gdynia','um','UM-2025-022','Przegląd z umowy · wymiana filtrów','15 gru','Wtorek, 15 grudnia',sugg('TL',TL,'Proponowany: Tomasz')))
a(grp('Styczeń',10,'',False))
a(grp('Później · bez umowy',8,sch(ic(SEND2,12,'var(--text-tertiary)')+'propozycje umów','Avero wysyła propozycję umowy 14 dni po montażu'),True))
a(row('none','pc','Pompa ciepła Daikin','UR-4127 · R32 1,5 kg · 1,01 t CO₂e, F-gaz nie dotyczy','Marek Zieliński','Dębogórska 31, Rumia','gw','12 mies.','Warunek gwarancji 5 lat · klient nie ma umowy serwisowej','1 gru 2027','Rok po uruchomieniu',''))
a('</div></div>')
# aside: selected item
a('<aside aria-label="Przegląd: Piekarnia Rogal" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><div style="display:flex;align-items:center;gap:8px">'+ic(SNOW,16,'#3B82D6')+'<span class="mono" style="font-size:12px;color:var(--text-tertiary)">UR-2871</span>'+SP+ib('Otwórz kartę urządzenia','Otwórz  ↵',EYE,24)+'</div>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Kontrola szczelności · komora mroźnicza</h2><span style="font-size:12px;color:var(--text-secondary)">Piekarnia Rogal · Chylońska 70, Gdynia</span>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px;padding-top:4px">'+capd(st('asked')+'Klient wybiera termin','Status')+capd(ic(CAL,14,'var(--text-tertiary)')+'do 9 gru','Termin ustawowy: 12 mies. od ostatniej kontroli (9 gru 2025)')+'</div></div>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Podstawa')+
  prop(SHIELD,'F-gaz · co 12 mies.','R452A 8 kg × GWP 2140 = 17,1 t CO₂e · od 5 do 50 t → kontrola co 12 mies.',sch('17,1 t','Ekwiwalent CO₂'))+
  prop(CHECK,'Ostatnia: 9 gru 2025 · szczelne','PR/2025/12/031 · Kacper Nowak · wpis w CRO',obj('CRO','Wpis w CRO wykonany'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Kontakt z klientem')+
  '<ol style="margin:0;padding:4px 8px;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:12px;line-height:16px;color:var(--text-secondary)">'
  '<li style="display:flex;gap:8px;align-items:center" title="12 lis 9:00 · SMS do Anny Rogal">'+ic(MSG,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">SMS z prośbą o termin</span><span class="num" style="color:var(--text-tertiary)">12 lis</span></li>'
  '<li style="display:flex;gap:8px;align-items:center" title="12 lis 11:42">'+ic(EYE,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Klient otworzył link</span><span class="num" style="color:var(--text-tertiary)">12 lis</span></li>'
  '<li style="display:flex;gap:8px;align-items:center" title="Automatyczne przypomnienie, gdy brak wyboru po 7 dniach">'+ic(CLOCK,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Przypomnienie SMS</span><span class="num" style="color:var(--text-tertiary)">dziś 10:00</span></li></ol></section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Propozycja Avero')+
  '<div style="display:flex;flex-direction:column;gap:10px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;gap:10px">'+ic(ROUTE,16,'var(--accent)')+'<span>Połącz z przeglądem witryn w Delikatesach Morskich — 2 km dalej, ten sam technik i czynnik w busie.</span></div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding-left:26px">'+kv('Środa 9 gru','8:00 – 9:30',tip='Piekarnia Rogal')+kv('','10:00 – 11:30',tip='Delikatesy Morskie · witryny')+'</div>'
  '<div style="display:flex;align-items:center;gap:8px;padding-left:26px">'+cav('KN',KN)+'<span style="flex:1 1 auto;font-size:12px;color:var(--text-secondary)">Kacper · wolny rano · R452A w busie</span></div>'
  '<button type="button" class="pri" title="Zaplanuj oba i wyślij klientom potwierdzenie" style="height:32px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">Zaplanuj oba na 9 gru</button></div></section>')
a('</aside></div></sc-if>')

# =================== UMOWA SERWISOWA
U=[];u=U.append
u('<sc-if value="{{isUm}}" hint-placeholder-val="{{false}}">')
u('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CONTRACT,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Klienci</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Umowy</a>'+ic(CHEV,14,'var(--text-tertiary)')+
  '<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">UM-2026-031</h1>'+SP+ib('Kopiuj link','Kopiuj link',LINK)+ib('Więcej akcji','Więcej akcji',DOTS)+'</div>')
u('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
act='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.5" style="fill:var(--success)"></circle><path d="m4.3 7.2 1.8 1.8 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
u('<div style="display:flex;align-items:flex-start;gap:16px;padding:12px 24px 16px"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">'
  '<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Umowa serwisowa · Galeria Portowa</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(BLD,'Galeria Portowa sp. z o.o.','KL-0142 · NIP 584-025-19-87')+meta(PIN,'Grunwaldzka 212, Gdańsk','2 obiekty: maszynownia na dachu, rozdzielnia')+meta(BOX,'14 urządzeń','VRV, wytwornica wody lodowej, centrale wentylacyjne')+'</div></div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd(act+'Aktywna','Status')+capd(ic(CAL,14,'var(--text-tertiary)')+'1 lut 2026 – 31 sty 2027','Okres obowiązywania')+
  capd(ic(WALLET if 'WALLET' in globals() else CAL,14,'var(--text-tertiary)')+'2 400 zł / mies.','Ryczałt netto: przeglądy, dojazdy, reakcja')+capd(ic(CLOCK,14,'var(--text-tertiary)')+'Reakcja 4 h','SLA: reakcja na awarię w 4 h, 7:00–20:00, 7 dni')+capd(cav('AW','#8A8F98')+'Agnieszka','Opiekun umowy: Agnieszka Wiśniewska','0 10px 0 4px')+'</div></div></div>')
u('<div style="display:flex;flex-direction:column;gap:28px;padding:0 24px 32px;max-width:980px">')
# renewal decision
u('<div role="note" style="display:flex;align-items:center;gap:10px;padding:10px 8px 10px 14px;border-radius:12px;background:var(--bg-raised)">'+ic(CLOCK,16,'var(--warning)')+
  '<span style="flex:1 1 auto;min-width:0">Umowa wygasa za 73 dni. Rentowność 51 %, SLA dotrzymane — warto odnowić z waloryzacją.</span>'+
  sch(ic(TREND,12,'var(--text-tertiary)')+'+4 %','Proponowana waloryzacja wg wzrostu kosztów robocizny i części w 2026','var(--bg-surface)')+
  '<button type="button" class="sec" title="Przygotuj aneks z nową stawką 2 496 zł/mies. od 1 lut 2027" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500;font-size:12px;white-space:nowrap">Przygotuj aneks</button></div>')
# schedule strip
M=['Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru','Sty']
def cell(k):
    if k=='d': return f'<span title="Wykonany" style="display:inline-flex">{ic(CHECK,14,"var(--success)")}</span>'
    if k=='p': return f'<span title="Zaplanowany" style="display:inline-flex">{st("plan")}</span>'
    if k=='t': return f'<span title="Do zaplanowania" style="display:inline-flex">{st("todo")}</span>'
    if k=='f': return f'<span title="Wymiana filtrów" style="width:6px;height:6px;border-radius:50%;background:var(--text-tertiary)"></span>'
    return ''
GC='minmax(0,1fr) '+' '.join(['40px']*12)
def srow(icon,col,n,tip,cells):
    cs=''.join(f'<span style="display:flex;justify-content:center;align-items:center;height:36px;{"background:var(--bg-subtle);" if i==9 else ""}">{cell(c)}</span>' for i,c in enumerate(cells))
    return f'<div role="row" title="{tip}" style="display:grid;grid-template-columns:{GC};align-items:center;padding:0 8px"><span style="display:flex;align-items:center;gap:8px;min-width:0">{ic(icon,14,col)}<span class="ell">{n}</span></span>{cs}</div>'
hdr=''.join(f'<span style="text-align:center;{"color:var(--text-primary);font-weight:500;background:var(--bg-subtle);border-radius:8px 8px 0 0;" if i==9 else ""}">{m}</span>' for i,m in enumerate(M))
u('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Harmonogram',SP+f'<span style="display:flex;gap:12px;font-size:12px;color:var(--text-tertiary)"><span style="display:inline-flex;gap:4px;align-items:center">{ic(CHECK,12,"var(--success)")}wykonany</span><span style="display:inline-flex;gap:4px;align-items:center">{st("plan")}zaplanowany</span><span style="display:inline-flex;gap:4px;align-items:center">{st("todo")}do zaplanowania</span></span>')+
  '<div role="table" aria-label="Harmonogram przeglądów" style="display:flex;flex-direction:column;padding:6px 0;border-radius:12px;background:var(--bg-raised)">'
  f'<div role="row" style="display:grid;grid-template-columns:{GC};height:24px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)"><span>Grupa urządzeń</span>{hdr}</div>'+
  srow(WIND,'#2BB3B1','VRV · 6 jednostek','Przegląd półroczny + kontrola szczelności (R410A 24 kg, 50,1 t CO₂e → co 6 mies.)',['','','','','d','','','','','','p',''])+
  srow(SNOW,'#3B82D6','Wytwornica wody lodowej','Przegląd kwartalny · R134a 18 kg (25,7 t → co 12 mies.)',['','d','','','d','','','d','','','t',''])+
  srow(WIND,'#2BB3B1','Centrale wentylacyjne · 3','Przegląd półroczny + filtry co kwartał',['','d','','','f','','','d','','','f',''])+
  srow(BOLT if 'BOLT' in globals() else WRENCH,'#C98A12','Rozdzielnia · klimatyzatory 4','Przegląd roczny · R32',['','','','d','','','','','','','',''])+
  '</div></section>')
# devices & profitability
u('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Rozliczenie umowy',sch('lut – lis','10 miesięcy obowiązywania'))+
  '<div style="display:flex;gap:8px">'+
  '<div style="flex:1 1 0;display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Ryczałt 10 × 2 400 zł','24 000,00 zł')+kv('Naprawy poza ryczałtem','6 820,00 zł',tip='3 zlecenia: ZS-0988, ZS-1012, ZS-1031')+'<div style="height:1px;margin:6px 0;background:var(--edge)"></div>'+kv('Przychód','30 820,00 zł',w=500)+kv('Koszty: robocizna, części, dojazdy','15 102,00 zł',tip='Z rozliczonych protokołów')+
  '<div style="display:flex;align-items:baseline;gap:8px;min-height:28px"><span style="flex:1 1 auto;color:var(--text-secondary)">Rentowność</span><span class="num" style="font-size:15px;font-weight:600;color:var(--success)">51 %</span></div></div>'+
  '<div style="flex:1 1 0;display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Awarie w okresie','7')+kv('Reakcja w SLA','7 z 7',tip='Wszystkie zgłoszenia obsłużone w 4 h')+kv('Średni czas reakcji','2 h 10 min')+kv('Przeglądy wykonane','7 z 9',tip='2 kolejne w grudniu')+
  '<div style="display:flex;align-items:center;gap:6px;padding-top:6px">'+sch(dot('var(--success)')+'SLA dotrzymane','Brak kar umownych')+'</div></div></div></section>')
u('</div></div>')
# aside
u('<aside aria-label="Warunki umowy UM-2026-031" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
u('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Warunki')+
  prop(CLOCK,'Reakcja 4 h · 7:00–20:00','Czas od zgłoszenia do przyjazdu technika, 7 dni w tygodniu',sch('SLA','Kary: 200 zł za każdą rozpoczętą godzinę opóźnienia'))+
  prop(WRENCH,'Poza ryczałtem 140 zł/h','Naprawy nieobjęte ryczałtem · dojazd w ryczałcie')+
  prop(BOX,'Części −10 %','Rabat od cennika katalogowego')+
  prop(CYC,'Waloryzacja raz w roku','Przy odnowieniu, nie więcej niż 6 %')+'</section>')
u('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Klient')+
  prop(BLD,'Galeria Portowa sp. z o.o.','KL-0142')+prop(PHONE,'Jan Kowalczyk · kierownik techniczny','+48 501 222 314',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+'</section>')
u('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Dokumenty',CNT(3))+'<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+
  sch(ic(FILE,12,'var(--text-tertiary)')+'Umowa','UM-2026-031 · podpisana 20 sty 2026')+sch(ic(FILE,12,'var(--text-tertiary)')+'Załącznik 1','Wykaz urządzeń')+sch(ic(FILE,12,'var(--text-tertiary)')+'Cennik','Cennik części 2026')+'</div></section>')
u('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(U)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isPrz = ekran === 'przeglądy'; const nPrz = navv(isPrz); const isUm = ekran === 'umowa'; const nUm = navv(isUm);")
rep("isFV, actFV:","isPrz, actPrz: nPrz.act, colPrz: nPrz.col, wPrz: nPrz.w, isUm, actUm: nUm.act, colUm: nUm.col, wUm: nUm.w, selUm: nUm.sel, isFV, actFV:")
rep('"faktura", "planowanie"]','"faktura", "przeglądy", "umowa", "planowanie"]')
def navpatch(label,k):
    global s
    i=s.find('>'+label+'</span>'); a0=s.rfind('<a href="#" class="nav"',0,i); e=s.find('</a>',i)
    seg=s[a0:e]
    assert seg.startswith('<a href="#" class="nav" style'),label
    seg=seg.replace('class="nav"',f'class="nav {{{{act{k}}}}}"',1).replace('color:var(--text-secondary)">',f'color:{{{{col{k}}}}}">',1).replace(f'font-weight:400">{label}',f'font-weight:{{{{w{k}}}}}">{label}')
    s=s[:a0]+seg+s[e:]
navpatch('Przeglądy','Prz'); navpatch('Umowy','Um')
zt=s.index('<button type="button" role="tab" aria-selected="{{selZl}}"'); zte=s.index('</button>',zt)+9
tab=('\n<sc-if value="{{isUm}}" hint-placeholder-val="{{false}}"><button type="button" role="tab" aria-selected="{{selUm}}" class="dtab {{actUm}}" title="UM-2026-031 · Galeria Portowa" style="flex:0 1 auto;min-width:0;max-width:200px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;color:{{colUm}};font-size:12px;font-weight:{{wUm}}">'+ic(CONTRACT,14)+'<span class="ell">UM-2026-031</span></button></sc-if>')
s=s[:zte]+tab+s[zte:]
open(P,'w').write(s); print('ok',len(s))
