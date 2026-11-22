# Sprawdzian rdzenia: firma elektryczna „Volt-Serwis” bez pakietu branżowego — Mój dzień, Urządzenie, Zlecenie.
# Tylko rdzeń (R) i konfiguracja firmy (K). Scenariusz: czwartek 19 lis 2026, 7:40. Wnioski: docs/design/screens/25-sprawdzian-rdzenia.md
SRCZ=open('design/tools/zakupy.py').read()
exec(SRCZ.split("# =================== ZAPOTRZEBOWANIE")[0])
P='design/canvas/Main.dc.html'; s=open(P).read()
C1='#1FA7A5'; C2='#9B6BE0'; C3='#E0702A'; C4='#5E6AD2'; C5='#C98A12'
BOLT='<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>'
GRID='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path>'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
SUNI='<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>'
INBOX='<path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>'
AT='<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>'
SIGN='<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
DOTI='<circle cx="12" cy="12" r="10"></circle>'
def cav(ini,c,size=20): return f'<span title="{ini}" style="width:{size}px;height:{size}px;border-radius:50%;background:{c};color:#fff;font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto">{ini}</span>'
def L(k):  # znacznik warstwy (adnotacja sprawdzianu)
    t,tip={'R':('R','Rdzeń — każda firma usługowa'),'K':('K','Konfiguracja firmy Volt-Serwis — pole, typ albo szablon własny')}[k]
    st='background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong);color:var(--text-secondary)' if k=='R' else 'background:var(--text-primary);color:var(--bg-surface)'
    return f'<span title="{tip}" class="mono" style="height:16px;min-width:16px;display:inline-flex;align-items:center;justify-content:center;padding:0 4px;border-radius:4px;font-size:10px;font-weight:600;{st}">{t}</span>'
def review(txt):
    return ('<div role="note" aria-label="Adnotacja sprawdzianu" style="display:flex;align-items:center;gap:10px;margin:0 20px 8px;padding:6px 12px;border-radius:10px;border:1px dashed var(--border-strong);font-size:12px;line-height:16px;color:var(--text-secondary)">'
            f'<span style="font-weight:500;color:var(--text-primary)">Sprawdzian rdzenia</span><span>{txt}</span>{SP}<span style="display:inline-flex;align-items:center;gap:6px">{L("R")} rdzeń {L("K")} konfiguracja firmy</span></div>')
def h3l(t,k,extra=''): return f'<div style="display:flex;align-items:center;gap:8px;min-height:24px;padding:0 8px"><span style="font-size:12px;font-weight:500;color:var(--text-secondary)">{t}</span>{L(k)}{extra}{SP}</div>'

# =================== MÓJ DZIEŃ
D=[];d=D.append
d('<sc-if value="{{isTstD}}" hint-placeholder-val="{{false}}">')
d('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px">'+ic(SUNI,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Mój dzień</h1>'
  '<span style="font-size:12px;color:var(--text-tertiary)" title="Czwartek, 19 listopada 2026">czw 19 lis</span>'+SP+'<span style="font-size:12px;color:var(--text-secondary)">Sprawy: <span class="num" style="color:var(--text-primary);font-weight:500">11</span></span></div>')
d(review('Volt-Serwis (elektryka, 4 techników) — bez pakietu branżowego. Struktura dnia ta sama co w Kranz HVACR.'))
d('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:14px;padding:4px 16px 24px">')
def sec(t,n,k,rows): return f'<section style="display:flex;flex-direction:column;gap:2px">'+h3l(t,k,CNT(n))+''.join(rows)+'</section>'
def r(left,title,sub,right,tip='',col='var(--text-secondary)'):
    pp=sub.split(' · '); ref=pp[0] if pp and (pp[0][:2].isalpha() and '-' in pp[0]) else ''
    rest=pp[1:] if ref else pp
    f=rest[0] if rest else ''; city=rest[1] if len(rest)>1 else ''
    lg=u_logo(f) if f else '<span></span>'
    return (f'<div class="row row1" title="{tip}" style="display:grid;grid-template-columns:52px 76px minmax(0,1fr) 20px minmax(0,0.45fr) 208px;column-gap:12px;align-items:center;padding:0 10px;border-radius:10px">'
            f'<span class="num" style="font-size:12px;color:{col}">{left}</span><span class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{ref}</span><span class="ell" style="font-weight:500">{title}</span>{lg}'
            f'<span style="display:flex;align-items:center;gap:4px;min-width:0;font-size:12px;color:var(--text-tertiary)">{(u_ci("coin","yellow",12) if "zł" in city else u_ci("cal","blue",12) if "umówione" in city else u_ci("pin","red",12)) if city else ""}<span class="ell">{city}</span></span>'
            f'<span style="display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0;overflow:hidden;white-space:nowrap">{right}</span></div>')
d(sec('Zagrożone SLA',1,'R',[r('1:10','Brak zasilania w strefie B — wybija różnicówka','ZG-0412 · Hala Portowa Logistyka · Gdynia, Hutnicza 8','<span style="font-size:12px;color:var(--warning)">reakcja do 8:50</span>'+cav('DK',C1),'Umowa UM-0031 · reakcja 4 h od zgłoszenia 4:50','var(--warning)')]))
d(sec('Wizyty',4,'R',[
  r('8:00','Pomiary okresowe instalacji — dzień 2 z 3','ZL-0729 · Szkoła Podstawowa nr 12 · Gdynia','<span style="font-size:12px;color:var(--text-secondary)">w drodze</span>'+cav('DK',C1)),
  r('10:30','Wymiana opraw na LED w sali, 18 szt.','ZL-0731 · Restauracja Pod Masztem · Gdynia','<span style="font-size:12px;color:var(--text-tertiary)">zaplanowana</span>'+cav('SP',C3)),
  r('13:00','Przegląd rozdzielnicy RG-1 i badanie instalacji','ZL-0734 · Wspólnota Morska 40 · Gdynia','<span style="font-size:12px;color:var(--text-tertiary)">zaplanowana</span>'+cav('RM',C2)),
  r('15:00','Montaż ładowarki samochodu 11 kW','ZL-0735 · Anna Wrona · Rumia','<span style="font-size:12px;color:var(--text-tertiary)">zaplanowana</span>'+cav('DK',C1))]))
d(sec('Bez technika',2,'R',[
  r('7:12','Iskrzy gniazdko w kuchni','ZG-0415 · Tomasz Kępa · Gdynia, osoba prywatna',btn('Przydziel','Przydziel technika  A')),
  r('wczoraj','Nie świeci oświetlenie parkingu','ZG-0416 · Sklep Sezam · Reda',btn('Przydziel','Przydziel technika  A'))]))
d(sec('Skrzynka',2,'R',[
  r('7:31','Zapytanie: pomiary w 15 mieszkaniach','e-mail · Zarządca Nieruchomości Bryza',sch('zapytanie ofertowe','Avero rozpoznało zapytanie')),
  r('6:58','Zdjęcie licznika po awarii','portal klienta · Hala Portowa Logistyka',sch('do ZG-0412','Powiązane automatycznie'))]))
d(sec('Po terminie',2,'R',[
  r('4 dni','Badanie instalacji co 5 lat — Wspólnota Morska 40','UR-0318 rozdzielnica RG-1 · termin 15 lis · umówione dziś 13:00',sch(L('K')+' częstotliwość ustawiona ręcznie','Bez pakietu branżowego częstotliwość wpisuje firma'),col='var(--warning)'),
  r('9 dni','Oferta bez odpowiedzi','OF-0218 · Instalacja w lokalu usługowym · 18 400 zł',cav('ŁW',C4),col='var(--warning)')]))
d('</div>')
# widżety
def w(t,rows): return f'<section style="display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;background:var(--bg-raised)"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:500">{t}</span>{L("R")}</div>{rows}</section>'
d('<aside style="flex:0 0 300px;min-width:0;display:flex;flex-direction:column;gap:12px;padding:4px 16px 24px 0">')
d(w('Zespół dziś',''.join(f'<div style="display:flex;align-items:center;gap:8px;min-height:28px;font-size:12px">{cav(i,c)}<span style="flex:1 1 auto">{n}</span><span class="num" style="color:var(--text-tertiary)">{v}</span></div>' for i,c,n,v in [('DK',C1,'Damian Kowal','3 wizyty'),('SP',C3,'Sebastian Pawlak','1 wizyta'),('RM',C2,'Robert Mazur','1 wizyta'),('KT',C5,'Karol Tomczak','urlop')])))
d(w('Umowy w tym miesiącu','<div style="display:flex;flex-direction:column;gap:2px">'+kv('Przeglądy z umów','9 z 14')+kv('Do fakturowania 1 gru','6 umów',vc='var(--text-secondary)')+'</div>'))
d(w('Sprzedaż','<div style="display:flex;flex-direction:column;gap:2px">'+kv('Leady do kontaktu','1')+kv('Oferty u klientów','4 · 61 200 zł',vc='var(--text-secondary)')+'</div>'))
d('</aside></div></sc-if>')

# =================== URZĄDZENIE
U=[];u=U.append
u('<sc-if value="{{isTstU}}" hint-placeholder-val="{{false}}">')
u('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px">'+ic(GRID,16,'var(--text-secondary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Urządzenia</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">UR-0318</h1>'+SP+btn('Nowe zlecenie','Zlecenie dla tego urządzenia  C',PLUS)+'</div>')
u(review('Typ „Rozdzielnica” i jego pola firma utworzyła sama. Nie ma sekcji branżowej — w Kranz HVACR w tym miejscu pakiet dokłada „Czynnik i F-gaz”.'))
u('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:18px;padding:4px 32px 32px">')
u('<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:8px">'+sch(ic(BOLT,12,'#C98A12')+'Rozdzielnica','Typ urządzenia utworzony przez firmę (Ustawienia › Pola własne › Urządzenia)')+L('K')+'</div>'
  '<h2 style="margin:0;font-size:22px;line-height:30px;font-weight:600;letter-spacing:-0.02em">Rozdzielnica główna RG-1</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--text-secondary)">'+meta(BLD,'Wspólnota Mieszkaniowa Morska 40','Gdynia, Morska 40 · klient z umową UM-0042')+meta(PIN,'piwnica, pom. 0.12','Miejsce w obiekcie')+meta(CAL,'montaż 12 cze 2019 · inna firma','Montaż przed umową z Volt-Serwis')+'</div></div>')
u('<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">')
u('<section style="display:flex;flex-direction:column;gap:4px;padding:10px 8px;border-radius:12px;background:var(--bg-raised)">'+h3l('Dane urządzenia','R')+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Producent','Hager')+kv('Model','obudowa natynkowa 3 × 24',vc='var(--text-secondary)')+kv('Numer seryjny','—',vc='var(--text-tertiary)')+kv('Gwarancja','brak — po terminie',vc='var(--text-tertiary)')+kv('Kod QR','naklejony 2024',vc='var(--text-secondary)')+'</div></section>')
u('<section style="display:flex;flex-direction:column;gap:4px;padding:10px 8px;border-radius:12px;background:var(--bg-raised)">'+h3l('Dane techniczne','K')+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Prąd znamionowy','125 A')+kv('Układ sieci','TN-C-S',vc='var(--text-secondary)')+kv('Stopień ochrony','IP43',vc='var(--text-secondary)')+kv('Obwody','36 · 4 wolne',vc='var(--text-secondary)')+kv('Ochrona przepięciowa','T1 + T2',vc='var(--text-secondary)')+'</div></section>')
u('</div>')
def prz(name,freq,ftip,last,nxt,nxtcol,k):
    return (f'<div class="row" style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) 96px 150px;column-gap:12px;align-items:center;min-height:44px;padding:4px 10px;border-radius:10px">'
            f'<span class="ell" style="font-weight:500">{name}</span><span title="{ftip}" style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">{freq}{L(k)}</span>'
            f'<span class="num" style="font-size:12px;color:var(--text-tertiary)">{last}</span><span class="num" style="font-size:12px;color:{nxtcol}">{nxt}</span></div>')
u('<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Przeglądy okresowe','R')+
  f'<div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) 96px 150px;column-gap:12px;height:24px;align-items:center;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Przegląd</span><span>Częstotliwość</span><span>Ostatni</span><span>Następny</span></div>'+
  prz('Badanie instalacji (pomiary)','co 5 lat','Wpisana ręcznie przez firmę — pakiet branżowy podpowiedziałby ją z przepisów','15 lis 2021','po terminie · dziś 13:00','var(--warning)','K')+
  prz('Przegląd rozdzielnicy','co 12 mies.','Z umowy UM-0042','14 lis 2025','dziś 13:00 · ZL-0734','var(--text-secondary)','R')+'</section>')
u('<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Historia','R',CNT(5))+
  ''.join(f'<div style="display:grid;grid-template-columns:80px minmax(0,1fr) auto;column-gap:10px;align-items:center;min-height:32px;padding:0 10px;font-size:12px"><span class="num" style="color:var(--text-tertiary)">{a}</span><span class="ell">{b}</span><span class="mono" style="font-size:11px;color:var(--text-tertiary)">{c}</span></div>'
          for a,b,c in [('14 lis 2025','Przegląd roczny — dokręcenie zacisków, termowizja','ZL-0588'),('3 mar 2025','Wymiana ogranicznika przepięć T1+T2','ZL-0502'),('22 sie 2024','Naklejenie kodu QR, opis obwodów','ZL-0431')])+'</section>')
u('</div>')
u('<aside style="flex:0 0 300px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">'+
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Obiekt i klient','R')+prop(BLD,'Wspólnota Mieszkaniowa Morska 40','Zarządca: Ewa Rak · +48 600 210 455')+prop(PIN,'Gdynia, Morska 40','Klucz do piwnicy u administratora')+'</section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Umowa','R')+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('UM-0042','do 31 gru 2027',vc='var(--text-secondary)')+kv('Obejmuje','przegląd roczny RG-1',vc='var(--text-secondary)')+'</div></section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Dokumenty','R',CNT(2))+prop(FILE,'Protokół pomiarów 2021','PDF · poprzedni wykonawca')+prop(FILE,'Schemat RG-1','PDF · aktualizacja 2025')+'</section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Reklamacje','R')+'<span style="padding:0 8px;font-size:12px;color:var(--text-tertiary)">Brak.</span></section></aside>')
u('</div></sc-if>')

# =================== ZLECENIE
Z=[];z=Z.append
z('<sc-if value="{{isTstZ}}" hint-placeholder-val="{{false}}">')
z('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px">'+ic(WRENCH,16,'var(--text-secondary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Zlecenia</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">ZL-0734</h1>'+SP+
  btn('Zakończ zlecenie','Wymaga podpisu klienta i kompletnego protokołu  ⌘↵',CHECK,pri=True)+'</div>')
z(review('Protokół pomiarów to szablon firmy z tabelą i oceną wyniku — rdzeń szablonów musi to umieć bez pakietu.'))
z('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:18px;padding:4px 32px 32px">')
z('<div style="display:flex;flex-direction:column;gap:6px"><h2 style="margin:0;font-size:22px;line-height:30px;font-weight:600;letter-spacing:-0.02em">Przegląd rozdzielnicy RG-1 i badanie instalacji</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:var(--text-secondary)">'+meta(BLD,'Wspólnota Morska 40','Umowa UM-0042')+meta(GRID,'UR-0318 · Rozdzielnica RG-1','Urządzenie')+meta(CAL,'dziś 13:00–16:00 · w toku','Czwartek 19 listopada 2026')+
  '<span style="display:inline-flex;align-items:center;gap:6px">'+cav('RM',C2)+'Robert Mazur</span></div></div>')
def mrow(o,zab,zs,zsd,ok=True,warn=False):
    col='var(--success)' if ok else 'var(--danger)'
    return (f'<div style="display:grid;grid-template-columns:minmax(0,1.3fr) 96px 88px 104px 24px;column-gap:10px;align-items:center;min-height:32px;padding:0 10px;font-size:12px">'
            f'<span class="ell">{o}</span><span class="mono" style="font-size:11px;color:var(--text-secondary)">{zab}</span><span class="num" style="text-align:right">{zs}</span><span class="num" style="text-align:right;color:var(--text-tertiary)">≤ {zsd}</span>'
            f'<span style="display:inline-flex;justify-content:flex-end">{ic(CHECK if ok else WARN,14,col)}</span></div>')
z('<section style="display:flex;flex-direction:column;gap:4px">'+h3l('Protokół: Pomiary instalacji elektrycznej','K',sch('szablon firmy · v3','Ustawienia › Szablony protokołów — utworzony przez Volt-Serwis'))+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:8px 4px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:grid;grid-template-columns:minmax(0,1.3fr) 96px 88px 104px 24px;column-gap:10px;height:24px;align-items:center;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Obwód</span><span>Zabezpieczenie</span><span style="text-align:right">Zs zmierzona</span><span style="text-align:right">dopuszczalna</span><span></span></div>'+
  mrow('Oświetlenie klatki schodowej','B10','0,82 Ω','4,37 Ω')+mrow('Gniazda pralni','B16','1,04 Ω','2,73 Ω')+mrow('Domofon i brama','B6','0,77 Ω','7,28 Ω')+
  mrow('Oświetlenie piwnic','B10','4,61 Ω','4,37 Ω',ok=False)+
  '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px 2px;font-size:12px;color:var(--danger)">'+ic(WARN,14,'var(--danger)')+'<span>Oświetlenie piwnic: impedancja pętli zwarcia przekracza dopuszczalną — wynik negatywny, wymagane zalecenie.</span></div>'
  '<div style="display:flex;gap:16px;padding:6px 10px 0;font-size:12px;color:var(--text-secondary)"><span>Wyłączniki różnicowoprądowe: <span class="num" style="color:var(--text-primary)">4 z 4</span> zadziałały ≤ 300 ms</span><span>Rezystancja izolacji: <span class="num" style="color:var(--text-primary)">≥ 1 MΩ</span> we wszystkich obwodach</span></div></div></section>')
z('<section style="display:flex;flex-direction:column;gap:4px">'+h3l('Zalecenia','R')+
  '<div style="display:flex;align-items:center;gap:10px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)"><span style="flex:1 1 auto;line-height:20px">Wymiana przewodu obwodu oświetlenia piwnic (ok. 40 m) — do wyceny.</span>'+btn('Utwórz ofertę','Oferta z zalecenia — wyślesz po sprawdzeniu',PLUS)+'</div></section>')
z('<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Materiały z wydania','R',CNT(2))+
  ''.join(f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 72px 80px;column-gap:10px;align-items:center;min-height:30px;padding:0 10px;font-size:12px"><span class="ell">{a}</span><span class="num" style="text-align:right;color:var(--text-secondary)">{b}</span><span class="mono" style="font-size:11px;text-align:right;color:var(--text-tertiary)">{c}</span></div>'
          for a,b,c in [('Wyłącznik różnicowoprądowy 40 A / 30 mA','1 szt.','RW-0611'),('Przewód YDY 3×1,5','6 m','RW-0611')])+'</section>')
z('</div>')
z('<aside style="flex:0 0 300px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">'+
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Rozliczenie','R')+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Przegląd RG-1','w umowie',vc='var(--text-secondary)')+kv('Badanie instalacji','1 450,00 zł',tip='Cennik firmy: badanie instalacji budynku wielorodzinnego do 30 obwodów')+kv('Wymiana różnicówki','186,00 zł',tip='Część i 0,5 h')+kv('Razem netto','1 636,00 zł',w=500)+'</div></section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Czas pracy','R')+'<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+kv('Plan','3 h',vc='var(--text-secondary)')+kv('Start','13:05',vc='var(--text-secondary)',tip='Technik rozpoczął w aplikacji')+'</div></section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Dokumenty po zakończeniu','R')+prop(FILE,'Protokół pomiarów (PDF)','Z szablonu firmy, z podpisem klienta i uprawnieniami technika')+prop(SIGN,'Podpis klienta','Ewa Rak, zarządca')+'</section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+h3l('Uprawnienia technika','K')+'<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-secondary)">Świadectwo kwalifikacyjne E do 1 kV — pole własne użytkownika, ważne do 8 mar 2029. Pakiet branżowy sprawdzałby je przy przydziale.</span></section></aside>')
z('</div></sc-if>')

block='\n'.join(D)+'\n'+'\n'.join(U)+'\n'+'\n'.join(Z)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x_,y_,n=1):
    global s; assert s.count(x_)==n,(x_[:60],s.count(x_)); s=s.replace(x_,y_)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isTstD = ekran === 'test dzień'; const isTstU = ekran === 'test urządzenie'; const isTstZ = ekran === 'test zlecenie'; const isTst = isTstD || isTstU || isTstZ;")
rep("isFV, isFk,","isTstD, isTstU, isTstZ, orgName: isTst ? 'Volt-Serwis' : 'Kranz HVACR', orgIni: isTst ? 'V' : 'K', tabZl: isTst ? 'ZL-0734 Przegląd RG-1' : 'ZS-1047 Brak chłodzenia w lodziarce', isFV, isFk,")
rep('font-size:11px;font-weight:600">K</span>\n<span class="ell" style="font-weight:500">Kranz HVACR</span>','font-size:11px;font-weight:600">{{orgIni}}</span>\n<span class="ell" style="font-weight:500">{{orgName}}</span>')
rep('<span class="ell">ZS-1047 Brak chłodzenia w lodziarce<','<span class="ell">{{tabZl}}<')
rep('"planowanie"]','"test dzień", "test urządzenie", "test zlecenie", "planowanie"]')
# Mój dzień rdzenia: ten sam sidebar — nawigacja aktywna jak Mój dzień / Urządzenia / Zlecenia nie jest wymagana w sprawdzianie
open(P,'w').write(s); print('ok test_rdzen',len(s))
