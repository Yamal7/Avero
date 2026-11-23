import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { compile } from 'tailwindcss';

const root = resolve(__dirname, '..');
const entry = resolve(root, 'src/app/tailwind.css');
const require = createRequire(import.meta.url);

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
/** Treść reguły dla klasy (bez reszty arkusza). */
const ruleFor = (css: string, cls: string) => {
  const selector = '.' + cls.replace(/[.:/]/g, m => '\\' + m) + ' {';
  const at = css.indexOf(selector);
  if (at < 0) return null;
  const body = css.slice(at + selector.length, css.indexOf('}', at));
  return body.replace(/\s+/g, ' ').trim();
};
const cssVars = (text: string) => new Set([...text.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(m => m[1]));

describe('Tailwind v4 na tokenach (src/app/tailwind.css)', () => {
  it('domyślne skale są wyłączone: paleta, promienie i cienie Tailwinda nie generują stylów', async () => {
    const defaults = ['bg-indigo-500', 'text-gray-100', 'rounded-2xl', 'rounded-4xl', 'shadow-md', 'shadow-sm', 'shadow-lg', 'text-sm', 'text-xl', 'font-serif', 'font-bold', 'w-screen-md', 'max-w-prose', 'sm:flex', 'md:flex'];
    // arkusz z tymi klasami jest identyczny jak bez żadnej klasy (stare arkusze są w nim zawsze)
    expect(await build(defaults)).toBe(await build([]));
  });

  it('kolory, promienie, cienie i rozmiary tekstu wskazują zmienne z tokens.css', async () => {
    const css = await build(['bg-surface', 'bg-shell', 'text-primary', 'text-secondary', 'border-edge', 'bg-accent', 'text-on-accent', 'text-ic-blue', 'text-st-progress', 'rounded-md', 'rounded-pill', 'shadow-pop', 'text-body', 'text-small']);
    expect(ruleFor(css, 'bg-surface')).toBe('background-color: var(--bg-surface);');
    expect(ruleFor(css, 'bg-shell')).toBe('background-color: var(--bg-shell);');
    expect(ruleFor(css, 'text-primary')).toBe('color: var(--text-primary);');
    expect(ruleFor(css, 'text-secondary')).toBe('color: var(--text-secondary);');
    expect(ruleFor(css, 'border-edge')).toBe('border-color: var(--edge);');
    expect(ruleFor(css, 'bg-accent')).toBe('background-color: var(--accent);');
    expect(ruleFor(css, 'text-on-accent')).toBe('color: var(--on-accent);');
    expect(ruleFor(css, 'text-ic-blue')).toBe('color: var(--ic-blue);');
    expect(ruleFor(css, 'text-st-progress')).toBe('color: var(--st-progress);');
    expect(ruleFor(css, 'rounded-md')).toBe('border-radius: var(--radius-md);');
    expect(ruleFor(css, 'rounded-pill')).toBe('border-radius: var(--radius-pill);');
    expect(ruleFor(css, 'shadow-pop')).toContain('--tw-shadow: var(--shadow-pop);');
    expect(ruleFor(css, 'text-body')).toBe('font-size: var(--text-body);');
    expect(ruleFor(css, 'text-small')).toBe('font-size: var(--text-small);');
  });

  it('siatka 4 px i wymiary z tokenów (wiersz, kontrolka, panel boczny)', async () => {
    const css = await build(['p-2', 'gap-3', 'h-row', 'h-control', 'w-sidebar']);
    expect(ruleFor(css, 'p-2')).toBe('padding: calc(4px * 2);');
    expect(ruleFor(css, 'gap-3')).toBe('gap: calc(4px * 3);');
    expect(ruleFor(css, 'h-row')).toBe('height: var(--row-h);');
    expect(ruleFor(css, 'h-control')).toBe('height: var(--control-h);');
    expect(ruleFor(css, 'w-sidebar')).toBe('width: var(--sidebar-w);');
  });

  it('wariant dark działa przez atrybut [data-theme=dark], nie przez prefers-color-scheme', async () => {
    const css = await build(['dark:bg-raised']);
    expect(css).toContain('.dark\\:bg-raised:where([data-theme=dark], [data-theme=dark] *)');
    expect(css).not.toContain('prefers-color-scheme');
  });

  it('bez preflightu, a warstwy: stare arkusze pod klasami Tailwinda', async () => {
    const css = await build(['flex']);
    // charakterystyczne reguły preflightu Tailwinda
    expect(css).not.toContain('abbr:where([title])');
    expect(css).not.toContain('@layer base');
    const order = /@layer\s+theme,\s*legacy,\s*tokens,\s*utilities;/.exec(css);
    expect(order).not.toBeNull();
    // @theme nie wypisuje własnych zmiennych (tylko odwołania do tokens.css) — brak cykli typu --radius-md: var(--radius-md)
    expect(css).not.toMatch(/--(radius|text|shadow|color)-[a-z0-9-]+:\s*var\(--/);
  });

  it('@theme odwołuje się wyłącznie do zmiennych zdefiniowanych w tokens.css (bez surowych kolorów)', () => {
    const source = readFileSync(entry, 'utf8');
    const theme = /@theme inline reference \{([\s\S]*?)\n\}/.exec(source)?.[1] ?? '';
    expect(theme).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    const tokens = cssVars(readFileSync(resolve(root, 'docs/design/tokens.css'), 'utf8'));
    // zmienne next/font (Geist) ustawia layout.tsx, nie tokens.css
    const external = new Set(['--font-geist', '--font-geist-mono']);
    const used = [...theme.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(m => m[1]!);
    expect(used.length).toBeGreaterThan(30);
    expect(used.filter(v => !tokens.has(v) && !external.has(v))).toEqual([]);
  });

  it('jedna lista zmiennych: precision.css nie definiuje ponownie tokenów z tokens.css', () => {
    const tokens = cssVars(readFileSync(resolve(root, 'docs/design/tokens.css'), 'utf8'));
    const precision = cssVars(readFileSync(resolve(root, 'src/app/precision.css'), 'utf8'));
    // --font-sans / --font-mono: nadpisanie w tailwind.css o zmienne next/font; --edge: tryb zwiększonego kontrastu w .av
    expect([...precision].filter(v => tokens.has(v) && v !== '--edge')).toEqual([]);
  });
});
