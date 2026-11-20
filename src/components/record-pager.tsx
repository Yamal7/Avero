'use client';
/* Karta firmy header: „1 z 48” and previous / next record with J / K (owner's decision 2026-11-20), without going back to the table. */
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const chev = (d: string) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const btn = { width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: '50%', color: 'var(--text-secondary)', padding: 0 } as const;

export function RecordPager({ position, total, previousHref, nextHref, noun }: { position: number | null; total: number | null; previousHref: string | null; nextHref: string | null; noun: string }) {
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || document.querySelector('dialog[open],[role=dialog]')) return;
      if (e.key === 'j' && previousHref) { e.preventDefault(); router.push(previousHref); }
      if (e.key === 'k' && nextHref) { e.preventDefault(); router.push(nextHref); }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [previousHref, nextHref, router]);
  if (!position || !total) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 4 }}>{position} z {total}</span>
      {previousHref ? <Link href={previousHref} className="ib" aria-label={`Poprzednia ${noun}`} title={`Poprzednia ${noun}  J`} style={btn}>{chev('m18 15-6-6-6 6')}</Link> : <span aria-hidden="true" style={{ ...btn, opacity: 0.35 }}>{chev('m18 15-6-6-6 6')}</span>}
      {nextHref ? <Link href={nextHref} className="ib" aria-label={`Następna ${noun}`} title={`Następna ${noun}  K`} style={btn}>{chev('m6 9 6 6 6-6')}</Link> : <span aria-hidden="true" style={{ ...btn, opacity: 0.35 }}>{chev('m6 9 6 6 6-6')}</span>}
    </span>
  );
}
