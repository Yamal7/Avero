# Ustawienia › Pola własne: dodatkowe pola w modułach rdzenia (Firmy, Obiekty…) i gdzie się pokazują; podgląd w panelu Zgłoszenia.
# Scenariusz: piątek 20 lis 2026, 19:20 — Pascal (administrator).
_u=open('design/tools/ustawienia.py').read()
exec(_u.split("# =========== PROFIL FIRMY")[0])   # helpery + ikony + s
CHECK='<path d="M20 6 9 17l-5-5"></path>'
TXT='<path d="M4 7V4h16v3M9 20h6M12 4v16"></path>'
SEL='<circle cx="12" cy="12" r="10"></circle><path d="m8 11 4 4 4-4"></path>'
BOOL='<rect width="20" height="12" x="2" y="6" rx="6"></rect><circle cx="16" cy="12" r="2"></circle>'
CLOCKI='<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>'
GRIP='<circle cx="9" cy="6" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="18" r="1"></circle>'
SHIELD='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
INBOX='<path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>'
def pbtn(t,tip,icon=''):
    return f'<button type="button" class="pri" title="{tip}" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
def mtabs(items,cur):
    return '<div style="display:flex;flex-wrap:wrap;gap:4px">'+''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate(items))+'</div>'
FC='16px 16px minmax(0,1.6fr) 96px minmax(0,1.3fr) 84px'
def frow_(icon,name,typ,places,who,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{FC};column-gap:10px;align-items:center;min-height:40px;padding:2px 10px;border-radius:10px;{bg}">'
            f'<span style="display:inline-flex">{ic(GRIP,14,"var(--text-tertiary)")}</span>{ic(icon,14,"var(--text-secondary)")}<span class="ell" style="font-weight:{500 if sel else 400}">{name}</span>'
            f'<span style="font-size:12px;color:var(--text-secondary)">{typ}</span><span style="display:flex;flex-wrap:wrap;gap:4px;min-width:0">{places}</span><span style="font-size:12px;color:var(--text-secondary)">{who}</span></div>')
pl=lambda t,tip='': sch(t,tip)
def place(on,title,sub,extra=''):
    return (f'<div style="display:grid;grid-template-columns:28px minmax(0,1fr) auto;column-gap:10px;align-items:center;min-height:44px;padding:4px 0">{tog(on,title)}'
            f'<span style="display:flex;flex-direction:column;min-width:0"><span style="font-weight:500">{title}</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span>{extra}</div>')
C=(head('Pola własne','Dodatkowe pola w modułach programu. Pola systemowe i to, co Avero liczy samo (stany, F-gaz, ceny), zostają bez zmian.',pbtn('Dodaj pole','Dodaj pole do modułu Firmy  N',PLUS))+
   mtabs([('Firmy','3'),('Obiekty','2'),('Urządzenia','1'),('Zlecenia','1'),('Zgłoszenia','0'),('Oferty','0')],0)+
   '<section style="display:flex;flex-direction:column;gap:2px;margin-top:-8px">'
   f'<div role="row" style="display:grid;grid-template-columns:{FC};column-gap:10px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span></span><span></span><span>Pole</span><span>Typ</span><span>Gdzie widać</span><span>Kto zmienia</span></div>'+
   frow_(BOOL,'Numer PO na fakturze','Tak / nie',pl('karta firmy')+pl('zgłoszenia')+pl('faktura','Kontrola przed wystawieniem'),'biuro',sel=True)+
   frow_(SEL,'Grupa zakupowa','Wybór · 3 opcje',pl('karta firmy')+pl('lista Firm','Kolumna i filtr'),'biuro')+
   frow_(SEL,'Preferowany kontakt','Wybór · 3 opcje',pl('karta firmy')+pl('zgłoszenia')+pl('telefon technika'),'biuro, technik')+
   '<span style="padding:6px 10px 0;font-size:12px;line-height:16px;color:var(--text-tertiary)">Obiekty: „Godziny dostępu” i „Parking dla busa” — widzi technik w zleceniu. Nie zapisujemy kodów do drzwi ani alarmów.</span></section>'+
   '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Numer PO na fakturze</h3>'+sch('Firmy · tak / nie','Typ ustalony przy tworzeniu pola')+'</div>'
   '<div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:12px;background:var(--bg-raised)">'+
   place(True,'Karta firmy','Sekcja „Rozliczenia”, pod warunkami płatności')+sep()+
   place(True,'Panel zgłoszenia i zlecenia','Sekcja „Klient” — biuro widzi to, zanim umówi wizytę',sch('tylko gdy „tak”','Pole puste lub „nie” — sekcja się nie pokazuje'))+sep()+
   place(False,'Telefon technika','Technik nie potrzebuje tej informacji')+sep()+
   place(True,'Faktura — kontrola przed wystawieniem','Bez numeru PO Avero zatrzyma wystawienie z komunikatem „Hotel Oliwski wymaga numeru PO”',sch(ic(SHIELD,12,'var(--text-tertiary)')+'reguła','Działa też w API i przy fakturach z umów'))+sep()+
   place(False,'Portal klienta','Klient nigdy nie widzi pól wewnętrznych — włączenie tylko dla pól oznaczonych „dla klienta”')+
   '</div></section>'+
   '<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-tertiary)">'+ic(SHIELD,14,'var(--text-tertiary)')+'<span>Uprawnienia sprawdza serwer. Pole ukryte dla roli nie trafia do aplikacji, eksportu ani API.</span></div>')
# podgląd: panel zgłoszenia ZG-0912
A=('<aside aria-label="Podgląd: panel zgłoszenia" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:14px;padding:20px 12px 24px">'
   '<div style="display:flex;align-items:center;gap:8px;padding:0 8px"><span style="font-size:12px;font-weight:500;color:var(--text-secondary)">Podgląd</span>'+SP+'<span style="font-size:12px;color:var(--text-tertiary)">panel zgłoszenia ZG-0912</span></div>'
   '<div style="display:flex;flex-direction:column;gap:14px;margin:0 4px;padding:14px 12px;border-radius:12px;background:var(--bg-raised)">'
   '<div style="display:flex;flex-direction:column;gap:4px"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZG-0912</span><span style="font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Agregat Bitzer stanął, komora 9 °C</span>'
   '<span style="font-size:12px;color:var(--text-secondary)">Hotel Oliwski · kuchnia i restauracja</span></div>'
   '<div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:12px;font-weight:500;color:var(--text-tertiary)">Klient</span>'+
   kv('Kontakt','Ewa Malinowska · kuchnia',tip='Szefowa kuchni')+
   kv('Preferowany kontakt','telefon',vc='var(--text-secondary)',tip='Pole własne · Firmy')+
   '<div title="Pole własne · Firmy · reguła faktury" style="display:flex;align-items:center;gap:8px;min-height:28px;margin:2px -6px;padding:0 6px;border-radius:8px;box-shadow:inset 0 0 0 1.5px var(--accent)"><span style="flex:1 1 auto;font-size:12px;color:var(--text-secondary)">Numer PO na fakturze</span><span style="font-weight:500">wymagany</span></div>'
   '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Poproś o numer PO przy potwierdzaniu wizyty.</span></div>'
   '<div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:12px;font-weight:500;color:var(--text-tertiary)">Obiekt</span>'+
   kv('Godziny dostępu','6:00–22:00, dostawy 11:00',vc='var(--text-secondary)',tip='Pole własne · Obiekty')+kv('Parking dla busa','zaplecze, od Opackiej',vc='var(--text-secondary)',tip='Pole własne · Obiekty')+'</div>'
   '</div>'
   '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Pola własne trafiają do istniejących sekcji modułu, pod polami systemowymi. Obwiedzione — pole, które edytujesz.</span></aside>')
H=['<sc-if value="{{isUst}}" hint-placeholder-val="{{false}}">',wrap('isUstPW','pola',C,A),'</sc-if>']
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("isUstW: isUst && ustV === 'wygląd',","isUstW: isUst && ustV === 'wygląd', isUstPW: isUst && ustV === 'pola własne',")
rep('"powiadomienia", "wygląd"]','"powiadomienia", "wygląd", "pola własne"]')
open(P,'w').write(s); print('ok ustawienia3',len(s))
