/* Inicjały logo firmy / osoby w tabelach (M0.3, DECISIONS 2026-11-21): dopóki firma nie wgra logo,
   w kwadracie (firma) albo kole (osoba) stoją inicjały na kolorze marki. */

export type LogoKind = 'company' | 'person';

// Formy prawne i łączniki nie dają liter („Klimatech Sp. z o.o.” → „KL”, „Szkoła Podstawowa nr 4” → „SP”).
const LEGAL = new Set(['sp', 'z', 'o', 'oo', 'sa', 'sc', 'spj', 'spk', 'ska', 'spzoo']);
const CONNECTORS = new Set(['i', 'w', 'na', 'do', 'nr', 'oraz', 'u', 'pod', 'przy']);
const TITLES = new Set(['dr', 'inż', 'mgr', 'prof', 'hab', 'lek', 'pan', 'pani']);

/** Wyrazy nazwy bez znaków interpunkcji na brzegach („„Termo-Bud”” → „Termo-Bud”). */
function words(name: string) {
  return name
    .split(/\s+/)
    .map(w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(w => /^[\p{L}\p{N}]/u.test(w));
}

const key = (w: string) => w.toLocaleLowerCase('pl-PL').replace(/\./g, '');
const upper = (s: string) => s.toLocaleUpperCase('pl-PL');

export function logoInitials(name: string, kind: LogoKind): string {
  const all = words(name);
  if (kind === 'person') {
    const parts = all.filter(w => !TITLES.has(key(w)));
    if (!parts.length) return '?';
    const first = [...parts[0]!][0]!;
    return upper(parts.length > 1 ? first + [...parts[parts.length - 1]!][0]! : first);
  }
  // Formy prawne odcinamy tylko od końca nazwy („Sp. z o.o.”), żeby nie zgubić wyrazu „Z” w środku.
  const parts = [...all];
  while (parts.length > 1 && LEGAL.has(key(parts[parts.length - 1]!))) parts.pop();
  const significant = parts.filter((w, i) => i === 0 || !CONNECTORS.has(key(w)));
  if (!significant.length) return '?';
  if (significant.length === 1) return upper([...significant[0]!].slice(0, 2).join(''));
  return upper([...significant[0]!][0]! + [...significant[1]!][0]!);
}
