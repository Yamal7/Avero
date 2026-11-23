import { describe, expect, it } from 'vitest';
import { Linter } from 'eslint';
// @ts-expect-error — reguła ESLint w JS, bez deklaracji typów
import plugin from '../eslint-rules/tailwind-tokens.mjs';

const linter = new Linter({ configType: 'flat' });
const config = [{
  files: ['**/*.tsx'],
  plugins: { avero: plugin },
  rules: { 'avero/tailwind-tokens': 'error' },
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
}];
const lint = (code: string) => linter.verify(code, config, { filename: 'src/components/x.tsx' }).map(m => m.message);

describe('ESLint: klasy Tailwinda tylko z tokenów', () => {
  it.each([
    'export const a = <div className="flex h-row items-center gap-2 px-3 rounded-md bg-surface text-primary" />;',
    'export const a = <div className="hover:bg-subtle focus-visible:outline-2 dark:bg-raised max-desktop:hidden" />;',
    'export const a = <div className="data-[state=open]:bg-subtle aria-[current=page]:font-medium" />;',
    'export const a = <div className={`size-7 ${on ? "bg-subtle" : "bg-transparent"}`} />;',
    "export const href = '/dashboard/soon/[module]';",
    "export const label = 'Ładunek 5.4 kg — p. 0.5 bar';",
    'export const a = <div className="opacity-50 w-full -mt-1 inset-0" />;',
  ])('dozwolone: %s', code => {
    expect(lint(code)).toEqual([]);
  });

  it.each([
    ['export const a = <div className="w-[13px]" />;', 'w-[13px]'],
    ['export const a = <div className="text-[#fff]" />;', 'text-[#fff]'],
    ['export const a = <div className="hover:bg-[var(--accent)]" />;', 'hover:bg-[var(--accent)]'],
    ['export const a = <div className="w-(--sidebar-w)" />;', 'w-(--sidebar-w)'],
    ['export const a = <div className="[mask-type:luminance]" />;', '[mask-type:luminance]'],
    ['export const a = <div className={`h-8 grid-cols-[${cols}]`} />;', 'grid-cols-['],
    ["const base = 'flex p-0.5'; export const a = <div className={base} />;", 'p-0.5'],
    ['export const a = <div className="md:gap-1.5" />;', 'md:gap-1.5'],
    ['export const a = <div className="-mt-2.5" />;', '-mt-2.5'],
  ])('zabronione: %s', (code, token) => {
    const messages = lint(code);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain(token);
  });
});
