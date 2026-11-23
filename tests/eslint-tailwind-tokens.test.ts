import { describe, expect, it } from 'vitest';
import { Linter } from 'eslint';
// @ts-expect-error — reguła ESLint w JS, bez deklaracji typów
import plugin from '../eslint-rules/tailwind-tokens.mjs';

const linter = new Linter({ configType: 'flat' });
const config: Linter.Config[] = [{
  files: ['**/*.tsx'],
  plugins: { avero: plugin },
  rules: { 'avero/tailwind-tokens': 'error' as const },
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
    'export const a = <div className="opacity-50 w-full -mt-1 inset-0 h-px" />;',
    'export const a = <div className="size-3.5 h-3.5 min-w-3.5 leading-3.5 basis-54" />;',
    'export const a = <div className="bg-accent/90 p-2! !p-2 h-px w-px" />;',
    'export const a = <svg viewBox="0 0 14 14"><path d="M1.5 7h2M6 7h2 m-0.5 1" /><polyline points="22 12 16 12" /></svg>;',
    'export const a = <path d={on ? `M7 7L7 4A3 3 0 1 ${x}` : \'m-0.5 1\'} />;',
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
    ['export const a = <div className="gap-px" />;', 'gap-px'],
    ['export const a = <div className="absolute top-0.5" />;', 'top-0.5'],
    ['export const a = <div className="p-0.5!" />;', 'p-0.5!'],
    ['export const a = <div className="!gap-1.5" />;', '!gap-1.5'],
    ['export const a = <div className="hover:p-0.5!" />;', 'hover:p-0.5!'],
    ['export const a = <div className="bg-accent/[0.37]" />;', 'bg-accent/[0.37]'],
    ['export const a = <div className="bg-accent/(--x)" />;', 'bg-accent/(--x)'],
    ['export const a = <div className="top-px" />;', 'top-px'],
    ['export const a = <div className="inset-px" />;', 'inset-px'],
    ['export const a = <div className="left-px" />;', 'left-px'],
    ['export const a = <div className="right-px" />;', 'right-px'],
    ['export const a = <div className="bottom-px" />;', 'bottom-px'],
    ['export const a = <div className="translate-x-px" />;', 'translate-x-px'],
    ['export const a = <div className="-translate-y-px" />;', '-translate-y-px'],
  ])('zabronione: %s', (code, token) => {
    const messages = lint(code);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain(token);
  });
});
