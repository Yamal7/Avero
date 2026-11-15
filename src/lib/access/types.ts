import { z } from 'zod';
import { roleSchema } from '@hvac/api-client';
export { roleSchema };
export type AccessRole = z.infer<typeof roleSchema>;
export const roleLabels: Record<AccessRole, string> = { admin: 'Administrator', office: 'Biuro', technician: 'Technik', client: 'Klient' };
export const invitationSchema = z.object({ email: z.string().trim().email().max(320).transform(value => value.toLowerCase()), role: roleSchema, customerId: z.string().uuid().nullable() }).superRefine((value, context) => {
  if (value.role === 'client' && !value.customerId) context.addIssue({ code: 'custom', message: 'Wybierz klienta, do którego konto otrzyma dostęp.' });
  if (['admin', 'office'].includes(value.role) && value.customerId) context.addIssue({ code: 'custom', message: 'Ta rola nie wymaga przypisania klienta.' });
});
export type CustomerOption = { id: string; name: string };
export type AccessUser = { id: string; email: string; role: AccessRole; blocked: boolean; email_confirmed_at: string | null; customers: (CustomerOption & { kind: 'member' | 'technician' })[] };
export type Invitation = { id: string; email: string; role: AccessRole; status: 'pending' | 'accepted' | 'revoked'; delivery_status: 'prepared' | 'sending' | 'sent' | 'failed'; expires_at: string; customer_name: string | null };
export type AccessLog = { id: number; actor_email: string | null; target_email: string | null; action: string; happened_at: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null };
export type AccessActionResult = { error?: string; success?: string };
