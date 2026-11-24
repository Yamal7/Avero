/* Pozycja karty podglądu (M0.3): z prostokąta elementu (getBoundingClientRect), w układzie okna (position: fixed).
   Domyślnie pod elementem, 8 px niżej i 8 px w lewo (jak .hc w design/tools/ui1.py); przy krawędziach ekranu odbicie. */

type Rect = { left: number; top: number; right: number; bottom: number };
type Size = { width: number; height: number };

export function hoverCardPosition({ anchor, card, viewport, gap = 8, margin = 8, offsetX = -8 }: { anchor: Rect; card: Size; viewport: Size; gap?: number; margin?: number; offsetX?: number }) {
  let left = anchor.left + offsetX;
  if (left + card.width > viewport.width - margin) left = viewport.width - margin - card.width;
  if (left < margin) left = margin;

  const below = anchor.bottom + gap, above = anchor.top - gap - card.height;
  if (below + card.height <= viewport.height - margin) return { left, top: below, placement: 'bottom' as const };
  if (above >= margin) return { left, top: above, placement: 'top' as const };
  // Nie mieści się z żadnej strony: tam, gdzie więcej miejsca, przycięte do ekranu.
  const roomBelow = viewport.height - anchor.bottom, roomAbove = anchor.top;
  if (roomBelow >= roomAbove) return { left, top: Math.max(margin, Math.min(below, viewport.height - margin - card.height)), placement: 'bottom' as const };
  return { left, top: Math.max(margin, above), placement: 'top' as const };
}
