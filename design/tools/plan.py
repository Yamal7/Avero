import re, sys
sys.path.insert(0,'design/tools')
P='design/canvas/Main.dc.html'
s=open(P).read()
assert '{{isPlan}}' not in s
src=open('design/tools/zlecenie.py').read()
# reuse helpers (icons, ib, av, st_svg) by exec of the helper part only
helpers=src.split("H=[]")[0].replace("s=open(P).read()","")
exec(helpers)
GRID='<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>'
MAP='<path d="M14.1 6.3 9.9 4.2a2 2 0 0 0-1.8 0L3.6 6.4A1 1 0 0 0 3 7.3v12.1a1 1 0 0 0 1.4.9l4.5-2.2a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.5-2.2a1 1 0 0 0 .6-.9V4.6a1 1 0 0 0-1.4-.9l-4.5 2.2a2 2 0 0 1-1.8 0Z"></path><path d="M15 6v15M9 3v15"></path>'
WEEK='<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18M8 10v12M13 10v12M18 10v12"></path>'
FILT='<path d="M3 6h18M7 12h10M10 18h4"></path>'
LEFT='<path d="m15 18-6-6 6-6"></path>'

TC={'MZ':'#3B82D6','TL':'#9B6BE0','KN':'#1FA7A5','PD':'#E0702A'}
def cav(ini,name,size=24,fs=10):
    return f'<span title="{name}" aria-hidden="true" style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:50%;background:{TC[ini]};display:inline-flex;align-items:center;justify-content:center;font-size:{fs}px;line-height:10px;font-weight:600;color:#fff">{ini}</span>'
T0,T1=7,17
def pct(t): return f'{(t-T0)/(T1-T0)*100:.3f}%'
def hm(t):
    h=int(t); m=round((t-h)*60); return f'{h:02d}:{m:02d}'
def sicon(kind):
    if kind=='done4':
        return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--success)"></circle><path d="M7 4a3 3 0 1 1 0 6a3 3 0 1 1 0-6Z" style="fill:var(--success)"></path></svg>'
    if kind=='real':
        return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--st-progress)"></circle><path d="M7 7L7 4A3 3 0 1 1 4.40 8.50Z" style="fill:var(--st-progress)"></path></svg>'
    if kind=='drodze': return st_svg('drodze')
    if kind=='plan':
        return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--text-secondary)"></circle></svg>'
    if kind=='wait':
        return '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="flex:0 0 auto"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--st-blocked)"></circle><path d="M7 4.2v3.3M7 9.7v.01" fill="none" stroke-width="1.5" stroke-linecap="round" style="stroke:var(--st-blocked)"></path></svg>'
LBL={'done4':'Do rozliczenia','real':'W realizacji','drodze':'W drodze','plan':'Zaplanowane','wait':'Czeka na części'}

def block(a,b,kind,id_,title,place,warn='',sel=False):
    d=b-a
    w=(f'<span title="{warn}" style="display:inline-flex;flex:0 0 auto;color:var(--warning)">'+ic(WARN,14)+'</span>') if warn else ''
    ring=';box-shadow:inset 0 0 0 1.5px var(--accent)' if sel else ''
    icon=f'<span role="img" aria-label="{LBL[kind]}" style="display:inline-flex;flex:0 0 auto">{sicon(kind)}</span>'
    tm=f'<span class="num" style="flex:0 0 auto;color:var(--text-tertiary);white-space:nowrap">{hm(a)}–{hm(b)}</span>'
    if d<=1.01:
        inner=(f'<span style="display:flex;align-items:center;gap:4px;min-width:0">{icon}<span class="num ell" style="font-size:11px;line-height:14px;color:var(--text-tertiary)">{hm(a)}</span></span>'
               f'<span style="font-size:12px;font-weight:500;line-height:16px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">{title}</span>')
    elif d<2:
        inner=(f'<span style="display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;line-height:16px">{icon}{tm}{w}</span>'
               f'<span class="ell" style="font-weight:500;line-height:18px">{title}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{place}</span>')
    else:
        inner=(f'<span style="display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;line-height:16px">{icon}<span class="mono" style="flex:0 0 auto;font-size:11px;color:var(--text-tertiary);white-space:nowrap">{id_}</span>{tm}{w}</span>'
               f'<span class="ell" style="font-weight:500;line-height:18px">{title}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{place}</span>')
    return (f'<a href="#{id_.lower()}" class="card" title="{id_} · {title} · {hm(a)}–{hm(b)} · {LBL[kind]}" style="position:absolute;top:6px;bottom:6px;left:calc({pct(a)} + 2px);width:calc({d/(T1-T0)*100:.3f}% - 4px);z-index:1;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 8px;border-radius:10px;background:var(--bg-raised);overflow:hidden{ring}">{inner}</a>')
def travel(a,b,label):
    return (f'<span title="Dojazd {label}" style="position:absolute;top:50%;left:{pct(a)};width:{(b-a)/(T1-T0)*100:.3f}%;height:0;border-top:1px dashed var(--border-strong)"></span>'
            f'<span class="num" aria-hidden="true" style="position:absolute;top:calc(50% - 22px);left:{pct(a)};width:{(b-a)/(T1-T0)*100:.3f}%;text-align:center;font-size:11px;line-height:14px;color:var(--text-tertiary);white-space:nowrap">{label}</span>')

techs=[
 ('MZ','Marek Zieliński','GD 4H217','6 h 15 min z 8 h',78,'zajęty do 12:30',
   [travel(7.25,7.5,'15'),block(7.5,8.25,'done4','ZS-1038','Przegląd 4 kasetonów','Hotel Mercure Gdańsk'),travel(8.25,8.5,'15'),
    block(8.5,12.5,'real','ZS-1042','Przegląd 6 jednostek VRV','Galeria Bałtycka, z Tomaszem'),travel(13.6,14,'25'),block(14,15.5,'plan','ZS-1050','Przegląd klimatyzacji serwerowni','Kancelaria Rybicki · Gdańsk')]),
 ('TL','Tomasz Lewandowski','GD 7K904','7 h 30 min z 8 h',94,'zajęty do 15:30',
   [block(8,12,'real','ZS-1042','Przegląd 6 jednostek VRV','Galeria Bałtycka, z Markiem'),travel(12,12.5,'25'),
    block(12.5,15.5,'plan','ZS-1045','Montaż split Daikin Perfera 3,5 kW','Jan Kowalski · Sopot',warn='Brak R32 w busie GD 7K904: w busie 0 kg, potrzebne ok. 1 kg na dopełnienie')]),
 ('KN','Kamil Nowicki','GD 2N551','3 h 30 min z 8 h',44,'wolny 10:30–13:30 · 21 km',
   [travel(9.2,9.5,'28'),block(9.5,10.5,'drodze','ZS-1047','Wentylator w lodziarce','Delikatesy Morskie · Gdynia',sel=True),travel(13.5,14,'30'),
    block(14,16.5,'plan','ZS-1049','Uruchomienie pompy ciepła Panasonic 9 kW','Ewa Nowak · Rumia')]),
 ('PD','Patryk Dąbrowski','GD 9P330','2 h 30 min z 8 h',31,'wolny do 11:00 · 6 km · R404A 4,2 kg',
   [travel(10.6,11,'25'),block(11,12.5,'plan','ZS-1039','Kontrola szczelności agregatu Bitzer','Chłodnia Kartuska · Gdańsk'),travel(15.1,15.5,'20'),
    block(15.5,16.5,'wait','ZS-1033','Płyta sterownika','Olivia Four · Gdańsk')]),
]
H=[]; a=H.append
a('<sc-if value="{{isPlan}}" hint-placeholder-val="{{false}}">')
# header
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">')
a('<span style="display:inline-flex;color:var(--text-secondary)">'+ic(GRID,16)+'</span><a href="#" class="flink" style="color:var(--text-secondary)">Serwis</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Planowanie</h1>')
a(SP+'<span class="num" style="font-size:12px;color:var(--text-tertiary);margin-right:4px">9 wizyt · 7 do zaplanowania</span>'+ib('Więcej akcji','Więcej akcji',DOTS))
a('</div>')
# toolbar
seg=lambda on,label,paths,t: f'<button type="button" aria-pressed="{str(on).lower()}" title="{t}" style="height:24px;display:inline-flex;align-items:center;gap:6px;padding:0 8px;border:0;border-radius:6px;background:{"var(--bg-surface)" if on else "transparent"};color:{"var(--text-primary)" if on else "var(--text-secondary)"};font-size:12px;font-weight:{500 if on else 400}">{ic(paths,14)}{label}</button>'
a('<div style="display:flex;align-items:center;gap:4px;padding:8px 12px 12px 16px">')
a('<button type="button" class="sec" title="Dziś  T" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-subtle);font-weight:500">Dziś</button>'+ib('Poprzedni dzień','Poprzedni dzień  ←',LEFT,28)+ib('Następny dzień','Następny dzień  →',CHEV,28))
a('<h2 title="piątek, 13 listopada 2026" style="margin:0 8px 0 4px;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Piątek, 13 listopada</h2>')
a(SP+ib('Filtruj','Filtruj  F',FILT,28))
a('<div role="group" aria-label="Widok" style="display:inline-flex;gap:2px;padding:2px;margin:0 4px;border-radius:8px;background:var(--bg-subtle)">'+seg(True,'Dzień',GRID,'Dzień  D')+seg(False,'Tydzień',WEEK,'Tydzień  W')+seg(False,'Mapa',MAP,'Mapa  M')+'</div>')
a('<button type="button" class="pri" title="Nowe zlecenie  C" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;margin-left:4px;border:0;border-radius:8px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(PLUS,14)+'Nowe zlecenie</button>')
a('</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0;border-top:1px solid var(--edge)">')
# left list
def item(id_,title,place,est,sla,slaC,slaW,prio,drag=False,sug=None):
    pr={'k':'<span title="Priorytet: krytyczny" style="display:inline-flex;color:var(--danger)">'+ic(WARN,14)+'</span>',
        'w':'<svg width="14" height="14" viewBox="0 0 14 14" aria-label="Priorytet: wysoki" role="img"><rect x="1" y="8" width="3" height="5" rx="1" style="fill:var(--text-secondary)"></rect><rect x="5.5" y="5" width="3" height="8" rx="1" style="fill:var(--text-secondary)"></rect><rect x="10" y="2" width="3" height="11" rx="1" style="fill:var(--text-secondary)"></rect></svg>',
        'n':'<svg width="14" height="14" viewBox="0 0 14 14" aria-label="Priorytet: normalny" role="img"><rect x="1" y="8" width="3" height="5" rx="1" style="fill:var(--text-secondary)"></rect><rect x="5.5" y="5" width="3" height="8" rx="1" style="fill:var(--text-secondary)"></rect><rect x="10" y="2" width="3" height="11" rx="1" style="fill:var(--border-strong)"></rect></svg>'}[prio]
    body=(f'<span style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px">{pr}<span class="mono" style="font-size:11px;color:var(--text-tertiary)">{id_}</span>{SP}<span class="num" style="color:{slaC};font-weight:{slaW}">{sla}</span></span>'
          f'<span class="ell" style="font-weight:500">{title}</span>'
          f'<span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">{place}</span><span class="num" style="color:var(--text-tertiary);white-space:nowrap">{est}</span></span>')
    st='display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px;background:var(--bg-raised);cursor:grab'
    if sug:
        ini,txt=sug
        body+=(f'<span style="display:flex;align-items:center;gap:6px;margin-top:6px;padding-top:6px;border-top:1px solid var(--edge);font-size:12px;line-height:16px">{cav(ini,"",16,8)}<span class="ell" style="flex:1 1 auto;color:var(--text-secondary)"><span style="color:var(--text-primary);font-weight:500">{txt}</span></span><span class="capd" title="Przydziel wg propozycji  A" style="height:22px;display:inline-flex;align-items:center;padding:0 8px;border-radius:11px;font-size:12px;font-weight:500;white-space:nowrap">Przydziel</span></span>')
    if drag:
        return ('<sc-if value="{{isDrag}}" hint-placeholder-val="{{false}}"><div aria-hidden="true" style="height:76px;border-radius:12px;border:1.5px dashed var(--border-strong)"></div></sc-if>'
                f'<sc-if value="{{{{noDrag}}}}" hint-placeholder-val="{{{{true}}}}"><a href="#" class="card" draggable="true" style="{st}">{body}</a></sc-if>')
    return f'<a href="#" class="card" draggable="true" style="{st}">{body}</a>'
grp=lambda t,n: f'<div style="display:flex;align-items:center;gap:8px;height:28px;padding:0 4px"><h3 style="margin:0;font-size:12px;line-height:16px;font-weight:500;color:var(--text-secondary)">{t}</h3>{CNT(n)}</div>'
a('<aside aria-label="Do zaplanowania" style="flex:0 0 248px;min-width:0;display:flex;flex-direction:column;gap:8px;padding:12px 12px 24px;border-right:1px solid var(--edge)">')
a('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:0 4px"><h2 style="flex:1 1 auto;margin:0;font-size:13px;line-height:20px;font-weight:500">Do zaplanowania</h2>'+CNT(7)+'</div>')
a('<p style="margin:0 4px 4px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Przeciągnij na oś technika. Kolejność według czasu do terminu SLA.</p>')
a(grp('Zgłoszenia',4))
a(item('ZG-0920','Alarm temperatury mroźni, −11 °C','Delikatesy Morskie · Świętojańska','~1 h 15','0:52 do reakcji','var(--danger)',500,'k',drag=True,sug=('PD','Patryk 09:30 · 6 km')))
a(item('ZG-0922','Szron na parowniku komory mroźniczej','Bistro Przystań · Gdynia','~1 h 30','3 h 10 min','var(--text-secondary)',400,'w',sug=('KN','Kamil 10:45 · 4 km')))
a(item('ZG-0921','Hałas wentylatora klimakonwektora, pok. 214','Hotel Mercure Gdańsk','~45 min','18 h 40 min','var(--text-secondary)',400,'n'))
a(item('ZG-0918','Błąd E7 jednostki zewnętrznej','WM Grunwaldzka 186 · Wrzeszcz','~1 h','1 dz. 2 h','var(--text-secondary)',400,'n'))
a('<div style="height:4px"></div>'+grp('Przeglądy i kontrole',3))
a(item('ZS-1021','Kontrola szczelności, 52,4 t CO₂e','Piekarnia Oliwska · Oliwa','~1 h','3 dni po terminie','var(--danger)',500,'w'))
a(item('UR-3107','Kontrola szczelności agregatu Bitzer','Delikatesy Morskie · Świętojańska','~1 h','do 4 gru','var(--text-primary)',500,'n'))
a(item('ZS-1053','Przegląd kasetonów, 2 z 4 w umowie','Hotel Mercure Gdańsk','~2 h','do 30 lis','var(--text-secondary)',400,'n'))
a('</aside>')
# timeline
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;padding:0 16px 24px 0">')
hours=''.join(f'<span class="num" style="position:absolute;top:0;left:{pct(h)};transform:translateX({'0' if h==T0 else '-50%'});padding-left:{'4px' if h==T0 else '0'};font-size:11px;line-height:28px;color:var(--text-tertiary)">{h:02d}</span>' for h in range(T0,T1))
lines=''.join(f'<span aria-hidden="true" style="position:absolute;top:0;bottom:0;left:{pct(h)};width:1px;background:var(--edge)"></span>' for h in range(T0+1,T1))
NOW=9+14/60
a(f'<div style="display:flex;height:32px"><div style="flex:0 0 232px"></div><div style="position:relative;flex:1 1 auto">{hours}<span class="num" style="position:absolute;top:6px;left:{pct(NOW)};transform:translateX(-50%);height:18px;padding:0 6px;border-radius:6px;background:var(--danger);color:#fff;font-size:11px;line-height:18px;font-weight:500">09:14</span></div></div>')
a('<div role="grid" aria-label="Plan dnia techników" style="position:relative;display:flex;flex-direction:column">')
for ini,name,bus,load,pc,fit,blocks in techs:
    drag_hint=(f'<sc-if value="{{{{isDrag}}}}" hint-placeholder-val="{{{{false}}}}"><span class="ell" style="font-size:12px;line-height:16px;color:{"var(--success)" if ini=="PD" else "var(--text-secondary)"};font-weight:{500 if ini=="PD" else 400}">{fit}</span></sc-if>')
    a(f'<div role="row" style="display:flex;min-height:88px;border-bottom:1px solid var(--edge)">'
      f'<div role="rowheader" style="flex:0 0 232px;min-width:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:8px 8px 8px 16px">'
      f'<span style="display:flex;align-items:center;gap:8px;min-width:0">{cav(ini,name)}<span class="ell" style="font-weight:500">{name}</span></span>'
      f'<span style="display:flex;flex-direction:column;gap:4px;padding-left:32px"><sc-if value="{{{{noDrag}}}}" hint-placeholder-val="{{{{true}}}}"><span class="num ell" title="Bus {bus}" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{load}</span></sc-if>{drag_hint}'
      f'<span aria-hidden="true" style="height:4px;border-radius:2px;background:var(--bg-subtle);overflow:hidden"><span style="display:block;height:100%;width:{pc}%;border-radius:2px;background:{"var(--warning)" if pc>90 else "var(--text-tertiary)"}"></span></span></span></div>'
      f'<div role="gridcell" style="position:relative;flex:1 1 auto;min-width:0">{lines}'+''.join(blocks))
    if ini=='PD':
        a('<sc-if value="{{isDrag}}" hint-placeholder-val="{{false}}">'
          +travel(9.2,9.5,'18')+
          f'<div aria-label="Podgląd przydziału ZG-0920 dla Patryka Dąbrowskiego, 09:30–10:45" style="position:absolute;top:6px;bottom:6px;left:calc({pct(9.5)} + 2px);width:calc({(1.25)/(T1-T0)*100:.3f}% - 4px);display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 8px;border-radius:10px;border:1.5px dashed var(--accent);background:var(--bg-surface);box-shadow:var(--shadow-pop)">'
          '<span style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px"><span style="display:inline-flex;color:var(--danger)">'+ic(WARN,14)+'</span><span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZG-0920</span></span>'
          '<span class="ell" style="font-weight:500;line-height:18px">Alarm mroźni</span><span class="num ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">09:30–10:45</span></div>'
          '</sc-if>')
    a('</div></div>')
# now line
a(f'<span aria-hidden="true" style="position:absolute;top:0;bottom:0;left:calc(232px + (100% - 232px) * {(NOW-T0)/(T1-T0):.4f});width:1.5px;z-index:2;background:var(--danger)"></span>')
# popover in drag
def chk(ok,txt,sub=''):
    icn=ic(CHECKC,16,'var(--success)') if ok else ic(WARN,16,'var(--warning)')
    return f'<li style="display:flex;gap:10px;align-items:flex-start"><span style="display:inline-flex;margin-top:2px">{icn}</span><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span>{txt}</span>'+(f'<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">{sub}</span>' if sub else '')+'</span></li>'
popleft=f'calc(232px + (100% - 232px) * {(9.5-T0)/(T1-T0):.4f})'
a('<sc-if value="{{isDrag}}" hint-placeholder-val="{{false}}">'
  f'<div role="dialog" aria-label="Przydział ZG-0920" style="position:absolute;top:360px;left:{popleft};z-index:3;width:340px;display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:14px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop)">'
  '<div style="display:flex;flex-direction:column;gap:2px"><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Przydziel <span class="mono" style="font-size:11px">ZG-0920</span></span><span style="font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">Patryk Dąbrowski, 09:30–10:45</span></div>'
  '<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px">'+
  chk(True,'Wolny do 11:00','Najbliżej: 6 km, dojazd 18 min')+
  chk(True,'R404A w busie: 4,2 kg','Agregat UR-3108, układ 24,0 kg R404A')+
  chk(True,'Na miejscu 09:30, termin reakcji 10:06','SLA 4 h z umowy serwisowej')+
  chk(False,'Kolejna wizyta ZS-1039 o 11:00','Dojazd 25 min: spóźnienie ok. 10 min. Klient akceptuje okno 11:00–12:00.')+
  '</ul>'
  '<div style="display:flex;align-items:center;gap:8px"><button type="button" class="ghost" title="Anuluj  Esc" style="height:32px;padding:0 10px;border:0;border-radius:10px;color:var(--text-secondary)">Anuluj</button>'+SP+
  '<button type="button" class="sec" title="Przydziel i przesuń ZS-1039 na 11:15" style="height:32px;padding:0 12px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">Przesuń ZS-1039</button>'
  '<button type="button" class="pri" title="Przydziel  Enter" style="height:32px;padding:0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">Przydziel</button></div>'
  '</div></sc-if>')
a('</div>')
# conflicts
a('<section style="display:flex;flex-direction:column;gap:4px;margin:20px 0 0 16px">'
  '<div style="display:flex;align-items:center;gap:8px;height:28px"><h3 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Do sprawdzenia</h3>'+CNT(2)+'</div>'
  '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)"><span style="display:inline-flex;color:var(--warning)">'+ic(WARN,16)+'</span>'
  '<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><span><span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZS-1045</span> Brak R32 w busie Tomasza na montaż o 12:30</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Na magazynie 1 butla 9 kg; zamówienie w zadaniu ZD-118.</span></span>'
  '<button type="button" class="sec" title="Przesunięcie do samochodu (MM)" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-subtle);font-weight:500;white-space:nowrap">Przesuń butlę MM</button></div>'
  '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)"><span style="display:inline-flex;color:var(--st-blocked)">'+ic(CLOCK,16)+'</span>'
  '<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px"><span><span class="mono" style="font-size:11px;color:var(--text-tertiary)">ZS-1033</span> Płyta sterownika jeszcze nie dotarła</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Dostawa Mitsubishi zapowiedziana na 14:00. Jeśli się spóźni, wizyta wróci do listy „Do zaplanowania”.</span></span>'
  '<button type="button" class="ghost" style="height:28px;padding:0 10px;border:0;border-radius:8px;color:var(--text-secondary);white-space:nowrap">Śledź dostawę</button></div>'
  '</section>')
a('</div></div></sc-if>')
blk='\n'.join(H)+'\n'
k=s.index('</main>'); s=s[:k]+blk+s[k:]
# props
s=s.replace('"szablony", "zlecenie"]','"szablony", "zlecenie", "planowanie"]',1)
old='"sekcja": {"editor": "enum"'
assert old in s
s=s.replace(old,'"plan": {"editor": "enum", "options": ["dzień", "przeciąganie"], "default": "dzień", "section": "Widok"}, '+old,1)
s=s.replace("    const isZl = ekran === 'zlecenie'; const nZl = navv(isZl);","    const isZl = ekran === 'zlecenie'; const nZl = navv(isZl);\n    const isPl = ekran === 'planowanie'; const nPl = navv(isPl); const isDr = isPl && (this.props.plan ?? 'dzień') === 'przeciąganie';",1)
s=s.replace('      isZlec: isZl,','      isPlan: isPl, isDrag: isDr, noDrag: !isDr, actPl: nPl.act, colPl: nPl.col, wPl: nPl.w, selPl: nPl.sel,\n      isZlec: isZl,',1)
# nav item Planowanie
m=re.search(r'<a href="#" class="nav" style="([^"]*)color:var\(--text-secondary\)">(<svg[^>]*><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>)<span class="ell" style="flex:1 1 auto;font-weight:400">Planowanie</span></a>',s)
assert m,'nav'
s=s[:m.start()]+f'<a href="#" class="nav {{{{actPl}}}}" title="G P" style="{m.group(1)}color:{{{{colPl}}}}">{m.group(2)}<span class="ell" style="flex:1 1 auto;font-weight:{{{{wPl}}}}">Planowanie</span></a>'+s[m.end():]
old='aria-selected="false" class="dtab" aria-label="Planowanie, karta przypięta" title="Planowanie  ⌘2" style="width:28px;height:28px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:transparent;color:var(--text-tertiary);'
assert old in s,'tab'
s=s.replace(old,'aria-selected="{{selPl}}" class="dtab {{actPl}}" aria-label="Planowanie, karta przypięta" title="Planowanie  ⌘2" style="width:28px;height:28px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;color:{{colPl}};',1)
open(P,'w').write(s); print('ok')
