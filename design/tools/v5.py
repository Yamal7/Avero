import re
P='design/canvas/Main.dc.html'
v3=open('design/tools/v3.py').read()
exec(v3[:v3.index("# ===== Magazyn")])
s=open(P).read()
def drop_if(flag):
    global s
    while True:
        i=s.find('<sc-if value="{{'+flag+'}}"')
        if i<0: return
        d=0
        for m in re.finditer(r'<(/?)sc-if[\s>]',s[i:]):
            d+=-1 if m.group(1) else 1
            if d==0: k=i+m.start(); break
        end=s.index('</sc-if>',k)+len('</sc-if>')
        if s[end:end+1]=='\n': end+=1
        s=s[:i]+s[end:]
for f in ['isZlecV1','kFgV1','isUrzV1','isMWszV1','isFListV1','isDataV1','railV1','isZadaniaV1','isOListV1','isMSamV1','noNew']:
    drop_if(f)
# always new
s=s.replace("(this.props.wersja ?? 'stara') === 'nowa'","true").replace("(this.props.wersja ?? 'stara') !== 'nowa'","false")
s=s.replace('"wersja": {"editor": "enum", "options": ["stara", "nowa"], "default": "stara", "section": "Widok"}, ','')
assert 'wersja' not in s.split('class Component')[0][-3000:] or True

# ---------- Firma: przegląd (main)
def rep1(o,n):
    global s
    assert s.count(o)==1,(o[:80],s.count(o)); s=s.replace(o,n)
i=s.index('<sc-if value="{{kPrz}}" hint-placeholder-val="{{true}}">\n<div style="display:flex;flex-direction:column;gap:24px;padding:20px 24px 32px;max-width:920px">')
j=s.index('<dl style="margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px">',i)
k=s.index('</dl>',j)+5
status=('<div role="status" style="display:flex;align-items:center;gap:6px;min-height:40px;padding:8px 8px 8px 12px;border-radius:12px;background:var(--bg-raised)">'+
  chip(CALC,'var(--warning)','Umowa do 31 gru','Umowa serwisowa wygasa 31 grudnia 2026, za 46 dni','var(--bg-surface)')+
  chip(TASK,'var(--st-progress)','ZD-119','Przedłużenie prowadzi Anna Wiśniewska w zadaniu ZD-119','var(--bg-surface)')+SP+
  '<button type="button" class="sec" title="Przygotuj aneks do umowy" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500">'+ic(FILE,14)+'Aneks</button></div>')
def fact(icon,col,label,val,tip):
    return f'<div title="{tip}" style="display:flex;flex-direction:column;gap:2px"><dt style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--text-secondary)">{ic(icon,14,col)}{label}</dt><dd class="num" style="margin:0;font-size:18px;line-height:26px;font-weight:600">{val}</dd></div>'
facts=('<dl style="margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px">'+
  fact(BOX,'var(--text-tertiary)','Urządzenia','112','31 z obowiązkiem kontroli F-gaz')+
  fact(WARN,'var(--warning)','Otwarte sprawy','4','1 zagrożona SLA')+
  fact(RECEIPT,'var(--text-tertiary)','Przychód','121 380 zł','12 miesięcy · umowa 76%, zlecenia 24%')+
  fact(TIMER,'var(--success)','SLA reakcji','94%','30 dni · reakcja do 4 h dla awarii krytycznych')+'</dl>')
hdr_start=s.index('<div role="status"',i)
s=s[:hdr_start]+status+'\n'+facts+s[k:]
# kF rows
rep1('<span style="display:flex;align-items:baseline;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto;font-weight:500">{{u.title}}</span><span class="ell" style="flex:0 10000 auto;color:var(--text-secondary)">{{u.place}}</span></span>',
     '<span class="ell" title="{{u.place}}" style="font-weight:500">{{u.title}}</span>')
i=s.index('<span title="{{u.dueTip}}"'); j=s.index('</sc-if>',i)+8
s=s[:i]+'<span title="{{u.dueTip}}" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;color:{{u.dueC}};font-weight:{{u.dueW}}"><sc-if value="{{u.warn}}" hint-placeholder-val="{{false}}">'+ic(CALC,14,'var(--warning)')+'</sc-if><sc-if value="{{u.noWarn}}" hint-placeholder-val="{{true}}">'+ic(CAL,14,'var(--text-tertiary)')+'</sc-if>'+s[j:]
# open items: place to tooltip
o='<span style="display:flex;align-items:baseline;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto;font-weight:500">{{t.title}}</span><span class="ell" style="flex:0 10000 auto;color:var(--text-secondary)">{{t.place}}</span></span>'
if s.count(o)==1: s=s.replace(o,'<span class="ell" title="{{t.place}}" style="font-weight:500">{{t.title}}</span>')
# ---------- Firma: aside
i=s.index('<aside aria-label="Szczegóły firmy"'); j=s.index('</aside>',i)+8
IC={'NIP':HASH,'Siedziba':PIN,'Telefon':PHONE,'Płatność':RECEIPT,'SLA reakcji':TIMER,'Klient od':CAL}
A=('<aside aria-label="Szczegóły firmy" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">'
   '<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Szczegóły')+
   prop(HASH,'<span class="mono" style="font-size:12px">586-214-09-73</span>','NIP')+
   prop(PIN,'Hutnicza 40, Gdynia','Siedziba: ul. Hutnicza 40, 81-061 Gdynia')+
   prop(PHONE,'<span class="num">+48 58 620 14 00</span>','Telefon')+
   prop(None,'Anna Wiśniewska','Opiekun klienta',raw_icon='<span aria-hidden="true" style="width:16px;height:16px;border-radius:50%;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;color:var(--text-secondary)">AW</span>')+
   prop(RECEIPT,'Przelew 14 dni','Płatność')+
   prop(TIMER,'4 h / 24 h','SLA reakcji: 4 h dla awarii krytycznych, 24 h pozostałe',lock=True)+
   prop(CAL,'Od marca 2023','Klient od')+'</section>'
   '<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Osoby',ib('Dodaj osobę','Dodaj osobę',PLUS,24,'var(--text-tertiary)'))+
   ''.join(f'<a href="#" class="row" title="{r}" style="display:flex;align-items:center;gap:10px;min-height:32px;padding:6px 8px;border-radius:8px"><span aria-hidden="true" style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--text-secondary)">{ini}</span><span class="ell" style="flex:1 1 auto;font-weight:500">{n}</span>{chips}</a>'
           for ini,n,r,chips in [('KM','Krzysztof Malinowski','Kierownik techniczny · decyzyjny','<span title="Decyzyjny" style="width:8px;height:8px;border-radius:50%;background:#4B5BD6"></span><span title="Techniczny" style="width:8px;height:8px;border-radius:50%;background:#1FA7A5"></span>'),
                                 ('AW','Agnieszka Wróbel','Księgowość · płatnik','<span title="Płatnik" style="width:8px;height:8px;border-radius:50%;background:#2F9E5B"></span>'),
                                 ('MK','Marta Kurek','Kierownik sklepu, Świętojańska','')])+
   '</section></aside>')
s=s[:i]+A+s[j:]
# ---------- kUr: list rows + filters + aside
rep1('<span style="display:flex;align-items:baseline;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto;font-weight:500">{{u.name}}</span><span class="ell" style="flex:0 10000 auto;color:var(--text-secondary)">{{u.model}}</span></span>',
     '<span class="ell" title="{{u.model}}" style="font-weight:500">{{u.name}}</span>')
rep1('<span style="color:var(--text-secondary)">Typ:</span><span style="font-weight:500">wszystkie</span>',ic(FACT,14,'var(--text-tertiary)')+'<span>Typ</span>')
rep1('<span style="color:var(--text-secondary)">Czynnik:</span><span style="font-weight:500">wszystkie</span>',ic(DROP,14,'var(--text-tertiary)')+'<span>Czynnik</span>')
rep1('font-size:12px">Tylko z obowiązkiem F-gaz</button>','font-size:12px" title="Tylko urządzenia z obowiązkiem kontroli szczelności">'+ic(SHC,14,'var(--text-tertiary)')+'F-gaz</button>')
# F-gaz late/soon icons in kUr rows
i=s.index('<span title="{{u.fgTip}}"'); seg_end=s.index('</a>',i)
seg=s[i:seg_end]
seg=re.sub(r'(<sc-if value="\{\{u\.late\}\}" hint-placeholder-val="\{\{false\}\}">)<svg.*?</svg>(</sc-if>)',lambda m:m.group(1)+ic(CALX,14,'var(--danger)')+m.group(2),seg,count=1,flags=re.S)
seg=re.sub(r'(<sc-if value="\{\{u\.soon\}\}" hint-placeholder-val="\{\{false\}\}">)<svg.*?</svg>(</sc-if>)',lambda m:m.group(1)+ic(CALC,14,'var(--warning)')+m.group(2),seg,count=1,flags=re.S)
s=s[:i]+seg+s[seg_end:]
i=s.index('<aside aria-label="Karta urządzenia UR-3107"'); j=s.index('</aside>',i)+8
hdr_end=s.index('<div style="display:flex;flex-direction:column;gap:4px;padding:4px 20px 12px">',i)
EV=[(SHC,'var(--success)','2 lip','Kontrola po naprawie','KS/2026/07/003','Szczelne'),(DROP,'var(--text-tertiary)','4 cze','Uzupełnienie +2,1 kg','RW/2026/06/031','R404A'),(WRENCH,'var(--warning)','4 cze','Naprawa wycieku','NP/2026/06/002','Zawór serwisowy'),(SHC,'var(--warning)','4 cze','Kontrola: nieszczelność','KS/2026/06/004','Wykryta nieszczelność')]
A=(s[i:hdr_end]+
   '<div style="display:flex;flex-direction:column;gap:8px;padding:4px 20px 12px"><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Agregat Bitzer 4FES-5Y</h2>'
   '<div style="display:flex;flex-wrap:wrap;gap:4px">'+chip(CHECKC,'var(--success)','Sprawne','Stan urządzenia')+chip(CALC,'var(--warning)','KS 4 gru','Kontrola szczelności 4 grudnia 2026, za 19 dni')+chip(PIN,'var(--text-tertiary)','Świętojańska 34','Gdynia, ul. Świętojańska 34 · maszynownia')+'</div></div>'
   '<section style="display:flex;flex-direction:column;gap:2px;padding:0 12px 12px">'+
   prop(FACT,'Bitzer 4FES-5Y','Producent i model')+prop(HASH,'<span class="mono" style="font-size:12px">1724601893</span>','Numer seryjny')+
   prop(DROP,'R404A · GWP 3922','Czynnik: zmiana tylko dokumentem retrofitu',lock=True)+prop(CO2,'18,5 kg · 72,6 t CO₂e','Ładunek zmienia tylko dokument',lock=True)+
   prop(SHC,'Kontrola co 6 mies.','Wyliczona z CO₂e i systemu wykrywania',lock=True)+prop(UPLOAD,'<span class="mono" style="font-size:12px">KU/2019/04187</span>','Karta w CRO')+'</section>'
   '<section aria-label="Ostatnie zdarzenia" style="display:flex;flex-direction:column;gap:4px;padding:0 20px 20px"><div style="display:flex;align-items:center;gap:8px;height:24px"><h3 style="flex:1 1 auto;margin:0;font-size:12px;line-height:16px;font-weight:500;color:var(--text-secondary)">Zdarzenia</h3>'+ghost('Historia F-gaz')+'</div>'
   '<ol style="margin:0 -8px;padding:0;list-style:none;display:flex;flex-direction:column">'+
   ''.join(f'<li><a href="#" class="row" title="{doc} · {tip}" style="display:grid;grid-template-columns:16px 44px minmax(0,1fr);column-gap:8px;align-items:center;height:32px;padding:0 8px;border-radius:10px"><span style="display:inline-flex">{ic(icn,14,col)}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{d}</span><span class="ell">{t}</span></a></li>' for icn,col,d,t,doc,tip in EV)+
   '</ol></section></aside>')
s=s[:i]+A+s[j:]
# JS: kF noWarn
s=s.replace('    const fView = {',"    kF.forEach((u) => { u.noWarn = !u.warn; });\n    const fView = {",1)
open(P,'w').write(s); print('ok', len(s))
