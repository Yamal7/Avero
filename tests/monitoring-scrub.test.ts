import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ErrorEvent, Event } from '@sentry/nextjs';
import { REDACTED, scrubBreadcrumb, scrubDeep, scrubEvent, scrubText, scrubUrl } from '@/lib/monitoring/scrub';
import { sentryOptions } from '@/lib/monitoring/sentry-options';

describe('scrubText', () => {
  it('usuwa maile, telefony PL/AT i numery kont', () => {
    expect(scrubText('Klient jan.kowalski@firma.pl nie odebrał')).toBe('Klient [email] nie odebrał');
    expect(scrubText('tel. +48 601 234 567')).toBe('tel. [telefon]');
    expect(scrubText('tel. 601-234-567')).toBe('tel. [telefon]');
    expect(scrubText('Tel +43 664 1234567')).toBe('Tel [telefon]');
    expect(scrubText('Tel 0664 1234567')).toBe('Tel [telefon]');
    expect(scrubText('konto PL61 1090 1014 0000 0712 1981 2874')).toBe('konto [konto]');
    expect(scrubText('konto 61109010140000071219812874')).toBe('konto [konto]');
    expect(scrubText('IBAN AT61 1904 3002 3457 3201')).toBe('IBAN [konto]');
  });
  it('zostawia UUID, znaczniki czasu, numery dokumentów i kwoty', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(scrubText(`Zlecenie ${uuid}`)).toBe(`Zlecenie ${uuid}`);
    expect(scrubText('Oferta OF/2026/0042 na 12 500,00 zł')).toBe('Oferta OF/2026/0042 na 12 500,00 zł');
    expect(scrubText('czas 1732700000000, zlecenie 123456789')).toBe('czas 1732700000000, zlecenie 123456789');
  });
  it('obcina bardzo długie wejście i działa szybko', () => {
    const long = 'a'.repeat(100_000);
    const started = performance.now();
    const out = scrubText(long);
    expect(performance.now() - started).toBeLessThan(200);
    expect(out.length).toBeLessThan(9000);
  });
});

describe('scrubUrl', () => {
  it('zostawia tylko dozwolone parametry i usuwa fragment', () => {
    expect(scrubUrl('https://app.avero.pl/accept-invitation?token=abc123&lang=pl')).toBe(`https://app.avero.pl/accept-invitation?token=${REDACTED}&lang=pl`);
    expect(scrubUrl('/auth/callback?code=xyz#top')).toBe(`/auth/callback?code=${REDACTED}`);
    expect(scrubUrl('/dashboard/customers?q=Kowalski&tab=osoby')).toBe(`/dashboard/customers?q=${REDACTED}&tab=osoby`);
    expect(scrubUrl('/login#access_token=jwt&type=recovery')).toBe('/login');
    expect(scrubUrl('/a?tab=b?c=d')).toBe('/a?tab=b?c=d');
    expect(scrubUrl('GET https://x.supabase.co/rest/v1/rpc?email=ola@example.com')).toBe(`GET https://x.supabase.co/rest/v1/rpc?email=${REDACTED}`);
  });
});

describe('scrubDeep', () => {
  it('usuwa wrażliwe klucze, czyści teksty i adresy', () => {
    expect(scrubDeep({ customer: { email: 'a@b.pl', note: 'tel 601 234 567', nested: { nip: '1234567890' } }, url: '/x?token=1', count: 3 }))
      .toEqual({ customer: { email: REDACTED, note: 'tel [telefon]', nested: { nip: REDACTED } }, url: `/x?token=${REDACTED}`, count: 3 });
  });
});

describe('scrubEvent', () => {
  it('czyści komunikat, wyjątek, żądanie, użytkownika, extra, kontekst i ślady', () => {
    const event: ErrorEvent = {
      type: undefined,
      message: 'Nie wysłano do ola@example.com',
      exception: { values: [{ type: 'Error', value: 'Błąd dla +48 601 234 567', stacktrace: { frames: [{ function: 'f', vars: { haslo: 'x' } }] } }] },
      request: {
        url: 'https://app.avero.pl/portal?token=tajny',
        query_string: 'token=tajny&tab=oferty',
        data: { haslo: 'x' },
        cookies: { 'sb-access-token': 'x' },
        env: { REMOTE_ADDR: '1.2.3.4' },
        headers: { cookie: 'a=b', authorization: 'Bearer x', 'x-forwarded-for': '1.2.3.4', referer: 'https://app.avero.pl/a?q=Kowalski', 'user-agent': 'Safari' },
      },
      user: { id: 'u-1', email: 'ola@example.com', ip_address: '1.2.3.4', username: 'Ola' },
      extra: { klient: { email: 'ola@example.com', name: 'Ola z ola@example.com' } },
      contexts: { form: { phone: '601 234 567' } },
      tags: { search: 'ola@example.com' },
      breadcrumbs: [
        { message: 'klik ola@example.com', data: { url: '/x?email=ola@example.com' } },
        { category: 'console', message: 'Klient Jan Kowalski', data: { arguments: [{ name: 'Jan' }] } },
      ],
    };
    const out = scrubEvent(event);
    expect(out.message).toBe('Nie wysłano do [email]');
    expect(out.exception?.values?.[0].value).toBe('Błąd dla [telefon]');
    expect(out.exception?.values?.[0].stacktrace?.frames?.[0].vars).toBeUndefined();
    expect(out.request?.url).toBe(`https://app.avero.pl/portal?token=${REDACTED}`);
    expect(out.request?.query_string).toBe(`token=${REDACTED}&tab=oferty`);
    expect(out.request?.data).toBeUndefined();
    expect(out.request?.cookies).toBeUndefined();
    expect(out.request?.env).toBeUndefined();
    expect(out.request?.headers).toEqual({ referer: `https://app.avero.pl/a?q=${REDACTED}`, 'user-agent': 'Safari' });
    expect(out.user).toEqual({ id: 'u-1' });
    expect(out.extra).toEqual({ klient: { email: REDACTED, name: 'Ola z [email]' } });
    expect(out.contexts).toEqual({ form: { phone: REDACTED } });
    expect(out.tags).toEqual({ search: '[email]' });
    expect(out.breadcrumbs).toEqual([{ message: 'klik [email]', data: { url: `/x?email=${REDACTED}` } }]);
  });

  it('czyści spany transakcji', () => {
    const event: Event = { type: 'transaction', transaction: '/dashboard/customers', spans: [{ span_id: '1', trace_id: '2', start_timestamp: 0, status: 'ok', description: 'GET https://x.supabase.co/rpc?email=a@b.pl', data: { 'url.full': 'https://x.supabase.co/rpc?email=a@b.pl', 'http.query': 'email=a@b.pl' } }] };
    const span = scrubEvent(event).spans?.[0];
    expect(span?.description).toBe(`GET https://x.supabase.co/rpc?email=${REDACTED}`);
    expect(span?.data).toEqual({ 'url.full': `https://x.supabase.co/rpc?email=${REDACTED}`, 'http.query': 'email=[email]' });
  });

  it('odrzuca ślady konsoli, czyści ślady nawigacji', () => {
    expect(scrubBreadcrumb({ category: 'console', message: 'x' })).toBeNull();
    expect(scrubBreadcrumb({ category: 'navigation', data: { from: '/a?token=1', to: '/b' } })?.data).toEqual({ from: `/a?token=${REDACTED}`, to: '/b' });
  });
});

describe('sentryOptions', () => {
  afterEach(() => { vi.unstubAllEnvs(); });
  it('bez DSN Sentry jest wyłączone i nie zbiera danych osobowych', () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    const options = sentryOptions();
    expect(options.enabled).toBe(false);
    expect(options.sendDefaultPii).toBe(false);
  });
  it('z DSN jest włączone, a środowisko poza produkcją to development', () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://k@o1.ingest.de.sentry.io/1');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_ENVIRONMENT', '');
    vi.stubEnv('NODE_ENV', 'test');
    const options = sentryOptions();
    expect(options.enabled).toBe(true);
    expect(options.environment).toBe('development');
  });
});
