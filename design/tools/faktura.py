P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
RECEIPT='<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path>'
HOME='<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'
SEND2='<path d="M14.54 21.69a.5.5 0 0 0 .93-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.93l7.93 3.18a2 2 0 0 1 1.11 1.11z"></path><path d="m21.85 2.15-10.94 10.94"></path>'
CARD='<rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path>'
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
CLOUD='<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>'
SIGN='<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-surface)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def line(icon,icol,txt,right='',tip=''):
    return (f'<div title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:36px;padding:2px 8px;border-radius:10px">'
            f'<span style="display:inline-flex">{ic(icon,16,icol)}</span><span class="ell" style="flex:0 1 auto">{txt}</span>{SP}{right}</div>')
def card(inner,pad='8px 4px'): return f'<div style="display:flex;flex-direction:column;padding:{pad};border-radius:12px;background:var(--bg-raised)">{inner}</div>'
H=[];a=H.append
a('<sc-if value="{{isFV}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(RECEIPT,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Finanse</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Faktury</a>'+ic(CHEV,14,'var(--text-tertiary)')+
  '<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">FV/2026/12/003</h1>'+obj('ZS-1052','Faktura do zlecenia ZS-1052 · protokół odbioru podpisany 1 gru 14:20','var(--bg-subtle)')+
  SP+ib('Duplikuj','Duplikuj  ⌘D',FILE)+ib('Więcej akcji','Więcej akcji',DOTS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
draft='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" stroke-dasharray="2.2 1.6" style="stroke:var(--text-tertiary)"></circle></svg>'
a('<div style="display:flex;align-items:flex-start;gap:16px;padding:12px 24px 20px"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">'
  '<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Faktura końcowa · montaż pompy ciepła</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(HOME,'Marek Zieliński','Osoba fizyczna, bez NIP · faktura na żądanie z akceptacji oferty')+meta(PIN,'Dębogórska 31, 84-230 Rumia','Adres nabywcy')+'</div></div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd(draft+'Szkic','Status  S')+capd(ic(LAYERS if 'LAYERS' in globals() else FILE,14,'var(--text-tertiary)')+'Końcowa','Rozlicza zaliczkę FZ/2026/11/014 (art. 106f ust. 3)')+
  capd(ic(CAL,14,'var(--text-tertiary)')+'Wykonano 1 gru','Data wykonania usługi = data odbioru')+capd(ic(CLOCK,14,'var(--text-tertiary)')+'Termin 8 gru','Termin płatności: 7 dni')+
  capd(ic(CLOUD,14,'var(--text-tertiary)')+'Poza KSeF','Faktura dla konsumenta (B2C): wysyłka do KSeF jest dobrowolna. Klient dostanie PDF e-mailem.')+'</div></div>'
  '<div style="display:flex;gap:8px;flex:0 0 auto"><button type="button" class="sec" title="Podgląd PDF  ⌘P" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(EYE,14)+'Podgląd PDF</button>'
  '<button type="button" class="pri" title="Wystaw i wyślij klientowi z linkiem do płatności  ⌘↵" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(SEND2,14)+'Wystaw i wyślij</button></div></div>')
a('<div style="display:flex;flex-direction:column;gap:28px;padding:0 24px 32px;max-width:960px">')
# check
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Sprawdzenie',sch(dot('var(--success)')+'4 z 4','Faktura gotowa do wystawienia'))+
  card(line(CHECK,'var(--success)','Pozycje zgodne z protokołem odbioru',obj('PR/2026/12/007','Protokół uruchomienia i odbioru · podpis klienta 1 gru 14:20'),'Ilości z protokołu = ilości z oferty, bez dopłat')+
       line(CHECK,'var(--success)','Zaliczka rozliczona w podstawie i VAT',obj('FZ/2026/11/014','Faktura zaliczkowa z 18 lis'),'Wartość netto i VAT pomniejszone o zaliczkę, nie tylko kwota do zapłaty')+
       line(CHECK,'var(--success)','Stawka VAT 8 % dla całego świadczenia',sch('dom 160 m²','Dostawa z montażem w budynku mieszkalnym','var(--bg-surface)'))+
       line(CHECK,'var(--success)','Wysyłka',sch(ic(SEND2,12,'var(--text-tertiary)')+'e-mail + link P24','PDF na m.zielinski@poczta.onet.pl, link do płatności BLIK / karta / przelew','var(--bg-surface)')))+'</section>')
# positions
COLS='minmax(0,1fr) 64px 104px 56px 112px'
def r(n,q,u,pr,val,grp=False):
    if grp:
        return f'<div role="row" style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;margin-top:4px;font-size:12px;color:var(--text-tertiary)">{n}</div>'
    return (f'<div role="row" class="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;align-items:center;min-height:36px;padding:0 8px;border-radius:10px">'
            f'<span role="cell" class="ell">{n}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{q} <span style="color:var(--text-tertiary)">{u}</span></span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{pr}</span><span role="cell" class="num" style="text-align:right;color:var(--text-tertiary)">8 %</span>'
            f'<span role="cell" class="num" style="text-align:right;font-weight:500">{val}</span></div>')
rows=[('Urządzenia',)*1,('Jednostka zewnętrzna Daikin ERGA08EV','1','szt.','14 900,00','14 900,00'),('Moduł wewnętrzny EHVH08S23E6V','1','szt.','16 200,00','16 200,00'),('Sterownik Madoka + moduł Wi-Fi','1','kpl','1 150,00','1 150,00'),
      ('Materiały i armatura',),('Bufor 50 l z osprzętem','1','kpl','2 380,00','2 380,00'),('Instalacja chłodnicza 3/8″ + 5/8″','8','m','95,00','760,00'),('Armatura: filtr, zawory, naczynie 18 l','1','kpl','1 640,00','1 640,00'),('Fundament + antywibracja','1','kpl','690,00','690,00'),
      ('Robocizna',),('Montaż i podłączenie hydrauliczne','1','usł.','4 800,00','4 800,00'),('Uruchomienie, próba szczelności','1','usł.','900,00','900,00'),('Demontaż kotła gazowego','1','usł.','600,00','600,00')]
body=''.join(r(x[0],None,None,None,None,True) if len(x)==1 else r(*x) for x in rows)
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Pozycje',CNT(10)+SP+sch(ic(FILE,12,'var(--text-tertiary)')+'z OF-2026-118','Pozycje przeniesione z oferty, wariant B, ilości potwierdzone protokołem'))+
  '<div role="table" aria-label="Pozycje faktury" style="display:flex;flex-direction:column">'
  f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:12px;height:24px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)"><span>Nazwa</span><span style="text-align:right">Ilość</span><span style="text-align:right">Cena netto</span><span style="text-align:right">VAT</span><span style="text-align:right">Wartość netto</span></div>'+body+'</div></section>')
# settlement table
SC='minmax(0,1fr) 120px 104px 128px'
def sr(lbl,n,v,b,strong=False,neg=False,tip='',bg=''):
    w=600 if strong else 400; c='var(--text-primary)'
    return (f'<div role="row" title="{tip}" style="display:grid;grid-template-columns:{SC};column-gap:12px;align-items:center;min-height:{40 if strong else 36}px;padding:0 12px;border-radius:10px;{bg}">'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;font-weight:{500 if strong else 400}">{lbl}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:{c};font-weight:{w if strong else 400}">{n}</span><span role="cell" class="num" style="text-align:right;font-weight:{w if strong else 400}">{v}</span><span role="cell" class="num" style="text-align:right;font-weight:{w}">{b}</span></div>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Rozliczenie zaliczki',SP+sch(ic(INFO,12,'var(--text-tertiary)')+'art. 106f ust. 3','Faktura końcowa pomniejsza wartość sprzedaży i kwotę VAT o zaliczkę i podaje numer faktury zaliczkowej'))+
  '<div role="table" aria-label="Rozliczenie zaliczki" style="display:flex;flex-direction:column;padding:6px 4px;border-radius:12px;background:var(--bg-raised)">'
  f'<div role="row" style="display:grid;grid-template-columns:{SC};column-gap:12px;height:24px;align-items:center;padding:0 12px;font-size:12px;color:var(--text-tertiary)"><span></span><span style="text-align:right">Netto</span><span style="text-align:right">VAT 8 %</span><span style="text-align:right">Brutto</span></div>'+
  sr('Wartość całego zamówienia','44 020,00','3 521,60','47 541,60')+
  sr(obj('FZ/2026/11/014','Faktura zaliczkowa z 18 lis 2026 · opłacona BLIK')+'<span style="color:var(--text-secondary)">zaliczka</span>','−13 206,00','−1 056,48','−14 262,48',tip='Zaliczka 14 262,48 zł brutto = 13 206,00 netto + 1 056,48 VAT')+
  '<div style="height:1px;margin:4px 12px;background:var(--edge)"></div>'+
  sr('Do zapłaty','30 814,00','2 465,12','33 279,12 zł',strong=True,bg='background:var(--bg-surface);')+
  '</div></section>')
a('</div></div>')
# aside
a('<aside aria-label="Podsumowanie faktury FV/2026/12/003" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Do zapłaty')+
  '<div style="display:flex;flex-direction:column;gap:10px;margin:0 4px;padding:12px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:baseline;justify-content:space-between"><span class="num" style="font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.015em">33 279,12 zł</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">do 8 gru</span></div>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px">'+sch(ic(CARD,12,'var(--text-tertiary)')+'Link P24','Link do płatności Przelewy24: BLIK, przelew, karta, Apple Pay, Google Pay','var(--bg-surface)')+sch('Przelew','Numer konta z ustawień firmy','var(--bg-surface)')+'</div>'
  '<div style="display:flex;flex-direction:column;gap:2px">'+kv('Zapłacono','14 262,48 zł',tip='Zaliczka 18 lis · BLIK')+kv('Wartość zamówienia','47 541,60 zł')+'</div></div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Nabywca i sprzedawca')+
  prop(HOME,'Marek Zieliński','Osoba fizyczna nieprowadząca działalności · bez NIP')+prop(BLD,'Kranz HVACR','Dane sprzedawcy, NIP i konto z Ustawień → Firma',sch('z ustawień','Edytuj w Ustawieniach'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Powiązane',CNT(4))+
  prop(WRENCH,'ZS-1052 · Montaż pompy ciepła','Zlecenie · zakończone 1 gru',obj('ZS-1052','Zlecenie','var(--bg-subtle)'))+
  prop(FILE,'Oferta, wariant B','Zaakceptowana 18 lis',obj('OF-2026-118','Oferta','var(--bg-subtle)'))+
  prop(SIGN,'Protokół odbioru','Podpis klienta 1 gru 14:20 · PDF dołączony do e-maila',obj('PR/2026/12/007','Protokół','var(--bg-subtle)'))+
  prop(BOX,'Pompa ciepła UR-4127','Karta urządzenia z protokołu uruchomienia',obj('UR-4127','Urządzenie','var(--bg-subtle)'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Po wystawieniu')+
  prop(CYC,'Przegląd roczny','Gwarancja 5 lat wymaga przeglądu co 12 mies. · klient nie wybrał umowy serwisowej',sch(ic(CAL,12,'var(--text-tertiary)')+'1 gru 2027','Avero doda UR-4127 do przeglądów i przypomni klientowi miesiąc wcześniej'))+
  prop(SEND2,'Propozycja umowy serwisowej','E-mail z ofertą przeglądu rocznego 590,00 zł netto, 14 dni po montażu',sch('15 gru','Zaplanowana wysyłka'))+'</section>')
a('</aside></div></sc-if>')
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isOf = ekran === 'oferta';","const isFV = ekran === 'faktura'; const nFV = navv(isFV); const isOf = ekran === 'oferta';")
rep("isOf, isOfP:","isFV, actFV: nFV.act, colFV: nFV.col, wFV: nFV.w, selFV: nFV.sel, isOf, isOfP:")
rep('"oferta", "planowanie"]','"oferta", "faktura", "planowanie"]')
old='<a href="#" class="nav" style="display:flex;align-items:center;gap:8px;height:28px;padding:0 8px;border-radius:8px;color:var(--text-secondary)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path></svg><span class="ell" style="flex:1 1 auto;font-weight:400">Faktury</span></a>'
new=old.replace('class="nav"','class="nav {{actFV}}" title="G F"').replace('color:var(--text-secondary)">','color:{{colFV}}">',1).replace('font-weight:400">Faktury','font-weight:{{wFV}}">Faktury')
rep(old,new)
zt=s.index('<button type="button" role="tab" aria-selected="{{selZl}}"'); zte=s.index('</button>',zt)+9
tab=('\n<sc-if value="{{isFV}}" hint-placeholder-val="{{false}}"><button type="button" role="tab" aria-selected="{{selFV}}" class="dtab {{actFV}}" title="FV/2026/12/003 · faktura końcowa" style="flex:0 1 auto;min-width:0;max-width:200px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:8px;color:{{colFV}};font-size:12px;font-weight:{{wFV}}">'+ic(RECEIPT,14)+'<span class="ell">FV/2026/12/003</span></button></sc-if>')
s=s[:zte]+tab+s[zte:]
open(P,'w').write(s); print('ok',len(s))
