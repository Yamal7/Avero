import PDFDocument from 'pdfkit';
import path from 'node:path';
import type { HandoverSnapshot } from '@hvac/api-client';
const ORANGE='#FD4B01',INK='#18202C',MUTED='#697586',LINE='#E3E7EC';
const clean=(s:string)=>s.replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').replace(/\t/g,'    ');
const date=(s:string)=>s.split('-').reverse().join('.');
// Public, strictly validated snapshot only: no draft, price or internal note reaches this renderer.
export async function renderHandoverPdf(s:HandoverSnapshot,illustrative=false):Promise<Buffer>{
 const doc=new PDFDocument({size:'A4',margin:0,bufferPages:true,autoFirstPage:false,info:{Title:`Protokół odbioru ${s.number}`,Author:s.company.name,Subject:s.title,Creator:'HVAC'}});
 doc.registerFont('Regular',path.join(process.cwd(),'assets/fonts/DejaVuSans.ttf'));doc.registerFont('Bold',path.join(process.cwd(),'assets/fonts/DejaVuSans-Bold.ttf'));
 const parts:Buffer[]=[];const done=new Promise<Buffer>((resolve,reject)=>{doc.on('data',p=>parts.push(p));doc.on('end',()=>resolve(Buffer.concat(parts)));doc.on('error',reject);});
 const x=48,w=499.28;let y=98;
 function text(t:string,xx:number,yy:number,width=w,size=9,bold=false,color=INK){doc.font(bold?'Bold':'Regular').fontSize(size).fillColor(color).text(clean(t),xx,yy,{width,lineGap:2});}
 function rule(yy:number){doc.moveTo(x,yy).lineTo(x+w,yy).lineWidth(.6).strokeColor(LINE).stroke();}
 function logo(){doc.save().translate(x,29).scale(.85).path('M16 1 L29 8.5 L29 23.5 L16 31 L3 23.5 L3 8.5 Z').fill(ORANGE).path('M16 1 L29 8.5 L16 16 L16 31 L3 23.5 L3 16 L16 8.5 Z').fill('#FF7900').path('M16 16 L29 23.5 L16 31 Z').fill('#D93C00').path('M16 9 L22.5 12.75 L22.5 20.25 L16 24 L9.5 20.25 L9.5 12.75 Z').fill('#FFFFFF').path('M16 1 L16 16 L29 23.5 L29 8.5 Z').fill('#FF6200').restore();}
 function page(){doc.addPage();logo();text(s.company.name,x+34,34,280,8,true);text(s.number,x+w-115,34,115,8,false,MUTED);rule(75);y=98;}
 function ensure(h:number){if(y+h>762)page();}
 function wrap(t:string,width=w,size=9,bold=false){doc.font(bold?'Bold':'Regular').fontSize(size);const out:string[]=[];for(const p of clean(t).split('\n')){let line='';for(const token of p.split(/\s+/)){if(!token)continue;let word=token;while(doc.widthOfString(word)>width){let n=1;while(n<word.length&&doc.widthOfString(word.slice(0,n+1))<=width)n++;if(line){out.push(line);line='';}out.push(word.slice(0,n));word=word.slice(n);}if(doc.widthOfString(line+(line?' ':'')+word)>width){out.push(line);line=word;}else line+=(line?' ':'')+word;}out.push(line);}return out;}
 function paragraph(t:string,size=9,color=MUTED,bold=false){for(const l of wrap(t,w,size,bold)){ensure(size+8);text(l,x,y,w,size,bold,color);y+=size+4;}}
 function section(label:string,t:string){if(!t.trim())return;ensure(62);text(label,x,y,w,12,true);y+=18;paragraph(t);y+=8;}
 page();if(illustrative){text('DANE PRZYKŁADOWE / PROJEKT DOKUMENTU',x,y,w,8,true,ORANGE);y+=24;}
 text('ODBIÓR I URUCHOMIENIE',x,y,w,9,true,ORANGE);y+=20;paragraph(/\/P\d+$/.test(s.number)?'Protokół ponownego odbioru':'Protokół odbioru montażu',23,INK,true);y+=8;paragraph(s.title,12,INK,true);y+=12;
 paragraph(`Protokół ${s.number}  |  Zlecenie ${s.orderNumber}`,9,MUTED);paragraph(`Data wykonania prac: ${date(s.performedOn)}`,9,MUTED);y+=15;
 const cw=(w-20)/2,a=[s.company.name,s.company.address,s.company.taxId?`NIP / identyfikator: ${s.company.taxId}`:'',[s.company.email,s.company.phone].filter(Boolean).join(' | ')].filter(Boolean).flatMap((v,i)=>wrap(v,cw-28,9,i===0)),b=[s.customerName,s.site.address,`${s.site.postalCode} ${s.site.city}`].flatMap((v,i)=>wrap(v,cw-28,9,i===0));const h=48+Math.max(a.length,b.length)*14;
 ensure(h+20);doc.roundedRect(x,y,cw,h,9).fill('#F5F7F9');doc.roundedRect(x+cw+20,y,cw,h,9).fill('#F5F7F9');text('WYKONAWCA',x+14,y+14,cw-28,8,true,MUTED);text('KLIENT / MIEJSCE MONTAŻU',x+cw+34,y+14,cw-28,8,true,MUTED);
 a.forEach((t,i)=>text(t,x+14,y+36+i*14,cw-28,9,i===0));b.forEach((t,i)=>text(t,x+cw+34,y+36+i*14,cw-28,9,i===0));y+=h+16;
 section('Instalacja i wykonawca',`${s.installation.type} · ${s.performerName}`);section('Wykonany zakres',s.workPerformed);section('Uruchomienie i sprawdzenia',s.checks);
 if(s.devices.length){ensure(70);text(`${/\/P\d+$/.test(s.number)?'Urządzenia z pierwszego protokołu':'Zarejestrowane urządzenia'} / ${s.devices.length}`,x,y,w,14,true);y+=27;
 for(let i=0;i<s.devices.length;i++){const d=s.devices[i];ensure(85);rule(y);y+=17;paragraph(`${String(i+1).padStart(2,'0')}. ${d.manufacturer} ${d.model}`,11,INK,true);paragraph(`Numer seryjny: ${d.serialNumber||'Nie podano'}`);paragraph(`Gwarancja do: ${d.warrantyUntil?date(d.warrantyUntil):'Nie podano'}`);if(d.warrantyTerms){paragraph('Podane warunki gwarancji:',8,INK,true);paragraph(d.warrantyTerms);}y+=10;}
 }
 const closingHeight=[s.observations,s.recommendations].filter(t=>t.trim()).reduce((n,t)=>n+26+wrap(t).length*13,65);if(closingHeight<350)ensure(closingHeight);
 section('Uwagi do wykonania prac',s.observations);section('Zalecenia',s.recommendations);ensure(65);rule(y);y+=20;paragraph('Zatwierdzenie firmy i odbiór klienta',11,INK,true);paragraph('Dokument przedstawia zakres zatwierdzony przez firmę. Potwierdzenie odbioru lub uwagi klienta są rejestrowane oddzielnie w portalu.');
 const count=doc.bufferedPageRange().count;for(let i=0;i<count;i++){doc.switchToPage(i);rule(789);text(illustrative?'Dokument demonstracyjny - dane przykładowe':s.company.email||s.company.name,x,802,w-110,7,false,MUTED);text(`${i+1} / ${count}`,x+w-70,802,70,8,false,MUTED);}
 doc.end();return done;
}
