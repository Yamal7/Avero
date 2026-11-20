import { notFound } from 'next/navigation';
import { installationTemplateDetailSchema } from '@hvac/api-client';
import { requireSession } from '@/lib/auth';
import { uuid } from '@/lib/api/http';
import { InstallationTemplateEditor } from '@/components/installation-template-editor';
export default async function TemplatePage({params}:{params:Promise<{id:string}>}){const {id}=await params;if(!uuid.safeParse(id).success)notFound();const {db}=await requireSession(),r=await db.rpc('installation_template_detail',{p_id:id});if(r.error?.code==='42501')notFound();if(r.error)throw new Error('Nie udało się pobrać szablonu.');return <InstallationTemplateEditor initial={installationTemplateDetailSchema.parse(r.data)}/>;}
