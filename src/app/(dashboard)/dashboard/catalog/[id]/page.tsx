import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth';
import { catalogColumns,catalogRecord } from '@/lib/catalog/data';
import { CatalogForm,CatalogArchive } from '@/components/catalog-form';
import { ListHeader } from '@/components/list-layout';
export default async function CatalogDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{created?:string;saved?:string}>}){
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const {db}=await requireStaff();
 const {data,error}=await db.from('catalog_items').select(catalogColumns).eq('id',id).maybeSingle();if(error)throw new Error('Nie udało się pobrać pozycji.');if(!data)notFound();
 const item=catalogRecord(data),query=await searchParams;
 return <main className="list-page"><ListHeader category={`Katalog · ${item.code}`} title={item.name}/>{(query.created==='1'||query.saved==='1')&&<p role="status" className="success">{query.created==='1'?'Pozycja została dodana do katalogu.':'Zmiany zapisano.'}</p>}{item.archived&&<p className="muted">Pozycja archiwalna. Przywróć ją, aby edytować dane.</p>}<CatalogForm key={`${item.id}:${item.version}`} record={item}/><details className="card catalog-status-card"><summary>{item.archived?'Przywróć pozycję':'Archiwizacja pozycji'}</summary><CatalogArchive key={`${item.id}:${item.version}`} item={item}/></details></main>;
}
