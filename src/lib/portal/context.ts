import { notFound,redirect } from 'next/navigation';
import { z } from 'zod';
import { portalCustomerSchema,portalScopeSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import type { PortalCustomer,PortalScope } from './types';
export async function requirePortalContext(customer?:string,search='') {
 const session=await requireSession();
 if(session.access.role==='technician')redirect('/dashboard');
 if(customer&&!z.string().uuid().safeParse(customer).success)notFound();
 const {data,error}=await session.db.rpc('portal_context',{p_customer:customer||null});
 if(error?.code==='42501')notFound();if(error||!data)throw new Error('Nie udało się sprawdzić dostępu do portalu.');
 const {data:options,error:optionsError}=await session.db.rpc('portal_account_options',{p_search:search.trim().slice(0,200)});
 if(optionsError)throw new Error('Nie udało się pobrać przypisań.');
 const parsedScope=portalScopeSchema.safeParse(data);
 const parsedChoices=z.array(portalCustomerSchema).safeParse(options);
 if(!parsedScope.success||!parsedChoices.success||parsedScope.data.preview!==(session.access.role!=='client'))throw new Error('Nie udało się potwierdzić kontekstu klienta.');
 const scope=parsedScope.data as PortalScope,choices=parsedChoices.data as PortalCustomer[];
 if(scope.customer&&!choices.some(choice=>choice.id===scope.customer!.id))choices.unshift(scope.customer);
 return {...session,scope,choices};
}
