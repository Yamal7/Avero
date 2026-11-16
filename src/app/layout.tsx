import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './precision.css';
const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono', display: 'swap' });
import { themeBootstrapScript } from '@/lib/theme';
import { StandaloneThemeSwitcher } from '@/components/theme-switcher';
export const metadata = { title: 'Panel firmy', description: 'System obsługi klientów i instalacji HVAC' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pl" data-theme="light" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBootstrapScript}} /></head><body>{children}<StandaloneThemeSwitcher /></body></html>;
}
