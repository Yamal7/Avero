/* Kolor marki firmy / osoby w logo z inicjałami (M0.3). W danych nie ma jeszcze koloru ani logo firmy
   (pytanie do projektu w docs/STATUS.md), dlatego kolor to deterministyczny skrót nazwy → token --ic-*.

   Kontrast inicjałów (WCAG 2.1, tekst 4,5:1) policzony dla tokenów z docs/design/tokens.css:
     motyw jasny — biel (--on-accent) albo ciemny tekst (--text-primary #1B1A19),
     motyw ciemny — ciemny tekst (--on-accent #0F0F0E, 5,7–8,8:1 dla wszystkich tokenów).
   Jasny motyw, najlepszy wariant:
     teal 5,13 · orange 5,40 · green 5,10 · yellow 5,90 · slate 4,56 (ciemny tekst), indigo 4,70 (biel) — spełniają 4,5:1;
     blue 4,33 · violet 4,23 · red 4,40 · pink 4,23 — ani biel, ani ciemny tekst nie daje 4,5:1 → wykluczone.
   Czerwony i tak myliłby się ze stanem błędu (--danger). */

export const BRAND_PALETTE = ['teal', 'orange', 'green', 'yellow', 'slate', 'indigo'] as const;
export const BRAND_EXCLUDED = ['blue', 'violet', 'red', 'pink'] as const;
export type BrandColor = (typeof BRAND_PALETTE)[number];

/** FNV-1a (32 bit) — stabilny między przeglądarkami i serwerem, dobrze rozkłada podobne nazwy. */
function hash(text: string) {
  let h = 0x811c9dc5;
  for (const ch of text) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export function brandColor(name: string): BrandColor {
  const normalized = name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pl-PL');
  return BRAND_PALETTE[hash(normalized) % BRAND_PALETTE.length]!;
}
