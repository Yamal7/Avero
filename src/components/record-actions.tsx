'use client';
import { useId, useRef, type ReactNode } from 'react';
export function RecordActions({label,children}:{label:string;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),id=useId();
 return <><button type="button" className="record-actions-button" aria-label={`Działania: ${label}`} onClick={()=>dialog.current?.showModal()}>•••</button><dialog ref={dialog} className="shell-dialog record-actions-dialog" aria-labelledby={id}><div className="shell-dialog-heading"><h2 id={id}>{label}</h2><button type="button" className="sidebar-icon-button" aria-label="Zamknij działania" onClick={()=>dialog.current?.close()}>×</button></div><div className="record-actions-content">{children}</div></dialog></>;
}
