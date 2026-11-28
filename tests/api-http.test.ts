import { beforeEach,afterEach,it,expect,vi } from 'vitest';
const mocks=vi.hoisted(()=>({cookie:vi.fn(),bearer:vi.fn(),getUser:vi.fn(),rpc:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({createClient:mocks.cookie}));
vi.mock('@supabase/supabase-js',()=>({createClient:mocks.bearer}));
import { authenticate,endpoint,preflight,readBody } from '@/lib/api/http';
const user={id:'a0000000-0000-4000-8000-000000000001',email:'test@hvac.local'};
const req=(method='GET',headers:Record<string,string>={})=>new Request('http://localhost:3100/api/v1/session',{method,headers});
const auth=(request:Request)=>endpoint(request,async()=>{const session=await authenticate(request);return Response.json({role:session.role});});
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('APP_URL','http://localhost:3100');vi.stubEnv('NATIVE_ALLOWED_ORIGINS','https://tauri.localhost');vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co');vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY','public-test-key');const db={auth:{getUser:mocks.getUser},rpc:mocks.rpc};mocks.cookie.mockResolvedValue(db);mocks.bearer.mockReturnValue(db);mocks.getUser.mockResolvedValue({data:{user},error:null});mocks.rpc.mockResolvedValue({data:{role:'client',blocked:false},error:null});});
afterEach(()=>vi.unstubAllEnvs());
it('verifies bearer identity and uses the same token for RLS, never cookie fallback',async()=>{
 expect((await auth(req('GET',{Authorization:'Bearer valid-token',Origin:'https://tauri.localhost'}))).status).toBe(200);
 expect(mocks.getUser).toHaveBeenCalledWith('valid-token');expect(mocks.cookie).not.toHaveBeenCalled();
 expect(mocks.bearer).toHaveBeenCalledWith(expect.any(String),'public-test-key',expect.objectContaining({global:{headers:{Authorization:'Bearer valid-token'}},auth:expect.objectContaining({persistSession:false})}));
});
it('rejects malformed Authorization without falling back to a cookie',async()=>{expect((await auth(req('GET',{Authorization:'Basic secret'}))).status).toBe(401);expect(mocks.cookie).not.toHaveBeenCalled();});
it('rejects expired bearer credentials',async()=>{mocks.getUser.mockResolvedValue({data:{user:null},error:{message:'expired'}});expect((await auth(req('GET',{Authorization:'Bearer expired'}))).status).toBe(401);expect(mocks.rpc).not.toHaveBeenCalled();});
it.each([{role:'admin',blocked:true},{role:'none',blocked:false},{role:'admin'},{role:'future',blocked:false}])('fails closed for invalid or blocked access %j',async data=>{mocks.rpc.mockResolvedValue({data,error:null});expect((await auth(req())).status).toBe(403);});
it('does not expose database errors when role lookup fails',async()=>{mocks.rpc.mockResolvedValue({data:null,error:{message:'secret database details'}});const result=await auth(req());expect(result.status).toBe(503);expect(await result.text()).not.toContain('secret');});
it('permits cookie writes only from the configured origin',async()=>{expect((await auth(req('POST'))).status).toBe(403);expect((await auth(req('POST',{Origin:'http://localhost:3100'}))).status).toBe(200);});
it('requires bearer for an allowed cross-origin app, even with existing cookies',async()=>{expect((await auth(req('GET',{Origin:'https://tauri.localhost'}))).status).toBe(401);expect(mocks.cookie).not.toHaveBeenCalled();});
it.each(['https://evil.example','null'])('denies untrusted Origin %s before authentication',async Origin=>{const result=await auth(req('GET',{Origin,Authorization:'Bearer token'}));expect(result.status).toBe(403);expect(result.headers.get('Access-Control-Allow-Origin')).toBeNull();expect(mocks.getUser).not.toHaveBeenCalled();});
it('preflight allows only registered methods/headers without cookie credentials',async()=>{const result=await preflight(req('OPTIONS',{Origin:'https://tauri.localhost','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type,x-hvac-client'}),['GET','POST']);expect(result.status).toBe(204);expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://tauri.localhost');expect(result.headers.has('Access-Control-Allow-Credentials')).toBe(false);expect(result.headers.get('Vary')).toBe('Origin');});
it('denies unsupported preflight methods and headers',async()=>{expect((await preflight(req('OPTIONS',{'Access-Control-Request-Method':'DELETE'}),['GET'])).status).toBe(405);expect((await preflight(req('OPTIONS',{'Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'x-untrusted'}),['GET'])).status).toBe(403);});
it('requires explicit deployment configuration',async()=>{vi.stubEnv('APP_URL','');expect((await auth(req())).status).toBe(503);expect(mocks.getUser).not.toHaveBeenCalled();});
it('validates JSON format and limits streamed bodies before parsing',async()=>{
 const read=(headers:Record<string,string>,body:string)=>{const r=new Request('http://localhost:3100',{method:'POST',headers,body});return endpoint(r,async()=>Response.json(await readBody(r)));};
 expect((await read({'Content-Type':'text/plain'},'{}')).status).toBe(415);expect((await read({'Content-Type':'application/json'},'{')).status).toBe(400);expect((await read({'Content-Type':'application/json'},'x'.repeat(65537))).status).toBe(413);
 expect(await (await read({'Content-Type':'application/json'},'{"ok":true}')).json()).toEqual({ok:true});
});

it('passes the rendered organization to PostgREST with a cookie or Bearer session', async () => {
  const organization = 'a0000000-0000-4000-8000-000000000002';
  const headers = { 'x-avero-organization': organization };
  expect((await auth(req('POST', { ...headers, Origin: 'http://localhost:3100' }))).status).toBe(200);
  expect(mocks.cookie).toHaveBeenCalledWith(organization);

  expect((await auth(req('GET', { ...headers, Authorization: 'Bearer valid-token' }))).status).toBe(200);
  expect(mocks.bearer).toHaveBeenCalledWith(expect.any(String), 'public-test-key', expect.objectContaining({
    global: { headers: { Authorization: 'Bearer valid-token', ...headers } },
  }));
});

it('rejects an invalid or stale organization scope before handling a write', async () => {
  const origin = 'http://localhost:3100';
  expect((await auth(req('POST', { Origin: origin, 'x-avero-organization': 'invalid' }))).status).toBe(400);
  expect(mocks.cookie).not.toHaveBeenCalled();

  mocks.rpc.mockResolvedValue({ data: null, error: { code: 'PT409' } });
  const result = await auth(req('POST', {
    Origin: origin,
    'x-avero-organization': 'a0000000-0000-4000-8000-000000000002',
  }));
  expect(result.status).toBe(409);
  expect(await result.json()).toMatchObject({ error: { code: 'ORGANIZATION_CHANGED' } });
});
