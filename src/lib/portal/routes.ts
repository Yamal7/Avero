export function homeForRole(role:string) { return role==='client'?'/portal':'/dashboard'; }
export function portalHref(path:string,customer?:string|null,parameters:Record<string,string>={}) {
 const query=new URLSearchParams(parameters); if(customer)query.set('customer',customer);
 return path+(query.size?'?'+query.toString():'');
}
export function portalSection(pathname:string) {
 if(pathname.startsWith('/portal/offers'))return 'offers';
 if(pathname.startsWith('/portal/installations'))return 'installations';
 if(pathname.startsWith('/portal/service')||pathname.startsWith('/portal/visits'))return 'service';
 if(pathname.startsWith('/portal/documents')||pathname.startsWith('/portal/protocols'))return 'documents';
 if(pathname.startsWith('/portal/account'))return 'account';
 return 'home';
}
export function safeDownloadHeaders(filename:string,type:string) {
 const cleaned=filename.replace(/[\u0000-\u001f\u007f]/g,'').slice(0,240)||'dokument';
 const encoded=encodeURIComponent(cleaned).replace(/[!'()*]/g,char=>'%'+char.charCodeAt(0).toString(16).toUpperCase());
 return {'Content-Type':['application/pdf','image/jpeg','image/png'].includes(type)?type:'application/octet-stream','Content-Disposition':`attachment; filename="dokument"; filename*=UTF-8''${encoded}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
}
