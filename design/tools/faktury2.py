# Faktury › Wszystkie (rejestr miesiąca, KSeF, eksport do księgowości) i Faktury › Zaliczki (wezwania, FZ, rozliczenie).
# Scenariusz: czwartek 19 lis 2026, 16:00.
SRC_F=open('design/tools/faktury.py').read()
exec(SRC_F.split("# =================== NALEŻNOŚCI")[0])
P='design/canvas/Main.dc.html'; s=open(P).read()
def head2(cur,right):
    return ('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(WALLET,16,'var(--text-secondary)')+
            '<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Faktury</h1><span style="width:8px"></span>'+
            tabs([('Należności','11'),('Do wystawienia','5'),('Wszystkie',''),('Zaliczki','4')],cur)+SP+right+'</div>')
CLOUD='<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>'
EXPORT='<path d="M12 3v12M7 8l5-5 5 5"></path><path d="M5 21h14"></path>'
# =================== WSZYSTKIE
AC='132px 20px minmax(0,1.4fr) 92px 92px 92px 168px'
DOCT={'FV':('receipt','green','Faktura VAT'),'FK':('ret','red','Faktura korygująca'),'FZ':('coin','violet','Faktura zaliczkowa')}
def arow(no,kind,cli,date_,net,gross,ks,kstip,sel=False,muted=False,warn=False):
    bg='background:var(--bg-subtle);' if sel else ''
    op='opacity:.6;' if muted else ''
    di,dc,dt=DOCT[no[:2]]
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{AC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}{op}">'
            f'<span role="cell" style="display:flex;align-items:center;gap:6px;min-width:0"><span title="{dt}" style="display:inline-flex">{u_ci(di,dc)}</span><span class="mono ell" style="font-size:11px">{no}</span></span>'
            f'<span role="cell" style="display:flex">{u_logo(cli)}</span>'
            f'<span role="cell" class="ell" title="{cli} · {kind}" style="color:var(--text-secondary)">{kind}</span>'
            f'<span role="cell" class="num" style="font-size:12px;color:var(--text-secondary)">{date_}</span>'
            f'<span role="cell" class="num" style="text-align:right">{net}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{gross}</span>'
            f'<span role="cell" title="{kstip}" style="display:flex;min-width:0;font-size:12px;padding-left:12px">{ks}</span></div>')
ksok=lambda t: f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap">{ic(CHECK,14,"var(--success)")}<span class="ell">{t}</span></span>'
ksb2c=lambda: f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:var(--text-tertiary)">{ic(MAIL,14,"var(--text-tertiary)")}poza KSeF · e-mail</span>'
kserr=lambda t: f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:var(--danger)">{ic(WARN,14,"var(--danger)")}<span class="ell">{t}</span></span>'
A=[];a=A.append
a('<sc-if value="{{isFkA}}" hint-placeholder-val="{{false}}">')
a(head2(2,capd(ic(CAL,14,'var(--text-tertiary)')+'Listopad 2026','Okres wg daty wystawienia · ← → poprzedni / następny miesiąc')+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowa faktura','Nowa faktura  C',PLUS)))
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd('Wszystkie rodzaje','Faktury, zaliczkowe, korygujące')+capd(ic(CLOUD,14,'var(--text-tertiary)')+'KSeF: wszystkie','Przyjęte, poza KSeF, błąd')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)"><span>34 dokumenty</span><span>Netto <span class="num" style="color:var(--text-primary);font-weight:500">248 916 zł</span></span></span></div>')
a('<div role="table" aria-label="Faktury z listopada" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{AC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('Numer','hash')+u_th('','bld','indigo',tip='Nabywca')+u_th('Opis','text','violet')+u_th('Wystawiona','cal','blue')+u_th('Netto','coin','yellow','right')+u_th('Brutto','coin','orange','right')+'<span style="padding-left:12px">'+u_th('KSeF','send','teal')+'</span></div>')
a(arow('FK/2026/11/003','korekta do FV/2026/11/018 · rabat po reklamacji','Restauracja Przystań','19 lis','−120,00','−147,60',kserr('odrzucona: data sprzedaży'),'KSeF odrzucił dokument 19 lis 15:12 — data sprzedaży późniejsza niż data wystawienia faktury korygowanej. Popraw i wyślij ponownie.',warn=True))
a(arow('FV/2026/11/031','transza 40 % · PJ-2026-011','Hotel Bryza','9 lis','194 400,00','239 112,00',ksok('przyjęta · 9 lis 11:42'),'Numer KSeF w szczegółach faktury',sel=False))
a(arow('FV/2026/11/024','montaż klimatyzacji · ZS-1041','Biuro Bilans','18 lis','3 990,00','4 907,70',ksok('przyjęta · 18 lis 16:05'),'Numer KSeF w szczegółach faktury'))
a(arow('FV/2026/11/023','przegląd i czyszczenie · ZS-1050','Joanna Lewicka','17 lis','420,00','453,60',ksb2c(),'Osoba prywatna — faktura e-mailem z linkiem do płatności (KSeF dobrowolny dla B2C)'))
a(arow('FZ/2026/11/014','zaliczka 30 % · OF-2026-118','Marek Zieliński','18 lis','13 206,00','14 262,48',ksb2c(),'Osoba prywatna — zaliczka zapłacona BLIK 18 lis'))
a(arow('FV/2026/11/015','naprawa · ZS-1031','Przychodnia Zdrowie','1 lis','1 146,34','1 410,00',ksok('przyjęta · 1 lis 9:20'),''))
a(arow('FV/2026/11/012','wymiana parownika · ZS-1022','Hotel Oliwski','22 paź → 5 lis','3 821,14','4 700,00',ksok('przyjęta'),'Termin płatności 5 lis'))
a(arow('FV/2026/11/006','przegląd i naprawa · ZS-1018','Kancelaria Wit','18 paź → 1 lis','4 032,52','4 960,00',ksok('przyjęta'),'Zapłacona 19 lis — wpłata dopasowana',muted=True))
a('<a href="#" class="flink" style="padding:8px 10px 0;font-size:12px;color:var(--text-secondary)">26 kolejnych z listopada</a>')
a('</div></div>')
# panel: miesiąc i eksport
a('<aside aria-label="Listopad 2026 — podsumowanie i eksport" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span style="font-size:12px;color:var(--text-tertiary)">Do 19 lis</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Listopad 2026</h2></div>')
a('<section style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Sprzedaż netto','248 916,00 zł',w=500)+kv('VAT należny','56 186,27 zł',vc='var(--text-secondary)',tip='23 % i 8 % (pompy ciepła w budynkach mieszkalnych)')+kv('Dokumenty','31 FV · 2 FZ · 1 FK',vc='var(--text-secondary)')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('KSeF')+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Przyjęte','27',vc='var(--text-secondary)')+kv('Poza KSeF (B2C)','6',vc='var(--text-secondary)',tip='Osoby prywatne — e-mail z linkiem do płatności')+'</div>'+
  '<div style="display:flex;align-items:center;gap:8px;min-height:32px;padding:0 8px;font-size:12px;color:var(--danger)">'+ic(WARN,14,'var(--danger)')+'<span style="flex:1 1 auto">1 odrzucona — FK/2026/11/003</span><a href="#" class="flink" style="color:var(--text-secondary)">Popraw</a></div>'+
  '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Połączenie z KSeF: token w zmiennej środowiskowej KSEF_TOKEN, ważny do 31 gru 2026.</span></section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Eksport do biura rachunkowego')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Odbiorca','Biuro Rachunkowe Saldo',vc='var(--text-secondary)',tip='biuro@saldo-gdynia.pl · Ustawienia › Integracje')+kv('Format','JPK_FA + PDF',vc='var(--text-secondary)')+
  kv('Ostatni eksport','październik · 3 lis',vc='var(--text-secondary)',tip='Wysłany 3 lis 8:10 po zatwierdzeniu przez Pascala')+kv('Następny','listopad · 2 gru',vc='var(--text-secondary)',tip='Szkic paczki 1 gru; wysyłka po zatwierdzeniu')+'</div>'
  '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Paczka nie wyjdzie, dopóki jest odrzucona faktura w KSeF.</span></section>')
a('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+btn('Pobierz zestawienie miesiąca','XLSX z listą dokumentów, KSeF i płatnościami  ⌘E',DL,h=32)+'</div>')
a('</aside></div></sc-if>')

def step(icon,col,date_,title,body,state='done'):
    c={'done':'var(--text-secondary)','cur':'var(--text-primary)','todo':'var(--text-tertiary)'}[state]
    return (f'<div style="display:grid;grid-template-columns:18px 52px minmax(0,1fr);column-gap:8px;padding:6px 0">{ic(icon,14,col)}<span class="num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{date_}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:12px;line-height:16px;color:{c};{"font-weight:500" if state=="cur" else ""}">{title}</span>{f"<span style=\"font-size:12px;line-height:16px;color:var(--text-tertiary)\">{body}</span>" if body else ""}</span></div>')
# =================== ZALICZKI
ZC='20px 120px minmax(0,1.5fr) 104px 136px minmax(0,1.2fr)'
def zrow(title,ref,cli,amount,amtip,st,sttip,settle,settletip,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    k='pc' if 'Pomp' in title else ('vrf' if 'VRV' in title else ('chł' if 'serwerowni' in title else 'klima'))
    return (f'<div role="row" class="row row1" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{ZC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell" style="display:flex">{u_logo(cli)}</span>'
            f'<span role="cell" class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{ref}</span>'
            f'<span role="cell" title="{cli}" style="display:flex;align-items:center;gap:8px;min-width:0">{u_kind(k)}<span class="ell" style="font-weight:500">{title}</span></span>'
            f'<span role="cell" class="num" title="{amtip}" style="text-align:right;font-weight:500">{amount}</span>'
            f'<span role="cell" title="{sttip}" style="display:flex;font-size:12px;padding-left:12px">{st}</span>'
            f'<span role="cell" title="{settletip}" style="display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;color:var(--text-secondary)">{u_ci("receipt","green",12)}<span class="ell">{settle}</span></span></div>')
paid=lambda t: f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap">{ic(CHECK,14,"var(--success)")}{t}</span>'
wait=lambda t: f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:var(--warning)">{ic(CLOCK,14,"var(--warning)")}{t}</span>'
Z=[];z=Z.append
z('<sc-if value="{{isFkZ}}" hint-placeholder-val="{{false}}">')
z(head2(3,ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Wezwij do zaliczki','Wezwanie do zapłaty zaliczki z oferty albo projektu  C',PLUS)))
z('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
z('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd('Nierozliczone','Zaliczki bez faktury końcowej')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Zapłacone zaliczki, które czekają na rozliczenie w fakturze końcowej">Do rozliczenia <span class="num" style="color:var(--text-primary);font-weight:500">237 142,08 zł</span></span>'
  '<span title="Wezwania do zapłaty zaliczki bez wpłaty">Oczekujące <span class="num" style="color:var(--text-primary);font-weight:500">98 892,00 zł</span></span></span></div>')
z('<div role="table" aria-label="Zaliczki" style="display:flex;flex-direction:column;padding:0 16px 24px">')
z(f'<div role="row" style="display:grid;grid-template-columns:{ZC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('','bld','indigo',tip='Klient')+u_th('Nr','hash')+u_th('Podstawa','layers','violet')+u_th('Brutto','coin','yellow','right')+'<span style="padding-left:12px">'+u_th('Wpłata','bank','green')+'</span>'+u_th('Rozliczenie','receipt','teal')+'</div>')
z(zrow('Chłodzenie serwerowni · zaliczka 30 %','PJ-2026-013','Biurowiec Kwadrant','98 892,00','80 400,00 netto + 23 % VAT · wezwanie 12 lis',wait('do czw 26 lis'),'Wezwanie wysłane 12 lis · termin 14 dni',
       'FZ po wpłacie · montaż od 7 gru','Montaż rusza po zaksięgowaniu zaliczki — warunek umowy',sel=True))
z(zrow('Pompa ciepła · zaliczka 30 %','FZ/2026/11/014','Marek Zieliński','14 262,48','13 206,00 netto + 8 % VAT',paid('18 lis · BLIK'),'Przelewy24 · 18 lis 14:58',
       'w FV końcowej po montażu 1 gru','FV/2026/12/003 pomniejszy podstawę i VAT o zaliczkę'))
z(zrow('Klimatyzacja VRV · zaliczka 30 %','FZ/2026/09/021','Hotel Bryza','179 334,00','145 800,00 netto + 23 % VAT · PJ-2026-011',paid('18 wrz · przelew'),'',
       'w fakturze po odbiorze ~18 gru','Transza 30 % po odbiorze rozliczy zaliczkę'))
z(zrow('Pompy ciepła w 6 domach · zaliczka 30 %','FZ/2026/10/008','Osiedle Leśne Zacisze','87 091,20','80 640,00 netto + 8 % VAT · PJ-2026-008',paid('9 paź · przelew'),'',
       'rozliczana w fakturach domów (3 z 6)','Każda faktura za dom pomniejsza zaliczkę o 1/6 · pozostało 43 545,60 brutto'))
z('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">'+ic(INFO if 'INFO' in globals() else CLOCK,14,'var(--text-tertiary)')+
  '<span>Faktura zaliczkowa powstaje po wpłacie — Avero wystawia ją, gdy dopasujesz wpłatę. Faktura końcowa sama pomniejsza podstawę i VAT o zaliczki.</span></div>')
z('</div></div>')
z('<aside aria-label="Zaliczka PJ-2026-013" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
z('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">PJ-2026-013 · opiekun PK</span>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Zaliczka 30 % · Biurowiec Kwadrant</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">Chłodzenie serwerowni, 2 agregaty wody lodowej</span></div>')
z('<section style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Kontrakt netto','268 000,00 zł',vc='var(--text-secondary)')+kv('Zaliczka 30 % netto','80 400,00 zł',vc='var(--text-secondary)')+kv('VAT 23 %','18 492,00 zł',vc='var(--text-secondary)')+
  kv('Do zapłaty','98 892,00 zł',w=500)+'</div></section>')
z('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Przebieg')+'<div style="display:flex;flex-direction:column;padding:0 8px">'+
  step(FILE,'var(--text-tertiary)','12 lis','Wezwanie do zapłaty zaliczki','PDF z rachunkiem · e-mail do działu finansów')+
  step(MAIL,'var(--text-tertiary)','23 lis','Przypomnienie','automatyczne, 3 dni przed terminem',state='todo')+
  step(CLOCK,'var(--warning)','26 lis','Termin wpłaty','',state='cur')+
  step(CAL,'var(--text-tertiary)','7 gru','Start montażu','po zaksięgowaniu zaliczki',state='todo')+'</div></section>')
z('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Jeśli wpłata się spóźni')+
  '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-secondary)">Agregaty zamówione u Frigo-Serwis (dostawa 1–4 gru) — Avero ostrzeże w projekcie i zaproponuje przesunięcie montażu. Bez decyzji Pascala nic się nie przesunie.</span></section>')
z('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+btn('Wyślij przypomnienie teraz','Szkic e-maila do działu finansów — wyślesz po sprawdzeniu',MAIL,h=32)+'</div>')
z('</aside></div></sc-if>')
block='\n'.join(A)+'\n'+'\n'.join(Z)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x_,y_):
    global s; assert s.count(x_)==1,(x_[:60],s.count(x_)); s=s.replace(x_,y_)
rep("const isFkW = ekran === 'faktury do wystawienia';","const isFkW = ekran === 'faktury do wystawienia'; const isFkA = ekran === 'faktury wszystkie'; const isFkZ = ekran === 'faktury zaliczki';")
rep("nFV = navv(isFV || isFk || isFkW)","nFV = navv(isFV || isFk || isFkW || isFkA || isFkZ)")
rep("isFV, isFk, isFkW, actFV:","isFV, isFk, isFkW, isFkA, isFkZ, actFV:")
rep('"faktury do wystawienia", ','"faktury do wystawienia", "faktury wszystkie", "faktury zaliczki", ')
open(P,'w').write(s); print('ok faktury2',len(s))
