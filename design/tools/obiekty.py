# Obiekty: lista miejsc u klientów (lokalizacje z backendu) i rekord obiektu Hotel Oliwski. Scenariusz: piątek 20 lis 2026, 9:00.
P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
MAPI='<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"></path><path d="M15 5.764v15M9 3.236v15"></path>'
LIST='<path d="M3 12h18M3 6h18M3 18h18"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
WIND='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>'
SHIELD='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
KEY='<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6"></path><circle cx="7.5" cy="15.5" r="5.5"></circle>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
COIN='<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"></path>'
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
TARGET='<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>'
CAM='<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def btn(t,tip,icon='',pri=False,h=28):
    if pri: return f'<button type="button" class="pri" title="{tip}" style="height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'
def tabs(items,cur=0):
    return ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))
def fg(t,kind,tip):
    col={'late':'var(--danger)','soon':'var(--warning)','ok':'var(--text-secondary)','na':'var(--text-tertiary)'}[kind]
    icn=ic(SHIELD,12,col) if kind!='na' else ''
    return f'<span title="{tip}" class="num" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:{col};font-weight:{500 if kind in ("late","soon") else 400};white-space:nowrap">{icn}{t}</span>'

# =================== LISTA
COLS='minmax(0,1.6fr) minmax(0,1fr) 92px 112px 132px 104px 64px 96px'
def row(name,addr,cli,kind,dev,devtip,fgz,um,open_,last,lasttip,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;min-height:48px;padding:4px 10px;border-radius:10px;{bg}">'
            f'<span role="cell" style="display:flex;align-items:center;gap:10px;min-width:0">{ic(PIN,14,"var(--text-tertiary)")}<span style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:500">{name}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{addr}</span></span></span>'
            f'<span role="cell" class="ell" style="color:var(--text-secondary)">{cli}</span>'
            f'<span role="cell" style="font-size:12px;color:var(--text-secondary)">{kind}</span>'
            f'<span role="cell" class="num" title="{devtip}" style="text-align:right;font-size:12px;color:var(--text-secondary)">{dev}</span>'
            f'<span role="cell" style="display:flex">{fgz}</span>'
            f'<span role="cell" style="display:flex">{um}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-size:12px;color:var(--text-secondary)">{open_}</span>'
            f'<span role="cell" class="num" title="{lasttip}" style="text-align:right;font-size:12px;color:var(--text-secondary);white-space:nowrap">{last}</span></div>')
dash='<span style="color:var(--text-tertiary)">—</span>'
H=[];a=H.append
a('<sc-if value="{{isObj}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(PIN,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Obiekty</h1><span style="width:8px"></span>'+
  tabs([('Wszystkie','84'),('F-gaz po terminie','3'),('Z umową','21'),('Archiwum','6')])+SP+
  '<span role="radiogroup" aria-label="Rodzaj widoku" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">'
  '<span role="radio" aria-checked="true" title="Lista" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:8px;background:var(--bg-surface);font-size:12px;font-weight:500">'+ic(LIST,14)+'Lista</span>'
  '<span role="radio" aria-checked="false" title="Mapa obiektów  ⇧M" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:8px;font-size:12px;color:var(--text-secondary)">'+ic(MAPI,14)+'Mapa</span></span>'+
  ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowy obiekt','Nowy obiekt  C',PLUS)+'</div>')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'
  '<div style="display:flex;align-items:center;gap:8px;height:28px;width:240px;padding:0 10px;border-radius:14px;background:var(--bg-subtle);color:var(--text-tertiary)">'+ic('<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',14)+'<span style="flex:1 1 auto;font-size:12px">Nazwa, adres, klient</span><span class="mono" style="font-size:11px">/</span></div>'+
  capd('Rodzaj: wszystkie','Hotel, handel, biuro, gastronomia, medyczny, dom')+capd(ic(PIN,14,'var(--text-tertiary)')+'Trójmiasto i okolice','Rejon')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)"><span>312 urządzeń</span><span title="Suma ekwiwalentu CO₂ czynników we wszystkich obiektach">1 284 t CO₂e</span>'
  '<span title="UR-3107 Delikatesy Morskie (12 lis), UR-2304 Hotel Oliwski (15 lis), UR-1988 Kancelaria Wit (17 lis)" style="display:inline-flex;align-items:center;gap:4px;color:var(--danger)">'+ic(SHIELD,12,'var(--danger)')+'3 kontrole po terminie</span></span></div>')
a('<div role="table" aria-label="Obiekty" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Obiekt · adres</span><span>Klient</span><span>Rodzaj</span><span style="text-align:right">Urządzenia</span><span>Kontrola F-gaz</span><span>Umowa</span><span style="text-align:right">Otwarte</span><span style="text-align:right">Ostatnia wizyta</span></div>')
a(row('Hotel Oliwski · kuchnia i restauracja','Opacka 12, Gdańsk Oliwa','Hotel Oliwski','hotel','5 · 50,3 t','Agregat Bitzer R404A 49,0 t + 2 split R32',fg('15 lis · 5 dni po','late','UR-2304 · co 12 mies.'),dash,'0','13 lis · PD','Piątek 13 lis · ZG-0912 · Piotr',sel=True))
a(row('Galeria Bałtycka · maszynownia','Grunwaldzka 141, Gdańsk','Galeria Bałtycka','handel','14 · 50,1 t','VRV: 1 jednostka zewnętrzna + 13 wewnętrznych, R410A 24 kg',fg('16 maj 2027','ok','Co 6 mies. · ostatnia 16 lis'),obj('UM-2026-031','Reakcja 4 h, 2 przeglądy w roku'),'0','16 lis · TL','Poniedziałek 16 lis · przegląd półroczny'))
a(row('Delikatesy Morskie','Starowiejska 12, Gdynia','Delikatesy Morskie','handel','3 · 38,6 t','Lodziarka UR-3107 R404A 21,2 t + 2 witryny',fg('12 lis · 8 dni po','late','UR-3107 · co 12 mies.'),dash,'1','12 lis · KN','ZS-1047 · otwarty lead: wymiana lodziarki'))
a(row('Kancelaria Wit','Arkońska 6, Gdańsk','Kancelaria Wit','biuro','4 · 6,7 t','Serwerownia UR-1988 R410A 3,2 kg + 3 split',fg('17 lis · 3 dni po','late','UR-1988 · co 12 mies.'),dash,'1','17 lis · MZ','ZG-0907 · ZG-0905 czeka na montaż wentylatora'))
a(row('Piekarnia Rogal','Chylońska 70, Gdynia','Piekarnia Rogal','gastronomia','2 · 17,1 t','Komora mroźnicza UR-2871 R452A 8 kg',fg('9 gru · za 19 dni','soon','Co 12 mies. · połączyć z przeglądem witryn'),dash,'1','14 lis · KN','ZG-0924 · oszroniony parownik'))
a(row('Przychodnia Zdrowie','Morska 105, Gdynia','Przychodnia Zdrowie','medyczny','4 · 3,1 t','Centrala UR-2650 + 3 split — poniżej 5 t, bez obowiązku kontroli',fg('nie dotyczy','na','Poniżej 5 t CO₂e'),obj('UM-2025-022','Reakcja 4 h całodobowo'),'0','13 lis · PD','ZG-0920 · alarm zamrożenia wymiennika'))
a(row('Biuro Rachunkowe Bilans','Świętojańska 9, Gdynia','Biuro Rachunkowe Bilans','biuro','3 · 2,4 t','3 split R32',fg('nie dotyczy','na','Poniżej 5 t CO₂e'),dash,'1','4 wrz · MZ','ZG-0923 · wizyta wt 24 lis'))
a(row('Dom · Dębogórska 31','Dębogórska 31, Rumia','Marek Zieliński','dom',sch('montaż 30 lis','ZS-1052 · pompa ciepła UR-4127'),'Urządzenia pojawią się po montażu',fg('nie dotyczy','na','Pompa R32 1,5 kg = 1,01 t'),dash,'0','—','Pierwsza wizyta: montaż 30 lis'))
a('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-secondary)"><span>8 z 84 · posortowane: kontrola F-gaz, najpilniejsze najpierw</span></div>')
a('</div></sc-if>')

# =================== REKORD: Hotel Oliwski
K=[];k=K.append
k('<sc-if value="{{isObR}}" hint-placeholder-val="{{false}}">')
k('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(PIN,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Obiekty</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">OB-0230</h1>'+SP+
  ib('Nawiguj','Otwórz nawigację do obiektu',ROUTE)+ib('Kopiuj link','Kopiuj link',LINK)+ib('Więcej akcji','Edytuj, scal, archiwizuj',DOTS)+'</div>')
k('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
k('<div style="display:flex;flex-direction:column;gap:12px;padding:12px 24px 12px"><div style="display:flex;align-items:flex-start;gap:12px"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">'
  '<h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Hotel Oliwski · kuchnia i restauracja</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(PIN,'Opacka 12, 80-338 Gdańsk Oliwa','Współrzędne z geokodowania OSM')+meta(BLD,'Hotel Oliwski · KL-0217','Klient · firma')+meta(USER,'Opiekun: Piotr','Technik prowadzący obiekt')+'</div></div>'+
  btn('Nowe zgłoszenie','Nowe zgłoszenie dla obiektu  C',PLUS)+btn('Zaplanuj kontrolę szczelności','UR-2304 · po terminie od 15 lis — wizyta z kontrolą i protokołem  ⌘↵',SHIELD,pri=True)+'</div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd(ic(SHIELD,14,'var(--danger)')+'Kontrola F-gaz po terminie · 5 dni','UR-2304 · termin był w niedzielę 15 lis 2026')+capd('5 urządzeń · 50,3 t CO₂e','2 instalacje')+capd(ic(COIN,14,'var(--warning)')+'Należność 9 860 zł · 31 dni','FV/2026/10/061 · termin płatności 20 paź')+capd('Bez umowy serwisowej','Rozliczenie za każdą wizytę')+'</div></div>')
k('<div style="display:flex;align-items:center;gap:4px;padding:0 24px 12px">'+tabs([('Przegląd',''),('Urządzenia','5'),('Historia serwisu','23'),('Dokumenty','14'),('Zdjęcia','38')])+'</div>')
DC='minmax(0,1.6fr) 120px 96px 132px 100px'
def dev(code,name,sub,ref,co2,ctrl,warr,sel=False):
    return (f'<div role="row" class="row" style="display:grid;grid-template-columns:{DC};column-gap:12px;align-items:center;min-height:44px;padding:4px 10px;border-radius:10px">'
            f'<span style="display:flex;flex-direction:column;min-width:0"><span style="display:flex;align-items:center;gap:8px;min-width:0"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">{code}</span><span class="ell" style="font-weight:500">{name}</span></span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{sub}</span></span>'
            f'<span style="font-size:12px;color:var(--text-secondary)">{ref}</span><span class="num" style="text-align:right;font-size:12px;color:var(--text-secondary)">{co2}</span><span>{ctrl}</span><span class="num" style="text-align:right;font-size:12px;color:var(--text-secondary)">{warr}</span></div>')
def inst(icon,col,name,meta_,rows):
    return (f'<div style="display:flex;flex-direction:column;gap:2px"><div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;border-radius:10px;background:var(--bg-raised)">{ic(icon,14,col)}<span style="font-weight:500">{name}</span><span style="font-size:12px;color:var(--text-secondary)">{meta_}</span>{SP}{ib("Dodaj urządzenie","Dodaj urządzenie do instalacji",PLUS,24)}</div>'
            +''.join(rows)+'</div>')
k('<div style="display:flex;flex-direction:column;gap:20px;padding:0 16px 24px">')
k('<section style="display:flex;flex-direction:column;gap:6px">'+'<div style="padding:0 8px">'+h3('Instalacje i urządzenia')+'</div>'+
  f'<div role="row" style="display:grid;grid-template-columns:{DC};column-gap:12px;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Urządzenie</span><span>Czynnik · ładunek</span><span style="text-align:right">CO₂e</span><span>Kontrola szczelności</span><span style="text-align:right">Gwarancja</span></div>'+
  inst(SNOW,'#3B82D6','Chłodnictwo kuchni','montaż 2014 · zaplecze, maszynownia w piwnicy',[
    dev('UR-2304','Agregat skraplający Bitzer','Maszynownia · sn 1408 22 517 · karta w CRO','R404A · 12,5 kg','49,0 t',fg('15 lis · po terminie','late','Co 12 mies. · ostatnia 15 lis 2025 — szczelna'),'po gwarancji'),
    dev('UR-2305','Parownik · komora mięsna','Obieg UR-2304 · 0 do +2 °C','obieg agregatu','—',fg('z agregatem','na','Ładunek liczony na agregacie'),'po gwarancji'),
    dev('UR-2306','Parownik · komora warzywna','Obieg UR-2304 · +4 do +6 °C','obieg agregatu','—',fg('z agregatem','na','Ładunek liczony na agregacie'),'po gwarancji')])+
  inst(WIND,'#2BB3B1','Klimatyzacja restauracji','montaż 2021 · sala 120 m²',[
    dev('UR-2310','Daikin split 3,5 kW · sala, okno','Jednostka zewnętrzna na dachu','R32 · 0,95 kg','0,64 t',fg('nie dotyczy','na','Poniżej 5 t CO₂e'),'wygasła 3 cze'),
    dev('UR-2311','Daikin split 3,5 kW · sala, bar','Jednostka zewnętrzna na dachu','R32 · 0,95 kg','0,64 t',fg('nie dotyczy','na','Poniżej 5 t CO₂e'),'wygasła 3 cze')])+'</section>')
def ev(dt,icon,title,body,who,chips=''):
    return (f'<li style="display:grid;grid-template-columns:72px 28px minmax(0,1fr);column-gap:10px;padding:6px 10px">'
            f'<span class="num" style="font-size:12px;line-height:20px;color:var(--text-tertiary)">{dt}</span><span style="width:24px;height:24px;border-radius:50%;background:var(--bg-raised);display:inline-flex;align-items:center;justify-content:center">{ic(icon,12,"var(--text-secondary)")}</span>'
            f'<div style="display:flex;flex-direction:column;gap:4px;min-width:0"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:500">{title}</span>{who}</div><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">{body}</span>'+(f'<div style="display:flex;flex-wrap:wrap;gap:4px">{chips}</div>' if chips else '')+'</div></li>')
sm=lambda i,c: f'<span style="display:inline-flex">{cav(i,c,18,8)}</span>'
k('<section style="display:flex;flex-direction:column;gap:2px"><div style="display:flex;align-items:center;gap:8px;padding:0 8px">'+h3('Ostatnie wizyty')+SP+'<a href="#" class="flink" style="font-size:12px;color:var(--text-secondary)">Cała historia · 23</a></div><ol style="margin:0;padding:0;list-style:none">'+
  ev('13 lis',WRENCH,'Agregat często się załącza','Wymieniono presostat HP, dolano 1,2 kg R404A regenerowanego. Kontrolę szczelności przełożono — dostawa towaru o 11:00.',sm('PD',PD),obj('ZG-0912','Zgłoszenie · zamknięte 13 lis')+obj('RW/2026/11/044','Wydanie czynnika · regenerowany, certyfikat')+sch(ic(CAM,12,'var(--text-tertiary)')+'6','Zdjęcia wewnętrzne'))+
  ev('2 cze',CYC,'Przegląd klimatyzacji restauracji','Czyszczenie, odgrzybianie, kontrola ciśnień. Bez uwag.',sm('MZ',MZC),obj('PR/2026/06/017','Protokół przeglądu'))+
  ev('15 lis 2025',SHIELD,'Kontrola szczelności · szczelna','Metoda bezpośrednia, detektor elektroniczny. Wpis do karty w CRO.',sm('PD',PD),obj('KS/2025/11/009','Protokół kontroli szczelności'))+'</ol></section>')
k('</div></div>')
# aside
k('<aside aria-label="Obiekt OB-0230 — szczegóły" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Dostęp',ib('Edytuj','Edytuj dostęp',FILE,24))+
  prop(TRUCK,'Wjazd od ul. Opackiej','Rampa dostaw — nie blokować 10:30–11:30')+
  prop(KEY,'Klucz do maszynowni w recepcji','Recepcja całodobowa · wpis do książki kluczy')+
  prop(CLOCK,'Kuchnia pracuje 6:00–23:00','Prace przy komorach najlepiej 14:00–17:00')+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Na miejscu',CNT(2))+
  prop(USER,'Ewa Malinowska · szefowa kuchni','+48 512 408 113 · zgłasza awarie',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+
  prop(USER,'Paweł Grabowski · kierownik techniczny','+48 601 772 905 · akceptuje koszty i protokoły',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+'</section>')
k('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Propozycje Avero',CNT(2))+
  '<div style="display:flex;flex-direction:column;gap:10px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;gap:10px">'+ic(SHIELD,16,'var(--warning)')+'<div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">Modernizacja przed 2030</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">UR-2304 ma R404A — serwis tylko czynnikiem regenerowanym, do końca 2029 r. Agregat ma 12 lat i 3 awarie w tym roku.</span></div></div>'+
  btn('Utwórz lead: wymiana agregatu','Lead „Wymiana agregatu na czynnik o niskim GWP” · szacunek ~60 tys. zł · opiekun Pascal',TARGET).replace('justify-content:center;','justify-content:center;width:100%;')+
  '<div style="height:1px;background:var(--edge)"></div>'
  '<div style="display:flex;gap:10px">'+ic(FILE,16,'var(--text-secondary)')+'<div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">Umowa serwisowa</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">6 wizyt w 2026 r., kontrola F-gaz po terminie. Umowa z 2 przeglądami, kontrolą szczelności i reakcją 8 h: ok. 5 400 zł netto rocznie, terminy pilnuje Avero.</span></div></div>'+
  btn('Przygotuj ofertę umowy','Szablon umowy: przegląd 2× w roku, kontrola szczelności, reakcja 8 h').replace('justify-content:center;','justify-content:center;width:100%;')+'</div></section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Finanse')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('Obrót w 2026','7 420 zł',tip='6 wizyt · netto')+kv('Należność po terminie','9 860 zł',vc='var(--warning)',w=500,tip='FV/2026/10/061 i FV/2026/11/012 · najstarsza 31 dni')+kv('Płatność','przelew 14 dni',vc='var(--text-secondary)')+'</div></section>')
k('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isObj = ekran === 'obiekty'; const isObR = ekran === 'obiekt'; const nObj = navv(isObj || isObR);")
rep("isFV, actFV:","isObj, isObR, actObj: nObj.act, colObj: nObj.col, wObj: nObj.w, isFV, actFV:")
rep('"tabela nowa", "planowanie"]','"tabela nowa", "obiekty", "obiekt", "planowanie"]')
i=s.find('font-weight:400">Obiekty</span>'); a0=s.rfind('<a href="#" class="nav"',0,i); assert '</a>' not in s[a0:i]
e=s.find('</a>',i); seg=s[a0:e]
seg=seg.replace('class="nav"','class="nav {{actObj}}"',1).replace('color:var(--text-secondary)">','color:{{colObj}}">',1).replace('font-weight:400">Obiekty','font-weight:{{wObj}}">Obiekty')
assert '{{colObj}}' in seg; s=s[:a0]+seg+s[e:]
open(P,'w').write(s); print('ok obiekty',len(s))
