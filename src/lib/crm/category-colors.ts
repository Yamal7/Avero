/* Category colours (design: Firmy, tint 16 %). The office picks one per category; without a choice the name decides. */
export const categoryPalette = { blue: 'rgb(59, 130, 214)', teal: 'rgb(31, 167, 165)', violet: 'rgb(155, 107, 224)', orange: 'rgb(224, 112, 42)', green: 'rgb(47, 158, 91)', amber: 'rgb(201, 138, 18)', red: 'rgb(214, 69, 61)', grey: 'rgb(138, 143, 152)' } as const;
export type CategoryColorKey = keyof typeof categoryPalette;
export const categoryColorNames: Record<CategoryColorKey, string> = { blue: 'Niebieski', teal: 'Morski', violet: 'Fioletowy', orange: 'Pomarańczowy', green: 'Zielony', amber: 'Bursztynowy', red: 'Czerwony', grey: 'Szary' };
const fallback: CategoryColorKey[] = ['blue', 'teal', 'violet', 'orange', 'green', 'amber'];
export function categoryColorKey(name: string, chosen?: Record<string, string>): CategoryColorKey {
  const c = chosen?.[name.toLowerCase()];
  if (c && c in categoryPalette) return c as CategoryColorKey;
  let h = 0; for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return fallback[h % fallback.length]!;
}
export const categoryColor = (name: string, chosen?: Record<string, string>) => categoryPalette[categoryColorKey(name, chosen)];
export const categoryTint = (name: string, chosen?: Record<string, string>) => `color-mix(in srgb, ${categoryColor(name, chosen)} 16%, transparent 84%)`;
export function colorMap(list: { name: string; color: string }[]) { return Object.fromEntries(list.filter(c => c.color).map(c => [c.name.toLowerCase(), c.color])); }
/** Tło kategorii (tint 16 %) jako klasa Tailwinda na tokenach --ic-* (M0.3) — zmienia się z motywem. */
export const categoryTintClass: Record<CategoryColorKey, string> = { blue: 'bg-ic-blue/16', teal: 'bg-ic-teal/16', violet: 'bg-ic-violet/16', orange: 'bg-ic-orange/16', green: 'bg-ic-green/16', amber: 'bg-ic-yellow/16', red: 'bg-ic-red/16', grey: 'bg-ic-slate/16' };
