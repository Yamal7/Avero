P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'
CHART='<path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M7 16V9M12 16v-4M17 16V6"></path>'
TREND='<path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path>'
TDOWN='<path d="M22 17 13.5 8.5 8.5 13.5 2 7"></path><path d="M16 17h6v-6"></path>'
SPARK='<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"></path>'
REDO='<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>'
MSG='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>'
DL='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path>'
TABLEI='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18"></path>'
def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'
def fmt(v,dec=1): return (f'{v:,.{dec}f}').replace(',',' ').replace('.',',')
MONTHS=['lis','gru','sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź']
MFULL=['listopad 2025','grudzień 2025','styczeń 2026','luty 2026','marzec 2026','kwiecień 2026','maj 2026','czerwiec 2026','lipiec 2026','sierpień 2026','wrzesień 2026','październik 2026']
SER=[('Serwis i awarie','--s1',[58,62,55,52,56,60,66,74,70,63,60,61.2]),
     ('Montaże klimatyzacji','--s2',[22,10,6,8,16,38,62,74,62,42,54.5,54.8]),
     ('Pompy ciepła','--s3',[30,32,28,30,26,18,14,12,14,22,30,29.6]),
     ('Umowy serwisowe','--s4',[24.4,24.4,24.4,26.8,26.8,26.8,26.8,26.8,26.8,26.8,26.8,26.8])]
TOT=[round(sum(x[2][i] for x in SER),1) for i in range(12)]
assert abs(TOT[11]-172.4)<.01 and abs(TOT[10]-171.3)<.01, TOT
# ---------- stacked bar chart (SVG)
W,Hh=640,232; L,R,T,B=40,132,12,28; pw=W-L-R; ph=Hh-T-B; ymax=250
bw=26; step=pw/12
def y(v): return T+ph-(v/ymax)*ph
svg=[f'<svg viewBox="0 0 {W} {Hh}" width="100%" role="img" aria-label="Przychód netto wg rodzaju prac, listopad 2025 – październik 2026, w tys. zł" style="display:block;overflow:visible">']
for g in (50,100,150,200,250):
    svg.append(f'<line x1="{L}" x2="{L+pw}" y1="{y(g):.1f}" y2="{y(g):.1f}" stroke="var(--edge)" stroke-width="1"></line><text x="{L-8}" y="{y(g)+4:.1f}" text-anchor="end" font-size="11" fill="var(--text-tertiary)" class="num">{g}</text>')
svg.append(f'<line x1="{L}" x2="{L+pw}" y1="{y(0):.1f}" y2="{y(0):.1f}" stroke="var(--border-strong)" stroke-width="1"></line>')
for i in range(12):
    x=L+i*step+(step-bw)/2; base=0
    for k,(name,var,vals) in enumerate(SER):
        v=vals[i]; y0=y(base); y1=y(base+v); hgt=y0-y1-(2 if k<3 else 0)
        top = k==3
        if top:
            r=4; d=f'M{x:.1f},{y0:.1f} V{y1+r:.1f} Q{x:.1f},{y1:.1f} {x+r:.1f},{y1:.1f} H{x+bw-r:.1f} Q{x+bw:.1f},{y1:.1f} {x+bw:.1f},{y1+r:.1f} V{y0:.1f} Z'
            svg.append(f'<path d="{d}" fill="var({var})"><title>{MFULL[i]} · {name}: {fmt(v)} tys. zł</title></path>')
        else:
            svg.append(f'<rect x="{x:.1f}" y="{y1:.1f}" width="{bw}" height="{max(hgt,0):.1f}" fill="var({var})"><title>{MFULL[i]} · {name}: {fmt(v)} tys. zł</title></rect>')
        base+=v
    bold=' font-weight="600" fill="var(--text-primary)"' if i==11 else ' fill="var(--text-tertiary)"'
    svg.append(f'<text x="{x+bw/2:.1f}" y="{Hh-8}" text-anchor="middle" font-size="11"{bold}>{MONTHS[i]}</text>')
    svg.append(f'<rect x="{L+i*step:.1f}" y="{T}" width="{step:.1f}" height="{ph}" fill="transparent"><title>{MFULL[i]}: razem {fmt(TOT[i])} tys. zł netto</title></rect>')
# direct labels right of last bar
xl=L+11*step+(step+bw)/2+10; base=0
for k,(name,var,vals) in enumerate(SER):
    v=vals[11]; mid=y(base+v/2); base+=v
    svg.append(f'<line x1="{xl-8:.1f}" x2="{xl-3:.1f}" y1="{mid:.1f}" y2="{mid:.1f}" stroke="var({var})" stroke-width="2"></line><text x="{xl:.1f}" y="{mid+4:.1f}" font-size="11" fill="var(--text-secondary)">{name.split()[0]} <tspan class="num" fill="var(--text-primary)" font-weight="500">{fmt(v)}</tspan></text>')
svg.append('</svg>')
CHARTSVG=''.join(svg)
legend='<div style="display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;color:var(--text-secondary)">'+''.join(f'<span style="display:inline-flex;align-items:center;gap:6px"><span aria-hidden="true" style="width:10px;height:10px;border-radius:3px;background:var({v})"></span>{n}</span>' for n,v,_ in SER)+'</div>'
# ---------- sparkline
def spark(vals,col='var(--text-secondary)',w=96,h=28):
    mn,mx=min(vals),max(vals); pts=[]
    for i,v in enumerate(vals): pts.append(f'{i*(w-4)/(len(vals)-1)+2:.1f},{h-3-(v-mn)/(mx-mn)*(h-6):.1f}')
    lx,ly=pts[-1].split(',')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true"><polyline points="{" ".join(pts)}" fill="none" stroke="{col}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity=".6"></polyline><circle cx="{lx}" cy="{ly}" r="2.5" fill="{col}"></circle></svg>'
def fact(label,val,unit,delta,good,tip,vals,dtip):
    dc='var(--success)' if good else 'var(--danger)'; di=TREND if (good ^ ('−' in delta and label.startswith('Należności'))) else TDOWN
    di=TREND if delta.startswith('+') else TDOWN
    return (f'<div title="{tip}" style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;background:var(--bg-raised)">'
            f'<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">{label}</span>'
            f'<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px"><span style="display:flex;align-items:baseline;gap:4px"><span class="num" style="font-size:22px;line-height:28px;font-weight:600;letter-spacing:-0.015em">{val}</span><span style="font-size:12px;color:var(--text-tertiary)">{unit}</span></span>{spark(vals)}</div>'
            f'<span title="{dtip}" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;line-height:16px;color:{dc}">{ic(di,12,dc)}<span class="num">{delta}</span><span style="color:var(--text-tertiary)">vs wrzesień</span></span></div>')
H=[];a=H.append
a('<sc-if value="{{isRap}}" hint-placeholder-val="{{false}}">')
a('<style>.av .rapv{--s1:#2a78d6;--s2:#eb6834;--s3:#1baf7a;--s4:#eda100}.av.dark .rapv{--s1:#3987e5;--s2:#d95926;--s3:#199e70;--s4:#c98500}</style>')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(CHART,16,'var(--text-secondary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Raporty</h1><span style="width:8px"></span>'+
  ''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}</a>' for i,t in enumerate(['Przegląd miesiąca','Marża zleceń','Technicy','Umowy','Należności','F-gaz']))+
  SP+capd(ic(CAL,14,'var(--text-tertiary)')+'Październik 2026','Okres raportu · porównanie z wrześniem  ⇧D')+ib('Eksport','Eksport do Excela  ⌘E',DL)+'</div>')
a('<div class="rapv" style="flex:1 1 auto;display:flex;flex-direction:column;gap:24px;padding:8px 24px 32px;min-width:0">')
# facts
a('<div style="display:flex;gap:8px">'+
  fact('Przychód netto','172 400','zł','+0,6 %',True,'Październik 2026 · wrzesień 171 300 zł',TOT,'+1 100 zł')+
  fact('Marża brutto','32,1','%','−1,8 pp',False,'Przychód minus robocizna, części i dojazdy',[33.0,34.5,35.1,34.2,33.8,32.9,31.5,30.8,31.9,33.2,33.9,32.1],'wrzesień 33,9 %')+
  fact('Zlecenia zamknięte','68','','+2',True,'Wrzesień: 66',[61,58,54,57,63,71,82,88,79,70,66,68],'wrzesień 66')+
  fact('Należności po terminie','23 480','zł','+3 180 zł',False,'Stan na dziś, 19 lis',[18.2,21.4,19.8,17.1,16.4,15.9,19.2,22.8,24.1,21.7,20.3,23.5],'wrzesień 20 300 zł').replace('color:var(--danger)">'+ic(TREND,12,'var(--danger)'),'color:var(--danger)">'+ic(TREND,12,'var(--danger)'))+
  '</div>')
# chart + insights
INS=[(TDOWN,'var(--danger)','Marża montaży klimatyzacji spadła do 14 %.','Dystrybutor podniósł ceny jednostek Gree o 9 % od 1 wrz, a cennik ofert się nie zmienił.','Zaktualizuj cennik','Podnieś ceny jednostek Gree w cenniku ofert o 9 % · 23 pozycje'),
     (REDO,'var(--warning)','Piotr miał 4 powroty w październiku.','3 z nich przy agregatach Bitzer — ten sam błąd przy ustawieniu presostatu.','Zobacz zlecenia','ZS-0994, ZS-1003, ZS-1019, ZS-1026'),
     (MSG,'var(--warning)','Hotel Oliwski: 9 860 zł 31 dni po terminie.','Ma też zaległą kontrolę F-gaz z 15 lis — dobry moment na telefon.','Przypomnij','Wyślij przypomnienie o płatności i zaproponuj termin kontroli')]
ins=''.join(f'<div style="display:flex;gap:10px;padding:12px;border-radius:12px;background:var(--bg-raised)"><span style="padding-top:2px">{ic(i,16,c)}</span><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px"><span style="font-weight:500">{t}</span><span style="font-size:12px;line-height:18px;color:var(--text-secondary)">{d}</span>'
            f'<span><button type="button" class="sec" title="{tip}" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-size:12px;font-weight:500">{b}</button></span></div></div>' for i,c,t,d,b,tip in INS)
a('<div style="display:flex;gap:24px;align-items:flex-start">'
  '<section style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:10px">'+h3('Przychód wg rodzaju prac',sch('tys. zł netto','12 miesięcy')+SP+ib('Pokaż tabelę','Pokaż dane w tabeli',TABLEI,28))+legend+'<div style="padding:8px 0 0">'+CHARTSVG+'</div></section>'
  '<section style="flex:0 0 340px;display:flex;flex-direction:column;gap:8px">'+h3('Avero zauważa',CNT(3).replace('>3<','>3<'))+ins+'</section></div>')
# margin table + receivables
MC='minmax(140px,1fr) 44px 72px 140px 48px'
def mrow(col,n,cnt,rev,m,d,dgood):
    pct=min(m/60,1)*100; thr=22/60*100
    mc='var(--danger)' if m<22 else 'var(--text-primary)'
    dc='var(--success)' if dgood else ('var(--danger)' if d.startswith('−') else 'var(--text-tertiary)')
    bar=(f'<span style="display:flex;align-items:center;gap:8px"><span style="position:relative;flex:1 1 auto;height:6px;border-radius:3px;background:var(--bg-subtle)"><span style="position:absolute;left:0;top:0;bottom:0;width:{pct:.0f}%;border-radius:3px;background:{"var(--danger)" if m<22 else "var(--text-secondary)"}"></span>'
         f'<span title="Próg firmy 22 %" style="position:absolute;left:{thr:.1f}%;top:-3px;bottom:-3px;width:2px;border-radius:1px;background:var(--text-tertiary)"></span></span><span class="num" style="width:36px;text-align:right;font-weight:500;color:{mc}">{m} %</span></span>')
    return (f'<div role="row" class="row" style="display:grid;grid-template-columns:{MC};column-gap:12px;align-items:center;min-height:40px;padding:0 8px;border-radius:10px">'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0"><span aria-hidden="true" style="width:10px;height:10px;flex:0 0 auto;border-radius:3px;background:var({col})"></span><span class="ell">{n}</span></span>'
            f'<span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{cnt}</span><span role="cell" class="num" style="text-align:right">{rev}</span><span role="cell">{bar}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-size:12px;color:{dc}">{d}</span></div>')
mt=('<div role="table" aria-label="Marża wg rodzaju prac" style="display:flex;flex-direction:column">'
    f'<div role="row" style="display:grid;grid-template-columns:{MC};column-gap:12px;height:24px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)"><span>Rodzaj</span><span style="text-align:right">Zleceń</span><span style="text-align:right">Przychód</span><span>Marża · próg 22 %</span><span style="text-align:right">vs wrz</span></div>'+
    mrow('--s1','Serwis i awarie',41,'61 200',42,'+1 pp',True)+mrow('--s2','Montaże klimatyzacji',19,'54 800',14,'−7 pp',False)+mrow('--s3','Pompy ciepła',3,'29 600',27,'−2 pp',False)+mrow('--s4','Umowy serwisowe',5,'26 800',52,'0 pp',False)+'</div>')
AG=[('Przed terminem','35 460','var(--text-tertiary)',35460),('1–30 dni','14 820','var(--warning)',14820),('31–60 dni','6 240','#E0702A',6240),('ponad 60 dni','2 420','var(--danger)',2420)]
tot=sum(x[3] for x in AG)
agbar='<div role="img" aria-label="Należności wg wieku: razem 58 940 zł" style="display:flex;gap:2px;height:10px">'+''.join(f'<span title="{n}: {v} zł" style="flex:{w} 1 0;border-radius:{"5px 0 0 5px" if i==0 else ("0 5px 5px 0" if i==3 else "0")};background:{c};{"opacity:.45;" if i==0 else ""}"></span>' for i,(n,v,c,w) in enumerate(AG))+'</div>'
aglist='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">'+''.join(f'<span style="display:flex;flex-direction:column;gap:2px"><span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">{dot(c)}{n}</span><span class="num" style="font-weight:500">{v} zł</span></span>' for n,v,c,w in AG)+'</div>'
def debtor(n,v,d,tip):
    return (f'<div title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:36px;padding:0 8px;border-radius:10px"><span class="ell" style="flex:1 1 auto">{n}</span><span class="num" style="font-size:12px;color:var(--text-tertiary)">{d}</span><span class="num" style="width:84px;text-align:right;font-weight:500">{v}</span></div>')
a('<div style="display:flex;gap:24px;align-items:flex-start">'
  '<section style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px">'+h3('Marża wg rodzaju prac')+mt+'</section>'
  '<section style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:10px">'+h3('Należności',sch('58 940 zł','Razem nieopłacone faktury · stan na 19 lis'))+
  '<div style="display:flex;flex-direction:column;gap:12px;padding:12px;border-radius:12px;background:var(--bg-raised)">'+agbar+aglist+'</div>'+
  '<div style="display:flex;flex-direction:column">'+debtor('Hotel Oliwski','9 860 zł','31 dni','FV/2026/10/018 · kontrola F-gaz zaległa')+debtor('Kancelaria Wit','4 960 zł','18 dni','FV/2026/10/027')+debtor('Restauracja Port','2 420 zł','74 dni','FV/2026/09/004 · 2 przypomnienia bez odpowiedzi')+'</div></section></div>')
# technicians
TC='minmax(0,1fr) 180px 96px 72px 120px 72px 72px'
def trow(ini,col,name,used,avail,rev,perh,ftf,ret,trav,note=''):
    pct=used/avail*100
    rc='var(--danger)' if ret>=3 else 'var(--text-secondary)'
    fc='var(--danger)' if ftf<85 else 'var(--text-primary)'
    return (f'<div role="row" class="row" style="display:grid;grid-template-columns:{TC};column-gap:12px;align-items:center;min-height:44px;padding:0 8px;border-radius:10px">'
            f'<span role="cell" style="display:flex;align-items:center;gap:8px;min-width:0">{cav(ini,col)}<span class="ell">{name}</span>{note}</span>'
            f'<span role="cell" title="{used} h z {avail} h dostępnych" style="display:flex;align-items:center;gap:8px"><span style="flex:1 1 auto;height:6px;border-radius:3px;background:var(--bg-subtle);position:relative"><span style="position:absolute;inset:0 auto 0 0;width:{pct:.0f}%;border-radius:3px;background:{col}"></span></span><span class="num" style="width:36px;text-align:right">{pct:.0f} %</span></span>'
            f'<span role="cell" class="num" style="text-align:right">{rev}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{perh}</span>'
            f'<span role="cell" class="num" style="text-align:right;color:{fc}">{ftf} %</span><span role="cell" class="num" style="text-align:right;color:{rc}">{ret}</span><span role="cell" class="num" style="text-align:right;color:var(--text-secondary)">{trav}</span></div>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Technicy',sch('październik','Godziny z protokołów i planowania'))+
  '<div role="table" aria-label="Technicy, październik 2026" style="display:flex;flex-direction:column">'
  f'<div role="row" style="display:grid;grid-template-columns:{TC};column-gap:12px;height:24px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)"><span>Technik</span><span title="Godziny pracy u klientów i w drodze / godziny dostępne">Wykorzystanie</span><span style="text-align:right">Przychód</span><span style="text-align:right">zł / h</span><span style="text-align:right" title="Usterka usunięta przy pierwszej wizycie">Za 1. razem</span><span style="text-align:right" title="Ponowna wizyta z tego samego powodu w 30 dni">Powroty</span><span style="text-align:right">Dojazd</span></div>'+
  trow('TL',TL,'Tomasz Lewandowski',162,168,'52 300 zł','323',94,1,'34 min')+
  trow('MZ',MZC,'Mateusz Zieliński',151,168,'44 100 zł','292',91,2,'29 min')+
  trow('KN',KN,'Kacper Nowak',148,168,'41 800 zł','282',96,0,'22 min')+
  trow('PD',PD,'Piotr Dąbrowski',118,152,'34 200 zł','290',83,4,'41 min',sch('urlop 2 dni','Dostępne godziny pomniejszone o urlop'))+'</div></section>')
a('</div></sc-if>')
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const isFV = ekran === 'faktura';","const isFV = ekran === 'faktura'; const isRap = ekran === 'raporty'; const nRap = navv(isRap);")
rep("isFV, actFV:","isRap, actRap: nRap.act, colRap: nRap.col, wRap: nRap.w, isFV, actFV:")
rep('"umowa", "planowanie"]','"umowa", "raporty", "planowanie"]')
lab='Raporty'
i=s.find('>'+lab+'</span>'); a0=s.rfind('<a href="#" class="nav"',0,i); e=s.find('</a>',i)
seg=s[a0:e]; assert seg.startswith('<a href="#" class="nav" style')
seg=seg.replace('class="nav"','class="nav {{actRap}}"',1).replace('color:var(--text-secondary)">','color:{{colRap}}">',1).replace('font-weight:400">Raporty','font-weight:{{wRap}}">Raporty')
s=s[:a0]+seg+s[e:]
open(P,'w').write(s); print('ok',len(s),TOT)
