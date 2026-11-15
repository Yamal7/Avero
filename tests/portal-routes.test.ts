import { expect,it } from 'vitest';
import { homeForRole,portalHref,portalSection,safeDownloadHeaders } from '@/lib/portal/routes';
it('routes clients to the phone portal and staff to the company panel',()=>{
 expect(homeForRole('client')).toBe('/portal');for(const role of ['admin','office','technician'])expect(homeForRole(role)).toBe('/dashboard');
});
it('keeps the selected customer together with list filters',()=>{
 const url=new URL(portalHref('/portal/service','customer-id',{status:'all',page:'2'}),'http://localhost');
 expect(url.searchParams.get('customer')).toBe('customer-id');expect(url.searchParams.get('status')).toBe('all');expect(url.searchParams.get('page')).toBe('2');
});
it('highlights document and visit sections for their nested pages',()=>{
 expect(portalSection('/portal/offers/123')).toBe('offers');expect(portalSection('/portal/protocols/123')).toBe('documents');expect(portalSection('/portal/visits')).toBe('service');expect(portalSection('/portal/installations/123')).toBe('installations');
});
it('downloads private files as attachments without a cache',()=>{
 const headers=safeDownloadHeaders('Protokół serwisu.pdf','application/pdf');expect(headers['Content-Type']).toBe('application/pdf');expect(headers['Cache-Control']).toBe('private, no-store');expect(headers['Content-Disposition']).toContain('filename*=UTF-8');expect(headers['Content-Disposition']).toContain('%C3%B3');expect(headers['X-Content-Type-Options']).toBe('nosniff');
});
it('neutralizes control characters and unexpected active content types',()=>{
 const headers=safeDownloadHeaders('bad\r\nX-Test: yes.html','text/html');expect(headers['Content-Disposition']).not.toMatch(/[\r\n]/);expect(headers['Content-Type']).toBe('application/octet-stream');
});
