import { validCompanyLogo } from './logo';
import PDFDocument from 'pdfkit';
import path from 'node:path';
import { catalogUnits,type OfferDocument,type customerOfferPreview } from '@hvac/api-client';

// Only the explicit customer projection is accepted. Internal offer records never enter the renderer.
export type CustomerPdfOffer=ReturnType<typeof customerOfferPreview>;
const ORANGE='#FD4B01',INK='#18202C',MUTED='#697586',LINE='#E3E7EC',PALE='#FFF2EB';
const money=(cents:number)=>new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100).replace(/[\u00a0\u202f]/g,' ')+' zł';
const clean=(s:string)=>s.replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').replace(/\t/g,'    ');
const date=(s:string)=>s.split('-').reverse().join('.');
export async function renderOfferPdf(offer:CustomerPdfOffer,meta:OfferDocument,illustrative=false):Promise<Buffer>{
 if(meta.logoPng&&!validCompanyLogo(meta.logoPng))throw new Error('Invalid document logo');
 const doc=new PDFDocument({size:'A4',margin:0,bufferPages:true,autoFirstPage:false,info:{Title:`Oferta ${offer.number} - ${offer.title}`,Author:meta.companyName,Subject:'Zakres realizacji i wycena',Creator:'HVAC'}});
 doc.registerFont('Regular',path.join(process.cwd(),'assets/fonts/DejaVuSans.ttf'));
 doc.registerFont('Bold',path.join(process.cwd(),'assets/fonts/DejaVuSans-Bold.ttf'));
 const parts:Buffer[]=[];const done=new Promise<Buffer>((resolve,reject)=>{doc.on('data',p=>parts.push(p));doc.on('end',()=>resolve(Buffer.concat(parts)));doc.on('error',reject);});
 const x=48,w=499.28,bottom=765;let y=0;
 function text(s:string,xx:number,yy:number,width:number,size=9,bold=false,color=INK,align:'left'|'right'='left'){
  doc.font(bold?'Bold':'Regular').fontSize(size).fillColor(color).text(clean(s),xx,yy,{width,lineGap:2,align});
 }
 function height(s:string,width:number,size=9,bold=false){return doc.font(bold?'Bold':'Regular').fontSize(size).heightOfString(clean(s),{width,lineGap:2});}
 function rule(yy:number){doc.moveTo(x,yy).lineTo(x+w,yy).lineWidth(.6).strokeColor(LINE).stroke();}
 function logo(xx:number,yy:number){doc.save().translate(xx,yy).scale(.85).path('M16 1 L29 8.5 L29 23.5 L16 31 L3 23.5 L3 8.5 Z').fill(ORANGE).path('M16 1 L29 8.5 L16 16 L16 31 L3 23.5 L3 16 L16 8.5 Z').fill('#FF7900').path('M16 16 L29 23.5 L16 31 Z').fill('#D93C00').path('M16 9 L22.5 12.75 L22.5 20.25 L16 24 L9.5 20.25 L9.5 12.75 Z').fill('#FFFFFF').path('M16 1 L16 16 L29 23.5 L29 8.5 Z').fill('#FF6200').restore();}
 function page(){doc.addPage();if(meta.logoPng)doc.image(Buffer.from(meta.logoPng.split(',')[1],'base64'),x,24,{fit:[80,40],valign:'center'});else logo(x,29);const headerLines=lines(meta.companyName,meta.logoPng?222:280,9,true);text(headerLines.slice(0,2).join('\n')+(headerLines.length>2?'…':''),x+(meta.logoPng?92:34),34,meta.logoPng?222:280,9,true);text(offer.number,x+330,34,w-330,8,false,MUTED,'right');rule(75);y=98;}
 function ensure(h:number){if(y+h>bottom)page();}
 // Wrap long words as well as paragraphs, making even maximal input safely pageable.
 function lines(s:string,width:number,size=9,bold=false){
  doc.font(bold?'Bold':'Regular').fontSize(size);const result:string[]=[];
  for(const para of clean(s).split('\n')){let line='';for(const token of para.split(/\s+/)){if(!token)continue;let word=token;while(doc.widthOfString(word)>width){let n=1;while(n<word.length&&doc.widthOfString(word.slice(0,n+1))<=width)n++;if(line){result.push(line);line='';}result.push(word.slice(0,n));word=word.slice(n);}if(doc.widthOfString(line+(line?' ':'')+word)>width){result.push(line);line=word;}else line+=(line?' ':'')+word;}result.push(line);}
  return result;
 }
 function paragraph(s:string,size=9,color=MUTED,width=w){for(const line of lines(s,width,size)){ensure(size+8);text(line,x,y,width,size,false,color);y+=size+6;}}
 function section(label:string,body:string){if(!body.trim())return;ensure(65);text(label,x,y,w,11,true);y+=25;paragraph(body);y+=18;}
 page();
 if(illustrative){text('PROJEKT DOKUMENTU / DANE PRZYKŁADOWE',x,y,w,8,true,ORANGE);y+=24;}
 text('OFERTA',x,y,w,10,true,ORANGE);y+=26;
 const titleLines=lines(offer.title,w,24,true);for(const l of titleLines){ensure(37);text(l,x,y,w,24,true);y+=34;}y+=10;
 text(`Wystawiono: ${date(meta.issuedOn)}     |     Ważna do: ${date(meta.validUntil)}`,x,y,w,9,false,MUTED);y+=35;
 // Two independent blocks sized to their content, so long real company/customer names do not collide.
 const seller=[meta.companyName,meta.companyAddress,meta.taxId?`NIP / identyfikator: ${meta.taxId}`:'',meta.email,meta.phone,meta.website].filter(Boolean);
 const buyer=[offer.customer.name,offer.customer.address,[offer.customer.postalCode,offer.customer.city].filter(Boolean).join(' '),offer.customer.email,offer.customer.phone].filter((v):v is string=>!!v);
 const cw=(w-20)/2;const cardLines=(entries:string[])=>entries.flatMap((s,i)=>lines(s,cw-28,9,i===0));
 const a=cardLines(seller),b=cardLines(buyer),cardH=45+Math.max(a.length,b.length)*14;
 ensure(cardH+18);doc.roundedRect(x,y,cw,cardH,10).fill('#F5F7F9');doc.roundedRect(x+cw+20,y,cw,cardH,10).fill('#F5F7F9');
 text('WYKONAWCA',x+14,y+14,cw-28,8,true,MUTED);text('PRZYGOTOWANO DLA',x+cw+34,y+14,cw-28,8,true,MUTED);
 a.forEach((l,i)=>text(l,x+14,y+37+i*14,cw-28,9,i===0));b.forEach((l,i)=>text(l,x+cw+34,y+37+i*14,cw-28,9,i===0));y+=cardH+25;
 if(meta.intro){paragraph(meta.intro,10,INK);y+=22;}
 const variants=[...offer.variants].sort((a,b)=>Number(b.id===offer.mainVariantId)-Number(a.id===offer.mainVariantId));
 if(variants.length>1){ensure(55);text('Porównanie wariantów / ceny brutto',x,y,w,11,true);y+=28;
  for(const v of variants){const label=`${v.name}${v.id===offer.mainVariantId?'  /  Wariant główny':''}`,h=Math.max(44,height(label,w-175,10,true)+20);ensure(h);doc.roundedRect(x,y,w,h,7).fill(v.id===offer.mainVariantId?PALE:'#F5F7F9');text(label,x+12,y+12,w-175,10,true);text(money(v.grossCents),x+w-155,y+12,143,11,true);y+=h+8;}y+=17;paragraph('Warianty stanowią alternatywne propozycje - ich cen nie należy sumować. Szczegółowy zakres i warunki przedstawiamy na kolejnych stronach.',9,MUTED);
 }
 const cols=[x+12,x+238,x+300,x+350,x+426];
 const widths=[214,56,42,70,61];
 function tableHead(){ensure(74);doc.roundedRect(x,y,w,29,5).fill('#F0F3F6');['POZYCJA','ILOŚĆ','VAT','NETTO','BRUTTO'].forEach((s,i)=>text(s,cols[i],y+10,widths[i],7,true,MUTED,i>=3?'right':'left'));y+=29;}
 for(let vi=0;vi<variants.length;vi++){
  const v=variants[vi];if(vi>0||variants.length>1)page();ensure(105);text(`${String(vi+1).padStart(2,'0')} / ${v.id===offer.mainVariantId?'WARIANT GŁÓWNY':'WARIANT ALTERNATYWNY'}`,x,y,w,8,true,ORANGE);y+=22;
  const h=height(v.name,w,17,true);text(v.name,x,y,w,17,true);y+=h+20;tableHead();
  v.lines.forEach((l,i)=>{
   const name=lines(`${i+1}. ${l.name}`,widths[0],9,true),desc=l.description?lines(l.description,widths[0],8):[];
   const rowH=Math.max(53,name.length*14+desc.length*12+22);
   if(y+rowH>bottom){page();text(`${v.name} / ciąg dalszy`,x,y,w,11,true);y+=29;tableHead();}
   let yy=y+13;for(const s of name){text(s,cols[0],yy,widths[0],9,true);yy+=14;}for(const s of desc){text(s,cols[0],yy,widths[0],8,false,MUTED);yy+=12;}
   const qty=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:3}).format(l.quantityMills/1000);
   text(`${qty}\n${catalogUnits[l.unit]}`,cols[1],y+14,widths[1],8);text(`${l.vatBasisPoints/100}%`,cols[2],y+14,widths[2],8);
   text(money(l.netCents),cols[3],y+14,widths[3],8,false,INK,'right');text(money(l.grossCents),cols[4],y+14,widths[4],8,true,INK,'right');
   y+=rowH;rule(y);
  });
  y+=18;ensure(24+new Set(v.lines.map(l=>l.vatBasisPoints)).size*21+82);
  const tx=x+w-242;
  text('Razem netto',tx,y,130,9,false,MUTED);text(money(v.netCents),tx+120,y,122,10,true,INK,'right');y+=24;
  const vats=new Map<number,number>();for(const l of v.lines)vats.set(l.vatBasisPoints,(vats.get(l.vatBasisPoints)||0)+l.vatCents);
  for(const [rate,cents] of [...vats].sort((a,b)=>a[0]-b[0])){ensure(90);text(`VAT ${rate/100}%`,tx,y,130,9,false,MUTED);text(money(cents),tx+120,y,122,9,false,INK,'right');y+=21;}
  ensure(70);doc.roundedRect(tx-14,y,256,57,8).fill(INK);text('RAZEM BRUTTO',tx,y+12,220,7,true,'#C7CDD5');text(money(v.grossCents),tx,y+28,228,17,true,'#FFFFFF','right');y+=82;
  if(v.note)section('Informacje o wariancie',v.note);
 }
 if([meta.paymentTerms,meta.completionTerms,meta.exclusions,meta.note].some(s=>s.trim())){ensure(110);rule(y);y+=24;text('Warunki realizacji',x,y,w,17,true);y+=39;
 section('Płatność',meta.paymentTerms);section('Termin i organizacja prac',meta.completionTerms);section('Zakres wyłączeń',meta.exclusions);section('Dodatkowe informacje',meta.note);}
 const count=doc.bufferedPageRange().count;
 for(let i=0;i<count;i++){doc.switchToPage(i);rule(789);text([meta.email,meta.phone].filter(Boolean).join('  |  ')||meta.companyName,x,802,w-110,7,false,MUTED);text(`${i+1} / ${count}`,x+w-80,802,80,8,false,MUTED,'right');}
 doc.end();return done;
}
