import type { CSSProperties } from 'react';
export type IconName = 'check' | 'home' | 'users' | 'device' | 'search' | 'menu' | 'arrow' | 'plus' | 'logout' | 'sun' | 'moon' | 'bell' | 'settings' | 'wrench' | 'calendar' | 'pin' | 'file' | 'chevron' | 'box' | 'catalog' | 'layers';
const paths: Record<IconName, React.ReactNode> = {
  check: <><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 7-7"/></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
  users: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8m3 9v-3a7 7 0 0 0-2-5" /></>,
  device: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="12" cy="12" r="5" /><path d="m12 7 2 5-5 2 3-2-2-4m-4 9h.01M18 7h.01" /></>,
  search: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 4v16M4 12h16" />,
  logout: <><path d="M9 4H4v16h5m6-13 5 5-5 5M8 12h12" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" /></>,
  moon: <path d="M20.9 13.1A9 9 0 0 1 10.9 3a9 9 0 1 0 10 10.1Z" />,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  settings: <><path d="m9 3 1-2h4l1 2 2 1 2-1 2 3-1 2v3l2 1v4l-2 1v3l-2 1-2-1-2 1-1 2h-4l-1-2-2-1-2 1-2-3 1-2v-3l-2-1V9l2-1V5l2-1 2 1 2-1Z"/><circle cx="12" cy="12" r="3"/></>,
  wrench: <path d="m14 6 4 4 3-3a6 6 0 0 1-8 8l-7 7-4-4 7-7a6 6 0 0 1 8-8Z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 2v6m8-6v6" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
  file: <><path d="M14 2H5v20h14V7Zm0 0v6h5M8 12h8m-8 4h8" /></>,
  box: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5M12 12 3 7m9 5v10M7.5 4.5l9 5"/></>,
  catalog: <><path d="M4 3h13a3 3 0 0 1 3 3v16H6a2 2 0 0 1-2-2V3Zm0 15h16M8 7h8m-8 4h5"/></>,
  layers: <><path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/></>,
  chevron: <path d="m9 5 7 7-7 7" />,
};
export function Icon({ name, size = 22, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
