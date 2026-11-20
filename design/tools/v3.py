import re
P='design/canvas/Main.dc.html'
zsrc=open('design/tools/zl2.py').read()
exec(zsrc.split("H=[];a=H.append")[0])
exec(zsrc[zsrc.index('def prop('):zsrc.index('def kv(')])
v2src=open('design/tools/v2.py').read()
for n in ['CALX','CALC','SHC','RADAR','GAUGE','UPLOAD','FACT','CO2']:
    exec([l for l in v2src.splitlines() if l.startswith(n+'=')][0])
s=open(P).read()
TC={'MZ':'#3B82D6','TL':'#9B6BE0','KN':'#1FA7A5','PD':'#E0702A'}
ARIN='<path d="M12 3v12M7 10l5 5 5-5"></path><path d="M5 21h14"></path>'
AROUT='<path d="M12 21V9M7 14l5-5 5 5"></path><path d="M5 3h14"></path>'
SWAP='<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4"></path>'
SHELF='<path d="M3 3v18h18V3zM3 9h18M3 15h18"></path>'
FOLDER='<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>'
TASK='<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="m9 12 2 2 4-4"></path>'
RECEIPT='<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path>'
LAYERS='<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>'
def sub_block(start_marker, flag_old, flag_new, transform):
    global s
    i=s.index(start_marker)
    d=0; k=i
    for m in re.finditer(r'<(/?)sc-if[\s>]',s[i:]):
        d+= -1 if m.group(1) else 1
        if d==0: k=i+m.start(); break
    end=s.index('</sc-if>',k)+len('</sc-if>')
    blk=s[i:end]
    old=blk.replace(start_marker, start_marker.replace(flag_old,flag_new+'V1'),1)
    new=transform(blk.replace(start_marker, start_marker.replace(flag_old,flag_new+'V2'),1))
    s=s[:i]+old+'\n'+new+s[end:]
def rep(b,o,n,cnt=None):
    c=b.count(o); assert c>=1, o[:90]
    if cnt is not None: assert c==cnt,(o[:60],c)
    return b.replace(o,n)

# ===== Magazyn (list + panel)
def mag(b):
    G_old='grid-template-columns:84px minmax(0,1fr) 72px 64px 96px 64px'
    G='grid-template-columns:84px minmax(0,1fr) 72px 64px 96px 72px'
    b=b.replace(G_old,G)
    b=rep(b,'<span style="display:flex;align-items:baseline;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto;font-weight:500">{{m.name}}</span><span class="ell" style="flex:0 10000 auto;color:var(--text-secondary)">{{m.sub}}</span></span>',
          '<span title="{{m.sub}}" style="display:flex;align-items:center;gap:8px;min-width:0"><span class="ell" style="font-weight:500">{{m.name}}</span></span>')
    b=rep(b,'<span class="num" style="text-align:right;color:{{m.rezC}}">{{m.rez}}</span>',
          '<span class="num" title="Zarezerwowane na zlecenia" style="display:flex;align-items:center;justify-content:flex-end;gap:4px;color:{{m.rezC}}"><sc-if value="{{m.hasRez}}" hint-placeholder-val="{{false}}">'+ic(LOCK,12,'var(--text-tertiary)')+'</sc-if>{{m.rez}}</span>')
    b=rep(b,'<span class="num" title="{{m.doc}}" style="text-align:right;font-size:12px;color:var(--text-secondary)">{{m.date}}</span>',
          '<span class="num" title="{{m.doc}}" style="display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:12px;color:var(--text-secondary)"><sc-if value="{{m.dIn}}" hint-placeholder-val="{{false}}">'+ic(ARIN,14,'var(--success)')+'</sc-if><sc-if value="{{m.dOut}}" hint-placeholder-val="{{true}}">'+ic(AROUT,14,'var(--text-tertiary)')+'</sc-if><sc-if value="{{m.dMM}}" hint-placeholder-val="{{false}}">'+ic(SWAP,14,'var(--text-tertiary)')+'</sc-if>{{m.date}}</span>')
    # replace header labels for last col
    b=b.replace('>Ostatni ruch<','>Ruch<')
    # panel: rebuild aside
    i=b.index('<aside aria-label="Pozycja magazynowa CZ-R32"'); j=b.index('</aside>',i)+len('</aside>')
    hdr_end=b.index('<div style="display:flex;flex-direction:column;gap:4px;padding:4px 20px 16px">',i)
    A=b[i:hdr_end]
    A+=('<div style="display:flex;flex-direction:column;gap:8px;padding:4px 20px 16px"><h2 style="margin:0;font-size:15px;line-height:22px;font-weight:600;letter-spacing:-0.01em">R32</h2>'
        '<div style="display:flex;flex-wrap:wrap;gap:4px">'+chip(DROP,'var(--text-tertiary)','HFC','Czynnik chłodniczy HFC')+chip(BOX,'var(--text-tertiary)','butla 9 kg','Butla zwrotna 9 kg')+chip(CO2,'var(--text-tertiary)','GWP 675','Współczynnik GWP 675')+'</div></div>')
    def num(icon,col,label,val,tip,warn=False):
        w=ic(WARN,14,'var(--warning)') if warn else ''
        return f'<div title="{tip}"><dt style="display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--text-secondary)">{ic(icon,14,col)}{label}</dt><dd class="num" style="margin:0;display:flex;align-items:center;gap:6px;font-size:15px;line-height:22px;font-weight:600">{w}{val}</dd></div>'
    A+=('<section aria-label="Stan" title="Stan zmienia tylko dokument: PZ, RW, WZ, MM" style="margin:0 20px 16px;padding:12px;display:flex;flex-direction:column;gap:12px;border-radius:12px;background:var(--bg-raised)">'
        '<dl style="margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">'+
        num(BOX,'var(--text-tertiary)','Stan','9,0 kg','Na stanie magazynu głównego')+num(LOCK,'var(--text-tertiary)','Rezerwacja','0,3 kg','Zarezerwowane na ZS-1045')+num(CHECKC,'var(--text-tertiary)','Dostępne','8,7 kg','Poniżej minimum 20 kg',True)+'</dl>'
        '<div style="display:flex;flex-wrap:wrap;gap:4px">'+chip(GAUGE,'var(--warning)','min 20 kg','Minimalny stan: 20 kg; brakuje 11,3 kg','var(--bg-surface)')+chip(TASK,'var(--st-progress)','ZD-118','Zamówienie 2 butli w zadaniu ZD-118, w toku','var(--bg-surface)')+'</div>'
        '<div style="display:flex;gap:4px">'+
        ''.join(f'<button type="button" class="sec" title="{t}" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500">{ic(p,14)}{l}</button>' for p,l,t in [(ARIN,'PZ','Przyjęcie (PZ)'),(AROUT,'RW','Wydanie na zlecenie (RW)'),(SWAP,'MM','Przesunięcie do samochodu (MM)')])+
        '</div></section>')
    A+=('<section style="display:flex;flex-direction:column;gap:2px;padding:0 12px 16px">'+
        prop(GAUGE,'Minimum 20,0 kg','Minimalny stan')+prop(SHELF,'<span class="mono" style="font-size:12px">C-01</span>','Półka')+prop(FOLDER,'Czynniki chłodnicze','Kategoria')+prop(None,'kg','Jednostki nie zmienisz po pierwszym ruchu',lock=True,raw_icon=ic(HASH,16,'var(--text-tertiary)'))+'</section>')
    def mv(icon,col,doc,ref,qty,ini,date,full,tip):
        av_=f'<span title="{tip.split(" · ")[0]}" aria-hidden="true" style="width:16px;height:16px;flex:0 0 auto;border-radius:50%;background:{TC.get(ini,"var(--bg-subtle)")};display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;color:{"#fff" if ini in TC else "var(--text-secondary)"}">{ini}</span>'
        return (f'<li><a href="#" class="row" title="{tip}" style="display:grid;grid-template-columns:16px 112px minmax(0,1fr) auto 16px 44px;column-gap:8px;align-items:center;height:36px;padding:0 8px;border-radius:10px">'
                f'<span style="display:inline-flex">{ic(icon,14,col)}</span><span class="mono ell" style="font-size:11px;color:var(--text-tertiary)">{doc}</span><span class="ell">{ref}</span>'
                f'<span class="num" style="font-weight:500">{qty}</span>{av_}<span class="num" title="{full}" style="text-align:right;font-size:12px;color:var(--text-tertiary)">{date}</span></a></li>')
    A+=('<section aria-label="Ruchy magazynowe" style="display:flex;flex-direction:column;gap:4px;padding:0 20px 20px"><div style="display:flex;align-items:center;gap:8px;height:24px"><h3 style="flex:1 1 auto;margin:0;font-size:12px;line-height:16px;font-weight:500;color:var(--text-secondary)">Ruchy</h3>'+ghost('Wszystkie')+'</div>'
        '<ol style="margin:0 -8px;padding:0;list-style:none;display:flex;flex-direction:column">'+
        mv(AROUT,'var(--text-tertiary)','RW/2026/11/041','ZS-1042','−0,8 kg','MZ','13 lis','13 listopada 2026, 08:40','Marek Zieliński · wydanie na zlecenie ZS-1042, przegląd 6 jednostek VRV')+
        mv(AROUT,'var(--text-tertiary)','RW/2026/11/033','ZS-1038','−1,5 kg','MZ','10 lis','10 listopada 2026','Marek Zieliński · wydanie na zlecenie ZS-1038, przegląd 4 kasetonów')+
        mv(ARIN,'var(--success)','PZ/2026/11/012','Dostawa','+9,0 kg','AW','6 lis','6 listopada 2026, 10:05','Anna Wiśniewska · przyjęcie, 1 butla')+
        '</ol></section></aside>')
    return b[:i]+A+b[j:]
sub_block('<sc-if value="{{isMWsz}}" hint-placeholder-val="{{true}}">','isMWsz','isMWsz',mag)

# ===== Firmy table
def firmy(b):
    b=b.replace('{{fCols}}','{{fColsV}}')
    b=rep(b,'</svg>Umowa serwisowa</span>','</svg>Umowa</span>')
    b=rep(b,'</svg>Ostatni kontakt</span>','</svg>Kontakt</span>')
    b=rep(b,'<span role="cell" title="{{r.umTip}}" style="display:flex;align-items:center;gap:6px;min-width:0;padding:0 8px;color:{{r.umC}};font-weight:{{r.umW}}"><sc-if value="{{r.exp}}" hint-placeholder-val="{{false}}">',
          '<span role="cell" title="{{r.umTip}}" style="display:flex;align-items:center;gap:6px;min-width:0;padding:0 8px;color:{{r.umC}};font-weight:{{r.umW}}"><sc-if value="{{r.umOk}}" hint-placeholder-val="{{true}}">'+ic(CAL,14,'var(--text-tertiary)')+'</sc-if><sc-if value="{{r.umProj}}" hint-placeholder-val="{{false}}">'+ic(LAYERS,14,'var(--text-tertiary)')+'</sc-if><sc-if value="{{r.exp}}" hint-placeholder-val="{{false}}">')
    # replace warning icon in exp with calendar-clock
    i=b.index('<sc-if value="{{r.exp}}" hint-placeholder-val="{{false}}">'); j=b.index('</sc-if>',i)
    b=b[:i]+'<sc-if value="{{r.exp}}" hint-placeholder-val="{{false}}">'+ic(CALC,14,'var(--warning)')+b[j:]
    b=rep(b,'<span class="ell num">{{r.um}}</span>','<span class="ell num">{{r.umS}}</span>')
    b=rep(b,'<span role="cell" class="ell" title="{{r.contactFull}}" style="padding:0 8px;color:var(--text-secondary)">{{r.contact}}</span>',
          '<span role="cell" class="ell" title="{{r.contactFull}}" style="display:flex;align-items:center;gap:6px;padding:0 8px;color:{{r.ctC}}">'+ic(CLOCK,14,'var(--text-tertiary)')+'{{r.contactS}}</span>')
    b=rep(b,'<span role="cell" title="{{r.opFull}}" style="display:flex;align-items:center;gap:6px;min-width:0;padding:0 8px;color:var(--text-secondary)"><span style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;background:var(--bg-subtle);border:0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;line-height:10px;font-weight:500">{{r.op}}</span><span class="ell">{{r.opName}}</span></span>',
          '<span role="cell" title="Opiekun: {{r.opFull}}" style="display:flex;align-items:center;padding:0 8px"><span style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;background:{{r.opBg}};display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:{{r.opFg}}">{{r.op}}</span></span>')
    b=rep(b,'</svg>Opiekun</span>','</svg></span>')
    b=rep(b,'</svg>Przychód 12 mies.</span>','</svg><span title="Przychód z ostatnich 12 miesięcy">Przychód</span></span>')
    return b
sub_block('<sc-if value="{{isFList}}" hint-placeholder-val="{{true}}">','isFList','isFList',firmy)

# ===== Mój dzień (data section)
def dzien(b):
    b=rep(b,'grid-template-columns:40px 64px 14px minmax(0,1fr) 112px 44px','grid-template-columns:40px 64px 14px minmax(0,1fr) 44px')
    b=rep(b,'<span class="ell" style="font-size:12px;color:var(--text-secondary)">{{r.stage}}</span>\n','')
    b=rep(b,'<span title="{{t.name}}" style="width:20px;height:20px;border-radius:50%;margin-left:{{t.ml}};background:var(--bg-subtle);border:0;box-shadow:none;display:inline-flex;align-items:center;justify-content:center;font-size:10px;line-height:10px;font-weight:500;color:var(--text-secondary)">{{t.ini}}</span>',
          '<span title="{{t.name}}" style="width:20px;height:20px;border-radius:50%;margin-left:{{t.ml}};background:{{t.c}};box-shadow:0 0 0 2px var(--bg-surface);display:inline-flex;align-items:center;justify-content:center;font-size:9px;line-height:10px;font-weight:600;color:#fff">{{t.ini}}</span>')
    b=rep(b,'grid-template-columns:80px minmax(0,1fr) 96px 132px','grid-template-columns:80px minmax(0,1fr) 20px 132px',3)
    b=rep(b,'<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">\n','<span title="Priorytet: {{p.prio}}" style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">\n',3)
    b=rep(b,'<span>{{p.prio}}</span></span>','</span>',3)
    i=b.index('{{m.ini}}</span>'); k=b.rindex('<span style="grid-row:1 / span 2;',0,i)
    b=b[:k]+'<span style="grid-row:1 / span 2;align-self:start;margin-top:2px;width:20px;height:20px;border-radius:50%;background:{{m.c}};display:inline-flex;align-items:center;justify-content:center;font-size:9px;line-height:10px;font-weight:600;color:{{m.fg}}">'+b[i:]
    return b
sub_block('<sc-if value="{{isData}}" hint-placeholder-val="{{true}}">','isData','isData',dzien)
def rail(b):
    # team widget
    for ini,name,st,kind,cnt in [('MZ','Marek Zieliński','W realizacji','real','2/3'),('TL','Tomasz Lewandowski','W realizacji','real','0/2'),('KN','Kamil Nowicki','W drodze','drodze','0/2'),('PD','Patryk Dąbrowski','Wolny do 11:00','plan','0/2')]:
        i=b.index(f'>{ini}</span><span style="flex: 1 1 auto;'); i=b.rindex('<a href="#" class="row"',0,i); j=b.index('</a>',i)+4
        icon={'real':'<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--st-progress)"></circle><path d="M7 7L7 4A3 3 0 1 1 4.40 8.50Z" style="fill:var(--st-progress)"></path></svg>',
              'drodze':st_svg('drodze'),'plan':'<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.75" fill="none" stroke-width="1.5" style="stroke:var(--text-secondary)"></circle></svg>'}[kind]
        row=(f'<a href="#" class="row" title="{name} · {st} · {cnt} wizyt zakończonych" style="display:flex;align-items:center;gap:8px;height:36px;padding:0 8px;border-radius:10px">'
             f'<span style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;background:{TC[ini]};display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff">{ini}</span>'
             f'<span class="ell" style="flex:1 1 auto;font-weight:500">{name}</span><span style="display:inline-flex" role="img" aria-label="{st}">{icon}</span><span class="num" style="width:28px;text-align:right;font-size:12px;color:var(--text-secondary)">{cnt}</span></a>')
        b=b[:i]+row+b[j:]
    # week widget labels -> icons
    for lab,icon,col,short in [('Przeglądy do wykonania',CAL,'var(--text-tertiary)','Przeglądy'),('Kontrole szczelności F-gaz',SHC,'var(--text-tertiary)','Kontrole F-gaz'),('Zlecenia do rozliczenia',RECEIPT,'var(--success)','Do rozliczenia'),('Faktury po terminie',CALX,'var(--danger)','Faktury po terminie'),('SLA 30 dni',TIMER,'var(--text-tertiary)','SLA 30 dni')]:
        o=f'<span class="ell" style="flex:1 1 auto;color:var(--text-secondary)">{lab}</span>'
        b=rep(b,o,f'<span title="{lab}" style="display:inline-flex">{ic(icon,14,col)}</span><span class="ell" style="flex:1 1 auto;color:var(--text-secondary)">{short}</span>')
    b=b.replace('<span style="width:6px;height:6px;border-radius:50%;background:var(--danger);flex:0 0 auto"></span>','')
    return b
sub_block('<sc-if value="{{rail}}" hint-placeholder-val="{{true}}">','rail','rail',rail)
s=s.replace('    ui.toggleRail = () => this.setState({ rail: !rail });',"    ui.toggleRail = () => this.setState({ rail: !rail });\n    const isNewD = (this.props.wersja ?? 'stara') === 'nowa'; ui.railV1 = rail && !isNewD; ui.railV2 = rail && isNewD; ui.isDataV1 = (this.props.stan ?? 'dane') === 'dane' && !isNewD; ui.isDataV2 = (this.props.stan ?? 'dane') === 'dane' && isNewD;",1)
open(P,'w').write(s); print('ok')
# ===== JS
s=open(P).read()
add = """    mGroups.forEach((g) => g.items.forEach((m) => { m.hasRez = m.rez !== '—'; m.dIn = /PZ\//.test(m.doc); m.dMM = /MM\//.test(m.doc); m.dOut = !m.dIn && !m.dMM; }));
    mentions.forEach((m) => { m.c = TCj[m.ini] || 'var(--bg-subtle)'; m.fg = TCj[m.ini] ? '#fff' : 'var(--text-secondary)'; });
    visits.forEach((v) => v.techs.forEach((t) => { t.c = TCj[t.ini] || 'var(--text-tertiary)'; }));
    const MSC = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    fRows.forEach((r) => { const d = r.um.match(/do (\\d\\d)\\.(\\d\\d)\\.(\\d{4})/); r.umOk = !!d && !r.exp; r.umProj = r.um.startsWith('Projekt'); r.umS = d ? (+d[1]) + ' ' + MSC[+d[2] - 1] + (d[3] !== '2026' ? " '" + d[3].slice(2) : '') : r.um.replace('Projekt ', '').replace('Brak', '—'); r.contactS = r.contact; r.ctC = /miesiąc|tyg/.test(r.contact) ? 'var(--text-tertiary)' : 'var(--text-secondary)'; r.opBg = TCj[r.op] || 'var(--bg-subtle)'; r.opFg = TCj[r.op] ? '#fff' : 'var(--text-secondary)'; });
"""
s=s.replace('    const fView = {', add+'    const fView = {',1)
s=s.replace("      isFirmy: isF, isFF, isFList: isF && !isFO,","      isFirmy: isF, isFF, isFList: isF && !isFO, isFListV1: isF && !isFO && !isNew, isFListV2: isF && !isFO && isNew, fColsV: '32px 220px 240px 104px 92px 116px 120px 48px 128px',",1)
s=s.replace("    const mView = { isMWsz: !isMS,","    const isNewM = (this.props.wersja ?? 'stara') === 'nowa';\n    const mView = { isMWszV1: !isMS && !isNewM, isMWszV2: !isMS && isNewM, isMWsz: !isMS,",1)
assert 'isMWszV1' in s and 'isFListV1' in s and 'ui.railV1' in s
open(P,'w').write(s); print('js ok')
