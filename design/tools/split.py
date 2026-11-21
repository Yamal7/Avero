# Dzieli zbudowany Main.dc.html na dwa komponenty z tą samą ramą, żeby każdy plik był wyraźnie poniżej 2 MiB
# (kanwa nie renderuje większego pliku — plansze były białe). Main.dc.html: ekrany do Ustawień włącznie;
# Main2.dc.html: ekrany od Zgłoszeń. Plansze-opakowania dostają name="Main" albo name="Main2" automatycznie.
import re, glob, json
D='design/canvas/'
s=open(D+'Main.dc.html').read()
LIMIT=1_800_000
tok=[(m.start(),m.group(0)) for m in re.finditer(r'<sc-if\b|</sc-if>',s)]
blocks=[];depth=0
for pos,t in tok:
    if t.startswith('<sc-if'):
        if depth==0: start=pos
        depth+=1
    else:
        depth-=1
        if depth==0: blocks.append((start,pos+len('</sc-if>')))
def at(flag): return s.index('<sc-if value="{{%s}}"'%flag)
first=at('isDzien'); cut=at('isZg'); v2=at('isZlecV2'); doc=at('isDoc')
screens=[b for b in blocks if first<=b[0]<doc]
g2=[b for b in screens if cut<=b[0]<v2]
g1=[b for b in screens if b not in g2]
def without(bs):
    out=[];i=0
    for a,b in sorted(bs):
        out.append(s[i:a]); i=b
    out.append(s[i:]); return ''.join(out)
m1=without(g2); m2=without(g1)
# domyślny ekran Main2 — pierwszy z jego ekranów
m2=m2.replace('"default": "mój dzień"','"default": "zgłoszenia"',1)
m2=m2.replace('<title>','<title>Main2 · ',1) if '<title>' in m2 else m2
assert len(m1.encode())<LIMIT and len(m2.encode())<LIMIT,(len(m1.encode()),len(m2.encode()))
open(D+'Main.dc.html','w').write(m1); open(D+'Main2.dc.html','w').write(m2)
# które wartości ekran / ust są w Main2
flagE=dict(re.findall(r"const (\w+) = ekran === '([^']+)'",s))
flagU=dict(re.findall(r"(\w+): isUst && ustV === '([^']+)'",s))
used=set()
for a,b in g2: used|=set(re.findall(r'<sc-if value="\{\{(\w+)\}\}"',s[a:b]))
ek2={flagE[f] for f in used if f in flagE and flagE[f]!='ustawienia'}
us2={flagU[f] for f in used if f in flagU}
n=[0,0]
for f in glob.glob(D+'*.dc.html'):
    if f.endswith(('Main.dc.html','Main2.dc.html')): continue
    t=open(f).read()
    m=re.search(r'<dc-import name="(Main2?)"([^>]*)>',t)
    if not m: continue
    attrs=m.group(2); e=re.search(r'ekran="([^"]*)"',attrs); u=re.search(r'ust="([^"]*)"',attrs)
    ev=e.group(1) if e else 'mój dzień'
    two=(u.group(1) in us2) if (u and ev=='ustawienia') else (ev in ek2)
    want='Main2' if two else 'Main'
    if m.group(1)!=want:
        t=t[:m.start(1)]+want+t[m.end(1):]; open(f,'w').write(t)
    n[two]+=1
c=json.load(open(D+'canvas.json'))
if 'Main2.dc.html' not in c['boards']:
    y=max(v['y']+v['h'] for v in c['boards'].values())+120
    c['boards']['Main2.dc.html']={"x":0,"y":y,"w":1440,"h":1120,"expand":"fill","title":"Komponent ekranów 2 (Main2) — ekrany od Zgłoszeń"}
    if 'order' in c: c['order'].append('Main2.dc.html')
    json.dump(c,open(D+'canvas.json','w'),ensure_ascii=False,indent=2)
print(f'split: Main {len(m1.encode()):,} B ({len(g1)} ekr.), Main2 {len(m2.encode()):,} B ({len(g2)} ekr.); plansze Main {n[0]}, Main2 {n[1]}')
