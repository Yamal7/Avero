# Porządki w Mój dzień + spójność nazw w bazie. Uruchamiany ZARAZ po skopiowaniu bazy (przed innymi skryptami),
# bo zmienia dane z pierwszych ekranów (Mój dzień, Zadania, Planowanie, Firmy), a nie późniejsze moduły.
# Scenariusz: piątek 13 lis 2026, 9:14, zalogowana Agnieszka (biuro).
import re
P='design/canvas/Main.dc.html'
s=open(P).read()
s=s.replace('Galeria Bałtycka','Galeria Portowa').replace('galeriabaltycka','galeriaportowa').replace('Grunwaldzka 141','Grunwaldzka 212')   # bez prawdziwych marek
def rep(x,y,n=1):
    global s
    c=s.count(x); assert c==n,(c,x[:70]); s=s.replace(x,y)
# --- 1. ludzie zgodnie z data-scenario.md
for a,b in [('Marek Zieliński','Mateusz Zieliński'),('Kamil Nowicki','Kacper Nowak'),('Patryk Dąbrowski','Piotr Dąbrowski'),('Anna Wiśniewska','Agnieszka Wiśniewska'),('@Anna','@Agnieszka')]:
    s=s.replace(a,b)
# --- 2. bez prawdziwych marek i nazw-zapychaczy
for a,b in [("FR('Hotel Mercure Gdańsk', 'HM',","FR('Hotel Nadmorski', 'HN',"),("'Hotel Mercure Gdańsk', 'HM',","'Hotel Nadmorski', 'HN',"),
            ("FR('Olivia Four', 'OF', ['Biura', 'VRF/VRV', 'Projekt'], 'Gdańsk', 46, 'Projekt PR-12',","FR('Biurowiec Kwadrant', 'BK', ['Biura', 'Chłodnictwo', 'Projekt'], 'Gdynia', 46, 'Projekt PJ-2026-013',"),
            ("'Olivia Four', 'OF',","'Biurowiec Kwadrant', 'BK',"),
            ("PR('Jan Kowalski', 'JK',","PR('Krzysztof Lis', 'KL',"),("PR('Ewa Nowak', 'EN',","PR('Ewa Sobczak', 'ES',"),
            ("FR('Chłodnia Kartuska', 'CK', ['Przemysł', 'Chłodnictwo', 'F-gaz'], 'Gdańsk',","FR('Hotel Oliwski', 'HO', ['Hotele', 'Chłodnictwo', 'F-gaz'], 'Gdańsk',"),
            ("FR('Bistro Przystań', 'BP',","FR('Restauracja Przystań', 'RP',"),
            ("FR('Piekarnia Oliwska', 'PO', ['Gastronomia', 'Chłodnictwo', 'F-gaz'], 'Gdańsk',","FR('Piekarnia Rogal', 'PR', ['Gastronomia', 'Chłodnictwo', 'F-gaz'], 'Gdynia',"),
            ("FR('Przychodnia Morena', 'PM', ['Zdrowie', 'Klimatyzacja', 'Umowa serwisowa'], 'Gdańsk',","FR('Przychodnia Zdrowie', 'PZ', ['Zdrowie', 'Wentylacja', 'Umowa serwisowa'], 'Gdynia',"),
            ("FR('Kancelaria Notarialna Wrzeszcz', 'KW',","FR('Kancelaria Wit', 'KW',")]:
    if a in s: s=s.replace(a,b)
for a,b in [('Hotel Mercure Gdańsk','Hotel Nadmorski'),('Hotel Mercure','Hotel Nadmorski'),('PR-12 VRF Olivia Four','PJ-2026-013 · Biurowiec Kwadrant'),('Olivia Four','Biurowiec Kwadrant'),
            ('Jan Kowalski','Krzysztof Lis'),('Ewa Nowak','Ewa Sobczak'),('Bistro Przystań','Restauracja Przystań'),('Piekarnia Oliwska','Piekarnia Rogal'),('Chłodnia Kartuska','Hotel Oliwski'),('Przychodnia Morena','Przychodnia Zdrowie'),('Kancelaria Notarialna Wrzeszcz','Kancelaria Wit')]:
    s=s.replace(a,b)
for a,b in [('Kamila Nowickiego','Kacpra Nowaka'),('Patryka Dąbrowskiego','Piotra Dąbrowskiego'),('Jana Kowalskiego','Krzysztofa Lisa'),('busie Kamila','busie Kacpra'),('busa Kamila','busa Kacpra'),('do Kamila','do Kacpra'),
            ('</span>Kamil','</span>Kacper'),('</span>Patryk','</span>Piotr'),('</span>Marek','</span>Mateusz'),('>Kamil ','>Kacper '),('>Patryk ','>Piotr '),('>Marek ','>Mateusz '),('ZK/2026/1187','1187/2026'),('Patryka','Piotra'),('Kamila','Kacpra'),('Kamil','Kacper'),('Patryk','Piotr')]:
    s=s.replace(a,b)
import re as _re
for w in ['Mercure','Olivia','Kamil','Patryk','Anna ','Kowalsk']:
    assert w not in s, (w, _re.findall('.{40}'+w+'.{20}', s)[:3])

# --- 2b. Planowanie tego samego dnia: zgłoszenia zgodne z modułem Zgłoszenia
import re as _re2
s=_re2.sub(r'(>Alarm temperatury mroźni, −11 °C</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var\(--text-secondary\)"><span class="ell" style="flex:1 1 auto">)Delikatesy Morskie · Świętojańska',r'\1Przychodnia Zdrowie · Morska',s)
for a,b in [('Alarm temperatury mroźni, −11 °C','Centrala stoi — alarm zamrożenia'),('Alarm mroźni −11 °C','Centrala stoi — alarm zamrożenia'),('>Alarm mroźni<','>Centrala stoi<'),
            ('Delikatesy Morskie, Gdynia, ul. Świętojańska 34, maszynownia','Przychodnia Zdrowie, Gdynia, Morska 105, część zabiegowa'),('Delikatesy Morskie · Świętojańska','Delikatesy Morskie · Starowiejska'),
            ('ZG-0922 · Szron na parowniku komory','ZG-0924 · Oszroniony parownik komory'),('Szron na parowniku komory mroźniczej','Komora mroźnicza — oszroniony parownik'),('ZG-0922','ZG-0924'),
            ('ZG-0921 · Hałas klimakonwektora','ZG-0923 · Klimatyzator kapie'),('Hałas wentylatora klimakonwektora, pok. 214','Klimatyzator kapie wodą na biurko'),('ZG-0921','ZG-0923')]:
    s=s.replace(a,b)
s=s.replace("title: 'Centrala stoi — alarm zamrożenia', place: 'Gdynia, ul. Świętojańska'","title: 'Centrala stoi — alarm zamrożenia', place: 'Gdynia, Morska 105'")
s=s.replace("title: 'Agregat Bitzer 4FES-5Y', place: 'Gdynia, ul. Świętojańska 34'","title: 'Agregat Bitzer 4FES-5Y', place: 'Gdynia, Starowiejska 12'")
s=s.replace('Komora mroźnicza — oszroniony parownik</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Restauracja Przystań · Gdynia','Komora mroźnicza — oszroniony parownik</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Piekarnia Rogal · Gdynia')
s=s.replace('Klimatyzator kapie wodą na biurko</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Hotel Nadmorski','Klimatyzator kapie wodą na biurko</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Biuro Bilans · Gdynia')
s=s.replace('>Szron na parowniku komory<','>Oszroniony parownik<').replace('>Hałas klimakonwektora<','>Klimatyzator kapie<')
# --- 2c. Resztki spoza scenariusza (21 lis)
# UR-3107 = lodziarka (21,2 t); agregat Bitzer 4FES-5Y w bazie dostaje własny numer UR-3111
_out=[];_i=0
for _m in _re2.finditer('UR-3107',s):
    _w=s[max(0,_m.start()-300):_m.end()+300]
    _keep=any(k in _w for k in ('21,2','lodziar','ZS-1047','Starowiejska 12, Gdynia ·','(12 lis)'))
    _out.append(s[_i:_m.start()]); _out.append('UR-3107' if _keep else 'UR-3111'); _i=_m.end()
_out.append(s[_i:]); s=''.join(_out)
for a,b in [('ul. Świętojańska 34','ul. Starowiejska 12'),('Świętojańska 34','Starowiejska 12'),
            ("Tip: 'Alarm temperatury −11 °C · zgłoszenie ZG-0920'","Tip: 'Ostatni alarm temperatury 2 lis · zamknięty'"),
            ('Kontrola szczelności, 52,4 t CO₂e</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Piekarnia Rogal · Oliwa','Kontrola szczelności, 17,1 t CO₂e</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Piekarnia Rogal · Gdynia'),
            ('<span class="num" style="color:var(--danger);font-weight:500">3 dni po terminie</span></span><span class="ell" style="font-weight:500">Kontrola szczelności, 17,1 t','<span class="num" style="color:var(--text-secondary)">do 9 gru</span></span><span class="ell" style="font-weight:500">Kontrola szczelności, 17,1 t'),
            ('Błąd E7 jednostki zewnętrznej</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">WM Grunwaldzka 186 · Wrzeszcz','Błąd E7 jednostki zewnętrznej</span><span style="display:flex;gap:8px;font-size:12px;line-height:16px;color:var(--text-secondary)"><span class="ell" style="flex:1 1 auto">Kancelaria Wit · Gdańsk'),
            ("FR('WM Grunwaldzka 186', 'WG', ['Wspólnota', 'Klimatyzacja'], 'Gdańsk'","FR('Wspólnota Kasztanowa 7', 'WK', ['Wspólnota', 'Wentylacja'], 'Rumia'"),
            ("'WM Grunwaldzka 186', 'WG'","'Wspólnota Kasztanowa 7', 'WK'"),
            ("FR('Deweloper Nadmorski', 'DN', ['Deweloper', 'Pompy ciepła', 'Projekt'], 'Reda', 0, 'Brak', 'none'","FR('Osiedle Leśne Zacisze', 'LZ', ['Deweloper', 'Pompy ciepła', 'Projekt'], 'Chwaszczyno', 6, 'Projekt PJ-2026-008', 'proj'"),
            ("'Deweloper Nadmorski', 'DN'","'Osiedle Leśne Zacisze', 'LZ'")]:
    assert a in s, a[:60]
    s=s.replace(a,b)
s=s.replace("DV('UR-3108', 'Agregat Bitzer 4DES-7Y'","DV('UR-3107', 'Lodziarka', 'sala sprzedaży, agregat wbudowany', 'R404A', '5,4 kg', 'co 12 mies. · 12 lis', 'late', 'ok', { fgTip: '21,2 t CO₂e · kontrola po terminie 1 dzień' }),\n        DV('UR-3108', 'Agregat Bitzer 4DES-7Y'",1)
for bad in ('Świętojańska 34','Deweloper Nadmorski'):
    assert bad not in s, bad
# --- 3. dane dnia
def block(start,end):
    i=s.index(start); j=s.index(end,i)+len(end); return i,j
i,j=block("    const visits = [","\n    ];")
s=s[:i]+"""    const visits = [
      visit('07:30', 'ZS-1038', 'Przegląd 4 kasetonów', 'Hotel Nadmorski', 4, ['MZ']),
      visit('08:00', 'ZS-1042', 'Przegląd 6 jednostek VRV', 'Galeria Portowa', 3, ['MZ', 'TL']),
      visit('09:30', 'ZS-1047', 'Brak chłodzenia w lodziarce', 'Delikatesy Morskie', 2, ['KN'], { sel: true }),
      visit('12:30', 'ZS-1045', 'Montaż split Daikin Perfera 3,5 kW', 'Krzysztof Lis · Reda', 1, ['TL'], { exc: 'w', label: 'Brak R32 w busie' }),
      visit('13:00', 'ZS-1039', 'Agregat często się załącza, Bitzer R404A', 'Hotel Oliwski', 1, ['PD']),
      visit('14:00', 'ZS-1049', 'Uruchomienie pompy ciepła Panasonic 9 kW', 'Ewa Sobczak · Rumia', 1, ['KN']),
      visit('15:30', 'ZS-1033', 'Wymiana płyty sterownika, gwarancja Mitsubishi', 'Kancelaria Wit · Gdańsk', 1, ['PD'], { exc: 'w', label: 'Czeka na części' })
    ];"""+s[j:]
i,j=block("    const risk = [","\n    ];")
s=s[:i]+"""    const risk = [
      tk('ZG-0920', 'Centrala wentylacyjna stoi — alarm zamrożenia', 'Przychodnia Zdrowie', 'Krytyczny', '0:52 do reakcji', 'warn', 'UM-2025-022 · reakcja 4 h, do 10:06 · proponowany Piotr na 9:30')
    ];"""+s[j:]
i,j=block("    const unassigned = [","\n    ];")
s=s[:i]+"""    const unassigned = [
      tk('ZG-0923', 'Klimatyzator kapie wodą na biurko', 'Biuro Rachunkowe Bilans · Gdynia', 'Normalny', '35 min', 'calm', 'Z portalu klienta o 8:41 · bez umowy'),
      tk('ZG-0924', 'Komora mroźnicza — oszroniony parownik', 'Piekarnia Rogal · Gdynia', 'Normalny', '19 min', 'calm', 'Telefon o 8:55 · przyjęła Agnieszka')
    ];
    const inbox = [
      tk('e-mail', 'Re: Agregat często się załącza', 'Ewa Malinowska · Hotel Oliwski', 'Wysoki', '→ ZG-0912', 'warn', 'Wiadomość 9:02 · komora 9 °C, dostawa o 11:00 — propozycja: przesuń Piotra na 10:45'),
      tk('e-mail', 'Centrala stoi — alarm zamrożenia', 'Robert Kamiński · Przychodnia Zdrowie', 'Krytyczny', 'ZG-0920', 'calm', 'Wiadomość 6:06 · zgłoszenie utworzone 7:02'),
      tk('portal', 'Klimatyzator kapie wodą na biurko', 'Hanna Bilska · Biuro Bilans', 'Normalny', 'ZG-0923', 'calm', 'Z portalu 8:41 · zgłoszenie utworzone automatycznie'),
      tk('formularz', 'Wycena klimatyzacji do mieszkania', 'Joanna Krawczyk', 'Normalny', 'zapytanie ofertowe', 'calm', 'Formularz 8:20 · przenieś do Leadów')
    ];
    const leads = [
      tk('polecenie', 'Klimatyzacja 2 gabinetów', 'Gabinet DentSopot · Sopot', 'Normalny', 'kontakt do 9:50', 'warn', 'Zostało 36 min · cel: pierwszy kontakt w 2 h'),
      tk('telefon', 'Pompa ciepła zamiast gazu', 'Adam Wróbel · Chwaszczyno', 'Normalny', 'oddzwonić 10:00', 'calm', 'Klient prosił o telefon po 10:00 · Pascal'),
      tk('formularz', 'Klimatyzacja mieszkania 64 m²', 'Joanna Krawczyk · Redłowo', 'Normalny', 'kontakt do 10:20', 'calm', 'Zostało 1 h 06 min')
    ];"""+s[j:]
i,j=block("    const late = [","\n    ];")
s=s[:i]+"""    const late = [
      tk('UR-3107', 'Kontrola szczelności lodziarki · 21,2 t CO₂e', 'Delikatesy Morskie', 'Wysoki', '1 dzień po terminie', 'late', 'Termin: czwartek 12 listopada · Kacper jest dziś na miejscu (ZS-1047) — dołącz kontrolę'),
      tk('SZ-0183', 'Wycena szafy mroźniczej', 'Piekarnia Rogal', 'Normalny', '2 dni po terminie', 'late', 'Obiecana klientowi na środę 11 listopada · Szanse')
    ];"""+s[j:]
i,j=block("    const mentions = [","\n    ];")
s=s[:i]+"""    const mentions = [
      { ini: 'MZ', who: 'Mateusz Zieliński', ref: 'ZS-1042', refTitle: 'Przegląd 6 jednostek VRV', ago: '12 min', full: '13 listopada 2026, 09:02', text: '@Agnieszka potrzebuję zdjęcia tabliczki agregatu, nie zgadza się model sprężarki.' },
      { ini: 'TL', who: 'Tomasz Lewandowski', ref: 'OF-2026-118', refTitle: 'Pompa ciepła, dom 160 m²', ago: '1 godz.', full: '13 listopada 2026, 08:21', text: '@Agnieszka pan Zieliński dzwoni o 11:30 — pyta o hałas jednostki i bufor w wariancie A. Przygotujesz porównanie B i C?' },
      { ini: 'KN', who: 'Kacper Nowak', ref: 'ZG-0924', refTitle: 'Oszroniony parownik', ago: '2 godz.', full: '13 listopada 2026, 07:05', text: '@Agnieszka byłem tam w zeszłym tygodniu, to raczej grzałka odszraniania. Wezmę ją z magazynu.' }
    ];"""+s[j:]
rep("const keys = ['dzis','sla','bez','late','wzm',","const keys = ['dzis','sla','bez','inb','ld','late','wzm','w4',")
rep("unassignedCount: unassigned.length, lateCount: late.length,","unassignedCount: unassigned.length, inbox, inboxCount: inbox.length, leads, leadsCount: leads.length, lateCount: late.length,")

# --- 4. sekcje listy: kolejność SLA → Wizyty → Bez technika → Skrzynka → Leady → Po terminie → Wzmianki
def section(key):
    i=s.index(f'onClick="{{{{t_{key}}}}}"')
    a=s.rfind('<section style="display:flex;flex-direction:column">',0,i)
    b=s.index('</section>',i)+len('</section>')
    return a,b
a1,b1=section('dzis'); a2,b2=section('sla')
dz=s[a1:b1]; sl=s[a2:b2]
assert b1<=a2
s=s[:a1]+sl+s[b1:a2]+dz+s[b2:]
a,b=section('bez'); bez=s[a:b]
def clone(src,key,title,listv,cnt,btitle,bkey):
    t=src.replace('{{t_bez}}',f'{{{{t_{key}}}}}').replace('{{o_bez}}',f'{{{{o_{key}}}}}').replace('{{r_bez}}',f'{{{{r_{key}}}}}')
    t=t.replace('list="{{unassigned}}"',f'list="{{{{{listv}}}}}"').replace('{{unassignedCount}}',f'{{{{{cnt}}}}}').replace('>Bez technika</h2>',f'>{title}</h2>')
    t=t.replace('aria-label="Nowe zgłoszenie" title="Nowe zgłoszenie  Z"',f'aria-label="{btitle}" title="{btitle}  {bkey}"')
    return t
inb=clone(bez,'inb','Skrzynka','inbox','inboxCount','Nowa wiadomość','N')
ld=clone(bez,'ld','Leady do kontaktu','leads','leadsCount','Nowy lead','L')
s=s[:b]+'\n'+inb+'\n'+ld+s[b:]
# --- 5. widget „Sprzedaż” po „Umowy w tym miesiącu”
i=s.index('onClick="{{t_w3}}"'); a=s.rfind('<section style="border:0;border-radius:14px;background:var(--bg-raised);padding:4px">',0,i); b=s.index('</section>',i)+len('</section>')
w3=s[a:b]
h_i=w3.index('<sc-if value="{{o_w3}}"')
head=w3[:h_i].replace('{{t_w3}}','{{t_w4}}').replace('{{o_w3}}','{{o_w4}}').replace('{{r_w3}}','{{r_w4}}').replace('>Umowy w tym miesiącu</h2>','>Sprzedaż</h2>').replace('aria-label="Dodaj widget" title="Dodaj widget"','aria-label="Otwórz Szanse" title="Otwórz Szanse  G S"')
def wr(label,val,tip,dot=''):
    d=f'<span style="width:6px;height:6px;border-radius:50%;background:{dot};flex:0 0 auto"></span>' if dot else ''
    return f'<a href="#" class="row" title="{tip}" style="display:flex;align-items:center;gap:8px;height:32px;padding:0 8px;border-radius:10px"><span class="ell" style="flex:1 1 auto;color:var(--text-secondary)">{label}</span>{d}<span class="num" style="font-weight:500">{val}</span></a>'
body=('<sc-if value="{{o_w4}}" hint-placeholder-val="{{true}}"><div style="padding:0 0 4px">'+
      wr('Leady do kontaktu','3','Najbliższy termin: DentSopot 9:50 · cel 2 h','var(--warning)')+
      wr('Oferty u klientów','3 · 157 820 zł','OF-2026-118 otwarta 3×, ostatnio wczoraj 21:14')+
      wr('Szanse po terminie','2','Piekarnia Rogal (wycena), Kancelaria Wit (oferta nieotwarta)','var(--danger)')+
      wr('Wygrane w listopadzie','214 300 zł','6 szans · październik 168 900 zł')+'</div></sc-if>\n')
s=s[:b]+'\n'+head+body+'</section>'+s[b:]
rep("total: stan === 'pusty' ? 0 : visits.length + risk.length + unassigned.length + late.length + mentions.length","total: stan === 'pusty' ? 0 : visits.length + risk.length + unassigned.length + inbox.length + leads.length + late.length + mentions.length")
rep("{{total}} spraw","Sprawy: {{total}}")
open(P,'w').write(s); print('ok mojdzien2',len(s))
