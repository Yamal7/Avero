import { z } from 'zod';
/** M0.1: firmy (organizacje) zalogowanej osoby — wynik RPC my_organizations(). Rola `client` = klient portalu tej firmy. */
export const organizationRoleSchema=z.enum(['admin','office','technician','client']);
export const organizationSchema=z.object({id:z.string().uuid(),name:z.string().min(1).max(160),role:organizationRoleSchema,active:z.boolean()}).strict();
export const organizationsSchema=z.array(organizationSchema).max(100).refine(list=>list.filter(o=>o.active).length<=1,'Tylko jedna aktywna firma.');
export const setActiveOrganizationSchema=z.object({orgId:z.string().uuid()}).strict();
export type Organization=z.infer<typeof organizationSchema>;
export type OrganizationRole=z.infer<typeof organizationRoleSchema>;
/** Aktywna firma; gdy żadna nie jest oznaczona (np. świeże członkostwo), pierwsza z listy — tak samo wybiera current_org_id(). */
export function activeOrganization(list:readonly Organization[]):Organization|null{return list.find(o=>o.active)??list[0]??null;}
/** Ruch zaznaczenia w menu firm (J/K, strzałki, Home/End) z zawijaniem; -1 dla pustej listy. */
export function nextOrganizationIndex(current:number,count:number,move:'next'|'prev'|'first'|'last'):number{
 if(count<=0)return -1;
 if(move==='first')return 0;
 if(move==='last')return count-1;
 const from=current<0||current>=count?(move==='next'?-1:0):current;
 return (from+(move==='next'?1:-1)+count)%count;
}
/** Firmy do przełącznika w ramie pracownika: bez firm, w których osoba jest tylko klientem portalu (te obsługuje portal). */
export function staffOrganizations(list:readonly Organization[]):Organization[]{return list.filter(o=>o.role!=='client');}
/** Czy aktywna firma różni się od tej, z którą strona była renderowana (np. przełączono ją w innej karcie). */
export function organizationChanged(renderedId:string|null|undefined,list:readonly Organization[]):boolean{const now=activeOrganization(list)?.id;return Boolean(now&&renderedId&&now!==renderedId);}
