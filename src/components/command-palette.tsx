'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, type IconName } from './icon';

export type PaletteEntry = { href: string; label: string; icon: IconName; hint?: string; keys?: string[] };
type Hit = { kind: 'customer' | 'offer' | 'ticket'; id: string; number: string | null; title: string; subtitle: string };
type Option = { key: string; group: string; href: string; icon: IconName; label: string; number?: string | null; sub?: string; keys?: string[] };

const hitHref = (h: Hit) => h.kind === 'customer' ? `/dashboard/customers/${h.id}` : h.kind === 'offer' ? `/dashboard/offers/${h.id}` : `/dashboard/service/${h.id}`;
const hitIcon: Record<Hit['kind'], IconName> = { customer: 'building', offer: 'offer', ticket: 'alert' };
const hitKind: Record<Hit['kind'], string> = { customer: 'klient', offer: 'oferta', ticket: 'zgłoszenie' };
const norm = (s: string) => s.toLocaleLowerCase('pl').normalize('NFD').replace(/\p{Diacritic}/gu, '');

/** ⌘K palette from the design: actions, records (live search) and navigation, all keyboard-driven. */
export function CommandPalette({ open, onClose, actions, places }: { open: boolean; onClose: () => void; actions: PaletteEntry[]; places: PaletteEntry[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null), input = useRef<HTMLInputElement>(null), list = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(''), [hits, setHits] = useState<Hit[]>([]), [loading, setLoading] = useState(false), [failed, setFailed] = useState(false), [active, setActive] = useState(0);

  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (open && !d.open) { d.showModal(); setQuery(''); setHits([]); setActive(0); requestAnimationFrame(() => input.current?.focus()); }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const q = query.trim(); setFailed(false);
    if (q.length < 2) { setHits([]); setLoading(false); return; }
    const controller = new AbortController(); setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/v1/search?${new URLSearchParams({ q })}`, { cache: 'no-store', signal: controller.signal });
        if (!r.ok) throw new Error();
        const body = await r.json() as { items: Hit[] };
        if (!controller.signal.aborted) setHits(body.items);
      } catch { if (!controller.signal.aborted) { setHits([]); setFailed(true); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 180);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query]);

  const options = useMemo<Option[]>(() => {
    const q = norm(query.trim());
    const match = (e: PaletteEntry) => !q || norm(e.label).includes(q);
    return [
      ...actions.filter(match).map(a => ({ key: 'a' + a.href, group: 'Akcje', href: a.href, icon: a.icon, label: a.label, keys: a.keys })),
      ...hits.map(h => ({ key: h.kind + h.id, group: 'Rekordy', href: hitHref(h), icon: hitIcon[h.kind], label: h.title, number: h.number, sub: [hitKind[h.kind], h.subtitle].filter(Boolean).join(' · ') })),
      ...places.filter(match).map(p => ({ key: 'p' + p.href, group: 'Przejdź do', href: p.href, icon: p.icon, label: p.label, sub: p.hint, keys: p.keys })),
    ];
  }, [actions, places, hits, query]);

  useEffect(() => { setActive(0); }, [query, hits]);
  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

  function go(option: Option | undefined) { if (!option) return; onClose(); router.push(option.href); }
  function onKey(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(i => Math.min(options.length - 1, i + 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (event.key === 'Enter') { event.preventDefault(); go(options[active]); }
  }

  let lastGroup = '';
  return (
    <dialog ref={dialog} className="cmdk" aria-label="Paleta komend" onClose={onClose} onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }}>
      <div className="cmdk-input">
        <Icon name="find" size={16} />
        <label htmlFor="cmdk-input" className="sr-only">Szukaj lub wpisz polecenie</label>
        <input id="cmdk-input" ref={input} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKey} placeholder="Szukaj klienta, oferty, zgłoszenia lub polecenia" autoComplete="off" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-activedescendant={options[active] ? `cmdk-${active}` : undefined} />
        <kbd className="pui-kbd">Esc</kbd>
      </div>
      <div className="cmdk-list" id="cmdk-list" role="listbox" ref={list}>
        {options.map((o, i) => {
          const head = o.group !== lastGroup ? (lastGroup = o.group) : null;
          return (
            <div key={o.key}>
              {head && <div className="cmdk-group" role="presentation">{head}</div>}
              <a id={`cmdk-${i}`} data-index={i} role="option" aria-selected={i === active} href={o.href} className={`cmdk-opt${i === active ? ' is-active' : ''}`} onMouseMove={() => setActive(i)} onClick={e => { e.preventDefault(); go(o); }}>
                <Icon name={o.icon} size={16} />
                {o.number && <span className="cmdk-num">{o.number}</span>}
                <span className="cmdk-label"><span className="ell">{o.label}</span>{o.sub && <span className="ell cmdk-sub">{o.sub}</span>}</span>
                {o.keys && <span className="cmdk-keys">{o.keys.map(k => <kbd className="pui-kbd" key={k}>{k}</kbd>)}</span>}
              </a>
            </div>
          );
        })}
        {!options.length && <p className="cmdk-empty">{loading ? 'Szukanie…' : failed ? 'Nie udało się przeszukać rekordów. Spróbuj ponownie.' : 'Nic nie pasuje. Zmień frazę.'}</p>}
        {loading && options.length > 0 && <p className="cmdk-empty" role="status">Szukanie rekordów…</p>}
      </div>
      <div className="cmdk-foot"><span><kbd className="pui-kbd">↑</kbd><kbd className="pui-kbd">↓</kbd> wybierz</span><span><kbd className="pui-kbd">↵</kbd> otwórz</span><span><kbd className="pui-kbd">Esc</kbd> zamknij</span></div>
    </dialog>
  );
}
