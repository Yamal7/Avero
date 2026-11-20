import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { companyProfileSchema,companyProfileSaveSchema } from '@hvac/api-client';
import { validCompanyLogo } from '@/lib/offers/logo';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight,readBody } from '@/lib/api/http';
export function GET(request:Request){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Profil firmy jest dostępny dla biura.');z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const r=await db.rpc('company_profile');databaseError(r.error);return json(request,companyProfileSchema.nullable(),r.data);});}
export function PUT(request:Request){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(role!=='admin')throw new ApiFault(403,'ACCESS_DENIED','Profil firmy zmienia administrator.');z.object({}).strict().parse(Object.fromEntries(new URL(request.url).searchParams));const input=companyProfileSaveSchema.parse(await readBody(request,131072));if(input.data.logoPng&&!validCompanyLogo(input.data.logoPng))throw new ApiFault(400,'INVALID_LOGO','Wybierz poprawne logo PNG lub JPG w formularzu.');const r=await db.rpc('save_company_profile',{p_version:input.version,p_data:input.data});databaseError(r.error);const response=json(request,companyProfileSchema,r.data);revalidatePath('/dashboard/settings');return response;});}
export function OPTIONS(request:Request){return preflight(request,['GET','PUT']);}
