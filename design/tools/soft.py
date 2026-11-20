import re,sys
src=sys.argv[1]; s=open(src).read()
n0=s

def norm(st):
    # collapse "prop: value" spacing for border/radius only
    st=re.sub(r'border-radius:\s+',"border-radius:",st)
    st=re.sub(r'border:\s+1px',"border:1px",st)
    return st

def hval(st):
    m=re.search(r'(?:^|;)\s*height:\s*(\d+)px',st)
    return int(m.group(1)) if m else None

def rad_for_h(h):
    if h is None: return None
    if h<=20: return 6
    if h<=28: return 8
    if h<=40: return 10
    return 12

stats={}
def bump(k): stats[k]=stats.get(k,0)+1

def fix(st, tag, cls):
    st=norm(st)
    h=hval(st)
    border=re.search(r'border:1px (solid|dashed) ([^;]+)',st)
    bg=re.search(r'background:([^;]+)',st)
    bgv=bg.group(1).strip() if bg else ''
    rad=re.search(r'border-radius:([^;]+)',st)
    radv=rad.group(1).strip() if rad else ''
    def setrad(v):
        nonlocal st
        if re.search(r'border-radius:[^;]+',st): st=re.sub(r'border-radius:[^;]+','border-radius:'+v,st,1)
        else: st+=';border-radius:'+v
    def setborder(v):
        nonlocal st
        st=re.sub(r'border:1px (solid|dashed) [^;]+','border:'+v,st,1)
    def setbg(v):
        nonlocal st
        if bg: st=re.sub(r'background:[^;]+','background:'+v,st,1)
        else: st+=';background:'+v
    if border:
        kind,col=border.group(1),border.group(2).strip()
        col_is_var=col.startswith('{{')
        if radv=='50%' :
            if kind=='dashed': pass
            else: setborder('0'); bump('avatar')
        elif col=='var(--bg-surface)':
            pass
        elif 'aria-modal' in tag or 'role="dialog"' in tag or 'box-shadow' in st and ('position:absolute' in st):
            setborder('1px solid var(--edge)'); setrad('14px'); bump('popover')
        elif tag.startswith('<main'):
            setborder('1px solid var(--edge)'); setrad('14px'); bump('main')
        elif 'class="tab' in tag and radv in('14px',):
            setborder('0'); bump('viewtab')
        elif tag.startswith('<input') or tag.startswith('<textarea'):
            setborder('0'); setbg('var(--bg-raised)'); setrad('10px' if (h or 32)>=28 else '8px'); bump('input')
        elif kind=='dashed':
            setborder('1px dashed var(--border)'); 
            setrad(f'{rad_for_h(h) or 8}px'); bump('dashed')
        elif re.search(r'class="[^"]*\b(sec)\b',tag):
            setborder('0'); setbg('var(--bg-subtle)'); setrad(f'{rad_for_h(h) or 8}px'); bump('sec')
        elif re.search(r'class="[^"]*\bprop\b',tag):
            setborder('0'); setbg('var(--bg-subtle)'); setrad(f'{rad_for_h(h) or 8}px'); bump('propbtn')
        elif re.search(r'class="[^"]*\bcard\b',tag):
            setborder('0'); setbg('var(--bg-raised)'); setrad('12px'); bump('card')
        elif 'role="checkbox"' in tag or (h and h<=16 and 'width:14px' in st and col_is_var) or ('width:14px;height:14px' in st and radv=='4px'):
            setrad('5px'); bump('checkbox')
        elif 'role="radio"' in tag:
            setborder('0'); 
            if 'chip-off' in tag: setbg('var(--bg-raised)')
            setrad('10px'); bump('radio')
        elif 'aria-pressed' in tag and h==24:
            setborder('0'); setrad('8px'); bump('colchip')
        elif h is not None and h<=24:
            # labels, kbd, small badges, logos
            setborder('0')
            if not bg or bgv=='transparent': setbg('var(--bg-subtle)')
            setrad('6px'); bump('badge')
        elif re.search(r'width:(16|20|24)px;height:\1px',st) or re.search(r'width:(40)px;height:40px',st):
            setborder('0'); setrad('12px' if '40px' in st else ('6px' if '20px' in st else '5px')); bump('logo')
        elif 'aspect-ratio' in st:
            setborder('0'); setrad('10px'); bump('photo')
        elif tag.startswith('<section') or tag.startswith('<li') or 'role="status"' in tag or tag.startswith('<div'):
            setborder('0'); setbg('var(--bg-raised)'); setrad('14px' if tag.startswith('<section') and radv=='12px' else '12px'); bump('block')
        else:
            bump('UNHANDLED:'+tag[:80])
    else:
        # sides
        if re.search(r'border-(left|right|top|bottom):1px solid var\(--border\)',st):
            st=re.sub(r'(border-(?:left|right|top|bottom)):1px solid var\(--border\)',r'\1:1px solid var(--edge)',st); bump('divider')
        if radv in('4px','6px','8px'):
            r=rad_for_h(h)
            if r is None: r={'4px':6,'6px':8,'8px':10}[radv]
            # tiny skeleton bars keep pill-ish
            setrad(f'{r}px'); bump('rad'+radv)
        elif radv=='12px': setrad('14px'); bump('rad12')
    # stacked-avatar ring
    st=st.replace('box-shadow:0 0 0 1px var(--border)','box-shadow:none')
    return st

out=[];pos=0
for m in re.finditer(r'<([a-zA-Z][\w-]*)\b[^<>]*?style="([^"]*)"',s):
    tag=s[m.start():m.end()]
    st=m.group(2)
    # skip svg-internal elements
    if m.group(1) in('svg','path','circle','rect','line','polyline'): continue
    new=fix(st,tag,'')
    if new!=st:
        a=m.start(2); b=m.end(2)
        out.append((a,b,new))
for a,b,new in reversed(out):
    s=s[:a]+new+s[b:]
# template-driven borders
s=re.sub(r'border:1px solid \{\{(mA|mS|p)\.b\}\}','border:0',s)
open(src,'w').write(s)
for k,v in sorted(stats.items()): print(v,k)
