# Warstwa elastyczna, etap 2: kreator nowej tabeli (szablony), akcje tabeli, uprawnienia. Scenariusz: piątek 20 lis 2026, 18:30.
FX_SRC=open('design/tools/flex.py').read()
exec(FX_SRC.split('# =================== PRZETARGI — lista')[0])          # helpery, ikony, s (Main)
exec(FX_SRC[FX_SRC.index('def thead(cur):'):FX_SRC.index('# =================== POLA')])
ZAP='<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>'
BELL='<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>'
CHK='<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="m9 12 2 2 4-4"></path>'
ARROW='<path d="M5 12h14M12 5l7 7-7 7"></path>'
RMA='<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>'
TRUCKI='<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>'
GRAD='<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>'
PEOPLE='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
def field(label,val,hint='',lock=False,w=''):
    return (f'<label style="display:flex;flex-direction:column;gap:4px;{w}"><span style="font-size:12px;color:var(--text-secondary)">{label}</span>'
            f'<span style="height:32px;display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:8px;{"background:var(--bg-subtle);color:var(--text-secondary)" if lock else "background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong)"}">{val}{SP if lock else ""}{ic(LOCK,12,"var(--text-tertiary)") if lock else ""}</span>'
            +(f'<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{hint}</span>' if hint else '')+'</label>')

# =================== KREATOR NOWEJ TABELI
H=[];a=H.append
a('<sc-if value="{{isTbN}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(TABLEI,16,'var(--text-secondary)')+'<span style="color:var(--text-secondary)">Własne tabele</span>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Nowa tabela</h1>'+SP+
  '<span style="font-size:12px;color:var(--text-tertiary)">Pola, widoki i panel zmienisz później</span>'+ib('Anuluj','Anuluj  Esc','<path d="M18 6 6 18M6 6l12 12"></path>')+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:20px;padding:8px 24px 24px">')
a('<section style="display:flex;flex-direction:column;gap:10px">'+h3('Zacznij od')+'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">')
def tpl(icon,col,name,desc,n,sel=False,note=''):
    bg='var(--bg-subtle);box-shadow:inset 0 0 0 2px var(--accent)' if sel else 'var(--bg-raised)'
    return (f'<div role="radio" aria-checked="{str(sel).lower()}" class="row" style="display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:12px;background:{bg}">'
            f'<div style="display:flex;align-items:center;gap:8px">{ic(icon,16,col)}<span style="font-weight:500">{name}</span>{SP}<span class="num" style="font-size:12px;color:var(--text-tertiary)">{n}</span></div>'
            f'<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">{desc}</span>{note}</div>')
a(tpl(PLUS,'var(--text-secondary)','Pusta tabela','Tylko nazwa i status — resztę pól dodasz sam.','2 pola'))
a(tpl(RMA,'#3B82D6','Reklamacje do producentów','Zgłoszenia gwarancyjne części i urządzeń: numer RMA, część, zwrot kosztów.','12 pól',True))
a(tpl(GAVEL,'var(--text-secondary)','Przetargi','Ogłoszenia, terminy składania, wadium, nasza cena.','16 pól',note=sch(ic(CHECK,12,'var(--success)')+'już masz','Tabela Przetargi istnieje — utwórz kopię albo wybierz inny szablon')))
a(tpl(TRUCKI,'var(--text-secondary)','Rejestr floty','Pojazdy, przeglądy techniczne, OC, przebiegi.','9 pól',note=sch('jest w Ustawieniach','Busy i ich wyposażenie są w rdzeniu: Ustawienia → Technicy i busy. Tabela zdublowałaby dane.',col='var(--warning)')))
a(tpl(GRAD,'var(--text-secondary)','Szkolenia i uprawnienia','Kursy, egzaminy, terminy odnowienia.','8 pól',note=sch('częściowo w rdzeniu','Certyfikaty F-gaz i SEP techników są w Ustawieniach → Technicy',col='var(--warning)')))
a(tpl(PEOPLE,'var(--text-secondary)','Rekrutacja','Kandydaci, etapy, rozmowy, decyzje.','10 pól'))
a('</div></section>')
a('<section style="display:flex;flex-direction:column;gap:10px;max-width:720px">'+h3('Tabela')+
  '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px">'+
  field('Nazwa tabeli','Reklamacje do producentów','W pasku bocznym i w nagłówku')+field('Nazwa rekordu','reklamacja','Przycisk „Nowa reklamacja”, komunikaty')+
  field('Prefiks numeru','<span class="mono">RK-</span>','Numer automatyczny: RK-001, RK-002…')+
  '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-secondary)">Ikona</span><span style="display:flex;gap:4px">'+
  ''.join(f'<span title="Ikona" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;{"background:var(--bg-subtle);box-shadow:inset 0 0 0 2px var(--accent)" if i==0 else "background:var(--bg-subtle)"}">{ic(x,16,"var(--text-secondary)")}</span>' for i,x in enumerate([RMA,BOX if 'BOX' in dir() else FILE,FILE,CAL,USER,TARGET,FOLDER]))+'</span></label></div>'
  '<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-secondary)">Dostęp na start</span><div style="display:flex;gap:6px">'+capd(ic(CHECK,14,'var(--success)')+'Administrator','Zawsze')+capd(ic(CHECK,14,'var(--success)')+'Biuro','Widzi i edytuje')+capd('Technicy: nie','Możesz zmienić w Uprawnieniach')+'</div></div></section>')
a('<div style="display:flex;gap:6px;max-width:720px">'+btn('Anuluj','Esc')+SP+btn('Utwórz tabelę','Utwórz tabelę z 12 polami i dodaj ją do paska bocznego  ⌘↵',CHECK,pri=True,h=32)+'</div>')
a('</div>')
a('<aside aria-label="Pola z szablonu" style="flex:0 0 380px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 16px 24px">')
a('<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-tertiary)">Szablon</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Reklamacje do producentów</h2><span style="font-size:12px;color:var(--text-secondary)">Dopasowany do pakietu HVACR — łączy się z urządzeniami, zgłoszeniami i zakupami.</span></div>')
FL=[(HASH,'Numer','Numer automatyczny · RK-'),(TXT,'Numer RMA producenta','Tekst · unikalne'),(SEL,'Producent','Wybór'),(REL,'Urządzenie','Powiązanie → Urządzenia'),(REL,'Zgłoszenie','Powiązanie → Zgłoszenia'),(REL,'Część','Powiązanie → Katalog'),
    (SEL,'Status','Wybór · etapy'),(CAL,'Data zgłoszenia','Data'),(COIN,'Kwota do zwrotu','Kwota · PLN netto'),(FX,'Dni bez odpowiedzi','Formuła'),(USER,'Prowadzi','Osoba'),(FOLDER,'Dokumenty','Pliki')]
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Pola',CNT(12))+''.join(f'<div style="display:flex;align-items:center;gap:10px;min-height:30px;padding:0 8px">{ic(i,14,"var(--text-secondary)")}<span style="flex:1 1 auto">{n}</span><span style="font-size:12px;color:var(--text-tertiary)">{t}</span></div>' for i,n,t in FL)+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Etapy statusu')+'<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+
  ''.join(f'<span style="display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px 0 6px;border-radius:11px;background:var(--bg-subtle);font-size:12px"><span style="width:8px;height:8px;border-radius:50%;background:{c}"></span>{n}</span>' for n,c in [('Zgłoszona','var(--text-tertiary)'),('Zaakceptowana','#2a78d6'),('Część w drodze','#eda100'),('Rozliczona','var(--success)'),('Odrzucona','var(--danger)')])+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('W zestawie')+prop(ZAP,'Akcja: zgłoś z karty urządzenia','Przycisk „Reklamacja” w panelu urządzenia i zgłoszenia')+prop(BELL,'Przypomnienie po 14 dniach bez odpowiedzi','Do osoby prowadzącej')+'</section>')
a('</aside></div></sc-if>')

# =================== AKCJE
K=[];k=K.append
k('<sc-if value="{{isTbA}}" hint-placeholder-val="{{false}}">')
k(thead(3))
k('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:0 0 360px;min-width:0;display:flex;flex-direction:column;gap:6px;padding:4px 12px 24px 16px;border-right:1px solid var(--edge)">')
k('<div style="display:flex;align-items:center;gap:8px;padding:0 4px 4px"><span style="font-size:12px;color:var(--text-secondary)">3 akcje · 2 automatyczne</span>'+SP+btn('Dodaj','Dodaj akcję: przycisk albo automat',PLUS)+'</div>')
def act(icon,title,trig,sub,sel=False,on=True):
    bg='background:var(--bg-subtle);' if sel else ''
    auto=trig.startswith('Automat')
    tc=('<span title="'+trig+' · '+sub+'" style="display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;font-size:12px;color:var(--text-secondary)">'+(u_ci('zap','yellow',12)+'automat' if auto else u_ci('play','blue',12)+'przycisk')+'</span>')
    col='var(--ic-orange)' if auto else 'var(--ic-violet)'
    return (f'<div class="row row1" style="display:flex;align-items:center;gap:10px;padding:0 12px;border-radius:10px;{bg}">{ic(icon,16,col)}'
            f'<span class="ell" title="{sub}" style="flex:1 1 auto;min-width:0;font-weight:500">{title}</span>{tc}'
            f'<span title="{"Włączona" if on else "Wyłączona"}" style="width:28px;height:16px;flex:0 0 auto;border-radius:8px;background:{"var(--accent)" if on else "var(--border-strong)"};position:relative"><span style="position:absolute;top:2px;{"right:2px" if on else "left:2px"};width:12px;height:12px;border-radius:50%;background:#fff"></span></span></div>')
k(act(TARGET,'Utwórz szansę z przetargu','Przycisk w panelu','Użyta 3 razy · ostatnio PR-010, 2 lis',True))
k(act(BELL,'Przypomnij o terminie składania','Automat · 3 dni i 1 dzień przed terminem','Powiadomienie do opiekuna · e-mail i w aplikacji'))
k(act(CHK,'Wygrany → zadanie „Przygotuj umowę”','Automat · gdy Status zmieni się na Wygrany','Zadanie dla opiekuna, termin +3 dni robocze'))
k('</div><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:18px;padding:8px 24px 24px">')
k('<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-tertiary)">Akcja · przycisk</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Utwórz szansę z przetargu</h2></div>')
k('<section style="display:flex;flex-direction:column;gap:8px;max-width:760px">'+h3('Kiedy')+
  '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:13px">Pokaż przycisk w panelu, gdy '+capd('Status','Pole')+'<span>jest</span>'+capd(st('Przygotowanie oferty'),'Wartość')+'<span>i przetarg nie ma</span>'+capd('powiązanej szansy','Powiązanie systemowe tworzone przez akcję')+
  '<button type="button" class="capd" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border:0;border-radius:14px;color:var(--text-secondary)">'+ic(PLUS,14)+'warunek</button></div></section>')
MC='minmax(0,1fr) 24px minmax(0,1fr) 180px'
def mrow(src_,dst,how,req=False):
    return (f'<div role="row" style="display:grid;grid-template-columns:{MC};column-gap:10px;align-items:center;min-height:36px;padding:0 10px;border-radius:10px">'
            f'<span>{src_}</span>{ic(ARROW,14,"var(--text-tertiary)")}<span style="display:flex;align-items:center;gap:6px">{dst}{" "+sch("wymagane","Pole wymagane w szansie") if req else ""}</span><span style="font-size:12px;color:var(--text-secondary)">{how}</span></div>')
k('<section style="display:flex;flex-direction:column;gap:2px;max-width:760px">'+h3('Co przenieść do szansy')+
  f'<div role="row" style="display:grid;grid-template-columns:{MC};column-gap:10px;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Przetarg</span><span></span><span>Szansa</span><span>Jak</span></div>'+
  mrow('Nazwa zamówienia','Tytuł','skopiuj',True)+mrow('Zamawiający','Klient','to samo powiązanie z Firmami',True)+mrow('Nasza cena','Wartość','kwota netto',True)+mrow('Termin składania ofert','Termin decyzji','data + 30 dni (związanie ofertą)')+
  mrow('Opiekun','Opiekun','skopiuj')+mrow('Branża','Rodzaj','pierwsza z listy')+mrow('<span style="color:var(--text-secondary)">stała wartość</span>','Etap','„Oferta”')+mrow('<span style="color:var(--text-secondary)">stała wartość</span>','Źródło','„Przetarg”')+'</section>')
k('<section style="display:flex;flex-direction:column;gap:2px;max-width:760px">'+h3('Potem')+
  ''.join(f'<div style="display:flex;align-items:center;gap:10px;min-height:32px;padding:0 10px">{ic(CHECK,14,"var(--success)")}<span>{t}</span></div>' for t in ['Połącz szansę z przetargiem — powiązanie widać w obu panelach','Dodaj wpis do historii obu rekordów','Otwórz szansę w nowej karcie'])+'</section>')
k('<div role="note" style="display:flex;gap:10px;max-width:760px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(SHIELD,16,'var(--text-secondary)')+'<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Akcja działa z uprawnieniami osoby, która ją klika — kto nie może tworzyć szans, nie zobaczy przycisku. Akcje nie mogą usuwać danych ani wysyłać wiadomości do klientów bez potwierdzenia.</span></div>')
k('<div style="display:flex;gap:6px;max-width:760px">'+btn('Wypróbuj na PR-013','Pokaż, jaka szansa powstanie — bez zapisu')+SP+btn('Zapisz akcję','⌘S',CHECK,pri=True)+'</div>')
k('</div></div></sc-if>')

# =================== UPRAWNIENIA
U=[];u=U.append
u('<sc-if value="{{isTbU}}" hint-placeholder-val="{{false}}">')
u(thead(4))
u('<div style="flex:1 1 auto;display:flex;flex-direction:column;gap:20px;padding:8px 24px 24px;min-height:0">')
RC='minmax(0,0.8fr) minmax(0,1fr) repeat(5,104px)'
def yes(): return ic(CHECK,16,'var(--success)')
def no(): return '<span style="color:var(--text-tertiary)">—</span>'
def part(t,tip): return sch(t,tip)
def rr(role,sub,cells,lock=False):
    return (f'<div role="row" class="row1" style="display:grid;grid-template-columns:{RC};column-gap:12px;align-items:center;padding:0 10px;border-radius:10px">'
            f'<span style="display:flex;align-items:center;gap:6px;font-weight:500;min-width:0">{u_ci("users","indigo")}<span class="ell">{role}</span>{ic(LOCK,12,"var(--text-tertiary)") if lock else ""}</span>'
            f'<span class="ell" title="{sub}" style="font-size:12px;color:var(--text-secondary)">{sub}</span>'
            +''.join(f'<span style="display:flex;justify-content:center">{c}</span>' for c in cells)+'</div>')
u('<section style="display:flex;flex-direction:column;gap:2px;max-width:1000px">'+h3('Role')+
  f'<div role="row" style="display:grid;grid-template-columns:{RC};column-gap:12px;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>'+u_th('Rola','users','indigo')+'</span><span>'+u_th('Kto','user','pink')+'</span>'+''.join(f'<span style="text-align:center">{t}</span>' for t in ['Widzi','Dodaje','Edytuje','Archiwizuje','Ustawienia'])+'</div>'+
  rr('Administrator','Pascal Kranz',[yes(),yes(),yes(),yes(),yes()],True)+
  rr('Biuro','Agnieszka Wiśniewska',[yes(),yes(),yes(),yes(),no()])+
  rr('Technicy','4 osoby',[part('swoje','Tylko przetargi, w których są opiekunem'),no(),part('swoje','Tylko swoje — bez pól ukrytych niżej'),no(),no()])+
  rr('Klient (portal)','Nigdy — własne tabele są wewnętrzne',[no(),no(),no(),no(),no()],True)+'</section>')
FR='minmax(0,1fr) 180px 180px 180px'
def fr(name,a1,a2,a3):
    return f'<div role="row" style="display:grid;grid-template-columns:{FR};column-gap:12px;align-items:center;min-height:36px;padding:0 10px;border-radius:10px"><span>{name}</span><span style="font-size:12px">{a1}</span><span style="font-size:12px">{a2}</span><span style="font-size:12px">{a3}</span></div>'
ed_='<span style="color:var(--text-secondary)">edytuje</span>'; ro='<span style="color:var(--text-secondary)">tylko odczyt</span>'; hid='<span style="display:inline-flex;align-items:center;gap:4px;color:var(--warning)">'+ic(EYEOFF,12,'var(--warning)')+'ukryte</span>'
u('<section style="display:flex;flex-direction:column;gap:2px;max-width:1000px">'+'<div style="display:flex;align-items:center;gap:8px">'+h3('Wyjątki dla pól')+'<span style="font-size:12px;color:var(--text-tertiary)">pozostałe pola zgodnie z rolą</span>'+SP+btn('Dodaj wyjątek','Ogranicz pole dla roli',PLUS)+'</div>'+
  f'<div role="row" style="display:grid;grid-template-columns:{FR};column-gap:12px;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Pole</span><span>Biuro</span><span>Technicy</span><span>Eksport i API</span></div>'+
  fr('Nasza cena',ed_,hid,'tylko administrator')+fr('Wadium',ed_,hid,'tak')+fr('Status',ed_,ro,'tak')+fr('Dokumenty',ed_,'<span style="color:var(--text-secondary)">tylko odczyt · bez SWZ</span>','tak')+'</section>')
u('<div role="note" style="display:flex;gap:10px;max-width:1000px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(SHIELD,16,'var(--text-secondary)')+'<div style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:500">Uprawnienia sprawdza serwer, nie tylko ekran</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Ukryte pole nie trafia do przeglądarki, eksportu ani aplikacji technika. Te same zasady obowiązują w API i w akcjach tabeli.</span></div></div>')
u('<div style="display:flex;gap:6px;max-width:1000px">'+btn('Podgląd jako technik','Zobacz tabelę oczami Kacpra')+SP+btn('Zapisz uprawnienia','⌘S',CHECK,pri=True)+'</div>')
u('</div></sc-if>')

block='\n'.join(H)+'\n'+'\n'.join(K)+'\n'+'\n'.join(U)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const nPtg = navv(isPtg || isTbP || isTbS);","const isTbN = ekran === 'tabela nowa'; const isTbA = ekran === 'tabela akcje'; const isTbU = ekran === 'tabela uprawnienia'; const nPtg = navv(isPtg || isTbP || isTbS || isTbA || isTbU);")
rep("isPtg, isTbP, isTbS,","isPtg, isTbP, isTbS, isTbN, isTbA, isTbU,")
rep('"tabela panel", "planowanie"]','"tabela panel", "tabela akcje", "tabela uprawnienia", "tabela nowa", "planowanie"]')
adm="(isUst || isTbN || isTbP || isTbS || isTbA || isTbU)"
rep("meIni: isUst ? 'PK' : 'AW',","meIni: "+adm+" ? 'PK' : 'AW',")
rep("meTitle: isUst ? 'Pascal Kranz · Administrator'","meTitle: "+adm+" ? 'Pascal Kranz · Administrator'")
open(P,'w').write(s); print('ok flex2',len(s))
