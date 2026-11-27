'use client';
import { useOrganizationFetch } from '@/components/organization-context';
import Link from 'next/link';
import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiErrorSchema,catalogCategories,catalogUnits,catalogSaveSchema,catalogSavedSchema,catalogGrossCents,catalogMargin,decimalToHundredths,hundredthsToDecimal,type CatalogItem,type CatalogSave } from '@hvac/api-client';
import { catalogMoney,catalogPercent } from '@/lib/catalog/format';
export async function persistCatalogItem(input:CatalogSave, organizationFetch: typeof fetch = fetch){
 const parsed=catalogSaveSchema.safeParse(input);if(!parsed.success)throw new Error('Sprawdź kod, nazwę, kategorię, jednostkę, ceny i stawkę VAT.');
 const response=await organizationFetch('/api/v1/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed.data),credentials:'same-origin',cache:'no-store',redirect:'error'}),data=await response.json().catch(()=>null);
 if(!response.ok){const parsed=apiErrorSchema.safeParse(data);throw new Error(parsed.success?parsed.data.error.message:'Nie udało się zapisać pozycji.');}
 if(!catalogSavedSchema.safeParse(data).success)throw new Error('Nie udało się potwierdzić zapisu. Odśwież katalog przed ponowieniem.');
}
export function CatalogForm({record}:{record?:CatalogItem}){
  const organizationFetch = useOrganizationFetch();
 const router=useRouter(),requestId=useRef<string|null>(null),busy=useRef(false);
 const [pending,setPending]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(''),[category,setCategory]=useState<CatalogSave['category']>(record?.category||'device'),[unit,setUnit]=useState<CatalogSave['unit']>(record?.unit||'piece'),[cost,setCost]=useState(record?hundredthsToDecimal(record.costCents):''),[sale,setSale]=useState(record?hundredthsToDecimal(record.saleCents):''),[vat,setVat]=useState(hundredthsToDecimal(record?.vatBasisPoints??2300));
 let preview:{cost:number;sale:number;vat:number}|null=null;
 try{preview={cost:decimalToHundredths(cost),sale:decimalToHundredths(sale),vat:decimalToHundredths(vat,10000)};}catch{}
 const margin=preview?catalogMargin(preview.cost,preview.sale):null;
 return <form className="catalog-form" onSubmit={async event=>{
  event.preventDefault();if(busy.current)return;const data=new FormData(event.currentTarget);setError('');setSuccess('');
  try{
   requestId.current??=crypto.randomUUID();
   const parsed=catalogSaveSchema.safeParse({id:record?.id||requestId.current,version:record?.version??null,code:String(data.get('code')||''),name:String(data.get('name')||''),category,unit,costCents:decimalToHundredths(cost),saleCents:decimalToHundredths(sale),vatBasisPoints:decimalToHundredths(vat,10000),manufacturer:String(data.get('manufacturer')||''),model:String(data.get('model')||''),supplier:String(data.get('supplier')||''),description:String(data.get('description')||''),archived:record?.archived??false});
   if(!parsed.success)throw new Error('Uzupełnij kod i nazwę. Sprawdź limity pól, ceny oraz stawkę VAT (0–100%).');
   busy.current=true;setPending(true);await persistCatalogItem(parsed.data, organizationFetch);
   if(!record)router.replace(`/dashboard/catalog/${parsed.data.id}?created=1`);else{setSuccess('Zmiany zapisano.');router.replace(`/dashboard/catalog/${record.id}?saved=1`);router.refresh();}
  }catch(error){setError(error instanceof Error?error.message:'Nie udało się zapisać pozycji.');}finally{busy.current=false;setPending(false);}
 }}>
 <fieldset className="import-fieldset" disabled={pending||record?.archived}>
 <section className="card"><h2>Informacje o pozycji</h2><div className="fields"><label>Nazwa *<input name="name" required maxLength={160} defaultValue={record?.name} placeholder="Np. Montaż klimatyzatora split"/></label><label>Kod katalogowy *<input name="code" required maxLength={64} defaultValue={record?.code} placeholder="Np. USL-001" autoCapitalize="characters"/><span className="muted">Unikalny kod, również względem archiwum.</span></label><label>Kategoria<select value={category} onChange={event=>{const value=event.target.value as CatalogSave['category'];setCategory(value);if(!record)setUnit(value==='service'?'hour':value==='travel'?'kilometer':'piece');}}>{Object.entries(catalogCategories).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Jednostka rozliczeniowa<select value={unit} onChange={event=>setUnit(event.target.value as CatalogSave['unit'])}>{Object.entries(catalogUnits).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div></section>
 <section className="card"><h2>Ceny i kalkulacja</h2><p className="muted">Kwoty za jedną jednostkę, w PLN. Marża jest liczona od ceny sprzedaży netto.</p><div className="fields"><label>Koszt zakupu / wykonania netto *<input name="cost" inputMode="decimal" required maxLength={10} value={cost} onChange={event=>setCost(event.target.value)} placeholder="0,00"/></label><label>Cena sprzedaży netto *<input name="sale" inputMode="decimal" required maxLength={10} value={sale} onChange={event=>setSale(event.target.value)} placeholder="0,00"/></label><label>Stawka VAT (%) *<input name="vat" inputMode="decimal" required maxLength={6} value={vat} onChange={event=>setVat(event.target.value)}/></label></div><div className="catalog-price-preview"><div><span>Sprzedaż brutto</span><strong>{preview?catalogMoney(catalogGrossCents(preview.sale,preview.vat)):'—'}</strong></div><div><span>Różnica netto / jednostkę</span><strong>{preview?catalogMoney(preview.sale-preview.cost):'—'}</strong></div><div><span>Marża</span><strong className={margin!==null&&margin<0?'error':''}>{margin!==null?catalogPercent(margin):'—'}</strong></div></div>{margin!==null&&margin<0&&<p className="error">Cena sprzedaży jest niższa od kosztu. Możesz zapisać pozycję z ujemną marżą.</p>}{preview?.sale===0&&<p className="muted">Przy cenie sprzedaży 0 zł marża procentowa nie jest określona.</p>}</section>
 <section className="card"><h2>Dodatkowe informacje</h2><div className="fields"><label>Producent<input name="manufacturer" maxLength={100} defaultValue={record?.manufacturer}/></label><label>Model / numer producenta<input name="model" maxLength={100} defaultValue={record?.model}/></label><label>Dostawca<input name="supplier" maxLength={160} defaultValue={record?.supplier}/></label></div><label>Opis / zakres prac<textarea name="description" rows={4} maxLength={2000} defaultValue={record?.description} placeholder="Parametry, zakres usługi lub uwagi do pozycji"/></label><p className="muted">Pola są opcjonalne. Dane katalogu są obecnie wewnętrzne dla firmy.</p></section>
 </fieldset>
 {error&&<p className="error" role="alert">{error}</p>}{success&&<p className="success" role="status">{success}</p>}
 <div className="button-group">{!record?.archived&&<button disabled={pending}>{pending?'Zapisywanie…':record?'Zapisz zmiany':'Dodaj pozycję'}</button>}<Link className="button secondary" href="/dashboard/catalog">Wróć do katalogu</Link></div></form>;
}
export function CatalogArchive({item}:{item:CatalogItem}){
  const organizationFetch = useOrganizationFetch();
 const router=useRouter(),[pending,setPending]=useState(false),[error,setError]=useState('');
 return <form className="catalog-archive" onSubmit={async event=>{event.preventDefault();if(pending)return;setPending(true);setError('');try{const {createdAt: _createdAt,updatedAt: _updatedAt,...fields}=item;void _createdAt;void _updatedAt;await persistCatalogItem({...fields,archived:!item.archived}, organizationFetch);router.refresh();}catch(error){setError(error instanceof Error?error.message:'Nie udało się zmienić stanu.');}finally{setPending(false);}}}><p className="muted">{item.archived?'Przywrócenie udostępni pozycję ponownie w aktywnym katalogu.':'Archiwizacja ukryje pozycję z aktywnego katalogu i zachowa jej dane.'}</p><label className="checkbox"><input type="checkbox" required disabled={pending}/>Potwierdzam {item.archived?'przywrócenie':'archiwizację'} pozycji.</label>{error&&<p className="error" role="alert">{error}</p>}<button type="submit" className="secondary" disabled={pending}>{pending?'Zapisywanie…':item.archived?'Przywróć pozycję':'Archiwizuj pozycję'}</button></form>;
}
