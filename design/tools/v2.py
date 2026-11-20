import re
P='design/canvas/Main.dc.html'
s=open(P).read()
zsrc=open('design/tools/zl2.py').read()
exec(zsrc.split("H=[];a=H.append")[0])
exec(zsrc[zsrc.index('def prop('):zsrc.index('def kv(')])
s=open(P).read()
CALX='<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4"></path>'
CALC='<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path><path d="M16 2v4M8 2v4M3 10h5"></path><circle cx="16" cy="16" r="6"></circle><path d="M16 14v2l1 1"></path>'
SHC='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>'
RADAR='<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62A10 10 0 1 0 21.31 8.35M16.24 7.76A6 6 0 1 0 8.23 16.67M12 18h.01M17.99 11.66A6 6 0 0 1 15.77 16.67"></path><circle cx="12" cy="12" r="2"></circle><path d="m13.41 10.59 5.66-5.66"></path>'
GAUGE='<path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path>'
UPLOAD='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>'
FACT='<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>'
CO2='<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>'
def svgj(p,size=14,col='currentColor'):  # svg for inside templates
    return ic(p,size,col)

# ---------- 1. Zlecenie: restore old as V1
old=open('/home/claude/avero/Main.pre-zl2.html').read()
i=old.index('<sc-if value="{{isZlec}}"'); j=old.index('<sc-if value="{{isPlan}}"')
oldblk=old[i:j].replace('<sc-if value="{{isZlec}}"','<sc-if value="{{isZlecV1}}"',1)
s=s.replace('<sc-if value="{{isZlec}}"','<sc-if value="{{isZlecV2}}"',1)
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+oldblk+s[k:]

# ---------- 2. F-gaz tab V2
i=s.index('<sc-if value="{{kFg}}" hint-placeholder-val="{{false}}">')
j=s.index('</sc-if>\n',s.index('</section>\n</div>\n',s.index('Dziennik operacji',i)))+len('</sc-if>\n')
oldfg=s[i:j]
v1=oldfg.replace('<sc-if value="{{kFg}}"','<sc-if value="{{kFgV1}}"',1)
H=[];a=H.append
a('<sc-if value="{{kFgV2}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;flex-direction:column;gap:24px;padding:20px 24px 32px">')
a('<div role="status" style="display:flex;align-items:center;gap:6px;min-height:40px;padding:8px 8px 8px 12px;border-radius:12px;background:var(--bg-raised)">'+
  chip(CALX,'var(--danger)','1 po terminie','UR-3125 Szafa mroźnicza, Sopot: kontrola po terminie 13 dni','var(--bg-surface)')+
  chip(CALC,'var(--warning)','1 w 30 dni','UR-3107 Agregat Bitzer: kontrola 4 gru, za 19 dni','var(--bg-surface)')+
  chip(UPLOAD,'var(--warning)','1 do CRO','RW/2026/10/088 czeka na wpis w CRO','var(--bg-surface)')+SP+
  '<button type="button" class="sec" title="Zaplanuj zaległe i najbliższe kontrole" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500">'+ic(CAL,14)+'Zaplanuj</button>'
  '<button type="button" class="sec" title="Raport roczny dla operatora (PDF)" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500">'+ic(FILE,14)+'Raport</button></div>')
def fact(icon,col,label,val,tip):
    return f'<div title="{tip}" style="display:flex;flex-direction:column;gap:2px"><dt style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--text-secondary)">{ic(icon,14,col)}{label}</dt><dd class="num" style="margin:0;font-size:18px;line-height:26px;font-weight:600">{val}</dd></div>'
a('<dl style="margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px">'+
  fact(SHC,'var(--text-tertiary)','Objęte kontrolą','31 <span style="font-size:13px;font-weight:400;color:var(--text-tertiary)">/ 112</span>','31 z 112 urządzeń firmy podlega kontroli szczelności')+
  fact(CO2,'var(--text-tertiary)','Ładunek','412,8 t','412,8 t CO₂e łącznie, 78% w R404A')+
  fact(DROP,'var(--text-tertiary)','Uzupełnienia, 12 mies.','2,5 kg','8,8 t CO₂e w 2 operacjach')+
  fact(UPLOAD,'var(--warning)','Do CRO','1','RW/2026/10/088 czeka na wpis')+'</dl>')
G='minmax(0,1fr) 88px 64px 64px 104px 72px 104px'
a('<section style="display:flex;flex-direction:column;gap:4px">'
  '<div style="display:flex;align-items:center;gap:8px;height:32px"><h3 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Urządzenia objęte kontrolą</h3>'+CNT(31)+
  '<span title="Częstotliwość wg (UE) 2024/573: od 5 t CO₂e co 12 mies., od 50 t co 6 mies., od 500 t co 3 mies.; z systemem wykrywania wycieków okres dwa razy dłuższy" style="display:inline-flex">'+ic(INFO,14,'var(--text-tertiary)')+'</span>'+SP+ghost('Pokaż wszystkie')+'</div>'
  f'<div style="display:grid;grid-template-columns:{G};column-gap:12px;align-items:center;height:28px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span>Urządzenie</span><span>Czynnik</span><span style="text-align:right">Ładunek</span><span style="text-align:right">CO₂e</span><span>Kontrola</span><span>Ostatnia</span><span style="text-align:right">Następna</span></div>'
  '<div style="margin:0 -8px"><sc-for list="{{kDev}}" as="u" hint-placeholder-count="7">'
  f'<a href="#" class="row" title="{{{{u.id}}}} · {{{{u.place}}}}" style="display:grid;grid-template-columns:{G};column-gap:12px;align-items:center;height:36px;padding:0 8px;border-radius:10px">'
  '<span style="display:flex;align-items:center;gap:8px;min-width:0"><span class="mono" style="flex:0 0 auto;font-size:11px;color:var(--text-tertiary)">{{u.id}}</span><span class="ell" style="font-weight:500">{{u.name}}</span></span>'
  '<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px">'+ic(DROP,12,'var(--text-tertiary)')+'<span class="mono" style="font-size:11px">{{u.gas}}</span></span>'
  '<span class="num" style="text-align:right">{{u.charge}}</span><span class="num" style="text-align:right;color:var(--text-secondary)">{{u.co2}}</span>'
  '<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">{{u.freqS}}<sc-if value="{{u.det}}" hint-placeholder-val="{{false}}"><span title="System wykrywania wycieków: okres wydłużony dwukrotnie" style="display:inline-flex">'+ic(RADAR,14,'var(--success)')+'</span></sc-if></span>'
  '<span class="num" style="font-size:12px;color:var(--text-secondary)">{{u.lastS}}</span>'
  '<span title="{{u.nextNote}}" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;color:{{u.dueC}};font-weight:{{u.dueW}}">'
  '<sc-if value="{{u.late}}" hint-placeholder-val="{{false}}">'+ic(CALX,14,'var(--danger)')+'</sc-if><sc-if value="{{u.soon}}" hint-placeholder-val="{{false}}">'+ic(CALC,14,'var(--warning)')+'</sc-if><sc-if value="{{u.calOk}}" hint-placeholder-val="{{true}}">'+ic(CAL,14,'var(--text-tertiary)')+'</sc-if><span class="num">{{u.nextS}}</span></span></a></sc-for></div></section>')
L='56px 128px minmax(0,1fr) 64px 20px 20px 24px'
a('<section style="display:flex;flex-direction:column;gap:4px">'
  '<div style="display:flex;align-items:center;gap:8px;height:32px"><h3 style="flex:1 1 auto;margin:0;font-size:13px;line-height:20px;font-weight:500">Dziennik operacji</h3>'+ghost(ic(UPLOAD,14)+'CSV','Eksportuj CSV')+
  '<button type="button" class="sec" title="Nowa kontrola szczelności  K" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-subtle);font-weight:500">'+ic(PLUS,14)+'Nowa kontrola</button></div>'
  f'<div style="display:grid;grid-template-columns:{L};column-gap:12px;align-items:center;height:28px;font-size:12px;line-height:16px;color:var(--text-tertiary)"><span>Data</span><span>Operacja</span><span>Urządzenie</span><span style="text-align:right">Ilość</span><span title="Wynik">W.</span><span title="Technik">T.</span><span title="Wpis w CRO">CRO</span></div>'
  '<div style="margin:0 -8px"><sc-for list="{{kLog}}" as="l" hint-placeholder-count="8">'
  f'<a href="#" class="row" title="{{{{l.doc}}}} · {{{{l.op}}}} · {{{{l.co2}}}} CO₂e" style="display:grid;grid-template-columns:{L};column-gap:12px;align-items:center;height:36px;padding:0 8px;border-radius:10px">'
  '<span class="num" title="{{l.dateFull}}" style="font-size:12px;color:var(--text-secondary)">{{l.date}}</span>'
  '<span style="display:flex;align-items:center;gap:6px;min-width:0"><sc-if value="{{l.isK}}" hint-placeholder-val="{{true}}">'+ic(SHC,14,'var(--text-tertiary)')+'</sc-if><sc-if value="{{l.isU}}" hint-placeholder-val="{{false}}">'+ic(DROP,14,'var(--text-tertiary)')+'</sc-if><sc-if value="{{l.isN}}" hint-placeholder-val="{{false}}">'+ic(WRENCH,14,'var(--text-tertiary)')+'</sc-if><span class="ell" style="font-weight:500">{{l.opS}}</span></span>'
  '<span style="display:flex;align-items:center;gap:8px;min-width:0"><span class="mono" style="font-size:11px;color:var(--text-tertiary)">{{l.dev}}</span><span class="ell" style="color:var(--text-secondary)">{{l.devName}}</span></span>'
  '<span class="num" style="text-align:right;color:{{l.qtyC}}">{{l.qty}}</span>'
  '<span title="{{l.resT}}" style="display:inline-flex"><sc-if value="{{l.okRes}}" hint-placeholder-val="{{true}}">'+ic(CHECKC,14,'var(--success)')+'</sc-if><sc-if value="{{l.leak}}" hint-placeholder-val="{{false}}">'+ic(WARN,14,'var(--warning)')+'</sc-if><sc-if value="{{l.otherRes}}" hint-placeholder-val="{{false}}">'+ic(INFO,14,'var(--text-tertiary)')+'</sc-if></span>'
  '<span title="{{l.techName}}" style="width:20px;height:20px;border-radius:50%;background:{{l.tc}};display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff">{{l.tech}}</span>'
  '<span title="{{l.croTip}}" style="display:inline-flex"><sc-if value="{{l.ok}}" hint-placeholder-val="{{true}}">'+ic(CHECKC,14,'var(--success)')+'</sc-if><sc-if value="{{l.pend}}" hint-placeholder-val="{{false}}">'+ic(UPLOAD,14,'var(--warning)')+'</sc-if></span>'
  '</a></sc-for></div></section>')
a('</div>\n</sc-if>\n')
s=s.replace(oldfg, v1+'\n'.join(H))

# ---------- 3. Device page V2
i=s.index('<sc-if value="{{isUrz}}" hint-placeholder-val="{{false}}">'); j=s.index('<sc-if value="{{isSzab}}"')
oldurz=s[i:j]
v1=oldurz.replace('<sc-if value="{{isUrz}}"','<sc-if value="{{isUrzV1}}"',1)
H=[];a=H.append
a('<sc-if value="{{isUrzV2}}" hint-placeholder-val="{{false}}">')
# reuse old header bar (breadcrumb line) from old block
hdr_end=oldurz.index('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0">')
a(oldurz[len('<sc-if value="{{isUrz}}" hint-placeholder-val="{{false}}">'):hdr_end])
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;align-items:flex-start;gap:16px;padding:16px 24px">')
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px">')
a('<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Agregat Bitzer 4FES-5Y</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+
  meta(FACT,'Agregat skraplający','Typ urządzenia')+meta(BUILD,'Delikatesy Morskie','Właściciel urządzenia')+meta(PIN,'Świętojańska 34, Gdynia','Maszynownia sklepu')+meta(HASH,'<span class="mono" style="font-size:11px">1724601893</span>','Numer seryjny')+'</div></div>')
a('<div style="display:flex;flex-wrap:wrap;gap:6px">'+
  capd(ic(CHECKC,14,'var(--success)')+'Sprawne','Stan urządzenia')+
  capd(ic(CALC,14,'var(--warning)')+'KS 4 gru','Kontrola szczelności 4 grudnia 2026, za 19 dni',extra=';font-weight:500')+
  capd(ic(DROP,14,'var(--text-tertiary)')+'R404A 18,5 kg','Czynnik i ładunek (zmienia tylko dokument)')+
  capd(ic(CO2,14,'var(--text-tertiary)')+'72,6 t','72,6 t CO₂e · kontrola co 6 mies.')+
  capd('<span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:#2F9E5B"></span>Umowa','Umowa serwisowa do 31.12.2026','0 10px')+'</div>')
a('</div>')
a('<div style="display:flex;align-items:center;gap:8px;flex:0 0 auto"><button type="button" class="sec" title="Nowa kontrola szczelności  K" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(SHC,14)+'Kontrola</button><button type="button" class="pri" title="Nowe zlecenie  C" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(PLUS,14)+'Nowe zlecenie</button></div>')
a('</div>')
tabs_start=oldurz.index('<div role="tablist" aria-label="Sekcje urządzenia"'); tabs_end=oldurz.index('</div>',oldurz.index('</sc-for>',tabs_start))+6
a(oldurz[tabs_start:tabs_end])
a('<div style="display:flex;flex-direction:column;gap:24px;padding:20px 24px 32px;max-width:880px">')
# params (reuse loop)
p_start=oldurz.index('<div role="table" aria-label="Parametry pracy"'); p_end=oldurz.index('</div>\n<p ',p_start)+7
a('<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px;height:24px"><h3 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Parametry pracy</h3>'
  '<span title="4 cze: wysokie przegrzanie i niskie dochłodzenie wskazywały na niedobór czynnika. Po naprawie zaworu i uzupełnieniu 2,1 kg wszystkie wartości są w normie." style="display:inline-flex">'+ic(INFO,14,'var(--text-tertiary)')+'</span>'+SP+
  chip(GAUGE,'var(--text-tertiary)','2 wizyty','Porównanie dwóch ostatnich wizyt')+'</div>'+oldurz[p_start:p_end]+'</section>')
# history static with icons
def hrow(icon,col,date,full,title,doc,ini,c,note):
    return (f'<li><a href="#" class="row" title="{note}" style="display:grid;grid-template-columns:16px 80px minmax(0,1fr) 120px 20px;column-gap:12px;align-items:center;height:36px;padding:0 8px;border-radius:10px">'
            f'<span style="display:inline-flex">{ic(icon,14,col)}</span><span class="num" title="{full}" style="font-size:12px;color:var(--text-secondary)">{date}</span>'
            f'<span class="ell" style="font-weight:500">{title}</span><span class="mono ell" style="font-size:11px;color:var(--text-tertiary);text-align:right">{doc}</span>{cav(ini,c)}</a></li>')
PDc='#E0702A'; MZc='#3B82D6'
a('<section style="display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:center;gap:8px;height:32px"><h3 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Historia serwisu</h3>'+CNT(14)+SP+ghost('Pokaż wszystkie')+'</div>'
  '<ol style="margin:0 -8px;padding:0;list-style:none;display:flex;flex-direction:column">'+
  hrow(SHC,'var(--success)','2 lip 2026','2 lipca 2026','Kontrola po naprawie','KS/2026/07/003','PD',PDc,'Szczelne. Parametry w normie.')+
  hrow(WRENCH,'var(--warning)','4 cze 2026','4 czerwca 2026','Awaria: brak wydajności regałów','ZS-0988','PD',PDc,'Nieszczelny zawór serwisowy. Wymiana zaworu, uzupełnienie R404A +2,1 kg.')+
  hrow(CAL,'var(--text-tertiary)','12 mar 2026','12 marca 2026','Przegląd okresowy','ZS-0931','MZ',MZc,'Czyszczenie skraplacza, kontrola automatyki, wymiana filtra odwadniacza.')+
  hrow(SHC,'var(--success)','4 gru 2025','4 grudnia 2025','Kontrola szczelności','KS/2025/12/006','PD',PDc,'Szczelne.')+
  hrow(DROP,'var(--text-tertiary)','18 kwi 2019','18 kwietnia 2019','Uruchomienie','ZS-0102','MZ',MZc,'Napełnienie 16,4 kg R404A, protokół uruchomienia w dokumentach.')+
  '</ol></section>')
a('</div></div>')
# aside
ph_start=oldurz.index('<aside aria-label="Szczegóły urządzenia"'); ph_sec_end=oldurz.index('</section>',ph_start)+10
a(oldurz[ph_start:ph_sec_end].replace('<aside aria-label="Szczegóły urządzenia" style="flex:0 0 340px;','<aside aria-label="Szczegóły urządzenia" style="flex:0 0 340px;'))
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Terminy')+
  prop(CALC,'Kontrola szczelności','4 grudnia 2026 · za 19 dni','<span class="num" style="font-weight:500">4 gru</span>',iconcol='var(--warning)')+
  prop(CALC,'Koniec umowy','31 grudnia 2026 · za 46 dni','<span class="num" style="font-weight:500">31 gru</span>',iconcol='var(--warning)')+
  prop(CAL,'Przegląd okresowy','Co 12 miesięcy','<span class="num" style="color:var(--text-secondary)">12 mar</span>')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Szczegóły')+
  prop(FACT,'Bitzer 4FES-5Y','Producent i model')+
  prop(HASH,'<span class="mono" style="font-size:12px">1724601893</span>','Numer seryjny')+
  prop(CAL,'Zainstalowano 2019','Rok instalacji')+
  prop(DROP,'R404A · GWP 3922','Czynnik: zmiana tylko dokumentem retrofitu',lock=True)+
  prop(CO2,'18,5 kg · 72,6 t CO₂e','Ładunek zmienia tylko dokument: wydanie RW albo odzysk',lock=True)+
  prop(SHC,'Kontrola co 6 mies.','Wyliczona z CO₂e i systemu wykrywania wycieków',lock=True)+
  prop(RADAR,'Bez systemu wykrywania','System wykrywania wycieków: nie')+
  prop(UPLOAD,'<span class="mono" style="font-size:12px">KU/2019/04187</span>','Karta urządzenia w CRO')+
  '</section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Układ')+prop(None,'Regały chłodnicze, 4 szt.','Zasila UR-3110','<span class="mono" style="font-size:11px;color:var(--text-tertiary)">UR-3110</span>',raw_icon=ic(ROUTE,16,'var(--text-tertiary)'))+'</section>')
a('</aside></div>\n</sc-if>\n')
s=s.replace(oldurz, v1+'\n'.join(H))

oldp='<p style="margin:0;font-size:12px;line-height:16px;color:var(--text-secondary)">Sieć 18 sklepów spożywczych · NIP <span class="mono" style="font-size:11px">586-214-09-73</span> · Gdynia</p>'
assert oldp in s
newp=('<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(BUILD,'18 sklepów','Sieć 18 sklepów spożywczych')+meta(HASH,'<span class="mono" style="font-size:11px">586-214-09-73</span>','NIP')+meta(PIN,'Gdynia','Siedziba: Gdynia, ul. Hutnicza 40')+'</div>')
s=s.replace(oldp,'<sc-if value="{{noNew}}" hint-placeholder-val="{{true}}">'+oldp+'</sc-if><sc-if value="{{isNewV}}" hint-placeholder-val="{{false}}">'+newp+'</sc-if>',1)
# ---------- script
s=s.replace('"plan": {"editor": "enum"','"wersja": {"editor": "enum", "options": ["stara", "nowa"], "default": "stara", "section": "Widok"}, "plan": {"editor": "enum"',1)
old='    const fView = {'
s=s.replace(old,"""    const isNew = (this.props.wersja ?? 'stara') === 'nowa';
    const TCj = { MZ: '#3B82D6', TL: '#9B6BE0', KN: '#1FA7A5', PD: '#E0702A' };
    kDev.forEach((u) => { const p = u.freq.split(' · '); u.freqS = p[0]; u.det = p.length > 1; u.calOk = !u.late && !u.soon; u.lastS = u.last.replace(/ 20(25|26|27)$/, (m, y) => y === '26' ? '' : " '" + y); u.nextS = u.next.replace(/ 2026$/, '').replace(/ 2027$/, " '27"); });
    kLog.forEach((l) => { l.isK = /Kontrola/.test(l.op); l.isU = /Uzupełnienie/.test(l.op); l.isN = /Naprawa/.test(l.op); l.tc = TCj[l.tech] || 'var(--text-tertiary)'; l.okRes = l.res === 'szczelne'; l.otherRes = !l.okRes && !l.leak && !!l.res; l.resT = l.res || 'bez wyniku (operacja na czynniku)'; l.opS = l.op.replace('Kontrola szczelności', 'Kontrola').replace('Kontrola po naprawie', 'Po naprawie').replace(/^Uzupełnienie .*/, 'Uzupełnienie').replace('Naprawa wycieku', 'Naprawa'); });
"""+old,1)
s=s.replace('      isZlec: isZl,','      noNew: !isNew, isNewV: isNew, isZlecV1: isZl && !isNew, isZlecV2: isZl && isNew, isZlec: isZl,',1)
s=s.replace('      isUrz: isU, uTabs,','      isUrzV1: isU && !isNew, isUrzV2: isU && isNew, isUrz: isU, uTabs,',1)
s=s.replace('kPrz: !isKF && !isKU, kFg: isKF,','kPrz: !isKF && !isKU, kFg: isKF, kFgV1: isKF && !isNew, kFgV2: isKF && isNew,',1)
assert 'kFgV1: isKF' in s and 'isUrzV1:' in s and 'isZlecV1:' in s
open(P,'w').write(s); print('ok')
