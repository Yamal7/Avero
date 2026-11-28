'use client';
import { useId, useRef, type ReactNode } from 'react';
import { DotsThree } from '@phosphor-icons/react/ssr';
import { buttonClasses } from '@/components/ui/button';
/** Okno działań rekordu. `compact` — wyzwalacz jako okrągły przycisk z ikoną (Tailwind, tabele w jednej linii, M0.4). */
export function RecordActions({label,children,compact=false}:{label:string;children:ReactNode;compact?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),id=useId();
 return <>{compact
  ?<button type="button" className={buttonClasses({variant:'icon',size:'sm'})} aria-label={`Działania: ${label}`} title="Działania" onClick={()=>dialog.current?.showModal()}><DotsThree size={16} weight="bold" className="shrink-0" aria-hidden /></button>
  :<button type="button" className="record-actions-button" aria-label={`Działania: ${label}`} onClick={()=>dialog.current?.showModal()}>•••</button>}
  <dialog ref={dialog} className="shell-dialog record-actions-dialog" aria-labelledby={id}><div className="shell-dialog-heading"><h2 id={id}>{label}</h2><button type="button" className="sidebar-icon-button" aria-label="Zamknij działania" onClick={()=>dialog.current?.close()}>×</button></div><div className="record-actions-content">{children}</div></dialog></>;
}
