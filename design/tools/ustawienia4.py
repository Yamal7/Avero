# Ustawienia › Moduły i pakiety: pakiety branżowe, moduły rdzenia (włącz / wyłącz), konfiguracja firmy; panel pakietu HVACR.
# Scenariusz: sobota 21 lis 2026 — Pascal (administrator). Zasady: docs/design/LAYERS.md.
_u=open('design/tools/ustawienia.py').read()
exec(_u.split("# =========== PROFIL FIRMY")[0])
CHECK='<path d="M20 6 9 17l-5-5"></path>'
PKG='<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12M3.29 7 12 12l8.71-5M7.5 4.27l9 5.15"></path>'
SNOWI='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
BOLT='<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>'
DROP='<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>'
SUN='<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>'
SLIDERS='<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"></path>'
TABLEI='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18"></path>'
SHIELD='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
dot=lambda c: f'<span aria-hidden="true" style="width:6px;height:6px;border-radius:50%;background:{c};flex:0 0 auto"></span>'
def tile(icon,col,name,sub,state,sel=False,dim=False):
    ring='box-shadow:inset 0 0 0 1.5px var(--accent);' if sel else ''
    op='opacity:.6;' if dim else ''
    return (f'<div role="option" aria-selected="{str(sel).lower()}" class="row" style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:12px;background:var(--bg-raised);{ring}{op}min-width:0">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="width:28px;height:28px;border-radius:8px;background:var(--bg-surface);display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto">{ic(icon,16,col)}</span>'
            f'<span style="font-weight:500;flex:1 1 auto">{name}</span>{state}</div>'
            f'<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">{sub}</span></div>')
def mrow(on,name,sub,note='',lock=False):
    t=tog(on,name) if not lock else f'<span title="Wymagany przez pakiet HVACR" style="opacity:.5">{tog(on,name)}</span>'
    return (f'<div style="display:grid;grid-template-columns:28px minmax(0,1fr) auto;column-gap:10px;align-items:center;min-height:44px;padding:4px 0">{t}'
            f'<span style="display:flex;flex-direction:column;min-width:0"><span style="font-weight:500">{name}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span>{note}</div>')
ON=lambda: sch(dot('var(--success)')+'aktywny','Włączony 1 mar 2026 · wersja 1.4')
PREP=lambda t: sch(t,'Pakiet w przygotowaniu — Avero powiadomi, gdy będzie dostępny')
C=(head('Moduły i pakiety','Co jest włączone w Kranz HVACR. Wyłączenie ukrywa moduł w menu i w ⌘K — dane zostają i wracają po ponownym włączeniu.','')+
   '<section style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;align-items:baseline;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Pakiety branżowe</h3><span style="font-size:12px;color:var(--text-tertiary)">prawo, słownictwo, szablony i reguły jednej branży · można łączyć</span></div>'
   '<div role="listbox" aria-label="Pakiety branżowe" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">'+
   tile(SNOWI,'#3B82D6','HVACR','Chłodnictwo, klimatyzacja, pompy ciepła: F-gaz i CRO, czynniki, kontrole szczelności, protokoły uruchomień.',ON(),sel=True)+
   tile(BOLT,'#C98A12','Elektro','Pomiary ochronne i protokoły pomiarów elektrycznych, terminy badań instalacji.',PREP('w przygotowaniu'),dim=True)+
   tile(DROP,'#2BB3B1','Instalacje wod-kan i gaz','Próby szczelności instalacji, przeglądy gazowe, protokoły odbiorów.',PREP('w przygotowaniu'),dim=True)+
   tile(SUN,'#E0702A','Fotowoltaika','Moc, falowniki, przeglądy instalacji PV i dokumenty do zgłoszenia mikroinstalacji.',PREP('planowany'),dim=True)+'</div></section>'+
   '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:baseline;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Moduły</h3><span style="font-size:12px;color:var(--text-tertiary)">rdzeń programu, wspólny dla każdej branży</span></div>'
   '<div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:12px;background:var(--bg-raised)">'+
   mrow(True,'Sprzedaż','Leady, Szanse, Oferty')+sep()+mrow(True,'Projekty','Etapy, harmonogram płatności, oś czasu')+sep()+
   mrow(True,'Umowy','Umowy serwisowe, ryczałty, faktury zbiorcze')+sep()+
   mrow(True,'Urządzenia i Przeglądy','Sprzęt u klienta, przeglądy okresowe, gwarancje',sch(ic(PKG,12,'var(--text-tertiary)')+'wymagany przez HVACR','Pakiet HVACR korzysta z urządzeń i przeglądów'),lock=True)+sep()+
   mrow(True,'Reklamacje i gwarancje','Reklamacje klientów, roszczenia do dostawców')+sep()+
   mrow(True,'Katalog i Magazyn','Pozycje, stany, partie, wydania na zlecenia',sch(ic(PKG,12,'var(--text-tertiary)')+'wymagany przez HVACR','Rejestr czynnika'),lock=True)+sep()+
   mrow(True,'Zakupy','Zapotrzebowanie, zamówienia, dostawcy, cenniki')+sep()+
   mrow(True,'Portal klienta','Faktury, wizyty i zamówienia klienta pod osobistym linkiem')+'</div>'
   '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Zawsze włączone: Skrzynka, Mój dzień, Zadania, Firmy i osoby, Obiekty, Zgłoszenia, Zlecenia, Planowanie, Faktury, Raporty, Ustawienia.</span></section>'+
   '<section style="display:flex;flex-direction:column;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Konfiguracja firmy</h3>'
   '<div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:12px;background:var(--bg-raised)">'+
   ''.join(f'<a href="#" class="row" style="display:grid;grid-template-columns:20px minmax(0,1fr) auto 14px;column-gap:10px;align-items:center;min-height:40px">{ic(icn,16,"var(--text-secondary)")}<span>{t}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{n}</span>{ic(CHEV,14,"var(--text-tertiary)")}</a>'+(sep() if i<3 else '')
           for i,(icn,t,n) in enumerate([(TABLEI,'Własne tabele','1 · Przetargi'),(SLIDERS,'Pola własne','7 pól w 4 modułach'),(LIST if 'LIST' in globals() else TABLEI,'Szablony protokołów i dokumentów','12 · 4 z pakietu HVACR'),(SHIELD,'Role i uprawnienia','5 ról')]))+
   '</div></section>')
A=('<aside aria-label="Pakiet HVACR" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:20px 12px 24px">'
   '<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span style="font-size:12px;color:var(--text-tertiary)">Pakiet branżowy · Avero · wersja 1.4</span>'
   '<h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">HVACR</h2>'
   '<span style="font-size:12px;color:var(--text-secondary)">Włączony 1 mar 2026 przez Pascala</span></div>'
   '<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Co dodaje')+
   '<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
   kv('Typy urządzeń','6',tip='Chłodnictwo komercyjne, agregat, klimatyzator split, VRV, pompa ciepła, rekuperator')+
   kv('Typ przeglądu','kontrola szczelności',vc='var(--text-secondary)',tip='Częstotliwość z t CO₂e: 5–50 t co 12 mies., 50–500 t co 6, od 500 t co 3; system wykrywania wycieków wydłuża dwukrotnie')+
   kv('Reguły','3',tip='Częstotliwość kontroli tylko z dokumentu · zakaz świeżego czynnika GWP > 2500 · regenerowany do 2029')+
   kv('Szablony protokołów','4',tip='Kontrola szczelności, pomiar ciśnień, uruchomienie pompy ciepła, odbiór VRV')+
   kv('Sekcje i kolumny','6',tip='Czynnik i F-gaz w urządzeniu, F-gaz w karcie firmy, t CO₂e w Obiektach, czynnik w wydaniu, certyfikaty techników, parametry pompy w ofercie')+
   kv('Raporty i widżety','3',tip='Raport F-gaz / CRO, kontrole po terminie w Mój dzień, czynnik w pojazdach')+
   kv('Słownik','14 pojęć',vc='var(--text-secondary)',tip='Czynnik, ładunek, t CO₂e, CRO, GWP, regenerat…')+'</div></section>'
   '<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Dane w programie')+
   '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
   kv('Urządzenia z czynnikiem','214',tip='W 84 obiektach')+kv('Ładunek razem','1 434 t CO₂e',vc='var(--text-secondary)')+kv('Kontrole w 2026','41 · 3 po terminie',vc='var(--text-secondary)')+'</div></section>'
   '<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Wymaga')+
   '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-secondary)">Urządzenia i Przeglądy, Katalog i Magazyn — tych modułów nie wyłączysz, dopóki pakiet jest aktywny.</span></section>'
   '<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'
   '<button type="button" class="sec" title="Ukryje sekcje, kontrole i raport F-gaz. Dane zostają. Wymaga potwierdzenia — obowiązki F-gaz nie znikają." style="height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;background:var(--bg-subtle);color:var(--danger);font-size:12px;font-weight:500">Wyłącz pakiet…</button>'
   '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary);padding:0 4px">Obowiązki F-gaz zostają po stronie firmy — Avero poprosi o potwierdzenie.</span></div></aside>')
H=['<sc-if value="{{isUst}}" hint-placeholder-val="{{false}}">',wrap('isUstMP','moduly',C,A),'</sc-if>']
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,(x[:60],s.count(x)); s=s.replace(x,y)
rep("isUstPW: isUst && ustV === 'pola własne',","isUstPW: isUst && ustV === 'pola własne', isUstMP: isUst && ustV === 'moduły i pakiety',")
rep('"wygląd", "pola własne"]','"wygląd", "pola własne", "moduły i pakiety"]')
open(P,'w').write(s); print('ok ustawienia4',len(s))
