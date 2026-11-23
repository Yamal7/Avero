import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { compile } from 'tailwindcss';
import { buttonClasses, ariaShortcut, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { inputFieldClasses, inputFrameClasses } from '@/components/ui/input';
import { pillClasses } from '@/components/ui/pill';
import { shell } from '@/components/app-shell-classes';

/* Bez preflightu stare reguły bazowe (globals.css, precision.css) nadal trafiają w elementy:
   label { display:flex; flex-direction:column; font-weight:500 }, button { padding:10px 16px; border; background; min-height }.
   Klasy Tailwinda wygrywają z nimi tylko tam, gdzie ustawiają tę samą właściwość — te testy sprawdzają,
   że skompilowane reguły wspólnych elementów naprawdę ją ustawiają (a nie tylko, że napis klasy istnieje). */
const entry = resolve(__dirname, '..', 'src/app/tailwind.css');
const require = createRequire(import.meta.url);
let css = '';
async function build(candidates: string[]) {
  const compiler = await compile(await readFile(entry, 'utf8'), {
    base: dirname(entry),
    async loadStylesheet(id, base) {
      const path = id.startsWith('.') ? resolve(base, id) : require.resolve(id);
      return { path, base: dirname(path), content: await readFile(path, 'utf8') };
    },
  });
  return compiler.build(candidates);
}
const escape = (cls: string) => cls.replace(/[.:/!\[\]()%#,]/g, m => '\\' + m);
/** Deklaracje, które klasy bez wariantów ustawiają elementowi (właściwość → wartość), z warstwy utilities. */
function declarations(classList: string) {
  const utilities = css.slice(css.indexOf('@layer utilities {', css.indexOf('@layer tokens')));
  const out = new Map<string, string>();
  for (const cls of classList.split(/\s+/).filter(c => c && !c.includes(':'))) {
    const selector = '\n  .' + escape(cls) + ' {';
    const at = utilities.indexOf(selector);
    if (at < 0) continue;
    const body = utilities.slice(at + selector.length, utilities.indexOf('\n  }', at));
    for (const m of body.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)) if (!m[1]!.startsWith('--')) out.set(m[1]!, m[2]!.trim());
  }
  return out;
}
const zero = /^(0|0px|calc\(4px \* 0\))$/;

const variants: ButtonVariant[] = ['pri', 'sec', 'ghost', 'icon'], sizes: ButtonSize[] = ['md', 'sm'];
const buttons = {
  ...Object.fromEntries(variants.flatMap(v => sizes.map(s => [`Button ${v}/${s}`, buttonClasses({ variant: v, size: s })]))),
  'PillButton aktywna': pillClasses({ active: true }),
  'PillButton': pillClasses({ size: 'sm' }),
  'rama: przycisk firmy': shell.workspace,
  'rama: nagłówek grupy menu': shell.groupHead,
};

describe('wspólne elementy nadpisują stare reguły bazowe (bez preflightu)', () => {
  it('kompilacja', async () => {
    css = await build([...Object.values(buttons), inputFrameClasses, inputFieldClasses].flatMap(l => l.split(/\s+/)));
    expect(css.length).toBeGreaterThan(0);
  });

  it('ramka pola (label) układa się w wierszu, a tekst pola ma wagę 400', () => {
    const frame = declarations(inputFrameClasses), field = declarations(inputFieldClasses);
    expect(frame.get('display')).toBe('flex');
    expect(frame.get('flex-direction')).toBe('row');
    expect(frame.get('gap')).toBeDefined();
    expect(field.get('font-weight')).toBe('400');
    expect(field.get('padding')).toMatch(zero);
    expect(field.get('border-width') ?? field.get('border')).toMatch(/^0/);
  });

  it.each(Object.entries(buttons))('%s: ustawia padding pionowy 0, ramkę, tło, kolor i min-height', (_, classes) => {
    const d = declarations(classes);
    expect(d.get('padding-block') ?? d.get('padding')).toMatch(zero);
    expect(d.get('padding-inline') ?? d.get('padding')).toBeDefined();
    expect(d.get('border-width') ?? d.get('border-style')).toBeDefined();
    expect(d.get('background-color')).toBeDefined();
    expect(d.get('color')).toBeDefined();
    expect(d.get('min-height')).toBeDefined();
  });
});

describe('skrót w formacie ARIA', () => {
  it.each([['⌘K', 'Meta+K'], ['⇧⌘P', 'Shift+Meta+P'], ['⌥T', 'Alt+T'], ['⌃⌥1', 'Control+Alt+1'], ['c', 'C'], ['Enter', 'Enter']])('%s → %s', (input, aria) => {
    expect(ariaShortcut(input)).toBe(aria);
  });
  it('sekwencja i pusty skrót nie mają zapisu ARIA', () => {
    expect(ariaShortcut('G I')).toBeUndefined();
    expect(ariaShortcut('')).toBeUndefined();
    expect(ariaShortcut('⌘')).toBeUndefined();
  });
});
