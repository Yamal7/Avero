import { z } from 'zod';
import { customerSchema } from './customer';

const optionalText = (max: number) => z.string().trim().max(max).nullable();
const date = z.string().date().nullable();
export const uuid = z.string().uuid();
export const crmSchemas = {
  customers: customerSchema,
  locations: z.object({ address: z.string().trim().min(1).max(300), city: z.string().trim().min(1).max(100), postal_code: optionalText(20) }),
  installations: z.object({ type: z.string().trim().min(1).max(100), installed_on: date, status: z.enum(['active', 'inactive', 'archived']) }),
  devices: z.object({ manufacturer: z.string().trim().min(1).max(100), model: optionalText(200), serial_number: optionalText(200), warranty_until: date }),
};
export const entitySchema = z.enum(['customers', 'locations', 'installations', 'devices']);
export type Entity = z.infer<typeof entitySchema>;
export type FormState = { error?: string; success?: string };

export function formValues(form: FormData) {
  return Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() || null : value]));
}
