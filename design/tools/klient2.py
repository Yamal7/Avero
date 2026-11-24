# Portal klienta firmowego (link stały): Kancelaria Wit — faktury, umowa, urządzenia, zgłoszenia i reklamacje, ponowne zamówienie.
# Scenariusz: sobota 21 lis 2026. Klient nie widzi marży, cen zakupu, dostępności ani zdjęć wewnętrznych.
_k=open('design/tools/klient.py').read()
exec(_k.split("# ---------------- desktop")[0])
RECEIPT='<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path>'
WRENCHI='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>'
SNOWI='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>'
SHIELDI='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>'
PLUSI='<path d="M5 12h14M12 5v14"></path>'
CALI='<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>'
WARNI='<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4M12 17h.01"></path>'
FILEI='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path>'
card=lambda inner,extra='': f'<div style="display:flex;flex-direction:column;gap:12px;padding:18px 20px;border-radius:14px;background:var(--bg-surface);{extra}">{inner}</div>'
def sec(t,right=''): return f'<div style="display:flex;align-items:center;gap:8px"><h2 style="margin:0;font-size:16px;line-height:24px;font-weight:600;flex:1 1 auto">{t}</h2>{right}</div>'
def lnk(t,tip=''): return f'<a href="#" title="{tip}" style="font-size:13px;color:var(--text-secondary)">{t}</a>'
def frow(no,what,date_,amount,state,stcol,last=False):
    bb='' if last else 'border-bottom:1px solid var(--edge);'
    return (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 64px 96px 150px 28px;column-gap:12px;align-items:center;min-height:56px;{bb}">'
            f'<span style="display:flex;flex-direction:column;min-width:0"><span class="ell">{what}</span><span class="mono" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{no}</span></span><span class="num" style="font-size:13px;color:var(--text-secondary)">{date_}</span>'
            f'<span class="num" style="text-align:right;font-weight:500">{amount}</span><span style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:{stcol};padding-left:12px;white-space:nowrap">{ic(CHECK,14,stcol)}{state}</span>'
            f'<a href="#" title="Pobierz PDF" style="display:inline-flex;justify-content:flex-end">{ic(DL,16,"var(--text-secondary)")}</a></div>')
def drow_(icon,col,name,where,info,infocol,action='',last=False):
    bb='' if last else 'border-bottom:1px solid var(--edge);'
    return (f'<div style="display:flex;align-items:center;gap:14px;min-height:64px;{bb}"><span style="width:36px;height:36px;flex:0 0 auto;border-radius:12px;background:var(--bg-raised);display:inline-flex;align-items:center;justify-content:center">{ic(icon,18,col)}</span>'
            f'<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span class="ell" style="font-weight:500">{name}</span><span class="ell" style="font-size:13px;line-height:18px;color:var(--text-tertiary)">{where}</span></span>'
            f'<span style="font-size:13px;color:{infocol};white-space:nowrap">{info}</span>{action}</div>')
def pbtn(t,primary=False,icon=''):
    st='background:var(--accent);color:var(--on-accent)' if primary else 'background:var(--bg-subtle)'
    return f'<button type="button" class="{"pri" if primary else "sec"}" style="height:40px;display:inline-flex;align-items:center;gap:8px;padding:0 16px;border:0;border-radius:12px;{st};font-weight:500;white-space:nowrap">{ic(icon,16) if icon else ""}{t}</button>'
H=['<div class="ko" style="width:100%;min-height:1000px;background:var(--bg-surface)">']
a=H.append
a('<header style="display:flex;align-items:center;gap:12px;height:64px;padding:0 40px;background:var(--bg-surface)">'+LOGO+'<span style="font-weight:600">Kranz HVACR</span>'
  '<nav style="display:flex;gap:4px;margin-left:24px">'+''.join(f'<a href="#" style="height:36px;display:inline-flex;align-items:center;padding:0 12px;border-radius:10px;{"background:var(--bg-subtle);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}</a>' for i,t in enumerate(['Przegląd','Faktury','Urządzenia','Zgłoszenia','Umowa']))+'</nav>'
  '<span style="flex:1 1 auto"></span><span style="font-size:13px;color:var(--text-secondary)">Kancelaria Wit · Krzysztof Lis</span></header>')
exec(open('design/tools/ui1.py').read())
a('<style>.ko{'+';'.join(f'--ic-{k}:{v}' for k,v in IC_LIGHT.items())+'} .ko .r:hover{background:var(--bg-raised)}</style>')
# Portal jak dokument: bez kart i kafelków. Sekcje = nagłówek + lista wierszy w jednej linii (36–44 px) z ikoną.
a('<main style="max-width:1240px;margin:0 auto;padding:36px 40px 64px;display:flex;flex-direction:column;gap:32px">')
a('<div style="display:flex;align-items:flex-end;gap:12px"><div style="flex:1 1 auto;display:flex;flex-direction:column;gap:6px"><span style="color:var(--text-secondary)">Umowa serwisowa do 28 lutego 2027 · 4 urządzenia</span>'
  '<h1 style="margin:0;font-size:28px;line-height:36px;font-weight:600;letter-spacing:-0.02em">Kancelaria Wit</h1></div>'+
  pbtn('Zamów usługę',icon=PLUSI)+pbtn('Zgłoś usterkę',True,WRENCHI)+'</div>')
def H2(t,right='',n=''):
    nn=f'<span class="num" style="color:var(--text-tertiary);font-weight:400">{n}</span>' if n!='' else ''
    return f'<div style="display:flex;align-items:center;gap:8px;height:32px;border-bottom:1px solid var(--edge)"><h2 style="margin:0;font-size:14px;line-height:20px;font-weight:600">{t}</h2>{nn}<span style="flex:1"></span>{right}</div>'
def R(icon,col,title,mid='',right='',rcol='var(--text-secondary)',act='',tip='',mono=''):
    return (f'<a href="#" class="r" title="{tip}" style="display:grid;grid-template-columns:16px minmax(0,2fr) 104px minmax(0,1fr) 100px 88px;column-gap:12px;align-items:center;height:44px;padding:0 8px;margin:0 -8px;border-radius:8px">{u_ci(icon,col,16)}'
            f'<span class="ell">{title}</span><span class="mono ell" style="font-size:12px;color:var(--text-tertiary)">{mono}</span><span class="ell" style="font-size:13px;color:var(--text-secondary)">{mid}</span>'
            f'<span class="num ell" style="text-align:right;font-size:13px;color:{rcol}">{right}</span><span style="display:flex;justify-content:flex-end">{act}</span></a>')
def R2(icon,col,title,right,tip=''):
    return f'<a href="#" class="r" title="{tip}" style="display:flex;align-items:center;gap:12px;height:44px;padding:0 8px;margin:0 -8px;border-radius:8px">{u_ci(icon,col,16)}<span class="ell" style="flex:1">{title}</span><span class="num" style="font-size:13px">{right}</span></a>'
def ACT(t): return f'<span style="flex:0 0 auto;font-size:13px;font-weight:500;color:var(--accent)">{t}</span>'
a('<div style="display:grid;grid-template-columns:minmax(0,1fr) 288px;column-gap:40px;align-items:start">')
a('<div style="display:flex;flex-direction:column;gap:32px;min-width:0">')
a('<section>'+H2('Teraz')+
  R('cal','blue','Wizyta: naprawa klimatyzatora','Kacper Nowak · gwarancja','pn 23 lis, 9:00','var(--text-primary)',tip='Poniedziałek 23 listopada 2026, 9:00–11:00')+
  R('alert','orange','Kontrola szczelności serwerowni','termin minął 17 lis','',act=ACT('Wybierz termin'))+
  R('file','violet','Oferta: klimatyzacja sali konf.','ważna do 4 gru','33 579,00 zł','var(--text-primary)',act=ACT('Zobacz'),mono='OF-2026-114')+
  R('check','green','Wszystkie faktury opłacone','ostatnia wpłata 19 lis','0,00 zł','var(--text-primary)')+'</section>')
a('<section>'+H2('Zgłoszenia i reklamacje',lnk('Wszystkie (7)'))+
  R('ret','red','Klimatyzator nie chłodzi (E7)','uznana · koszt 0 zł','naprawa 23 lis','var(--warning)',mono='RK-2026-017',tip='Zgłoszona → Diagnoza → Uznana → Naprawa 23 lis → Zakończona')+'</section>')
a('<section>'+H2('Urządzenia',lnk('Historia wizyt'),4)+
  R('snow','blue','Klimatyzacja serwerowni','R410A 3,2 kg · kontrola co 12 mies.','po terminie','var(--warning)',mono='UR-1988')+
  R('snow','blue','Klimatyzator · pokój zarządu','gwarancja do 14 mar 2028','w naprawie',mono='UR-1990')+
  R('snow','blue','Klimatyzator · sala konferencyjna','przegląd 11 mar','sprawny','var(--text-tertiary)',mono='UR-1991')+
  R('snow','blue','Klimatyzator · recepcja','przegląd 11 mar','sprawny','var(--text-tertiary)',mono='UR-1992')+'</section>')
a('<section>'+H2('Faktury',lnk('Pobierz wszystkie z 2026 (ZIP)'))+
  R('receipt','green','Przegląd i naprawa · październik','zapłacona 19 lis','4 960,00 zł','var(--text-primary)',act=f'<span title="Pobierz PDF" style="display:inline-flex">{ic(DL,16,"var(--text-secondary)")}</span>',mono='FV/2026/11/006')+
  R('receipt','green','Czyszczenie klimatyzacji · 3 jednostki','zapłacona 20 sie','1 230,00 zł','var(--text-primary)',act=f'<span title="Pobierz PDF" style="display:inline-flex">{ic(DL,16,"var(--text-secondary)")}</span>',mono='FV/2026/08/044')+
  R('receipt','green','Umowa serwisowa · rok 2026/27','zapłacona 9 mar','5 658,00 zł','var(--text-primary)',act=f'<span title="Pobierz PDF" style="display:inline-flex">{ic(DL,16,"var(--text-secondary)")}</span>',mono='FV/2026/03/019')+'</section>')
a('</div>')
# prawa kolumna: właściwości umowy + zamów ponownie — bez kart
def KV(k,v): return f'<div style="display:flex;align-items:center;gap:12px;height:32px"><span style="width:108px;flex:0 0 auto;font-size:13px;color:var(--text-secondary)">{k}</span><span class="num ell" style="font-size:13px">{v}</span></div>'
a('<aside style="display:flex;flex-direction:column;gap:32px">')
a('<section>'+H2('Umowa serwisowa',lnk('PDF'))+'<div style="padding-top:6px">'+
  KV('Okres','1 mar 2026 – 28 lut 2027')+KV('Przeglądy','2 w roku · 1 wykonany')+KV('Czas reakcji','do 8 h w dni robocze')+KV('Części','−10 % od cennika')+'</div></section>')
a('<section>'+H2('Zamów ponownie')+
  R2('wind','teal','Czyszczenie klimatyzacji','od 180 zł / szt.',tip='ostatnio 12 sie · 3 jednostki')+
  R2('wrench','orange','Dodatkowy przegląd','420 zł',tip='poza umową, w ciągu 5 dni roboczych')+
  '<p style="margin:8px 0 0;font-size:12px;line-height:16px;color:var(--text-tertiary)">Ceny netto z rabatem z umowy. Termin zaproponujemy w ciągu dnia roboczego.</p></section>')
a('</aside></div>')
a('<footer style="display:flex;gap:16px;font-size:12px;color:var(--text-tertiary)"><span>Kranz HVACR · biuro@kranz-hvacr.pl · +48 58 500 12 40</span><span style="flex:1 1 auto"></span><span>Link osobisty — nie przekazuj go dalej</span></footer>')
a('</main></div>')
open(D+'Klient-portal.dc.html','w').write(page('Avero — portal klienta: Kancelaria Wit',1440,1240,'\n'.join(H)))
print('ok portal')
