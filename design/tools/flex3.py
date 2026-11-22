# Warstwa elastyczna, etap 3: zakładka Widoki (edytor zapisanego widoku z podglądem) i import z pliku do własnej tabeli.
# Scenariusz: piątek 20 lis 2026, 18:40. Pascal (administrator) porządkuje tabelę Przetargi.
FX_SRC=open('design/tools/flex.py').read()
exec(FX_SRC.split('# =================== PRZETARGI — lista')[0])          # helpery, ikony, s (Main)
exec(FX_SRC[FX_SRC.index('def thead(cur):'):FX_SRC.index('# =================== POLA')])
F2=open('design/tools/flex2.py').read()
exec(F2[F2.index('def field('):F2.index('# =================== KREATOR')])
UP='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5M12 3v12"></path>'
SORT='<path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"></path>'
LAYERS='<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12M2 17l8.58 3.91a2 2 0 0 0 1.66 0L21 17"></path>'
SIGMA='<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"></path>'
ARROW='<path d="M5 12h14M12 5l7 7-7 7"></path>'
CHECK='<path d="M20 6 9 17l-5-5"></path>'
FILTER='<path d="M20 7h-9M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle>'
DL='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5M12 15V3"></path>'
def seg(items,cur):
    return ('<span role="radiogroup" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle)">'+
            ''.join(f'<span role="radio" aria-checked="{"true" if i==cur else "false"}" style="height:26px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border-radius:8px;font-size:12px;white-space:nowrap;{"background:var(--bg-surface);color:var(--text-primary);font-weight:500" if i==cur else "color:var(--text-secondary)"}">{ic(icn,14) if icn else ""}{t}</span>' for i,(icn,t) in enumerate(items))+'</span>')
def pill(t,tip=''): return f'<span title="{tip}" style="height:26px;display:inline-flex;align-items:center;gap:4px;padding:0 10px;border-radius:13px;background:var(--bg-surface);box-shadow:inset 0 0 0 1px var(--border-strong);font-size:12px;white-space:nowrap">{t}</span>'
def word(t): return f'<span style="font-size:12px;color:var(--text-secondary);white-space:nowrap">{t}</span>'
def blk(title,icon,body,extra=''):
    return (f'<section style="display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:12px;background:var(--bg-raised)">'
            f'<div style="display:flex;align-items:center;gap:8px">{ic(icon,14,"var(--text-tertiary)")}<span style="font-size:12px;font-weight:500;color:var(--text-secondary)">{title}</span>{SP}{extra}</div>{body}</section>')

# =================== WIDOKI
W=[];w=W.append
w('<sc-if value="{{isTbW}}" hint-placeholder-val="{{false}}">')
w(thead(1))
w('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0">')
# lista widoków
def vrow(icon,name,sub,n,sel=False,lock=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="option" aria-selected="{str(sel).lower()}" class="row" style="display:grid;grid-template-columns:16px 16px minmax(0,1fr) auto;column-gap:8px;align-items:center;min-height:36px;padding:0 10px;border-radius:10px;{bg}">'
            f'<span title="Przeciągnij — kolejność kapsułek nad listą" style="display:inline-flex">{ic(GRIP,14,"var(--text-tertiary)")}</span>{ic(icon,14,"var(--ic-violet)")}'
            f'<span class="ell" title="{sub}" style="font-weight:{500 if sel else 400}">{name}</span>'
            f'<span class="num" style="font-size:12px;color:var(--text-tertiary)">{n}</span></div>')
w('<div role="listbox" aria-label="Widoki tabeli Przetargi" style="flex:0 0 272px;min-width:0;display:flex;flex-direction:column;gap:2px;padding:4px 8px 24px 16px">')
w('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">Wspólne · widzi każdy z dostępem</div>')
w(vrow(LIST,'W toku','Tabela · domyślny','4'))
w(vrow(LIST,'Do złożenia w 14 dni','Tabela · termin rosnąco','2',sel=True))
w(vrow(LIST,'Wszystkie 2026','Tabela · grupy wg statusu','15'))
w('<div style="display:flex;align-items:center;gap:8px;height:28px;padding:12px 10px 0;font-size:12px;color:var(--text-tertiary)">Osobiste · tylko Pascal</div>')
w(vrow(BOARD,'Etapy','Kanban wg statusu','6'))
w(vrow(CAL,'Terminy','Kalendarz · termin składania','4'))
w('<button type="button" class="sec" title="Nowy widok z obecnych ustawień  ⇧N" style="margin-top:8px;height:28px;display:inline-flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:var(--text-secondary);font-size:12px">'+ic(PLUS,14)+'Nowy widok</button>')
w('<p style="margin:8px 10px 0;font-size:12px;line-height:16px;color:var(--text-tertiary)">Widok zapisuje filtry, kolumny, sortowanie i grupowanie — nie zmienia danych ani uprawnień. Ukryte pole nie pojawi się w widoku osoby, która go nie widzi.</p>')
w('</div>')
# edytor
w('<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:12px;padding:4px 16px 24px 8px">')
w(field('Nazwa','Do złożenia w 14 dni'))
w('<div style="display:flex;align-items:flex-end;gap:16px">'+
  '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-secondary)">Rodzaj</span>'+seg([(LIST,'Tabela'),(BOARD,'Kanban'),(CAL,'Kalendarz')],0)+'</label>'
  '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:12px;color:var(--text-secondary)">Kto widzi</span>'+seg([('','Wszyscy z dostępem'),('','Tylko ja')],0)+'</label></div>')
w(blk('Filtry',FILTER,'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">'+word('Gdzie')+pill('Status')+word('jest jednym z')+pill(st('Nowy'))+pill(st('Analiza'))+pill(st('Przygotowanie oferty'))+'</div>'
  '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">'+word('i')+pill('Termin składania ofert')+word('jest w ciągu')+pill('14 dni','Liczone od dziś — widok aktualizuje się codziennie')+word('od dziś')+'</div>',
  '<a href="#" class="flink" style="font-size:12px;color:var(--text-secondary)">+ warunek</a>'))
w('<div style="display:flex;gap:12px">'+
  '<div style="flex:1 1 0;min-width:0">'+blk('Sortowanie',SORT,'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">'+pill('Termin składania ofert')+word('rosnąco')+'</div><div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">'+word('potem')+pill('Wartość szacunkowa')+word('malejąco')+'</div>')+'</div>'
  '<div style="flex:1 1 0;min-width:0">'+blk('Grupowanie i podsumowanie',LAYERS,'<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">'+word('Grupy')+pill('bez grup','Możesz grupować po polu Wybór, Osoba albo Powiązanie')+'</div><div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px">'+word('Pod tabelą')+pill(ic(SIGMA,12,'var(--text-tertiary)')+'suma Wartość szacunkowa')+pill('liczba rekordów')+'</div>')+'</div></div>')
# kolumny
def ccol(icon,name,width,extra='',hid=False,lock=False):
    op='opacity:.55;' if hid else ''
    eye=ic(EYEOFF if hid else EYE,14,'var(--text-tertiary)' if hid else 'var(--text-secondary)')
    return (f'<div role="row" class="row" style="display:grid;grid-template-columns:16px 16px minmax(0,1fr) auto 72px 24px;column-gap:8px;align-items:center;min-height:32px;padding:0 6px;border-radius:8px;{op}">'
            f'<span style="display:inline-flex">{ic(GRIP,14,"var(--text-tertiary)") if not hid else ""}</span>{ic(icon,14,"var(--text-secondary)")}<span class="ell">{name}</span>'
            f'<span style="display:flex;gap:4px">{extra}</span><span class="num" style="text-align:right;font-size:12px;color:var(--text-tertiary)">{width}</span>'
            f'<span title="{"Pokaż kolumnę" if hid else "Ukryj kolumnę"}" style="display:inline-flex;justify-content:flex-end">{eye}</span></div>')
cols=(ccol(HASH,'Numer','52 px')+ccol(TXT,'Nazwa zamówienia','auto',sch('+ Zamawiający pod spodem','Druga linia komórki: pole Zamawiający'))+ccol(MSEL,'Branża','auto')+
      ccol(COIN,'Wartość szacunkowa','104 px',sch('suma','Suma w podsumowaniu'))+ccol(CAL,'Termin składania ofert','120 px',sch('+ Dni do terminu','Formuła; ≤ 7 dni — kolor ostrzeżenia'))+ccol(SEL,'Status','156 px')+ccol(USER,'Opiekun','24 px')+
      '<div style="height:1px;background:var(--edge);margin:6px 6px"></div>'+
      ccol(SEL,'Region','—',hid=True)+ccol(TXT,'Numer ogłoszenia','—',hid=True)+ccol(COIN,'Wadium','—',hid=True)+
      ccol(COIN,'Nasza cena','—',sch(ic(LOCK,12,'var(--text-tertiary)')+'technicy nie widzą','Uprawnienia pola — w widoku technika kolumny nie będzie'),hid=True)+
      '<a href="#" class="flink" style="padding:4px 6px;font-size:12px;color:var(--text-secondary)">4 kolejne ukryte pola</a>')
w(blk('Kolumny · 7 widocznych',TABLEI,cols,'<span style="font-size:12px;color:var(--text-tertiary)">przeciągnij, by zmienić kolejność</span>'))
w('<div style="display:flex;align-items:center;gap:6px;padding-top:4px">'+btn('Usuń widok…','Usuwa tylko ustawienia widoku — rekordy zostają. Wymaga potwierdzenia.',h=32)+
  '<span style="font-size:12px;color:var(--text-tertiary);padding-left:6px">Widok domyślny: W toku</span>'+SP+btn('Zapisz jako nowy','Zapisz jako nowy widok',h=32)+btn('Zapisz widok','Zapisz zmiany — zobaczą je wszyscy z dostępem  ⌘S',CHECK,pri=True,h=32)+'</div>')
w('</div>')
# podgląd
def prow(no,name,org,val,term,termcol,stat,who):
    return (f'<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:8px;row-gap:2px;padding:8px 10px;border-radius:10px;background:var(--bg-surface)">'
            f'<span style="display:flex;gap:6px;min-width:0"><span class="mono" style="font-size:11px;line-height:20px;color:var(--text-tertiary);white-space:nowrap">{no}</span><span class="ell" style="font-weight:500">{name}</span></span>{who}'
            f'<span class="ell" style="font-size:12px;color:var(--text-secondary)">{org}</span><span class="num" style="text-align:right">{val}</span>'
            f'<span style="font-size:12px">{st(stat)}</span><span class="num" style="text-align:right;font-size:12px;color:{termcol}">{term}</span></div>')
w('<aside aria-label="Podgląd widoku" style="flex:0 0 320px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:12px;padding:14px 12px 24px">')
w('<div style="display:flex;align-items:center;gap:8px;padding:0 8px"><span style="font-size:12px;font-weight:500;color:var(--text-secondary)">Podgląd</span>'+CNT(2)+SP+'<span style="font-size:12px;color:var(--text-tertiary)">dane z dziś, 20 lis</span></div>')
w('<div style="display:flex;flex-direction:column;gap:6px;margin:0 4px;padding:6px;border-radius:12px;background:var(--bg-raised)">'+
  prow('PR-013','Serwis urządzeń chłodniczych 2027–2028','Centrum Medyczne Kaszuby','186 000','pt 27 lis · 7 dni','var(--warning)','Przygotowanie oferty',cav('TL',TL))+
  prow('PR-014','Klimatyzacja sal w budynku urzędu','Gmina Miejska Rumia','420 000','pt 4 gru · 14 dni','var(--text-secondary)','Analiza',cav('PK',PKC))+
  '<div style="display:flex;align-items:center;gap:8px;padding:4px 10px;font-size:12px;color:var(--text-secondary)"><span>2 przetargi</span>'+SP+'<span>Suma <span class="num" style="color:var(--text-primary);font-weight:500">606 000 zł</span></span></div></div>')
w('<div style="display:flex;flex-direction:column;gap:2px;padding:0 8px">'+
  kv('Poza widokiem','PR-015, PR-011',vc='var(--text-secondary)',tip='PR-015: termin 11 gru, za 21 dni · PR-011: status Złożona')+'</div>')
w('<div role="note" style="display:flex;gap:10px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(EYE,16,'var(--text-secondary)')+
  '<span style="font-size:12px;line-height:16px;color:var(--text-secondary)">Tomasz (technik, „swoje”) zobaczy w tym widoku tylko PR-013 i bez kolumny „Nasza cena”.</span></div>')
w('</aside></div></sc-if>')

# =================== IMPORT Z PLIKU
I=[];i_=I.append
i_('<sc-if value="{{isTbI}}" hint-placeholder-val="{{false}}">')
i_('<div style="display:flex;align-items:center;gap:8px;height:44px;padding:0 12px 0 20px;min-width:0">'+ic(GAVEL,16,'var(--text-secondary)')+
   '<a href="#" class="flink" style="color:var(--text-secondary)">Przetargi</a>'+ic(CHEV,14,'var(--text-tertiary)')+'<h1 style="margin:0;font-size:13px;line-height:20px;font-weight:500">Import z pliku</h1>'+SP+
   '<span style="font-size:12px;color:var(--text-tertiary)">Nic nie zapisze się przed zatwierdzeniem · Esc anuluje</span></div>')
i_('<div style="flex:1 1 auto;display:flex;align-items:stretch;min-height:0"><div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column">')
i_('<div style="display:flex;flex-direction:column;gap:12px;padding:12px 24px 12px"><div style="display:flex;flex-direction:column;gap:4px"><h2 style="margin:0;font-size:18px;line-height:26px;font-weight:600;letter-spacing:-0.015em">przetargi_2025-2026.xlsx</h2>'
   '<div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;line-height:16px;color:var(--text-secondary)">'+meta(FILE,'Arkusz „Przetargi” · 46 wierszy','Wiersz 1 to nagłówki · 10 kolumn')+meta(USER,'Pascal · dziś 18:40','Import działa z uprawnieniami Pascala')+'</div></div>'
   '<div style="display:flex;flex-wrap:wrap;gap:6px">'+capd('<span class="num" style="font-weight:500">41</span> nowych','Nowe rekordy PR-016 – PR-056')+capd('<span class="num" style="font-weight:500">3</span> do uzupełnienia','Ten sam numer ogłoszenia już jest w tabeli: PR-004, PR-007, PR-009')+
   capd('<span class="num" style="font-weight:500">2</span> pominięte','Wiersze 31 i 44 — brak nazwy zamówienia (pole wymagane)')+capd(ic(WARN,14,'var(--warning)')+'<span class="num" style="font-weight:500">6</span> do sprawdzenia','4 zamawiających bez rekordu w Firmach, 2 wiersze bez terminu')+'</div></div>')
MC='minmax(0,1fr) minmax(0,1.1fr) 16px minmax(0,1fr) minmax(0,1.2fr)'
def ftico(t):
    k=('cal','blue') if 'Data' in t else ('coin','yellow') if 'Kwota' in t else ('bld','indigo') if 'Powiązanie' in t else ('list','violet') if 'ybór' in t else ('hash','slate') if 'unikalne' in t else ('text','teal')
    return u_ci(*k)
def mrow(col,ex,fld,ftype,state,sel=False):
    bg='background:var(--bg-subtle);' if sel else ''
    return (f'<div role="row" class="row" aria-selected="{str(sel).lower()}" style="display:grid;grid-template-columns:{MC};column-gap:12px;align-items:center;min-height:36px;padding:0 10px;border-radius:10px;{bg}">'
            f'<span class="ell" style="font-weight:500">{col}</span><span class="ell" style="font-size:12px;color:var(--text-secondary)">{ex}</span>{ic(ARROW,14,"var(--text-tertiary)")}'
            f'<span style="display:flex;align-items:center;gap:8px;min-width:0"><span title="{ftype}" style="display:inline-flex">{ftico(ftype)}</span><span class="ell">{fld}</span></span>'
            f'<span style="display:flex;justify-content:flex-start;min-width:0">{state}</span></div>')
ok=lambda t,tip: sch(ic(CHECK,12,'var(--success)')+t,tip)
wr=lambda t,tip: sch(ic(WARN,12,'var(--warning)')+t,tip,col='var(--warning)')
nu=lambda t,tip: sch(t,tip)
i_('<div role="table" aria-label="Kolumny pliku i pola tabeli" style="display:flex;flex-direction:column;padding:0 16px 16px">')
i_(f'<div role="row" style="display:grid;grid-template-columns:{MC};column-gap:12px;align-items:center;height:24px;padding:0 10px;font-size:12px;color:var(--text-tertiary)">'+u_th('Kolumna w pliku','grid','green')+u_th('Przykład (wiersz 2)','eye','slate')+'<span></span>'+u_th('Pole w tabeli','list','violet')+u_th('Stan','flag','orange')+'</div>')
i_(mrow('Przedmiot zamówienia','Serwis klimatyzacji w urzędzie','Nazwa zamówienia','Tekst · wymagane',wr('2 puste → pominięte','Wiersze 31 i 44')))
i_(mrow('Zamawiający','Gmina Puck','Zamawiający','Powiązanie → Firmy',wr('38 z 42 w Firmach','4 bez rekordu — wybierz w panelu, co z nimi zrobić'),sel=True))
i_(mrow('Nr ogłoszenia','2025/BZP 00412290','Numer ogłoszenia','Tekst · unikalne',nu('3 już w tabeli → uzupełnienie','PR-004, PR-007, PR-009 — tylko puste pola')))
i_(mrow('Termin','12.03.2025 10:00','Termin składania ofert','Data i godzina',wr('2 bez daty','Wiersz 12 „do uzgodnienia”, wiersz 27 pusty — pole zostanie puste')))
i_(mrow('Wartość','245 000,00','Wartość szacunkowa','Kwota · PLN netto',ok('44 liczby','Przecinek dziesiętny rozpoznany')))
i_(mrow('Status','wygrany','Status','Wybór · etapy',ok('5 wartości → etapy','wygrany → Wygrany · przegrany → Przegrany · złożono → Złożona · rezygnacja → Odpuszczony · w przygotowaniu → Przygotowanie oferty')))
i_(mrow('Branża','klima; wentylacja','Branża','Wielokrotny wybór',ok('separator „;”','klima → Klimatyzacja · pc → Pompy ciepła · chłodnictwo → Chłodnictwo · wentylacja → Wentylacja')))
i_(mrow('Kto','PK','Opiekun','Osoba',ok('PK, TL → osoby','Inicjały z Użytkowników')))
i_(mrow('Link','ezamowienia.gov.pl/…','Link do ogłoszenia','Link',ok('41 linków','5 pustych')))
i_(mrow('Uwagi','brak referencji > 1 mln','nowe pole: Uwagi','Tekst długi · utworzy administrator',nu('utworzy pole','Pole pojawi się w Ustawieniach tabeli › Pola · możesz wybrać „Pomiń”')))
i_('</div>')
i_('<div style="display:flex;align-items:center;gap:8px;padding:0 26px 24px;font-size:12px;color:var(--text-secondary)">'+ic(SHIELD,14,'var(--text-tertiary)')+
   '<span>Import nie uruchamia akcji tabeli (przypomnień, zadań) i nie wysyła wiadomości. Można go cofnąć przez 7 dni — nowe rekordy trafią do archiwum, uzupełnione pola wrócą do stanu sprzed importu.</span></div>')
i_('</div>')
# panel
i_('<aside aria-label="Po zatwierdzeniu importu" style="flex:0 0 340px;min-width:0;border-left:1px solid var(--edge);display:flex;flex-direction:column;gap:18px;padding:14px 12px 24px">')
def opt2(on,title,sub):
    mark=(f'<span style="width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 {"5px var(--accent)" if on else "1.5px var(--border-strong)"};flex:0 0 auto;margin-top:2px"></span>')
    return f'<div role="radio" aria-checked="{"true" if on else "false"}" style="display:flex;gap:10px;padding:8px 10px;border-radius:10px;{"background:var(--bg-subtle)" if on else ""}">{mark}<span style="display:flex;flex-direction:column;gap:2px"><span style="font-weight:{500 if on else 400}">{title}</span><span style="font-size:12px;line-height:16px;color:var(--text-secondary)">{sub}</span></span></div>'
i_('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Zamawiający bez rekordu',CNT(4))+
   '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:0 8px">'+''.join(sch(n,t) for n,t in [('Gmina Puck','3 przetargi'),('ZOZ Kartuzy','1 przetarg'),('SP nr 4 w Redzie','1 przetarg'),('Ośrodek Sportu Hel','1 przetarg')])+'</div>'
   '<div role="radiogroup" style="display:flex;flex-direction:column;gap:2px;padding:4px 4px 0">'+
   opt2(True,'Utwórz 4 firmy','Rodzaj „Zamawiający publiczny”, bez osób i obiektów. Zobaczysz je w Firmach z etykietą „z importu”.')+
   opt2(False,'Zostaw pole puste','Nazwa trafi do pola Uwagi.')+'</div></section>')
i_('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Istniejące rekordy',CNT(3))+
   '<div role="radiogroup" style="display:flex;flex-direction:column;gap:2px;padding:0 4px">'+
   opt2(True,'Uzupełnij tylko puste pola','PR-004, PR-007, PR-009 — 5 pól. Wypełnione zostają bez zmian.')+
   opt2(False,'Nadpisz wartościami z pliku','Zmieni 7 wypełnionych pól; każde w historii rekordu.')+'</div></section>')
i_('<section style="display:flex;flex-direction:column;gap:6px">'+ah3('Po zatwierdzeniu')+
   '<div style="display:flex;flex-direction:column;gap:2px;margin:0 4px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+
   kv('Nowe przetargi','41 · PR-016 – PR-056',w=500)+kv('Uzupełnione','3',vc='var(--text-secondary)')+kv('Pominięte wiersze','2',vc='var(--text-secondary)',tip='Lista do pobrania jako CSV')+
   kv('Nowe firmy','4',vc='var(--text-secondary)')+kv('Nowe pole','Uwagi',vc='var(--text-secondary)')+'</div>'
   '<span style="padding:0 8px;font-size:12px;line-height:16px;color:var(--text-tertiary)">Skuteczność w widoku „Wszystkie” policzy się od 2025 r.: 11 wygranych z 29 złożonych.</span></section>')
i_('<div style="display:flex;flex-direction:column;gap:6px;margin-top:auto;padding:0 4px">'+btn('Importuj 44 wiersze','Zapisz 41 nowych i uzupełnij 3 rekordy — cofniesz przez 7 dni  ⌘↵',UP,pri=True,h=32)+btn('Pobierz pominięte wiersze','2 wiersze jako CSV, do poprawienia',DL if 'DL' in dir() else FILE,h=32)+'</div>')
i_('</aside></div></sc-if>')

block='\n'.join(W)+'\n'+'\n'.join(I)+'\n'
k=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:k]+block+s[k:]
def rep(x,y,n=1):
    global s; assert s.count(x)==n,(x[:60],s.count(x)); s=s.replace(x,y)
rep("const nPtg = navv(isPtg || isTbP || isTbS || isTbA || isTbU);","const isTbW = ekran === 'tabela widoki'; const isTbI = ekran === 'tabela import'; const nPtg = navv(isPtg || isTbP || isTbS || isTbA || isTbU || isTbW || isTbI);")
rep("isPtg, isTbP, isTbS, isTbN, isTbA, isTbU,","isPtg, isTbP, isTbS, isTbN, isTbA, isTbU, isTbW, isTbI,")
rep('"tabela uprawnienia", ','"tabela uprawnienia", "tabela widoki", "tabela import", ')
rep("(isUst || isTbN || isTbP || isTbS || isTbA || isTbU)","(isUst || isTbN || isTbP || isTbS || isTbA || isTbU || isTbW || isTbI)",2)
open(P,'w').write(s); print('ok flex3',len(s))
