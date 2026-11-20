const fs=require('fs');
const [,,file,propsJson,out,width]=process.argv;
const s=fs.readFileSync(file,'utf8');
const a=s.indexOf('class Component');const b=s.lastIndexOf('</script>');
class DCLogic{constructor(p){this.props=p;this.state={}} setState(){} }
const C=new Function('DCLogic',s.slice(a,b)+';return Component')(DCLogic);
const c=new C(JSON.parse(propsJson)); const vals=c.renderVals();
const style=s.match(/<style>([\s\S]*?)<\/style>/)[1];
let body=s.slice(s.indexOf('<div class="av'), s.indexOf('</x-dc>'));
function get(ctx,path){return path.split('.').reduce((o,k)=>o==null?undefined:o[k],ctx)}
function render(t,ctx){
  // process innermost-first by scanning for sc-for / sc-if with balanced matching
  let outS='';let i=0;
  const re=/<(sc-if|sc-for)\b([^>]*)>/g;
  while(true){re.lastIndex=i;const m=re.exec(t);if(!m){outS+=t.slice(i);break}
    outS+=t.slice(i,m.index);const tag=m[1];
    // find matching close
    let d=1,j=re.lastIndex;const r2=new RegExp('<(/?)'+tag+'\\b[^>]*>','g');r2.lastIndex=j;let mm,end;
    while((mm=r2.exec(t))){d+=mm[1]?-1:1;if(d===0){end=mm.index;break}}
    const inner=t.slice(j,end);i=end+('</'+tag+'>').length;
    const attr=m[2];
    if(tag==='sc-if'){const v=attr.match(/value="\{\{([^}]+)\}\}"/)[1].trim();if(get(ctx,v))outS+=render(inner,ctx)}
    else{const l=attr.match(/list="\{\{([^}]+)\}\}"/)[1].trim();const as=attr.match(/as="(\w+)"/)[1];for(const it of (get(ctx,l)||[]))outS+=render(inner,Object.assign({},ctx,{[as]:it}))}
  }
  return outS.replace(/\{\{([^}]+)\}\}/g,(_,p)=>{const v=get(ctx,p.trim());return v==null?'':(typeof v==='function'?'':v)});
}
const html=`<!doctype html><html><head><meta charset="utf-8"><style>${style}</style></head><body style="margin:0;width:${width||1440}px">${render(body,vals)}</body></html>`;
fs.writeFileSync(out,html);
