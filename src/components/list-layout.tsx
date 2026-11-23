import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './icon';
import { pillClasses } from './ui/pill';
import { cx } from '@/lib/cx';

/**
 * Shared "collection view" chrome (Precision UI): compact page head, saved-view pills,
 * inline search and a full-width table. Used by every list screen.
 *
 * M0.2: elementy komponentu w Tailwindzie. Zostają klasy-zaczepienia, od których zależą reguły ekranów sprzed przebudowy:
 * pui-page-head (wymuszony rozmiar h1 i wcięcia w .list-page), cv-actions (przyciski podawane przez ekrany),
 * cv-pills (odstęp zakładek poza paskiem narzędzi). Tabela (cv-table) przechodzi na Tailwind w M0.3.
 */
/* eslint-disable avero/tailwind-tokens -- odstępy 1:1 z makiety spoza siatki 4 px (6 px), do decyzji projektu (docs/STATUS.md) */
const offGrid = { headMobile: 'max-desktop:py-1.5', searchGap: 'gap-1.5' };
/* eslint-enable avero/tailwind-tokens */

export function ListHeader({ category, title, children }: { category: string; title: string; children?: ReactNode }) {
  return (
    <div className={cx('pui-page-head flex h-11 items-center gap-2 pr-3 pl-5 max-desktop:h-auto max-desktop:min-h-11 max-desktop:flex-wrap max-desktop:px-3', offGrid.headMobile)}>
      <span className="min-w-0 truncate text-secondary">{category}</span>
      <span className="flex-none text-tertiary" aria-hidden="true"><Icon name="right" size={12} /></span>
      <h1 className="m-0 whitespace-nowrap text-body leading-5 font-medium">{title}</h1>
      <span className="flex-auto" />
      {children && <div className="cv-actions flex flex-wrap items-center justify-end gap-1">{children}</div>}
    </div>
  );
}

export function ListSearch({ action, value, name = 'q', placeholder, hidden = {} }: { action: string; value: string; name?: string; placeholder: string; hidden?: Record<string, string> }) {
  // Pole stoi w pasku narzędzi listy (.list-toolbar): na komputerze po prawej, na telefonie na całą szerokość.
  return (
    <form className="order-2 ml-auto min-w-40 shrink grow-0 basis-70 max-desktop:order-0 max-desktop:ml-0 max-desktop:grow max-desktop:basis-full" action={action} role="search">
      {Object.entries(hidden).map(([key, value]) => <input type="hidden" key={key} name={key} value={value} />)}
      <label className={cx('m-0 flex h-7 flex-row items-center rounded-sm bg-subtle px-2 text-tertiary transition-shadow focus-within:field-ring focus-within:ring-accent max-desktop:h-11', offGrid.searchGap)}>
        <span className="sr-only">{placeholder}</span>
        <Icon name="find" size={14} />
        <input type="search" name={name} defaultValue={value} maxLength={200} placeholder={placeholder} className="m-0 h-7 min-h-0 w-auto min-w-0 flex-auto rounded-none border-0 bg-transparent p-0 text-primary shadow-none outline-0 placeholder:text-tertiary max-desktop:h-11" />
      </label>
      <button type="submit" className="sr-only">Szukaj</button>
    </form>
  );
}

export function ListTabs({ label, items }: { label: string; items: { label: string; href: string; active: boolean }[] }) {
  return (
    <nav className="cv-pills m-0 flex flex-wrap gap-1 bg-transparent" aria-label={label}>
      {items.map(item => <Link key={item.href} href={item.href} className={pillClasses({ active: item.active })} aria-current={item.active ? 'page' : undefined}>{item.label}</Link>)}
    </nav>
  );
}

export function ListTable({ children, label }: { children: ReactNode; label: string }) {
  return <div className="cv-table"><table aria-label={label}>{children}</table></div>;
}
