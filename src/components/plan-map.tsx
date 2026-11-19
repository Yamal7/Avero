'use client';
/* Planowanie · mapa tras — layout and overlays follow the design artboard; the map itself is OpenStreetMap tiles
   (muted with CSS) in Web Mercator with an SVG overlay. Requires the © OpenStreetMap attribution. */
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { assignTechnician, scheduleVisit } from '@/app/(dashboard)/dashboard/service/actions';
import { PersonAvatar, PriorityIcon, ProgressGlyph, personColor, personName, ticketCode } from './design-icons';
import { freeSlot, hhmm, localMinutes, type PlanTech, type PlanTicket, type PlanVisit } from './plan-day';
import { roadKm, type LatLng } from '@/lib/geo';

const TILE = 256;
const lon2x = (lng: number, z: number) => ((lng + 180) / 360) * TILE * 2 ** z;
const lat2y = (lat: number, z: number) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE * 2 ** z; };
const chip: CSSProperties = { height: 22, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 8px 0 6px', borderRadius: 11, background: 'var(--bg-subtle)', fontSize: 12, lineHeight: '16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' };
const km = (v: number) => (v < 10 ? v.toFixed(1).replace('.', ',') : String(Math.round(v)));
type Pop = { kind: 'ticket'; id: string } | { kind: 'visit'; id: string } | null;

export function PlanMap({ day, isToday, nowIso, technicians, visits, backlog, base, baseLabel, canManage, geoPending }: { day: string; isToday: boolean; nowIso: string; technicians: PlanTech[]; visits: PlanVisit[]; backlog: PlanTicket[]; base: LatLng | null; baseLabel: string; canManage: boolean; geoPending: boolean }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 700 }), [zoom, setZoom] = useState<number | null>(null), [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const [pop, setPop] = useState<Pop>(null), [busy, setBusy] = useState(false), [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null), [geo, setGeo] = useState(geoPending && canManage);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height })); ro.observe(el); return () => ro.disconnect(); }, []);
  useEffect(() => {
    if (!geoPending || !canManage) return; let stop = false;
    (async () => { for (let i = 0; i < 10 && !stop; i++) { try { const r = await fetch('/api/v1/geocode', { method: 'POST' }); if (!r.ok) break; const b = await r.json(); if (!b.remaining) break; } catch { break; } } if (!stop) { setGeo(false); router.refresh(); } })();
    return () => { stop = true; };
  }, [geoPending, canManage, router]);

  const points = useMemo(() => [...visits.map(v => v.at), ...backlog.map(t => t.at), base].filter((p): p is LatLng => !!p), [visits, backlog, base]);
  const fit = useMemo(() => {
    if (!points.length) return { z: 11, cx: lon2x(18.6, 11), cy: lat2y(54.4, 11) };
    const lats = points.map(p => p.lat), lngs = points.map(p => p.lng);
    for (let z = 14; z >= 5; z--) { const w = lon2x(Math.max(...lngs), z) - lon2x(Math.min(...lngs), z), h = lat2y(Math.min(...lats), z) - lat2y(Math.max(...lats), z); if (w < size.w - 160 && h < size.h - 160) return { z, cx: (lon2x(Math.max(...lngs), z) + lon2x(Math.min(...lngs), z)) / 2, cy: (lat2y(Math.min(...lats), z) + lat2y(Math.max(...lats), z)) / 2 }; }
    return { z: 5, cx: lon2x(19, 5), cy: lat2y(52, 5) };
  }, [points, size]);
  const z = zoom ?? fit.z, c = center ?? { x: fit.cx * 2 ** (z - fit.z), y: fit.cy * 2 ** (z - fit.z) };
  const px = (p: LatLng) => ({ x: lon2x(p.lng, z) - c.x + size.w / 2, y: lat2y(p.lat, z) - c.y + size.h / 2 });
  function zoomBy(d: number) { const nz = Math.max(5, Math.min(18, z + d)); setCenter({ x: c.x * 2 ** (nz - z), y: c.y * 2 ** (nz - z) }); setZoom(nz); }
  const tiles: { x: number; y: number; left: number; top: number }[] = [];
  const x0 = Math.floor((c.x - size.w / 2) / TILE), x1 = Math.floor((c.x + size.w / 2) / TILE), y0 = Math.floor((c.y - size.h / 2) / TILE), y1 = Math.floor((c.y + size.h / 2) / TILE), n = 2 ** z;
  for (let x = x0; x <= x1; x++) for (let y = Math.max(0, y0); y <= Math.min(n - 1, y1); y++) tiles.push({ x: ((x % n) + n) % n, y, left: x * TILE - c.x + size.w / 2, top: y * TILE - c.y + size.h / 2 });

  const nowMin = localMinutes(nowIso), from = isToday ? nowMin : 7 * 60;
  const routes = technicians.map(t => ({ tech: t, color: personColor(t.id), stops: visits.filter(v => v.techIds.includes(t.id)).sort((a, b) => a.start.localeCompare(b.start)) }));
  const kmToday = (stops: PlanVisit[]) => { let sum = 0, prev = base; for (const s of stops) { if (prev && s.at) sum += roadKm(prev, s.at); if (s.at) prev = s.at; } return sum; };
  const suggest = (t: PlanTicket) => {
    let best: { tech: PlanTech; at: number; km: number | null } | null = null;
    for (const tech of (t.assignedTo ? technicians.filter(x => x.id === t.assignedTo) : technicians)) {
      const at = freeSlot(visits, tech.id, from); if (at === null) continue;
      const prev = visits.filter(v => v.techIds.includes(tech.id) && v.at && localMinutes(v.start) < at).sort((a, b) => b.start.localeCompare(a.start))[0], origin = prev?.at ?? base, d = origin && t.at ? roadKm(origin, t.at) : null;
      if (!best || (d !== null && best.km !== null ? d < best.km : at < best.at)) best = { tech, at, km: d };
    }
    return best;
  };
  async function plan(t: PlanTicket, techId: string, at: number) {
    if (!canManage || busy) return; setBusy(true); setMsg(null);
    try {
      if (t.assignedTo !== techId) { const r = await assignTechnician(t.id, techId); if (r.error) throw new Error(r.error); }
      const r = await scheduleVisit({ ticketId: t.id, visitId: null, localStart: `${day}T${hhmm(at)}`, duration: 60, notes: '' }); if (r.error) throw new Error(r.error);
      setMsg({ ok: true, text: `${ticketCode(t.number)} zaplanowane na ${hhmm(at)}.` }); setPop(null); router.refresh();
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Nie udało się zaplanować.' }); } finally { setBusy(false); }
  }
  const popTicket = pop?.kind === 'ticket' ? backlog.find(t => t.id === pop.id) : undefined, popVisit = pop?.kind === 'visit' ? visits.find(v => v.id === pop.id) : undefined;
  const popAt = popTicket?.at ?? popVisit?.at;

  return (
    <div className="plan-split" style={{ flex: '1 1 auto', display: 'flex', alignItems: 'stretch', minHeight: 0, borderTop: '1px solid var(--edge)' }}>
      <aside aria-label="Technicy i zgłoszenia" className="plan-backlog" style={{ flex: '0 0 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 12px 24px', borderRight: '1px solid var(--edge)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 4px' }}><h2 style={{ flex: '1 1 auto', margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Technicy</h2><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{technicians.length}</span></div>
        {routes.map(({ tech, stops }) => {
          const next = stops.find(s => localMinutes(s.start) + s.minutes > from && s.status !== 'completed'), active = stops.find(s => s.status === 'in_progress' || s.status === 'en_route');
          return (
            <button key={tech.id} type="button" onClick={() => { const s = (active ?? next ?? stops[0]); if (s) setPop({ kind: 'visit', id: s.id }); }} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', border: 0, borderRadius: 12, background: 'var(--bg-raised)', textAlign: 'left', minHeight: 0, boxShadow: pop?.kind === 'visit' && stops.some(s => s.id === pop.id) ? 'inset 0 0 0 1.5px var(--accent)' : 'none' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PersonAvatar id={tech.id} label={tech.label} size={24} /><span className="ell" style={{ fontWeight: 500 }}>{personName(tech.label)}</span></span>
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 32 }}>
                <span style={chip}>{active ? <ProgressGlyph color="var(--st-progress)" fraction={active.status === 'in_progress' ? 2 / 3 : 1 / 3} /> : next ? <ProgressGlyph color="var(--text-secondary)" /> : <ProgressGlyph color="var(--success)" fraction={1} />}{active ? active.label : next ? hhmm(localMinutes(next.start)) : 'Wolny'}</span>
                {next && <span style={chip}>{next.place.split(' · ').pop()}</span>}
                <span className="num" style={chip}>{stops.length} {stops.length === 1 ? 'wizyta' : 'wizyt'}</span>
                {base && stops.some(s => s.at) && <span className="num" style={chip}>{km(kmToday(stops))} km</span>}
              </span>
            </button>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 4px', marginTop: 12 }}><h2 style={{ flex: '1 1 auto', margin: 0, fontSize: 13, lineHeight: '20px', fontWeight: 500 }}>Bez terminu</h2><span className="num" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{backlog.length}</span></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {backlog.map(t => {
            const s = suggest(t);
            return (
              <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 4px', borderBottom: '1px solid var(--edge)' }}>
                <button type="button" onClick={() => setPop({ kind: 'ticket', id: t.id })} disabled={!t.at} title={t.at ? 'Pokaż na mapie' : 'Brak położenia adresu'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 0, border: 0, background: 'transparent', textAlign: 'left', minHeight: 0 }}>
                  <span style={{ display: 'inline-flex', color: t.priority === 'high' ? 'var(--danger)' : 'var(--text-secondary)' }}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></span>
                  <span className="ell" style={{ flex: '1 1 auto', fontWeight: 500 }}>{t.subject}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ticketCode(t.number)}</span>
                </button>
                {canManage && s && <span style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 22, fontSize: 12 }}><span style={{ ...chip, padding: '0 8px 0 3px' }}><PersonAvatar id={s.tech.id} label={s.tech.label} size={16} /><span style={{ color: 'var(--text-primary)' }}>{personName(s.tech.label)} {hhmm(s.at)}</span></span>{s.km !== null && <span className="num" style={{ color: 'var(--text-tertiary)' }}>{km(s.km)} km</span>}<span style={{ flex: '1 1 auto' }} /><button type="button" className="capd" disabled={busy} onClick={() => void plan(t, s.tech.id, s.at)} style={{ height: 22, display: 'inline-flex', alignItems: 'center', padding: '0 8px', border: 0, borderRadius: 11, fontSize: 12, fontWeight: 500, minHeight: 0 }}>Przydziel</button></span>}
              </div>
            );
          })}
          {!backlog.length && <p style={{ margin: '0 4px', fontSize: 12, color: 'var(--text-secondary)' }}>Wszystkie otwarte zgłoszenia mają termin.</p>}
        </div>
        {geo && <p role="status" style={{ margin: '8px 4px 0', fontSize: 12, color: 'var(--text-tertiary)' }}>Ustalanie położenia adresów w OpenStreetMap…</p>}
        {msg && <p role={msg.ok ? 'status' : 'alert'} style={{ margin: '8px 4px 0', fontSize: 12, color: msg.ok ? 'var(--success)' : 'var(--danger)' }}>{msg.text}</p>}
      </aside>

      <div ref={box} className="plan-map" onPointerDown={e => { if ((e.target as HTMLElement).closest('button,a')) return; drag.current = { x: e.clientX, y: e.clientY, cx: c.x, cy: c.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }} onPointerMove={e => { const d = drag.current; if (d) { setZoom(z); setCenter({ x: d.cx - (e.clientX - d.x), y: d.cy - (e.clientY - d.y) }); } }} onPointerUp={() => { drag.current = null; }} style={{ position: 'relative', flex: '1 1 auto', minWidth: 0, minHeight: 560, overflow: 'hidden', background: 'var(--map-land, #F2F1EE)', cursor: drag.current ? 'grabbing' : 'grab', touchAction: 'none' }}>
        <div className="plan-tiles" aria-hidden="true">{tiles.map(t => /* map tiles: next/image optimisation does not apply */ // eslint-disable-next-line @next/next/no-img-element
          <img key={`${z}-${t.x}-${t.y}-${t.left}`} alt="" draggable={false} src={`https://tile.openstreetmap.org/${z}/${t.x}/${t.y}.png`} width={TILE} height={TILE} style={{ position: 'absolute', left: t.left, top: t.top, width: TILE, height: TILE, userSelect: 'none' }} />)}</div>
        <svg width={size.w} height={size.h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
          {routes.map(({ tech, color, stops }) => {
            const pts = [base, ...stops.map(s => s.at)].filter((p): p is LatLng => !!p).map(px);
            return pts.length > 1 && <g key={tech.id}>{pts.slice(1).map((p, i) => { const done = stops[i] && (stops[i].status === 'completed' || stops[i].status === 'in_progress'); return <line key={i} x1={pts[i].x} y1={pts[i].y} x2={p.x} y2={p.y} stroke={color} strokeWidth={done ? 3 : 2.5} strokeDasharray={done ? undefined : '2 5'} strokeLinecap="round" opacity={0.9} />; })}</g>;
          })}
        </svg>
        {base && (() => { const p = px(base); return <span title={`Baza: ${baseLabel}`} style={{ position: 'absolute', left: p.x - 10, top: p.y - 10, width: 20, height: 20, borderRadius: 5, background: 'var(--text-primary)', color: 'var(--bg-surface)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, zIndex: 2 }}>{(baseLabel.trim()[0] || 'B').toUpperCase()}</span>; })()}
        {routes.flatMap(({ tech, color, stops }) => stops.map((s, i) => {
          if (!s.at) return null; const p = px(s.at), done = s.status === 'completed';
          return <button key={s.id} type="button" onClick={() => setPop({ kind: 'visit', id: s.id })} aria-label={`${personName(tech.label)}, przystanek ${i + 1}: ${s.title}`} title={`${hhmm(localMinutes(s.start))} · ${s.number} ${s.title}`} style={{ position: 'absolute', left: p.x - 10, top: p.y - 10, width: 20, height: 20, minHeight: 0, padding: 0, borderRadius: '50%', border: `1.5px solid ${color}`, background: done ? color : 'var(--bg-surface)', color: done ? '#fff' : color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, zIndex: 3, cursor: 'pointer' }}>{done ? '✓' : i + 1}</button>;
        }))}
        {backlog.map(t => { if (!t.at) return null; const p = px(t.at); return <button key={t.id} type="button" onClick={() => setPop({ kind: 'ticket', id: t.id })} aria-label={`Zgłoszenie bez terminu: ${t.subject}`} title={`${ticketCode(t.number)} · ${t.subject}`} style={{ position: 'absolute', left: p.x - 8, top: p.y - 8, width: 16, height: 16, minHeight: 0, padding: 0, transform: 'rotate(45deg)', border: `1.5px solid ${t.priority === 'high' ? 'var(--danger)' : 'var(--text-primary)'}`, borderRadius: 2, background: 'var(--bg-surface)', zIndex: 3, cursor: 'pointer' }} />; })}

        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '6px 12px', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-pop)', fontSize: 12, zIndex: 5 }}>
          {routes.map(({ tech, color }) => <span key={tech.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{personName(tech.label)}</span>)}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--text-secondary)' }} />Zgłoszenia</span>
        </div>
        <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', alignItems: 'center', gap: 16, padding: '6px 12px', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-pop)', fontSize: 12, color: 'var(--text-secondary)', zIndex: 5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 20, height: 0, borderTop: '2.5px solid var(--text-secondary)' }} />przejechane</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 20, height: 0, borderTop: '2.5px dotted var(--text-secondary)' }} />plan</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, transform: 'rotate(45deg)', border: '1.5px solid var(--text-primary)' }} />zgłoszenie bez terminu</span>
          {base && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--text-primary)' }} />baza</span>}
        </div>
        <div style={{ position: 'absolute', right: 16, bottom: 32, display: 'flex', flexDirection: 'column', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-pop)', zIndex: 5 }}>
          <button type="button" aria-label="Przybliż" onClick={() => zoomBy(1)} style={{ width: 36, height: 36, minHeight: 0, padding: 0, border: 0, background: 'transparent', fontSize: 18, color: 'var(--text-secondary)' }}>+</button>
          <button type="button" aria-label="Oddal" onClick={() => zoomBy(-1)} style={{ width: 36, height: 36, minHeight: 0, padding: 0, border: 0, borderTop: '1px solid var(--edge)', background: 'transparent', fontSize: 18, color: 'var(--text-secondary)' }}>−</button>
          <button type="button" aria-label="Dopasuj widok" title="Pokaż wszystko" onClick={() => { setZoom(null); setCenter(null); }} style={{ width: 36, height: 36, minHeight: 0, padding: 0, border: 0, borderTop: '1px solid var(--edge)', background: 'transparent', color: 'var(--text-secondary)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11 22 2l-9 19-2-8-8-2z" /></svg></button>
        </div>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={{ position: 'absolute', right: 0, bottom: 0, padding: '2px 6px', background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)', fontSize: 11, color: 'var(--text-secondary)', zIndex: 5 }}>© OpenStreetMap</a>
        {!points.length && !geo && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}><p style={{ margin: 0, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-pop)', color: 'var(--text-secondary)' }}>Brak adresów z położeniem na ten dzień.</p></div>}

        {pop && popAt && (() => {
          const p = px(popAt), left = Math.min(size.w - 316, Math.max(16, p.x + 18)), top = Math.min(size.h - 200, Math.max(60, p.y - 40));
          if (popTicket) { const s = suggest(popTicket); return (
            <div role="dialog" aria-label={popTicket.subject} style={{ position: 'absolute', left, top, width: 300, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-pop)', zIndex: 6, cursor: 'default' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><PriorityIcon priority={popTicket.priority === 'high' ? 'high' : popTicket.priority === 'low' ? 'low' : 'normal'} /><span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ticketCode(popTicket.number)}</span><span style={{ flex: '1 1 auto' }} /><button type="button" aria-label="Zamknij" onClick={() => setPop(null)} style={{ width: 20, height: 20, minHeight: 0, padding: 0, border: 0, background: 'transparent', color: 'var(--text-tertiary)' }}>×</button></span>
              <span style={{ fontWeight: 500 }}>{popTicket.subject}</span><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{popTicket.place}</span>
              {canManage && s && <><span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><span style={{ ...chip, padding: '0 8px 0 3px' }}><PersonAvatar id={s.tech.id} label={s.tech.label} size={16} />{personName(s.tech.label)}</span>{s.km !== null && <span className="num" style={chip}>{km(s.km)} km</span>}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Link href={`/dashboard/service/${popTicket.id}`} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Inny technik</Link><span style={{ flex: '1 1 auto' }} /><button type="button" className="pri" disabled={busy} onClick={() => void plan(popTicket, s.tech.id, s.at)} style={{ height: 28, padding: '0 12px', border: 0, borderRadius: 8, background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500, minHeight: 0 }}>Przydziel na {hhmm(s.at)}</button></span></>}
            </div>); }
          if (popVisit) { const tech = technicians.find(t => popVisit.techIds.includes(t.id)); return (
            <div role="dialog" aria-label={popVisit.title} style={{ position: 'absolute', left, top, width: 300, display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-pop)', zIndex: 6, cursor: 'default' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--edge)' }}>{tech && <PersonAvatar id={tech.id} label={tech.label} size={32} />}<span style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 500 }}>{tech ? personName(tech.label) : 'Ekipa'}</span><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{popVisit.kind === 'work' ? 'Montaż' : 'Serwis'}</span></span><button type="button" aria-label="Zamknij" onClick={() => setPop(null)} style={{ width: 20, height: 20, minHeight: 0, padding: 0, border: 0, background: 'transparent', color: 'var(--text-tertiary)' }}>×</button></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{popVisit.status === 'completed' ? <ProgressGlyph color="var(--success)" fraction={1} /> : <ProgressGlyph color="var(--st-progress)" fraction={popVisit.status === 'planned' ? 0 : 2 / 3} />}{popVisit.label} · {hhmm(localMinutes(popVisit.start))}–{hhmm(localMinutes(popVisit.start) + popVisit.minutes)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{popVisit.number}</span>{popVisit.title}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{popVisit.place}</span>
              <Link href={popVisit.href} className="sec" style={{ height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'var(--bg-subtle)', fontWeight: 500 }}>Otwórz zlecenie</Link>
            </div>); }
          return null;
        })()}
      </div>
    </div>
  );
}
