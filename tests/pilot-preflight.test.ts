import { describe, expect, it } from 'vitest';
// @ts-expect-error Standalone Node utility deliberately has no build dependencies.
import { checkPilot } from '../scripts/pilot-preflight.mjs';
const jwt = (role:string) => 'header.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.signature';
const valid = () => ({ APP_URL:'https://pilot.hvac.test',NEXT_PUBLIC_SUPABASE_URL:'https://project.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:jwt('anon'),NOTIFICATION_MAIL_MODE:'disabled' });
describe('pilot configuration gate', () => {
  it('accepts web configuration with explicit disabled mail',()=>expect(checkPilot(valid()).errors).toEqual([]));
  it.each(['http://localhost:3100','https://127.0.0.1','https://user:password@pilot.hvac.test','https://pilot.hvac.test/path','https://YOUR-PILOT-DOMAIN.example'])('rejects unsafe or placeholder app origin %s',APP_URL=>expect(checkPilot({...valid(),APP_URL}).errors.length).toBeGreaterThan(0));
  it('rejects privileged browser keys',()=>expect(checkPilot({...valid(),NEXT_PUBLIC_SUPABASE_ANON_KEY:jwt('service_role')}).errors.length).toBeGreaterThan(0));
  it('rejects browser-exposed secrets without printing their values',()=>{
    const result=checkPilot({...valid(),NEXT_PUBLIC_WORKER_SECRET:'DO_NOT_PRINT_ME'});
    expect(result.errors.length).toBeGreaterThan(0);expect(JSON.stringify(result)).not.toContain('DO_NOT_PRINT_ME');
  });
  it('rejects local mail and unconfigured real mail',()=>{
    expect(checkPilot({...valid(),NOTIFICATION_MAIL_MODE:'local'}).errors.length).toBeGreaterThan(0);
    expect(checkPilot({...valid(),NOTIFICATION_MAIL_MODE:'resend'}).errors.length).toBeGreaterThan(0);
  });
  it('accepts complete pilot mail while warning that delivery is not verified',()=>{
    const result=checkPilot({...valid(),NOTIFICATION_MAIL_MODE:'resend',NOTIFICATION_MAIL_FROM:'mail@hvac.test',NOTIFICATION_MAIL_RECIPIENTS:'pilot@hvac.test',NOTIFICATION_WORKER_SECRET:'x'.repeat(48),SUPABASE_SERVICE_ROLE_KEY:jwt('service_role'),RESEND_API_KEY:'re_test_secret'});
    expect(result.errors).toEqual([]);expect(result.warnings.length).toBeGreaterThan(0);
  });
});
