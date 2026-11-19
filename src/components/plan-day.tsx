'use client';
/* Planowanie · dzień — ported 1:1 from the design artboard (inline styles copied from the rendered design).
   Drag a ticket from "Do zaplanowania" onto a technician row, or drag a planned visit to another time or person. */
import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { assignTechnician, scheduleVisit } from '@/app/(dashboard)/dashboard/service/actions';
import { PersonAvatar, PriorityIcon, ProgressGlyph, personName, ticketCode, type Priority } from './design-icons';
import { roadKm, travelMinutes, type LatLng } from '@/lib/geo';

export type PlanTech = { id: string; label: string };
export type PlanVisit = { id: string; ticketId: string | null; number: string; title: string; place: string; start: string; minutes: number; status: string; label: string; techIds: string[]; kind: 'service' | 'work'; href: string; notes: string; at?: LatLng | null };
export type PlanTicket = { id: string; number: number; subject: string; place: string; priority: string; createdAt: string; assignedTo: string | null; at?: LatLng | null };
export type PlanDue = { id: string; title: string; place: string; due: string; overdue: boolean; href: string };

const DAY_START = 7 * 60, DAY_END = 17 * 60, SPAN = DAY_END - DAY_START, WORK = 8 * 60, SLOT = 60;
const zone = 'Europe/Warsaw';
const localMinutes = (iso: string) => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso)); return Number(p.find(x => x.type === 'hour')!.value) * 60 + Number(p.find(x => x.type === 'minute')!.value); };
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const pct = (m: number) => `${((Math.max(DAY_START, Math.min(DAY_END, m)) - DAY_START) / SPAN) * 100}%`;
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
const glyph = (s: string) => s === 'completed' || s === 'done' ? <ProgressGlyph color="var(--success)" fraction={1} /> : s === 'in_progress' ? <ProgressGlyph color="var(--st-progress)" fraction={2 / 3} /> : s === 'en_route' ? <ProgressGlyph color="var(--st-progress)" fraction={1 / 3} /> : <ProgressGlyph color="var(--text-secondary)" />;
const prio = (p: string): Priority => (p === 'high' ? 'high' : p === 'low' ? 'low' : 'normal');

function freeSlot(visits: PlanVisit[], techId: string, from: number) {
  const busy = visits.filter(v => v.techIds.includes(techId)).map(v => { const s = localMinutes(v.start); return [s, s + v.minutes] as const; }).sort((a, b) => a[0] - b[0]);
  let t = Math.max(DAY_START, Math.ceil(from / 15) * 15);
  for (const [s, e] of busy) { if (t + SLOT <= s) return t; t = Math.max(t, Math.ceil(e / 15) * 15); }
  return t + SLOT <= DAY_END ? t : null;
}

export { localMinutes, hhmm, freeSlot };
export function PlanDay({ day, isToday, nowIso, technicians, visits, backlog, due, canManage, base = null, geoPending = false }: { day: string; isToday: boolean; nowIso: string; technicians: PlanTech[]; visits: PlanVisit[]; backlog: PlanTicket[]; due: PlanDue[]; canManage: boolean; base?: LatLng | null; geoPending?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null), [over, setOver] = useState<string | null>(null), [nowMin, setNowMin] = useState(() => localMinutes(nowIso));
  useEffect(() => { if (!isToday) return; const t = setInterval(() => setNowMin(localMinutes(new Date().toISOString())), 60000); return () => clearInterval(t); }, [isToday]);
  const [geo, setGeo] = useState(geoPending && canManage);
  useEffect(() => {
    if (!geoPending || !canManage) return;
    let stop = false;
    (async () => { for (let i = 0; i < 10 && !stop; i++) { try { const r = await fetch('/api/v1/geocode', { method: 'POST' }); if (!r.ok) break; const b = await r.json(); if (!b.remaining) break; } catch { break; } } if (!stop) { setGeo(false); router.refresh(); } })();
    return () => { stop = true; };
  }, [geoPending, canManage, router]);
  const from = isToday ? nowMin : DAY_START;
  const suggestions = useMemo(() => new Map(backlog.map(t => {
    const pool = t.assignedTo && technicians.some(x => x.id === t.assignedTo) ? technicians.filter(x => x.id === t.assignedTo) : technicians;
    let best: { tech: PlanTech; at: number } | null = null;
    for (const tech of pool) { const at = freeSlot(visits, tech.id, from); if (at !== null && (!best || at < best.at)) best = { tech, at }; }
    let km: number | null = null;
    if (best && t.at) { const prev = visits.filter(v => v.techIds.includes(best!.tech.id) && v.at && localMinutes(v.start) < best!.at).sort((a, b) => b.start.localeCompare(a.start))[0]; const origin = prev?.at ?? base; if (origin) km = roadKm(origin, t.at); }
    return [t.id, best ? { ...best, km } : null] as const;
  })), [backlog, technicians, visits, from, base]);
  const late = isToday ? visits.filter(v => v.kind === 'service' && v.status === 'planned' && localMinutes(v.start) + 30 < nowMin) : [];
  const urgentUnplanned = backlog.filter(t => t.priority === 'high');

  async function plan(ticketId: string, techId: string, at: number, visit?: PlanVisit) {
    if (!canManage || busy) return;
    setBusy(true); setMsg(null);
    try {
      const ticket = backlog.find(t => t.id === ticketId), currentTech = visit ? visit.techIds[0] : ticket?.assignedTo;
      if (currentTech !== techId) { const r = await assignTechnician(ticketId, techId); if (r.error) throw new Error(r.error); }
      const r = await scheduleVisit({ ticketId, visitId: visit?.id ?? null, localStart: `${day}T${hhmm(at)}`, duration: visit?.minutes ?? SLOT, notes: visit?.notes ?? '' });
      if (r.error) throw new Error(r.error);
      setMsg({ ok: true, text: `Zaplanowano na ${hhmm(at)}.` }); router.refresh();
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Nie udało się zaplanować.' }); } finally { setBusy(false); }
  }
  function onDrop(e: DragEvent<HTMLDivElement>, techId: string) {
    e.preventDefault(); setOver(null);
    const raw = e.dataTransfer.getData('application/x-plan'); if (!raw) return;
    const data = JSON.parse(raw) as { ticketId: string; visitId?: string };
    const rect = e.currentTarget.getBoundingClientRect(), frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const at = Math.min(DAY_END - 15, Math.round((DAY_START + frac * SPAN) / 15) * 15);
    void plan(data.ticketId, techId, at, data.visitId ? visits.find(v => v.id === data.visitId) : undefined);
  }
  const grid = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);
  const card: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 10px', borderRadius: 12, background: 'var(--bg-raised)' };
  const sub: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 4px' };

  return (
    <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'stretch', minHeight: 0, borderTop: '1px solid var(--edge)' }} className="plan-split">
      <aside aria-label="Do zaplanowania" style={{ flex: '0 0 248px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 12px 24px', borderRight: '1px solid var(--edge)' }} className="plan-backlog">
        <div style={sub}><h2 style={{ flex: '1 1 auto', margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Do zaplanowania</h2><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{backlog.length + due.length}</span></div>
        <p style={{ margin: '0 4px 4px', fontSize: 12, lineHeight: '16px', color: 'var(--text-tertiary)' }}>{canManage ? 'Przeciągnij na oś technika albo użyj propozycji. Kolejność: pilne, potem najstarsze.' : 'Planowanie prowadzi biuro.'}</p>
        <div style={sub}><h3 style={{ margin: 0, fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Zgłoszenia</h3><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{backlog.length}</span></div>
        {backlog.map(t => {
          const s = suggestions.get(t.id), ageH = Math.floor((new Date(nowIso).getTime() - new Date(t.createdAt).getTime()) / 3600000);
          return (
            <div key={t.id} className="card" draggable={canManage} onDragStart={e => { e.dataTransfer.setData('application/x-plan', JSON.stringify({ ticketId: t.id })); e.dataTransfer.effectAllowed = 'move'; }} style={{ ...card, cursor: canManage ? 'grab' : 'default' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: '16px' }}><span title={`Priorytet: ${t.priority}`} style={{ display: 'inline-flex' }}><PriorityIcon priority={prio(t.priority)} /></span><Link href={`/dashboard/service/${t.id}`} className="mono flink" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ticketCode(t.number)}</Link><span style={{ flex: '1 1 auto' }} /><span className="num" style={{ color: t.priority === 'high' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: t.priority === 'high' ? 500 : 400 }}>{ageH < 48 ? `${ageH} h` : `${Math.floor(ageH / 24)} dni`}</span></span>
              <span className="ell" style={{ fontWeight: 500 }}>{t.subject}</span>
              <span style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}><span className="ell" style={{ flex: '1 1 auto' }}>{t.place}</span><span className="num" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>~1 h</span></span>
              {canManage && s && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--edge)', fontSize: 12, lineHeight: '16px' }}>
                  <PersonAvatar id={s.tech.id} label={s.tech.label} size={16} />
                  <span className="ell" style={{ flex: '1 1 auto', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{personName(s.tech.label)} {hhmm(s.at)}</span>{s.km !== null && <span className="num" style={{ color: 'var(--text-tertiary)' }}> · {s.km < 10 ? s.km.toFixed(1).replace('.', ',') : Math.round(s.km)} km</span>}</span>
                  <button type="button" className="capd" disabled={busy} title="Przydziel wg propozycji" onClick={() => void plan(t.id, s.tech.id, s.at)} style={{ height: 22, display: 'inline-flex', alignItems: 'center', padding: '0 8px', border: 0, borderRadius: 11, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', minHeight: 0 }}>Przydziel</button>
                </span>
              )}
            </div>
          );
        })}
        {!backlog.length && <p style={{ margin: '0 4px', fontSize: 12, color: 'var(--text-secondary)' }}>Wszystkie otwarte zgłoszenia mają termin.</p>}
        {due.length > 0 && <>
          <div style={{ ...sub, marginTop: 12 }}><h3 style={{ margin: 0, fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Przeglądy i kontrole</h3><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{due.length}</span></div>
          {due.map(p => (
            <Link key={p.id} href={p.href} className="card" style={card}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: '16px' }}><span style={{ flex: '1 1 auto' }} /><span className="num" style={{ color: p.overdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: p.overdue ? 500 : 400 }}>{p.overdue ? 'po terminie' : `do ${new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' }).format(new Date(p.due + 'T12:00:00Z')).replace('.', '')}`}</span></span>
              <span className="ell" style={{ fontWeight: 500 }}>{p.title}</span>
              <span className="ell" style={{ fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>{p.place}</span>
            </Link>
          ))}
        </>}
      </aside>

      <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', padding: '0 16px 24px 0', overflowX: 'auto' }}>
        <div style={{ minWidth: 820 }}>
          <div style={{ display: 'flex', height: 32 }}>
            <div style={{ flex: '0 0 232px' }} />
            <div style={{ position: 'relative', flex: '1 1 auto' }}>
              {Array.from({ length: 10 }, (_, i) => <span key={i} className="num" style={{ position: 'absolute', top: 0, left: `${i * 10}%`, transform: i ? 'translateX(-50%)' : 'none', paddingLeft: i ? 0 : 4, fontSize: 11, lineHeight: '28px', color: 'var(--text-tertiary)' }}>{String(7 + i).padStart(2, '0')}</span>)}
              {isToday && nowMin >= DAY_START && nowMin <= DAY_END && <span className="num" style={{ position: 'absolute', top: 6, left: pct(nowMin), transform: 'translateX(-50%)', height: 18, padding: '0 6px', borderRadius: 6, background: 'var(--danger)', color: 'rgb(255, 255, 255)', fontSize: 11, lineHeight: '18px', fontWeight: 500, zIndex: 3 }}>{hhmm(nowMin)}</span>}
            </div>
          </div>
          <div role="grid" aria-label="Plan dnia techników" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {technicians.map(tech => {
              const own = visits.filter(v => v.techIds.includes(tech.id)).sort((a, b) => a.start.localeCompare(b.start)), load = own.reduce((a, v) => a + v.minutes, 0);
              return (
                <div role="row" key={tech.id} style={{ display: 'flex', minHeight: 88, borderBottom: '1px solid var(--edge)' }}>
                  <div role="rowheader" style={{ flex: '0 0 232px', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, padding: '8px 8px 8px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}><PersonAvatar id={tech.id} label={tech.label} size={24} /><span className="ell" style={{ fontWeight: 500 }}>{personName(tech.label)}</span></span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 32 }}>
                      <span className="num ell" style={{ fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>{dur(load)} z 8 h</span>
                      <span aria-hidden="true" style={{ height: 4, borderRadius: 2, background: 'var(--bg-subtle)', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${Math.min(100, (load / WORK) * 100)}%`, borderRadius: 2, background: load > WORK ? 'var(--danger)' : load > WORK * 0.85 ? 'var(--st-progress)' : 'var(--text-tertiary)' }} /></span>
                    </span>
                  </div>
                  <div role="gridcell" aria-label={`Oś dnia: ${personName(tech.label)}`} onDragOver={e => { if (canManage) { e.preventDefault(); setOver(tech.id); } }} onDragLeave={() => setOver(o => (o === tech.id ? null : o))} onDrop={e => onDrop(e, tech.id)} style={{ position: 'relative', flex: '1 1 auto', minWidth: 0, background: over === tech.id ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : undefined }}>
                    {grid.map(g => <span key={g} aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: `${g}%`, width: 1, background: 'var(--edge)' }} />)}
                    {own.map((v, i) => {
                      const s = localMinutes(v.start), e = s + v.minutes, prev = own[i - 1], gap = prev ? s - (localMinutes(prev.start) + prev.minutes) : 0, movable = canManage && v.kind === 'service' && v.status === 'planned' && !!v.ticketId;
                      const width = `calc(${((Math.min(DAY_END, e) - Math.max(DAY_START, s)) / SPAN) * 100}% - 4px)`, wide = v.minutes >= 120;
                      return (
                        <span key={v.id}>
                          {(() => {
                            const origin = prev ? prev.at : base, travel = origin && v.at ? travelMinutes(origin, v.at) : null, km = origin && v.at ? roadKm(origin, v.at) : null;
                            const span = travel ?? (prev && gap > 0 ? gap : 0); if (!span) return null;
                            const startAt = s - span, tight = travel !== null && prev && gap < travel;
                            return <><span title={travel !== null ? `Dojazd ok. ${travel} min · ${Math.round(km!)} km${prev ? '' : ' z bazy'}${tight ? ' · za mało czasu' : ''}` : `Przerwa ${gap} min`} style={{ position: 'absolute', top: '50%', left: pct(startAt), width: `${(span / SPAN) * 100}%`, height: 0, borderTop: `1px dashed ${tight ? 'var(--danger)' : 'var(--border-strong)'}` }} /><span className="num" aria-hidden="true" style={{ position: 'absolute', top: 'calc(50% - 22px)', left: pct(startAt), width: `${(span / SPAN) * 100}%`, textAlign: 'center', fontSize: 11, lineHeight: '14px', color: tight ? 'var(--danger)' : 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{span}</span></>;
                          })()}
                          <Link href={v.href} className="card" draggable={movable} onDragStart={ev => { ev.dataTransfer.setData('application/x-plan', JSON.stringify({ ticketId: v.ticketId, visitId: v.id })); ev.dataTransfer.effectAllowed = 'move'; }} title={`${v.number} · ${v.title} · ${hhmm(s)}–${hhmm(e)} · ${v.label}${movable ? ' · przeciągnij, aby zmienić termin' : ''}`} style={{ position: 'absolute', top: 6, bottom: 6, left: `calc(${pct(s)} + 2px)`, width, zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, padding: '0 8px', borderRadius: 10, background: 'var(--bg-raised)', overflow: 'hidden', cursor: movable ? 'grab' : 'pointer' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: wide ? 6 : 4, minWidth: 0, fontSize: 12, lineHeight: '16px' }}><span role="img" aria-label={v.label} style={{ display: 'inline-flex', flex: '0 0 auto' }}>{glyph(v.status)}</span>{wide && <span className="mono" style={{ flex: '0 0 auto', fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{v.number}</span>}<span className="num ell" style={{ fontSize: wide ? 12 : 11, lineHeight: '14px', color: 'var(--text-tertiary)' }}>{wide ? `${hhmm(s)}–${hhmm(e)}` : hhmm(s)}</span></span>
                            <span style={{ fontSize: wide ? 13 : 12, fontWeight: 500, lineHeight: wide ? '20px' : '16px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: wide ? 1 : 2, WebkitBoxOrient: 'vertical' }}>{v.title}</span>
                            {wide && <span className="ell" style={{ fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>{v.place}</span>}
                          </Link>
                        </span>
                      );
                    })}
                    {!own.length && <span style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-tertiary)' }}>{canManage ? 'Wolny dzień — przeciągnij tu zgłoszenie' : 'Brak wizyt'}</span>}
                  </div>
                </div>
              );
            })}
            {isToday && nowMin >= DAY_START && nowMin <= DAY_END && <span aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(232px + (100% - 232px) * ${(nowMin - DAY_START) / SPAN})`, width: 1, zIndex: 2, background: 'var(--danger)' }} />}
            {!technicians.length && <p style={{ margin: 0, padding: 16, color: 'var(--text-secondary)' }}>Brak aktywnych techników. Dodaj ich w Użytkownikach.</p>}
          </div>
          {geo && <p role="status" style={{ margin: '12px 0 0 16px', fontSize: 12, color: 'var(--text-tertiary)' }}>Ustalanie położenia adresów w OpenStreetMap…</p>}
          {msg && <p role={msg.ok ? 'status' : 'alert'} style={{ margin: '12px 0 0 16px', fontSize: 12, color: msg.ok ? 'var(--success)' : 'var(--danger)' }}>{msg.text}</p>}
          {(late.length > 0 || urgentUnplanned.length > 0) && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '20px 0 0 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28 }}><h3 style={{ margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Do sprawdzenia</h3><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{late.length + urgentUnplanned.length}</span></div>
              {late.map(v => <Issue key={v.id} color="var(--st-blocked)" code={v.number} title={`${v.title} — wizyta nie rozpoczęta`} note={`Plan ${hhmm(localMinutes(v.start))}. Technik nie zmienił statusu na „W drodze” ani „W trakcie”.`} href={v.href} action="Otwórz" />)}
              {urgentUnplanned.map(t => <Issue key={t.id} color="var(--warning)" code={ticketCode(t.number)} title={`${t.subject} — pilne bez terminu`} note={t.place} href={`/dashboard/service/${t.id}`} action="Otwórz" />)}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Issue({ color, code, title, note, href, action }: { color: string; code: string; title: string; note: string; href: string; action: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-raised)' }}>
      <span style={{ display: 'inline-flex', color }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></svg></span>
      <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}><span><span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{code}</span> {title}</span><span style={{ fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)' }}>{note}</span></span>
      <Link href={href} className="sec" style={{ height: 28, display: 'inline-flex', alignItems: 'center', padding: '0 10px', border: 0, borderRadius: 8, background: 'var(--bg-subtle)', fontWeight: 500, whiteSpace: 'nowrap' }}>{action}</Link>
    </div>
  );
}
