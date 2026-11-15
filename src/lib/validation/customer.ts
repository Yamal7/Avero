import { z } from 'zod';
export const customerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  type: z.enum(['individual', 'company']),
});
export type CustomerInput = z.infer<typeof customerSchema>;
