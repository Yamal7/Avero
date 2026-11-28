/* Czyszczenie zdarzeń Sentry z danych osobowych (KRA-73 M0.7).
   Zasada: lista dozwolonych zamiast listy zakazanych tam, gdzie się da (parametry URL, nagłówki).
   Do Sentry nie trafiają: maile, telefony, numery kont, ciasteczka, nagłówki z IP i autoryzacją, treść żądań,
   wartości parametrów spoza listy, fragmenty URL (#access_token), ślady konsoli ani dane użytkownika poza identyfikatorem.
   Nazw firm i osób w komunikatach błędów regex nie wyłapie — własne captureException wysyłają tylko kody błędów.
   Moduł bez zależności od SDK w czasie działania — testowalny w Vitest. */
import type { Breadcrumb, Event } from '@sentry/nextjs';

// Ograniczone kwantyfikatory i długość wejścia — bez kwadratowego czasu na długich ciągach (base64, JWT).
const MAX_TEXT = 8192;
const EMAIL = /[A-Z0-9._%+-]{1,64}@[A-Z0-9-]{1,63}(?:\.[A-Z0-9-]{1,63}){0,8}\.[A-Z]{2,24}/gi;
// IBAN (PL, AT, …) i polski numer konta 26 cyfr, także w grupach po 4.
const IBAN = /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,4})?\b/g;
const PL_ACCOUNT = /\b\d{2}(?:\s?\d{4}){6}\b/g;
// Telefony: z prefiksem kraju (+48, 0043), grupy 3-3-3 (601 234 567) albo numer z zerem i separatorem (0664 1234567).
// Ciągi cyfr bez separatorów (znaczniki czasu, numery zleceń) zostają.
const PHONE = [
  /(?<![\w+])(?:\+|00)\d{2}[\s-]?\d{1,4}(?:[\s-]?\d{2,4}){2,4}(?![\w-])/g,
  /(?<![\w-])\d{3}[\s-]\d{3}[\s-]\d{3}(?![\w-])/g,
  /(?<![\w-])0\d{2,4}[\s/-]\d{5,8}(?![\w-])/g,
];
// Parametry URL, których wartości zostają (sterowanie widokiem). Pozostałe wartości → [usunięto].
const SAFE_PARAM = /^(tab|view|sort|order|dir|page|limit|offset|lang|status|group|theme|id|module|round|variant)$/i;
// Nagłówki, które zostają; referer przechodzi przez scrubUrl.
const SAFE_HEADER = /^(user-agent|accept|accept-language|accept-encoding|content-type|content-length|host|referer|sec-fetch-[a-z-]+|sec-ch-ua(-[a-z-]+)?)$/i;
// Klucze w extra/contexts/tags/data, których wartości zawsze usuwamy.
const SENSITIVE_KEY = /(token|secret|password|haslo|hasło|authorization|cookie|apikey|api_key|signature|email|e-mail|phone|telefon|tel|nip|pesel|iban|account|konto|address|adres|ip_address|ip)$/i;
const URL_KEY = /(url|href|referer|referrer|^to$|^from$)/i;

export const REDACTED = '[usunięto]';

export function scrubText(value: string): string {
  let out = value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT)}…` : value;
  out = out.replace(EMAIL, '[email]').replace(IBAN, '[konto]').replace(PL_ACCOUNT, '[konto]');
  for (const pattern of PHONE) out = out.replace(pattern, '[telefon]');
  return out;
}

/** URL bez fragmentu (#…), z wartościami parametrów tylko z listy dozwolonych. Działa też na „GET https://…”. */
export function scrubUrl(value: string): string {
  const withoutHash = value.split('#', 1)[0];
  const queryStart = withoutHash.indexOf('?');
  if (queryStart < 0) return scrubText(withoutHash);
  const base = withoutHash.slice(0, queryStart);
  return `${scrubText(base)}?${scrubSearch(withoutHash.slice(queryStart + 1))}`;
}

function scrubSearch(search: string): string {
  return search.split('&').filter(Boolean).map(pair => {
    const eq = pair.indexOf('=');
    const name = eq < 0 ? pair : pair.slice(0, eq);
    if (eq < 0) return scrubText(name);
    return SAFE_PARAM.test(decodeSafe(name)) ? scrubText(pair) : `${name}=${REDACTED}`;
  }).join('&');
}

function decodeSafe(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

/** Rekurencyjnie czyści dowolne dane (extra, contexts, tags, data spanów i śladów). */
export function scrubDeep(value: unknown, key = '', depth = 0): unknown {
  if (key && SENSITIVE_KEY.test(key)) return REDACTED;
  if (typeof value === 'string') return URL_KEY.test(key) ? scrubUrl(value) : scrubText(value);
  if (value === null || typeof value !== 'object') return value;
  if (depth >= 6) return '[za głęboko]';
  if (Array.isArray(value)) return value.map(item => scrubDeep(item, '', depth + 1));
  return Object.fromEntries(Object.entries(value).map(([name, inner]) => [name, scrubDeep(inner, name, depth + 1)]));
}

function scrubQuery(query: unknown): unknown {
  if (typeof query === 'string') return scrubSearch(query.replace(/^\?/, ''));
  if (Array.isArray(query)) return query.map(entry => Array.isArray(entry) && entry.length === 2 ? [entry[0], SAFE_PARAM.test(String(entry[0])) ? scrubText(String(entry[1])) : REDACTED] : REDACTED);
  if (query && typeof query === 'object') {
    return Object.fromEntries(Object.entries(query).map(([name, value]) => [name, SAFE_PARAM.test(name) ? scrubText(String(value)) : REDACTED]));
  }
  return query;
}

type Span = { description?: string; data?: Record<string, unknown> };

export function scrubEvent<T extends Event>(event: T): T {
  if (event.message) event.message = scrubText(event.message);
  if (event.logentry) {
    if (event.logentry.message) event.logentry.message = scrubText(event.logentry.message);
    if (event.logentry.params) event.logentry.params = scrubDeep(event.logentry.params) as unknown[];
  }
  if (event.transaction) event.transaction = scrubUrl(event.transaction);
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = scrubText(exception.value);
    if (exception.type) exception.type = scrubText(exception.type);
    for (const frame of exception.stacktrace?.frames ?? []) delete frame.vars;
  }
  if (event.request) {
    const request = event.request;
    if (request.url) request.url = scrubUrl(request.url);
    if (request.query_string !== undefined) request.query_string = scrubQuery(request.query_string) as typeof request.query_string;
    delete request.data;
    delete request.cookies;
    delete request.env;
    if (request.headers) {
      request.headers = Object.fromEntries(Object.entries(request.headers)
        .filter(([name]) => SAFE_HEADER.test(name))
        .map(([name, value]) => [name, /^referer$/i.test(name) ? scrubUrl(String(value)) : scrubText(String(value))]));
    }
  }
  if (event.extra) event.extra = scrubDeep(event.extra) as T['extra'];
  if (event.contexts) event.contexts = scrubDeep(event.contexts) as T['contexts'];
  if (event.tags) event.tags = scrubDeep(event.tags) as T['tags'];
  for (const span of (event.spans ?? []) as Span[]) {
    if (span.description) span.description = scrubUrl(span.description);
    if (span.data) span.data = scrubDeep(span.data) as Record<string, unknown>;
  }
  // Tylko identyfikator konta — bez maila, nazwy i adresu IP.
  if (event.user) event.user = event.user.id ? { id: event.user.id } : {};
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb).filter((crumb): crumb is Breadcrumb => crumb !== null);
  return event;
}

/** Ślady konsoli odrzucamy w całości (console.log(klient) niósłby dane); pozostałe czyścimy. */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console') return null;
  if (breadcrumb.message) breadcrumb.message = scrubText(breadcrumb.message);
  if (breadcrumb.data) breadcrumb.data = scrubDeep(breadcrumb.data) as Record<string, unknown>;
  return breadcrumb;
}
