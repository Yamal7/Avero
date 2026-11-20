'use client';
import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { parseTheme,THEME_STORAGE_KEY,type Theme } from '@/lib/theme';
import { Icon } from './icon';
function subscribe(notify:()=>void){
 const storage=(event:StorageEvent)=>{if(event.key===THEME_STORAGE_KEY||event.key===null){document.documentElement.dataset.theme=parseTheme(event.newValue);notify();}};
 window.addEventListener('storage',storage);window.addEventListener('hvac-theme-change',notify);
 return ()=>{window.removeEventListener('storage',storage);window.removeEventListener('hvac-theme-change',notify);};
}
function setTheme(theme:Theme){
 document.documentElement.dataset.theme=theme;
 try{localStorage.setItem(THEME_STORAGE_KEY,theme);}catch{/* The current page can still change theme when persistence is unavailable. */}
 window.dispatchEvent(new Event('hvac-theme-change'));
}
function useTheme(){return useSyncExternalStore(subscribe,()=>parseTheme(document.documentElement.dataset.theme),()=> 'light' as Theme);}
export function ThemeCapsule(){
 const theme=useTheme();
 return <button type="button" className="theme-capsule-button" role="switch" aria-checked={theme==='dark'} aria-label="Ciemny motyw" title={theme==='dark'?'Włącz jasny motyw':'Włącz ciemny motyw'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}><span className="theme-capsule-track" aria-hidden="true"><span className="theme-capsule-thumb"/></span></button>;
}
export function ThemeSwitcher(){
 const theme=useTheme();
 return <div className="theme-switcher" role="group" aria-label="Motyw programu"><button type="button" aria-label="Jasny motyw" aria-pressed={theme==='light'} title="Jasny motyw" onClick={()=>setTheme('light')}><Icon name="sun" size={18}/><span>Jasny</span></button><button type="button" aria-label="Ciemny motyw" aria-pressed={theme==='dark'} title="Ciemny motyw" onClick={()=>setTheme('dark')}><Icon name="moon" size={18}/><span>Ciemny</span></button></div>;
}

export function StandaloneThemeSwitcher(){const path=usePathname();return path.startsWith('/dashboard')||path.startsWith('/portal')?null:<div className="standalone-theme no-print"><ThemeSwitcher /></div>;}
