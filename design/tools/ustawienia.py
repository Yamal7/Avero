P='design/canvas/Main.dc.html'
SRC2=open('design/tools/zl2.py').read()
exec(SRC2.split("P1=st_svg")[0])
exec(SRC2[SRC2.index("def prop("):SRC2.index("a('<aside")])
s=open(P).read()
TL='#9B6BE0'; MZC='#3B82D6'; KN='#1FA7A5'; PD='#E0702A'; AWC='#8A8F98'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
BLD='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>'
DOCN='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4M9 13h6M9 17h3"></path>'
TAGI='<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5"></circle>'
CLIP='<rect width="8" height="4" x="8" y="2" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>'
USERS='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
TRUCK='<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>'
PLUG='<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"></path>'
BELL='<path d="M10.27 21a2 2 0 0 0 3.46 0"></path><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"></path>'
SUN='<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>'
USER='<circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"></path>'
IMG='<rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"></path>'
BANK='<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l9 5H3z"></path>'
GLOBE='<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"></path>'
MAIL='<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>'
MSG='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>'
CARD='<rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path>'
CLOUD='<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>'
MAPI='<path d="M14.1 6.3 9.9 4.2a2 2 0 0 0-1.8 0L3.6 6.4A1 1 0 0 0 3 7.3v12.1a1 1 0 0 0 1.4.9l3.7-1.8a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.5-2.2a1 1 0 0 0 .6-.9V5.4a1 1 0 0 0-1.4-.9l-3.7 1.8a2 2 0 0 1-1.8 0Z"></path><path d="M15 6.5v15M9 3.5v15"></path>'
LOCKI='<rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
HIST='<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5M12 7v5l4 2"></path>'
BAN='<circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path>'
SERVER='<rect width="20" height="8" x="2" y="2" rx="2"></rect><rect width="20" height="8" x="2" y="14" rx="2"></rect><path d="M6 6h.01M6 18h.01"></path>'
UPL='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5M12 3v12"></path>'
def dot(c): return f'<span aria-hidden="true" style="width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:{c}"></span>'
def sch(inner,tip,bg='var(--bg-subtle)'):
    return f'<span title="{tip}" style="height:22px;display:inline-flex;align-items:center;gap:4px;padding:0 8px 0 6px;border-radius:11px;background:{bg};font-size:12px;line-height:16px;color:var(--text-secondary);white-space:nowrap">{inner}</span>'
def tog(on,label):
    return (f'<button type="button" role="switch" aria-checked="{str(on).lower()}" aria-label="{label}" title="{label}" style="position:relative;width:28px;height:16px;flex:0 0 auto;border:0;border-radius:8px;background:{"var(--accent)" if on else "var(--border-strong)"};padding:0">'
            f'<span aria-hidden="true" style="position:absolute;top:2px;left:{12 if on else 2}px;width:12px;height:12px;border-radius:6px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2)"></span></button>')
def inp(val,label,w='100%',icon=None,mono=False,suffix='',ph=''):
    ic_=ic(icon,14,'var(--text-tertiary)') if icon else ''
    sf=f'<span style="color:var(--text-tertiary);white-space:nowrap">{suffix}</span>' if suffix else ''
    return (f'<label style="height:32px;width:{w};display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:10px;background:var(--bg-subtle)">{ic_}'
            f'<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">{label}</span>'
            f'<input value="{val}" placeholder="{ph}" class="{"mono" if mono else ""} num" style="flex:1 1 auto;min-width:0;height:30px;border:0;background:transparent;font:inherit;{"font-family:var(--font-mono,Geist Mono),monospace;font-size:12px;" if mono else ""}color:var(--text-primary);outline:none">{sf}</label>')
def frow(label,ctrl,hint=''):
    h=f'<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{hint}</span>' if hint else ''
    return (f'<div style="display:grid;grid-template-columns:200px minmax(0,1fr);column-gap:24px;align-items:start;padding:10px 0">'
            f'<div style="display:flex;flex-direction:column;gap:2px;padding-top:6px"><span style="font-weight:500">{label}</span>{h}</div><div style="display:flex;flex-direction:column;gap:8px;min-width:0">{ctrl}</div></div>')
def section(title,body,right=''):
    return (f'<section style="display:flex;flex-direction:column"><div style="display:flex;align-items:center;gap:8px;padding:0 0 4px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">{title}</h3>{SP}{right}</div>'
            f'<div style="display:flex;flex-direction:column;padding:4px 16px;border-radius:12px;background:var(--bg-raised)">{body}</div></section>')
def sep(): return '<div style="height:1px;background:var(--edge)"></div>'

# ---------- settings secondary nav
def snav(cur):
    G=[('Firma',[('profil',BLD,'Profil firmy'),('dok',DOCN,'Dokumenty i numeracja'),('cen',TAGI,'Katalog i marże'),('szab',CLIP,'Szablony protokołów')]),
       ('Zespół',[('uz',USERS,'Użytkownicy i role'),('bus',TRUCK,'Technicy i busy')]),
       ('Połączenia',[('int',PLUG,'Integracje')]),
       ('Moje konto',[('ja',USER,'Profil'),('pow',BELL,'Powiadomienia'),('wyg',SUN,'Wygląd')])]
    o='<nav aria-label="Ustawienia" style="flex:0 0 204px;display:flex;flex-direction:column;gap:14px;padding:14px 10px;border-right:1px solid var(--edge)">'
    o+='<span style="padding:0 8px;font-size:15px;line-height:22px;font-weight:600">Ustawienia</span>'
    for g,items in G:
        o+=f'<div style="display:flex;flex-direction:column;gap:1px"><span style="padding:0 8px 4px;font-size:12px;color:var(--text-tertiary)">{g}</span>'
        for k,i,t in items:
            on=k==cur
            o+=(f'<a href="#" class="sec" {"aria-current=\"page\"" if on else ""} style="height:30px;display:flex;align-items:center;gap:8px;padding:0 8px;border-radius:8px;'
                f'{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if on else "color:var(--text-secondary)"}">{ic(i,16,"currentColor")}<span class="ell">{t}</span></a>')
        o+='</div>'
    return o+'</nav>'
def head(title,sub,right=''):
    return (f'<div style="display:flex;align-items:flex-end;gap:16px;padding:20px 0 16px"><div style="flex:1 1 auto;display:flex;flex-direction:column;gap:4px">'
            f'<h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">{title}</h2><span style="color:var(--text-secondary)">{sub}</span></div>{right}</div>')
def wrap(key,cur,content,aside=''):
    return (f'<sc-if value="{{{{{key}}}}}" hint-placeholder-val="{{{{false}}}}"><div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0">'+snav(cur)+
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;padding:0 32px 40px"><div style="width:100%;max-width:{"760px" if not aside else "none"};display:flex;flex-direction:column;gap:24px">{content}</div></div>{aside}</div></sc-if>')

# =========== PROFIL FIRMY
NIPOK=sch(ic(CHECK,12,'var(--success)')+'suma kontrolna','NIP ma poprawną cyfrę kontrolną · dane z CEIDG pobrane 3 lis','var(--bg-surface)')
logo=('<div style="display:flex;align-items:center;gap:14px"><span aria-label="Logo firmy" role="img" style="width:64px;height:64px;border-radius:14px;background:#1B1A19;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:600">K</span>'
      '<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;gap:6px"><button type="button" class="sec" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--bg-surface);font-weight:500">'+ic(UPL,14)+'Zmień logo</button>'
      '<button type="button" class="ghost" style="height:32px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:var(--text-secondary)">Usuń</button></div>'
      '<span style="font-size:12px;color:var(--text-tertiary)">PNG lub JPG do 512 KB · w dokumentach zmniejszane do 512 px</span></div></div>')
prof=(head('Profil firmy','Dane sprzedawcy na ofertach, fakturach, protokołach i w widokach klienta.',sch(ic(HIST,12,'var(--text-tertiary)')+'wersja 4 · 3 lis','Ostatni zapis: Pascal Kranz, 3 lis 2026 18:42'))+
  section('Dane firmy',
    frow('Nazwa',inp('Kranz HVACR Pascal Kranz','Pełna nazwa firmy'),'Pełna nazwa z CEIDG')+sep()+
    frow('Nazwa skrócona',inp('Kranz HVACR','Nazwa skrócona'),'Nagłówek dokumentów i SMS-y')+sep()+
    frow('NIP','<div style="display:flex;align-items:center;gap:8px">'+inp('123-456-32-18','NIP','180px',mono=True)+NIPOK+'</div>','Przykładowy — wpisz swój')+sep()+
    frow('Adres','<div style="display:grid;grid-template-columns:minmax(0,1fr) 110px minmax(0,1fr);gap:8px">'+inp('ul. Morska 81','Ulica i numer',icon=PIN)+inp('81-225','Kod pocztowy',mono=True)+inp('Gdynia','Miejscowość')+'</div>')+sep()+
    frow('Kontakt','<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px">'+inp('+48 58 500 12 40','Telefon',icon=PHONE)+inp('biuro@kranz-hvacr.pl','E-mail',icon=MAIL)+'</div>'+inp('kranz-hvacr.pl','Strona www',icon=GLOBE))+sep()+
    frow('Logo',logo))+
  section('Płatności',
    frow('Konto bankowe','<div style="display:flex;align-items:center;gap:8px">'+inp('PL61 •••• •••• •••• •••• •••• 2874','Numer konta IBAN (ukryty)',icon=BANK,mono=True)+ib('Pokaż','Pokaż pełny numer',LOCKI,32)+'</div>','Na fakturach i w przelewie z linku')+sep()+
    frow('Biała lista VAT','<div style="display:flex">'+sch(ic(CHECK,12,'var(--success)')+'konto na białej liście','Sprawdzone w wykazie podatników VAT 3 lis 2026','var(--bg-surface)')+'</div>','Sprawdzane przy każdej zmianie'))+
  section('Domyślne warunki ofert',
    frow('Ważność oferty',inp('14','Ważność oferty w dniach','120px',suffix='dni'),'1–365 dni')+sep()+
    frow('Wprowadzenie','<textarea rows="2" style="width:100%;padding:8px 10px;border:0;border-radius:10px;background:var(--bg-subtle);font:inherit;line-height:20px;color:var(--text-primary);resize:vertical">Dziękujemy za możliwość przygotowania oferty. Poniżej warianty dobrane po oględzinach.</textarea>','Pierwszy akapit oferty')+sep()+
    frow('Warunki','<textarea rows="3" style="width:100%;padding:8px 10px;border:0;border-radius:10px;background:var(--bg-subtle);font:inherit;line-height:20px;color:var(--text-primary);resize:vertical">Zaliczka 30 % po akceptacji, reszta po uruchomieniu, przelew 7 dni. Gwarancja na montaż 24 miesiące.</textarea>','Kopiowane do nowej oferty'))+
  '<div style="display:flex;align-items:center;gap:10px;padding-top:4px"><span style="flex:1 1 auto;display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:18px;color:var(--text-tertiary)">'+ic(INFO,14,'var(--text-tertiary)')+'<span>Zmiana profilu nie zmienia wystawionych dokumentów — każdy ma własną kopię danych sprzedawcy.</span></span>'
  '<button type="button" class="pri" title="Zapisz  ⌘S" style="height:32px;padding:0 14px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">Zapisz zmiany</button></div>')

# =========== UŻYTKOWNICY I ROLE
ROLEC={'Administrator':('#5E6AD2',LOCKI),'Biuro':('#2BB3B1',BLD),'Technik':('#E0702A','<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>'),'Klient':('#8A8F98',HOME if 'HOME' in globals() else USER)}
def role(r): c,i=ROLEC[r]; return sch(ic(i,12,c)+r,{'Administrator':'Cały program + konta, role, blokady i historia dostępu','Biuro':'Cały CRM, dodawanie i edycja, import; bez zarządzania dostępem','Technik':'Przypisani klienci i instalacje, własne wizyty i protokoły','Klient':'Portal: własne instalacje i udostępnione dokumenty'}[r])
UC='minmax(0,1fr) 112px 132px 52px'
def urow(av,name,mail,r,scope,state,last,sel=False):
    stc={'act':('var(--success)','Aktywne'),'inv':('var(--warning)','Zaproszenie'),'blk':('var(--danger)','Zablokowane')}[state[0]]
    st=sch(dot(stc[0])+(state[1] or stc[1]),state[2])
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{UC};column-gap:12px;align-items:center;min-height:48px;padding:0 10px;border-radius:10px;{"background:var(--bg-subtle);" if sel else ""}">'
            f'<span role="cell" style="display:flex;align-items:center;gap:10px;min-width:0">{av}<span style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:500">{name}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{mail}{scope}</span></span></span>'
            f'<span role="cell">{role(r)}</span><span role="cell">{st}</span>'
            f'<span role="cell" class="num" style="text-align:right;font-size:12px;color:var(--text-tertiary)">{last}</span></div>')
mail_av=lambda: f'<span style="width:24px;height:24px;border-radius:50%;background:var(--bg-subtle);display:inline-flex;align-items:center;justify-content:center">{ic(MAIL,12,"var(--text-tertiary)")}</span>'
cav24=lambda i,c: cav(i,c,24,10)
allc=lambda: ''
users=(head('Użytkownicy i role','Kto ma dostęp do Avero i do czego. Uprawnienia sprawdza baza danych przy każdym odczycie.',
   '<button type="button" class="pri" title="Zaproś użytkownika  I" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(PLUS,14)+'Zaproś</button>')+
  '<div style="display:flex;align-items:center;gap:6px;margin-top:-8px">'+''.join(f'<a href="#" class="sec" style="height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:14px;{"background:var(--bg-subtle);color:var(--text-primary);font-weight:500" if i==0 else "color:var(--text-secondary)"}">{t}<span class="num" style="color:var(--text-tertiary)">{n}</span></a>' for i,(t,n) in enumerate([('Pracownicy','7'),('Klienci','12'),('Zaproszenia','2')]))+'</div>'
  '<div role="table" aria-label="Użytkownicy" style="display:flex;flex-direction:column">'
  f'<div role="row" style="display:grid;grid-template-columns:{UC};column-gap:12px;height:24px;align-items:center;padding:0 10px;font-size:12px;color:var(--text-tertiary)"><span>Osoba</span><span>Rola</span><span>Dostęp</span><span style="text-align:right">Ostatnio</span></div>'+
  urow(cav24('PK','#1B1A19'),'Pascal Kranz','pascal@kranz-hvacr.pl','Administrator',allc(),('act','','Jedyny administrator — nie można go zablokować ani zmienić roli'),'teraz')+
  urow(cav24('AW',AWC),'Agnieszka Wiśniewska','biuro@kranz-hvacr.pl','Biuro',allc(),('act','','Aktywne'),'8 min')+
  urow(cav24('TL',TL),'Tomasz Lewandowski','t.lewandowski@kranz-hvacr.pl','Technik',' · 14 klientów',('act','','Aktywne'),'1 h')+
  urow(cav24('MZ',MZC),'Mateusz Zieliński','m.zielinski@kranz-hvacr.pl','Technik',' · 11 klientów',('act','','Aktywne'),'22 min')+
  urow(cav24('KN',KN),'Kacper Nowak','k.nowak@kranz-hvacr.pl','Technik',' · 9 klientów',('act','','Aktywne'),'dziś')+
  urow(cav24('PD',PD),'Piotr Dąbrowski','p.dabrowski@kranz-hvacr.pl','Technik',' · 8 klientów',('act','','Aktywne'),'dziś',sel=True)+
  urow(mail_av(),'j.kowalczyk@galeriabaltycka.pl','zaproszenie od Agnieszki, 18 lis','Klient',' · Galeria Bałtycka',('inv','wygasa za 5 dni','Zaproszenie ważne 7 dni · e-mail przekazany do poczty 18 lis 9:12'),'—')+
  urow(cav24('SM','#8A8F98'),'Sebastian Malinowski','s.malinowski@kranz-hvacr.pl','Technik',' · 6 klientów',('blk','','Zablokowane 2 paź przez Pascala Kranza · traci dostęp także w otwartej sesji'),'2 paź')+
  '</div>'+
  section('Uprawnienia ról',
    '<div role="table" aria-label="Uprawnienia ról" style="display:flex;flex-direction:column">'
    '<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) repeat(4,80px);height:32px;align-items:center;font-size:12px;color:var(--text-tertiary)"><span></span>'+''.join(f'<span style="text-align:center">{r}</span>' for r in ROLEC)+'</div>'+
    ''.join(f'<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) repeat(4,80px);min-height:34px;align-items:center;border-top:1px solid var(--edge)"><span>{n}</span>'+''.join(f'<span style="display:flex;justify-content:center">{ic(CHECK,14,"var(--success)") if v=="y" else (sch("swoje","Tylko przypisane / własne") if v=="o" else "<span style=\"color:var(--text-tertiary)\">—</span>")}</span>' for v in vals)+'</div>'
            for n,vals in [('Klienci, instalacje, urządzenia','yyoo'),('Zlecenia, wizyty, protokoły','yyoo'),('Oferty i ceny sprzedaży','yy––'),('Katalog i ceny zakupu','yy––'),('Faktury i raporty','yy––'),('Import CSV','yy––'),('Konta, role, blokady','y–––')])+'</div>'))
uaside=('<aside aria-label="Piotr Dąbrowski" style="flex:0 0 300px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:16px 12px 24px">'
  '<div style="display:flex;align-items:center;gap:10px;padding:0 8px">'+cav('PD',PD,36,13)+'<span style="display:flex;flex-direction:column"><span style="font-weight:600;font-size:15px">Piotr Dąbrowski</span><span style="font-size:12px;color:var(--text-tertiary)">p.dabrowski@kranz-hvacr.pl</span></span></div>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Dostęp')+
  prop(LOCKI,'Rola','Zmiana roli wymaga potwierdzenia i unieważnia oczekujące zaproszenia tego adresu',role('Technik'))+
  prop(USERS,'8 klientów','Hotel Oliwski, Piekarnia Rogal, Delikatesy Morskie i 5 innych · obejmuje ich obiekty, instalacje i urządzenia',sch('+ Przypisz','Dodaj klienta'))+
  prop(TRUCK,'Bus PD · GD 4N218','Magazyn w samochodzie: stany i minimum w module Magazyn')+'</section>'
  '<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Kolor osoby')+
  '<div style="display:flex;gap:8px;padding:0 8px">'+''.join(f'<button type="button" aria-label="Kolor {c}" style="width:24px;height:24px;border:0;border-radius:50%;background:{c};{"box-shadow:0 0 0 2px var(--bg-surface),0 0 0 4px "+c if c==PD else ""}"></button>' for c in [MZC,TL,KN,PD,'#C98A12','#D6453D','#2F9E5B'])+'</div>'
  '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Awatar, bloki w planowaniu, trasa na mapie, raporty</span></section>'
  '<section style="display:flex;flex-direction:column;gap:2px">'+ah3('Historia dostępu',CNT(3))+
  '<ol style="margin:0;padding:4px 8px;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:12px;line-height:16px;color:var(--text-secondary)">'
  '<li style="display:flex;gap:8px">'+ic(USERS,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto" title="Agnieszka Wiśniewska">Przypisano Piekarnię Rogal</span><span class="num" style="color:var(--text-tertiary)">12 lis</span></li>'
  '<li style="display:flex;gap:8px">'+ic(USERS,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto" title="Agnieszka Wiśniewska">Przypisano Hotel Oliwski</span><span class="num" style="color:var(--text-tertiary)">4 wrz</span></li>'
  '<li style="display:flex;gap:8px">'+ic(CHECK,14,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Przyjął zaproszenie (Technik)</span><span class="num" style="color:var(--text-tertiary)">2 mar</span></li></ol></section>'
  '<div style="padding:0 8px"><button type="button" class="ghost" title="Odbiera dostęp od razu, także w otwartej sesji; przypisania zostają" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:var(--danger);font-weight:500">'+ic(BAN,14,'var(--danger)')+'Zablokuj dostęp</button></div></aside>')

# =========== INTEGRACJE
def integ(icon,col,name,desc,state,stip,meta,act):
    sc={'ok':('var(--success)','Połączono'),'test':('var(--warning)','Tryb testowy'),'cfg':('var(--text-tertiary)','Wymaga konfiguracji'),'off':('var(--text-tertiary)','Wyłączone')}[state]
    return (f'<div style="display:flex;align-items:center;gap:14px;min-height:72px;padding:12px 16px;border-radius:12px;background:var(--bg-raised)">'
            f'<span style="width:40px;height:40px;flex:0 0 auto;border-radius:12px;background:var(--bg-surface);display:inline-flex;align-items:center;justify-content:center">{ic(icon,20,col)}</span>'
            f'<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px"><span style="display:flex;align-items:center;gap:8px"><span style="font-weight:600">{name}</span>{sch(dot(sc[0])+sc[1],stip,"var(--bg-surface)")}</span>'
            f'<span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{desc}</span><span style="display:flex;gap:4px;flex-wrap:wrap">{meta}</span></span>{act}</div>')
btn=lambda t,tip,pri=False: f'<button type="button" class="{"pri" if pri else "sec"}" title="{tip}" style="height:32px;padding:0 12px;border:0;border-radius:10px;background:{"var(--accent)" if pri else "var(--bg-surface)"};{"color:var(--on-accent);" if pri else ""}font-weight:500;white-space:nowrap">{t}</button>'
envc=lambda t: sch(ic(SERVER,12,'var(--text-tertiary)')+t,'Klucz trzymany wyłącznie na serwerze (zmienna środowiskowa) — nie da się go odczytać w przeglądarce','var(--bg-surface)')
integ_c=(head('Integracje','Płatności, faktury, poczta i mapa. Klucze dostępu są przechowywane tylko na serwerze — tu widać stan i test połączenia.')+
  '<div style="display:flex;flex-direction:column;gap:8px">'
  '<span style="font-size:12px;color:var(--text-tertiary)">Płatności i dokumenty</span>'+
  integ(CARD,'#2F9E5B','Przelewy24','Zaliczki i dopłaty z linku: BLIK, szybki przelew, karty, Apple Pay, Google Pay.','test','Sandbox — płatności nie są prawdziwe',
        envc('P24_*')+sch(ic(CHECK,12,'var(--success)')+'powiadomienia działają','Ostatnie potwierdzenie płatności z serwera P24: 18 lis 14:52','var(--bg-surface)'),btn('Przełącz na produkcję','Wymaga kluczy produkcyjnych w środowisku serwera i testowej płatności 1 zł'))+
  integ(CLOUD,'#5E6AD2','KSeF','Faktury dla firm (B2B) wysyłane do Krajowego Systemu e-Faktur.','cfg','Brak tokenu lub certyfikatu KSeF',
        sch(ic(INFO,12,'var(--text-tertiary)')+'B2C poza KSeF','Faktury dla konsumentów domyślnie poza KSeF','var(--bg-surface)')+sch('środowisko testowe najpierw','Najpierw połączenie z bramką testową KSeF','var(--bg-surface)'),btn('Skonfiguruj','Token z Aplikacji Podatnika KSeF lub certyfikat'))+
  '<span style="font-size:12px;color:var(--text-tertiary);padding-top:8px">Komunikacja</span>'+
  integ(MAIL,'#3B82D6','Poczta e-mail','Przypomnienia dla pracowników, oferty i faktury do klientów.','test','Tryb lokalny: wiadomości trafiają do testowej skrzynki Mailpit, nie do Internetu',
        envc('NOTIFICATION_MAIL_MODE=local')+sch('nadawca: nie zweryfikowany','Przed produkcją: zweryfikuj domenę nadawcy u dostawcy (Resend)','var(--bg-surface)'),btn('Wyślij test','Wyślij wiadomość testową na swój adres'))+
  integ(MSG,'#E0702A','SMS','Prośby o termin przeglądu, link do oferty, przypomnienie przed montażem.','cfg','Brak dostawcy SMS — przypomnienia SMS są wstrzymane',
        sch(ic(WARN,12,'var(--warning)')+'3 funkcje czekają','Akceptacja oferty (SMS z linkiem), prośba o termin przeglądu, SMS przed montażem','var(--bg-surface)'),btn('Wybierz dostawcę','Np. SMSAPI lub SerwerSMS — wymaga zgody właściciela na nową usługę'))+
  '<span style="font-size:12px;color:var(--text-tertiary);padding-top:8px">Mapa i dane</span>'+
  integ(MAPI,'#2BB3B1','Mapa i geokodowanie','OpenStreetMap: adresy klientów na mapie, czasy dojazdu w planowaniu.','ok','Nominatim z pamięcią podręczną adresów',
        sch(ic(CHECK,12,'var(--success)')+'312 adresów','Zgeokodowane adresy w pamięci podręcznej','var(--bg-surface)')+sch('limit 1 zapytanie / s','Zasady publicznego Nominatim — przy większym ruchu własny serwer lub płatny dostawca','var(--bg-surface)'),btn('Szczegóły','Pokaż nierozpoznane adresy'))+
  integ(BLD,'var(--text-secondary)','Biała lista VAT i CEIDG','Sprawdzanie NIP i kont bankowych kontrahentów przy dodawaniu firmy.','ok','Publiczne API Ministerstwa Finansów',
        sch(ic(CHECK,12,'var(--success)')+'dziś 9:02','Ostatnie sprawdzenie','var(--bg-surface)'),btn('Szczegóły','Historia sprawdzeń'))+
  '</div>')

H=['<sc-if value="{{isUst}}" hint-placeholder-val="{{false}}">',
   wrap('isUstP','profil',prof),wrap('isUstU','uz',users,uaside),wrap('isUstI','int',integ_c),'</sc-if>']
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("const nS = navv(isSz);","const isUst = ekran === 'ustawienia'; const ustV = this.props.ust ?? 'profil firmy'; const nS = navv(isSz || isUst);")
rep("actS: nS.act,","actS: nS.act, isUst, isUstP: isUst && ustV === 'profil firmy', isUstU: isUst && ustV === 'użytkownicy', isUstI: isUst && ustV === 'integracje',")
rep('"raporty", "planowanie"]','"raporty", "ustawienia", "planowanie"]')
rep(', "krok": {',', "ust": {"editor": "enum", "options": ["profil firmy", "użytkownicy", "integracje"], "default": "profil firmy", "section": "Widok"}, "krok": {')
a0='title="Anna Wiśniewska · Biuro" style="width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;padding:0"><span style="width:24px;height:24px;border-radius:50%;background:var(--bg-surface);border:0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;color:var(--text-secondary)">AW</span>'
rep(a0,a0.replace('Anna Wiśniewska · Biuro','{{meTitle}}').replace('>AW</span>','>{{meIni}}</span>'))
rep("actS: nS.act, isUst,","actS: nS.act, meIni: isUst ? 'PK' : 'AW', meTitle: isUst ? 'Pascal Kranz · Administrator' : 'Agnieszka Wiśniewska · Biuro', isUst,")
open(P,'w').write(s); print('ok',len(s))
