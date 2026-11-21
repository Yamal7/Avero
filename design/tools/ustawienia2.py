# Pozostałe zakładki Ustawień: dokumenty, katalog i marże, technicy i busy, mój profil, powiadomienia, wygląd
_u=open('design/tools/ustawienia.py').read()
exec(_u.split("# =========== PROFIL FIRMY")[0])   # helpery + ikony (czyta też s=Main)
CYC='<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"></path><path d="M3 21v-5h5"></path>'
AWARD='<path d="m15.48 12.89 1.52 8.55a.5.5 0 0 1-.81.47l-3.59-2.69a1 1 0 0 0-1.19 0l-3.6 2.7a.5.5 0 0 1-.8-.47l1.51-8.56"></path><circle cx="12" cy="8" r="6"></circle>'
DROPI='<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"></path>'
SCALE='<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>'
MOON='<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>'
MONITOR='<rect width="20" height="14" x="2" y="3" rx="2"></rect><path d="M8 21h8M12 17v4"></path>'
KEY='<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5"></circle>'
PHONEI='<rect width="14" height="20" x="5" y="2" rx="2"></rect><path d="M12 18h.01"></path>'
LAPTOP='<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>'
WALLET='<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>'
TREND='<path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path>'
KBDI='<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"></path>'
def seg(opts,sel,label):
    b=''.join(f'<button type="button" role="radio" aria-checked="{str(i==sel).lower()}" title="{tip}" style="height:28px;padding:0 12px;border:0;border-radius:8px;background:{"var(--bg-surface)" if i==sel else "transparent"};color:{"var(--text-primary)" if i==sel else "var(--text-secondary)"};font-weight:{500 if i==sel else 400};{"box-shadow:0 1px 2px rgba(0,0,0,.06);" if i==sel else ""}white-space:nowrap">{t}</button>' for i,(t,tip) in enumerate(opts))
    return f'<div role="radiogroup" aria-label="{label}" style="display:inline-flex;gap:2px;padding:2px;border-radius:10px;background:var(--bg-subtle);width:max-content">{b}</div>'
def tok(t): return f'<span class="mono" style="height:20px;display:inline-flex;align-items:center;padding:0 6px;border-radius:6px;background:var(--bg-surface);font-size:11px;color:var(--text-secondary)">{t}</span>'
def flex(*a,gap=8): return f'<div style="display:flex;align-items:center;gap:{gap}px;flex-wrap:wrap">{"".join(a)}</div>'
btn=lambda t,tip,icon=None,bg='var(--bg-surface)': f'<button type="button" class="sec" title="{tip}" style="height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 12px;border:0;border-radius:10px;background:{bg};font-weight:500;white-space:nowrap">{ic(icon,14) if icon else ""}{t}</button>'
def tbl(cols,hdr,rows,label):
    h=''.join(f'<span style="{a}">{t}</span>' for t,a in hdr)
    r=''.join(f'<div role="row" class="row" style="display:grid;grid-template-columns:{cols};column-gap:12px;align-items:center;min-height:44px;padding:0 8px;border-radius:10px">'+''.join(f'<span role="cell" style="min-width:0;{a}">{c}</span>' for c,(_,a) in zip(row,hdr))+'</div>' for row in rows)
    return f'<div role="table" aria-label="{label}" style="display:flex;flex-direction:column"><div role="row" style="display:grid;grid-template-columns:{cols};column-gap:12px;height:28px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)">{h}</div>{r}</div>'
def card(inner,pad='6px 8px'): return f'<div style="display:flex;flex-direction:column;padding:{pad};border-radius:12px;background:var(--bg-raised)">{inner}</div>'
def savebar(note):
    return ('<div style="display:flex;align-items:center;gap:10px;padding-top:4px"><span style="flex:1 1 auto;display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:18px;color:var(--text-tertiary)">'+ic(INFO,14,'var(--text-tertiary)')+f'<span>{note}</span></span>'
            '<button type="button" class="pri" title="Zapisz  ⌘S" style="height:32px;padding:0 14px;border:0;border-radius:10px;background:var(--accent);color:var(--on-accent);font-weight:500">Zapisz zmiany</button></div>')

# =========== DOKUMENTY I NUMERACJA
def fmt(*parts): return '<span style="display:inline-flex;align-items:center;gap:2px;flex-wrap:wrap">'+''.join(tok(p) if p.startswith('{') else f'<span class="mono" style="font-size:12px;color:var(--text-primary)">{p}</span>' for p in parts)+'</span>'
lockc=lambda tip: f'<span title="{tip}" style="display:inline-flex">{ic(LOCKI,14,"var(--text-tertiary)")}</span>'
nxt=lambda t: f'<span class="mono num" style="font-size:12px;color:var(--text-secondary)">{t}</span>'
D_ROWS=[
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(FILE,14,"#5E6AD2")}Oferty</span>',fmt('OF-','{RRRR}','-','{N}'),nxt('OF-2026-119'),sch('nigdy','Numer rośnie przez lata; rok z daty utworzenia'),lockc('Nadawany przez bazę danych — globalna sekwencja, możliwe luki po wycofanych szkicach')],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(WRENCH,14,"#9B6BE0")}Zlecenia</span>',fmt('ZS-','{N}'),nxt('ZS-1053'),sch('nigdy','Ciągła numeracja'),lockc('Nadawany przez bazę danych')],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(INFO,14,"#D6453D")}Zgłoszenia</span>',fmt('ZG-','{N}'),nxt('ZG-0921'),sch('nigdy',''),lockc('Nadawany przez bazę danych')],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(WALLET,14,"#2F9E5B")}Faktury</span>',fmt('FV/','{RRRR}','/','{MM}','/','{NNN}'),nxt('FV/2026/11/024'),sch('co miesiąc','Licznik {NNN} zaczyna od 001 w każdym miesiącu'),'<button type="button" class="ghost" title="Edytuj serię" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Edytuj</button>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(WALLET,14,"#2F9E5B")}Faktury zaliczkowe</span>',fmt('FZ/','{RRRR}','/','{MM}','/','{NNN}'),nxt('FZ/2026/11/015'),sch('co miesiąc',''),'<button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Edytuj</button>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(WALLET,14,"#D6453D")}Korekty</span>',fmt('KOR/','{RRRR}','/','{MM}','/','{NNN}'),nxt('KOR/2026/11/002'),sch('co miesiąc',''),'<button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Edytuj</button>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(CLIP,14,"#2BB3B1")}Protokoły</span>',fmt('PR/','{RRRR}','/','{MM}','/','{NNN}'),nxt('PR/2026/11/058'),sch('co miesiąc',''),'<button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Edytuj</button>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{ic(BOX,14,"#3B82D6")}Magazyn · PZ RW MM WZ</span>',fmt('{TYP}','/','{RRRR}','/','{MM}','/','{NNN}'),nxt('RW/2026/11/112'),sch('co miesiąc','Osobny licznik dla każdego typu dokumentu'),'<button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Edytuj</button>'],
]
dok=(head('Dokumenty i numeracja','Jak numerowane są dokumenty i jakie ustawienia trafiają domyślnie na faktury.')+
 '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Serie numeracji</h3>'+SP+
 sch(ic(INFO,12,'var(--text-tertiary)')+'znaczniki','{RRRR} rok · {MM} miesiąc · {N} kolejny numer · {NNN} kolejny numer z zerami · {TYP} rodzaj dokumentu')+'</div>'+
 card(tbl('minmax(0,1.1fr) minmax(0,1.3fr) 128px 92px 56px',[('Dokument',''),('Format',''),('Następny','text-align:right'),('Licznik od nowa',''),('','text-align:right')],D_ROWS,'Serie numeracji'),'4px 4px')+
 '<div style="display:flex;gap:10px;padding:10px 12px;border-radius:12px;background:var(--bg-raised)">'+ic(WARN,16,'var(--warning)')+'<span style="font-size:12px;line-height:18px;color:var(--text-secondary)">Zmiana formatu faktur zadziała od 1 grudnia. Wystawione dokumenty zachowują swoje numery, a numeracja w miesiącu pozostaje ciągła.</span></div></section>'+
 section('Faktury',
   frow('Termin płatności',flex(inp('7','Termin płatności w dniach','120px',suffix='dni'),seg([('od wystawienia','Liczony od daty wystawienia'),('od wykonania','Liczony od daty wykonania usługi')],0,'Liczenie terminu')))+sep()+
   frow('Sposób płatności',flex(sch(dot('var(--success)')+'Przelew','Numer konta z profilu firmy','var(--bg-surface)'),tog(True,'Dołącz link do płatności Przelewy24'),'<span style="font-size:13px;color:var(--text-secondary)">Link do płatności online w e-mailu</span>'))+sep()+
   frow('Stawka VAT',flex(inp('23','Domyślna stawka VAT','100px',suffix='%'),sch(ic(INFO,12,'var(--text-tertiary)')+'8 % dla montażu w budynku mieszkalnym','Podpowiedź przy ofercie: dostawa z montażem w budynku mieszkalnym do 300 m² (dom) / 150 m² (lokal) — 8 %; decyzję zatwierdza biuro','var(--bg-surface)')),'Pozycje mają własną stawkę z katalogu')+sep()+
   frow('KSeF','<div style="display:flex;flex-direction:column;gap:8px">'+flex(tog(True,'Wysyłaj faktury dla firm do KSeF'),'<span>Faktury dla firm (B2B) wysyłaj automatycznie po wystawieniu</span>')+flex(tog(False,'Faktury dla konsumentów do KSeF'),'<span style="color:var(--text-secondary)">Faktury dla osób prywatnych też do KSeF (dobrowolnie)</span>')+'</div>',sch(dot('var(--text-tertiary)')+'wymaga konfiguracji','Połącz KSeF w Integracjach'))+sep()+
   frow('Uwagi na fakturze','<textarea rows="2" style="width:100%;padding:8px 10px;border:0;border-radius:10px;background:var(--bg-subtle);font:inherit;line-height:20px;color:var(--text-primary);resize:vertical">Gwarancja na wykonane prace 24 miesiące od daty odbioru.</textarea>','Stopka każdej faktury'))+
 section('Protokoły i PDF',
   frow('Podpis klienta',flex(tog(True,'Wymagaj podpisu klienta'),'<span>Wymagany przy zamknięciu protokołu</span>'))+sep()+
   frow('Kopia dla klienta',flex(tog(True,'Wysyłaj PDF klientowi'),'<span>PDF e-mailem po podpisie i w portalu klienta</span>'))+sep()+
   frow('Wydruki',flex(sch(ic(SUN,12,'var(--text-tertiary)')+'zawsze jasne','Wydruki i PDF nie zależą od motywu aplikacji','var(--bg-surface)'))))+
 savebar('Numeracja ofert, zleceń i zgłoszeń jest nadawana przez bazę danych i nie da się jej edytować.'))

# =========== KATALOG I MARŻE
def bar(pct,thr,c='var(--text-secondary)'):
    return (f'<span style="display:flex;align-items:center;gap:8px;min-width:0"><span style="position:relative;flex:1 1 auto;height:6px;border-radius:3px;background:var(--bg-surface)"><span style="position:absolute;inset:0 auto 0 0;width:{pct}%;border-radius:3px;background:{c}"></span>'
            f'<span style="position:absolute;left:{thr}%;top:-3px;bottom:-3px;width:2px;border-radius:1px;background:var(--text-tertiary)"></span></span></span>')
K_ROWS=[[f'<span style="display:flex;align-items:center;gap:8px">{ic(BOX,14,"#3B82D6")}Urządzenia</span>',inp('15','Próg marży urządzenia','84px',suffix='%'),bar(17/60*100,15/60*100),'<span class="num">17 %</span>'],
        [f'<span style="display:flex;align-items:center;gap:8px">{ic(LAYERS if "LAYERS" in globals() else BOX,14,"#2BB3B1")}Materiały</span>',inp('30','Próg marży materiały','84px',suffix='%'),bar(38/60*100,30/60*100),'<span class="num">38 %</span>'],
        [f'<span style="display:flex;align-items:center;gap:8px">{ic(WRENCH,14,"#9B6BE0")}Usługi</span>',inp('45','Próg marży usługi','84px',suffix='%'),bar(60/60*100*0.99,45/60*100),'<span class="num">60 %</span>'],
        [f'<span style="display:flex;align-items:center;gap:8px">{ic(TRUCK,14,"#E0702A")}Dojazd</span>',inp('0','Próg marży dojazd','84px',suffix='%'),bar(12/60*100,0),'<span class="num">12 %</span>']]
SUP=[[f'<span style="display:flex;align-items:center;gap:8px">{ic(BOX,14,"#3B82D6")}Daikin</span>','<span class="mono" style="font-size:12px">11/2026</span>','<span class="num">412</span>',sch(dot('var(--success)')+'aktualny','Zaimportowano 18 lis · 6 cen wzrosło średnio o 2 %'),btn('Importuj','Wczytaj nowy cennik CSV / XLSX',UPL)],
     [f'<span style="display:flex;align-items:center;gap:8px">{ic(BOX,14,"#3B82D6")}Gree</span>','<span class="mono" style="font-size:12px">09/2026</span>','<span class="num">186</span>',sch(ic(TREND,12,'var(--danger)')+'ceny +9 % od 1 wrz','Dystrybutor podniósł ceny; 23 pozycje w ofertach mają marżę poniżej progu'),btn('Zaktualizuj','Przelicz ceny sprzedaży wg nowych kosztów',UPL)],
     [f'<span style="display:flex;align-items:center;gap:8px">{ic(BOX,14,"#3B82D6")}Panasonic</span>','<span class="mono" style="font-size:12px">10/2026</span>','<span class="num">158</span>',sch(dot('var(--success)')+'aktualny','Zaimportowano 4 paź'),btn('Importuj','Wczytaj nowy cennik',UPL)],
     [f'<span style="display:flex;align-items:center;gap:8px">{ic(BOX,14,"#3B82D6")}Hurtownia instalacyjna</span>','<span class="mono" style="font-size:12px">ręcznie</span>','<span class="num">94</span>',sch(dot('var(--text-tertiary)')+'brak pliku','Ceny wpisywane ręcznie w katalogu'),btn('Importuj','Wczytaj cennik',UPL)]]
kat=(head('Katalog i marże','Progi marży, stawki robocizny i cenniki dostawców. Marża = (sprzedaż − koszt) / sprzedaż.',btn('Otwórz katalog','Katalog produktów i usług  G C',bg='var(--bg-subtle)'))+
 '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Progi marży</h3>'+SP+'<span style="font-size:12px;color:var(--text-tertiary)">średnia z ostatnich 90 dni</span></div>'+
 card(frow('Próg całej oferty',flex(inp('22','Próg marży oferty','84px',suffix='%'),'<span style="font-size:12px;color:var(--text-tertiary)">pasek marży w kreatorze ofert pokazuje ten znacznik</span>'))+sep()+
      tbl('minmax(0,1fr) 104px minmax(0,1.4fr) 52px',[('Kategoria',''),('Próg',''),('Średnio · próg',''),('','text-align:right')],K_ROWS,'Progi marży wg kategorii')+sep()+
      frow('Poniżej progu',seg([('Tylko ostrzeżenie','Oferta z czerwonym paskiem marży, można wysłać'),('Zgoda administratora','Wysłanie wymaga zatwierdzenia przez administratora')],0,'Zachowanie poniżej progu')),'4px 16px')+'</section>'+
 section('Robocizna i dojazd',
   frow('Roboczogodzina',flex(inp('140','Stawka roboczogodziny netto','120px',suffix='zł / h'),'<span style="font-size:12px;color:var(--text-tertiary)">poza umowami serwisowymi</span>'))+sep()+
   frow('Dopłaty',flex(inp('50','Dopłata noc i weekend','100px',suffix='%'),'<span style="color:var(--text-secondary)">noc 20–7 i weekend</span>',inp('100','Dopłata święta','100px',suffix='%'),'<span style="color:var(--text-secondary)">święta</span>'))+sep()+
   frow('Dojazd',flex(sch('Trójmiasto · w cenie','Strefa 1: Gdańsk, Gdynia, Sopot','var(--bg-surface)'),sch('do 30 km · 120 zł','Strefa 2: ryczałt','var(--bg-surface)'),sch('dalej · 2,50 zł / km','Strefa 3: od bazy w obie strony','var(--bg-surface)'),'<button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Edytuj strefy</button>'),'Liczone od bazy firmy')+sep()+
   frow('Ceny sprzedaży',seg([('Narzut od kosztu','Cena sprzedaży = koszt × (1 + narzut kategorii)'),('Ręcznie','Każda pozycja ma ręcznie wpisaną cenę')],1,'Sposób ustalania cen'),'Dla nowych pozycji z cennika'))+
 '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Cenniki dostawców</h3>'+SP+'</div>'+
 card(tbl('minmax(0,1fr) 80px 56px minmax(0,1.2fr) 120px',[('Dostawca',''),('Cennik',''),('Poz.','text-align:right'),('Stan',''),('','text-align:right')],SUP,'Cenniki dostawców'),'4px 4px')+'</section>')

# =========== TECHNICY I BUSY
cert=lambda t,ok,tip: sch((ic(CHECK,12,'var(--success)') if ok=='ok' else (ic(WARN,12,'var(--warning)') if ok=='warn' else dot('var(--text-tertiary)')))+t,tip)
T_ROWS=[
 [f'<span style="display:flex;align-items:center;gap:8px">{cav("TL",TL)}Tomasz Lewandowski</span>',flex(cert('F-gaz I','ok','Certyfikat dla personelu kat. I · ważny do 2029'),cert('SEP E1','ok','Do 1 kV · ważne do 2028'),gap=4),'<span class="num" style="color:var(--text-secondary)">7:00–15:00</span>','<span class="mono" style="font-size:12px">GD 7K311</span>','<span class="num" style="text-align:right">95 zł</span>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{cav("MZ",MZC)}Mateusz Zieliński</span>',flex(cert('F-gaz I','ok','Ważny do 2030'),cert('SEP E1','ok','Ważne do 2029'),gap=4),'<span class="num" style="color:var(--text-secondary)">7:00–15:00</span>','<span class="mono" style="font-size:12px">GD 2M904</span>','<span class="num">85 zł</span>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{cav("KN",KN)}Kacper Nowak</span>',flex(cert('F-gaz I','ok','Ważny do 2028'),cert('SEP E1 · 41 dni','warn','Wygasa 31 gru 2026 — zaplanuj egzamin'),gap=4),'<span class="num" style="color:var(--text-secondary)">6:30–14:30</span>','<span class="mono" style="font-size:12px">GD 5P117</span>','<span class="num">85 zł</span>'],
 [f'<span style="display:flex;align-items:center;gap:8px">{cav("PD",PD)}Piotr Dąbrowski</span>',flex(cert('F-gaz I','ok','Ważny do 2031'),cert('gaz G3','none','Brak — przy demontażu kotłów potrzebny podwykonawca'),gap=4),'<span class="num" style="color:var(--text-secondary)">8:00–16:00</span>','<span class="mono" style="font-size:12px">GD 4N218</span>','<span class="num">80 zł</span>']]
B_ROWS=[
 [f'<span class="mono" style="font-size:12px">GD 7K311</span>',f'<span style="display:flex;align-items:center;gap:6px">{cav("TL",TL,18,8)}Ford Transit Custom</span>',flex(sch(ic(DROPI,12,'#3B82D6')+'R32 9 kg','Butla R32 · ważona 18 lis'),sch(ic(DROPI,12,'#9B6BE0')+'R410A 4 kg','Butla R410A'),gap=4),sch(ic(SCALE,12,'var(--success)')+'waga','Waga do czynnika · kalibracja do 3/2027'),sch(dot('var(--success)')+'OC 2/2027','Przegląd techniczny 5/2027 · OC do 2/2027')],
 [f'<span class="mono" style="font-size:12px">GD 2M904</span>',f'<span style="display:flex;align-items:center;gap:6px">{cav("MZ",MZC,18,8)}Renault Trafic</span>',flex(sch(ic(DROPI,12,'#3B82D6')+'R32 6 kg','Butla R32'),gap=4),sch(ic(SCALE,12,'var(--success)')+'waga','Kalibracja do 6/2027'),sch(dot('var(--success)')+'OC 8/2027','Przegląd 9/2027')],
 [f'<span class="mono" style="font-size:12px">GD 5P117</span>',f'<span style="display:flex;align-items:center;gap:6px">{cav("KN",KN,18,8)}VW Transporter</span>',flex(sch(ic(DROPI,12,'#E0702A')+'R452A 10 kg','Butla R452A'),sch(ic(DROPI,12,'#3B82D6')+'R32 3 kg','Butla R32'),gap=4),sch(ic(SCALE,12,'var(--warning)')+'kalibracja 28 dni','Kalibracja wagi wygasa 18 gru'),sch(dot('var(--success)')+'OC 4/2027','Przegląd 4/2027')],
 [f'<span class="mono" style="font-size:12px">GD 4N218</span>',f'<span style="display:flex;align-items:center;gap:6px">{cav("PD",PD,18,8)}Ford Transit</span>',flex(sch(ic(DROPI,12,'#D6453D')+'R404A 7 kg','Butla R404A'),sch(ic(DROPI,12,'#9B6BE0')+'R410A 2 kg','Butla R410A'),gap=4),sch(ic(SCALE,12,'var(--success)')+'waga','Kalibracja do 1/2027'),sch(ic(WARN,12,'var(--warning)')+'przegląd 9 dni','Przegląd techniczny 29 lis')]]
tech=(head('Technicy i busy','Uprawnienia, godziny pracy i wyposażenie busów. Avero używa ich przy podpowiadaniu technika i sprawdzaniu zleceń.')+
 '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Technicy</h3>'+SP+sch(ic(WARN,12,'var(--warning)')+'1 uprawnienie wygasa','Kacper Nowak · SEP E1 31 gru')+'</div>'+
 card(tbl('minmax(0,1fr) minmax(0,1.2fr) 92px 84px 64px',[('Osoba',''),('Uprawnienia',''),('Godziny',''),('Bus',''),('Koszt h','text-align:right')],T_ROWS,'Technicy'),'4px 4px')+
 '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Koszt godziny widzi tylko administrator — służy do liczenia marży zleceń i raportów.</span></section>'+
 '<section style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;align-items:center;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Busy</h3>'+SP+btn('Dodaj bus','Nowy pojazd',PLUS,'var(--bg-subtle)')+'</div>'+
 card(tbl('84px minmax(0,1fr) minmax(0,1.2fr) 128px 110px',[('Rejestracja',''),('Pojazd',''),('Czynnik na pokładzie',''),('Waga',''),('Badanie i OC','')],B_ROWS,'Busy'),'4px 4px')+
 '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Stany butli zmieniają wydania RW i ważenia — tu tylko podgląd. Minimum na bus ustawia się w Magazynie → W samochodach.</span></section>')

# =========== MÓJ PROFIL
sess=lambda icon,n,d,cur=False: (f'<div style="display:flex;align-items:center;gap:10px;min-height:44px">{ic(icon,16,"var(--text-tertiary)")}<span style="flex:1 1 auto;display:flex;flex-direction:column"><span>{n}</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{d}</span></span>'
                                  +(sch(dot('var(--success)')+'to urządzenie','Bieżąca sesja','var(--bg-surface)') if cur else '<button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)">Wyloguj</button>')+'</div>')
me=(head('Profil','Twoje dane w Avero. Imię i inicjały widzą inni na zleceniach, w planowaniu i w historii zmian.')+
 section('Dane',
   frow('Zdjęcie','<div style="display:flex;align-items:center;gap:12px">'+cav('PK','#1B1A19',48,16)+btn('Zmień','Zdjęcie lub inicjały',UPL)+'</div>')+sep()+
   frow('Imię i nazwisko','<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px">'+inp('Pascal','Imię')+inp('Kranz','Nazwisko')+'</div>')+sep()+
   frow('E-mail logowania',flex(inp('pascal@kranz-hvacr.pl','E-mail logowania','280px',icon=MAIL),sch(ic(CHECK,12,'var(--success)')+'potwierdzony','Adres potwierdzony w Supabase Auth','var(--bg-surface)')),'Zmiana wymaga potwierdzenia nowego adresu')+sep()+
   frow('Telefon',inp('+48 600 000 000','Telefon','220px',icon=PHONE),'Widoczny dla zespołu')+sep()+
   frow('Podpis e-maili','<textarea rows="3" style="width:100%;padding:8px 10px;border:0;border-radius:10px;background:var(--bg-subtle);font:inherit;line-height:20px;color:var(--text-primary);resize:vertical">Pascal Kranz\nKranz HVACR · +48 600 000 000</textarea>','Pod ofertami i wiadomościami do klientów'))+
 section('Bezpieczeństwo',
   frow('Hasło',flex(btn('Zmień hasło','Wyślemy link na e-mail logowania',KEY),'<span style="font-size:12px;color:var(--text-tertiary)">ostatnia zmiana 2 mar</span>'))+sep()+
   frow('Aktywne sesje','<div style="display:flex;flex-direction:column">'+sess(LAPTOP,'Chrome · macOS','Gdynia · teraz',True)+sess(PHONEI,'Safari · iPhone','Gdynia · wczoraj 18:40')+'</div>'+'<div><button type="button" class="ghost" style="height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--danger)">Wyloguj wszystkie inne</button></div>'))+
 savebar('Rolę i dostęp zmienia administrator w Użytkownikach i rolach.'))

# =========== POWIADOMIENIA
def prow(icon,col,n,d,app,mail,push):
    t=lambda v,l: (tog(v,l) if v is not None else f'<span title="Wkrótce — aplikacja na telefon" style="color:var(--text-tertiary)">—</span>')
    return (f'<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 92px 92px 92px;align-items:center;min-height:52px;padding:0 8px;border-top:1px solid var(--edge)">'
            f'<span style="display:flex;gap:10px;align-items:center;min-width:0">{ic(icon,16,col)}<span style="display:flex;flex-direction:column;min-width:0"><span>{n}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-tertiary)">{d}</span></span></span>'
            f'<span style="display:flex;justify-content:center">{t(app,n+" w aplikacji")}</span><span style="display:flex;justify-content:center">{t(mail,n+" e-mailem")}</span><span style="display:flex;justify-content:center">{t(push,n+" push")}</span></div>')
pow_=(head('Powiadomienia','Co trafia do Twojego dzwonka i na e-mail. Ustawienia dotyczą tylko Ciebie.',btn('Historia','Centrum powiadomień  G N',BELL,bg='var(--bg-subtle)'))+
 '<section style="display:flex;flex-direction:column;gap:8px">'+
 '<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--bg-raised)">'+ic(MAIL,16,'#3B82D6')+'<span style="flex:1 1 auto;display:flex;flex-direction:column"><span style="font-weight:500">E-mail z powiadomieniami</span><span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Na pascal@kranz-hvacr.pl · bez nazw klientów i kwot, tylko kategoria i link</span></span>'+btn('Wyślij test','Testowa wiadomość na Twój adres')+tog(True,'E-mail z powiadomieniami')+'</div>'+
 card('<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 92px 92px 92px;height:28px;align-items:center;padding:0 8px;font-size:12px;color:var(--text-tertiary)"><span>Kategoria</span><span style="text-align:center">W aplikacji</span><span style="text-align:center">E-mail</span><span style="text-align:center">Telefon</span></div>'+
   prow(CHECK,'#5E6AD2','Moje zadania','na dziś i po terminie',True,True,None)+
   prow(WARN,'#D6453D','Pilny serwis','zgłoszenia z wysokim priorytetem',True,True,None)+
   prow(CYC,'#2BB3B1','Przeglądy','w ciągu 30 dni i zaległe',True,False,None)+
   prow(FILE,'#5E6AD2','Oferty','klient otworzył, zaakceptował lub prosi o zmianę',True,True,None)+
   prow(WALLET,'#2F9E5B','Płatności','wpływ zaliczki, faktura po terminie',True,False,None)+
   prow(BOX,'#3B82D6','Magazyn','stan poniżej minimum, dostawa przyjęta',False,False,None),'4px 8px')+
 '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Kolumna „Telefon” zadziała po wydaniu aplikacji mobilnej.</span></section>'+
 section('Kiedy',
   frow('Cisza nocna',flex(tog(True,'Cisza nocna'),inp('20:00','Od','90px'),'<span style="color:var(--text-tertiary)">–</span>',inp('7:00','Do','90px'),sch(ic(WARN,12,'#D6453D')+'pilny serwis zawsze','Pilne zgłoszenia przychodzą także w ciszy nocnej','var(--bg-surface)')))+sep()+
   frow('Podsumowanie dnia',flex(tog(True,'Podsumowanie dnia e-mailem'),'<span>E-mail o</span>',inp('7:00','Godzina podsumowania','90px'),'<span style="color:var(--text-secondary)">w dni robocze</span>'),'Zamiast pojedynczych e-maili o przeglądach i płatnościach'))+
 savebar('Wyłączenie kategorii nie usuwa historii i nie zmienia zadań ani zgłoszeń.'))

# =========== WYGLĄD
def thumb(dark):
    bg,sh,sf,sb,tx='#0F0F0E' if dark else '#FBFBFA','#0B0B0A' if dark else '#F5F4F2','#171716' if dark else '#FFFFFF','#1F1E1D' if dark else '#EDECE9','#EEEDEB' if dark else '#1B1A19'
    return (f'<svg viewBox="0 0 160 96" width="100%" aria-hidden="true" style="display:block;border-radius:10px"><rect width="160" height="96" fill="{sh}"></rect><rect x="38" y="8" width="116" height="82" rx="6" fill="{sf}"></rect>'
            f'<rect x="8" y="10" width="22" height="4" rx="2" fill="{sb}"></rect><rect x="8" y="20" width="18" height="4" rx="2" fill="{sb}"></rect><rect x="8" y="30" width="20" height="4" rx="2" fill="{sb}"></rect>'
            f'<rect x="46" y="16" width="50" height="6" rx="3" fill="{tx}" opacity=".8"></rect><rect x="46" y="30" width="98" height="8" rx="4" fill="{sb}"></rect><rect x="46" y="42" width="98" height="8" rx="4" fill="{sb}"></rect><rect x="46" y="54" width="70" height="8" rx="4" fill="{sb}"></rect><rect x="120" y="72" width="26" height="10" rx="5" fill="#5E6AD2"></rect></svg>')
def tcard(name,svg,on,tip):
    return (f'<button type="button" role="radio" aria-checked="{str(on).lower()}" title="{tip}" style="flex:1 1 0;display:flex;flex-direction:column;gap:8px;padding:8px;border:0;border-radius:14px;background:var(--bg-raised);{"box-shadow:inset 0 0 0 2px var(--accent);" if on else ""}text-align:left">{svg}'
            f'<span style="display:flex;align-items:center;gap:8px;padding:0 4px 2px">{"<span style=\"width:16px;height:16px;border-radius:50%;background:var(--accent);display:inline-flex;align-items:center;justify-content:center\"><span style=\"width:6px;height:6px;border-radius:50%;background:#fff\"></span></span>" if on else "<span style=\"width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--border-strong)\"></span>"}<span style="font-weight:500">{name}</span></span></button>')
half=('<svg viewBox="0 0 160 96" width="100%" aria-hidden="true" style="display:block;border-radius:10px"><defs><clipPath id="lh"><rect width="80" height="96"></rect></clipPath><clipPath id="rh"><rect x="80" width="80" height="96"></rect></clipPath></defs>'
      '<g clip-path="url(#lh)">'+thumb(False).split('style="display:block;border-radius:10px">')[1].replace('</svg>','')+'</g><g clip-path="url(#rh)">'+thumb(True).split('style="display:block;border-radius:10px">')[1].replace('</svg>','')+'</g></svg>')
wyg=(head('Wygląd','Jak Avero wygląda na tym urządzeniu.')+
 '<section style="display:flex;flex-direction:column;gap:8px"><h3 style="margin:0;font-size:15px;line-height:22px;font-weight:600">Motyw</h3>'
 '<div role="radiogroup" aria-label="Motyw" style="display:flex;gap:12px">'+tcard('Jasny',thumb(False),True,'Motyw jasny')+tcard('Ciemny',thumb(True),False,'Motyw ciemny')+tcard('Jak system',half,False,'Zgodnie z ustawieniem systemu (nowość — dziś program ma tylko jasny i ciemny)')+'</div>'
 '<div style="display:flex;align-items:center;gap:10px;padding:4px 2px">'+tog(False,'Zapamiętaj na koncie')+'<span>Zapamiętaj na koncie</span><span style="font-size:12px;color:var(--text-tertiary)">— ten sam motyw na komputerze i telefonie (dziś zapisywany tylko w tej przeglądarce)</span></div></section>'+
 section('Układ',
   frow('Gęstość list',seg([('Zwykła','Wiersze 36–44 px'),('Kompaktowa','Wiersze 32 px, więcej rekordów na ekranie')],0,'Gęstość list'))+sep()+
   frow('Panel boczny',seg([('Rozwinięty','Ikony i nazwy'),('Zwinięty','Same ikony; rozwija się po najechaniu')],0,'Panel boczny'),'[ — zwiń / rozwiń')+sep()+
   frow('Pierwszy dzień tygodnia',seg([('Poniedziałek',''),('Niedziela','')],0,'Pierwszy dzień tygodnia'),'Kalendarz i planowanie')+sep()+
   frow('Format daty',flex(seg([('20 lis 2026',''),('20.11.2026',''),('2026-11-20','')],0,'Format daty'),'<span style="font-size:12px;color:var(--text-tertiary)">pełna data z dniem tygodnia w podpowiedziach</span>'))+sep()+
   frow('Skróty klawiszowe',flex(btn('Pokaż listę','Wszystkie skróty  ?',KBDI),'<span style="font-size:12px;color:var(--text-tertiary)">⌘K szukaj · C nowe · G + litera przejdź</span>')))+
 '<span style="font-size:12px;line-height:16px;color:var(--text-tertiary)">Wydruki i PDF zawsze w jasnym motywie.</span>')

H=['<sc-if value="{{isUst}}" hint-placeholder-val="{{false}}">',wrap('isUstD','dok',dok),wrap('isUstK','cen',kat),wrap('isUstT','bus',tech),wrap('isUstJ','ja',me),wrap('isUstN','pow',pow_),wrap('isUstW','wyg',wyg),'</sc-if>']
block='\n'.join(H)+'\n'
i=s.index('<sc-if value="{{isZlecV2}}"'); s=s[:i]+block+s[i:]
def rep(x,y):
    global s; assert s.count(x)==1,x[:60]; s=s.replace(x,y)
rep("isUstI: isUst && ustV === 'integracje',","isUstI: isUst && ustV === 'integracje', isUstD: isUst && ustV === 'dokumenty', isUstK: isUst && ustV === 'katalog i marże', isUstT: isUst && ustV === 'technicy i busy', isUstJ: isUst && ustV === 'mój profil', isUstN: isUst && ustV === 'powiadomienia', isUstW: isUst && ustV === 'wygląd',")
rep('"options": ["profil firmy", "użytkownicy", "integracje"]','"options": ["profil firmy", "dokumenty", "katalog i marże", "użytkownicy", "technicy i busy", "integracje", "mój profil", "powiadomienia", "wygląd"]')
open(P,'w').write(s); print('ok',len(s))
