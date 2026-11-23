import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { compile } from 'tailwindcss';
// @ts-expect-error — reguła ESLint w JS, bez deklaracji typów
import { forbiddenClass } from '../eslint-rules/tailwind-tokens.mjs';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { inputFieldClasses, inputFrameClasses } from '@/components/ui/input';
import { pillClasses } from '@/components/ui/pill';
import { tableRowClasses } from '@/components/ui/table-row';

const entry = resolve(__dirname, '..', 'src/app/tailwind.css');
const require = createRequire(import.meta.url);
const compiler = () => readFile(entry, 'utf8').then(css => compile(css, {
  base: dirname(entry),
  async loadStylesheet(id, base) {
    const path = id.startsWith('.') ? resolve(base, id) : require.resolve(id);
    return { path, base: dirname(path), content: await readFile(path, 'utf8') };
  },
}));

const variants: ButtonVariant[] = ['pri', 'sec', 'ghost', 'icon'], sizes: ButtonSize[] = ['md', 'sm'];
const classLists = [
  ...variants.flatMap(variant => sizes.map(size => buttonClasses({ variant, size }))),
  inputFrameClasses, inputFieldClasses,
  pillClasses({ active: true }), pillClasses({ active: false, size: 'sm' }),
  tableRowClasses({ variant: 'list', interactive: true }), tableRowClasses({ variant: 'table', selected: true, disabled: true }),
];
const tokens = [...new Set(classLists.flatMap(list => list.split(/\s+/)).filter(Boolean))];

describe('wspólne elementy (src/components/ui) — tylko klasy na tokenach', () => {
  it('żadna klasa nie łamie reguły ESLint (wartości dowolne, siatka 4 px)', () => {
    expect(tokens.filter(t => forbiddenClass(t))).toEqual([]);
  });

  it('każda klasa istnieje w @theme — literówka lub nazwa spoza tokenów nie przechodzi po cichu', async () => {
    const empty = (await compiler()).build([]);
    const missing: string[] = [];
    for (const token of tokens) if ((await compiler()).build([token]) === empty) missing.push(token);
    expect(missing).toEqual([]);
  });

  it('przycisk główny ma akcent i fokus pierścieniem --accent; wyłączony nie reaguje na hover', () => {
    const pri = buttonClasses({ variant: 'pri' });
    expect(pri).toContain('bg-accent');
    expect(pri).toContain('focus-visible:outline-accent');
    expect(pri).toMatch(/enabled:not-aria-disabled:hover:/);
    expect(pri).not.toMatch(/(^|\s)hover:/);
  });

  it('rama i układ list (app-shell, list-layout, glyphs) używają tylko istniejących klas Tailwinda', async () => {
    // klasy-zaczepienia dla arkuszy sprzed przebudowy (src/app/precision.css, globals.css) — nie są klasami Tailwinda
    const markers = new Set(['pui-shell', 'av', 'pui-main', 'workspace', 'no-print', 'group', 'pui-page-head', 'cv-actions', 'cv-pills', 'cv-table']);
    const files = ['src/components/app-shell.tsx', 'src/components/app-shell-classes.ts', 'src/components/list-layout.tsx', 'src/components/glyphs.tsx'];
    const found = new Set<string>();
    for (const file of files) {
      const source = readFileSync(resolve(__dirname, '..', file), 'utf8');
      // napisy w className / stałych klas: ciągi z małych liter, cyfr, myślników, dwukropków, nawiasów i ukośników
      for (const m of source.matchAll(/className=(?:"([^"]*)"|\{'([^']*)'\})|'([a-z][a-z0-9 :./!\-[\]()=]*)'|`([^`$]*)`/g)) {
        for (const t of (m[1] ?? m[2] ?? m[3] ?? m[4] ?? '').split(/\s+/)) if (/^[a-z!-][a-z0-9:./!\-[\]()=]*$/.test(t) && /-|^(flex|grid|hidden|block|relative|absolute|fixed|truncate|border|invisible|visible|grow|shrink)$/.test(t)) found.add(t);
      }
    }
    const notClasses = new Set(['nav-group-', 'no-store', 'shell-dialog', 'shell-dialog-heading', 'sidebar-icon-button', 'shell-dialog-footer', 'shell-alert-list', 'shell-task-alerts', 'shell-no-alerts', 'shell-task-agenda', 'profile-panel', 'pui-theme-row', 'profile-signout', 'is-active', 'use-client', 'list-toolbar', 'eslint-disable', 'eslint-enable', 'avero/tailwind-tokens', '--', 'aria-hidden']);
    const candidates = [...found].filter(t => !markers.has(t) && !notClasses.has(t) && !t.startsWith('hvac.') && !t.startsWith('/'));
    expect(candidates.length).toBeGreaterThan(80);
    const empty = (await compiler()).build([]);
    const missing: string[] = [];
    for (const token of candidates) if ((await compiler()).build([token]) === empty) missing.push(token);
    expect(missing).toEqual([]);
  });
});
