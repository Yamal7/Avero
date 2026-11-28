export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

const nextMode: Record<SidebarMode, SidebarMode> = {
  expanded: 'collapsed',
  collapsed: 'hidden',
  hidden: 'expanded',
};

export const sidebarModeLabels: Record<SidebarMode, string> = {
  expanded: 'Zwiń panel boczny',
  collapsed: 'Ukryj panel boczny',
  hidden: 'Pokaż panel boczny',
};

export function nextSidebarMode(mode: SidebarMode): SidebarMode {
  return nextMode[mode];
}

export function parseSidebarMode(value: unknown): SidebarMode | undefined {
  if (value === 'expanded' || value === 'collapsed' || value === 'hidden') return value;
}
