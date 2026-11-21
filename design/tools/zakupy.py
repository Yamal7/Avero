# Zakupy: zapotrzebowanie (pogrupowane po dostawcy) i zamówienie ZK/2026/11/031 z przyjęciem dostawy. Scenariusz: piątek 20 lis 2026, 8:40.
P='design/canvas/Main.dc.html'
exec(open('design/tools/ui1.py').read())
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; AWC='#8A8F98'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
CART='<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
TREND='<path d="m22 7-8.5 8.5-5-5L2 17"></path><path d="M16 7h6v6"></path>'
SHIELD='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
BOX='<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>'
BOLT='<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>'
DL='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5M12 15V3"></path>'
CAM='<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
MAIL='<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def btn(t,tip,icon='',pri=False,h=28,grow=False):
    g='flex:1 1 auto;' if grow else ''
    if pri: return f'<button type="button" class="pri" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'
def tabs(items,cur=0):
    return ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))
def qty(v,tip): return f'<span title="{tip}" class="num" style="height:28px;min-width:64px;display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;padding:0 8px;border-radius:8px;background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong);font-weight:500">{v}</span>'
TAB_Z=[('Zapotrzebowanie','6'),('Zamówienia','4'),('Dostawcy','7'),('Cenniki','')]

# =================== ZAPOTRZEBOWANIE
COLS='104px minmax(0,1.4fr) minmax(0,1fr) 88px 84px 88px 92px 88px'
def ln(code,name,srcs,need,needtip,avail,availtip,q,qtip,price,pricetip,val,sel=False,warn=''):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{code}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0">{u_ci("drop","blue") if code.startswith("CZ-") else u_ci("box","orange")}<span class="ell" style="font-weight:500">{name}</span>{warn}</span>'
            f'<span role="cell" style="display:flex;flex-wrap:nowrap;gap:4px;min-width:0;overflow:hidden">{srcs}</span>'
            f'<span role="cell" class="num" title="{needtip}" style="font-size:12px;color:var(--text-secondary)">{need}</span>'
            f'<span role="cell" class="num" title="{availtip}" style="text-align:right;font-size:12px;color:var(--text-secondary)">{avail}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{qty(q,qtip)}</span>'
            f'<span role="cell" class="num" title="{pricetip}" style="text-align:right;color:var(--text-secondary)">{price}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-weight:500">{val}</span></div>')
def sup(name,n,terms,termstip,total,extra='',act=True):
    car=ic('<path d="m6 9 6 6 6-6"></path>',14,'var(--text-tertiary)')
    return (f'<div style="display:flex;align-items:center;gap:8px;min-height:44px;padding:4px 6px 4px 10px;margin-top:10px;border-radius:12px;background:var(--bg-raised)">{car}{ic(BLD,14,"var(--text-tertiary)")}<span style="font-weight:500">{name}</span>{CNT(n)}'
            f'<span title="{termstip}" style="font-size:12px;color:var(--text-secondary);white-space:nowrap">{terms}</span>{extra}{SP}<span class="num" title="Suma netto" style="font-weight:500">{total}</span>'
            +(btn('Utwórz zamówienie','Utwórz zamówienie ZK dla tego dostawcy — szkic do sprawdzenia przed wysłaniem',CART) if act else '')+'</div>')
srcz=lambda code,tip: obj(code,tip)
mins=lambda t,tip: sch(ic(BOX,12,'var(--text-tertiary)')+t,tip)
H=[];a=H.append
a('<sc-if value="{{isZak}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CART,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Zakupy</h1><span style="width:8px"></span>'+
  tabs(TAB_Z)+SP+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowe zamówienie','Nowe zamówienie  C',PLUS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd(ic(BOX,14,'var(--text-tertiary)')+'Magazyn główny + busy','Zapotrzebowanie liczone dla magazynu i 4 busów')+capd(ic(CAL,14,'var(--text-tertiary)')+'Potrzebne do 4 gru','Pozycje potrzebne w ciągu 2 tygodni')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Zamówienia wysłane, jeszcze nie przyjęte: ZK/2026/11/030 (Klimatech), ZK/2026/11/031 (Termo-Bud)">W drodze <span class="num" style="color:var(--text-primary);font-weight:500">16 512 zł</span></span>'
  '<span title="Przyjęte w listopadzie (PZ) · w październiku 21 760 zł">Zakupy w lis. <span class="num" style="color:var(--text-primary);font-weight:500">38 940 zł</span></span></span></div>')
a('<p style="margin:0;padding:0 20px 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Do zamówienia = potrzeby zleceń i minima − dostępne − w drodze. Rezerwacje i zamówienia w drodze nie liczą się podwójnie.</p>')
a('<div role="table" aria-label="Zapotrzebowanie" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Indeks','hash')+'</span><span>'+u_th('Pozycja','box','orange')+'</span><span>'+u_th('Skąd potrzeba','flag','violet')+'</span><span>'+u_th('Potrzebne do','cal','blue')+'</span><span style="text-align:right" title="Stan − rezerwacje + w drodze">Dostępne</span><span style="text-align:right">Zamówić</span><span style="text-align:right">Cena netto</span><span style="text-align:right">Wartość</span></div>')
a(sup('Chłodpol Gdynia',3,'· dostawa pon 23 lis','Zamówienie do 14:00 — dostawa w poniedziałek 23 lis · przelew 14 dni','2 255,80 zł'))
a(ln('CZ-R404A-R','R404A regenerowany · 10,9 kg',mins('min. 10 kg','Minimum magazynu głównego: 10 kg'),'—','Uzupełnienie minimum','3,1 kg','Stan 3,1 kg · rezerwacje 0 · w drodze 0','1 butla','10,9 kg','142,00 zł/kg','Najniższa z 2 cen · Klimatech 149,00 zł/kg','1 547,80 zł',sel=True,
   warn=sch(ic(SHIELD,12,'var(--warning)')+'tylko regenerowany','Od 2026 świeży R404A nie może służyć do serwisu instalacji chłodniczych')))
a(ln('CZ-R32-9','R32 · butla 9 kg',srcz('ZS-1045','Montaż wstrzymany — brak R32 w busie (1,8 kg)')+mins('min. 9 kg','Minimum magazynu głównego: 9 kg'),'pon 23 lis','Montaż ZS-1045 przesunięty na poniedziałek 23 lis','2,4 kg','Stan 4,2 kg − rezerwacja 1,8 kg (ZS-1045)','1 butla','9 kg — po dostawie 11,4 kg ≥ minimum','58,00 zł/kg','Cennik Chłodpol z 2 lis · ostatni zakup 56,40 zł/kg','522,00 zł'))
a(ln('P-HP-28','Presostat HP 28 bar',srcz('ZG-0912','Wymieniony w Hotelu Oliwskim 13 lis — zużyty jedyny')+mins('min. 2','Minimum magazynu: 2 szt.'),'—','Uzupełnienie minimum','1 szt.','Stan 0 + w drodze 1 (ZK/2026/11/030)','1 szt.','Do minimum 2 szt.','186,00 zł','Chłodpol, cennik z 2 lis','186,00 zł'))
a(sup('Klimatech Gdańsk',2,'· dostawa pon 23 lis','Zamówienie do 15:00 · darmowa dostawa od 800 zł netto','913,00 zł',sch(ic(CHECK,12,'var(--success)')+'darmowa dostawa','Powyżej progu 800 zł')))
a(ln('POMPKA-SK','Pompka skroplin do klimatyzatora',srcz('ZG-0923','Biuro Bilans — klimatyzator kapie, wizyta wt 24 lis'),'wt 24 lis','Wizyta: wtorek 24 lis, 10:00 · Mateusz','0 szt.','Brak w magazynie i w busach','1 szt.','Do zgłoszenia ZG-0923','289,00 zł','Klimatech · Chłodpol nie ma w ofercie','289,00 zł'))
a(ln('RURA-CU-1438','Rura Cu 1/4″ + 3/8″ izolowana · 20 m',mins('min. 3','Minimum magazynu: 3 krążki'),'—','Uzupełnienie minimum','1 szt.','Stan 1 · busy mają po 1','2 szt.','Do minimum 3 szt.','312,00 zł','Klimatech · Chłodpol 318,00 zł','624,00 zł'))
a(sup('Termo-Bud Pomorze',1,'· dostawa wt 24 lis','Dostawa w ciągu 2 dni roboczych · darmowa od 500 zł netto','296,00 zł',sch('brakuje 204 zł do darmowej','Dołóż: glikol 20 l — za 2 tygodnie spadnie poniżej minimum',col='var(--warning)')))
a(ln('GB-3BAR','Grupa bezpieczeństwa 3 bar',srcz('ZS-1052','Montaż pompy ciepła 30 lis — zarezerwowana ostatnia')+mins('min. 2','Minimum magazynu: 2 szt.'),'pon 30 lis','Montaż ZS-1052: poniedziałek 30 lis','0 szt.','Stan 1 − rezerwacja 1 (ZS-1052)','2 szt.','Do minimum 2 szt.','148,00 zł','Termo-Bud, cennik z 15 paź','296,00 zł'))
a('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-secondary)"><span>6 pozycji · 3 dostawców</span>'+SP+'<span>Razem netto <span class="num" style="color:var(--text-primary);font-weight:600">3 464,80 zł</span></span></div>')
a('</div></div>')
# aside: pozycja R404A
a('<aside aria-label="Pozycja R404A regenerowany" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">CZ-R404A-R</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">R404A regenerowany · butla 10,9 kg</h2><span style="font-size:12px;color:var(--text-secondary)">Czynnik chłodniczy · GWP 3922 · butla zwrotna</span></div>')
a('<div role="note" style="display:flex;gap:10px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(SHIELD,16,'var(--warning)')+'<div style="display:flex;flex-direction:column;gap:4px"><span style="font-weight:500">Tylko regenerowany lub z recyklingu</span>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Świeży R404A (GWP powyżej 2500) jest zakazany do serwisu urządzeń chłodniczych. Regenerowany wolno stosować do końca 2029 r. Avero nie wyda świeżego R404A na zlecenie.</span>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Przy przyjęciu PZ wymagany certyfikat regeneracji.</span></div></div>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Ceny zakupu',CNT(3))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Chłodpol · cennik 2 lis','142,00 zł/kg',w=500,tip='Wybrana — najniższa aktualna')+kv('Klimatech · oferta 11 lis','149,00 zł/kg',vc='var(--text-secondary)',tip='Z e-maila handlowca, ważna do 30 lis')+
  kv('Ostatni zakup · PZ/2026/09/014','128,50 zł/kg',vc='var(--text-secondary)',tip='Chłodpol, 22 wrz')+
  '<div style="display:flex;align-items:center;gap:6px;padding-top:6px;font-size:12px;color:var(--warning)">'+ic(TREND,12,'var(--warning)')+'+10,5 % od września</div></div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Stan')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('Magazyn główny','3,1 kg',tip='Półka C-2')+kv('Busy','0,0 kg',vc='var(--text-secondary)')+kv('Rezerwacje','0,0 kg',vc='var(--text-secondary)')+kv('Minimum','10,0 kg',tip='Ustawione w Magazynie')+kv('Po dostawie','14,0 kg',w=500,tip='3,1 + 10,9 kg')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Urządzenia z tym czynnikiem',CNT(3))+
  prop(SNOW if 'SNOW' in dir() else BOX,'Hotel Oliwski · agregat UR-2304','12,5 kg · 49,0 t CO₂e · kontrola co 12 mies. · po terminie od 15 lis')+
  prop(BOX,'Delikatesy Morskie · lodziarka UR-3107','5,4 kg · 21,2 t CO₂e · lead na wymianę na R290')+
  prop(BOX,'Restauracja Przystań · schładzacz UR-3021','2,1 kg · 8,2 t CO₂e')+'</section>')
a('</aside></div></sc-if>')

# =================== ZAMÓWIENIE ZK/2026/11/031
K=[];k=K.append
k('<sc-if value="{{isZkR}}" hint-placeholder-val="{{false}}">')
k('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CART,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Zakupy</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Zamówienia</a>'+ic(CHEV,14,'var(--text-tertiary)')+
  '<h1 class="mono" style="margin:0;font-size:13px;line-height:20px;font-weight:500">ZK/2026/11/031</h1>'+SP+ib('Pobierz PDF zamówienia','PDF zamówienia',DL)+ib('Kopiuj link','Kopiuj link',LINK)+ib('Więcej akcji','Więcej akcji',DOTS)+'</div>')
k('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
k('<div style="display:flex;flex-direction:column;gap:12px;padding:12px 24px 16px"><div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Termo-Bud Pomorze · pompa ciepła dla ZS-1052</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(BLD,'Termo-Bud Pomorze','Gdańsk, Budowlanych 19 · dostawca DS-007')+meta(WRENCH,'ZS-1052 · Marek Zieliński','Montaż pon 30 lis – wt 1 gru')+meta(USER,'Agnieszka','Utworzyła i wysłała')+'</div></div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd(ic(TRUCK,14,'var(--warning)')+'Dostawa dziś · 8:20','Kurier dostawcy przyjechał 8:20 · WZ dostawcy 4471/11')+capd('<span class="num" style="font-weight:500">16 170,00 zł</span><span style="color:var(--text-tertiary)">netto</span>','19 889,10 zł brutto (VAT 23 %)')+capd(ic(CAL,14,'var(--text-tertiary)')+'Zapas do montażu 10 dni','Montaż 30 lis — dostawa była potrzebna najpóźniej 27 lis')+'</div></div>')
def ph(t,tm,k):
    d={'done':'<span style="width:8px;height:8px;border-radius:50%;background:var(--success)"></span>','cur':'<span style="width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--text-primary)"></span>','todo':'<span style="width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)"></span>'}[k]
    line=f'<span style="flex:1 1 auto;height:1.5px;background:{"var(--success)" if k=="done" else "var(--edge)"}"></span>'
    return f'<span style="flex:1 1 0;display:flex;flex-direction:column;gap:4px;min-width:0"><span style="display:flex;align-items:center;gap:6px;height:14px">{d}{line}</span><span style="font-size:12px;line-height:16px;color:{"var(--text-tertiary)" if k=="todo" else "var(--text-primary)"};font-weight:{500 if k=="cur" else 400}">{t}</span><span class="num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{tm}</span></span>'
k('<div aria-label="Status zamówienia" style="display:flex;gap:6px;margin:0 24px 20px;padding:12px 16px;border-radius:12px;background:var(--bg-raised)">'+
  ph('Szkic','18 lis 14:52','done')+ph('Wysłane','18 lis 15:10','done')+ph('Potwierdzone','19 lis 8:05','done')+ph('Przyjęcie','dziś 8:20','cur')+ph('Faktura','z KSeF','todo')+ph('Rozliczone','płatność 14 dni','todo')+'</div>')
RC='112px minmax(0,1.6fr) 72px 88px 88px 96px 132px'
def rrow(name,code,ordq,conf,got,price,stat,extra=''):
    return (f'<div role="row" style="display:grid;grid-template-columns:{RC};column-gap:12px;align-items:center;min-height:36px;padding:0 10px;border-radius:10px">'
            f'<span role="cell" class="mono ell" title="{code}" style="font-size:11px;color:var(--text-tertiary)">{code.split(" · ")[0]}</span>'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0"><span class="ell" style="font-weight:500">{name}</span>{extra}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{ordq}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{conf}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{got}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{price}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{stat}</span></div>')
ok_=lambda t='zgodne': sch(ic(CHECK,12,'var(--success)')+t,'Ilość przyjęta = zamówiona')
k('<section aria-label="Przyjęcie dostawy" style="display:flex;flex-direction:column;gap:6px;padding:0 16px 24px">')
k('<div style="display:flex;align-items:center;gap:8px;padding:0 8px;height:28px">'+h3('Przyjęcie dostawy')+'<span style="font-size:12px;color:var(--text-tertiary)">WZ dostawcy 4471/11 · kurier 8:20</span>'+SP+ib('Zdjęcie dokumentu dostawy','Dołącz zdjęcie WZ dostawcy',CAM if 'CAM' in dir() else FILE,24)+'</div>')
k(f'<div role="row" style="display:grid;grid-template-columns:{RC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Indeks','hash')+'</span><span>'+u_th('Pozycja','box','orange')+'</span><span style="text-align:right">Zamówiono</span><span style="text-align:right">Potwierdzono</span><span style="text-align:right">Przyjmuję</span><span style="text-align:right">Cena netto</span><span style="text-align:right">Stan</span></div>')
sn=('<span style="display:flex;align-items:center;gap:6px;flex:0 0 auto">'+u_ci('hash','violet',12)+''
    '<span class="mono" title="Wymagany — trafi na kartę urządzenia i do gwarancji" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border-radius:8px;background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong);font-size:12px">E8 2611 04573</span>'+ic(CHECK,12,'var(--success)')+'</span>')
k(rrow('Daikin Altherma 3 R · jednostka zewnętrzna 8 kW','ERGA08EV · R32 1,5 kg','1 szt.','1 szt.',qty('1 szt.','Przyjęto całość'),'15 480,00 zł',ok_(),sn))
k(rrow('Fundament betonowy 1000 mm','FUND-1000','1 szt.','1 szt.',qty('1 szt.','Przyjęto całość'),'420,00 zł',ok_()))
k(rrow('Podkładki antywibracyjne · komplet 4 szt.','AV-PAD-4','1 kpl','1 kpl',qty('0 kpl','Nie dotarły'),'270,00 zł',sch(ic(WARN,12,'var(--warning)')+'brak · 24 lis','Dostawca potwierdził telefonicznie: dosłanie wtorek 24 lis · montaż 30 lis nie jest zagrożony',col='var(--warning)')))
k('<div style="display:flex;align-items:center;gap:8px;padding:10px 10px 0;border-top:1px solid var(--edge);margin-top:4px;font-size:12px;color:var(--text-secondary)"><span>Przyjmujesz 2 z 3 pozycji · <span class="num">15 900,00 zł</span> netto</span>'+SP+'<span>Zamówienie <span class="num" style="color:var(--text-primary);font-weight:500">16 170,00 zł</span></span></div>')
k('<div style="display:flex;flex-direction:column;gap:6px;margin:12px 0 0;padding:12px;border-radius:12px;background:var(--bg-raised)"><span style="font-size:12px;font-weight:500;color:var(--text-secondary)">Po zatwierdzeniu Avero</span>'
  +''.join(f'<div style="display:flex;align-items:center;gap:8px">{ic(i,14,"var(--text-tertiary)")}<span style="flex:1 1 auto">{t}</span>{c}</div>' for i,t,c in [
    (FILE,'Utworzy przyjęcie do magazynu głównego',obj('PZ/2026/11/019','Dokument PZ · 2 pozycje')),
    (LOCK,'Zarezerwuje przyjęte pozycje dla zlecenia',obj('ZS-1052','Rezerwacja pod montaż 30 lis')),
    (BOX,'Założy kartę urządzenia z numerem seryjnym',obj('UR-4127','Pompa ciepła Marka Zielińskiego · gwarancja od uruchomienia')),
    (CLOCK,'Zostawi otwartą pozycję i przypomni 24 lis',sch('AV-PAD-4','Podkładki antywibracyjne — dosłanie'))])+'</div>')
k('<div style="display:flex;gap:6px;padding-top:12px">'+btn('Zgłoś rozbieżność…','Uszkodzenie, inna ilość, inny towar — wiadomość do dostawcy  ⇧R',h=32)+SP+btn('Przyjmij 2 z 3 pozycji','Utwórz PZ/2026/11/019, rezerwację i kartę urządzenia  ⌘↵',CHECK,pri=True,h=32)+'</div>')
k('</section></div>')
k('<aside aria-label="Szczegóły zamówienia" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Dostawca')+
  prop(BLD,'Termo-Bud Pomorze','DS-007 · Gdańsk, Budowlanych 19 · NIP z rejestru dostawców')+
  prop(USER,'Kamil Nowicki · handlowiec','k.nowicki@termo-bud.pl · +48 58 520 40 17',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+
  prop(CLOCK,'Przelew 14 dni · dostawa 2 dni rob.','Darmowa dostawa od 500 zł netto · rabat 18 % od cennika Daikin')+'</section>')
k('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Wartość')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Netto','16 170,00 zł',w=500)+kv('VAT 23 %','3 719,10 zł',vc='var(--text-secondary)')+kv('Brutto','19 889,10 zł')+
  kv('W kosztach ZS-1052','16 170,00 zł',vc='var(--text-secondary)',tip='Koszt materiałów zlecenia — wynik zlecenia w Raportach')+'</div></section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Faktura zakupowa')+
  prop(FILE,'Czeka na fakturę z KSeF','Avero pobierze ją automatycznie i dopasuje po numerze ZK i NIP',sch('oczekuje','Zwykle 1–2 dni po dostawie'),plain=True)+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Historia',CNT(4))+
  '<ol style="margin:0;padding:4px 8px;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:12px;line-height:16px">'+
  ''.join(f'<li style="display:flex;gap:8px">{ic(i,14,"var(--text-tertiary)")}<span style="flex:1 1 auto;color:var(--text-secondary)">{t}</span><span class="num" style="color:var(--text-tertiary);white-space:nowrap">{tm}</span></li>' for i,t,tm in [
    (TRUCK,'Dostawa · kurier, WZ 4471/11','dziś 8:20'),
    (CHECK,'Dostawca potwierdził termin 20 lis','19 lis 8:05'),
    (MAIL,'Wysłano do k.nowicki@termo-bud.pl','18 lis 15:10'),
    (BOLT,'Szkic z akceptacji oferty OF-2026-118','18 lis 14:52')])+'</ol></section>')
k('</aside></div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isZak = ekran === 'zakupy'; const isZkR = ekran === 'zamówienie zakupowe'; const nZak = navv(isZak || isZkR);")
rep("isFV, actFV:","isZak, isZkR, actZak: nZak.act, colZak: nZak.col, wZak: nZak.w, isFV, actFV:")
rep('"szansa", "planowanie"]','"szansa", "zakupy", "zamówienie zakupowe", "planowanie"]')
i=s.find('font-weight:400">Zakupy</span>'); a0=s.rfind('<a href="#" class="nav"',0,i); assert '</a>' not in s[a0:i]
e=s.find('</a>',i); seg=s[a0:e]
seg=seg.replace('class="nav"','class="nav {{actZak}}"',1).replace('color:var(--text-secondary)">','color:{{colZak}}">',1).replace('font-weight:400">Zakupy','font-weight:{{wZak}}">Zakupy')
assert '{{colZak}}' in seg; s=s[:a0]+seg+s[e:]
open(P,'w').write(s); print('ok zakupy',len(s))
