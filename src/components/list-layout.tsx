import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './icon';

/**
 * Shared "collection view" chrome (Precision UI): compact page head, saved-view pills,
 * inline search and a full-width table. Used by every list screen.
 */
export function ListHeader({ category, title, children }: { category: string; title: string; children?: ReactNode }) {
  return (
    <div className="pui-page-head cv-head">
      <span className="pui-page-sub">{category}</span>
      <span className="pui-crumb-sep" aria-hidden="true"><Icon name="right" size={12} /></span>
      <h1>{title}</h1>
      <span className="pui-spacer" />
      {children && <div className="cv-actions">{children}</div>}
    </div>
  );
}

export function ListSearch({ action, value, name = 'q', placeholder, hidden = {} }: { action: string; value: string; name?: string; placeholder: string; hidden?: Record<string, string> }) {
  return (
    <form className="cv-search" action={action} role="search">
      {Object.entries(hidden).map(([key, value]) => <input type="hidden" key={key} name={key} value={value} />)}
      <label>
        <span className="sr-only">{placeholder}</span>
        <Icon name="find" size={14} />
        <input type="search" name={name} defaultValue={value} maxLength={200} placeholder={placeholder} />
      </label>
      <button type="submit" className="sr-only">Szukaj</button>
    </form>
  );
}

export function ListTabs({ label, items }: { label: string; items: { label: string; href: string; active: boolean }[] }) {
  return (
    <nav className="pui-pills cv-pills" aria-label={label}>
      {items.map(item => <Link key={item.href} href={item.href} className={`pui-pill${item.active ? ' is-active' : ''}`} aria-current={item.active ? 'page' : undefined}>{item.label}</Link>)}
    </nav>
  );
}

export function ListTable({ children, label }: { children: ReactNode; label: string }) {
  return <div className="cv-table"><table aria-label={label}>{children}</table></div>;
}
