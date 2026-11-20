/* Geography for Planowanie: address keys (same as SQL geocode_key), distances and travel estimates. */
export type LatLng = { lat: number; lng: number };
export const geoKey = (address: string | null | undefined, city: string | null | undefined) => [address, city].map(v => (v ?? '').trim()).filter(Boolean).join(', ').replace(/\s+/g, ' ').toLowerCase();
export function distanceKm(a: LatLng, b: LatLng) {
  const r = 6371, rad = Math.PI / 180, dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}
/** Road estimate: straight line × 1.3, 40 km/h in town, at least 5 min, rounded up to 5 min. */
export const roadKm = (a: LatLng, b: LatLng) => distanceKm(a, b) * 1.3;
export const travelMinutes = (a: LatLng, b: LatLng) => Math.max(5, Math.ceil((roadKm(a, b) / 40) * 60 / 5) * 5);
