/* Wspólne zestawy klas silnika kolekcji (M0.4). Bez właściwości nadpisywanych przy użyciu (tests/class-conflicts.test.ts). */
import { cx } from '@/lib/cx';

export const plainBase = 'm-0 inline-flex min-h-0 items-center border-0 py-0 font-sans transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50';
/** Prosty przycisk w pasku / warstwie: tło i grubość są parametrami (reguła legacy `button` ustawia własne — trzeba je podać),
    wcięcie, wysokość i kolor tekstu dokleja miejsce użycia. */
export const plain = ({ bg = 'bg-transparent', weight = 'font-normal' }: { bg?: string; weight?: 'font-normal' | 'font-medium' } = {}) => cx(plainBase, bg, weight);
/** Pozycja menu / listy opcji (32 px, na telefonie 44 px). */
export const itemClasses = 'm-0 flex h-8 min-h-0 w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 py-0 text-left font-sans text-body leading-5 text-primary transition-colors hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-0 max-desktop:h-11';
export const chipBase = 'inline-flex h-7 min-w-0 max-w-full items-center rounded-sm bg-subtle text-small leading-4 max-desktop:h-9';
export const checkBox = (on: boolean) => cx('inline-flex size-3.5 shrink-0 items-center justify-center rounded-xs border', on ? 'border-accent bg-accent text-on-accent' : 'border-border-strong bg-transparent text-transparent');

