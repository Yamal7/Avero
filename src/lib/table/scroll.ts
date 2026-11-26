/* ←/→ w tabeli przewijanej w poziomie (M0.3, DECISIONS 2026-11-22): przesunięcie o jedną kolumnę.
   Kolumna jest „na początku”, gdy jej lewa krawędź styka się z prawą krawędzią przypiętych kolumn. */

const EPS = 1; // tolerancja ułamkowego przewinięcia (gładzik, powiększenie strony)

export function arrowScrollTarget({ scrollLeft, maxScroll, pinnedWidth, starts, direction }: { scrollLeft: number; maxScroll: number; pinnedWidth: number; starts: number[]; direction: 'left' | 'right' }) {
  const max = Math.max(0, maxScroll);
  const stops = starts.map(x => Math.max(0, x - pinnedWidth));
  if (direction === 'right') {
    const next = stops.find(s => s > scrollLeft + EPS);
    return Math.min(next ?? max, max);
  }
  const prev = [...stops].reverse().find(s => s < scrollLeft - EPS);
  return Math.max(0, Math.min(prev ?? 0, max));
}
