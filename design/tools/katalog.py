# Katalog (lista + podgląd pozycji) i import cennika dostawcy z podglądem zmian. Scenariusz: piątek 20 lis 2026, 16:00.
P='design/canvas/Main.dc.html'
exec(open('design/tools/ui1.py').read())
import re
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
CHECK='<path d="M20 6 9 17l-5-5"></path>'
BOOK='<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
TREND='<path d="m22 7-8.5 8.5-5-5L2 17"></path><path d="M16 7h6v6"></path>'
UPL='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5M12 3v12"></path>'
BOX='<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
LAYERS='<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>'
SHEET='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h2M14 13h2M8 17h2M14 17h2"></path>'
ARROW='<path d="M5 12h14M12 5l7 7-7 7"></path>'
FLAME='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'
WIND='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
FAN='<circle cx="12" cy="12" r="2"></circle><path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4l-4 4M14 12c4 0 7 1 7 4 0 2-2 3-4 2l-4-4M12 14c0 4-1 7-4 7-2 0-3-2-2-4l4-4M10 12c-4 0-7-1-7-4 0-2 2-3 4-2l4 4"></path>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def btn(t,tip,icon='',pri=False,h=28,grow=False):
    g='flex:1 1 auto;' if grow else ''
    if pri: return f'<button type="button" class="pri" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'
def tabs(items,cur=0):
    return ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))
def mg(v,low=False,tip=''):
    if low: return f'<span title="{tip}" class="num" style="display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;color:var(--warning);font-weight:500">{ic(WARN,12,"var(--warning)")}{v}</span>'
    return f'<span title="{tip}" class="num" style="color:var(--text-secondary)">{v}</span>'

# =================== KATALOG
COLS='96px minmax(0,2.2fr) 20px 36px 84px 84px 68px 40px 76px'
def row(icon,col,name,code,sub,unit,cost,sale,marg,stock,stocktip,use,usetip,sel=False,chip=''):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{code}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:10px;min-width:0">{ic(icon,14,col)}<span class="ell" style="font-weight:500">{name}</span>{('<span title="'+re.search(r'title="([^"]*)"',chip).group(1)+'" style="display:inline-flex;flex:0 0 auto">'+u_ci('trend','orange')+'</span>') if chip else ''}</span>'
            f'<span role="cell" style="display:flex;min-width:0;color:var(--text-secondary)">{u_logo(sub) if sub not in ("—","") else sub}</span>'
            f'<span role="cell" style="color:var(--text-secondary)">{unit}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{cost}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-weight:500">{sale}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{marg}</span>'
            f'<span role="cell" class="num" title="{stocktip}" style="text-align:right;font-size:12px;color:var(--text-secondary)">{stock}</span>'
            f'<span role="cell" class="num" title="{usetip}" style="text-align:right;font-size:12px;color:var(--text-secondary)">{use}</span></div>')
H=[];a=H.append
a('<sc-if value="{{isKat}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(BOOK,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Katalog</h1><span style="width:8px"></span>'+
  tabs([('Wszystkie','248'),('Urządzenia','64'),('Materiały','131'),('Usługi','41'),('Dojazd','12')],1)+SP+
  btn('Importuj cennik','Import cennika dostawcy z podglądem zmian (XLSX, CSV)',UPL)+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowa pozycja','Nowa pozycja  C',PLUS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'
  '<div style="display:flex;align-items:center;gap:8px;height:28px;width:240px;padding:0 10px;border-radius:14px;background:var(--bg-subtle);color:var(--text-tertiary)">'+ic('<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>',14)+'<span style="flex:1 1 auto;font-size:12px">Kod, nazwa, producent, model</span><span class="mono" style="font-size:11px">/</span></div>'+
  capd(ic(BLD,14,'var(--text-tertiary)')+'Producent: wszyscy','Filtr: producent')+capd('Aktywne','Status: aktywne / archiwum')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Próg marży firmy z Ustawień → Katalog i marże" style="display:inline-flex;align-items:center;gap:4px">Próg marży <span class="num" style="color:var(--text-primary);font-weight:500">22 %</span></span>'
  '<span title="Pozycje, których koszt w katalogu jest niższy niż ostatni zakup — marża w katalogu jest zawyżona" style="display:inline-flex;align-items:center;gap:4px;color:var(--warning)">'+ic(TREND,12,'var(--warning)')+'4 z nieaktualnym kosztem</span></span></div>')
a('<div role="table" aria-label="Katalog · urządzenia" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Indeks','hash')+'</span><span>'+u_th('Pozycja','box','orange')+'</span><span>'+u_th('','bld','indigo',tip='Producent')+'</span><span>Jedn.</span><span style="text-align:right">Koszt netto</span><span style="text-align:right">Cena netto</span><span style="text-align:right" title="(cena − koszt) / cena — to nie narzut">Marża</span><span style="text-align:right" title="Stan w magazynie głównym i busach — kreska, gdy pozycja nie jest prowadzona na stanie">Stan</span><span style="text-align:right" title="Szablony instalacji i otwarte oferty">Użycie</span></div>')
up=lambda t,tip: sch(ic(TREND,12,'var(--warning)')+t,tip,col='var(--warning)')
a(row(FLAME,'#E0702A','Daikin Altherma 3 R · jedn. zewnętrzna 8 kW','ERGA08EV','Daikin','szt.','14 920,00','19 900,00',mg('25,0 %'),'1','1 szt. zarezerwowana dla ZS-1052','1 szablon','Szablon „Dom do 200 m²” · otwartych ofert: 0',sel=True,chip=up('koszt +3,8 %','Ostatni zakup 15 480,00 zł (PZ/2026/11/019, dziś) — w katalogu 14 920,00 zł')))
a(row(FLAME,'#E0702A','Daikin Altherma 3 R · hydrobox z zasobnikiem 230 l','EHVH08S23E6V','Daikin','szt.','9 840,00','13 350,00',mg('26,3 %'),'1','Magazyn główny · zarezerwowany ZS-1052','1 szablon','Szablon „Dom do 200 m²”'))
a(row(FLAME,'#E0702A','Daikin Altherma 3 H HT · 14 kW wysokotemperaturowa','EPRA14DV','Daikin','szt.','21 600,00','28 900,00',mg('25,3 %'),'—','Nie prowadzona na stanie — zamawiana pod zlecenie','1 szablon','Szablon „Dom z grzejnikami”'))
a(row(FLAME,'#E0702A','Panasonic Aquarea · 9 kW','PAN-AQ9','Panasonic','szt.','11 200,00','14 600,00',mg('23,3 %'),'—','Zamawiana pod zlecenie','1 oferta','OF-2026-118 wariant A — oferta zachowuje własną kopię ceny'))
a(row(WIND,'#2BB3B1','Daikin Perfera · split 2,5 kW · komplet','FTXM25A + RXM25A','Daikin','kpl.','2 840,00','3 990,00',mg('28,8 %'),'3','Magazyn główny 3 kpl.','2 szablony','„Split 1 pom.”, „Split 3 pom.”'))
a(row(WIND,'#2BB3B1','Daikin multi-split · jedn. zewnętrzna 6,8 kW','3MXM68A','Daikin','szt.','5 120,00','6 900,00',mg('25,8 %'),'1','Magazyn główny','1 szablon','„Mieszkanie 3 pok.” — użyty we wstępnym doborze dla Joanny Krawczyk',chip=up('koszt +2,1 %','Oferta Klimatech z 11 lis: 5 228,00 zł')))
a(row(SNOW,'#3B82D6','Agregat skraplający 4 kW · R449A','BTZ-LH44','Bitzer','szt.','14 300,00','17 900,00',mg('20,1 %',True,'Poniżej progu 22 % — w ofercie wymaga zgody administratora'),'—','Zamawiany pod zlecenie','1 szansa','Restauracja Przystań — komora 6 m² (oględziny 17 lis)'))
a(row(FAN,'#C98A12','Centrala wentylacyjna z odzyskiem · 2 000 m³/h','CW-2000-R','Klimor','szt.','38 400,00','52 800,00',mg('27,3 %'),'—','Zamawiana pod zlecenie','1 oferta','OF-2026-102 v3 · Przychodnia Zdrowie'))
a('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-secondary)"><span>8 z 64 · strona 1 z 3</span>'+SP+'<span>Kwoty netto w zł · VAT pozycji 23 % (stawkę 8 % dla budynku mieszkalnego ustawia oferta)</span></div>')
a('</div></div>')
# aside
a('<aside aria-label="Pozycja ERGA08EV" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><div style="display:flex;align-items:center;gap:8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">ERGA08EV</span>'+SP+ib('Edytuj','Edytuj  E',PEN if 'PEN' in dir() else FILE,24)+ib('Więcej akcji','Duplikuj, archiwizuj',DOTS,24)+'</div>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Daikin Altherma 3 R · jednostka zewnętrzna 8 kW</h2><span style="font-size:12px;color:var(--text-secondary)">Urządzenia · szt. · R32 1,5 kg (1,01 t CO₂e)</span></div>')
a('<div role="note" style="display:flex;flex-direction:column;gap:8px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;gap:10px">'+ic(TREND,16,'var(--warning)')+'<div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">Koszt wzrósł o 3,8 %</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Dziś przyjęto po 15 480,00 zł (PZ/2026/11/019). Przy tym koszcie marża spada do 22,2 % — tuż nad progiem.</span></div></div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding-left:26px">'+kv('Zaktualizuj koszt','15 480,00 zł',tip='Koszt katalogowy = ostatni zakup')+kv('Cena dla marży 25 %','20 640,00 zł',w=500,tip='15 480 / 0,75, zaokrąglone do 10 zł')+'</div>'
  '<div style="display:flex;gap:6px;padding-left:26px">'+btn('Tylko koszt','Zaktualizuj koszt, cena bez zmian — marża 22,2 %')+btn('Koszt i cena 20 640 zł','Zaktualizuj koszt i cenę — marża 25,0 %  ⌘↵',pri=True,grow=True)+'</div></div>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Cena')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Koszt netto','14 920,00 zł',tip='Cennik Termo-Bud z 1 paź')+kv('Cena sprzedaży netto','19 900,00 zł',w=500)+kv('Brutto (VAT 23 %)','24 477,00 zł',vc='var(--text-secondary)')+
  kv('Marża','25,0 %',tip='4 980,00 zł · (cena − koszt) / cena')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Historia kosztu',CNT(3))+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('20 lis · PZ/2026/11/019','15 480,00 zł',w=500,tip='Zakup ZK/2026/11/031 · Termo-Bud')+kv('1 paź · cennik Termo-Bud','14 920,00 zł',vc='var(--text-secondary)')+kv('3 mar · cennik Termo-Bud','14 380,00 zł',vc='var(--text-secondary)')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Powiązania')+
  prop(BOX,'Magazyn: 1 szt.','Ta sama pozycja w magazynie · zarezerwowana dla ZS-1052 · minimum 0 (zamawiana pod zlecenie)')+
  prop(LAYERS,'Szablon „Dom do 200 m²”','Wariant B · zmiana ceny w katalogu zmieni nowe wyceny z szablonu')+
  prop(FILE,'Oferty zachowują swoje ceny','OF-2026-118 ma kopię z 11 lis — nie zmieni się')+'</section>')
a('</aside></div></sc-if>')

# =================== IMPORT CENNIKA
K=[];k=K.append
k('<sc-if value="{{isImp}}" hint-placeholder-val="{{false}}">')
k('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(BOOK,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Katalog</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Import cennika</h1>'+SP+
  '<span style="font-size:12px;color:var(--text-tertiary)">Nic nie zmieni się przed zatwierdzeniem</span>'+ib('Anuluj import','Anuluj  Esc',X if 'X' in dir() else DOTS)+'</div>')
k('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
k('<div style="display:flex;flex-direction:column;gap:12px;padding:12px 24px 16px"><div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Termo-Bud Pomorze · cennik Daikin 2027</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(SHEET,'TermoBud_Daikin_2027-01.xlsx','214 wierszy · wczytany dziś 15:40 przez Agnieszkę')+meta(CAL,'Ważny od 1 sty 2027','Zmiany kosztów zaczną obowiązywać 1 stycznia')+meta(BLD,'Termo-Bud · rabat 18 %','Koszt = cena katalogowa − rabat z warunków dostawcy')+'</div></div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd(ic(CHECK,14,'var(--success)')+'187 dopasowanych','Po kodzie producenta · 151 bez zmian')+capd(ic(TREND,14,'var(--warning)')+'33 podwyżki','Średnio +5,1 %')+capd('3 obniżki','Średnio −4,0 %')+capd(ic(PLUS,14,'var(--text-tertiary)')+'18 nowych','Nie ma ich w katalogu — dodasz wybrane')+capd(ic(WARN,14,'var(--danger)')+'9 do sprawdzenia','Nierozpoznany kod albo jednostka')+'</div></div>')
k('<div style="display:flex;align-items:center;gap:8px;padding:0 24px 12px">'+tabs([('Podwyżki','33'),('Obniżki','3'),('Nowe','18'),('Do sprawdzenia','9'),('Bez zmian','151')])+'</div>')
k('<div style="display:flex;align-items:center;gap:8px;padding:0 24px 12px"><span style="font-size:12px;color:var(--text-secondary)">Zasada cen:</span>'+capd('Marża poniżej 22 % → podnieś do 25 %','Ceny sprzedaży z marżą ≥ 22 % zostają bez zmian. Pozostałe podnosimy do marży 25 %, zaokrąglone do 10 zł.')+'</div>')
IC='88px minmax(0,1fr) 128px 56px 150px 112px 136px'
def irow(name,code,c0,c1,d,p0,p1,m0,m1,act,low=False):
    pr=(f'<span class="num" style="color:var(--text-tertiary)">{p0}</span>{ic(ARROW,12,"var(--text-tertiary)")}<span class="num" style="font-weight:500">{p1}</span>') if p1 else f'<span class="num" style="color:var(--text-secondary)">{p0}</span><span style="font-size:12px;color:var(--text-tertiary)">bez zmian</span>'
    mm=(f'<span class="num" style="color:{"var(--warning)" if low else "var(--text-tertiary)"}">{m0}</span>{ic(ARROW,12,"var(--text-tertiary)")}<span class="num" style="font-weight:500">{m1}</span>')
    return (f'<div role="row" class="row row1" style="display:grid;grid-template-columns:{IC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px">'
            f'<span role="cell" class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{code}</span><span role="cell" class="ell" style="font-weight:500">{name}</span>'
            f'<span role="cell" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap"><span class="num" style="color:var(--text-tertiary)">{c0}</span>{ic(ARROW,12,"var(--text-tertiary)")}<span class="num">{c1}</span></span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--warning)">{d}</span>'
            f'<span role="cell" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap">{pr}</span>'
            f'<span role="cell" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap">{mm}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{act}</span></div>')
def seg(on):
    o=lambda t,a: f'<span role="radio" aria-checked="{str(a).lower()}" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border-radius:8px;font-size:12px;{"background:var(--bg-surface);font-weight:500;color:var(--text-primary)" if a else "color:var(--text-secondary)"}">{t}</span>'
    return f'<span role="radiogroup" aria-label="Cena sprzedaży" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">{o("Zachowaj",on=="keep")}{o("Podnieś",on=="up")}</span>'
k('<div role="table" aria-label="Podwyżki" style="display:flex;flex-direction:column;padding:0 16px 16px">')
k(f'<div role="row" style="display:grid;grid-template-columns:{IC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Indeks','hash')+'</span><span>'+u_th('Pozycja','box','orange')+'</span><span style="text-align:right">Koszt netto</span><span style="text-align:right">Zmiana</span><span style="text-align:right">Cena sprzedaży</span><span style="text-align:right">Marża</span><span style="text-align:right">Cena</span></div>')
k(irow('Altherma 3 H HT · 14 kW','EPRA14DV','21 600','22 900','+6,0 %','28 900','30 530','20,8 %','25,0 %',seg('up'),True))
k(irow('Altherma 3 R · jedn. zewn. 8 kW','ERGA08EV','14 920','15 940','+6,8 %','19 900','21 250','19,9 %','25,0 %',seg('up'),True))
k(irow('Altherma 3 R · hydrobox 230 l','EHVH08S23E6V','9 840','10 380','+5,5 %','13 350','','22,2 %','22,2 %',seg('keep')))
k(irow('Perfera · split 2,5 kW · komplet','FTXM25A + RXM25A','2 840','2 990','+5,3 %','3 990','','25,1 %','25,1 %',seg('keep')))
k(irow('Multi-split · jedn. zewn. 6,8 kW','3MXM68A','5 120','5 310','+3,7 %','6 900','','23,0 %','23,0 %',seg('keep')))
k(irow('Sterownik przewodowy Madoka','BRC1HHDW','410','438','+6,8 %','590','','25,8 %','25,8 %',seg('keep')))
k('<div style="display:flex;align-items:center;gap:8px;padding:8px 10px 0;font-size:12px;color:var(--text-tertiary)">6 z 33 · pokaż wszystkie</div>')
k('</div></div>')
k('<aside aria-label="Podsumowanie importu" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:16px 12px 24px">')
k('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Po zatwierdzeniu')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Nowe koszty','36 pozycji',tip='33 podwyżki i 3 obniżki')+kv('Ceny bez zmian','21 pozycji',vc='var(--text-secondary)',tip='Marża po zmianie kosztu ≥ 22 %')+kv('Ceny podniesione','12 pozycji',w=500,tip='Do marży 25 %, zaokrąglone do 10 zł')+kv('Nowe pozycje','0 z 18',vc='var(--text-secondary)',tip='Wybierz w zakładce Nowe')+kv('Do sprawdzenia','9',vc='var(--danger)',tip='Pominięte, dopóki ich nie rozwiążesz')+'</div></section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Kiedy')+
  prop(CAL,'1 stycznia 2027, 0:00','Zgodnie z ważnością cennika · do tego czasu obowiązują obecne ceny',sch('zaplanowane','Można zmienić na „od razu”'))+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Na co wpłynie')+
  prop(LAYERS,'3 szablony instalacji','„Dom do 200 m²”, „Dom z grzejnikami”, „Mieszkanie 3 pok.” — nowe wyceny od 1 sty')+
  prop(FILE,'Otwarte oferty bez zmian','OF-2026-109 i 2 inne zachowują ceny z dnia wyceny')+
  prop(BOX,'Zakupy','Zapotrzebowanie od 1 sty liczy nowe koszty')+'</section>')
k('<div style="display:flex;flex-direction:column;gap:6px;padding:0 4px">'+btn('Zatwierdź od 1 sty 2027','Zapisz 36 kosztów i 12 cen z datą 1 sty 2027 · historia cen zachowana  ⌘↵',CHECK,pri=True,h=32)+
  '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary);padding:0 4px">Każda zmiana trafia do historii pozycji z nazwą pliku i osobą, która zatwierdziła.</span></div>')
k('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isKat = ekran === 'katalog'; const isImp = ekran === 'import cennika'; const nKat = navv(isKat || isImp);")
rep("isFV, actFV:","isKat, isImp, actKat: nKat.act, colKat: nKat.col, wKat: nKat.w, isFV, actFV:")
rep('"zamówienie zakupowe", "planowanie"]','"zamówienie zakupowe", "katalog", "import cennika", "planowanie"]')
i=s.find('font-weight:400">Katalog</span>'); a0=s.rfind('<a href="#" class="nav"',0,i); assert '</a>' not in s[a0:i]
e=s.find('</a>',i); seg_=s[a0:e]
seg_=seg_.replace('class="nav"','class="nav {{actKat}}"',1).replace('color:var(--text-secondary)">','color:{{colKat}}">',1).replace('font-weight:400">Katalog','font-weight:{{wKat}}">Katalog')
assert '{{colKat}}' in seg_; s=s[:a0]+seg_+s[e:]
open(P,'w').write(s); print('ok katalog',len(s))
