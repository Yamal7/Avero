P='design/canvas/Main.dc.html'
s=open(P).read()
assert '{{isMapa}}' not in s
src=open('design/tools/zlecenie.py').read()
exec(src.split("H=[]")[0].replace("s=open(P).read()",""))
psrc=open('design/tools/plan.py').read()
for name in ['GRID','MAP','WEEK','FILT','LEFT']:
    exec([l for l in psrc.splitlines() if l.startswith(name+'=')][0])
TC={'MZ':'#3B82D6','TL':'#9B6BE0','KN':'#1FA7A5','PD':'#E0702A'}
NM={'MZ':'Marek Zieliński','TL':'Tomasz Lewandowski','KN':'Kamil Nowicki','PD':'Patryk Dąbrowski'}
def cav(ini,size=24,fs=10):
    return f'<span title="{NM[ini]}" aria-hidden="true" style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:50%;background:{TC[ini]};display:inline-flex;align-items:center;justify-content:center;font-size:{fs}px;line-height:10px;font-weight:600;color:#fff">{ini}</span>'
ROUTE='<circle cx="6" cy="19" r="3"></circle><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path><circle cx="18" cy="5" r="3"></circle>'
BOX='<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>'
LAYERS='<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>'
MINUS='<path d="M5 12h14"></path>'
LOC='<polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>'
DROP='<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>'
W,Hh=1440,1010
def X(x): return f'{x/W*100:.2f}%'
def Y(y): return f'{y/Hh*100:.2f}%'

H=[]; a=H.append
a('<sc-if value="{{isMapa}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">')
a('<span style="display:inline-flex;color:var(--text-secondary)">'+ic(GRID,16)+'</span><a href="#" class="flink" style="color:var(--text-secondary)">Serwis</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Planowanie</h1>')
a(SP+'<span class="num" style="font-size:12px;color:var(--text-tertiary);margin-right:4px">4 busy · 9 wizyt · 4 bez technika</span>'+ib('Więcej akcji','Więcej akcji',DOTS))
a('</div>')
seg=lambda on,label,paths,t: f'<button type="button" aria-pressed="{str(on).lower()}" title="{t}" style="height:24px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;border:0;border-radius:6px;background:{"var(--bg-surface)" if on else "transparent"};color:{"var(--text-primary)" if on else "var(--text-secondary)"};font-size:12px;font-weight:{500 if on else 400}">{ic(paths,14)}{label}</button>'
a('<div style="display:flex;align-items:center;gap:4px;padding:8px 12px 12px 16px">')
a('<button type="button" class="sec" title="Dziś  T" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-subtle);font-weight:500">Dziś</button>'+ib('Poprzedni dzień','Poprzedni dzień  ←',LEFT,28)+ib('Następny dzień','Następny dzień  →',CHEV,28))
a('<h2 title="piątek, 13 listopada 2026" style="margin:0 8px 0 4px;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Piątek, 13 listopada</h2>')
a('<span class="num" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">'+ic(CLOCK,14,'var(--text-tertiary)')+'stan na 09:14 · pozycje busów co 30 s</span>')
a(SP+ib('Filtruj','Filtruj  F',FILT,28))
a('<div role="group" aria-label="Widok" style="display:inline-flex;gap:2px;padding:2px;margin:0 4px;border-radius:8px;background:var(--bg-subtle)">'+seg(False,'Dzień',GRID,'Dzień  D')+seg(False,'Tydzień',WEEK,'Tydzień  W')+seg(True,'Mapa',MAP,'Mapa  M')+'</div>')
a('<button type="button" class="pri" title="Nowe zlecenie  C" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;margin-left:4px;border:0;border-radius:8px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(PLUS,14)+'Nowe zlecenie</button>')
a('</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0;border-top:1px solid var(--edge)">')
# aside
def chip(icon,col,txt,tip):
    t=f'<span>{txt}</span>' if txt else ''
    pad='0 8px 0 6px' if txt else '0'
    w='' if txt else 'width:22px;justify-content:center;'
    return f'<span title="{tip}" aria-label="{tip}" style="height:22px;{w}display:inline-flex;align-items:center;gap:4px;padding:{pad};border-radius:11px;background:var(--bg-surface);font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{ic(icon,14,col)}{t}</span>'
def stchip(kind,txt,tip):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:5px;padding:0 8px 0 5px;border-radius:11px;background:var(--bg-surface);font-size:12px;line-height:16px;color:var(--text-primary);white-space:nowrap">{sicon(kind)}<span>{txt}</span></span>'
def bus(ini,reg,status,chips,sel=False):
    ring=';box-shadow:inset 0 0 0 1.5px var(--accent)' if sel else ''
    return (f'<a href="#" class="card" title="{NM[ini]} · bus {reg}" style="display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:12px;background:var(--bg-raised){ring}">'
            f'<span style="display:flex;align-items:center;gap:8px;min-width:0">{cav(ini)}<span class="ell" style="flex:1 1 auto;font-weight:500">{NM[ini]}</span></span>'
            f'<span style="display:flex;flex-wrap:wrap;gap:4px;padding-left:32px">{status}{chips}</span></a>')
psv=open('design/tools/plan.py').read()
exec(psv[psv.index('def sicon('):psv.index('LBL=')])
exec([l for l in psv.splitlines() if l.startswith('LBL=')][0])
a('<aside aria-label="Busy i zgłoszenia" style="flex:0 0 320px;min-width:0;display:flex;flex-direction:column;gap:8px;padding:12px 12px 24px;border-right:1px solid var(--edge);overflow:hidden">')
a('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:0 4px"><h2 style="flex:1 1 auto;margin:0;font-size:13px;line-height:20px;font-weight:500">Busy</h2>'+CNT(4)+'</div>')
a(bus('KN','GD 2N551',stchip('drodze','09:40','W drodze do ZS-1047, przyjazd 09:40 (za 26 min)'),
      chip(CLOCK,'var(--text-tertiary)','14:00 Rumia','Następnie: 14:00 ZS-1049, Ewa Nowak, Rumia')+chip(ROUTE,'var(--text-tertiary)','38 km','Dziś 38 km, 2 przystanki')+chip(BOX,'var(--success)','','Części do ZS-1047 na pokładzie (MM/2026/11/052)'),sel=True))
a(bus('PD','GD 9P330',stchip('plan','Wolny','Wolny do 11:00 · Gdynia Redłowo'),
      chip(CLOCK,'var(--text-tertiary)','11:00 Kartuska','Następnie: 11:00 ZS-1039, Chłodnia Kartuska')+chip(DROP,'var(--success)','4,2 kg','R404A w busie: 4,2 kg (z ważenia)')+chip(ROUTE,'var(--text-tertiary)','41 km','Plan na dziś: 41 km')))
a(bus('MZ','GD 4H217',stchip('real','Na miejscu','Na miejscu: ZS-1042, Galeria Bałtycka, od 08:30'),
      chip(CLOCK,'var(--text-tertiary)','14:00','Następnie: 14:00 ZS-1050, Kancelaria Rybicki')+chip(ROUTE,'var(--text-tertiary)','22 km','Plan na dziś: 22 km')))
a(bus('TL','GD 7K904',stchip('real','Na miejscu','Na miejscu: ZS-1042, Galeria Bałtycka, od 08:00'),
      chip(CLOCK,'var(--text-tertiary)','12:30 Sopot','Następnie: 12:30 ZS-1045, montaż split, Jan Kowalski')+chip(WARN,'var(--warning)','R32','Brak R32 w busie: montaż o 12:30 wymaga ok. 1 kg')+chip(ROUTE,'var(--text-tertiary)','19 km','Plan na dziś: 19 km')))
a('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:12px 4px 0;box-sizing:content-box"><h2 style="flex:1 1 auto;margin:0;font-size:13px;line-height:20px;font-weight:500">Bez technika</h2>'+CNT(4)+'</div>')
def sug(id_,title,dist,sla,slaC,ini,prop,crit=False,tip=''):
    icon=ic(WARN,14,'var(--danger)') if crit else '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5" transform="rotate(45 7 7)" fill="none" stroke-width="1.5" style="stroke:var(--text-secondary)"></rect></svg>'
    return (f'<div title="{id_} · {title}" style="display:flex;flex-direction:column;gap:6px;padding:8px 4px;border-bottom:1px solid var(--edge)">'
            f'<span style="display:flex;align-items:center;gap:6px;min-width:0"><span style="display:inline-flex;flex:0 0 auto">{icon}</span><span class="ell" style="flex:1 1 auto;font-weight:500">{title}</span><span class="num" style="flex:0 0 auto;font-size:12px;color:{slaC};font-weight:{500 if crit else 400}" title="Do terminu reakcji z umowy">{sla}</span></span>'
            f'<span style="display:flex;align-items:center;gap:4px;padding-left:20px"><span title="Proponowany technik: {NM[ini]}. {tip}" style="height:22px;display:inline-flex;align-items:center;gap:5px;padding:0 8px 0 3px;border-radius:11px;background:var(--bg-raised);font-size:12px;line-height:16px;white-space:nowrap">{cav(ini,16,8)}{prop}</span>'
            f'<span class="num" style="font-size:12px;color:var(--text-tertiary)">{dist}</span>{SP}'
            f'<button type="button" class="capd" title="Przydziel wg propozycji  A" style="height:22px;padding:0 8px;border:0;border-radius:11px;font-size:12px;font-weight:500">Przydziel</button></span></div>')
a(sug('ZG-0920','Alarm mroźni −11 °C','6 km','0:52 do reakcji','var(--danger)','PD','Patryk 09:30',True,'Wolny do 11:00, ma R404A 4,2 kg'))
a(sug('ZG-0922','Szron na parowniku komory','4 km','3 h 10 min','var(--text-secondary)','KN','Kamil 10:45',tip='Wolny 10:30–13:30, blisko po ZS-1047'))
a(sug('ZG-0918','Błąd E7 jednostki zewnętrznej','1 km','1 dz. 2 h','var(--text-secondary)','MZ','Marek 12:45',tip='Po ZS-1042 w tej samej okolicy'))
a(sug('ZG-0921','Hałas klimakonwektora','2 km','18 h 40 min','var(--text-secondary)','TL','Tomasz jutro 08:00',tip='Dziś pełny grafik'))
a('</aside>')
# map
svg=[]
v=svg.append
v(f'<svg viewBox="0 0 {W} {Hh}" preserveAspectRatio="none" role="img" aria-label="Mapa Trójmiasta z trasami busów" style="position:absolute;inset:0;width:100%;height:100%;display:block">')
v(f'<rect width="{W}" height="{Hh}" style="fill:var(--map-land)"></rect>')
# parks
v('<path d="M300 120 C 380 160 470 300 560 420 C 620 500 660 560 700 640 L 600 700 C 520 600 430 470 360 360 C 320 290 280 200 300 120 Z" style="fill:var(--map-park)"></path>')
v('<text x="470" y="470" style="fill:var(--text-tertiary);font-size:12px;font-family:inherit" transform="rotate(52 470 470)">Trójmiejski Park Krajobrazowy</text>')
# sea
v('<path d="M560 0 L 575 140 L 615 228 L 598 300 L 650 360 L 720 440 L 800 520 L 880 600 L 960 655 L 1080 695 L 1250 705 L 1440 690 L 1440 0 Z" style="fill:var(--map-water)"></path>')
v('<text x="1060" y="300" style="fill:var(--text-tertiary);font-size:14px;letter-spacing:.08em">Zatoka Gdańska</text>')
# roads
for d,w in [('M120 150 C 260 170 380 190 450 210 S 560 300 640 400 S 760 560 840 650 S 920 760 990 820',7),('M260 40 C 300 200 380 320 470 480 S 600 760 700 960',7),('M990 820 L 700 870 L 520 900',5),('M470 480 L 650 405',4),('M600 720 L 820 640',4),('M840 650 L 1000 600 L 1150 640',4),('M450 210 L 470 60',4),('M120 150 L 60 300',4)]:
    v(f'<path d="{d}" fill="none" stroke-width="{w}" stroke-linecap="round" style="stroke:var(--bg-surface)"></path>')
# district labels
for x,y,t in [(150,110,'Rumia'),(380,250,'Gdynia'),(470,95,'Obłuże'),(585,345,'Redłowo'),(720,500,'Sopot'),(740,610,'Oliwa'),(870,620,'Wrzeszcz'),(960,850,'Gdańsk'),(700,830,'Siedlce')]:
    v(f'<text x="{x}" y="{y}" style="fill:var(--text-tertiary);font-size:13px">{t}</text>')
# routes
def path(d,col,dash=False,op=1,w=3):
    da=' stroke-dasharray="2 7"' if dash else ''
    return f'<path d="{d}" fill="none" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{da} style="stroke:{col};opacity:{op}"></path>'
R=[ # dimmed others
 path('M790 575 C 860 640 900 700 935 775 C 910 720 870 690 845 655',TC['MZ'],op=.55),path('M845 655 C 870 690 890 710 905 735',TC['MZ'],True,.55),
 path('M790 575 C 810 600 830 630 845 655',TC['TL'],op=.55),path('M845 655 C 800 580 750 520 700 460',TC['TL'],True,.55),
 path('M565 320 C 520 480 620 700 790 830',TC['PD'],True,.55),path('M790 830 C 800 740 790 660 760 590',TC['PD'],True,.55),
 path('M790 575 C 740 520 690 460 650 410',TC['KN'],w=4),path('M650 410 C 600 330 520 240 445 205 C 360 180 260 150 185 135',TC['KN'],True,w=4),
 # suggestion
 '<path d="M565 320 C 540 290 500 255 470 235" fill="none" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 5" style="stroke:var(--accent)"></path>',
 '<text x="455" y="288" text-anchor="end" style="fill:var(--accent);font-size:12px;font-weight:500">6 km · 18 min</text>']
svg+=R
# base
v('<g aria-label="Baza Kranz HVACR"><rect x="778" y="563" width="24" height="24" rx="6" style="fill:var(--text-primary)"></rect><text x="790" y="580" text-anchor="middle" style="fill:var(--bg-surface);font-size:11px;font-weight:600">K</text></g>')
def stop(x,y,n,ini,state,op=1):
    c=TC[ini]
    if state=='done': return f'<g opacity="{op}"><circle cx="{x}" cy="{y}" r="11" style="fill:{c}"></circle><path d="M{x-4} {y} l3 3 5-6" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:#fff"></path></g>'
    if state=='here': return f'<g opacity="{op}"><circle cx="{x}" cy="{y}" r="15" style="fill:{c};opacity:.18"></circle><circle cx="{x}" cy="{y}" r="11" style="fill:{c}"></circle><text x="{x}" y="{y+4}" text-anchor="middle" style="fill:#fff;font-size:11px;font-weight:600">{n}</text></g>'
    return f'<g opacity="{op}"><circle cx="{x}" cy="{y}" r="11" stroke-width="2" style="fill:var(--bg-surface);stroke:{c}"></circle><text x="{x}" y="{y+4}" text-anchor="middle" style="fill:{c};font-size:11px;font-weight:600">{n}</text></g>'
o=.7
svg+=[stop(935,775,1,'MZ','done',o),stop(845,655,2,'MZ','here',o),stop(905,735,3,'MZ','plan',o),stop(700,460,2,'TL','plan',o),
      stop(790,830,1,'PD','plan',o),stop(760,590,2,'PD','plan',o),stop(445,205,1,'KN','plan'),stop(185,135,2,'KN','plan')]
# unassigned diamonds
def dia(x,y,crit=False):
    st='var(--danger)' if crit else 'var(--text-secondary)'
    return f'<rect x="{x-7}" y="{y-7}" width="14" height="14" rx="2.5" transform="rotate(45 {x} {y})" stroke-width="2" style="fill:var(--bg-surface);stroke:{st}"></rect>'
svg+=[dia(470,235,True),dia(560,250),dia(955,790),dia(820,622)]
# buses
def busm(x,y,ini,sel=False):
    r=16 if sel else 14
    ring=f'<circle cx="{x}" cy="{y}" r="{r+5}" style="fill:{TC[ini]};opacity:.2"></circle>' if sel else ''
    return f'{ring}<circle cx="{x}" cy="{y}" r="{r+2}" style="fill:var(--bg-surface)"></circle><circle cx="{x}" cy="{y}" r="{r}" style="fill:{TC[ini]}"></circle><text x="{x}" y="{y+4}" text-anchor="middle" style="fill:#fff;font-size:11px;font-weight:600">{ini}</text>'
svg+=[busm(868,632,'MZ'),busm(818,676,'TL'),busm(565,320,'PD'),busm(650,410,'KN',True)]
v('</svg>')
a('<div style="position:relative;flex:1 1 auto;min-width:0;overflow:hidden">'+''.join(svg))
# labels for KN stops
def lab(x,y,txt,dx=16,dy=-12):
    return f'<span class="num" style="position:absolute;left:calc({X(x)} + {dx}px);top:calc({Y(y)} + {dy}px);height:22px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;border-radius:11px;background:var(--bg-surface);box-shadow:var(--shadow-pop);font-size:12px;white-space:nowrap">{txt}</span>'
a(lab(445,205,'09:30 · ZS-1047 Delikatesy Morskie',16,-11))
a(lab(185,135,'14:00 · ZS-1049 Rumia',16,-11))
# KN popover
row=lambda icon,col,txt: f'<li style="display:flex;align-items:center;gap:10px">{ic(icon,16,col)}<span style="min-width:0">{txt}</span></li>'
a(f'<div role="dialog" aria-label="Kamil Nowicki" style="position:absolute;left:{X(760)};top:{Y(250)};z-index:3;width:300px;display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:14px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop)">'
  f'<div style="display:flex;align-items:center;gap:10px">{cav("KN",36,13)}<span style="display:flex;flex-direction:column;min-width:0"><span style="font-weight:600">Kamil Nowicki</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Technik · bus <span class="mono" style="font-size:11px">GD 2N551</span></span></span></div>'
  '<div style="height:1px;background:var(--edge)"></div>'
  '<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px">'+
  f'<li style="display:flex;align-items:center;gap:10px">{sicon("drodze")}<span style="padding-left:1px">W drodze · 50 km/h, al. Zwycięstwa</span></li>'+
  row(CLOCK,'var(--text-tertiary)','Przyjazd <b style="font-weight:500">09:40</b> · za 26 min')+
  row(PIN,'var(--text-tertiary)','ZS-1047 · Gdynia, ul. Starowiejska 12')+
  row(BOX,'var(--success)','Silnik i łopatka na pokładzie')+
  row(ROUTE,'var(--text-tertiary)','Dziś 38 km, 2 przystanki')+
  '</ul><div style="display:flex;gap:8px"><button type="button" class="sec" style="flex:1 1 auto;height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(PHONE,14)+'Zadzwoń</button><button type="button" class="sec" style="flex:1 1 auto;height:32px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">Otwórz zlecenie</button></div></div>')
# suggestion callout
a(f'<div role="note" style="position:absolute;left:{X(110)};top:{Y(300)};z-index:2;width:288px;display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:14px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop)">'
  '<span style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px">'+ic(WARN,14,'var(--danger)')+'<span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZG-0920</span>'+SP+'<span class="num" style="color:var(--danger);font-weight:500">0:52 do reakcji</span></span>'
  '<span style="font-weight:500" title="Delikatesy Morskie, Gdynia, ul. Świętojańska 34, maszynownia">Alarm mroźni −11 °C</span>'
  f'<span style="display:flex;flex-wrap:wrap;align-items:center;gap:4px"><span title="Najbliższy wolny technik: Patryk Dąbrowski" style="height:22px;display:inline-flex;align-items:center;gap:5px;padding:0 8px 0 3px;border-radius:11px;background:var(--bg-raised);font-size:12px;white-space:nowrap">{cav("PD",16,8)}Patryk</span>'+chip(ROUTE,'var(--text-tertiary)','6 km · 18 min','Dojazd z Redłowa').replace('var(--bg-surface)','var(--bg-raised)')+chip(DROP,'var(--success)','R404A','R404A w busie: 4,2 kg; agregat UR-3108 ma 24,0 kg').replace('var(--bg-surface)','var(--bg-raised)')+'</span>'
  '<div style="display:flex;gap:8px"><button type="button" class="ghost" style="height:28px;padding:0 10px;border:0;border-radius:8px;color:var(--text-secondary)">Inny technik</button>'+SP+'<button type="button" class="pri" title="Przydziel  Enter" style="height:28px;padding:0 12px;border:0;border-radius:8px;background:var(--accent);color:var(--on-accent);font-weight:500">Przydziel na 09:30</button></div></div>')
# layer toggles top-left
def tog(on,col,txt):
    mark=f'<span aria-hidden="true" style="width:10px;height:10px;border-radius:3px;background:{col if on else "transparent"};box-shadow:inset 0 0 0 1.5px {col}"></span>'
    return f'<button type="button" aria-pressed="{str(on).lower()}" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:{"var(--text-primary)" if on else "var(--text-secondary)"};font-size:12px">{mark}{txt}</button>'
a('<div style="position:absolute;left:16px;top:16px;z-index:2;display:flex;align-items:center;gap:2px;padding:4px;border-radius:12px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop)">'
  f'<span style="display:inline-flex;padding:0 6px 0 4px;color:var(--text-tertiary)">{ic(LAYERS,16)}</span>'+''.join(tog(on,TC[i],NM[i].split()[0]) for i,on in [('KN',True),('PD',True),('MZ',True),('TL',True)])+
  '<span style="width:1px;height:16px;margin:0 4px;background:var(--edge)"></span>'+tog(True,'var(--text-secondary)','Zgłoszenia')+tog(False,'var(--text-secondary)','Ruch drogowy')+'</div>')
# zoom
zb=lambda l,t,p: f'<button type="button" class="ib" aria-label="{l}" title="{t}" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:transparent;color:var(--text-secondary);padding:0">{ic(p,16)}</button>'
a('<div style="position:absolute;right:16px;bottom:16px;z-index:2;display:flex;flex-direction:column;gap:2px;padding:4px;border-radius:12px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop)">'+zb('Przybliż','Przybliż  +',PLUS)+zb('Oddal','Oddal  −',MINUS)+'<span style="height:1px;margin:2px 4px;background:var(--edge)"></span>'+zb('Pokaż wszystkie busy','Pokaż wszystkie  0',LOC)+'</div>')
# legend
a('<div style="position:absolute;left:16px;bottom:16px;z-index:2;display:flex;align-items:center;gap:16px;padding:8px 12px;border-radius:12px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop);font-size:12px;line-height:16px;color:var(--text-secondary)">'
  '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="22" height="6" aria-hidden="true"><path d="M1 3h20" stroke-width="3" stroke-linecap="round" style="stroke:var(--text-secondary)"></path></svg>przejechane</span>'
  '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="22" height="6" aria-hidden="true"><path d="M1 3h20" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 5" style="stroke:var(--text-secondary)"></path></svg>plan</span>'
  '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="14" height="14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5" transform="rotate(45 7 7)" fill="none" stroke-width="1.5" style="stroke:var(--text-secondary)"></rect></svg>zgłoszenie bez technika</span>'
  '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="14" height="14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3" style="fill:var(--text-primary)"></rect></svg>baza</span></div>')
a('</div></div></sc-if>')
blk='\n'.join(H)+'\n'
s=s.replace('--edge:rgba(27,26,25,.07);','--edge:rgba(27,26,25,.07);--map-land:#F2F1EE;--map-park:#E8ECE3;--map-water:#E1E8EC;',1)
s=s.replace('--edge:rgba(255,255,255,.07);','--edge:rgba(255,255,255,.07);--map-land:#1A1A19;--map-park:#1A1F18;--map-water:#131A20;',1)
k=s.index('</main>'); s=s[:k]+blk+s[k:]
s=s.replace('"options": ["dzień", "przeciąganie"]','"options": ["dzień", "przeciąganie", "mapa"]',1)
old="    const isPl = ekran === 'planowanie'; const nPl = navv(isPl); const isDr = isPl && (this.props.plan ?? 'dzień') === 'przeciąganie';"
assert old in s
s=s.replace(old,"    const planV = this.props.plan ?? 'dzień'; const isMa = ekran === 'planowanie' && planV === 'mapa'; const isPl = ekran === 'planowanie' && !isMa; const nPl = navv(ekran === 'planowanie'); const isDr = isPl && planV === 'przeciąganie';",1)
s=s.replace('      isPlan: isPl,','      isMapa: isMa, isPlan: isPl,',1)
open(P,'w').write(s); print('ok')
