/* Układ kolumn tabeli w jednej linii (M0.3, DECISIONS 2026-11-22, design/tools/tabele_przewijane.py).
   - kolumny stałe mają szerokość treści w px, elastyczne — udział `fr` i minimum (główna 220 px, pozostałe 112–176 px co 8 px);
   - treść tabeli ma min-width = suma minimów, więc za szeroka tabela przewija się w poziomie zamiast ściskać kolumny;
   - kolumny do głównej włącznie są przypięte (sticky) z narastającym przesunięciem `left`.
   Komórka ma odstęp 12 px z prawej (pierwsza dodatkowo 8 px z lewej) — wliczony w ścieżkę siatki, bez column-gap,
   żeby między przypiętymi komórkami nie było przezroczystej szczeliny. */

export const CELL_PAD = 12;
export const ROW_START = 8;
export const MAIN_MIN = 220;

export type ColumnSpec =
  | { key: string; width: number; fr?: never; main?: never; min?: never }
  | { key: string; fr: number; main?: boolean; min?: number; width?: never };

export type TableLayout = {
  keys: string[];
  /** Szerokości minimalne ścieżek siatki (z odstępem komórki). */
  tracks: number[];
  /** grid-template-columns */
  template: string;
  /** Suma minimów — min-width treści tabeli. */
  minWidth: number;
  mainIndex: number;
  /** Przesunięcie `left` przypiętych kolumn (0…mainIndex). */
  pinnedLeft: number[];
  pinnedWidth: number;
  /** Początki kolumn za przypiętymi — cele przewijania ←/→. */
  starts: number[];
};

/** Minimum kolumny elastycznej (nie głównej): 140 px × fr, zaokrąglone do 8 px, w granicach 112–176. */
export function flexMin(fr: number) {
  return Math.max(112, Math.min(176, Math.round((140 * fr) / 8) * 8));
}

export function columnLayout(columns: ColumnSpec[]): TableLayout {
  if (!columns.length) throw new Error('Tabela bez kolumn');
  const flex = columns.map((c, i) => ({ c, i })).filter(({ c }) => c.fr !== undefined);
  const explicit = columns.findIndex(c => c.main);
  const biggest = flex.reduce((m, { c }) => Math.max(m, c.fr ?? 0), 0);
  const mainIndex = explicit >= 0 ? explicit : flex.find(({ c }) => c.fr === biggest)?.i ?? 0;
  const tracks: number[] = [], template: string[] = [];
  columns.forEach((c, i) => {
    const pad = CELL_PAD + (i === 0 ? ROW_START : 0);
    if (c.fr === undefined) {
      tracks.push(c.width + pad); template.push(`${c.width + pad}px`);
      return;
    }
    if (i < mainIndex) throw new Error(`Kolumna „${c.key}” przed główną musi mieć stałą szerokość`);
    let min = i === mainIndex ? MAIN_MIN : flexMin(c.fr);
    if (c.min !== undefined && i !== mainIndex) {
      if (c.min < 112 || c.min > 176 || c.min % 8) throw new Error(`Minimum kolumny „${c.key}” musi być w 112–176 px co 8 px`);
      min = c.min;
    }
    tracks.push(min + pad); template.push(`minmax(${min + pad}px, ${c.fr}fr)`);
  });
  const offsets = tracks.map((_, i) => tracks.slice(0, i).reduce((a, b) => a + b, 0));
  return {
    keys: columns.map(c => c.key),
    tracks,
    template: template.join(' '),
    minWidth: tracks.reduce((a, b) => a + b, 0),
    mainIndex,
    pinnedLeft: offsets.slice(0, mainIndex + 1),
    pinnedWidth: offsets[mainIndex]! + tracks[mainIndex]!,
    starts: offsets.slice(mainIndex + 1),
  };
}

/** Przypięcie komórki: przesunięcie `left` i czy rysować linię --edge (ostatnia przypięta = główna). */
export function cellPin(layout: Pick<TableLayout, 'pinnedLeft' | 'mainIndex'>, index: number) {
  if (index > layout.mainIndex) return undefined;
  return { left: layout.pinnedLeft[index]!, edge: index === layout.mainIndex };
}

/** Indeks kolumny po kluczu (komórki opisują kolumnę kluczem, a nie numerem — kolumny bywają ukryte). */
export function columnIndex(layout: Pick<TableLayout, 'keys'>, key: string) {
  const i = layout.keys.indexOf(key);
  if (i < 0) throw new Error(`Nieznana kolumna „${key}”`);
  return i;
}
