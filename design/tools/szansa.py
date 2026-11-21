# Rekord szansy SZ-0179 (Marek Zieliński, pompa ciepła) — stan na czwartek 19 lis 2026, po akceptacji.
P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; PKC='#5F636B'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
TARGET='<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>'
FLAME='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>'
GLOBE='<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"></path>'
EYE='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>'
CAM='<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>'
SIGN='<path d="m12 19 7-7 3 3-7 7-3-3z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="m2 2 7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle>'
CARD='<rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path>'
USER='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>'
NOTE='<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"></path><path d="M15 3v6h6"></path>'
BOLT='<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>'
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
def sch(inner,tip,bg='var(--bg-subtle)',col='var(--text-secondary)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:{col};white-space:nowrap">{inner}</span>'
def obj(code,tip,bg='var(--bg-subtle)'): return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,bg)
won='<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.5" style="fill:var(--success)"></circle><path d="m4.3 7.2 1.8 1.8 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

H=[];a=H.append
a('<sc-if value="{{isSzR}}" hint-placeholder-val="{{false}}">')
a('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(TARGET,16,'var(--text-secondary)')+
  '<a href="#" class="flink" style="color:var(--text-secondary)">Sprzedaż</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<a href="#" class="flink" style="color:var(--text-secondary)">Szanse</a>'+ic(CHEV,14,'var(--text-tertiary)')+
  '<h1 class="num" style="margin:0;font-size:13px;line-height:20px;font-weight:500">SZ-0179</h1>'+SP+
  '<span style="font-size:12px;color:var(--text-tertiary)">3 z 6 wygranych</span>'+ib('Poprzednia','Poprzednia  J','<path d="m18 15-6-6-6 6"></path>')+ib('Następna','Następna  K','<path d="m6 9 6 6 6-6"></path>')+ib('Kopiuj link','Kopiuj link',LINK)+ib('Więcej akcji','Więcej akcji',DOTS)+'</div>')
a('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
a('<div style="display:flex;flex-direction:column;gap:12px;padding:12px 24px 16px">'
  '<div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">Pompa ciepła zamiast kotła węglowego · dom 160 m²</h2>'
  '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(USER,'Marek Zieliński','KL-0388 · osoba prywatna')+meta(PIN,'Dębogórska 31, Rumia','84-230 Rumia')+meta(FLAME,'7,4 kW przy −16 °C','Obciążenie cieplne z oględzin OG-0412 (OZC)')+'</div></div>'
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd(won+'Wygrana · 18 lis','Wygrana automatycznie po akceptacji oferty online · środa 18 lis 14:51')+
  capd('<span class="num" style="font-weight:500">44 020 zł</span><span style="color:var(--text-tertiary)">netto</span>','47 541,60 zł brutto (VAT 8 %) · wariant B + demontaż kotła')+
  capd(ic(CLOCK,14,'var(--text-tertiary)')+'15 dni od zapytania','Od leada 3 lis do akceptacji 18 lis · średnio dla pomp ciepła: 23 dni')+
  capd(cav('TL',TL)+'Tomasz','Opiekun: Tomasz Lewandowski · doradca techniczny pomp ciepła','0 10px 0 4px')+'</div></div>')
# ścieżka etapów
ST=[('Kwalifikacja','4 lis','done'),('Oględziny','10 lis','done'),('Wycena','11 lis','done'),('Oferta','11 lis','done'),('Negocjacje','pominięte','skip'),('Wygrana','18 lis','won')]
def stp(t,tm,k):
    dots={'done':'<span style="width:8px;height:8px;border-radius:50%;background:var(--success)"></span>',
          'won':'<span style="display:inline-flex">'+won+'</span>',
          'skip':'<span style="width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)"></span>'}[k]
    line='' if k=='won' else f'<span style="flex:1 1 auto;height:1.5px;background:{"var(--success)" if k!="skip" else "var(--edge)"}"></span>'
    return (f'<span style="flex:{"0 0 auto" if k=="won" else "1 1 0"};display:flex;flex-direction:column;gap:4px;min-width:0"><span style="display:flex;align-items:center;gap:6px;height:14px">{dots}{line}</span>'
            f'<span style="font-size:12px;line-height:16px;color:{"var(--text-tertiary)" if k=="skip" else "var(--text-primary)"};font-weight:{500 if k=="won" else 400}">{t}</span><span class="num" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{tm}</span></span>')
a('<div aria-label="Etapy szansy" style="display:flex;gap:6px;margin:0 24px 20px;padding:12px 16px;border-radius:12px;background:var(--bg-raised)">'+''.join(stp(*x) for x in ST)+'</div>')
# oś
def ev(icon,col,title,body='',tm='',who='',chips=''):
    return (f'<li style="display:flex;gap:12px;padding:8px 0">'
            f'<span style="width:28px;height:28px;flex:0 0 auto;border-radius:50%;background:var(--bg-raised);display:inline-flex;align-items:center;justify-content:center">{ic(icon,14,col)}</span>'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px;padding-top:4px"><div style="display:flex;align-items:center;gap:8px;min-width:0"><span class="ell" style="flex:0 1 auto;font-weight:500">{title}</span>{who}{SP}<span class="num" style="font-size:12px;color:var(--text-tertiary);white-space:nowrap">{tm}</span></div>'
            +(f'<span style="color:var(--text-secondary);line-height:20px">{body}</span>' if body else '')+(f'<div style="display:flex;flex-wrap:wrap;gap:4px">{chips}</div>' if chips else '')+'</div></li>')
def day(t): return f'<li style="padding:12px 0 2px 40px;font-size:12px;color:var(--text-tertiary)">{t}</li>'
sm=lambda i,c: f'<span style="display:inline-flex">{cav(i,c,18,8)}</span>'
a('<div style="display:flex;flex-direction:column;gap:8px;padding:0 24px 32px;max-width:860px">')
a('<div style="display:flex;align-items:center;gap:8px;height:28px">'+h3('Historia')+SP+''.join(f'<a href="#" class="sec" style="height:24px;display:inline-flex;align-items:center;padding:0 8px;border-radius:12px;font-size:12px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}</a>' for i,t in enumerate(['Wszystko','Rozmowy','Dokumenty','Klient']))+'</div>')
a('<ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column">')
a(day('Środa 18 listopada'))
a(ev(BOLT,'var(--text-secondary)','Avero przygotował realizację','Zlecenie montażu, zamówienie jednostki zewnętrznej i fundamentu, rezerwacja ekipy na 30 lis – 1 gru, zamknięcie wariantów A i C.','14:52','',obj('ZS-1052','Zlecenie montażu · Tomasz i Mateusz')+obj('ZK/2026/11/031','Zamówienie u dystrybutora · dostawa 20 lis')+obj('FZ/2026/11/014','Faktura zaliczkowa')))
a(ev(CARD,'var(--success)','Zaliczka zapłacona · 14 262,48 zł','BLIK przez Przelewy24.','14:51','',sch(ic(CHECK,12,'var(--success)')+'zaksięgowana','Potwierdzenie P24 · 14:51:38')))
a(ev(SIGN,'var(--success)','Klient zaakceptował ofertę online','Wariant B Daikin Altherma 3 R 8 kW + demontaż kotła. Podpis palcem na telefonie, zgoda na montaż przed upływem 14 dni.','14:51','',obj('OF-2026-118 v2','Zaakceptowana wersja')+sch(ic(FILE,12,'var(--text-tertiary)')+'umowa.pdf','Umowa z podpisem klienta')))
a(day('Poniedziałek 16 listopada'))
a(ev(FILE,'var(--text-secondary)','Wysłano ofertę w wersji 2','Wariant A z buforem 50 l (ostrzeżenie z wersji 1), terminy montażu do wyboru przez klienta.','10:05',sm('TL',TL),obj('OF-2026-118 v2','Zmiany względem v1: +2 380 zł w wariancie A, terminy montażu')))
a(day('Piątek 13 listopada'))
a(ev(PHONE,'var(--text-secondary)','Rozmowa telefoniczna · 12 min','Pyta o hałas jednostki zewnętrznej (sąsiad 6 m) i o bufor w wariancie A. Decyzja po weekendzie.','11:30',sm('TL',TL)))
a(day('Czwartek 12 listopada'))
a(ev(EYE,'var(--text-tertiary)','Klient otworzył ofertę 3 razy','Od środy wieczorem. Najdłużej porównywał warianty B i C.','21:14',''))
a(day('Środa 11 listopada'))
a(ev(FILE,'var(--text-secondary)','Wysłano ofertę: 3 warianty','A Panasonic 9 kW · B Daikin 8 kW (polecany) · C Daikin 14 kW HT. E-mail i SMS z linkiem.','16:20',sm('TL',TL),obj('OF-2026-118 v1','Zastąpiona przez v2')))
a(day('Wtorek 10 listopada'))
a(ev(CAM,'var(--text-secondary)','Oględziny','Obciążenie cieplne 7,4 kW przy −16 °C, 14 zdjęć, miejsce na jednostkę przy ścianie wschodniej.','14:00',sm('TL',TL),obj('OG-0412','Protokół oględzin')+sch(ic(CAM,12,'var(--text-tertiary)')+'14','Zdjęcia wewnętrzne — klient ich nie widzi')))
a(day('Środa 4 listopada'))
a(ev(PHONE,'var(--text-secondary)','Zakwalifikowano w pierwszej rozmowie','Kocioł węglowy z 2006 r., chce zdążyć przed mrozami. Umówiono oględziny.','9:10',sm('PK',PKC)))
a(day('Wtorek 3 listopada'))
a(ev(GLOBE,'var(--text-tertiary)','Zapytanie z formularza na stronie','„Dom 160 m² w Rumi, chcemy zmienić węgiel na pompę ciepła.”','19:42',''))
a('</ol></div></div>')
# aside
a('<aside aria-label="Szczegóły szansy SZ-0179" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:20px;padding:16px 12px 24px">')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Klient')+
  prop(USER,'Marek Zieliński','KL-0388 · osoba prywatna',ib('Zadzwoń','+48 604 219 553',PHONE,24),plain=True)+
  prop(PIN,'Dębogórska 31, Rumia','Dom 160 m² · obiekt OB-0511')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Wartość')+
  '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
  kv('Netto','44 020,00 zł',w=500)+kv('Brutto (VAT 8 %)','47 541,60 zł',tip='Budynek mieszkalny do 300 m²')+kv('Marża','25,5 %',vc='var(--success)',tip='11 206 zł · próg firmy 22 %')+
  kv('Zaliczka 30 %','zapłacona',vc='var(--success)',tip='14 262,48 zł · FZ/2026/11/014')+kv('Pozostało','33 279,12 zł',tip='Faktura końcowa po odbiorze')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Sprzedaż')+
  prop(GLOBE,'Formularz na stronie','Zapytanie 3 lis 19:42 (poza godzinami pracy)')+
  prop(CLOCK,'Pierwszy kontakt w 10 min','Liczone w godzinach pracy: środa 4 lis od 9:00 do telefonu 9:10',sch(ic(CHECK,12,'var(--success)')+'w celu','Cel: 2 h'))+
  prop(USER,'Opiekun: Tomasz','Pierwszy kontakt i kwalifikacja: Pascal',cav('TL',TL))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Dalej',CNT(3))+
  '<ol style="margin:0;padding:4px 8px;list-style:none;display:flex;flex-direction:column;gap:10px">'
  '<li style="display:flex;gap:8px;align-items:center" title="Poniedziałek 30 lis – wtorek 1 gru · Tomasz i Mateusz">'+ic(WRENCH,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Montaż</span><span class="num" style="font-size:12px;color:var(--text-secondary)">30 lis – 1 gru</span></li>'
  '<li style="display:flex;gap:8px;align-items:center" title="E-mail z propozycją umowy serwisowej 590 zł netto / rok · 15 gru">'+ic(FILE,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Propozycja umowy serwisowej</span><span class="num" style="font-size:12px;color:var(--text-secondary)">15 gru</span></li>'
  '<li style="display:flex;gap:8px;align-items:center" title="Warunek gwarancji 5 lat">'+ic(CYC,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Przegląd gwarancyjny</span><span class="num" style="font-size:12px;color:var(--text-secondary)">1 gru 2027</span></li></ol></section>')
a('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Powiązane',CNT(5))+'<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+
  obj('OG-0412','Oględziny · 10 lis')+obj('OF-2026-118','Oferta · wersja 2 zaakceptowana')+obj('FZ/2026/11/014','Faktura zaliczkowa')+obj('ZS-1052','Zlecenie montażu')+obj('ZK/2026/11/031','Zamówienie u dystrybutora')+'</div></section>')
a('<div style="padding:0 4px"><button type="button" class="sec" title="Otwórz zlecenie montażu ZS-1052  G Z" style="width:100%;height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(WRENCH,14,'var(--text-secondary)')+'Otwórz zlecenie ZS-1052</button></div>')
a('</aside></div></sc-if>')

block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const nSzn = navv(isSzn);","const isSzR = ekran === 'szansa'; const nSzn = navv(isSzn || isSzR);")
rep("isLd, actLd:","isSzR, isLd, actLd:")
rep('"leady", "szanse", "planowanie"]','"leady", "szanse", "szansa", "planowanie"]')
open(P,'w').write(s); print('ok szansa',len(s))
