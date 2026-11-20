import re
P='design/canvas/Main.dc.html'
v3=open('design/tools/v3.py').read()
exec(v3[:v3.index("# ===== Magazyn")])   # helpers, icons, sub_block, rep, s
MAIL='<rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>'
AV_OLD='<span title="{{t.whoName}}" style="width:20px;height:20px;border-radius:50%;background:var(--bg-subtle);border:0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;line-height:10px;font-weight:500;color:var(--text-secondary)">{{t.ini}}</span>'
AV_NEW='<span title="{{t.whoName}}" style="width:20px;height:20px;border-radius:50%;background:{{t.ac}};display:inline-flex;align-items:center;justify-content:center;font-size:9px;line-height:10px;font-weight:600;color:{{t.af}}">{{t.ini}}</span>'
def zad(b):
    b=rep(b,AV_OLD,AV_NEW)
    b=rep(b,'grid-template-columns:14px 56px 14px minmax(0,1fr) auto 52px 20px','grid-template-columns:14px 56px 14px minmax(0,1fr) auto 76px 20px')
    b=rep(b,'<span class="num" style="font-size:12px;text-align:right;color:{{t.dueC}};font-weight:{{t.dueW}}">{{t.due}}</span>',
          '<span class="num" title="{{t.dueTip}}" style="display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:12px;color:{{t.dueC}};font-weight:{{t.dueW}}"><sc-if value="{{t.late}}" hint-placeholder-val="{{false}}">'+ic(CALX,14,'var(--danger)')+'</sc-if><sc-if value="{{t.today}}" hint-placeholder-val="{{false}}">'+ic(CALC,14,'var(--warning)')+'</sc-if><sc-if value="{{t.calOk}}" hint-placeholder-val="{{true}}">'+ic(CAL,14,'var(--text-tertiary)')+'</sc-if>{{t.due}}</span>')
    for ini in ['MZ']:
        b=rep(b,f'width:16px;height:16px;border-radius:50%;background:var(--bg-subtle);border:0;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:500;flex:0 0 auto">{ini}<',
              f'width:16px;height:16px;border-radius:50%;background:{TC[ini]};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;flex:0 0 auto">{ini}<')
    return b
sub_block('<sc-if value="{{isZadania}}" hint-placeholder-val="{{false}}">','isZadania','isZadania',zad)

def osoby(b):
    b=b.replace('{{oCols}}','{{oColsV}}')
    b=rep(b,'</svg>Telefon</span>','</svg>Kontakt</span>')
    b=rep(b,'</svg>Ostatni kontakt</span>','</svg>Ostatnio</span>')
    b=rep(b,'</svg>Opiekun</span>','</svg></span>')
    b=rep(b,'<span role="cell" class="num ell" style="padding:0 8px;color:var(--text-secondary)">{{r.phone}}</span>',
          '<span role="cell" style="display:flex;align-items:center;gap:2px;padding:0 4px"><button type="button" class="ib" aria-label="Zadzwoń: {{r.phone}}" title="{{r.phone}}" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:var(--text-secondary);padding:0">'+ic(PHONE,16)+'</button><button type="button" class="ib" aria-label="Napisz e-mail" title="Napisz e-mail" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:var(--text-secondary);padding:0">'+ic(MAIL,16)+'</button></span>')
    b=rep(b,'<span role="cell" class="ell" title="{{r.contactFull}}" style="padding:0 8px;color:var(--text-secondary)">{{r.contact}}</span>',
          '<span role="cell" class="ell" title="{{r.contactFull}}" style="display:flex;align-items:center;gap:6px;padding:0 8px;color:var(--text-secondary)">'+ic(CLOCK,14,'var(--text-tertiary)')+'{{r.contact}}</span>')
    b=rep(b,'<span role="cell" title="{{r.opFull}}" style="display:flex;align-items:center;gap:6px;min-width:0;padding:0 8px;color:var(--text-secondary)"><span style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;background:var(--bg-subtle);border:0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;line-height:10px;font-weight:500">{{r.op}}</span><span class="ell">{{r.opName}}</span></span>',
          '<span role="cell" title="Opiekun: {{r.opFull}}" style="display:flex;align-items:center;padding:0 8px"><span style="width:20px;height:20px;flex:0 0 auto;border-radius:50%;background:{{r.opBg}};display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:{{r.opFg}}">{{r.op}}</span></span>')
    b=rep(b,'<span role="cell" class="ell" style="padding:0 8px;color:var(--text-secondary)">{{r.role}}</span>','<span role="cell" class="ell" title="{{r.role}}" style="padding:0 8px;color:var(--text-secondary)">{{r.roleS}}</span>')
    return b
sub_block('<sc-if value="{{isOList}}" hint-placeholder-val="{{false}}">','isOList','isOList',osoby)

def sam(b):
    b=rep(b,'<p style="flex:1 1 auto;margin:0;font-size:12px;line-height:16px;color:var(--text-secondary)">Minimum w busie ustawiasz w karcie pozycji. Braki uzupełnia przesunięcie MM z magazynu głównego.</p>',
          '<span style="flex:1 1 auto;display:flex;align-items:center;gap:6px">'+chip(WARN,'var(--warning)','{{sBrakiTotal}} braków','Pozycje poniżej minimum w busach')+'<span title="Minimum w busie ustawiasz w karcie pozycji. Braki uzupełnia przesunięcie MM z magazynu głównego." style="display:inline-flex">'+ic(INFO,14,'var(--text-tertiary)')+'</span></span>')
    b=rep(b,'>Uzupełnij braki ({{sBrakiTotal}})</button>','>Uzupełnij MM</button>')
    b=rep(b,'<span title="{{b.name}} · {{b.plate}}" style="display:flex;align-items:center;justify-content:flex-end;gap:6px"><span style="width:16px;height:16px;border-radius:50%;background:var(--bg-subtle);border:0;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:500">{{b.code}}</span>Bus {{b.code}}</span>',
          '<span title="{{b.name}} · bus {{b.plate}}" style="display:flex;align-items:center;justify-content:flex-end;gap:6px">'+ic(TRUCK,14,'var(--text-tertiary)')+'<span style="width:20px;height:20px;border-radius:50%;background:{{b.c}};display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff">{{b.code}}</span></span>')
    b=rep(b,'<span style="text-align:right">Magazyn gł.</span>','<span title="Magazyn główny" style="display:flex;align-items:center;justify-content:flex-end;gap:6px">'+ic(BOX,14,'var(--text-tertiary)')+'Baza</span>')
    b=rep(b,'<span style="display:flex;align-items:baseline;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto;font-weight:500">{{r.name}}</span><span class="ell" style="flex:0 10000 auto;font-size:12px;color:var(--text-secondary)">{{r.sub}}</span></span>',
          '<span class="ell" title="{{r.sub}}" style="font-weight:500">{{r.name}}</span>')
    b=rep(b,'<span style="font-weight:500">Do uzupełnienia</span>','<span style="display:flex;align-items:center;gap:6px;font-weight:500">'+ic(SWAP,14,'var(--text-tertiary)')+'Do uzupełnienia</span>')
    return b
sub_block('<sc-if value="{{isMSam}}" hint-placeholder-val="{{false}}">','isMSam','isMSam',sam)

add="""    const tAll = []; zGroups.forEach((g) => g.items.forEach((t) => tAll.push(t))); zCols.forEach((g) => g.items.forEach((t) => tAll.push(t)));
    tAll.forEach((t) => { t.ac = TCj[t.ini] || 'var(--bg-subtle)'; t.af = TCj[t.ini] ? '#fff' : 'var(--text-secondary)'; t.late = t.dueC === 'var(--danger)'; t.today = !t.late && t.dueW === 500; t.calOk = !!t.due && !t.late && !t.today; t.dueTip = t.late ? 'Po terminie' : t.today ? 'Termin dziś' : 'Termin'; });
    oRows.forEach((r) => { r.opBg = TCj[r.op] || 'var(--bg-subtle)'; r.opFg = TCj[r.op] ? '#fff' : 'var(--text-secondary)'; r.roleS = r.role; });
    buses.forEach((b) => { b.c = TCj[b.code] || 'var(--text-tertiary)'; });
"""
s=s.replace('    const fView = {', add+'    const fView = {',1)
s=s.replace("isOList: isFO,","isOList: isFO, isOListV1: isFO && !isNew, isOListV2: isFO && isNew, oColsV: '32px 220px 200px 170px 220px 72px 128px 48px',",1)
s=s.replace("const mView = { isMWszV1:","const mView = { isMSamV1: isMS && !isNewM, isMSamV2: isMS && isNewM, isMWszV1:",1)
s=s.replace('isZadania: isZ, isMagazyn:',"isZadania: isZ, isZadaniaV1: isZ && (this.props.wersja ?? 'stara') !== 'nowa', isZadaniaV2: isZ && (this.props.wersja ?? 'stara') === 'nowa', isMagazyn:",1)
assert 'isZadaniaV1' in s and 'isOListV1' in s and 'isMSamV1' in s
open(P,'w').write(s); print('ok')
