import { it,expect,vi } from 'vitest';
import { mkdir,writeFile } from 'node:fs/promises';
import { createHvacClient,customerOfferPreview,emptyOfferDocument,offerDocumentSchema } from '@hvac/api-client';
import { renderOfferPdf } from '@/lib/offers/pdf';
import { pdfFixture } from './helpers/offer-pdf-fixture';
it('validates real calendar dates, required company data and bounded printable content',()=>{
 const {meta}=pdfFixture();expect(offerDocumentSchema.safeParse(meta).success).toBe(true);
 for(const patch of [{companyName:''},{companyAddress:''},{issuedOn:'2026-02-30'},{validUntil:'2026-10-01'},{note:'\nq'.repeat(21)},{intro:'x\u0001'},{website:'x\u007f'},{costCents:1}])expect(offerDocumentSchema.safeParse({...meta,...patch}).success).toBe(false);
 expect(emptyOfferDocument('2026-12-25').validUntil).toBe('2027-01-08');
});
it('renders a portable multi-variant A4 document using only the customer projection',async()=>{
 const {record,meta}=pdfFixture(),projection=customerOfferPreview(record);expect(JSON.stringify(projection)).not.toMatch(/PRIVATE-|costCents|profitCents|targetMargin/);
 const bytes=await renderOfferPdf(projection,meta,true);expect(bytes.subarray(0,5).toString()).toBe('%PDF-');expect(bytes.length).toBeGreaterThan(15000);
 if(process.env.PDF_REVIEW==='1'){await mkdir('output/pdf',{recursive:true});await writeFile('output/pdf/oferta-hvac-projekt.pdf',bytes);await mkdir('tmp/pdfs',{recursive:true});await writeFile('tmp/pdfs/fixture.json',JSON.stringify({record,meta}));}
});
it('paginates maximal rows and multi-line customer notes without losing the PDF stream',async()=>{
 const {record,meta}=pdfFixture(true);record.variants[0].customerNote=Array(20).fill('Żółć, ąęść - '+('bardzo długi opis '.repeat(4))).join('\n');
 const bytes=await renderOfferPdf(customerOfferPreview(record),meta,true);expect(bytes.subarray(-6).toString()).toContain('%%EOF');
 if(process.env.PDF_REVIEW==='1'){await mkdir('tmp/pdfs',{recursive:true});await writeFile('tmp/pdfs/long-offer.pdf',bytes);}
});

it('supports authenticated PDF downloads on mobile and desktop adapters',async()=>{
 const fetcher=vi.fn().mockResolvedValue(new Response('%PDF-test',{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Oferta-OF-2026-1.pdf"'}}));
 const client=createHvacClient({apiOrigin:'https://api.example',channel:'desktop',getAccessToken:async()=>'test-token',fetcher});
 const result=await client.downloadOfferPdf(pdfFixture().record.id,2,3);expect(result.filename).toBe('Oferta-OF-2026-1.pdf');expect(fetcher.mock.calls[0][0]).toContain('/pdf?offerVersion=2&documentVersion=3');expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token');
 fetcher.mockResolvedValueOnce(new Response('{}',{headers:{'Content-Type':'application/json'}}));await expect(client.downloadOfferPdf(pdfFixture().record.id,2,3)).rejects.toThrow('Nieprawidłowy dokument PDF.');
});
