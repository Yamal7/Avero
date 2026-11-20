import { describe,it,expect } from 'vitest';
import { newTicketSchema,protocolSchema,scheduleSchema } from '@/lib/service/types';
import { addDays,localDate,localDateTime,visitOnDate,weekStart } from '@/lib/service/dates';
const id='a4000000-0000-4000-8000-000000000001';
const fields={diagnosis:'',work_performed:'',materials:'',measurements:'',recommendations:''};
describe('Service validation',()=>{
 it('requires an installation and stable request id',()=>{
  expect(newTicketSchema.safeParse({installationId:id,subject:' ',description:'Test',priority:'normal',requestId:id}).success).toBe(false);
  expect(newTicketSchema.safeParse({installationId:id,subject:'Test',description:'Test',priority:'normal',requestId:'bad'}).success).toBe(false);
 });
 it('rejects impossible dates and oversized durations before scheduling',()=>{
  for(const localStart of ['2026-02-30T12:00','2026-11-01T24:00','2026-11-01T12:60']) expect(scheduleSchema.safeParse({ticketId:id,visitId:null,localStart,duration:60,notes:''}).success).toBe(false);
  expect(scheduleSchema.safeParse({ticketId:id,visitId:null,localStart:'2026-11-01T12:00',duration:481,notes:''}).success).toBe(false);
 });
 it('allows empty draft but requires diagnosis and work for publishing',()=>{
  expect(protocolSchema.safeParse({visitId:id,version:0,publish:false,fields}).success).toBe(true);
  expect(protocolSchema.safeParse({visitId:id,version:0,publish:true,fields}).success).toBe(false);
  expect(protocolSchema.safeParse({visitId:id,version:1,publish:true,fields:{...fields,diagnosis:'Blocked filter',work_performed:'Replaced'}}).success).toBe(true);
 });
 it('does not accept a forged snapshot in protocol fields',()=>{
  expect(protocolSchema.safeParse({visitId:id,version:0,publish:false,fields:{...fields,snapshot:{customer_name:'Forged'}}}).success).toBe(false);
 });
});
describe('Warsaw service calendar',()=>{
 it('finds Monday even on Sunday and crosses year boundaries',()=>{
  expect(weekStart('2026-10-25')).toBe('2026-10-19');expect(addDays('2026-12-31',1)).toBe('2027-01-01');
 });
 it('assigns late UTC visits to the correct local day',()=>{
  expect(localDate('2026-10-25T23:30:00Z')).toBe('2026-10-26');
 });
 it('includes overnight visits without showing a midnight end on the next day',()=>{
  expect(visitOnDate('2026-11-01T22:30:00Z',120,'2026-11-02')).toBe(true);
  expect(visitOnDate('2026-11-01T22:00:00Z',60,'2026-11-02')).toBe(false);
 });
 it('formats DST boundaries in the configured timezone',()=>{
  expect(localDateTime('2026-03-29T01:30:00Z')).toBe('2026-03-29T03:30');
  expect(localDateTime('2026-10-25T01:30:00Z')).toBe('2026-10-25T02:30');
 });
});
