import { z } from 'zod';
/* M0.4 Silnik widoku kolekcji (KRA-31): wartości parametrów list przyjmowane przez funkcje RPC
   (customer_directory, people_directory, stock_item_list, maintenance_schedule) i schematy parametrów wywołań.
   Konfiguracje kolekcji w src/lib/collection/specs.ts korzystają tylko z tych wartości (test tests/collection.test.ts). */
export const customerDirectorySorts=['name','last_contact','devices','revenue'] as const;
export const customerDirectoryGroups=['none','category','city'] as const;
export const customerDirectoryViews=['all','no_contact_30'] as const;
export const peopleDirectorySorts=['name','last_contact'] as const;
export const peopleDirectoryViews=['all','decision','individual','no_contact_30'] as const;
export const stockListViews=['all','refrigerant','below'] as const;
export const stockListSorts=['code','name','available','last_move'] as const;
export const stockListGroups=['category','none'] as const;
export const stockListCategories=['refrigerant','parts','materials','other'] as const;

const page=z.number().int().min(1).max(100000);
const search=z.string().max(200).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
const category=z.string().trim().min(1).max(40).refine(v=>!/[\u0000-\u001f\u007f]/.test(v));
export const customerDirectoryParamsSchema=z.object({p_search:search,p_archived:z.boolean(),p_kind:z.enum(['company','individual']),p_page:page,p_categories:z.array(category).max(20),p_mode:z.enum(['any','all','none']),p_view:z.enum(customerDirectoryViews),p_sort:z.enum(customerDirectorySorts),p_group:z.enum(customerDirectoryGroups)}).strict();
export const peopleDirectoryParamsSchema=z.object({p_search:search,p_view:z.enum(peopleDirectoryViews),p_page:page,p_sort:z.enum(peopleDirectorySorts)}).strict();
export const stockItemListParamsSchema=z.object({p_view:z.enum(stockListViews),p_search:search,p_categories:z.array(z.enum(stockListCategories)).max(4),p_sort:z.enum(stockListSorts),p_group:z.enum(stockListGroups),p_page:page}).strict();
export const maintenanceScheduleParamsSchema=z.object({p_search:search,p_view:z.enum(['attention','overdue','upcoming','all','paused']),p_page:page,p_installation:z.string().uuid().nullable(),p_sort:z.enum(['due','customer','title'])}).strict();
