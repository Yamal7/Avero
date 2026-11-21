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
H=['<div class="ko" style="width:100%;min-height:1240px">']
a=H.append
a('<header style="display:flex;align-items:center;gap:12px;height:64px;padding:0 40px;background:var(--bg-surface)">'+LOGO+'<span style="font-weight:600">Kranz HVACR</span>'
  '<nav style="display:flex;gap:4px;margin-left:24px">'+''.join(f'<a href="#" style="height:36px;display:inline-flex;align-items:center;padding:0 12px;border-radius:10px;{"background:var(--bg-subtle);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}</a>' for i,t in enumerate(['Przegląd','Faktury','Urządzenia','Zgłoszenia','Umowa']))+'</nav>'
  '<span style="flex:1 1 auto"></span><span style="font-size:13px;color:var(--text-secondary)">Kancelaria Wit · Krzysztof Lis</span></header>')
a('<main style="max-width:1120px;margin:0 auto;padding:36px 40px 64px;display:flex;flex-direction:column;gap:28px">')
a('<div style="display:flex;align-items:flex-end;gap:16px"><div style="flex:1 1 auto;display:flex;flex-direction:column;gap:6px"><span style="color:var(--text-secondary)">Umowa serwisowa do 28 lutego 2027 · 4 urządzenia</span>'
  '<h1 style="margin:0;font-size:28px;line-height:36px;font-weight:600;letter-spacing:-0.02em">Kancelaria Wit</h1></div>'+
  pbtn('Zamów usługę',icon=PLUSI)+pbtn('Zgłoś usterkę',True,WRENCHI)+'</div>')
# trzy karty stanu
a('<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">')
a(card('<span style="color:var(--text-secondary)">Do zapłaty</span><span class="num" style="font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.015em">0,00 zł</span>'
       '<span style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--success)">'+ic(CHECK,14,'var(--success)')+'Wszystkie faktury opłacone · ostatnia wpłata 19 lis</span>'))
a(card('<span style="color:var(--text-secondary)">Najbliższa wizyta</span><span style="font-size:18px;line-height:26px;font-weight:600">Poniedziałek 23 lis, 9:00–11:00</span>'
       '<span style="font-size:13px;line-height:18px;color:var(--text-secondary)">Naprawa klimatyzatora w pokoju zarządu · Kacper Nowak · bezpłatnie, w ramach gwarancji</span>'))
a(card('<span style="color:var(--text-secondary)">Wymaga terminu</span><span style="font-size:18px;line-height:26px;font-weight:600">Kontrola szczelności serwerowni</span>'
       '<span style="display:flex;align-items:center;gap:6px;font-size:13px;line-height:18px;color:var(--warning)">'+ic(WARNI,14,'var(--warning)')+'Termin minął 17 lis — wybierz dzień wizyty</span>'
       '<a href="#" style="align-self:flex-start;font-weight:500;font-size:13px">Wybierz termin →</a>'))
a('</div>')
a('<div style="display:flex;gap:24px;align-items:flex-start">')
# lewa kolumna
a('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:28px">')
a('<section style="display:flex;flex-direction:column;gap:12px">'+sec('Zgłoszenia i reklamacje',lnk('Wszystkie (7)'))+
  card('<div style="display:flex;align-items:flex-start;gap:14px"><span style="width:36px;height:36px;flex:0 0 auto;border-radius:12px;background:var(--bg-raised);display:inline-flex;align-items:center;justify-content:center">'+ic(SHIELDI,18,'#C98A12')+'</span>'
       '<span style="flex:1 1 auto;display:flex;flex-direction:column;gap:4px"><span style="display:flex;gap:8px;align-items:center"><span style="font-weight:500">Reklamacja RK-2026-017 · klimatyzator nie chłodzi (E7)</span></span>'
       '<span style="font-size:13px;line-height:18px;color:var(--text-secondary)">Uznana 13 lis — uszkodzony silnik wentylatora jednostki zewnętrznej. Część dotarła, naprawa w poniedziałek 23 lis. Koszt dla Państwa: 0 zł.</span>'
       '<span style="display:flex;gap:4px;padding-top:6px;flex-wrap:wrap">'+''.join(
           f'<span style="height:26px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:13px;background:var(--bg-raised);font-size:12px;{"font-weight:500" if i==3 else ""};color:{"var(--text-primary)" if i<=3 else "var(--text-tertiary)"}">{ic(CHECK,12,"var(--success)") if i<3 else ""}{t}</span>'
           for i,t in enumerate(['Zgłoszona','Diagnoza','Uznana','Naprawa 23 lis','Zakończona']))+'</span></span></div>'))
a('<section style="display:flex;flex-direction:column;gap:12px">'+sec('Faktury',lnk('Pobierz wszystkie z 2026 (ZIP)'))+
  card(frow('FV/2026/11/006','Przegląd i naprawa · październik','18 paź','4 960,00','zapłacona 19 lis','var(--success)')+
       frow('FV/2026/08/044','Czyszczenie klimatyzacji · 3 jednostki','12 sie','1 230,00','zapłacona 20 sie','var(--success)')+
       frow('FV/2026/03/019','Umowa serwisowa · rok 2026/27','2 mar','5 658,00','zapłacona 9 mar','var(--success)',last=True),'padding:6px 20px')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:12px">'+sec('Urządzenia',lnk('Historia wizyt'))+
  card(drow_(SNOWI,'#3B82D6','Klimatyzacja serwerowni · UR-1988','R410A 3,2 kg · kontrola szczelności co 12 mies.','kontrola po terminie','var(--warning)','<a href="#" style="font-size:13px;font-weight:500;padding-left:12px">Wybierz termin</a>')+
       drow_(SNOWI,'#3B82D6','Klimatyzator · pokój zarządu · UR-1990','gwarancja producenta do 14 mar 2028','naprawa 23 lis','var(--text-secondary)')+
       drow_(SNOWI,'#3B82D6','Klimatyzator · sala konferencyjna · UR-1991','przegląd w umowie · ostatni 11 mar','sprawny','var(--text-tertiary)')+
       drow_(SNOWI,'#3B82D6','Klimatyzator · recepcja · UR-1992','przegląd w umowie · ostatni 11 mar','sprawny','var(--text-tertiary)',last=True),'padding:4px 20px')+'</section>')
a('</div>')
# prawa kolumna
a('<aside style="flex:0 0 340px;display:flex;flex-direction:column;gap:16px">')
a(card('<span style="font-weight:600">Umowa serwisowa</span>'
       '<div style="display:flex;flex-direction:column;gap:8px;font-size:13px">'+''.join(f'<div style="display:flex;justify-content:space-between;gap:12px"><span style="color:var(--text-secondary)">{k}</span><span class="num" style="text-align:right">{v}</span></div>' for k,v in [
           ('Okres','1 mar 2026 – 28 lut 2027'),('Przeglądy','2 w roku · 1 wykonany'),('Czas reakcji','do 8 h w dni robocze'),('Części','−10 % od cennika')])+'</div>'
       '<a href="#" style="font-size:13px;color:var(--text-secondary)">Umowa (PDF)</a>'))
a(card('<span style="font-weight:600">Oferta czeka na Państwa</span>'
       '<span style="font-size:13px;line-height:18px;color:var(--text-secondary)">OF-2026-114 · Klimatyzacja sali konferencyjnej na 2. piętrze. Ważna do 4 grudnia.</span>'
       '<span class="num" style="font-size:18px;line-height:26px;font-weight:600">33 579,00 zł <span style="font-size:13px;font-weight:400;color:var(--text-tertiary)">brutto</span></span>'+
       pbtn('Zobacz ofertę')))
a(card('<span style="font-weight:600">Zamów ponownie</span>'
       '<div style="display:flex;flex-direction:column;gap:8px">'+''.join(
           f'<a href="#" class="opt" style="display:flex;align-items:center;gap:12px;min-height:48px;padding:0 12px;border-radius:12px;background:var(--bg-raised)"><span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">{t}</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{sub}</span></span><span class="num" style="font-size:13px;white-space:nowrap">{p}</span></a>'
           for t,sub,p in [('Czyszczenie klimatyzacji','ostatnio 12 sie · 3 jednostki','od 180 zł / szt.'),('Dodatkowy przegląd','poza umową, w ciągu 5 dni roboczych','420 zł')])+'</div>'
       '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Ceny netto z rabatem z umowy. Termin zaproponujemy w ciągu dnia roboczego.</span>'))
a('</aside></div>')
a('<footer style="display:flex;gap:16px;font-size:12px;color:var(--text-tertiary)"><span>Kranz HVACR · biuro@kranz-hvacr.pl · +48 58 500 12 40</span><span style="flex:1 1 auto"></span><span>Link osobisty — nie przekazuj go dalej</span></footer>')
a('</main></div>')
open(D+'Klient-portal.dc.html','w').write(page('Avero — portal klienta: Kancelaria Wit',1440,1240,'\n'.join(H)))
print('ok portal')
