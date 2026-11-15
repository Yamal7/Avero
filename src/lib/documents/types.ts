export const documentLabels:Record<string,string>={manual:'Instrukcja',warranty:'Gwarancja',photo:'Zdjęcie',other:'Inny dokument'};
export function formatFileSize(bytes:number|null){if(bytes===null)return 'Rozmiar nieznany';return bytes<1024*1024?`${Math.max(1,Math.round(bytes/1024))} KB`:`${(bytes/(1024*1024)).toFixed(1)} MB`;}
