import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
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
    expect(pri).toMatch(/enabled:hover:/);
    expect(pri).not.toMatch(/(^|\s)hover:/);
  });
});
