'use client';
/* Kategorie osoby w tabeli Osób (makieta: Decyzyjny, Techniczny, Płatnik, Zarządca). Biuro zmienia je w miejscu.
   M0.4: Tailwind na tokenach (tint 16 % z --ic-*), lista w ui/Popover (portal — nie ucina jej przewijanie tabeli). */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from '@phosphor-icons/react/ssr';
import { personCategoryLabels } from '@hvac/api-client';
import { Popover } from '@/components/ui/popover';
import { checkBox, itemClasses, plain } from '@/components/collection/classes';
import { cx } from '@/lib/cx';

type Cat = keyof typeof personCategoryLabels;
const tint: Record<Cat, string> = { decision: 'bg-ic-violet/16', technical: 'bg-ic-teal/16', payer: 'bg-ic-yellow/16', manager: 'bg-ic-blue/16', individual: 'bg-ic-slate/16' };
const dot: Record<Cat, string> = { decision: 'bg-ic-violet', technical: 'bg-ic-teal', payer: 'bg-ic-yellow', manager: 'bg-ic-blue', individual: 'bg-ic-slate' };
const chip = (c: Cat) => <span key={c} className={cx('inline-flex h-5 items-center rounded-xs px-2 text-small leading-4 whitespace-nowrap text-primary', tint[c])}>{personCategoryLabels[c]}</span>;

export function PersonCategories({ contactId, initial, editable }: { contactId: string | null; initial: Cat[]; editable: boolean }) {
  const router = useRouter();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false), [cats, setCats] = useState(initial), [err, setErr] = useState('');
  useEffect(() => { setCats(initial); }, [initial]);
  async function toggle(c: Cat) {
    const next = cats.includes(c) ? cats.filter(x => x !== c) : [...cats, c]; setCats(next); setErr('');
    const r = await fetch(`/api/v1/contacts/${contactId}/categories`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categories: next }) }).catch(() => null);
    if (!r?.ok) { setCats(cats); setErr('Nie udało się zapisać. Spróbuj ponownie.'); return; }
    router.refresh();
  }
  const shown = cats.slice(0, 2), more = cats.slice(2);
  const content = <>{shown.map(chip)}{more.length > 0 && <span title={more.map(c => personCategoryLabels[c]).join(', ')} className="text-small leading-4 text-secondary tabular-nums">+{more.length}</span>}{!cats.length && <span className="text-tertiary">—</span>}</>;
  if (!editable || !contactId) return <span className="flex min-w-0 items-center gap-1 overflow-hidden">{content}</span>;
  return (
    <>
      <button ref={ref} type="button" aria-haspopup="listbox" aria-expanded={open} title="Kategorie osoby" onClick={() => setOpen(v => !v)} className={cx(plain(), 'h-7 min-w-0 gap-1 overflow-hidden rounded-sm px-1 hover:bg-shell-hover')}>{content}</button>
      <Popover open={open} onClose={() => setOpen(false)} anchor={ref} label="Kategorie osoby" role="listbox" width="w-56">
        {(['decision', 'technical', 'payer', 'manager'] as Cat[]).map(c => {
          const on = cats.includes(c);
          return (
            <button key={c} type="button" role="option" aria-selected={on} onClick={() => void toggle(c)} className={cx(itemClasses, 'font-normal')}>
              <span aria-hidden="true" className={checkBox(on)}><Check size={10} weight="bold" className="shrink-0" /></span>
              <span aria-hidden="true" className={cx('size-2 shrink-0 rounded-pill', dot[c])} />
              {personCategoryLabels[c]}
            </button>
          );
        })}
        {err && <p role="alert" className="m-0 px-2 py-1 text-small leading-4 text-danger">{err}</p>}
      </Popover>
    </>
  );
}
