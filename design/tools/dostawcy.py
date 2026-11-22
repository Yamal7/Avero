# Zakupy › Dostawcy (rejestr + panel Termo-Bud) i Zakupy › Cenniki (lista + panel Chłodpol z historią ceny R404A).
# Scenariusz: piątek 20 lis 2026, 8:40 (jak Zapotrzebowanie). Uruchamiany po zakupy.py.
SRCZ=open('design/tools/zakupy.py').read()
exec(SRCZ.split("# =================== ZAPOTRZEBOWANIE")[0])   # helpery: ic, ib, capd, kv, prop, sch, obj, btn, tabs, ikony
exec(open('design/tools/ui1.py').read())
P='design/canvas/Main.dc.html'; s=open(P).read()
SER='#2a78d6'
dot=lambda c: f'<span style="width:6px;height:6px;border-radius:50%;background:{c};flex:0 0 auto"></span>'
def head(cur,counts):
    T=[('Zapotrzebowanie','6'),('Zamówienia','4'),('Dostawcy','7'),('Cenniki','8')]
    return ('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CART,16,'var(--text-secondary)')+
            '<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Zakupy</h1><span style="width:8px"></span>'+tabs(T,cur)+SP+
            ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+counts+'</div>')
def fact(label,val,tip): return f'<span title="{tip}">{label} <span class="num" style="color:var(--text-primary);font-weight:500">{val}</span></span>'

# =================== DOSTAWCY
DC='minmax(0,1.3fr) 56px minmax(0,1fr) 132px 92px 56px 40px'
def drow(name,code,cats,terms,termstip,cen,purch,purtip,ontime,ontip,opn,opntip,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{DC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" title="{cats}" style="display:flex;min-width:0">{u_logo(name,label=True)}</span>'
            f'<span role="cell" class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{code}</span>'
            f'<span role="cell" title="{termstip}" style="display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;color:var(--text-secondary)">'+f'<span style="display:inline-flex;align-items:center;gap:4px;min-width:0">{u_ci("coin","yellow",12)}<span class="ell">{terms.split(" · ")[0]}</span></span>'+''.join(f'<span title="{t}" style="display:inline-flex;flex:0 0 auto">{u_ci(("truck","clock")[i],("teal","blue")[i],12)}</span>' for i,t in enumerate(terms.split(' · ')[1:3]))+'</span>'
            f'<span role="cell" style="display:flex;min-width:0">{cen}</span>'
            f'<span role="cell" class="num" title="{purtip}" style="text-align:right">{purch}</span>'
            f'<span role="cell" class="num" title="{ontip}" style="text-align:right;color:var(--text-secondary)">{ontime}</span>'
            f'<span role="cell" class="num" title="{opntip}" style="text-align:right;color:{"var(--text-primary)" if opn!="0" else "var(--text-tertiary)"}">{opn}</span></div>')
cen_ok=lambda t,tip: sch(dot('var(--success)')+t,tip)
cen_plan=lambda t,tip: sch(ic(CLOCK,12,'var(--text-tertiary)')+t,tip)
cen_warn=lambda t,tip: sch(ic(WARN,12,'var(--warning)')+t,tip,col='var(--warning)')
cen_none=lambda t,tip: f'<span title="{tip}" style="font-size:12px;color:var(--text-tertiary)">{t}</span>'
H=[];a=H.append
a('<sc-if value="{{isDost}}" hint-placeholder-val="{{false}}">')
a(head(2,btn('Nowy dostawca','Nowy dostawca  C',PLUS)))
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd(ic(BOX,14,'var(--text-tertiary)')+'Wszystkie kategorie','Filtruj po tym, co dostawca sprzedaje')+capd('Aktywni','6 aktywnych · 1 tylko awaryjnie')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'+
  fact('Zakupy 12 mies.','388 200 zł','Przyjęte PZ od grudnia 2025 do listopada 2026, netto')+fact('Na czas','94 %','Dostawy w potwierdzonym terminie, ostatnie 12 miesięcy · 71 z 76')+'</span></div>')
a('<div role="table" aria-label="Dostawcy" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{DC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Dostawca','truck','indigo')+'</span><span>'+u_th('Nr','hash')+'</span><span>'+u_th('Warunki','coin','yellow')+'</span><span>'+u_th('Cennik','list','violet')+'</span><span style="text-align:right">Zakupy 12 mies.</span><span style="text-align:right" title="Dostawy w potwierdzonym terminie">Na czas</span><span style="text-align:right" title="Otwarte zamówienia">Otw.</span></div>')
a(drow('Termo-Bud Pomorze','DS-007','pompy ciepła, hydraulika · Gdańsk','przelew 14 dni · darmowa od 500 zł','Rabat 18 % od cennika Daikin, 15 % Panasonic · dostawa 2 dni robocze',
       cen_plan('Daikin 2027 od 1 sty','Zaplanowany: koszty w katalogu zmienią się 1 stycznia · obecny Daikin 2026 do 31 gru'),'184 320 zł','23 zamówienia','96 %','22 z 23 dostaw na czas','1','ZK/2026/11/031 — podkładki dosłanie 24 lis',sel=True))
a(drow('Klimatech Gdańsk','DS-003','klimatyzacja, materiały montażowe','przelew 21 dni · darmowa od 800 zł','Zamówienie do 15:00 · rabat 8 % od cennika miesięcznego',
       cen_ok('Cennik XI 2026','Cennik miesięczny z 2 lis · 412 pozycji'),'96 480 zł','31 zamówień','91 %','28 z 31 dostaw na czas','2','ZK/2026/11/030 presostat · ZK/2026/11/036 sterowniki grupowe dla PJ-2026-011'))
a(drow('Chłodpol Gdynia','DS-001','czynniki, części chłodnicze','przelew 14 dni · zamówienie do 14:00','Dostawa następnego dnia roboczego · butle zwrotne, kaucja 250 zł',
       cen_ok('Czynniki i części','Cennik z 2 lis · 186 pozycji · kolejny zapowiedziany 1 gru'),'41 260 zł','14 zamówień','100 %','14 z 14 dostaw na czas','0','Brak otwartych zamówień'))
a(drow('Frigo-Serwis Gdańsk','DS-012','sprężarki, agregaty, automatyka','przelew 30 dni · dostawa 3–5 dni','Rabat 12 % od cennika Bitzer · części na zamówienie z magazynu centralnego',
       cen_ok('Bitzer 2026','Cennik z 10 mar · 92 pozycje'),'31 600 zł','8 zamówień','75 %','6 z 8 dostaw na czas · 2 opóźnienia o 2–4 dni','1','ZK/2026/11/028 — zawór rozprężny dla UR-2304, dostawa 25 lis'))
a(drow('Wentmax Gdańsk','DS-011','wentylacja, kanały, centrale','przelew 14 dni · transport własny','Rabat 10 % od cennika Klimor · centrale na zamówienie 3–4 tygodnie',
       cen_warn('wygasa 30 lis','Cennik Klimor 2026 ważny do 30 lis — poproś o nowy'),'22 480 zł','5 zamówień','100 %','5 z 5 dostaw na czas','0','Brak otwartych zamówień'))
a(drow('Elektro-Hurt Gdynia','DS-009','kable, zabezpieczenia, osprzęt','przelew 7 dni · odbiór osobisty','Ceny tylko z faktur — dostawca nie wysyła cennika',
       cen_none('bez cennika','Ceny zakupu z ostatnich faktur'),'8 940 zł','12 zakupów','—','Odbiory osobiste — bez terminu dostawy','0','Brak otwartych zamówień'))
a(drow('Hydro-Sklep Rumia','DS-014','drobna hydraulika · tylko awaryjnie','karta przy odbiorze','Sklep detaliczny — zakupy awaryjne techników, paragon lub faktura do zlecenia',
       cen_none('bez cennika','Ceny z paragonów i faktur'),'3 120 zł','9 zakupów','—','Zakupy na miejscu','0','Brak otwartych zamówień'))
a('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-secondary)"><span>7 dostawców · 4 otwarte zamówienia</span>'+SP+'<span>Razem 12 mies. <span class="num" style="color:var(--text-primary);font-weight:600">388 200 zł</span></span></div>')
a('<div role="note" style="display:flex;align-items:flex-start;gap:10px;margin:16px 10px 0;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(WARN,16,'var(--warning)')+
  '<div style="display:flex;flex-direction:column;gap:2px;flex:1 1 auto"><span style="font-weight:500">Cennik Wentmax wygasa 30 lis</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Po tej dacie oferty z centralami Klimor pokażą koszt z ostatniej faktury i ostrzeżenie. Szablony i wysłane oferty się nie zmienią.</span></div>'+
  btn('Poproś o cennik…','Szkic e-maila do handlowca Wentmax — wyślesz po sprawdzeniu',MAIL)+'</div>')
a('</div></div>')
# panel: Termo-Bud
MON=[('gru',8200),('sty',6400),('lut',11800),('mar',14380),('kwi',9600),('maj',16900),('cze',18400),('lip',21300),('sie',17600),('wrz',24500),('paź',19070),('lis',16170)]
def bars():
    W,Hh,gap=292,64,4; n=len(MON); bw=(W-gap*(n-1))/n; mx=26000
    out=[f'<svg width="100%" viewBox="0 0 {W} {Hh+18}" role="img" aria-label="Zakupy u Termo-Bud miesięcznie, grudzień 2025 – listopad 2026, razem 184 320 zł" style="display:block">',
         f'<line x1="0" x2="{W}" y1="{Hh}" y2="{Hh}" style="stroke:var(--edge);stroke-width:1"></line>']
    for i,(m,v) in enumerate(MON):
        h=max(2,v/mx*(Hh-4)); x=i*(bw+gap); y=Hh-h
        col=SER if m!='lis' else SER
        op='1' if m in ('wrz','lis') else '.55'
        out.append(f'<g><title>{m} · {v:,} zł'.replace(',',' ')+(' · najwyższy' if m=='wrz' else '')+f'</title><rect x="{x:.1f}" y="{Hh-60:.1f}" width="{bw:.1f}" height="60" style="fill:transparent"></rect>'
                   f'<path d="M{x:.1f},{Hh} V{y+3:.1f} q0,-3 3,-3 h{bw-6:.1f} q3,0 3,3 V{Hh} Z" style="fill:{col};opacity:{op}"></path></g>')
        if i in (0,5,11): out.append(f'<text x="{x+bw/2:.1f}" y="{Hh+14}" text-anchor="middle" style="font-size:10px;fill:var(--text-tertiary)">{m}</text>')
    out.append('</svg>'); return ''.join(out)
a('<aside aria-label="Dostawca Termo-Bud Pomorze" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">DS-007</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Termo-Bud Pomorze</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">Pompy ciepła, hydraulika · Gdańsk, Budowlanych 19</span>'
  '<div style="display:flex;gap:6px;padding-top:8px">'+btn('Nowe zamówienie','Nowe zamówienie u tego dostawcy  C',CART)+btn('Importuj cennik','Wczytaj plik cennika — podgląd zmian przed zatwierdzeniem',DL)+'</div></div>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Kontakt')+
  prop(USER,'Kamil Nowicki · handlowiec','k.nowicki@termo-bud.pl · +48 58 520 40 17',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+
  prop(MAIL,'zamowienia@termo-bud.pl','Tu Avero wysyła zamówienia ZK jako PDF')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Warunki')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Płatność','przelew 14 dni')+kv('Dostawa','2 dni robocze',vc='var(--text-secondary)')+kv('Darmowa dostawa','od 500 zł netto',vc='var(--text-secondary)')+
  kv('Rabat','18 % Daikin · 15 % Panasonic',tip='Liczony od cennika producenta przy imporcie')+
  kv('Limit kupiecki','16 170 z 60 000 zł',vc='var(--text-secondary)',tip='Niezapłacone faktury i otwarte zamówienia · ZK/2026/11/031')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Cenniki',CNT(3))+
  prop(CLOCK,'Daikin 2027 · od 1 sty','214 pozycji · wczytany 20 lis przez Agnieszkę · śr. +5,1 %',sch('zaplanowany','Koszty w katalogu zmienią się 1 stycznia'),plain=True)+
  prop(FILE,'Daikin 2026 · do 31 gru','198 pozycji · aktywny',sch(dot('var(--success)')+'aktywny','Używany w katalogu i zakupach'),plain=True)+
  prop(FILE,'Panasonic 2026 · do 31 gru','64 pozycje · aktywny',sch(dot('var(--success)')+'aktywny','Używany w katalogu i zakupach'),plain=True)+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Zakupy 12 mies.','<span class="num" style="font-size:12px;color:var(--text-secondary)">184 320 zł</span>')+
  '<div style="margin:0 4px;padding:10px 12px 6px;border-radius:12px;background:var(--bg-raised)">'+bars()+'</div>'
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('Na czas','22 z 23 dostaw',tip='Jedno opóźnienie: podkładki AV-PAD-4 z ZK/2026/11/031, dosłanie 24 lis')+
  kv('Otwarte','ZK/2026/11/031',vc='var(--text-secondary)',tip='Przyjęte 2 z 3 pozycji · brak podkładek')+'</div></section>')
a('</aside></div></sc-if>')

# =================== CENNIKI
CC='minmax(0,1.3fr) 20px 128px 64px 56px minmax(0,1fr) 112px'
def crow(name,sup_,valid,validtip,n,disc,chg,chgtip,stat,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{CC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0">{u_ci("list","violet")}<span class="ell" style="font-weight:500">{name}</span></span>'
            f'<span role="cell" style="display:flex">{u_logo(sup_)}</span>'
            f'<span role="cell" class="num ell" title="{validtip}" style="font-size:12px;color:var(--text-secondary)">{valid}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{n}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{disc}</span>'
            f'<span role="cell" class="ell" title="{chgtip}" style="font-size:12px;color:var(--text-secondary)">{chg}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{stat}</span></div>')
akt=lambda: sch(dot('var(--success)')+'aktywny','Używany w katalogu i zakupach')
C=[];c=C.append
c('<sc-if value="{{isCen}}" hint-placeholder-val="{{false}}">')
c(head(3,btn('Importuj cennik','Wczytaj plik XLSX lub CSV — podgląd zmian przed zatwierdzeniem  ⇧I',DL)))
c('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
c('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd(ic(BLD,14,'var(--text-tertiary)')+'Wszyscy dostawcy','7 dostawców · 2 bez cennika')+capd('Aktywne i zaplanowane','Bez wygasłych (12 w archiwum)')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'+fact('Pozycji z ceną','1 207','Pozycje dostawców dopasowane do katalogu: 231 z 248')+fact('Zmiany w lis.','47','Zmiany kosztów z cenników i ofert od 1 listopada')+'</span></div>')
c('<p style="margin:0;padding:0 20px 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Avero porównuje ceny z cenników, ofert handlowców i ostatnich faktur. Koszt w katalogu zmienia się dopiero po zatwierdzeniu importu.</p>')
c('<div role="table" aria-label="Cenniki" style="display:flex;flex-direction:column;padding:0 16px 24px">')
c(f'<div role="row" style="display:grid;grid-template-columns:{CC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Cennik','list','violet')+'</span><span>'+u_th('','truck','indigo',tip='Dostawca')+'</span><span>'+u_th('Ważność','cal','blue')+'</span><span style="text-align:right">Pozycje</span><span style="text-align:right">Rabat</span><span>Ostatnia zmiana</span><span style="text-align:right">Stan</span></div>')
c(crow('Daikin 2027','Termo-Bud Pomorze','od 1 sty 2027','Zaplanowany — dziś obowiązuje Daikin 2026','214','18 %','20 lis · śr. +5,1 %','33 podwyżki, 3 obniżki, 18 nowych · wczytała Agnieszka 15:40',
       sch(ic(CLOCK,12,'var(--text-tertiary)')+'zaplanowany','Wejdzie 1 stycznia 2027')))
c(crow('Daikin 2026','Termo-Bud Pomorze','do 31 gru 2026','Zastąpi go Daikin 2027','198','18 %','15 sty','Wczytany 15 stycznia 2026',akt()))
c(crow('Panasonic 2026','Termo-Bud Pomorze','do 31 gru 2026','Nowy cennik zapowiedziany na grudzień','64','15 %','2 lut','Wczytany 2 lutego 2026',akt()))
c(crow('Czynniki i części','Chłodpol Gdynia','od 2 lis','Cennik miesięczny · kolejny zapowiedziany 1 gru','186','—','2 lis · 11 zmian','R404A regenerowany +4,4 %, R449A +6,1 %, R32 +2,8 % · ceny netto bez rabatu',akt(),sel=True))
c(crow('Cennik XI 2026','Klimatech Gdańsk','1–30 lis','Cennik miesięczny z linku dostawcy','412','8 %','2 lis · 26 zmian','Głównie materiały montażowe, średnio +1,2 %',akt()))
c(crow('Oferty handlowców','Klimatech Gdańsk','do 30 lis','Ceny z e-maili handlowca, przypisane do pozycji przez Agnieszkę','3','—','11 lis','R404A regenerowany 149,00 zł/kg · sterownik grupowy · pompka skroplin',
       sch(ic(MAIL,12,'var(--text-tertiary)')+'oferta','Ważne do 30 listopada')))
c(crow('Bitzer 2026','Frigo-Serwis Gdańsk','do 31 gru 2026','','92','12 %','10 mar','Wczytany 10 marca 2026',akt()))
c(crow('Klimor 2026','Wentmax Gdańsk','do 30 lis 2026','Wygasa za 10 dni','38','10 %','14 sty','Wczytany 14 stycznia 2026',
       sch(ic(WARN,12,'var(--warning)')+'wygasa 30 lis','Poproś dostawcę o nowy cennik',col='var(--warning)')))
c('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-secondary)"><span>8 cenników · 5 dostawców</span>'+SP+'<span>Elektro-Hurt i Hydro-Sklep: ceny z faktur</span></div>')
c('</div></div>')
# panel: Chłodpol — historia R404A
PTS=[('maj',118.00),('cze',121.00),('lip',124.00),('sie',126.00),('wrz',128.50),('paź',136.00),('lis',142.00)]
def line():
    W,Hh,L,R,T,B=292,132,30,8,14,18; lo,hi=115,145
    X=lambda i: L+i*(W-L-R)/(len(PTS)-1); Y=lambda v: T+(hi-v)/(hi-lo)*(Hh-T-B)
    o=[f'<svg width="100%" viewBox="0 0 {W} {Hh}" role="img" aria-label="Cena zakupu R404A regenerowanego, maj–listopad 2026: od 118,00 do 142,00 zł/kg" style="display:block">']
    for g in (120,130,140):
        o.append(f'<line x1="{L}" x2="{W-R}" y1="{Y(g):.1f}" y2="{Y(g):.1f}" style="stroke:var(--edge);stroke-width:1"></line><text x="{L-6}" y="{Y(g)+3:.1f}" text-anchor="end" style="font-size:10px;fill:var(--text-tertiary)">{g}</text>')
    d=' '.join(f'{"M" if i==0 else "L"}{X(i):.1f},{Y(v):.1f}' for i,(m,v) in enumerate(PTS))
    o.append(f'<path d="{d}" style="fill:none;stroke:{SER};stroke-width:2;stroke-linejoin:round;stroke-linecap:round"></path>')
    for i,(m,v) in enumerate(PTS):
        src=' · PZ/2026/09/014' if m=='wrz' else (' · cennik Chłodpol 2 lis' if m=='lis' else ' · cennik Chłodpol')
        r=4 if m in ('wrz','lis') else 0
        o.append(f'<g><title>{m} 2026 · {v:.2f}'.replace('.',',')+f' zł/kg{src}</title><circle cx="{X(i):.1f}" cy="{Y(v):.1f}" r="10" style="fill:transparent"></circle>'
                 +(f'<circle cx="{X(i):.1f}" cy="{Y(v):.1f}" r="{r}" style="fill:{SER};stroke:var(--bg-surface);stroke-width:2"></circle>' if r else '')+'</g>')
        o.append(f'<text x="{X(i):.1f}" y="{Hh-4}" text-anchor="middle" style="font-size:10px;fill:var(--text-tertiary)">{m}</text>')
    o.append(f'<text x="{X(6)-8:.1f}" y="{Y(142)-8:.1f}" text-anchor="end" style="font-size:11px;font-weight:500;fill:var(--text-primary)">142,00</text>')
    o.append(f'<text x="{X(4):.1f}" y="{Y(128.5)+16:.1f}" text-anchor="middle" style="font-size:10px;fill:var(--text-secondary)">zakup 128,50</text>')
    o.append('</svg>'); return ''.join(o)
def chg(name,old,new,pct,tip,col='var(--warning)'):
    return (f'<div title="{tip}" style="display:grid;grid-template-columns:minmax(0,1fr) auto 52px;column-gap:8px;align-items:center;min-height:28px;padding:0 8px;font-size:12px">'
            f'<span class="ell">{name}</span><span class="num" style="color:var(--text-secondary)">{old} → <span style="color:var(--text-primary)">{new}</span></span><span class="num" style="text-align:right;color:{col}">{pct}</span></div>')
c('<aside aria-label="Cennik Chłodpol — czynniki i części" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
c('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span style="font-size:12px;color:var(--text-tertiary)">Chłodpol Gdynia · DS-001</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Czynniki i części</h2>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">186 pozycji · ceny netto · plik z e-maila dostawcy, wczytany automatycznie 2 lis 7:12 i zatwierdzony przez Agnieszkę</span></div>')
c('<section style="display:flex;flex-direction:column;gap:4px">'+ah3('Zmiany 2 lis',CNT(11))+
  chg('R449A · butla 10 kg','98,00','104,00','+6,1 %','zł/kg · 2 urządzenia w obiektach')+
  chg('R404A regenerowany','136,00','142,00','+4,4 %','zł/kg · w zapotrzebowaniu 10,9 kg')+
  chg('R32 · butla 9 kg','56,40','58,00','+2,8 %','zł/kg · w zapotrzebowaniu 9 kg')+
  chg('Presostat HP 28 bar','182,00','186,00','+2,2 %','zł/szt.')+
  '<a href="#" class="flink" style="padding:2px 8px;font-size:12px;color:var(--text-secondary)">7 kolejnych zmian, w tym 2 obniżki</a></section>')
c('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('R404A regenerowany · zł/kg')+
  '<div style="margin:0 4px;padding:10px 8px 6px;border-radius:12px;background:var(--bg-raised)">'+line()+
  '<div style="display:flex;align-items:center;gap:6px;padding:6px 4px 0;font-size:12px;color:var(--warning)">'+ic(TREND,12,'var(--warning)')+'+10,5 % od ostatniego zakupu (wrz)</div></div></section>')
c('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Ten sam czynnik u dostawców',CNT(3))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Chłodpol · cennik 2 lis','142,00 zł/kg',w=500,tip='Najniższa aktualna — wybrana w zapotrzebowaniu')+
  kv('Klimatech · oferta 11 lis','149,00 zł/kg',vc='var(--text-secondary)',tip='Z e-maila handlowca, ważna do 30 lis')+
  kv('Frigo-Serwis · Bitzer 2026','151,00 zł/kg',vc='var(--text-secondary)',tip='Cennik z 10 mar, rabat 12 % uwzględniony')+'</div></section>')
c('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Na co wpływa')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Koszt w katalogu','142,00 zł/kg',tip='Zaktualizowany po zatwierdzeniu 2 lis')+
  kv('Cena dla klienta','189,00 zł/kg',vc='var(--text-secondary)',tip='Doliczanie czynnika w protokole: koszt + marża 24,9 %')+
  kv('Wysłane oferty','bez zmian',vc='var(--text-secondary)',tip='Oferty zachowują ceny z dnia wysłania')+'</div></section>')
c('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(C)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const nZak = navv(isZak || isZkR);","const isDost = ekran === 'dostawcy'; const isCen = ekran === 'cenniki'; const nZak = navv(isZak || isZkR || isDost || isCen);")
rep("isZak, isZkR, actZak:","isZak, isZkR, isDost, isCen, actZak:")
rep('"zamówienie zakupowe", ','"zamówienie zakupowe", "dostawcy", "cenniki", ')
open(P,'w').write(s); print('ok dostawcy',len(s))
