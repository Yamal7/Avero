# Raporty › raport z własnej tabeli „Przetargi” (2025–2026) + edytor wybranego wykresu. Scenariusz: piątek 20 lis 2026, 19:00.
RS=open('design/tools/raporty.py').read()
exec(RS.split("MONTHS=")[0])                       # helpery, ikony, s
exec(RS[RS.index("def spark("):RS.index("H=[];a=H.append")])
P='design/canvas/Main.dc.html'; s=open(P).read()
TABLEI='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18"></path>'
GAVEL='<path d="m14 13-8.38 8.38a1 1 0 0 1-3-3L11 10"></path><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"></path>'
GEAR='<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
WON='var(--s1)'; REST='var(--rest)'
Q=[("I '25",4,1),("II '25",6,3),("III '25",5,2),("IV '25",6,2),("I '26",2,1),("II '26",3,1),("III '26",1,0),("IV '26",2,1)]
assert sum(q[1] for q in Q)==29 and sum(q[2] for q in Q)==11
QF=['I kw. 2025','II kw. 2025','III kw. 2025','IV kw. 2025','I kw. 2026','II kw. 2026','III kw. 2026','IV kw. 2026 (do 20 lis)']
def qchart():
    W,Hh,L,R,T,B=460,250,24,8,16,26; pw=W-L-R; ph=Hh-T-B; ymax=8; n=len(Q); step=pw/n; bw=28
    Y=lambda v: T+ph-(v/ymax)*ph
    o=[f'<svg viewBox="0 0 {W} {Hh}" width="100%" role="img" aria-label="Złożone oferty i wygrane przetargi wg kwartału, 2025–2026" style="display:block">']
    for g in (2,4,6,8):
        o.append(f'<line x1="{L}" x2="{L+pw}" y1="{Y(g):.1f}" y2="{Y(g):.1f}" stroke="var(--edge)" stroke-width="1"></line><text x="{L-8}" y="{Y(g)+4:.1f}" text-anchor="end" font-size="11" fill="var(--text-tertiary)">{g}</text>')
    o.append(f'<line x1="{L}" x2="{L+pw}" y1="{Y(0):.1f}" y2="{Y(0):.1f}" stroke="var(--border-strong)" stroke-width="1"></line>')
    for i,(q,sub,won) in enumerate(Q):
        x=L+i*step+(step-bw)/2
        # wygrane od dołu, reszta złożonych nad nimi, 2 px przerwy, zaokrąglona góra
        y0=Y(0); y1=Y(won); y2=Y(sub)
        if won: o.append(f'<rect x="{x:.1f}" y="{y1:.1f}" width="{bw}" height="{y0-y1:.1f}" fill="{WON}"><title>{QF[i]} · wygrane: {won}</title></rect>')
        top=y1-(2 if won else 0); r=4
        o.append(f'<path d="M{x:.1f},{top:.1f} V{y2+r:.1f} Q{x:.1f},{y2:.1f} {x+r:.1f},{y2:.1f} H{x+bw-r:.1f} Q{x+bw:.1f},{y2:.1f} {x+bw:.1f},{y2+r:.1f} V{top:.1f} Z" fill="{REST}"><title>{QF[i]} · złożone bez wygranej: {sub-won}</title></path>')
        o.append(f'<text x="{x+bw/2:.1f}" y="{y2-6:.1f}" text-anchor="middle" font-size="11" fill="var(--text-secondary)" class="num">{won}/{sub}</text>')
        o.append(f'<text x="{x+bw/2:.1f}" y="{Hh-8}" text-anchor="middle" font-size="11" fill="var(--text-tertiary)">{q}</text>')
        o.append(f'<rect x="{L+i*step:.1f}" y="{T}" width="{step:.1f}" height="{ph}" fill="transparent"><title>{QF[i]}: złożone {sub}, wygrane {won} ({round(won/sub*100)} %)</title></rect>')
    o.append('</svg>'); return ''.join(o)
leg=('<div style="display:flex;gap:14px;font-size:12px;color:var(--text-secondary)">'
     f'<span style="display:inline-flex;align-items:center;gap:6px"><span aria-hidden="true" style="width:10px;height:10px;border-radius:3px;background:{WON}"></span>Wygrane</span>'
     f'<span style="display:inline-flex;align-items:center;gap:6px"><span aria-hidden="true" style="width:10px;height:10px;border-radius:3px;background:{REST}"></span>Złożone bez wygranej</span></div>')
def hbar(label,v,mx,right,tip,col=WON):
    return (f'<div title="{tip}" style="display:grid;grid-template-columns:112px minmax(0,1fr) 92px;column-gap:10px;align-items:center;min-height:28px">'
            f'<span class="ell" style="font-size:12px;color:var(--text-secondary)">{label}</span>'
            f'<span style="height:12px;border-radius:0 4px 4px 0;background:{col};width:{v/mx*100:.1f}%"></span>'
            f'<span class="num" style="text-align:right;font-size:12px">{right}</span></div>')
def card(title,body,extra='',sel=False):
    ring='box-shadow:inset 0 0 0 1.5px var(--accent);' if sel else ''
    return (f'<section style="display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-radius:12px;background:var(--bg-raised);{ring}min-width:0">'
            f'<div style="display:flex;align-items:center;gap:8px;min-height:24px"><span style="font-weight:500">{title}</span>{extra}{SP}{ib("Pokaż tabelę","Pokaż dane w tabeli",TABLEI,24)}</div>{body}</section>')
H=[];a=H.append
a('<sc-if value="{{isRapT}}" hint-placeholder-val="{{false}}">')
a('<style>.av .rapt{--s1:#2a78d6;--rest:#c9ccd2}.av.dark .rapt{--s1:#3987e5;--rest:#3a3d44}</style>')
TABS=['Przegląd miesiąca','Marża zleceń','Technicy','Umowy','Należności','F-gaz']
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CHART,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Raporty</h1><span style="width:8px"></span>'+
  ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;padding:0 10px;border-radius:14px;color:var(--text-secondary)">{t}</a>' for t in TABS)+
  '<a href="#" class="sec" title="Raport z własnej tabeli Przetargi" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;background:var(--bg-subtle);color:var(--text-primary);font-weight:500">'+ic(GAVEL,14,'var(--text-secondary)')+'Przetargi</a>'+
  '<a href="#" class="sec" title="Nowy raport — z modułu albo z własnej tabeli" style="height:28px;display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:14px;color:var(--text-tertiary)">'+ic(PLUS,14)+'Raport</a>'+
  SP+capd(ic(CAL,14,'var(--text-tertiary)')+'2025 – 2026','Okres: termin składania ofert od 1 sty 2025')+ib('Eksport','Eksport do Excela  ⌘E',DL)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div class="rapt" style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:16px;padding:8px 24px 32px">')
a('<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-secondary)">'+sch(ic(TABLEI,12,'var(--text-tertiary)')+'z własnej tabeli Przetargi','Źródło: tabela Przetargi, widok Wszystkie · 56 rekordów (41 z importu 20 lis)')+
  '<span>Raport utworzył Pascal · widzą administrator i biuro</span></div>')
a('<p style="margin:0;font-size:13px;line-height:20px;color:var(--text-secondary)">Od początku 2025 r. <span class="num" style="color:var(--text-primary);font-weight:500">56</span> przetargów, oferta złożona w <span class="num" style="color:var(--text-primary);font-weight:500">29</span>, wygrane <span class="num" style="color:var(--text-primary);font-weight:500">11</span> — <span class="num" style="color:var(--text-primary);font-weight:500">38 %</span> złożonych. Wartość wygranych <span class="num" style="color:var(--text-primary);font-weight:500">1 182 400 zł</span> netto (nasze ceny).</p>')
a('<div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:12px;align-items:start">')
a(card('Złożone i wygrane wg kwartału',leg+qchart(),sch('liczba','Liczba rekordów'),sel=True))
a('<div style="display:flex;flex-direction:column;gap:12px;min-width:0">')
a(card('Skuteczność wg branży','<div style="display:flex;flex-direction:column;gap:2px">'+
  hbar('Chłodnictwo',50,60,'3 z 6 · 50 %','Wygrane / złożone')+hbar('Klimatyzacja',43,60,'6 z 14 · 43 %','Wygrane / złożone')+
  hbar('Wentylacja',25,60,'1 z 4 · 25 %','Wygrane / złożone')+hbar('Pompy ciepła',20,60,'1 z 5 · 20 %','Wygrane / złożone')+'</div>',sch('% złożonych','Pierwsza branża przetargu')))
a(card('Dlaczego przegrywamy','<div style="display:flex;flex-direction:column;gap:2px">'+
  hbar('Cena',9,9,'9','Pole „Powód” wymagane przy statusie Przegrany',col='var(--text-secondary)')+hbar('Brak referencji',3,9,'3','',col='var(--text-secondary)')+hbar('Termin realizacji',2,9,'2','',col='var(--text-secondary)')+
  hbar('Błąd formalny',1,9,'1','PR-2025-019 — brak pełnomocnictwa',col='var(--text-secondary)')+hbar('Inne',3,9,'3','',col='var(--text-secondary)')+'</div>'
  '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">4 z 9 przegranych ceną — o mniej niż 5 % od zwycięskiej oferty.</span>',sch('18 przegranych','Status Przegrany, 2025–2026')))
a('</div></div></div>')
# edytor wykresu
def row2(k,v,tip=''): return f'<div title="{tip}" style="display:grid;grid-template-columns:88px minmax(0,1fr);column-gap:8px;align-items:center;min-height:32px;padding:0 8px"><span style="font-size:12px;color:var(--text-secondary)">{k}</span><span style="display:flex;flex-wrap:wrap;gap:4px;min-width:0">{v}</span></div>'
def pl(t,tip=''): return f'<span title="{tip}" style="height:26px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border-radius:13px;background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong);font-size:12px;white-space:nowrap">{t}</span>'
def segm(items,cur): return ('<span role="radiogroup" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">'+''.join(f'<span role="radio" aria-checked="{"true" if i==cur else "false"}" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border-radius:8px;font-size:12px;white-space:nowrap;{"background:var(--bg-surface);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{t}</span>' for i,t in enumerate(items))+'</span>')
a('<aside aria-label="Ustawienia wykresu" style="flex:0 0 320px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:16px;padding:14px 12px 24px">')
a('<div style="display:flex;flex-direction:column;gap:4px;padding:0 8px"><span style="font-size:12px;color:var(--text-tertiary)">Wykres 1 z 3</span><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Złożone i wygrane wg kwartału</h2></div>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Dane')+
  row2('Tabela',pl(ic(GAVEL,12,'var(--text-tertiary)')+'Przetargi')+pl('widok Wszystkie'),'Raport korzysta z uprawnień oglądającego')+
  row2('Pokaż',pl('Liczba rekordów'),'Albo suma / średnia pola Kwota lub Liczba')+
  row2('Gdzie',pl('Status')+'<span style="font-size:12px;color:var(--text-secondary);align-self:center">jest</span>'+pl('Złożona, Wygrany, Przegrany'))+
  row2('Oś',pl('Termin składania ofert')+pl('kwartały'))+
  row2('Podział',pl('Status')+pl('Wygrany osobno'),'Najwyżej 4 grupy; reszta jako „pozostałe”')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+ah3('Wygląd')+
  '<div style="padding:0 8px;display:flex;flex-direction:column;gap:8px">'+segm(['Słupki','Skumulowane','Linia','Tabela'],1)+
  '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Kolory serii nadaje Avero w stałej kolejności; etykieta „wygrane/złożone” nad słupkiem.</span></div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Kto widzi')+
  prop(LOCK,'Administrator i biuro','')+'<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Technicy nie widzą raportu. Wykres z polem „Nasza cena” zobaczy tylko ten, kto widzi to pole.</span>'+'</section>')
a('<div style="display:flex;gap:6px;margin-top:auto;padding:0 4px">'+
  '<button type="button" class="sec" title="Dodaj wykres do raportu  N" style="flex:1 1 auto;height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;background:var(--bg-subtle);font-size:12px;font-weight:500">'+ic(PLUS,14,'var(--text-secondary)')+'Wykres</button>'
  '<button type="button" class="pri" title="Zapisz raport  ⌘S" style="flex:1 1 auto;height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:500">'+ic(CHECK,14)+'Zapisz raport</button></div>')
a('</aside></div></sc-if>')
block='\n'.join(H)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x_,y_):
    global s; assert s.count(x_)==1,x_[:60]; s=s.replace(x_,y_)
rep("const nRap = navv(isRap);","const isRapT = ekran === 'raport tabela'; const nRap = navv(isRap || isRapT);")
rep("isRap, actRap:","isRap, isRapT, actRap:")
rep('"raporty", ','"raporty", "raport tabela", ')
open(P,'w').write(s); print('ok raport_tabela',len(s))
