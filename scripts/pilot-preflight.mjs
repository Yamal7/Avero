import { pathToFileURL } from 'node:url';

const placeholder = value => !value || /replace|your-|\.example(?:[/:]|$)|changeme/i.test(value);
function origin(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      url.pathname === '/' && !url.search && !url.hash &&
      !['localhost', '[::1]', '0.0.0.0'].includes(url.hostname) &&
      !/^127\./.test(url.hostname) && !placeholder(value);
  } catch { return false; }
}
function keyRole(key) {
  if (key?.startsWith('sb_publishable_') && key.length > 25) return 'anon';
  if (key?.startsWith('sb_secret_') && key.length > 25) return 'service_role';
  try { return JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; }
  catch { return null; }
}
const address = value => typeof value === 'string' && value.length <= 200 && /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(value) && !placeholder(value);

// Configuration checks only: no network, authentication, migrations or mail sends.
export function checkPilot(env) {
  const errors = [], warnings = [];
  if (!origin(env.APP_URL)) errors.push('APP_URL: wymagany docelowy adres HTTPS bez ścieżki i danych logowania.');
  if (!origin(env.NEXT_PUBLIC_SUPABASE_URL)) errors.push('NEXT_PUBLIC_SUPABASE_URL: wymagany docelowy adres HTTPS.');
  if (placeholder(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || keyRole(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) !== 'anon') errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY: wymagany klucz publishable lub anon; klucz serwerowy jest zabroniony.');
  if (Object.keys(env).some(name => name.startsWith('NEXT_PUBLIC_') && /SECRET|SERVICE_ROLE|RESEND|WORKER/.test(name))) errors.push('Sekret serwerowy nie może mieć prefiksu NEXT_PUBLIC_.');
  if ((env.NATIVE_ALLOWED_ORIGINS || '').trim()) errors.push('NATIVE_ALLOWED_ORIGINS: pozostaw puste na tym etapie pilotażu web.');
  const mode = env.NOTIFICATION_MAIL_MODE;
  if (!['disabled', 'resend'].includes(mode)) errors.push('NOTIFICATION_MAIL_MODE: wybierz disabled albo resend; lokalny catcher nie jest transportem pilotażu.');
  if (mode === 'disabled') warnings.push('Poczta przypomnień wyłączona. Zaproszenia Auth wymagają osobnej konfiguracji.');
  if (mode === 'resend') {
    if (!address(env.NOTIFICATION_MAIL_FROM)) errors.push('NOTIFICATION_MAIL_FROM: wymagany adres nadawcy.');
    const recipients = (env.NOTIFICATION_MAIL_RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!recipients.length || recipients.length > 100 || !recipients.every(address)) errors.push('NOTIFICATION_MAIL_RECIPIENTS: wymagana jawna lista 1–100 poprawnych adresów.');
    const workerSecrets = [env.NOTIFICATION_WORKER_SECRET, env.CRON_SECRET].filter(Boolean);
    if (!workerSecrets.some(secret => secret.length >= 32 && !placeholder(secret))) errors.push('NOTIFICATION_WORKER_SECRET lub CRON_SECRET: wymagany osobny losowy sekret co najmniej 32 znaków.');
    if (placeholder(env.SUPABASE_SERVICE_ROLE_KEY) || keyRole(env.SUPABASE_SERVICE_ROLE_KEY) !== 'service_role') errors.push('SUPABASE_SERVICE_ROLE_KEY: wymagany klucz serwerowy w sekrecie hostingu.');
    if (placeholder(env.RESEND_API_KEY)) errors.push('RESEND_API_KEY: wymagany sekret dostawcy poczty.');
    warnings.push('Sprawdź domenę nadawcy, zgodność kluczy z projektem oraz działanie harmonogramu. Walidator nie łączy się z dostawcą.');
  }
  warnings.push('Wynik nie potwierdza HTTPS/DNS w sieci, dostępu do bazy, kopii plików ani gotowości produkcyjnej.');
  return { errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = checkPilot(process.env);
  for (const error of result.errors) console.error('BŁĄD: ' + error);
  for (const warning of result.warnings) console.log('UWAGA: ' + warning);
  console.log(result.errors.length ? 'Konfiguracja wymaga uzupełnienia.' : 'Konfiguracja przeszła sprawdzenia statyczne.');
  process.exitCode = result.errors.length ? 1 : 0;
}
