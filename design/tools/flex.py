# Warstwa elastyczna: własna tabela „Przetargi” (lista + konfigurowalny panel), ustawienia tabeli: pola i edytor panelu bocznego.
# Scenariusz: piątek 20 lis 2026, 18:00. Tabelę utworzył Pascal (administrator).
P='design/canvas/Main.dc.html'
exec(open('design/tools/ui1.py').read())
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; PKC='#5F636B'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
GAVEL='<path d="m14 13-8.38 8.38a1 1 0 0 1-3-3L11 10"></path><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"></path>'
TABLEI='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18"></path>'
GEAR='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>'
BOARD='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18M15 3v18"></path>'
LIST='<path d="M3 12h18M3 6h18M3 18h18"></path>'
GRIP='<circle cx="9" cy="6" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="18" r="1"></circle>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'
EYEOFF='<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"></path><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>'
TXT='<path d="M4 7V4h16v3M9 20h6M12 4v16"></path>'
HASH='<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"></path>'
COIN='<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"></path>'
SEL='<circle cx="12" cy="12" r="10"></circle><path d="m8 11 4 4 4-4"></path>'
MSEL='<path d="M3 12h.01M3 18h.01M3 6h.01M8 6h13M8 12h13M8 18h13"></path>'
REL='<path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8"></path>'
FX='<path d="M10 4H8a2 2 0 0 0-2 2v12M4 11h6M14 10l6 8M20 10l-6 8"></path>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
TARGET='<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>'
FOLDER='<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>'
SHIELD='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def btn(t,tip,icon='',pri=False,h=28,grow=False):
    g='flex:1 1 auto;' if grow else ''
    if pri: return f'<button type="button" class="pri" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'
def tabs(items,cur=0):
    return ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))
# statusy przetargu — pole „Wybór (etapy)” zdefiniowane przez użytkownika; kolory z palety serii (tokens.css: --series-1, -4, -2)
STC={'Nowy':'var(--text-tertiary)','Analiza':'#2a78d6','Przygotowanie oferty':'#eda100','Złożona':'#eb6834','Wygrany':'var(--success)','Przegrany':'var(--danger)','Odpuszczony':'var(--text-tertiary)'}
def st(t): return f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:{STC[t]};flex:0 0 auto"></span>{t}</span>'
BR={'Klimatyzacja':'#2BB3B1','Pompy ciepła':'#E0702A','Chłodnictwo':'#3B82D6','Wentylacja':'#C98A12'}
def br(*xs): return ''.join(sch(f'<span aria-hidden="true" style="width:6px;height:6px;border-radius:50%;background:{BR[x]}"></span>{x}',x) for x in xs)
nobody='<span title="Bez opiekuna" style="width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong);display:inline-block"></span>'
own=sch(ic(TABLEI,12,'var(--text-tertiary)')+'własna tabela','Utworzona przez Pascala 20 lis · 16 pól · widoczna dla administratora i biura')

# =================== PRZETARGI — lista
COLS='52px minmax(0,1.8fr) 20px minmax(0,1fr) 104px 120px 156px 24px'
def row(no,name,org,brs,val,valtip,term,termtip,stat,who,sel=False,termcol='var(--text-secondary)'):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" class="mono" style="font-size:12px;color:var(--text-tertiary)">{no}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0">{u_ci("gavel","violet")}<span class="ell" style="font-weight:500">{name}</span></span>'
            f'<span role="cell" style="display:flex">{u_logo(org)}</span>'
            f'<span role="cell" style="display:flex;flex-wrap:nowrap;gap:4px;min-width:0;overflow:hidden">{brs}</span>'
            f'<span role="cell" class="num" title="{valtip}" style="text-align:right">{val}</span>'
            f'<span role="cell" class="num" title="{termtip}" style="text-align:right;font-size:12px;color:{termcol};white-space:nowrap">{term}</span>'
            f'<span role="cell" style="font-size:12px">{st(stat)}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{who}</span></div>')
H=[];a=H.append
a('<sc-if value="{{isPtg}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(GAVEL,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Przetargi</h1>'+own+'<span style="width:8px"></span>'+
  tabs([('W toku','4'),('Do złożenia w 14 dni','2'),('Wszystkie 2026','15')])+'<a href="#" class="sec" title="Zapisz obecne filtry jako widok" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:14px;color:var(--text-tertiary)">'+ic(PLUS,14)+'Widok</a>'+SP+
  '<span role="radiogroup" aria-label="Rodzaj widoku" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">'
  '<span role="radio" aria-checked="true" title="Tabela" style="height:24px;display:inline-flex;align-items:center;padding:0 6px;border-radius:8px;background:var(--bg-surface)">'+ic(LIST,14)+'</span>'
  '<span role="radio" aria-checked="false" title="Kanban wg statusu" style="height:24px;display:inline-flex;align-items:center;padding:0 6px;border-radius:8px;color:var(--text-secondary)">'+ic(BOARD,14)+'</span>'
  '<span role="radio" aria-checked="false" title="Kalendarz terminów składania" style="height:24px;display:inline-flex;align-items:center;padding:0 6px;border-radius:8px;color:var(--text-secondary)">'+ic(CAL,14)+'</span></span>'+
  ib('Ustawienia tabeli','Pola, widoki, panel boczny, akcje, uprawnienia',GEAR)+'<span style="width:4px"></span>'+btn('Nowy przetarg','Nowy przetarg  C',PLUS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'+capd('Status: w toku','Nowy, Analiza, Przygotowanie oferty, Złożona')+capd('Region: pomorskie','Pole „Region”')+
  '<button type="button" class="capd" title="Filtr po dowolnym polu tabeli  F" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border:0;border-radius:14px;color:var(--text-secondary)">'+ic(PLUS,14)+'Filtr</button>'+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Suma pola „Wartość szacunkowa” w tym widoku">Wartość <span class="num" style="color:var(--text-primary);font-weight:500">1 304 000 zł</span></span>'
  '<span title="Wygrane / złożone oferty w 2026 r. — z pola Status">Skuteczność 2026 <span class="num" style="color:var(--text-primary);font-weight:500">3 z 8</span></span></span></div>')
a('<div role="table" aria-label="Przetargi" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('Nr','hash')+u_th('Zamówienie','gavel','violet')+u_th('','bld','indigo',tip='Zamawiający')+u_th('Branża','tag','pink')+u_th('Wartość szac.','coin','yellow','right')+u_th('Składanie ofert','cal','blue','right')+u_th('Status','flag','green')+'<span></span></div>')
a(row('PR-013','Serwis urządzeń chłodniczych i klimatyzacji 2027–2028','Centrum Medyczne Kaszuby · Wejherowo',br('Chłodnictwo','Klimatyzacja'),'186 000','Netto, z ogłoszenia','pt 27 lis · 7 dni','Piątek 27 listopada 2026, 9:00 · pole „Dni do terminu” (formuła)','Przygotowanie oferty',cav('TL',TL),sel=True,termcol='var(--warning)'))
a(row('PR-014','Klimatyzacja sal w budynku urzędu','Gmina Miejska Rumia',br('Klimatyzacja'),'420 000','Netto, z ogłoszenia','pt 4 gru · 14 dni','Piątek 4 grudnia 2026, 10:00','Analiza',cav('PK',PKC)))
a(row('PR-015','Pompy ciepła w 3 świetlicach wiejskich','Gmina Kosakowo',br('Pompy ciepła'),'640 000','Netto, z ogłoszenia','pt 11 gru · 21 dni','Piątek 11 grudnia 2026, 10:00','Nowy',nobody))
a(row('PR-011','Klimatyzacja serwerowni','Wodociągi Rumia sp. z o.o.',br('Klimatyzacja'),'58 000','Nasza oferta: 54 300 zł netto','złożona 13 lis','Wynik do środy 25 lis','Złożona',cav('PK',PKC)))
a('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">Zakończone w tym miesiącu</div>')
a(row('PR-010','Przeglądy klimatyzacji 2027','Spółdzielnia Mieszkaniowa Chylonia',br('Klimatyzacja'),'36 000','Nasza oferta: 33 800 zł · umowa UM-2026-034','wygrany 6 lis','Wybór oferty: piątek 6 lis','Wygrany',cav('PK',PKC)))
a(row('PR-012','Wentylacja mechaniczna w szkole podstawowej','Zakład Gospodarki Mieszkaniowej Reda',br('Wentylacja'),'1 250 000','Netto, z ogłoszenia','—','Odpuszczony 9 lis: brak referencji powyżej 1 mln zł','Odpuszczony',cav('PK',PKC)))
a('</div></div>')
# panel boczny — złożony z sekcji ustawionych w „Panel boczny”
def sec(title,body,hid=False): return f'<section style="display:flex;flex-direction:column;gap:2px">{ah3(title)}{body}</section>'
def _kv(r):
    k_,v_=r[0],r[1]; w_=r[2] if len(r)>2 and r[2] else 400; vc_=r[3] if len(r)>3 and r[3] else 'var(--text-primary)'; tip_=r[4] if len(r)>4 else ''
    return kv(k_,v_,vc=vc_,w=w_,tip=tip_)
def kvs(rows): return '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+''.join(_kv(r) if isinstance(r,tuple) else r for r in rows)+'</div>'
a('<aside aria-label="Przetarg PR-013" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><div style="display:flex;align-items:center;gap:8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">PR-013</span>'+SP+
  ib('Dostosuj panel','Dostosuj panel — sekcje, kolejność, warunki',GEAR,24)+ib('Otwórz','Otwórz  ↵','<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',24)+'</div>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Serwis urządzeń chłodniczych i klimatyzacji 2027–2028</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px">'+capd(st('Przygotowanie oferty'),'Pole Status · zmień  S')+capd(cav('TL',TL)+'Tomasz','Opiekun','0 10px 0 4px')+'</div></div>')
a(sec('Termin i wadium',kvs([('Składanie ofert','pt 27 lis, 9:00',500,'var(--warning)','Za 7 dni · Piątek 27 listopada 2026'),('Wadium','3 000 zł',None,None,'Wniesione 19 lis — gwarancja ubezpieczeniowa'),('Ogłoszenie','2026/BZP 00611274',None,'var(--text-secondary)','e-Zamówienia · otwórz link'),('Okres umowy','24 mies. od 1 sty 2027',None,'var(--text-secondary)','')])))
a(sec('Zamawiający',prop(BLD,'Centrum Medyczne Kaszuby','Wejherowo · rekord w Firmach · bez dotychczasowej współpracy',sch('nowy klient','Pole powiązane z obiektem rdzenia: Firmy'))+prop(USER,'Ewelina Szulc · dział techniczny','Osoba do kontaktu z ogłoszenia')))
a(sec('Nasza oferta',kvs([('Nasza cena','171 600 zł netto',500,None,'Pole „Nasza cena” · szkic'),('Kryteria','cena 60 % · reakcja 40 %',None,'var(--text-secondary)','Pole „Kryteria oceny”'),('Czas reakcji','4 h',None,'var(--text-secondary)','Pole „Deklarowany czas reakcji”')])))
a(sec('Dokumenty',kvs(['<div style="display:flex;flex-wrap:wrap;gap:4px">'+sch(ic(FILE,12,'var(--text-tertiary)')+'SWZ.pdf','Specyfikacja warunków zamówienia · 2,4 MB')+sch(ic(FILE,12,'var(--text-tertiary)')+'wykaz urządzeń.xlsx','86 urządzeń · 1,1 MB')+sch(ic(FILE,12,'var(--text-tertiary)')+'gwarancja wadialna.pdf','19 lis')+'</div>'])))
a('<div style="display:flex;flex-direction:column;gap:6px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;gap:10px">'+ic(TARGET,16,'var(--text-secondary)')+'<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Przetarg nie ma jeszcze szansy w lejku. Akcja tabeli przeniesie nazwę, zamawiającego, naszą cenę i termin.</span></div>'+
  btn('Utwórz szansę z przetargu','Akcja tabeli: tworzy szansę SZ-0193 w etapie „Oferta” i łączy ją z PR-013  ⌘↵',pri=True,h=32)+'</div>')
a('</aside></div></sc-if>')

# =================== USTAWIENIA TABELI — wspólny nagłówek
def thead(cur):
    t=[('Pola','16'),('Widoki','3'),('Panel boczny','6'),('Akcje','3'),('Uprawnienia','')]
    return ('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(GAVEL,16,'var(--text-secondary)')+
            '<a href="#" class="flink" style="color:var(--text-secondary)">Przetargi</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Ustawienia tabeli</h1><span style="width:8px"></span>'+tabs(t,cur)+SP+
            '<span style="font-size:12px;color:var(--text-tertiary)">Zmiany widzą wszyscy z dostępem do tabeli</span></div>')
TYPES=[(TXT,'Tekst'),(HASH,'Liczba'),(COIN,'Kwota'),(CAL,'Data i godzina'),(SEL,'Wybór'),(MSEL,'Wielokrotny wybór'),(USER,'Osoba'),(REL,'Powiązanie'),(LINK,'Link'),(FOLDER,'Pliki'),(FX,'Formuła')]
# =================== POLA
F=[];f=F.append
f('<sc-if value="{{isTbP}}" hint-placeholder-val="{{false}}">')
f(thead(0))
f('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;padding:4px 16px 24px">')
FC='16px 20px minmax(0,1fr) 168px 160px 24px'
def frow(icon,name,typ,flags='',sel=False,sys=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{FC};column-gap:10px;align-items:center;min-height:36px;padding:0 10px;border-radius:10px;{bg}">'
            f'<span title="Przeciągnij, aby zmienić kolejność" style="display:inline-flex">{ic(GRIP,14,"var(--text-tertiary)")}</span>{ic(icon,14,"var(--text-secondary)")}'
            f'<span class="ell" style="font-weight:{500 if sel else 400}">{name}</span><span style="font-size:12px;color:var(--text-secondary)">{typ}</span>'
            f'<span style="display:flex;gap:4px">{flags}</span><span style="display:flex;justify-content:flex-end">{ic(LOCK,12,"var(--text-tertiary)") if sys else ""}</span></div>')
req=sch('wymagane','Musi być wypełnione przy tworzeniu'); uni=sch('unikalne','Nie może się powtórzyć w tabeli')
f('<div style="display:flex;align-items:center;gap:8px;padding:0 10px 8px"><span style="font-size:12px;color:var(--text-secondary)">16 pól · kolejność = kolejność w formularzu</span>'+SP+btn('Dodaj pole','Dodaj pole  N',PLUS)+'</div>')
for r in [
  (TXT,'Nazwa zamówienia','Tekst',req),(HASH,'Numer','Numer automatyczny · PR-',uni,False,True),(REL,'Zamawiający','Powiązanie → Firmy',req),(TXT,'Numer ogłoszenia','Tekst',uni),(LINK,'Link do ogłoszenia','Link'),
  (SEL,'Status','Wybór · etapy',req,True),(USER,'Opiekun','Osoba'),(MSEL,'Branża','Wielokrotny wybór'),(SEL,'Region','Wybór'),(COIN,'Wartość szacunkowa','Kwota · PLN netto'),
  (CAL,'Termin składania ofert','Data i godzina',req),(FX,'Dni do terminu','Formuła · liczba'),(COIN,'Wadium','Kwota · PLN'),(TXT,'Kryteria oceny','Tekst długi'),(COIN,'Nasza cena','Kwota · PLN netto'),(FOLDER,'Dokumenty','Pliki')]:
    f(frow(r[0],r[1],r[2],r[3] if len(r)>3 else '',r[4] if len(r)>4 else False,r[5] if len(r)>5 else False))
f('</div>')
# edytor pola Status
def opt(name,col,closed=False):
    return (f'<div style="display:flex;align-items:center;gap:8px;min-height:32px;padding:0 8px;border-radius:8px">{ic(GRIP,14,"var(--text-tertiary)")}'
            f'<span title="Kolor z palety" style="width:12px;height:12px;border-radius:50%;background:{col};flex:0 0 auto"></span><span style="flex:1 1 auto">{name}</span>'
            +(sch('zamyka','Etap końcowy — rekord znika z widoku „W toku”, liczony do skuteczności') if closed else '')+'</div>')
f('<aside aria-label="Pole Status" style="flex:0 0 380px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 16px 24px">')
f('<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-tertiary)">Pole</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Status</h2></div>')
f('<section style="display:flex;flex-direction:column;gap:8px">'+
  '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-secondary)">Nazwa</span><span style="height:32px;display:flex;align-items:center;padding:0 10px;border-radius:8px;background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong)">Status</span></label>'
  '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-secondary)">Typ</span><span title="Typu nie zmienisz po zapisaniu danych — utwórz nowe pole" style="height:32px;display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:8px;background:var(--bg-subtle);color:var(--text-secondary)">'+ic(SEL,14)+'Wybór · etapy'+SP+ic(LOCK,12,'var(--text-tertiary)')+'</span></label></section>')
f('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Opcje',CNT(7))+''.join(opt(n,STC[n],n in ('Wygrany','Przegrany','Odpuszczony')) for n in STC)+
  '<button type="button" class="ghost" style="height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-tertiary);font-size:12px">'+ic(PLUS,14)+'Dodaj opcję</button></section>')
f('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Zachowanie')+
  ''.join(f'<div style="display:flex;align-items:center;gap:10px;min-height:32px;padding:0 8px"><span style="flex:1 1 auto">{t}</span><span style="font-size:12px;color:var(--text-secondary)">{v}</span></div>' for t,v in [('Wymagane','tak'),('Domyślna','Nowy'),('Kanban grupuje po tym polu','tak'),('Przy zmianie na „Odpuszczony”','pytaj o powód')])+'</section>')
f('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Dodaj pole')+'<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 4px">'+''.join(sch(ic(i,12,'var(--text-tertiary)')+t,'Typ pola: '+t) for i,t in TYPES)+'</div>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary);padding:0 4px">Powiązanie łączy z obiektami rdzenia (Firmy, Osoby, Obiekty, Szanse, Zlecenia) albo z inną własną tabelą.</span></section>')
f('</aside></div></sc-if>')

# =================== PANEL BOCZNY — edytor
G=[];g=G.append
g('<sc-if value="{{isTbS}}" hint-placeholder-val="{{false}}">')
g(thead(2))
g('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px;padding:4px 20px 24px">')
g('<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text-secondary)">Układ dla</span>'+capd('Wszyscy','Domyślny układ · możesz dodać osobny dla zespołu (np. Technicy)')+capd(ic(PLUS,14,'var(--text-tertiary)')+'Układ dla zespołu','Np. technicy widzą tylko termin i dokumenty')+SP+
  '<span style="font-size:12px;color:var(--text-tertiary)">Podgląd na rekordzie</span>'+capd('<span class="mono" style="font-size:11px">PR-013</span>','Zmień rekord podglądu')+'</div>')
def card(title,kind,fields,cond,hid=False,sys=False,sel=False):
    bg='var(--bg-subtle)' if sel else 'var(--bg-raised)'
    return (f'<div style="display:flex;gap:10px;padding:10px 12px;border-radius:12px;background:{bg};{"opacity:.6;" if hid else ""}">'
            f'<span title="Przeciągnij" style="display:inline-flex;padding-top:2px">{ic(GRIP,14,"var(--text-tertiary)")}</span>'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:500">{title}</span><span style="font-size:12px;color:var(--text-tertiary)">{kind}</span>{SP}'
            +(ic(LOCK,12,'var(--text-tertiary)') if sys else ib('Ukryj sekcję','Ukryj sekcję',EYEOFF if hid else EYE,24))+ib('Więcej','Zmień nazwę, usuń',DOTS,24)+'</div>'
            f'<div style="display:flex;flex-wrap:wrap;gap:4px">{fields}</div>'
            f'<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">{ic(EYE,12,"var(--text-tertiary)")}{cond}</div></div></div>')
fl=lambda *xs: ''.join(sch(x,'Pole') for x in xs)
g('<div style="display:flex;flex-direction:column;gap:6px;max-width:640px">')
g(card('Nagłówek','system',fl('Nazwa zamówienia','Status','Opiekun'),'Zawsze',sys=True))
g(card('Termin i wadium','pola',fl('Termin składania ofert','Dni do terminu','Wadium','Numer ogłoszenia','Link do ogłoszenia')+'<span style="font-size:12px;color:var(--text-tertiary);align-self:center">+ pole</span>','Zawsze'))
g(card('Zamawiający','karta powiązanego rekordu',fl('Firmy: nazwa','miasto','współpraca','osoba kontaktowa'),'Gdy pole Zamawiający jest wypełnione'))
g(card('Nasza oferta','pola',fl('Nasza cena','Kryteria oceny','Deklarowany czas reakcji'),'<span>Gdy <span style="color:var(--text-primary)">Status</span> jest jednym z: Przygotowanie oferty, Złożona, Wygrany, Przegrany</span>',sel=True))
g(card('Dokumenty','pliki',fl('Dokumenty'),'Zawsze'))
g(card('Akcja: Utwórz szansę','przycisk',fl('→ Szanse','nazwa','zamawiający → klient','nasza cena → wartość','termin → decyzja'),'Gdy Status = Przygotowanie oferty i przetarg nie ma szansy'))
g(card('Historia zmian','system',fl('kto, co, kiedy'),'Zawsze · zwinięta',sys=True))
g('<button type="button" class="ghost" style="height:32px;display:flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:var(--text-tertiary)">'+ic(PLUS,14)+'Dodaj sekcję: pola, karta powiązania, lista powiązanych, przycisk akcji, podsumowanie</button></div>')
g('<div style="display:flex;gap:6px;padding-top:8px;max-width:640px">'+btn('Przywróć domyślny','Układ wygenerowany z pól tabeli')+SP+btn('Zapisz układ','Zapisz układ panelu dla „Wszyscy”  ⌘S',CHECK,pri=True)+'</div>')
g('</div>')
# podgląd na żywo (360) — ten sam panel co na liście
g('<aside aria-label="Podgląd panelu" style="flex:0 0 392px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:10px;padding:14px 16px 24px;background:var(--bg-app)">')
g('<span style="font-size:12px;color:var(--text-tertiary)">Podgląd · tak zobaczy to biuro</span>')
g('<div style="display:flex;flex-direction:column;gap:16px;padding:14px 12px;border-radius:12px;background:var(--bg-surface);box-shadow:var(--shadow-pop)">'
  '<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">PR-013</span><span style="font-weight:600;line-height:20px">Serwis urządzeń chłodniczych i klimatyzacji 2027–2028</span><div style="display:flex;gap:4px">'+capd(st('Przygotowanie oferty'),'')+capd(cav('TL',TL)+'Tomasz','','0 10px 0 4px')+'</div></div>'+
  sec('Termin i wadium',kvs([('Składanie ofert','pt 27 lis, 9:00',500,'var(--warning)',''),('Wadium','3 000 zł'),('Ogłoszenie','2026/BZP 00611274',None,'var(--text-secondary)','')]))+
  sec('Zamawiający',prop(BLD,'Centrum Medyczne Kaszuby','Wejherowo · bez współpracy'))+
  '<div style="display:flex;flex-direction:column;gap:2px;border-radius:10px;box-shadow:0 0 0 2px var(--accent);padding:4px 0">'+sec('Nasza oferta',kvs([('Nasza cena','171 600 zł netto',500),('Kryteria','cena 60 % · reakcja 40 %',None,'var(--text-secondary)','')]))+'</div>'+
  sec('Dokumenty',kvs(['<div style="display:flex;gap:4px">'+sch(ic(FILE,12,'var(--text-tertiary)')+'SWZ.pdf','')+sch('+2','')+'</div>']))+
  '<div style="padding:0 4px">'+btn('Utwórz szansę z przetargu','',pri=True,h=28,grow=True).replace('flex:1 1 auto;','width:100%;')+'</div></div>')
g('<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Zaznaczona sekcja jest podświetlona. Sekcje z niespełnionym warunkiem w podglądzie są ukryte, tak jak u użytkownika.</span>')
g('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(F)+'\n'+'\n'.join(G)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isPtg = ekran === 'przetargi'; const isTbP = ekran === 'tabela pola'; const isTbS = ekran === 'tabela panel'; const nPtg = navv(isPtg || isTbP || isTbS);")
rep("isFV, actFV:","isPtg, isTbP, isTbS, actPtg: nPtg.act, colPtg: nPtg.col, wPtg: nPtg.w, isFV, actFV:")
rep('"import cennika", "planowanie"]','"import cennika", "przetargi", "tabela pola", "tabela panel", "planowanie"]')
# grupa „Własne tabele” w pasku bocznym — po grupie Projekty
anchor='<span class="ell" style="flex:1 1 auto;font-weight:{{wZ}}">Zadania</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{{zOpenCount}}</span></a></sc-if>\n</div>'
grp=('\n<div style="display:flex;flex-direction:column;gap:1px">'
     '<div class="grp-h" style="width:100%;height:28px;display:flex;align-items:center;gap:4px;padding:0 8px;font-size:12px;line-height:16px;font-weight:500;color:var(--text-tertiary)">Własne tabele</div>'
     '<a href="#" class="nav {{actPtg}}" style="display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-radius:8px;color:{{colPtg}}">'+ic(GAVEL,16).replace('stroke-width="2"','stroke-width="1.5"')+'<span class="ell" style="flex:1 1 auto;font-weight:{{wPtg}}">Przetargi</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">4</span></a>'
     '<a href="#" class="nav" title="Nowa tabela — tylko administrator" style="display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-radius:8px;color:var(--text-tertiary)">'+ic(PLUS,16)+'<span class="ell" style="flex:1 1 auto;font-weight:400">Nowa tabela</span></a></div>')
rep(anchor,anchor+grp)
open(P,'w').write(s); print('ok flex',len(s))
