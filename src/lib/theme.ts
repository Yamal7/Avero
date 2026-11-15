export type Theme='light'|'dark';
export const THEME_STORAGE_KEY='hvac-theme';
export const parseTheme=(value:unknown):Theme=>value==='dark'?'dark':'light';
// Run before the first paint. Only a fixed allowlist of theme names reaches the DOM.
export const themeBootstrapScript=`(()=>{let t='light';try{if(localStorage.getItem('hvac-theme')==='dark')t='dark'}catch{}document.documentElement.dataset.theme=t})()`;
