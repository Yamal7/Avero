import { describe, expect, it } from 'vitest';
import { nextSidebarMode, parseSidebarMode, sidebarModeLabels } from '@/lib/navigation/sidebar-mode';

describe('tryb lewego panelu', () => {
  it('przełącza trzy stany cyklicznie i nazywa kolejną akcję', () => {
    expect(nextSidebarMode('expanded')).toBe('collapsed');
    expect(nextSidebarMode('collapsed')).toBe('hidden');
    expect(nextSidebarMode('hidden')).toBe('expanded');
    expect(Object.values(sidebarModeLabels)).toEqual([
      'Zwiń panel boczny', 'Ukryj panel boczny', 'Pokaż panel boczny',
    ]);
  });

  it.each(['expanded', 'collapsed', 'hidden'])('odczytuje zapisaną wartość %s', mode => {
    expect(parseSidebarMode(mode)).toBe(mode);
  });

  it.each([null, undefined, true, {}, 'closed'])('pomija nieznaną preferencję %j', value => {
    expect(parseSidebarMode(value)).toBeUndefined();
  });
});
