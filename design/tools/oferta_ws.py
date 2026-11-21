# exec'd inside oferta.py — builds steps 4 (Warunki) and 5 (Wysyłka)
BELL='<path d="M10.27 21a2 2 0 0 0 3.46 0"></path><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"></path>'
MSG='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>'
SIGN='<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
CARD='<rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path>'
COPY='<rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>'
TRUCK='<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>'
LOCKI='<rect width="18" height="11" x="3" y="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
USERS='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
XX='<path d="M18 6 6 18M6 6l12 12"></path>'

def tog(on,label):
    bg='var(--accent)' if on else 'var(--border-strong)'
    x=12 if on else 2
    return (f'<button type="button" role="switch" aria-checked="{str(on).lower()}" aria-label="{label}" title="{label}" style="position:relative;width:28px;height:16px;flex:0 0 auto;border:0;border-radius:8px;background:{bg};padding:0">'
            f'<span aria-hidden="true" style="position:absolute;top:2px;left:{x}px;width:12px;height:12px;border-radius:6px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2)"></span></button>')
def seg(opts,sel,label):
    b=''
    for i,(t,tip) in enumerate(opts):
        on=i==sel
        b+=(f'<button type="button" role="radio" aria-checked="{str(on).lower()}" title="{tip}" style="height:28px;padding:0 12px;border:0;border-radius:8px;'
            f'background:{"var(--bg-surface)" if on else "transparent"};color:{"var(--text-primary)" if on else "var(--text-secondary)"};font-weight:{500 if on else 400};{"box-shadow:0 1px 2px rgba(0,0,0,.06);" if on else ""}white-space:nowrap">{t}</button>')
    return f'<div role="radiogroup" aria-label="{label}" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">{b}</div>'
def field(icon,val,label,w='auto',suffix=''):
    sfx=f'<span style="color:var(--text-tertiary)">{suffix}</span>' if suffix else ''
    return (f'<label title="{label}" style="height:32px;width:{w};display:inline-flex;align-items:center;gap:8px;padding:0 10px;border-radius:10px;background:var(--bg-subtle);white-space:nowrap">'
            f'{ic(icon,14,"var(--text-tertiary)")}<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">{label}</span><span class="num">{val}</span>{sfx}</label>')
def line(icon,icol,txt,right='',tip='',sub=''):
    s2=f'<span class="num" style="font-size:12px;color:var(--text-tertiary);white-space:nowrap">{sub}</span>' if sub else ''
    return (f'<div title="{tip}" style="display:flex;align-items:center;gap:10px;min-height:36px;padding:2px 8px;border-radius:10px">'
            f'<span style="display:inline-flex">{ic(icon,16,icol)}</span><span class="ell" style="flex:0 1 auto">{txt}</span>{s2}{SP}{right}</div>')
def card(inner,pad='8px 4px'):
    return f'<div style="display:flex;flex-direction:column;padding:{pad};border-radius:12px;background:var(--bg-raised)">{inner}</div>'
def slot(d,days,sel,note,ok=True):
    ring='box-shadow:inset 0 0 0 2px var(--accent);' if sel else ''
    st=sch(dot('var(--success)' if ok else 'var(--warning)')+('Sprzęt na czas' if ok else 'Ryzyko'),note,'var(--bg-surface)')
    return (f'<button type="button" role="radio" aria-checked="{str(sel).lower()}" class="sec" style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:0;border-radius:12px;background:var(--bg-raised);{ring}text-align:left">'
            f'<span style="display:flex;align-items:center;gap:8px;width:100%">{ic(CAL,14,"var(--text-tertiary)")}<span class="num" style="flex:1 1 auto;font-weight:500">{d}</span>'
            f'<span style="display:inline-flex">{cav("TL",TL)}<span style="margin-left:-4px;display:inline-flex">{cav("MZ","#3B82D6")}</span></span></span>'
            f'<span style="display:flex;gap:4px">{sch(days,"Dni montażu","var(--bg-surface)")}{st}</span></button>')
def body(): a('<div style="display:flex;flex-direction:column;gap:28px;padding:0 24px 32px;max-width:960px">')

# ===================== KROK 4: WARUNKI
a('<sc-if value="{{isOfW}}" hint-placeholder-val="{{false}}">'); body()
a('<section style="display:flex;flex-direction:column;gap:10px">'+h3('Płatność')+
  '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
  seg([('Po montażu','Całość po uruchomieniu'),('Zaliczka i reszta','Zaliczka po akceptacji, reszta po uruchomieniu'),('Etapy','Własny harmonogram płatności')],1,'Model płatności')+
  field(WALLET,'30','Zaliczka','',' %')+field(CLOCK,'7','Termin płatności','',' dni')+
  sch(dot('var(--success)')+'Przelew','Przelew na konto firmowe')+sch(ic(CARD,12,'var(--text-tertiary)')+'Online','BLIK, karta, szybki przelew — klient płaci zaliczkę przy akceptacji')+'</div>'+
  card(line(WALLET,'var(--text-tertiary)','Po akceptacji','<span class="num" style="font-weight:500">14 262,48 zł</span>','Zaliczka 30 % kwoty brutto · płatna online lub przelewem w 7 dni','zaliczka 30 %')+
       line(CHECK,'var(--text-tertiary)','Po uruchomieniu','<span class="num" style="font-weight:500">33 279,12 zł</span>','Pozostałe 70 % · faktura po podpisaniu protokołu uruchomienia','reszta 70 %'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:10px">'+h3('Termin montażu',SP+ghost(ic(CAL,14)+'Planowanie','Pokaż wolne terminy w planowaniu  G P'))+
  '<div role="radiogroup" aria-label="Proponowany termin" style="display:flex;gap:8px">'+
  slot('30 lis – 1 gru','2 dni',True,'Jednostka zewnętrzna dotrze 20 lis')+
  slot('7 – 8 gru','2 dni',False,'Zapas 17 dni na dostawę')+
  slot('14 – 15 gru','2 dni',False,'Zapas 24 dni na dostawę')+'</div>'+
  '<div style="display:flex;align-items:center;gap:10px;padding:0 8px;min-height:32px">'+ic(USERS,16,'var(--text-tertiary)')+'<span style="flex:1 1 auto">Klient wybiera termin przy akceptacji</span>'+sch('2 terminy','Klient zobaczy dwa pierwsze terminy; rezerwacja w planowaniu na 48 h')+tog(True,'Klient wybiera termin')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Gwarancja i serwis')+
  card(line(AWARD,'#C98A12','Gwarancja producenta 5 lat',sch(ic(CYCLE if 'CYCLE' in globals() else CLOCK,12,'var(--text-tertiary)')+'przegląd 12 mies.','Warunek gwarancji: coroczny przegląd przez autoryzowanego instalatora','var(--bg-surface)'),'Daikin Stand By Me — rejestracja po uruchomieniu')+
       line(WRENCH,'#9B6BE0','Gwarancja na montaż',field(CLOCK,'24','Gwarancja na montaż','',' mies.').replace('background:var(--bg-subtle)','background:var(--bg-surface)'),'Gwarancja wykonawcy na prace instalacyjne')+
       line(SHIELD,'#2BB3B1','Umowa serwisowa jako opcja','<span class="num" style="color:var(--text-secondary)">590,00 zł/rok</span>'+tog(True,'Dodaj umowę serwisową jako opcję'),'Przegląd roczny + kontrola szczelności · klient zaznacza w akceptacji','netto'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:10px">'+h3('Dokumenty w ofercie',CNT(4))+
  '<div style="display:flex;flex-wrap:wrap;gap:6px">'+
  capd(ic(CHECK,14,'var(--success)')+'Karty katalogowe','Dołączone do każdego wariantu')+capd(ic(CHECK,14,'var(--success)')+'Deklaracje CE','Deklaracje zgodności')+
  capd(ic(CHECK,14,'var(--success)')+'OWU','Ogólne warunki umowy, wersja 2026/1')+capd(ic(CHECK,14,'var(--success)')+'OZC','Obliczenie obciążenia cieplnego')+
  capd(ic(LOCKI,14,'var(--text-tertiary)')+'<span style="color:var(--text-tertiary)">Zdjęcia z oględzin</span>','Tylko wewnętrznie — nie trafią do klienta')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Wiadomość w ofercie',SP+ghost(ic(SPARK,14,'var(--accent)')+'Popraw ton','Avero: krócej / bardziej technicznie'))+
  '<label for="of-note" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Wiadomość widoczna na początku oferty</label>'
  '<textarea id="of-note" rows="3" style="width:100%;padding:10px 12px;border:0;border-radius:12px;background:var(--bg-subtle);font:inherit;color:var(--text-primary);resize:vertical;line-height:20px">Polecamy wariant B: pokrywa zapotrzebowanie domu z zapasem i pracuje cicho. Montaż zajmie 2 dni, a ogrzewanie wyłączymy tylko na kilka godzin w drugim dniu.</textarea></section>')
a('</div></sc-if>')

# ===================== KROK 5: WYSYŁKA
a('<sc-if value="{{isOfS}}" hint-placeholder-val="{{false}}">'); body()
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Sprawdzenie',sch(dot('var(--success)')+'4 z 5','4 punkty w porządku, 1 do decyzji'))+
  card(line(CHECK,'var(--success)','Ceny z aktualnego cennika','','Cennik Daikin 11/2026 i Panasonic 10/2026','11/2026')+
       line(CHECK,'var(--success)','Marża powyżej progu','','Wariant B 25,5 %, A 23,1 %, C 27,9 % · próg 22 %','25,5 %')+
       line(TRUCK,'var(--success)','Sprzęt zdąży przed montażem','','Jednostka zewnętrzna 20 lis · montaż od 30 lis','20 lis')+
       line(CHECK,'var(--success)','Dane kontaktowe klienta','','E-mail i telefon potwierdzone na oględzinach')+
       '<div style="display:flex;align-items:center;gap:10px;min-height:40px;padding:2px 4px 2px 8px;border-radius:10px">'+ic(WARN,16,'var(--warning)')+'<span style="flex:1 1 auto;min-width:0">Wariant A nie ma bufora, a instalacja ma zawory termostatyczne.</span>'
       '<button type="button" class="sec" title="Dodaj bufor 50 l do wariantu A (+2 380,00 zł)" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500;font-size:12px;white-space:nowrap">Dodaj bufor</button>'
       '<button type="button" class="ghost" title="Wyślij bez zmian" style="height:28px;padding:0 10px;border:0;border-radius:8px;color:var(--text-secondary);font-size:12px">Zostaw</button></div>')+'</section>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Odbiorca')+
  '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
  capd(ic(HOME,14,'var(--text-tertiary)')+'Marek Zieliński','Klient · KL-0388')+
  capd(ic(AT,14,'var(--text-tertiary)')+'m.zielinski@poczta.onet.pl','E-mail z linkiem do oferty')+tog(True,'Wyślij e-mail')+
  '<span style="width:8px"></span>'+capd(ic(MSG,14,'var(--text-tertiary)')+'SMS','SMS z linkiem na +48 604 219 553')+tog(True,'Wyślij SMS')+
  '<span style="width:8px"></span>'+capd(cav('TL',TL)+'DW','Kopia do opiekuna: Tomasz Lewandowski','0 10px 0 4px')+'</div></section>')
a('<section style="display:flex;flex-direction:column;gap:8px">'+h3('Wiadomość')+
  '<div style="display:flex;flex-direction:column;border-radius:12px;background:var(--bg-subtle)">'
  '<label style="display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border-bottom:1px solid var(--edge)"><span style="color:var(--text-tertiary)">Temat</span><input value="Oferta OF-2026-118 — pompa ciepła do domu w Rumi" style="flex:1 1 auto;min-width:0;height:32px;border:0;background:transparent;font:inherit;color:var(--text-primary);outline:none"></label>'
  '<label for="of-mail" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Treść wiadomości</label>'
  '<textarea id="of-mail" rows="7" style="padding:10px 12px;border:0;background:transparent;font:inherit;line-height:20px;color:var(--text-primary);resize:vertical;outline:none">Dzień dobry,\n\nprzesyłam ofertę na pompę ciepła po naszych oględzinach. W linku można porównać trzy warianty, wybrać opcje i termin montażu, a potem zaakceptować ofertę online.\n\nPozdrawiam\nTomasz Lewandowski · Kranz HVACR · +48 501 337 214</textarea>'
  '<div style="display:flex;align-items:center;gap:8px;height:40px;padding:0 8px 0 12px;border-top:1px solid var(--edge)">'+ic(LINK,14,'var(--text-tertiary)')+'<span class="mono" style="flex:1 1 auto;font-size:12px;color:var(--text-secondary)">oferta.kranz-hvacr.pl/7Kq2-xR9m</span>'+
  sch(ic(CLOCK,12,'var(--text-tertiary)')+'do 2 gru','Link wygasa razem z ofertą','var(--bg-surface)')+ib('Kopiuj link','Kopiuj link',COPY,28)+'</div></div></section>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Akceptacja online',SP+ghost(ic(EYE,14)+'Widok klienta','Otwórz ofertę tak, jak zobaczy ją klient  ⌘⇧P'))+
  card(line(LAYERS,'#3B82D6','Klient wybiera',seg([('Jeden wariant','Wybór wariantu odrzuca pozostałe'),('Kilka','Np. przy kilku urządzeniach')],0,'Liczba wariantów').replace('var(--bg-subtle)','var(--bg-surface)').replace('background:var(--bg-surface);color:var(--text-primary)','background:var(--bg-raised);color:var(--text-primary)'))+
       line(SIGN,'#9B6BE0','Podpis na ekranie',tog(True,'Wymagaj podpisu'),'Podpis palcem lub myszą + potwierdzenie kodem SMS')+
       line(CARD,'#2F9E5B','Zaliczka online przy akceptacji','<span class="num" style="color:var(--text-secondary)">14 262,48 zł</span>'+tog(True,'Zaliczka online'),'BLIK, karta, szybki przelew')+
       line(CAL,'#E0702A','Wybór terminu montażu',tog(True,'Wybór terminu'),'30 lis – 1 gru lub 7 – 8 gru'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Przypomnienia',CNT(3))+
  card(line(MSG,'var(--text-tertiary)','Nieotwarta po 3 dniach',sch('SMS','SMS do klienta','var(--bg-surface)')+tog(True,'Przypomnienie: nieotwarta'),'Przypomnienie SMS z linkiem')+
       line(PHONE,'var(--text-tertiary)','Otwarta, bez decyzji po 5 dniach',sch(cav('TL',TL,14,7)+'Telefon','Zadanie dla Tomasza: zadzwoń do klienta','var(--bg-surface)')+tog(True,'Zadanie: telefon'),'Avero tworzy zadanie dla opiekuna')+
       line(BELL,'var(--text-tertiary)','2 dni przed wygaśnięciem',sch('E-mail','E-mail do klienta','var(--bg-surface)')+tog(True,'Przypomnienie: wygaśnięcie'),'30 listopada'))+'</section>')
a('<div style="display:flex;align-items:center;gap:8px">'
  '<button type="button" class="pri" title="Wyślij ofertę  ⌘↵" style="height:36px;display:inline-flex;align-items:center;gap:8px;padding:0 16px 0 12px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">'+ic(SEND2,16)+'Wyślij ofertę</button>'
  '<button type="button" class="sec" title="Zaplanuj wysyłkę, np. jutro 8:00" style="height:36px;display:inline-flex;align-items:center;gap:8px;padding:0 14px 0 12px;border:0;border-radius:10px;background:var(--bg-subtle);font-weight:500">'+ic(CLOCK,16)+'Zaplanuj</button>'
  '<span style="font-size:12px;color:var(--text-tertiary);margin-left:8px">Po wysłaniu zmiany tworzą nową wersję oferty</span></div>')
a('</div></sc-if>')

# ===================== PO AKCEPTACJI
SIGPATH='<path d="M4 30c6-14 10-20 13-18s-4 16 0 15 9-17 12-15-2 13 2 12 6-8 9-8 2 6 6 5 8-6 12-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>'
def obj(code,tip):
    return sch(f'<span class="mono" style="font-size:11px">{code}</span>',tip,'var(--bg-surface)')
def done(icon,col,txt,right,tip,time):
    return line(icon,col,txt,right+f'<span class="num" style="width:44px;text-align:right;font-size:12px;color:var(--text-tertiary)">{time}</span>',tip)
a('<sc-if value="{{isOfA}}" hint-placeholder-val="{{false}}">'); body()
a('<div style="display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:12px;background:var(--bg-raised)">'
  '<div style="display:flex;align-items:center;gap:10px">'+ic(CHECK,18,'var(--success)')+'<span style="flex:1 1 auto;font-weight:500">Marek Zieliński zaakceptował wariant B z demontażem kotła</span><span class="num" title="Środa, 18 listopada 2026, 14:51" style="font-size:12px;color:var(--text-tertiary)">dziś 14:51</span></div>'
  '<div style="display:flex;align-items:center;gap:12px;padding-left:28px">'
  '<span title="Podpis klienta · 14:51 · IP i urządzenie zapisane w historii" style="width:120px;height:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:var(--bg-surface);color:var(--text-primary)"><svg width="96" height="36" viewBox="0 0 80 40" aria-label="Podpis klienta">'+SIGPATH+'</svg></span>'
  '<span style="display:flex;flex-wrap:wrap;gap:6px">'+
  sch(ic(CARD,12,'var(--success)')+'Zaliczka opłacona','14 262,48 zł · BLIK przez Przelewy24 · 14:52','var(--bg-surface)')+
  sch(ic(CAL,12,'var(--text-tertiary)')+'30 lis – 1 gru','Termin wybrany przez klienta','var(--bg-surface)')+
  sch(ic(SHIELD,12,'var(--text-tertiary)')+'Zgoda na wcześniejszy montaż','Klient zażądał rozpoczęcia prac przed upływem 14 dni na odstąpienie (umowa na odległość)','var(--bg-surface)')+
  sch(ic(FILE,12,'var(--text-tertiary)')+'Umowa PDF','Potwierdzenie i umowa wysłane klientowi e-mailem','var(--bg-surface)')+'</span></div></div>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Avero wykonał',CNT(6))+
  card(done(WRENCH,'#9B6BE0','Utworzono zlecenie montażu',obj('ZS-1052','Montaż pompy ciepła · Dębogórska 31, Rumia'),'Zakres i pozycje z wariantu B','14:51')+
       done(BOX,'#3B82D6','Zarezerwowano w magazynie',sch('3 pozycje','Moduł EHVH08S23E6V, sterownik Madoka, bufor 50 l · magazyn główny','var(--bg-surface)'),'Rezerwacja do dnia montażu','14:51')+
       done(TRUCK,'#E0702A','Zamówiono u dystrybutora',obj('ZK/2026/11/031','Jednostka ERGA08EV + fundament · dostawa 20 lis')+sch(ic(CAL,12,'var(--text-tertiary)')+'20 lis','Potwierdzona data dostawy','var(--bg-surface)'),'Zamówienie wysłane do dystrybutora','14:52')+
       done(CAL,'#2BB3B1','Zaplanowano montaż',f'<span style="display:inline-flex">{cav("TL",TL)}<span style="margin-left:-4px;display:inline-flex">{cav("MZ","#3B82D6")}</span></span>'+sch('30 lis – 1 gru','2 dni w planowaniu','var(--bg-surface)'),'Bloki w planowaniu Tomasza i Mateusza','14:52')+
       done(WALLET,'#2F9E5B','Wystawiono fakturę zaliczkową',obj('FZ/2026/11/014','14 262,48 zł brutto · opłacona · wysłana klientowi'),'Faktura zaliczkowa do opłaconej zaliczki','14:52')+
       done(LAYERS,'var(--text-tertiary)','Warianty A i C zamknięte',sch('Odrzucone','Klient wybrał wariant B','var(--bg-surface)'),'Zostają w historii oferty','14:51'))+'</section>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Do decyzji',CNT(1))+
  '<div style="display:flex;align-items:center;gap:10px;min-height:44px;padding:4px 4px 4px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(WARN,16,'var(--warning)')+
  '<span style="flex:1 1 auto;min-width:0">Demontaż kotła wymaga odcięcia gazu przez instalatora z uprawnieniami gazowymi.</span>'
  '<button type="button" class="sec" title="Przypisz podwykonawcę do zlecenia ZS-1052" style="height:28px;padding:0 10px;border:0;border-radius:8px;background:var(--bg-surface);font-weight:500;font-size:12px;white-space:nowrap">Przypisz instalatora</button></div></section>')
a('<section style="display:flex;flex-direction:column;gap:4px">'+h3('Dalej')+
  card(line(SEND2,'var(--text-tertiary)','Przypomnienie dla klienta przed montażem',sch('27 lis','SMS 3 dni przed montażem','var(--bg-surface)'),'Automatyczny SMS z godziną przyjazdu ekipy')+
       line(SHIELD,'var(--text-tertiary)','Karta urządzenia z protokołu uruchomienia',sch('CRO: nie dotyczy','R32 1,5 kg = 1,01 t CO₂e, poniżej 5 t — karta w CRO nie jest wymagana','var(--bg-surface)'),'Numery seryjne, ładunek i parametry z telefonu technika')+
       line(WALLET,'var(--text-tertiary)','Faktura końcowa',sch('33 279,12 zł','Po podpisaniu protokołu odbioru','var(--bg-surface)'),'Rozliczenie z zaliczką'))+'</section>')
a('</div></sc-if>')
