'use client';
import type { ReactNode } from 'react';
export function OpenDetails({id,children}:{id:string;children:ReactNode}){
 return <a className="button" href={`#${id}`} onClick={()=>{const details=document.getElementById(id);if(details instanceof HTMLDetailsElement){details.open=true;details.querySelector('summary')?.focus();}}}>{children}</a>;
}
