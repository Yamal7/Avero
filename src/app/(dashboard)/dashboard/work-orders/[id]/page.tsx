import { notFound } from 'next/navigation';
import { z } from 'zod';
import { workOrderSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { WorkOrderDetail } from '@/components/work-order-detail';
export default async function WorkOrderPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const {db}=await requireSession(),result=await db.rpc('work_order_detail',{p_id:id});if(result.error?.code==='42501'||!result.data&&!result.error)notFound();if(result.error)throw new Error('Nie udało się pobrać zlecenia.');const order=workOrderSchema.parse(result.data);
 let technicians:{id:string;email:string}[]=[];if(order.canManage){const options=await db.rpc('service_technicians',{p_customer:order.customerId});if(options.error)throw new Error('Nie udało się pobrać ekipy.');technicians=z.array(z.object({id:z.string().uuid(),email:z.string()})).parse(options.data);}
 return <WorkOrderDetail initial={order} technicians={technicians}/>;
}
