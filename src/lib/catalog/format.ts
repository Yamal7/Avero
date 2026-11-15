export const catalogMoney=(cents:number)=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(cents/100);
export const catalogPercent=(value:number)=>new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(value)+'%';
