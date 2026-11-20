# Leady (lista + podgląd) i Szanse (tablica etapów). Scenariusz: piątek 13 lis 2026, 9:14 (jak Zgłoszenia i Skrzynka).
P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'; AWC='#8A8F98'; PKC='#5F636B'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
MAIL='<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>'
GLOBE='<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"></path>'
TECHI='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>'
REF='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
SNOW='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
WIND='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>'
FLAME='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'
FAN='<circle cx="12" cy="12" r="2"></circle><path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4l-4 4M14 12c4 0 7 1 7 4 0 2-2 3-4 2l-4-4M12 14c0 4-1 7-4 7-2 0-3-2-2-4l4-4M10 12c-4 0-7-1-7-4 0-2 2-3 4-2l4 4"></path>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
TARGET='<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>'
LEADI='<path d="M2 21a8 8 0 0 1 13.29-6"></path><circle cx="10" cy="8" r="5"></circle><path d="M19 16v6M22 19h-6"></path>'
X='<path d="M18 6 6 18M6 6l12 12"></path>'
BOARD='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18M15 3v18"></path>'
LIST='<path d="M3 12h18M3 6h18M3 18h18"></path>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'

def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
def grp(name,n,extra='',open_=True,icon=''):
    car=ic('<path d="m6 9 6 6 6-6"></path>' if open_ else '<path d="m9 18 6-6-6-6"></path>',14,'var(--text-tertiary)')
    return (f'<div style="display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;margin-top:8px;border-radius:10px;background:var(--bg-raised)">{car}{icon}<span style="font-weight:500">{name}</span>{CNT(n)}{SP}{extra}</div>')
def btn(t,tip,icon='',pri=False,h=28,grow=False):
    g='flex:1 1 auto;' if grow else ''
    if pri: return f'<button type="button" class="pri" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
    return f'<button type="button" class="sec" title="{tip}" style="{g}height:{h}px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14,"var(--text-secondary)") if icon else ""}{t}</button>'
def tabs(items):
    return ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))
SRC={'www':(GLOBE,'Formularz na stronie'),'tel':(PHONE,'Telefon'),'mail':(MAIL,'E-mail'),'tech':(TECHI,'Od technika'),'ref':(REF,'Polecenie')}
def src(k,tip=''):
    i,t=SRC[k]; return f'<span title="{t}{(" · "+tip) if tip else ""}" style="display:inline-flex;justify-content:center">{ic(i,14,"var(--text-tertiary)")}</span>'
TYP={'kl':(WIND,'#2BB3B1','Klimatyzacja'),'pc':(FLAME,'#E0702A','Pompa ciepła'),'chl':(SNOW,'#3B82D6','Chłodnictwo'),'went':(FAN,'#C98A12','Wentylacja')}
def typ(k,extra=''):
    i,c,t=TYP[k]; return sch(ic(i,12,c)+t+extra,t)
nobody='<span title="Bez opiekuna" style="width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong);display:inline-block"></span>'

# =================== LEADY
COLS='16px minmax(0,1.3fr) 128px minmax(0,0.9fr) 72px 136px 24px'
def lrow(sk,sktip,name,sub,t,loc,loctip,val,valtip,ct,cttip,who,sel=False,ctcol='var(--text-secondary)'):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{COLS};column-gap:10px;align-items:center;min-height:44px;padding:0 10px;border-radius:10px;{bg}">'
            f'<span role="cell">{src(sk,sktip)}</span>'
            f'<span role="cell" style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:500">{name}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span>'
            f'<span role="cell" style="display:flex">{typ(t)}</span>'
            f'<span role="cell" class="ell" title="{loctip}" style="color:var(--text-secondary)">{loc}</span>'
            f'<span role="cell" class="num" title="{valtip}" style="text-align:right;color:var(--text-secondary)">{val}</span>'
            f'<span role="cell" class="num" title="{cttip}" style="text-align:right;font-size:12px;color:{ctcol};display:flex;justify-content:flex-end;align-items:center;gap:3px">{ct}</span>'
            f'<span role="cell" style="display:flex;justify-content:flex-end">{who}</span></div>')
def clk(t,col): return f'{ic(CLOCK,12,col)}<span style="font-weight:500">{t}</span>'
H=[];a=H.append
a('<sc-if value="{{isLd}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(LEADI,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Leady</h1><span style="width:8px"></span>'+
  tabs([('Do kontaktu','3'),('W kwalifikacji','2'),('Zakwalifikowane','7'),('Odrzucone','4')])+SP+ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowy lead','Nowy lead  C',PLUS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'+capd(ic(USER,14,'var(--text-tertiary)')+'Opiekun: wszyscy','Filtr: opiekun handlowy')+
  '<button type="button" class="capd" title="Dodaj filtr  F" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border:0;border-radius:14px;color:var(--text-secondary)">'+ic(PLUS,14)+'Filtr</button>'+SP+
  '<span title="Średni czas do pierwszego kontaktu w listopadzie · cel: 2 h w godzinach pracy" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">'+ic(CLOCK,14,'var(--text-tertiary)')+'Pierwszy kontakt w listopadzie: <span class="num" style="color:var(--text-primary);font-weight:500">1 h 25 min</span> · cel 2 h</span></div>')
a('<div role="table" aria-label="Leady" style="display:flex;flex-direction:column;padding:0 16px 24px">')
a(f'<div role="row" style="display:grid;grid-template-columns:{COLS};column-gap:10px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span></span><span>Kontakt</span><span>Zainteresowanie</span><span>Miejsce</span><span style="text-align:right" title="Szacunek z szablonów instalacji">Szacunek</span><span style="text-align:right" title="Termin pierwszego kontaktu: 2 h od wpłynięcia, w godzinach pracy">Kontakt do</span><span></span></div>')
a(grp('Do pierwszego kontaktu',3,'<span style="font-size:12px;color:var(--text-secondary)">cel: 2 h od wpłynięcia</span>'))
a(lrow('ref','Poleciła Przychodnia Zdrowie · e-mail 7:50','Gabinet DentSopot','dr Karolina Mazur · +48 601 330 214','kl','Sopot, Monte Cassino 41','Lokal usługowy na parterze','~22 tys.','2 gabinety + recepcja · szacunek z szablonu „Split 3 pom.”',clk('9:50','var(--warning)'),'Zostało 36 min · wpłynął 7:50',nobody))
a(lrow('www','Formularz na stronie · 8:20','Joanna Krawczyk','osoba prywatna · +48 698 115 402','kl','Gdynia Redłowo','Blok, 4. piętro, 64 m²','~15 tys.','Multi-split 3 jednostki 2,5 kW · szablon „Mieszkanie 3 pok.”',clk('10:20','var(--text-secondary)'),'Zostało 1 h 06 min · wpłynął 8:20',nobody,sel=True))
a(lrow('tel','Telefon 12 lis 17:40 · przyjęła Agnieszka','Adam Wróbel','osoba prywatna · +48 509 772 160','pc','Chwaszczyno, Leśna 8','Dom 180 m², kocioł gazowy z 2009 r.','~45 tys.','Pompa ciepła 10–12 kW · szablon „Dom do 200 m²”',sch(ic(PHONE,12,'var(--text-tertiary)')+'oddzwonić 10:00','Klient prosił o telefon po 10:00 · zadanie ZD-131',bg='transparent'),'Umówiony telefon',cav('PK',PKC)))
a(grp('W kwalifikacji',2,''))
a(lrow('tech','Kacper po wizycie ZS-1047 · 12 lis','Delikatesy Morskie','istniejący klient · KL-0204','chl','Gdynia, Starowiejska 12','Lodziarka UR-3107, 12 lat, 3. awaria w tym roku','~28 tys.','Wymiana lodziarki na agregat R290 · szacunek technika',sch('decyzja właściciela','Pan Jacek Morski odpowie do 18 lis',bg='transparent'),'Czeka na klienta',cav('AW',AWC)))
a(lrow('mail','E-mail 10 lis · zarząd wspólnoty','Wspólnota Kasztanowa 7','Tadeusz Lis · zarządca','went','Rumia, Kasztanowa 7','Garaż podziemny, 42 miejsca','~38 tys.','Wentylacja garażu z czujnikami CO/LPG · bez szablonu',sch('uchwała 24 lis','Wspólnota głosuje nad budżetem 24 lis',bg='transparent'),'Czeka na uchwałę',cav('PK',PKC)))
a('</div></div>')
# podgląd leada
a('<aside aria-label="Lead: Joanna Krawczyk" style="flex:0 0 360px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:6px;padding:0 8px"><div style="display:flex;align-items:center;gap:8px">'+src('www')+'<span style="font-size:12px;color:var(--text-tertiary)">Formularz na stronie · 8:20</span>'+SP+ib('Zadzwoń','Zadzwoń  ⇧C',PHONE,24)+ib('Więcej akcji','Więcej akcji',DOTS,24)+'</div>'
  '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Joanna Krawczyk</h2><span style="font-size:12px;color:var(--text-secondary)">Klimatyzacja do mieszkania · Gdynia Redłowo</span>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px;padding-top:4px">'+capd(ic(CLOCK,14,'var(--text-tertiary)')+'Kontakt do 10:20','Cel: pierwszy kontakt w 2 h · zostało 1 h 06 min')+capd(nobody.replace('20px','16px')+'Opiekun','Przypisz opiekuna  A','0 10px 0 6px')+'</div></div>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Z formularza')+
  prop(LEADI,'+48 698 115 402','j.krawczyk@gmail.com · zgoda na kontakt telefoniczny',ib('Zadzwoń','Zadzwoń',PHONE,24),plain=True)+
  prop(PIN,'Blok, 4. piętro, 64 m²','Gdynia Redłowo · ulica w treści wiadomości')+
  prop(WIND,'3 pokoje · sypialnia na południe','Salon 24 m², sypialnia 14 m², pokój 11 m²')+
  prop(CAL,'Montaż w grudniu','Klientka pyta, czy to możliwe przed świętami')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Wstępny dobór',sch('szablon','Szablon instalacji „Mieszkanie 3 pok.” — do potwierdzenia na oględzinach'))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Multi-split, 3 jednostki','2,5 / 2,5 / 3,5 kW',tip='Jednostka zewnętrzna 7,1 kW')+kv('Szacunek','14–17 tys. zł netto',w=500,tip='Bez wyceny trasy freonowej — zależy od oględzin')+
  kv('Montaż w grudniu','możliwy',vc='var(--success)',tip='Tomasz i Mateusz mają wolne 2 dni w tygodniu 7–11 gru')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Do ustalenia w rozmowie',CNT(3))+
  ''.join(f'<div style="display:flex;align-items:center;gap:10px;min-height:32px;padding:2px 8px"><span aria-hidden="true" style="width:16px;height:16px;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--border-strong)"></span><span>{t}</span></div>' for t in ['Zgoda wspólnoty na jednostkę na elewacji','Gdzie odprowadzić skropliny','Termin oględzin (Tomasz lub Mateusz)'])+'</section>')
a('<div style="display:flex;gap:6px;padding:0 4px">'+btn('Odrzuć…','Odrzuć z powodem: poza zasięgiem, za mała wartość, rezygnacja, duplikat  ⇧D',h=32)+
  btn('Zakwalifikuj i umów oględziny','Tworzy szansę SZ-0192 i oględziny, przypisuje opiekuna  ⌘↵',pri=True,h=32,grow=True)+'</div>')
a('</aside></div></sc-if>')

# =================== SZANSE (tablica etapów)
K=[];k=K.append
def card(title,cli,val,valtip,t,chips,who,sel=False,warn=False):
    i,c,_=TYP[t]
    bg='var(--bg-subtle)' if sel else 'var(--bg-raised)'
    return (f'<div role="listitem" class="row" style="display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;background:{bg}">'
            f'<div style="display:flex;align-items:center;gap:6px;min-width:0">{ic(i,14,c)}<span class="ell" style="flex:1 1 auto;font-weight:500">{title}</span></div>'
            f'<span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{cli}</span>'
            f'<div style="display:flex;flex-wrap:wrap;gap:4px">{chips}</div>'
            f'<div style="display:flex;align-items:center;gap:6px"><span class="num" title="{valtip}" style="flex:1 1 auto;font-weight:500">{val}</span>{who}</div></div>')
def nxt(t,tip,late=False):
    col='var(--danger)' if late else 'var(--text-secondary)'
    return sch(ic(CLOCK,12,col)+t,tip,col=col)
def col_(name,n,suma,tip,cards,w='1fr'):
    return (f'<div role="list" aria-label="{name}" style="min-width:0;display:flex;flex-direction:column;gap:6px">'
            f'<div style="display:flex;align-items:center;gap:6px;height:28px;padding:0 4px"><span style="font-weight:500">{name}</span>{CNT(n)}{SP}<span class="num" title="{tip}" style="font-size:12px;color:var(--text-secondary)">{suma}</span></div>'
            +''.join(cards)+
            '<button type="button" class="ghost" title="Dodaj szansę w tym etapie" style="height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;border:0;border-radius:10px;background:transparent;color:var(--text-tertiary);font-size:12px">'+ic(PLUS,14)+'Dodaj</button></div>')
k('<sc-if value="{{isSzn}}" hint-placeholder-val="{{false}}">')
k('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(TARGET,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Szanse</h1><span style="width:8px"></span>'+
  tabs([('Otwarte','10'),('Moje','4'),('Wygrane','6'),('Przegrane','3')])+SP+
  '<span role="radiogroup" aria-label="Widok" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">'
  '<span role="radio" aria-checked="true" title="Tablica etapów  ⇧B" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:8px;background:var(--bg-surface);font-size:12px;font-weight:500">'+ic(BOARD,14)+'Tablica</span>'
  '<span role="radio" aria-checked="false" title="Tabela  ⇧T" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:8px;font-size:12px;color:var(--text-secondary)">'+ic(LIST,14)+'Tabela</span></span>'+
  ib('Opcje widoku','Opcje widoku  ⇧V',FILTER)+'<span style="width:4px"></span>'+btn('Nowa szansa','Nowa szansa  C',PLUS)+'</div>')
k('<div style="display:flex;align-items:center;gap:6px;padding:4px 20px 12px">'+capd(ic(USER,14,'var(--text-tertiary)')+'Opiekun: wszyscy','Filtr: opiekun handlowy')+capd(ic(CAL,14,'var(--text-tertiary)')+'Decyzja do 31 gru','Planowany termin decyzji')+
  '<button type="button" class="capd" title="Dodaj filtr  F" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border:0;border-radius:14px;color:var(--text-secondary)">'+ic(PLUS,14)+'Filtr</button>'+SP+
  '<span style="display:flex;align-items:center;gap:16px;font-size:12px;color:var(--text-secondary)">'
  '<span title="Suma wartości otwartych szans (netto)">W lejku <span class="num" style="color:var(--text-primary);font-weight:500">450 020 zł</span></span>'
  '<span title="Wartość ważona prawdopodobieństwem etapu: kwalifikacja 10 %, oględziny 25 %, wycena 40 %, oferta 55 %, negocjacje 75 %">Ważona <span class="num" style="color:var(--text-primary);font-weight:500">219 081 zł</span></span>'
  '<span title="Wygrane w listopadzie: 6 szans, 214 300 zł · w październiku 5, 168 900 zł">Wygrane w lis. <span class="num" style="color:var(--text-primary);font-weight:500">214 300 zł</span></span>'
  '<span title="Szafa mroźnicza (Piekarnia Rogal) i Kancelaria Wit — następne działanie po terminie" style="display:inline-flex;align-items:center;gap:4px;color:var(--danger)">'+ic(WARN,12,'var(--danger)')+'2 po terminie</span></span></div>')
OF=lambda n,tip: obj(n,tip)
k('<div style="flex:1 1 auto;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;padding:0 20px 16px;align-items:start;min-height:0">')
k(col_('Kwalifikacja',2,'60 000 zł','Szanse 10 % · ważona 6 000 zł',[
  card('Klimatyzacja 2 gabinetów','Gabinet DentSopot · Sopot','22 000 zł','Szacunek','kl',nxt('oględziny do umówienia','Następne działanie: zadzwonić i umówić oględziny'),cav('AW',AWC)),
  card('Wentylacja garażu','Wspólnota Kasztanowa 7 · Rumia','38 000 zł','Szacunek','went',nxt('uchwała 24 lis','Decyzja wspólnoty o budżecie — wtorek 24 lis'),cav('PK',PKC))]))
k(col_('Oględziny',2,'76 000 zł','Szanse 25 % · ważona 19 000 zł',[
  card('Pompa ciepła zamiast gazu','Adam Wróbel · Chwaszczyno','45 000 zł','Szacunek z szablonu „Dom do 200 m²”','pc',nxt('pon 16 lis 15:00','Oględziny: poniedziałek 16 lis, 15:00 · Tomasz')+obj('OG-0418','Oględziny zaplanowane'),cav('TL',TL)),
  card('Komora chłodnicza 6 m²','Restauracja Przystań · Gdynia','31 000 zł','Szacunek','chl',nxt('wt 17 lis 9:00','Oględziny: wtorek 17 lis, 9:00 · Kacper'),cav('KN',KN))]))
k(col_('Wycena',2,'28 200 zł','Szanse 40 % · ważona 11 280 zł',[
  card('Szafa mroźnicza','Piekarnia Rogal · Gdynia','18 400 zł','Szacunek','chl',nxt('wycena 2 dni po terminie','Obiecana na środę 11 lis — klient czeka',late=True),cav('AW',AWC)),
  card('Klimatyzacja 2 sal','Biuro Rachunkowe Bilans','9 800 zł','Szacunek','kl',nxt('dziś','Wycena do wysłania dziś, piątek 13 lis'),cav('AW',AWC))]))
k(col_('Oferta',3,'157 820 zł','Szanse 55 % · ważona 86 801 zł',[
  card('Pompa ciepła · dom 160 m²','Marek Zieliński · Rumia','44 020 zł','Wariant polecany B · OF-2026-118','pc',OF('OF-2026-118','Oferta wysłana 11 lis · ważna do 2 gru')+sch(ic(EYE,12,'var(--text-tertiary)')+'3× · wczoraj','Klient otworzył ofertę 3 razy, ostatnio czwartek 12 lis 21:14 — porównywał warianty B i C'),cav('TL',TL),sel=True),
  card('Wymiana klimatyzacji sal 1–3','Kancelaria Wit · Gdańsk','27 300 zł','OF-2026-114','kl',OF('OF-2026-114','Wysłana 9 lis')+nxt('nieotwarta 4 dni','SMS przypominający wysłany automatycznie 12 lis · dziś zadanie „zadzwoń”',late=True),cav('PK',PKC)),
  card('VRV · sala eventowa','Galeria Bałtycka · Gdańsk','86 500 zł','OF-2026-109','kl',OF('OF-2026-109','Wysłana 3 lis')+nxt('zarząd 30 lis','Decyzja zarządu klienta — poniedziałek 30 lis'),cav('PK',PKC))]))
k(col_('Negocjacje',1,'128 000 zł','Szanse 75 % · ważona 96 000 zł',[
  card('Wymiana 2 central wentylacyjnych','Przychodnia Zdrowie · Gdynia','128 000 zł','OF-2026-102 · wersja 3','went',OF('OF-2026-102 v3','Trzecia wersja oferty, 6 lis')+sch('rabat 5 %?','Klient prosi o 5 % rabatu · marża po rabacie 24,1 % — powyżej progu 22 %'),cav('PK',PKC))]+
  ['<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;padding:4px 8px">'
   '<div style="display:flex;align-items:center;gap:6px">'+ic(CHECK,14,'var(--success)')+'<span style="flex:1 1 auto">Wygrane w lis.</span><span class="num" title="6 szans" style="font-weight:500">214 300 zł</span></div>'
   '<div style="display:flex;align-items:center;gap:6px">'+ic(X,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto;color:var(--text-secondary)">Przegrane</span><span class="num" style="color:var(--text-secondary)">3</span></div>'
   '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Powody: cena 2, termin 1. Wygrana zapisuje się sama po akceptacji oferty online.</span></div>']))
k('</div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isLd = ekran === 'leady'; const nLd = navv(isLd); const isSzn = ekran === 'szanse'; const nSzn = navv(isSzn);")
rep("isFV, actFV:","isLd, actLd: nLd.act, colLd: nLd.col, wLd: nLd.w, isSzn, actSzn: nSzn.act, colSzn: nSzn.col, wSzn: nSzn.w, isFV, actFV:")
rep('"zgłoszenia", "skrzynka", "planowanie"]','"zgłoszenia", "skrzynka", "leady", "szanse", "planowanie"]')
rep('font-weight:400">Leady</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">2</span>','font-weight:400">Leady</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">3</span>')
def navpatch(label,key):
    global s
    i=s.find('font-weight:400">'+label+'</span>'); assert i>0,label
    a0=s.rfind('<a href="#" class="nav"',0,i); assert '</a>' not in s[a0:i]
    e=s.find('</a>',i); seg=s[a0:e]
    seg=seg.replace('class="nav"',f'class="nav {{{{act{key}}}}}"',1).replace('color:var(--text-secondary)">',f'color:{{{{col{key}}}}}">',1).replace(f'font-weight:400">{label}',f'font-weight:{{{{w{key}}}}}">{label}')
    assert '{{col'+key+'}}' in seg, label
    s=s[:a0]+seg+s[e:]
navpatch('Leady','Ld'); navpatch('Szanse','Szn')
open(P,'w').write(s); print('ok leady',len(s))
