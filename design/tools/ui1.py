# Wspólne elementy tabel „jedna linia” (21 lis 2026):
#  - logo(name)  — firma jako kwadratowe logo 20 px, karta podglądu po najechaniu (CSS :hover / :focus-within)
#  - u_ci(path,col) — kolorowa ikona 14 px; kolory z tokenów --ic-* (jasny i ciemny)
#  - th(label,icon,col) — nagłówek kolumny z ikoną
#  - kind(k) — ikona rodzaju prac (chłodnictwo, klimatyzacja, pompy ciepła, wentylacja, VRF, elektryka)
# Używane przez skrypty modułów: exec(open('design/tools/ui1.py').read())

def _u_ic(p, size=14, col='currentColor', sw=1.5):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto;color:{col}">{p}</svg>')

U1 = dict(
    snow='<path d="M2 12h20M12 2v20m-8-6 4-4-4-4m16 8-4-4 4-4M8 4l4 4 4-4M8 20l4-4 4 4"></path>',
    wind='<path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path><path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>',
    flame='<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
    fan='<circle cx="12" cy="12" r="2"></circle><path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4l-4 4M14 12c4 0 7 1 7 4 0 2-2 3-4 2l-4-4M12 14c0 4-1 7-4 7-2 0-3-2-2-4l4-4M10 12c-4 0-7-1-7-4 0-2 2-3 4-2l4 4"></path>',
    zap='<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>',
    layers='<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>',
    bld='<rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"></path>',
    user='<circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 0 0-16 0"></path>',
    pin='<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
    phone='<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    mail='<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>',
    cal='<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>',
    clock='<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
    contract='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path>',
    file='<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path>',
    hash='<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"></path>',
    coin='<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"></path>',
    receipt='<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"></path>',
    box='<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>',
    truck='<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle>',
    tag='<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5"></circle>',
    trend='<path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path>',
    flag='<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><path d="M4 22v-7"></path>',
    shield='<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>',
    gavel='<path d="m14.5 12.5-8 8a2.12 2.12 0 1 1-3-3l8-8"></path><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"></path>',
    alert='<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4M12 17h.01"></path>',
    ret='<path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"></path>',
    send='<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11z"></path><path d="m21.85 2.15-10.94 10.94"></path>',
    key='<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path><path d="m21 2-9.6 9.6"></path><circle cx="7.5" cy="15.5" r="5.5"></circle>',
    eye='<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"></path><circle cx="12" cy="12" r="3"></circle>',
    play='<polygon points="6 3 20 12 6 21 6 3"></polygon>',
    arrow='<path d="M5 12h14M12 5l7 7-7 7"></path>',
    percent='<path d="M19 5 5 19"></path><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle>',
    upl='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5M12 3v12"></path>',
    text='<path d="M17 6.1H3M21 12.1H3M15.1 18H3"></path>',
    list='<path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13"></path>',
    grid='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path>',
    users='<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>',
    gear='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>',
    drop='<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>',
    wrench='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
    cart='<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>',
    bank='<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"></path>',
    portal='<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18M9 21V9"></path>',
    chev='<path d="m9 18 6-6-6-6"></path>',
    check='<path d="M20 6 9 17l-5-5"></path>',
    home='<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
    med='<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path>',
    cup='<path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><path d="M6 2v2M10 2v2M14 2v2"></path>',
    bed='<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"></path>',
)

# Kolory ikon — tokeny --ic-* (wstrzykiwane do .av i .av.dark przez inject_css)
IC_LIGHT = dict(blue='#2F7FE0', teal='#139C93', orange='#E0702A', violet='#8B5CF6', green='#2F9E5B', yellow='#C98A12',
                red='#D6453D', pink='#D6458F', indigo='#5E6AD2', slate='#7C8391')
IC_DARK = dict(blue='#5CA0F0', teal='#3CC2B8', orange='#F0904E', violet='#A98BFA', green='#4CC27A', yellow='#E0A63A',
               red='#EF6A62', pink='#EE74B0', indigo='#7C85E0', slate='#9AA1AD')
def u_C(k): return f'var(--ic-{k})'
def u_ci(name, col='slate', size=14): return _u_ic(U1[name], size, u_C(col) if col in IC_LIGHT else col)

U_KIND = {  # rodzaj prac / instalacji
    'chł': ('snow', 'blue', 'Chłodnictwo'), 'klima': ('wind', 'teal', 'Klimatyzacja'), 'pc': ('flame', 'orange', 'Pompa ciepła'),
    'went': ('fan', 'green', 'Wentylacja'), 'vrf': ('layers', 'violet', 'VRF/VRV'), 'el': ('zap', 'yellow', 'Elektryka'),
}
OBJK = {'hotel': ('bed', 'violet'), 'handel': ('cart', 'blue'), 'biuro': ('bld', 'slate'), 'gastronomia': ('cup', 'orange'),
        'medyczny': ('med', 'red'), 'dom': ('home', 'green'), 'oświata': ('bld', 'yellow'), 'przemysł': ('box', 'slate')}
def u_obj(k, size=14, label=True):
    n, c = OBJK.get(k, ('bld', 'slate'))
    t = f'<span class="ell">{k}</span>' if label else ''
    return f'<span title="Rodzaj obiektu: {k}" style="display:inline-flex;align-items:center;gap:6px;min-width:0">{u_ci(n, c, size)}{t}</span>'
def u_kind(k, size=14):
    n, c, t = U_KIND[k]; return f'<span title="{t}" style="display:inline-flex">{u_ci(n, c, size)}</span>'

# ---------- firmy: logo (kwadrat = firma, koło = osoba prywatna)
# (inicjały, kolor logo, rodzaj, miasto, branża, opiekun, umowa, telefon, ostatni kontakt)
FIRMY = {
 'Delikatesy Morskie': ('DM', '#0E7C86', 'f', 'Gdynia', 'Handel · 18 sklepów', 'Agnieszka W.', 'UM-2025-014 do 31 gru', '+48 58 620 14 10', 'dziś 9:20'),
 'Galeria Portowa': ('GP', '#2F5BD6', 'f', 'Gdańsk', 'Handel · centrum handlowe', 'Agnieszka W.', 'UM-2026-031 do 31 mar 2027', '+48 58 340 22 00', 'dziś 8:05'),
 'Hotel Nadmorski': ('HN', '#B4572E', 'f', 'Gdańsk', 'Hotele', 'Agnieszka W.', 'UM-2026-019 do 30 cze 2027', '+48 58 320 11 50', 'wczoraj'),
 'Biurowiec Kwadrant': ('BK', '#3A3F4B', 'f', 'Gdynia', 'Biura', 'Tomasz L.', 'projekt PJ-2026-013', '+48 58 660 30 30', 'wczoraj'),
 'Osiedle Leśne Zacisze': ('LZ', '#3E8E41', 'f', 'Chwaszczyno', 'Deweloper', 'Tomasz L.', 'projekt PJ-2026-008', '+48 601 440 120', 'wczoraj'),
 'Hotel Oliwski': ('HO', '#7A4BC2', 'f', 'Gdańsk Oliwa', 'Hotele', 'Piotr D.', 'brak umowy', '+48 58 552 08 00', '2 dni temu'),
 'Restauracja Przystań': ('RP', '#D0502E', 'f', 'Gdynia', 'Gastronomia', 'Kacper N.', 'brak umowy', '+48 58 621 77 30', '3 dni temu'),
 'Wspólnota Kasztanowa 7': ('WK', '#6B7F2A', 'f', 'Rumia', 'Wspólnota', 'Agnieszka W.', 'brak umowy', '+48 512 300 410', '4 dni temu'),
 'Przychodnia Zdrowie': ('PZ', '#1F8FCF', 'f', 'Gdynia', 'Zdrowie', 'Agnieszka W.', 'UM-2025-022 do 31 sie 2027', '+48 58 661 40 40', '5 dni temu'),
 'Piekarnia Rogal': ('PR', '#C08A1E', 'f', 'Gdynia', 'Gastronomia', 'Piotr D.', 'brak umowy', '+48 58 623 15 15', 'tydzień temu'),
 'Kancelaria Wit': ('KW', '#5A4636', 'f', 'Gdańsk', 'Biura', 'Agnieszka W.', 'UM-2026-008 do 28 lut 2027', '+48 58 305 60 60', '2 tyg. temu'),
 'Sushi Bar Molo': ('SM', '#C2305A', 'f', 'Sopot', 'Gastronomia', 'Kacper N.', 'brak umowy', '+48 58 550 90 90', 'miesiąc temu'),
 'Hotel Bryza': ('HB', '#1E9E9A', 'f', 'Sopot', 'Hotele', 'Tomasz L.', 'projekt PJ-2026-011', '+48 58 551 20 00', 'wczoraj'),
 'Szkoła Podstawowa nr 4': ('S4', '#3366CC', 'f', 'Rumia', 'Oświata · przetarg', 'Patryk K.', 'projekt PJ-2026-009', '+48 58 671 02 04', '3 dni temu'),
 'Restauracja Port': ('RP', '#8C2F39', 'f', 'Gdynia', 'Gastronomia · usługi wstrzymane', 'Agnieszka W.', 'brak umowy', '+48 58 627 40 40', '30 paź'),
 'Biuro Bilans': ('BB', '#4C6A92', 'f', 'Gdynia', 'Biura', 'Agnieszka W.', 'UM-2026-008 do 30 cze 2027', '+48 58 620 55 55', '22 paź'),
 'Gabinet DentSopot': ('DS', '#2BA39B', 'f', 'Sopot', 'Zdrowie · lead', 'Tomasz L.', 'brak umowy', '+48 601 330 214', 'dziś'),
 'Centrum Medyczne Kaszuby': ('CK', '#2E7D5B', 'f', 'Kartuzy', 'Zdrowie · przetarg', 'Patryk K.', 'brak umowy', '+48 58 681 00 00', '6 lis'),
 'Termo-Bud Pomorze': ('TB', '#E07B00', 'f', 'Gdańsk', 'Dostawca · pompy ciepła', 'Agnieszka W.', 'przelew 14 dni', '+48 58 300 70 70', '20 lis'),
 'Klimatech Gdańsk': ('KG', '#0062A8', 'f', 'Gdańsk', 'Dostawca · klimatyzacja', 'Agnieszka W.', 'przelew 21 dni', '+48 58 340 80 80', '17 lis'),
 'Daikin Polska': ('DK', '#00A0E4', 'f', 'Warszawa', 'Producent', 'Agnieszka W.', 'serwis autoryzowany', '+48 22 319 90 00', '10 lis'),
 'Hala Portowa Logistyka': ('HP', '#4B5563', 'f', 'Gdynia', 'Przemysł · logistyka', 'Jan K.', 'UM-E-2026-004', '+48 58 627 11 11', 'dziś'),
}
def _hash_col(name):
    pal = ['#0E7C86', '#2F5BD6', '#B4572E', '#7A4BC2', '#3E8E41', '#C2305A', '#1F8FCF', '#C08A1E', '#5A4636', '#6B7F2A']
    return pal[sum(map(ord, name)) % len(pal)]
OSOBY = {'Ewa Sobczak', 'Jolanta Mazur', 'Marek Zieliński', 'Joanna Lewicka', 'Krzysztof Lis', 'Hanna Bilska', 'Anna Rogal',
         'Karolina Mazur', 'Tomasz Wrona', 'Paweł Grabowski'}
def u_firm(name):
    if name in FIRMY: return FIRMY[name]
    ini = ''.join(w[0] for w in name.replace('dr ', '').split()[:2] if w[0].isalnum()).upper()
    if name in OSOBY: return (ini, _hash_col(name), 'o', '', 'Klient indywidualny', '', '', '', '')
    return (ini, _hash_col(name), 'f', '', '', '', '', '', '')

def _hc(name, f, open_):
    ini, col, k, city, cat, op, um, tel, last = f
    rad = '8px' if k == 'f' else '50%'
    rows = []
    if city: rows.append((u_ci('pin', 'red', 14), city))
    if op: rows.append((u_ci('user', 'indigo', 14), f'Opiekun: {op}'))
    if um: rows.append((u_ci('contract', 'green', 14), um))
    if tel: rows.append((u_ci('phone', 'teal', 14), f'<span class="num">{tel}</span>'))
    if last: rows.append((u_ci('clock', 'slate', 14), f'Ostatni kontakt: {last}'))
    li = ''.join(f'<span style="display:flex;align-items:center;gap:8px;min-width:0">{i}<span class="ell">{t}</span></span>' for i, t in rows)
    return (f'<span class="hc{" open" if open_ else ""}" role="tooltip">'
            f'<span style="display:flex;align-items:center;gap:10px"><span aria-hidden="true" style="width:32px;height:32px;flex:0 0 auto;border-radius:{rad};background:{col};color:#fff;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center">{ini}</span>'
            f'<span style="display:flex;flex-direction:column;min-width:0"><span class="ell" style="font-weight:600;color:var(--text-primary)">{name}</span><span class="ell" style="font-size:12px;line-height:16px;color:var(--text-secondary)">{cat}</span></span></span>'
            f'<span style="display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:16px;color:var(--text-secondary)">{li}</span>'
            f'<span style="display:flex;align-items:center;gap:6px;padding-top:8px;border-top:1px solid var(--edge);font-size:12px;line-height:16px;color:var(--text-tertiary)">Otwórz kartę klienta<span style="flex:1 1 auto"></span><kbd style="font-family:var(--font-mono,monospace);font-size:11px">↵</kbd></span></span>')

def u_logo(name, size=20, open_=False, label=False):
    """Logo firmy w komórce. label=True dodaje nazwę obok (np. kolumna Firma w rejestrze)."""
    f = u_firm(name); ini, col, k = f[0], f[1], f[2]
    rad = '6px' if k == 'f' else '50%'
    fs = 9 if size <= 20 else 11
    lab = f'<span class="ell" style="font-weight:500">{name}</span>' if label else ''
    return (f'<span class="lg" tabindex="0" aria-label="{name}" style="display:inline-flex;align-items:center;gap:8px;min-width:0">'
            f'<span aria-hidden="true" style="width:{size}px;height:{size}px;flex:0 0 auto;border-radius:{rad};background:{col};color:#fff;font-size:{fs}px;font-weight:600;letter-spacing:0;display:inline-flex;align-items:center;justify-content:center">{ini}</span>'
            f'{lab}{_hc(name, f, open_)}</span>')

def u_th(label, icon=None, col='slate', align='left', tip=''):
    i = u_ci(icon, col, 14) if icon else ''
    jc = 'flex-end' if align == 'right' else ('center' if align == 'center' else 'flex-start')
    t = f' title="{tip}"' if tip else ''
    return f'<span{t} style="display:flex;align-items:center;justify-content:{jc};gap:6px;min-width:0;white-space:nowrap;overflow:hidden">{i}<span style="overflow:hidden;text-overflow:ellipsis">{label}</span></span>'

def u_mono(t, col='var(--text-tertiary)'):
    return f'<span class="mono ell" style="font-size:12px;color:{col}">{t}</span>'

HC_CSS = ('.av .lg{position:relative;cursor:default;outline:none}'
          '.av .lg .hc{display:none;position:absolute;left:-8px;top:calc(100% + 8px);z-index:40;width:280px;flex-direction:column;gap:10px;padding:12px;'
          'border-radius:14px;border:1px solid var(--edge);background:var(--bg-surface);box-shadow:var(--shadow-pop);font-size:13px;line-height:20px;'
          'font-weight:400;color:var(--text-primary);text-align:left;white-space:normal;cursor:default}'
          '.av .lg:hover .hc,.av .lg:focus-visible .hc,.av .lg .hc.open{display:flex}'
          '.av .lg:focus-visible>span:first-child{box-shadow:0 0 0 2px var(--accent)}'
          '.av .row1{height:36px;min-height:36px}')

def inject_css(s):
    if '--ic-blue' in s: return s
    light = ';'.join(f'--ic-{k}:{v}' for k, v in IC_LIGHT.items())
    dark = ';'.join(f'--ic-{k}:{v}' for k, v in IC_DARK.items())
    s = s.replace('--bg-raised:#F4F3F0;', '--bg-raised:#F4F3F0;' + light + ';', 1)
    s = s.replace('--bg-raised:#232220}', '--bg-raised:#232220;' + dark + '}', 1)
    s = s.replace('</style>', HC_CSS + '</style>', 1)
    assert '--ic-blue' in s and '.av .lg .hc' in s
    return s
