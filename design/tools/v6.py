import re
P='design/canvas/Main.dc.html'
v3=open('design/tools/v3.py').read()
exec(v3[:v3.index("# ===== Magazyn")])
s=open(P).read()
def R(o,n,cnt=1):
    global s
    c=s.count(o); assert c==cnt,(o[:90],c); s=s.replace(o,n)
SORT='<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"></path>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'
SEARCH='<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>'
COG='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>'
ASTER='<path d="M12 6v12M17.2 9 6.8 15M6.8 9l10.4 6"></path>'
NOTE='<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>'
TEXT='<path d="M4 7V4h16v3M9 20h6M12 4v16"></path>'
# ======== RW dialog
i=s.index('<sc-if value="{{isDoc}}"'); j=s.index('</sc-if>',s.index('Wydaj 0,30 kg',i))+8
b=s[i:j]
icons={'rw-zl':(WRENCH,'Zlecenie'),'rw-ur':(SHC,'Urządzenie, karta F-gaz'),'rw-poz':(DROP,'Pozycja z magazynu'),'rw-lok':(BOX,'Z lokalizacji')}
for k,(icn,lab) in icons.items():
    b=re.sub(r'<span id="'+k+r'" style="[^"]*">[^<]*</span>',f'<span id="{k}" class="vh">{lab}</span>',b,count=1)
    m=re.search(r'(<button type="button" class="prop" aria-labelledby="'+k+r'"[^>]*?)style="([^"]*)">',b)
    b=b[:m.start()]+m.group(1)+f'title="{lab}" style="{m.group(2)}">'+ic(icn,16,'var(--text-tertiary)')+b[m.end():]
b=b.replace('<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 12px">','<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">')
b=b.replace('<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Ilość liczy się z różnicy mas</span>','<span title="Ilość liczy się z różnicy mas butli: przed − po" style="display:inline-flex">'+ic(INFO,14,'var(--text-tertiary)')+'</span>')
b=b.replace('border-radius:10px;background:var(--bg-raised);font:inherit;color:var(--text-primary);text-align:right','border-radius:10px;background:var(--bg-surface);font:inherit;color:var(--text-primary);text-align:right')
ul_i=b.index('<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:12px;line-height:16px">'); ul_j=b.index('</ul>',ul_i)+5
def eff(icn,col,lab,val,tip):
    return f'<li title="{tip}" style="display:flex;align-items:center;gap:8px;height:28px">{ic(icn,14,col)}<span style="flex:1 1 auto;color:var(--text-secondary)">{lab}</span><span class="num">{val}</span></li>'
b=b[:ul_i]+('<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;font-size:12px;line-height:16px">'+
   eff(BOX,'var(--text-tertiary)','Magazyn główny','3,8 → 3,5 kg','Stan R32 w magazynie głównym')+
   eff(LOCK,'var(--text-tertiary)','Rezerwacja ZS-1045','zamknięta','Rezerwacja 0,3 kg dla ZS-1045 zostanie zamknięta')+
   eff(SHC,'var(--text-tertiary)','Karta UR-2411','0,95 → 1,25 kg','Ładunek w karcie F-gaz urządzenia UR-2411')+
   eff(CO2,'var(--text-tertiary)','CO₂e','+0,20 t','Przyrost ekwiwalentu CO₂ w karcie urządzenia')+'</ul>')+b[ul_j:]
b=re.sub(r'<label for="rw-uwagi" style="[^"]*">Uwagi \(opcjonalnie\)</label>','<label for="rw-uwagi" class="vh">Uwagi</label>',b)
b=b.replace('placeholder="Np. instalacja 12 m, uzupełnienie wg instrukcji producenta"','placeholder="Uwagi, np. instalacja 12 m"')
s=s[:i]+b+s[j:]
# ======== Opcje widoku
for lab,icn in [('Grupuj według',LAYERS),('Sortuj',SORT),('Pokaż zakończone',CHECKC)]:
    R(f'<span style="flex:1 1 auto;color:var(--text-secondary)">{lab}</span>',f'<span style="flex:1 1 auto;display:flex;align-items:center;gap:8px;color:var(--text-secondary)">{ic(icn,16,"var(--text-tertiary)")}{lab}</span>')
R('<span id="op-puste" style="flex:1 1 auto;color:var(--text-secondary)">Pokaż puste grupy</span>','<span id="op-puste" style="flex:1 1 auto;display:flex;align-items:center;gap:8px;color:var(--text-secondary)">'+ic(EYE,16,'var(--text-tertiary)')+'Puste grupy</span>')
R('<div style="padding:8px 8px 4px;font-size:12px;line-height:16px;font-weight:500;color:var(--text-tertiary)">Kolumny</div>','<div style="display:flex;align-items:center;gap:6px;padding:8px 8px 4px;font-size:12px;line-height:16px;font-weight:500;color:var(--text-tertiary)">Kolumny<span title="Kliknij, aby pokazać lub ukryć kolumnę" style="display:inline-flex">'+ic(INFO,12,'var(--text-tertiary)')+'</span></div>')
s=s.replace('<button type="button" aria-pressed="true" style="height:24px;padding:0 8px;border:0;border-radius:8px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px">','<button type="button" aria-pressed="true" style="height:24px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border:0;border-radius:12px;background:var(--bg-subtle);color:var(--text-primary);font-size:12px">'+ic('<path d="M20 6 9 17l-5-5"></path>',12,'var(--text-secondary)'))
s=s.replace('class="chip-off" style="height:24px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-tertiary);font-size:12px">','class="chip-off" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border:0;border-radius:12px;background:transparent;color:var(--text-tertiary);font-size:12px;box-shadow:inset 0 0 0 1px var(--edge)">')
R('padding:0 8px;border:0;border-radius:8px;color:var(--text-secondary)">Przywróć domyślne</button>','padding:0 8px;border:0;border-radius:8px;color:var(--text-secondary)">Domyślne</button>')
R('font-weight:500">Zapisz jako widok</button>','font-weight:500;display:inline-flex;align-items:center;gap:6px;padding-left:8px">'+ic(PLUS,14)+'Zapisz widok</button>')
# ======== Filtr kategorii
R('<label for="kat-szukaj" class="vh">Szukaj kategorii</label><input id="kat-szukaj" placeholder="Szukaj kategorii…" style="height:32px;padding:0 8px;','<label for="kat-szukaj" class="vh">Szukaj kategorii</label><span style="position:relative;display:flex"><span style="position:absolute;left:8px;top:8px;display:inline-flex">'+ic(SEARCH,16,'var(--text-tertiary)')+'</span><input id="kat-szukaj" placeholder="Szukaj…" style="width:100%;height:32px;padding:0 8px 0 30px;')
i=s.index('<input id="kat-szukaj"'); j=s.index('>',i)+1; s=s[:j]+'</span>'+s[j:]
R('font-size:12px">Zarządzaj kategoriami</button>','font-size:12px;display:inline-flex;align-items:center;gap:6px" title="Zarządzaj kategoriami: nazwy i kolory">'+ic(COG,14)+'Zarządzaj</button>')
# ======== Szablony
R('<a href="#" class="row {{t.selClass}}" aria-current="{{t.cur}}" style="display:flex;flex-direction:column;gap:2px;padding:8px;border-radius:8px"><span class="ell" style="font-weight:500">{{t.n}}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{{t.sub}}</span></a>',
  '<a href="#" class="row {{t.selClass}}" aria-current="{{t.cur}}" title="{{t.sub}}" style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:10px">'+ic(FILE,16,'var(--text-tertiary)')+'<span class="ell" style="flex:1 1 auto;font-weight:500">{{t.n}}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{{t.cnt}}</span></a>')
R('<input id="sz-szukaj" placeholder="Szukaj szablonu…" style="height:28px;margin:0 4px 8px;padding:0 8px;','<input id="sz-szukaj" placeholder="Szukaj…" style="height:28px;margin:0 4px 8px;padding:0 8px;')
i=s.index('<dl style="margin:0;display:grid;grid-template-columns:120px minmax(0,1fr);row-gap:6px;font-size:12px;line-height:20px">'); j=s.index('</dl>',i)+5
s=s[:i]+('<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px">'+
  chip(WRENCH,'var(--text-tertiary)','Kontrola szczelności F-gaz','Typ zlecenia, który używa tego szablonu')+chip(WRENCH,'var(--text-tertiary)','Kontrola po naprawie','Typ zlecenia, który używa tego szablonu')+
  '<span style="width:1px;height:16px;margin:0 6px;background:var(--edge)"></span><span style="font-size:12px;color:var(--text-tertiary);margin-right:2px">zapisuje do</span>'+
  chip(SHC,'var(--success)','','Karta F-gaz urządzenia i wpis do CRO')+chip(BOX,'var(--text-tertiary)','','Magazyn: wydanie i odzysk czynnika')+chip(GAUGE,'var(--text-tertiary)','','Parametry pracy urządzenia')+chip(FILE,'var(--text-tertiary)','','Protokół PDF do klienta')+'</div>')+s[j:]
R('<span style="font-size:12px;color:var(--text-tertiary)">kolejność = kolejność na telefonie</span>','<span title="Kolejność sekcji = kolejność na telefonie technika. Przeciągnij, aby zmienić." style="display:inline-flex">'+ic(INFO,14,'var(--text-tertiary)')+'</span>')
R('<span style="display:flex;align-items:baseline;gap:8px;min-width:0"><button type="button" class="ell" style="flex:0 1 auto;border:0;padding:0;background:transparent;font-weight:500;text-align:left">{{s.n}}</button><span class="ell" style="flex:0 10000 auto;font-size:12px;color:var(--text-secondary)">{{s.sum}}</span></span>',
  '<span title="{{s.sum}}" style="display:flex;align-items:center;gap:8px;min-width:0"><button type="button" class="ell" style="flex:0 1 auto;border:0;padding:0;background:transparent;font-weight:500;text-align:left">{{s.n}}</button></span>')
R('<span style="font-size:12px;color:{{s.reqC}}">{{s.req}}</span>','<span title="Sekcja {{s.req}}" style="display:inline-flex"><sc-if value="{{s.isReq}}" hint-placeholder-val="{{true}}">'+ic(ASTER,14,'var(--danger)')+'</sc-if><sc-if value="{{s.isOpt}}" hint-placeholder-val="{{false}}">'+ic('<circle cx="12" cy="12" r="4"></circle>',14,'var(--text-tertiary)')+'</sc-if></span>')
R('<div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1 1 auto;margin:0;font-size:13px;line-height:20px;font-weight:500">Sekcja: Pomiary</h3><span style="font-size:12px;color:var(--text-tertiary)">typ Pomiary</span></div>',
  '<div style="display:flex;align-items:center;gap:8px"><h3 style="flex:1 1 auto;margin:0;font-size:13px;line-height:20px;font-weight:500">Pomiary</h3>'+chip(GAUGE,'var(--text-tertiary)','Pomiary','Typ sekcji')+'</div>')
R('<div style="display:flex;flex-direction:column;gap:4px"><label for="sz-nazwa" style="font-size:12px;line-height:16px;color:var(--text-secondary)">Nazwa na telefonie</label><input id="sz-nazwa" value="Pomiary" style="height:32px;padding:0 8px;',
  '<div style="display:flex;flex-direction:column;gap:4px"><label for="sz-nazwa" class="vh">Nazwa na telefonie</label><span style="position:relative;display:flex" title="Nazwa sekcji na telefonie technika"><span style="position:absolute;left:8px;top:8px;display:inline-flex">'+ic(TEXT,16,'var(--text-tertiary)')+'</span><input id="sz-nazwa" value="Pomiary" style="width:100%;height:32px;padding:0 8px 0 30px;')
i=s.index('<input id="sz-nazwa"'); j=s.index('>',i)+1; s=s[:j]+'</span>'+s[j:]
for idv,lab,short,icn in [('sz-wym','Sekcja wymagana','Wymagana',ASTER),('sz-norma','Ostrzegaj o wartości poza normą','Ostrzeżenie poza normą',WARN)]:
    R(f'<span id="{idv}" style="flex:1 1 auto">{lab}</span>',f'<span id="{idv}" title="{lab}" style="flex:1 1 auto;display:flex;align-items:center;gap:8px">{ic(icn,16,"var(--text-tertiary)")}{short}</span>')
R('<span style="flex:1 1 auto">Warunek wyświetlenia</span>','<span title="Warunek wyświetlenia sekcji" style="flex:1 1 auto;display:flex;align-items:center;gap:8px">'+ic(EYE,16,'var(--text-tertiary)')+'Pokaż</span>')
R('<span style="font-size:12px;color:var(--text-tertiary)">normy z karty urządzenia</span>','<span title="Normy pobierane z karty urządzenia. Wartości trafiają do zakładki Parametry, więc kolejne wizyty da się porównać." style="display:inline-flex">'+ic(INFO,14,'var(--text-tertiary)')+'</span>')
R('<p style="margin:0;font-size:12px;line-height:16px;color:var(--text-tertiary)">Wartości trafiają do zakładki Parametry na karcie urządzenia, więc kolejne wizyty da się porównać.</p>\n','')
# JS
s=s.replace('    const fView = {',"    sTpl.forEach((t) => { const m = (t.sub || '').match(/(\\d+) sekcj/); t.cnt = m ? m[1] : ''; });\n    sSec.forEach((x) => { x.isReq = x.req === 'wymagana'; x.isOpt = !x.isReq; });\n    const fView = {",1)
open(P,'w').write(s); print('ok')
