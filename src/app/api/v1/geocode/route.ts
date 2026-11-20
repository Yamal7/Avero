import { z } from 'zod';
import { companyProfileSchema } from '@hvac/api-client';
import { ApiFault,authenticate,databaseError,endpoint,json,preflight } from '@/lib/api/http';
/* Looks up a few missing addresses in OpenStreetMap Nominatim (max 1 request per second, per its usage policy) and caches
   the result. Only street addresses are sent; no names, phones or other customer data. */
const UA='Avero-CRM/0.1 (self-hosted field service app)';
const hit=z.array(z.object({lat:z.string(),lon:z.string()}).passthrough()).max(1);
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function lookupOne(query:string){const url=`https://nominatim.openstreetmap.org/search?${new URLSearchParams({format:'jsonv2',limit:'1',countrycodes:'pl',q:query})}`;const r=await fetch(url,{headers:{'User-Agent':UA,'Accept-Language':'pl'},cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error(`Nominatim ${r.status}`);const rows=hit.parse(await r.json());return rows[0]?{lat:Number(rows[0].lat),lng:Number(rows[0].lon)}:null;}
const street=(a:string)=>a.replace(/^\s*(ul\.?|ulica)\s+/i,'').replace(/\s+(lok\.?|m\.)\s*\S+$/i,'').trim();
/** Tries a few query variants, one request per second. */
async function lookup(parts:{address:string;postalCode:string;city:string}|{query:string}){const variants=('query' in parts)?[...new Set([street(parts.query),street(parts.query).replace(/\b\d{2}-\d{3}\s*/,'').replace(/\s+,/,',').trim()])]:[...new Set([`${street(parts.address)}, ${parts.city}`,`${street(parts.address)}, ${parts.postalCode} ${parts.city}`.replace(/\s+,/,','),parts.city])];for(const [i,q] of variants.entries()){if(i)await sleep(1100);const hit=await lookupOne(q);if(hit)return {hit,exact:('query' in parts)||i<2};}return {hit:null,exact:false};}
export function POST(request:Request){return endpoint(request,async()=>{const {db,role}=await authenticate(request);if(!['admin','office'].includes(role))throw new ApiFault(403,'ACCESS_DENIED','Geokodowanie uruchamia biuro.');
 const pending=await db.rpc('geocode_pending',{p_limit:3});databaseError(pending.error);
 const items:({key:string}&({address:string;postalCode:string;city:string}|{query:string}))[]=z.array(z.object({key:z.string(),address:z.string(),postalCode:z.string(),city:z.string()})).parse(pending.data);
 const profile=await db.rpc('company_profile');const base=companyProfileSchema.nullable().safeParse(profile.data);
 const baseAddress=base.success&&base.data?base.data.data.companyAddress.trim():'';
 if(baseAddress){const key=baseAddress.replace(/\s+/g,' ').toLowerCase(),known=await db.rpc('geocode_lookup',{p_keys:[key]});if(!known.error&&!Object.keys(known.data as object).length)items.unshift({key,query:baseAddress});}
 let done=0;
 for(const [i,item] of items.slice(0,3).entries()){if(i)await sleep(1100);let at:{lat:number;lng:number}|null=null;try{const r=await lookup(item);at=r.exact?r.hit:null;}catch{break;}const r=await db.rpc('save_geocode',{p_key:item.key,p_lat:at?.lat??null,p_lng:at?.lng??null});databaseError(r.error);done++;}
 return json(request,z.object({done:z.number(),remaining:z.boolean()}),{done,remaining:items.length>done});
});}
export function OPTIONS(request:Request){return preflight(request,['POST']);}
