import { describe, expect, it } from 'vitest';
import { customerSchema } from '../src/lib/validation/customer';
describe('customer input', () => {
  it('accepts valid data', () => {
    expect(customerSchema.safeParse({ name: 'Jan Kowalski', type: 'individual' }).success).toBe(true);
  });
  it('rejects empty name and invalid type', () => {
    expect(customerSchema.safeParse({ name: ' ', type: 'admin' }).success).toBe(false);
  });
});
