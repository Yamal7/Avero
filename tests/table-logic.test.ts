import { describe, expect, it } from 'vitest';
import { logoInitials } from '@/lib/table/initials';
import { BRAND_PALETTE, BRAND_EXCLUDED, brandColor } from '@/lib/table/brand';
import { cellPin, columnLayout, flexMin } from '@/lib/table/columns';
import { arrowScrollTarget } from '@/lib/table/scroll';
import { hoverCardPosition } from '@/lib/table/hover-card';

describe('logoInitials — inicjały logo (DECISIONS 2026-11-21)', () => {
  it('firma: pierwsze litery dwóch pierwszych wyrazów', () => {
    expect(logoInitials('Delikatesy Morskie', 'company')).toBe('DM');
    expect(logoInitials('Hotel Nadmorski Gdańsk', 'company')).toBe('HN');
  });
  it('firma: pomija formę prawną, cudzysłowy i krótkie łączniki', () => {
    expect(logoInitials('Klimatech Gdańsk Sp. z o.o.', 'company')).toBe('KG');
    expect(logoInitials('„Termo-Bud” Pomorze S.A.', 'company')).toBe('TP');
    expect(logoInitials('Szkoła Podstawowa nr 4', 'company')).toBe('SP');
  });
  it('firma z jednego wyrazu: dwie pierwsze litery', () => {
    expect(logoInitials('Daikin', 'company')).toBe('DA');
    expect(logoInitials('Klimatech Sp. z o.o.', 'company')).toBe('KL');
  });
  it('osoba: imię i nazwisko (pierwszy i ostatni wyraz), bez tytułów', () => {
    expect(logoInitials('Jan Maria Kowalski', 'person')).toBe('JK');
    expect(logoInitials('dr inż. Anna Rogal', 'person')).toBe('AR');
  });
  it('osoba z jednego wyrazu: jedna litera', () => {
    expect(logoInitials('Ewa', 'person')).toBe('E');
  });
  it('polskie znaki — wielkie litery wg zasad polskich', () => {
    expect(logoInitials('łukasz żak', 'person')).toBe('ŁŻ');
    expect(logoInitials('Ślusarnia Ąbc', 'company')).toBe('ŚĄ');
    expect(logoInitials('ćma', 'company')).toBe('ĆM');
  });
  it('cyfry są dozwolone, pusta nazwa daje „?”', () => {
    expect(logoInitials('4 Pory Roku', 'company')).toBe('4P');
    expect(logoInitials('   ', 'company')).toBe('?');
    expect(logoInitials('— · —', 'person')).toBe('?');
  });
});

describe('brandColor — kolor marki z nazwy', () => {
  it('ta sama nazwa zawsze daje ten sam kolor (także po spacjach i wielkości liter)', () => {
    const a = brandColor('Hotel Oliwski');
    for (let i = 0; i < 5; i++) expect(brandColor('Hotel Oliwski')).toBe(a);
    expect(brandColor('  hotel oliwski ')).toBe(a);
  });
  it('wynik jest zawsze tokenem z palety, bez kolorów wykluczonych przez kontrast', () => {
    const names = Array.from({ length: 300 }, (_, i) => `Firma ${i} Gdynia`);
    for (const n of names) {
      expect(BRAND_PALETTE).toContain(brandColor(n));
      expect(BRAND_EXCLUDED).not.toContain(brandColor(n));
    }
  });
  it('rozkład: każdy kolor palety występuje, żaden nie dominuje', () => {
    const names = Array.from({ length: 600 }, (_, i) => `Klient ${i} ${'ąćęłńóśźż'[i % 9]}`);
    const counts = new Map<string, number>();
    for (const n of names) counts.set(brandColor(n), (counts.get(brandColor(n)) ?? 0) + 1);
    expect(counts.size).toBe(BRAND_PALETTE.length);
    const expected = names.length / BRAND_PALETTE.length;
    for (const c of counts.values()) {
      expect(c).toBeGreaterThan(expected * 0.6);
      expect(c).toBeLessThan(expected * 1.4);
    }
  });
  it('podobne nazwy nie dostają masowo tego samego koloru', () => {
    const colors = new Set(['Hotel Bryza', 'Hotel Oliwski', 'Hotel Nadmorski', 'Hotel Gdańsk', 'Hotel Sopot', 'Hotel Rumia'].map(brandColor));
    expect(colors.size).toBeGreaterThanOrEqual(3);
  });
});

describe('columnLayout — minimalne szerokości i przypięte kolumny (tabele_przewijane.py)', () => {
  it('flexMin: 140 px × fr, krok 8 px, w granicach 112–176', () => {
    expect(flexMin(1)).toBe(144);
    expect(flexMin(0.5)).toBe(112);
    expect(flexMin(0.8)).toBe(112);
    expect(flexMin(1.2)).toBe(168);
    expect(flexMin(2)).toBe(176);
    for (const fr of [0.3, 0.9, 1, 1.1, 1.25, 1.5, 3]) {
      const m = flexMin(fr);
      expect(m % 8).toBe(0);
      expect(m).toBeGreaterThanOrEqual(112);
      expect(m).toBeLessThanOrEqual(176);
    }
  });
  it('główna kolumna ma minimum 220 px, kolumny stałe zostają stałe; ścieżka = treść + odstęp komórki', () => {
    const l = columnLayout([{ key: 'nr', width: 56 }, { key: 'logo', width: 20 }, { key: 'title', fr: 2, main: true }, { key: 'city', fr: 1 }, { key: 'due', width: 76 }]);
    // odstęp: 12 px po prawej każdej komórki, pierwsza komórka +8 px z lewej
    expect(l.tracks).toEqual([56 + 20, 20 + 12, 220 + 12, 144 + 12, 76 + 12]);
    expect(l.template).toBe('76px 32px minmax(232px, 2fr) minmax(156px, 1fr) 88px');
    expect(l.minWidth).toBe(76 + 32 + 232 + 156 + 88);
    expect(l.mainIndex).toBe(2);
  });
  it('przypięte są kolumny do głównej włącznie, z narastającym przesunięciem left', () => {
    const l = columnLayout([{ key: 'nr', width: 56 }, { key: 'logo', width: 20 }, { key: 'title', fr: 1, main: true }, { key: 'x', fr: 1 }]);
    expect(l.pinnedLeft).toEqual([0, 76, 108]);
    expect(l.pinnedWidth).toBe(76 + 32 + 232);
    expect(cellPin(l, 0)).toEqual({ left: 0, edge: false });
    expect(cellPin(l, 1)).toEqual({ left: 76, edge: false });
    expect(cellPin(l, 2)).toEqual({ left: 108, edge: true });
    expect(cellPin(l, 3)).toBeUndefined();
  });
  it('bez wskazania główna = najszersza (największe fr) kolumna elastyczna, pierwsza z nich', () => {
    const l = columnLayout([{ key: 'a', width: 32 }, { key: 'b', fr: 2 }, { key: 'c', fr: 1 }, { key: 'd', fr: 2 }]);
    expect(l.mainIndex).toBe(1);
  });
  it('początki kolumn za przypiętymi (do przewijania ←/→)', () => {
    const l = columnLayout([{ key: 'nr', width: 52 }, { key: 'title', fr: 1, main: true }, { key: 'a', width: 100 }, { key: 'b', width: 100 }]);
    expect(l.starts).toEqual([72 + 232, 72 + 232 + 112]);
  });
  it('własne minimum spoza 112–176 albo nie co 8 px jest błędem', () => {
    expect(() => columnLayout([{ key: 'm', fr: 1, main: true }, { key: 'x', fr: 1, min: 100 }])).toThrow();
    expect(() => columnLayout([{ key: 'm', fr: 1, main: true }, { key: 'x', fr: 1, min: 130 }])).toThrow();
    expect(columnLayout([{ key: 'm', fr: 1, main: true }, { key: 'x', fr: 1, min: 160 }]).tracks[1]).toBe(172);
  });
  it('kolumna elastyczna przed główną jest błędem (przesunięcie przypiętej kolumny byłoby nieznane)', () => {
    expect(() => columnLayout([{ key: 'a', fr: 1 }, { key: 'm', fr: 1, main: true }])).toThrow();
  });
});

describe('arrowScrollTarget — ←/→ przesuwa o kolumnę', () => {
  // przypięte 300 px, kolumny za nimi zaczynają się na 300, 450, 600, 750; widok 600 px, treść 1000 px → max 400
  const base = { pinnedWidth: 300, starts: [300, 450, 600, 750], maxScroll: 400 };
  it('→ od początku: następna kolumna wyrównana do krawędzi przypiętych', () => {
    expect(arrowScrollTarget({ ...base, scrollLeft: 0, direction: 'right' })).toBe(150);
    expect(arrowScrollTarget({ ...base, scrollLeft: 150, direction: 'right' })).toBe(300);
  });
  it('→ przy końcu: nie dalej niż maksymalne przewinięcie', () => {
    expect(arrowScrollTarget({ ...base, scrollLeft: 300, direction: 'right' })).toBe(400);
    expect(arrowScrollTarget({ ...base, scrollLeft: 400, direction: 'right' })).toBe(400);
  });
  it('← wraca do poprzedniej kolumny, na początku zostaje 0', () => {
    expect(arrowScrollTarget({ ...base, scrollLeft: 400, direction: 'left' })).toBe(300);
    expect(arrowScrollTarget({ ...base, scrollLeft: 200, direction: 'left' })).toBe(150);
    expect(arrowScrollTarget({ ...base, scrollLeft: 150, direction: 'left' })).toBe(0);
    expect(arrowScrollTarget({ ...base, scrollLeft: 0, direction: 'left' })).toBe(0);
  });
  it('przewinięcie w połowie kolumny: → do następnej, ← do początku bieżącej', () => {
    expect(arrowScrollTarget({ ...base, scrollLeft: 75, direction: 'right' })).toBe(150);
    expect(arrowScrollTarget({ ...base, scrollLeft: 75, direction: 'left' })).toBe(0);
  });
  it('tabela bez przewijania (max 0) nie przesuwa się', () => {
    expect(arrowScrollTarget({ ...base, maxScroll: 0, scrollLeft: 0, direction: 'right' })).toBe(0);
    expect(arrowScrollTarget({ ...base, maxScroll: 0, scrollLeft: 0, direction: 'left' })).toBe(0);
  });
  it('ułamkowe przewinięcie (gładzik) nie blokuje kroku', () => {
    expect(arrowScrollTarget({ ...base, scrollLeft: 149.6, direction: 'right' })).toBe(300);
    expect(arrowScrollTarget({ ...base, scrollLeft: 150.4, direction: 'left' })).toBe(0);
  });
});

describe('hoverCardPosition — karta podglądu przy krawędziach ekranu', () => {
  const card = { width: 280, height: 200 };
  const viewport = { width: 1280, height: 800 };
  const anchor = (left: number, top: number) => ({ left, top, right: left + 20, bottom: top + 20 });
  it('domyślnie pod logo, wyrównana do lewej krawędzi minus 8 px', () => {
    expect(hoverCardPosition({ anchor: anchor(100, 100), card, viewport })).toEqual({ left: 92, top: 128, placement: 'bottom' });
  });
  it('przy prawej krawędzi przesuwa się w lewo (margines 8 px)', () => {
    expect(hoverCardPosition({ anchor: anchor(1200, 100), card, viewport }).left).toBe(1280 - 8 - 280);
  });
  it('przy lewej krawędzi nie wychodzi poza ekran', () => {
    expect(hoverCardPosition({ anchor: anchor(4, 100), card, viewport }).left).toBe(8);
  });
  it('przy dolnej krawędzi odbija się nad logo', () => {
    expect(hoverCardPosition({ anchor: anchor(100, 700), card, viewport })).toEqual({ left: 92, top: 700 - 8 - 200, placement: 'top' });
  });
  it('gdy nie mieści się ani pod, ani nad — strona z większym miejscem, przycięta do ekranu', () => {
    const p = hoverCardPosition({ anchor: anchor(100, 150), card: { width: 280, height: 700 }, viewport });
    expect(p.placement).toBe('bottom');
    expect(p.top).toBe(800 - 8 - 700);
    const q = hoverCardPosition({ anchor: anchor(100, 650), card: { width: 280, height: 700 }, viewport });
    expect(q.placement).toBe('top');
    expect(q.top).toBe(8);
  });
  it('wąski ekran (węższy niż karta + marginesy) — karta od lewego marginesu', () => {
    expect(hoverCardPosition({ anchor: anchor(100, 100), card, viewport: { width: 260, height: 800 } }).left).toBe(8);
  });
});
