import { inflateSync } from 'node:zlib';
import { companyLogoSchema } from '@hvac/api-client';
// Only bounded, non-interlaced RGB/RGBA PNG. Never load remote images or SVG.
export function validCompanyLogo(value:string):boolean{try{
 if(!companyLogoSchema.safeParse(value).success)return false;
 const bytes=Buffer.from(value.split(',')[1],'base64');if(bytes.length>65536||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')return false;
 let pos=8,width=0,height=0,channels=0,ended=false;const data:Buffer[]=[];
 while(pos+12<=bytes.length){const n=bytes.readUInt32BE(pos);if(n>65536||pos+12+n>bytes.length)return false;const type=bytes.toString('ascii',pos+4,pos+8),chunk=bytes.subarray(pos+8,pos+8+n);let crc=0xffffffff;for(const b of bytes.subarray(pos+4,pos+8+n)){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}if(((crc^0xffffffff)>>>0)!==bytes.readUInt32BE(pos+8+n))return false;
 if(pos===8&&type!=='IHDR')return false;
 if(type==='IHDR'){if(pos!==8||n!==13)return false;width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);channels=chunk[9]===6?4:chunk[9]===2?3:0;if(!width||!height||width>512||height>512||chunk[8]!==8||!channels||chunk[10]||chunk[11]||chunk[12])return false;}
 else if(type==='IDAT')data.push(chunk);else if(type==='IEND'){if(n||pos+12!==bytes.length)return false;ended=true;break;}else if(!['sRGB','gAMA','cHRM','pHYs'].includes(type))return false;
 pos+=12+n;
 }
 if(!ended||!data.length)return false;const stride=width*channels+1,raw=inflateSync(Buffer.concat(data),{maxOutputLength:height*stride});if(raw.length!==height*stride)return false;for(let y=0;y<height;y++)if(raw[y*stride]>4)return false;return true;
 }catch{return false;}}
