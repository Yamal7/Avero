# Finanse › Faktury: Należności (wiek, przypomnienia, wezwanie; panel Hotel Oliwski) i Do wystawienia (rozliczenie zleceń; panel ZS-1047).
# Scenariusz: czwartek 19 lis 2026, 16:00 (jak Raporty).
SRCZ=open('design/tools/zakupy.py').read()
exec(SRCZ.split("# =================== ZAPOTRZEBOWANIE")[0])
P='design/canvas/Main.dc.html'; s=open(P).read()
KNC='#1FA7A5'; TLC='#9B6BE0'; PKC='#5E6AD2'; PDC='#E0702A'; AWC='#C98A12'
WALLET='<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path>'
BANK='<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"></path>'
DOTI='<circle cx="12" cy="12" r="10"></circle>'
XC='<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6M9 9l6 6"></path>'
HAND='<path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"></path><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 13l6 6"></path>'
dot=lambda c: f'<span aria-hidden="true" style="width:6px;height:6px;border-radius:50%;background:{c};flex:0 0 auto"></span>'
def cav(ini,c,size=20): return f'<span title="{ini}" style="width:{size}px;height:{size}px;border-radius:50%;background:{c};color:#fff;font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto">{ini}</span>'
def head(cur,right):
    return ('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(WALLET,16,'var(--text-secondary)')+
            '<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Faktury</h1><span style="width:8px"></span>'+
            tabs([('Należności','11'),('Do wystawienia','5'),('Wszystkie',''),('Zaliczki','2')],cur)+SP+right+'</div>')
AGE=[('Przed terminem',229860,'var(--text-tertiary)',.45),('1–30 dni',14820,'var(--warning)',1),('31–60 dni',6240,'#E0702A',1),('ponad 60 dni',2420,'var(--danger)',1)]
TOT=sum(a[1] for a in AGE); assert TOT==253340
fmt=lambda v: f'{v:,}'.replace(',',' ')
# =================== NALEŻNOŚCI
NC='minmax(0,1.3fr) 128px 104px 96px minmax(0,1fr)'
def nrow(cli,no,notip,amount,term,termtip,late,latecol,step,steptip,sel=False,muted=False,sub=''):
    bg='background:var(--bg-subtle);' if sel else ''
    op='opacity:.6;' if muted else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{NC};column-gap:12px;align-items:center;min-height:44px;padding:4px 10px;border-radius:10px;{bg}{op}">'
            f'<span role="cell" style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:500">{cli}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span>'
            f'<span role="cell" class="mono ell" title="{notip}" style="font-size:11px;color:var(--text-secondary)">{no}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-weight:500">{amount}</span>'
            f'<span role="cell" class="num" title="{termtip}" style="text-align:right;font-size:12px;color:{latecol}">{late}</span>'
            f'<span role="cell" class="ell" title="{steptip}" style="font-size:12px;color:var(--text-secondary);padding-left:8px">{step}</span></div>')
N=[];n=N.append
n('<sc-if value="{{isFk}}" hint-placeholder-val="{{false}}">')
n(head(0,ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowa faktura','Nowa faktura — ze zlecenia, oferty albo pusta  C',PLUS)))
n('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
# wiek należności
bar='<div role="img" aria-label="Należności wg wieku: razem 253 340 zł, po terminie 23 480 zł" style="display:flex;gap:2px;height:10px">'+''.join(
    f'<span title="{t}: {fmt(v)} zł" style="flex:{v} 1 0;min-width:6px;border-radius:{"5px 0 0 5px" if i==0 else ("0 5px 5px 0" if i==3 else "0")};background:{c};opacity:{o}"></span>' for i,(t,v,c,o) in enumerate(AGE))+'</div>'
leg='<div style="display:flex;gap:20px;flex-wrap:wrap">'+''.join(
    f'<span style="display:flex;flex-direction:column;gap:2px"><span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">{dot(c)}{t}</span><span class="num" style="font-weight:500">{fmt(v)} zł</span></span>' for t,v,c,o in AGE)+'</div>'
n('<div style="display:flex;flex-direction:column;gap:10px;margin:4px 20px 12px;padding:12px 14px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:baseline;gap:12px"><span style="font-weight:500">Do zapłaty</span><span class="num" style="font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">253 340 zł</span>'
  '<span style="font-size:12px;color:var(--text-secondary)">po terminie <span class="num" style="color:var(--text-primary);font-weight:500">23 480 zł</span> · 8 faktur</span>'+SP+
  '<span style="font-size:12px;color:var(--text-tertiary)" title="Średni czas od wystawienia do zapłaty, ostatnie 90 dni">średnio płacą po 19 dniach</span></div>'+bar+leg+'</div>')
# wpłaty do dopasowania
n('<div role="note" style="display:flex;align-items:center;gap:10px;margin:0 20px 8px;padding:8px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(BANK,16,'var(--text-secondary)')+
  '<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="font-weight:500">Wpłata do dopasowania: 4 960,00 zł od Kancelaria Wit</span>'
  '<span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">Wyciąg z dziś 14:02, tytuł „faktura 6/11” — pasuje kwotą do FV/2026/11/006.</span></span>'+
  btn('Inna faktura…','Wybierz fakturę ręcznie')+btn('Dopasuj do FV/2026/11/006','Oznacz fakturę jako zapłaconą 19 lis',CHECK)+'</div>')
n('<div style="display:flex;align-items:center;gap:6px;padding:0 20px 6px">'+capd('Po terminie','8 faktur · 23 480 zł')+capd('Wszyscy opiekunowie','PK, AW')+'</div>')
n('<div role="table" aria-label="Należności po terminie" style="display:flex;flex-direction:column;padding:0 16px 24px">')
n(f'<div role="row" style="display:grid;grid-template-columns:{NC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Klient</span><span>Faktura</span><span style="text-align:right">Brutto</span><span style="text-align:right">Po terminie</span><span style="padding-left:8px">Ostatni krok</span></div>')
n(nrow('Restauracja Port','FV/2026/09/018','Wystawiona 22 sie · termin 5 wrz','2 420,00','5 wrz','Termin piątek 5 września','74 dni','var(--danger)','wezwanie 30 paź · bez odpowiedzi','Wezwanie do zapłaty wysłane 30 paź · usługi wstrzymane poza awariami',sub='Gdynia · usługi wstrzymane'))
n(nrow('Biuro Bilans','FV/2026/10/055','Termin 15 paź','1 080,00','15 paź','Termin czwartek 15 października','35 dni','#E0702A','przypomnienie 22 paź · otwarte','E-mail z linkiem do płatności, otwarty 2×',sub='Gdynia'))
n(nrow('Hotel Oliwski','FV/2026/10/061 +1','2 faktury: FV/2026/10/061 5 160,00 (termin 19 paź) i FV/2026/11/012 4 700,00 (termin 5 lis)','9 860,00','19 paź','Najstarsza: termin poniedziałek 19 października','31 dni','#E0702A','obietnica zapłaty 13 lis — niedotrzymana','Telefon 9 lis, Paweł Grabowski',sel=True,sub='Gdańsk Oliwa · 2 faktury'))
n(nrow('Delikatesy Morskie','FV/2026/10/072','Termin 30 paź','1 910,00','30 paź','Termin piątek 30 października','20 dni','var(--warning)','przypomnienie 6 lis · otwarte','E-mail z linkiem do płatności',sub='Gdynia · umowa serwisowa'))
n(nrow('Kancelaria Wit','FV/2026/11/006','Termin 1 lis','4 960,00','1 lis','Termin niedziela 1 listopada','18 dni','var(--warning)','wpłata czeka na dopasowanie','Wyciąg z 19 lis 14:02',sub='Gdańsk · umowa serwisowa'))
n(nrow('Piekarnia Rogal','FV/2026/11/009','Termin 10 lis','1 840,00','10 lis','Termin wtorek 10 listopada','9 dni','var(--warning)','przypomnienie 17 lis','E-mail z linkiem do płatności, nieotwarty',sub='Gdynia'))
n(nrow('Przychodnia Zdrowie','FV/2026/11/015','Termin 15 lis','1 410,00','15 lis','Termin niedziela 15 listopada','4 dni','var(--warning)','przypomnienie przed terminem','Automatyczne 3 dni przed terminem',sub='Gdynia'))
n('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-secondary)"><span>8 faktur po terminie · 7 klientów</span>'+SP+'<span>Przed terminem 229 860 zł, w tym FV/2026/11/031 Hotel Bryza 194 400 zł do 4 gru</span></div>')
n('</div></div>')
# panel Hotel Oliwski
def step(icon,col,date_,title,body,state='done'):
    c={'done':'var(--text-secondary)','cur':'var(--text-primary)','todo':'var(--text-tertiary)'}[state]
    return (f'<div style="display:grid;grid-template-columns:18px 52px minmax(0,1fr);column-gap:8px;padding:6px 0">{ic(icon,14,col)}<span class="num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{date_}</span>'
            f'<span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:12px;line-height:16px;color:{c};{"font-weight:500" if state=="cur" else ""}">{title}</span>{f"<span style=\"font-size:12px;line-height:16px;color:var(--text-tertiary)\">{body}</span>" if body else ""}</span></div>')
n('<aside aria-label="Należność Hotel Oliwski" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
n('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span style="font-size:12px;color:var(--text-tertiary)">KL-0217 · opiekun PK</span>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Hotel Oliwski</h2>'
  '<div style="display:flex;align-items:baseline;gap:8px"><span class="num" style="font-size:18px;line-height:26px;font-weight:600">9 860,00 zł</span><span style="font-size:12px;color:#E0702A">najstarsza 31 dni po terminie</span></div></div>')
n('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Faktury',CNT(2))+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('FV/2026/10/061 · 19 paź','5 160,00',tip='Naprawa agregatu UR-2304 i kontrola 2 paź · 31 dni po terminie')+kv('FV/2026/11/012 · 5 lis','4 700,00',tip='Wymiana parownika komory warzywnej · 14 dni po terminie')+'</div></section>')
n('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Przypomnienia')+'<div style="display:flex;flex-direction:column;padding:0 8px">'+
  step(MAIL,'var(--text-tertiary)','16 paź','Przypomnienie przed terminem','automatyczne, otwarte')+
  step(MAIL,'var(--text-tertiary)','26 paź','Przypomnienie z linkiem do płatności','automatyczne, 7 dni po terminie')+
  step(PHONE,'var(--text-tertiary)','9 lis','Telefon — Agnieszka','Paweł Grabowski: „faktura u księgowej, zapłacimy do 13 lis”')+
  step(WARN,'var(--warning)','13 lis','Obietnica zapłaty niedotrzymana','',state='cur')+
  step(FILE,'var(--text-tertiary)','teraz','Wezwanie do zapłaty','proponowane przy 30 dniach po terminie',state='todo')+'</div></section>')
n('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Wezwanie do zapłaty')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Należność główna','9 860,00 zł')+kv('Odsetki za opóźnienie','ok. 68 zł',vc='var(--text-secondary)',tip='Odsetki ustawowe za opóźnienie w transakcjach handlowych, od dnia po terminie do dziś — stawka z Ustawień')+
  kv('Rekompensata','40 € i 70 €',vc='var(--text-secondary)',tip='Transakcja handlowa: 40 € za fakturę do 5 000 zł (FV/2026/11/012), 70 € za fakturę 5 000–50 000 zł (FV/2026/10/061). Doliczenie jest opcjonalne.')+
  '<span style="padding-top:4px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Rekompensatę możesz pominąć — dobra relacja z klientem bywa ważniejsza.</span></div></section>')
n('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Prace u klienta')+
  '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-secondary)">Otwarte ZG-0912 (agregat) i kontrola F-gaz UR-2304 po terminie — <span style="color:var(--text-primary)">nie wstrzymujemy awarii ani obowiązków F-gaz</span>. Propozycja umowy (ok. 5 400 zł/rok) czeka do spłaty.</span></section>')
n('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+
  btn('Przygotuj wezwanie do zapłaty','Szkic PDF i e-maila do Pawła Grabowskiego — wyślesz po sprawdzeniu  ⌘↵',FILE,pri=True,h=32)+
  btn('Zapisz nową obietnicę zapłaty','Data i kto obiecał — Avero przypomni dzień po terminie',HAND,h=32)+'</div>')
n('</aside></div></sc-if>')

# =================== DO WYSTAWIENIA
WC='minmax(0,1.6fr) minmax(0,1fr) 104px 150px'
def wrow(title,no,cli,what,amount,amtip,st,sttip,sel=False,muted=False):
    bg='background:var(--bg-subtle);' if sel else ''
    op='opacity:.6;' if muted else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{WC};column-gap:12px;align-items:center;min-height:48px;padding:4px 10px;border-radius:10px;{bg}{op}">'
            f'<span role="cell" style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:500">{title}</span><span style="display:flex;gap:6px;min-width:0;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span class="mono" style="font-size:11px;white-space:nowrap">{no}</span><span class="ell">{cli}</span></span></span>'
            f'<span role="cell" class="ell" style="font-size:12px;color:var(--text-secondary)">{what}</span>'
            f'<span role="cell" class="num" title="{amtip}" style="text-align:right">{amount}</span>'
            f'<span role="cell" title="{sttip}" style="display:flex;justify-content:flex-start;font-size:12px;padding-left:12px">{st}</span></div>')
def ws(icon,col,t,tc='var(--text-primary)'): return f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:{tc}">{ic(icon,14,col)}{t}</span>'
W=[];w=W.append
w('<sc-if value="{{isFkW}}" hint-placeholder-val="{{false}}">')
w(head(1,ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Wystaw 2 faktury','Wystaw zaznaczone: ZS-1047 i ZS-1062 — podgląd przed wysłaniem  ⌘↵',CHECK,pri=True)))
w('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
w('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 8px">'+capd('Zakończone, bez faktury','Zlecenia i etapy projektów od 1 lis')+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Gotowe do wystawienia, netto">Gotowe <span class="num" style="color:var(--text-primary);font-weight:500">2 040 zł</span></span>'
  '<span title="Wstrzymane: brak numeru PO">Wstrzymane <span class="num" style="color:var(--text-primary);font-weight:500">1 420 zł</span></span>'
  '<span title="Najdłużej czeka zlecenie zakończone 13 lis">najdłużej 6 dni</span></span></div>')
w('<div role="table" aria-label="Do wystawienia" style="display:flex;flex-direction:column;padding:0 16px 24px">')
w(f'<div role="row" style="display:grid;grid-template-columns:{WC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Zlecenie</span><span>Rozliczenie</span><span style="text-align:right">Netto</span><span style="padding-left:12px">Stan</span></div>')
w(wrow('Lodziarka — wymiana wentylatora skraplacza','ZS-1047','Delikatesy Morskie · KN 13 lis','robocizna 2 h, część, dojazd','1 260,00','Z protokołu PR/2026/11/038 i wydania RW/2026/11/041',ws(CHECK,'var(--success)','Gotowe'),'Protokół podpisany 13 lis 15:40',sel=True))
w(wrow('Szron na parowniku — odszranianie i czyszczenie','ZS-1062','Piekarnia Rogal · PD 18 lis','robocizna 1 h, dojazd','780,00','Z protokołu PR/2026/11/044',ws(CHECK,'var(--success)','Gotowe'),'Protokół podpisany 18 lis 12:10'))
w(wrow('Presostat HP i doładowanie czynnika','ZS-1060','Hotel Oliwski · PD 13 lis','część, 1,2 kg R404A, robocizna','1 420,00','RW/2026/11/044 · czynnik regenerowany 142,00 zł/kg',ws(WARN,'var(--warning)','Brak numeru PO','var(--warning)'),'Pole własne firmy „Numer PO na fakturze” — Hotel Oliwski wymaga PO. Bez niego Avero nie wystawi faktury.'))
w(wrow('Odbiór końcowy wentylacji — transza 30 %','PJ-2026-009','Szkoła Podstawowa nr 4 · Rumia','po protokole odbioru','93 600,00','30 % z 312 000 zł · harmonogram płatności projektu',ws(CLOCK,'var(--text-tertiary)','Po odbiorze 30 lis','var(--text-secondary)'),'Faktura powstanie z protokołu odbioru końcowego'))
w(wrow('3 wizyty w ryczałcie + 2 h poza ryczałtem','UM-2026-031','Galeria Portowa · listopad','ryczałt 2 400 + 280,00','2 680,00','Ryczałt miesięczny i godziny poza ryczałtem 2 × 140 zł',ws(CAL,'var(--text-tertiary)','Z faktury 1 gru','var(--text-secondary)'),'Faktura zbiorcza z umowy wystawiana 1. dnia miesiąca'))
w(wrow('Diagnoza E7 — gwarancja','ZS-1064','Kancelaria Wit · KN 13 lis','RK-2026-017','0,00','Naprawa gwarancyjna — koszt w reklamacji',ws(XC,'var(--text-tertiary)','Bez faktury','var(--text-tertiary)'),'Gwarancja producenta — rozliczenie z Termo-Bud w reklamacji',muted=True))
w('<div style="display:flex;align-items:center;gap:8px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">'+ic(INFO if 'INFO' in globals() else CLOCK,14,'var(--text-tertiary)')+
  '<span>Faktury dla firm idą przez KSeF po wystawieniu; dla osób prywatnych — e-mail z linkiem do płatności. Zlecenia z umowy trafiają do faktury zbiorczej, gwarancyjne do reklamacji.</span></div>')
w('</div></div>')
# panel ZS-1047
w('<aside aria-label="Rozliczenie ZS-1047" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
w('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZS-1047</span>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Lodziarka — wymiana wentylatora skraplacza</h2>'
  '<span style="font-size:12px;color:var(--text-secondary)">Delikatesy Morskie · UR-3107 · Kacper, pt 13 lis</span></div>')
def li(name,q,price,val,tip=''):
    return (f'<div title="{tip}" style="display:grid;grid-template-columns:minmax(0,1fr) 44px 80px;column-gap:8px;align-items:center;min-height:28px;padding:0 8px;font-size:12px">'
            f'<span class="ell">{name}</span><span class="num" style="text-align:right;color:var(--text-secondary)">{q}</span><span class="num" style="text-align:right">{val}</span></div>')
w('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Pozycje z protokołu')+
  li('Wentylator skraplacza 230 V','1 szt.','','620,00','RW/2026/11/041 · koszt 418,00 · marża 32,6 %')+
  li('Robocizna serwisowa','2 h','','350,00','175 zł/h · czas z protokołu 10:20–12:20')+
  li('Materiały drobne','1 kpl.','','60,00')+li('Dojazd Gdynia','1','','230,00','Strefa 1 · bez umowy: dojazd płatny')+
  '<div style="height:1px;background:var(--edge);margin:6px 8px"></div>'+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('Netto','1 260,00 zł',w=500)+kv('VAT 23 %','289,80 zł',vc='var(--text-secondary)')+kv('Brutto','1 549,80 zł',w=500)+'</div></section>')
w('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Sprawdzenie',CNT(4))+
  '<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px">'+
  ''.join(f'<span style="display:flex;gap:8px;font-size:12px;line-height:16px">{ic(CHECK,14,"var(--success)")}<span>{t}</span></span>' for t in [
    'Protokół podpisany przez klienta (13 lis 15:40)','Części zgodne z wydaniem RW/2026/11/041','Umowa UM-2025-014 nie obejmuje lodziarki — zlecenie płatne','Nabywca z NIP — faktura przez KSeF'])+'</div></section>')
w('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Płatność')+
  '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('Termin','14 dni · 3 gru',vc='var(--text-secondary)',tip='Warunki z karty firmy')+kv('Wysyłka','e-mail + link do płatności',vc='var(--text-secondary)')+
  kv('Konto','•••• 2874',vc='var(--text-secondary)',tip='Rachunek firmy z Ustawień')+'</div></section>')
w('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+
  btn('Podgląd faktury','Szkic FV z numerem nadanym przy wystawieniu',FILE,h=32)+'</div>')
w('</aside></div></sc-if>')
block='\n'.join(N)+'\n'+'\n'.join(W)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x_,y_):
    global s; assert s.count(x_)==1,(x_[:60],s.count(x_)); s=s.replace(x_,y_)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isFk = ekran === 'faktury'; const isFkW = ekran === 'faktury do wystawienia';")
rep("nFV = navv(isFV)","nFV = navv(isFV || isFk || isFkW)")
rep("isFV, actFV:","isFV, isFk, isFkW, actFV:")
rep('"planowanie"]','"faktury", "faktury do wystawienia", "planowanie"]')
open(P,'w').write(s); print('ok faktury',len(s))
