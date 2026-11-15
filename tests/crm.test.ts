import { describe, expect, it } from 'vitest';
import { crmSchemas, formValues } from '../src/lib/validation/crm';

describe('CRM validation', () => {
  it('normalizes empty optional fields and trims names before validation', () => {
    const form = new FormData();
    Object.entries({ name: '  Firma  ', type: 'company', email: '', phone: '  ' }).forEach(([k,v]) => form.set(k,v));
    expect(crmSchemas.customers.parse(formValues(form))).toEqual({ name: 'Firma', type: 'company', email: null, phone: null });
  });
  it('rejects blank addresses and impossible calendar dates', () => {
    expect(crmSchemas.locations.safeParse({ address: ' ', city: 'Warszawa', postal_code: null }).success).toBe(false);
    expect(crmSchemas.installations.safeParse({ type: 'Pompa', installed_on: '2026-02-30', status: 'active' }).success).toBe(false);
  });
  it('rejects unknown states and validates required manufacturer', () => {
    expect(crmSchemas.installations.safeParse({ type: 'Pompa', installed_on: null, status: 'deleted' }).success).toBe(false);
    expect(crmSchemas.devices.safeParse({ manufacturer: '', model: null, serial_number: null, warranty_until: null }).success).toBe(false);
  });
});
