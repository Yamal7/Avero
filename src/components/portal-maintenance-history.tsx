import Link from 'next/link';
import { maintenanceHistorySchema } from '@hvac/api-client';
import { createClient } from '@/lib/supabase/server';
import { portalHref } from '@/lib/portal/routes';
import { MaintenanceHistoryList } from '@/components/maintenance-history';
export async function PortalMaintenanceHistory({customer,installation,page}:{customer:string;installation:string;page:number}){
 const db=await createClient(),result=await db.rpc('portal_maintenance_history',{p_customer:customer,p_installation:installation,p_page:page});if(result.error)throw new Error('Nie udało się pobrać historii przeglądów.');
 const history=maintenanceHistorySchema.parse(result.data),href=(value:number)=>portalHref(`/portal/installations/${installation}`,customer,{maintenancePage:String(value)});
 return <section className="portal-card"><h2>Wykonane przeglądy</h2><MaintenanceHistoryList items={history.items} customer={customer} />{(history.total>20||page>1)&&<div className="pagination">{page>1&&<Link href={href(page-1)}>← Nowsze</Link>}<span>Strona {page}</span>{page*20<history.total&&<Link href={href(page+1)}>Starsze →</Link>}</div>}</section>;
}
