import type { ReactNode } from 'react';
import './globals.css';
import { themeBootstrapScript } from '@/lib/theme';
import { StandaloneThemeSwitcher } from '@/components/theme-switcher';
export const metadata = { title: 'Panel firmy', description: 'System obsługi klientów i instalacji HVAC' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pl" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBootstrapScript}} /></head><body>{children}<StandaloneThemeSwitcher /></body></html>;
}
