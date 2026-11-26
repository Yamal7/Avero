import { describe, expect, it } from 'vitest';
import {
  bankAccountSchema, companyProfileSaveSchema, documentFromCompanyProfile, emptyCompanyProfile, maskBankAccount,
  organizationsSchema, setActiveOrganizationSchema, activeOrganization, nextOrganizationIndex,
  staffOrganizations, organizationChanged, companyProfileSchema,
} from '@hvac/api-client';

const kranz = { id: '0a000000-0000-4000-8000-000000000001', name: 'Kranz HVACR', role: 'admin', active: true } as const;
const second = { id: '0a430000-0000-4000-8000-00000000000b', name: 'Chłodnictwo Bałtyk', role: 'office', active: false } as const;

describe('organizations', () => {
  it('parses the firm list from my_organizations()', () => {
    expect(organizationsSchema.parse([kranz, second])).toHaveLength(2);
    expect(organizationsSchema.parse([])).toEqual([]);
  });
  it('rejects unknown roles, extra keys and malformed ids', () => {
    expect(organizationsSchema.safeParse([{ ...kranz, role: 'owner' }]).success).toBe(false);
    expect(organizationsSchema.safeParse([{ ...kranz, secret: 1 }]).success).toBe(false);
    expect(organizationsSchema.safeParse([{ ...kranz, id: 'kranz' }]).success).toBe(false);
  });
  it('rejects more than one active firm', () => {
    expect(organizationsSchema.safeParse([kranz, { ...second, active: true }]).success).toBe(false);
  });
  it('validates the switch request strictly', () => {
    expect(setActiveOrganizationSchema.parse({ orgId: second.id })).toEqual({ orgId: second.id });
    expect(setActiveOrganizationSchema.safeParse({ orgId: 'x' }).success).toBe(false);
    expect(setActiveOrganizationSchema.safeParse({ orgId: second.id, role: 'admin' }).success).toBe(false);
    expect(setActiveOrganizationSchema.safeParse({}).success).toBe(false);
  });
  it('finds the active firm, falling back to the first one', () => {
    expect(activeOrganization([second, kranz])?.name).toBe('Kranz HVACR');
    expect(activeOrganization([{ ...second }, { ...kranz, active: false }])?.name).toBe('Chłodnictwo Bałtyk');
    expect(activeOrganization([])).toBeNull();
  });
  it('keeps only staff firms in the staff frame switcher (portal firms live in the portal)', () => {
    const portal = { id: '0a430000-0000-4000-8000-00000000000c', name: 'Hotel Bałtyk', role: 'client', active: false } as const;
    expect(staffOrganizations([kranz, second, portal]).map(o => o.name)).toEqual(['Kranz HVACR', 'Chłodnictwo Bałtyk']);
  });
  it('detects that another tab switched the active firm', () => {
    expect(organizationChanged(kranz.id, [kranz, second])).toBe(false);
    expect(organizationChanged(kranz.id, [{ ...kranz, active: false }, { ...second, active: true }])).toBe(true);
    expect(organizationChanged(kranz.id, [])).toBe(false);
  });
  it('moves the menu highlight with wrap-around (J/K, strzałki, Home/End)', () => {
    expect(nextOrganizationIndex(0, 3, 'next')).toBe(1);
    expect(nextOrganizationIndex(2, 3, 'next')).toBe(0);
    expect(nextOrganizationIndex(0, 3, 'prev')).toBe(2);
    expect(nextOrganizationIndex(1, 3, 'first')).toBe(0);
    expect(nextOrganizationIndex(1, 3, 'last')).toBe(2);
    expect(nextOrganizationIndex(0, 0, 'next')).toBe(-1);
  });
});

describe('bank account', () => {
  it.each(['', 'PL61 1090 1014 0000 0712 1981 2874', 'PL61109010140000071219812874', '61 1090 1014 0000 0712 1981 2874', 'DE89 3704 0044 0532 0130 00'])('accepts %j', value => {
    expect(bankAccountSchema.safeParse(value).success).toBe(true);
  });
  it.each(['PL62 1090 1014 0000 0712 1981 2874', '1234', 'PL61 1090 1014 0000 0712 1981 287X', 'PL61\u00001090', 'x'.repeat(43)])('rejects %j', value => {
    expect(bankAccountSchema.safeParse(value).success).toBe(false);
  });
  it('reads the masked account sent to the office but never saves it', () => {
    const data = { ...emptyCompanyProfile(), companyName: 'Kranz HVACR', companyAddress: 'Polna 1, 84-230 Rumia', bankAccount: '•••• 2874' };
    expect(companyProfileSchema.safeParse({ version: 1, data }).success).toBe(true);
    expect(companyProfileSaveSchema.safeParse({ version: 1, data }).success).toBe(false);
    expect(maskBankAccount('•••• 2874')).toBe('•••• 2874');
  });
  it('masks all but the last four digits', () => {
    expect(maskBankAccount('PL61 1090 1014 0000 0712 1981 2874')).toBe('•••• 2874');
    expect(maskBankAccount('')).toBe('');
    expect(maskBankAccount(undefined)).toBe('');
  });
  it('is optional in the company profile and never copied into an offer document', () => {
    const data = { ...emptyCompanyProfile(), companyName: 'Kranz HVACR', companyAddress: 'Polna 1, 84-230 Rumia' };
    expect(companyProfileSaveSchema.safeParse({ version: null, data }).success).toBe(true);
    const withAccount = { ...data, bankAccount: 'PL61 1090 1014 0000 0712 1981 2874' };
    expect(companyProfileSaveSchema.safeParse({ version: null, data: withAccount }).success).toBe(true);
    expect(companyProfileSaveSchema.safeParse({ version: null, data: { ...data, bankAccount: 'PL00 0000' } }).success).toBe(false);
    expect(documentFromCompanyProfile({ version: 0, data: withAccount }, '2026-11-23')).not.toHaveProperty('bankAccount');
  });
});
