export function AppLogo({size=34}:{size?:number}){
 return <svg width={size} height={size+4} viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M16 1 29 8.5v15L16 31 3 23.5v-15L16 1Z" fill="#fd4b01"/><path d="m16 1 13 7.5L16 16v15L3 23.5V16l13-7.5V1Z" fill="#ff7900"/><path d="m16 16 13 7.5L16 31V16Z" fill="#d93c00"/><path d="m16 9 6.5 3.75v7.5L16 24l-6.5-3.75v-7.5L16 9Z" fill="var(--page)"/><path d="M16 1v15l13 7.5v-15L16 1Z" fill="#ff6200"/></svg>;
}
