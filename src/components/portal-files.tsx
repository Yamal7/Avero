import Link from 'next/link';
import { documentListSchema } from '@hvac/api-client';
import { createClient } from '@/lib/supabase/server';
import { portalHref } from '@/lib/portal/routes';
import { formatFileSize } from '@/lib/documents/types';
export async function PortalFiles({installation,ticket,customer}:{installation:string;ticket?:string;customer:string}){
 const db=await createClient(),result=await db.rpc('installation_documents',{p_installation:installation,p_ticket:ticket||null,p_page:1,p_archived:false,p_customer:customer});
 if(result.error)throw new Error('Nie udało się pobrać udostępnionych plików.');const list=documentListSchema.parse({...result.data,apiVersion:'1',page:1,pageSize:20});
 return <section className="portal-card"><h2>{ticket?'Udostępnione załączniki':'Dokumenty instalacji'}</h2>{list.documents.length?<ul className="portal-file-list">{list.documents.map(file=><li key={file.id}><div><strong>{file.file_name}</strong>{file.uploaded_by_client&&<span className="badge">Dodane przez klienta</span>}<p className="muted">{formatFileSize(file.byte_size)}</p></div><a className="button secondary" href={portalHref(`/portal/documents/${file.id}/download`,customer)}>Pobierz</a></li>)}</ul>:<p className="muted">Firma nie udostępniła jeszcze plików w tym miejscu.</p>}{list.total>20&&<p>Pokazano 20 z {list.total} plików.</p>}<Link href={portalHref('/portal/documents',customer)}>Wszystkie moje dokumenty →</Link></section>;
}
