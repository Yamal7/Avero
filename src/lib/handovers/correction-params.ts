import { z } from 'zod';
export function correctionParams(p:{id:string;round:string}){return {p_id:z.string().uuid().parse(p.id),p_round:z.coerce.number().int().min(1).max(100).parse(p.round)};}
