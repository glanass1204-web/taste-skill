// v58: кнопка «Исправить» не убирает наполнение, заказанное клиентом (полки — можно, вместе с пустой секцией)
//: деньги, распил, кромка, петли, 3D против списка деталей, повторяемость.
// Каждое число пересчитывается здесь заново своим способом и сравнивается с тем, что показывает программа.
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html',N=+(process.argv[3]||300),SEED=+(process.argv[4]||7),VAR=N;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(([N,SEED,VAR])=>{const M=window.ShkafMaster,fails=[],cnt={};let checks=0;
 const ok=(c,m,g)=>{checks++;cnt[g]=(cnt[g]||0)+1;if(!c)fails.push(m)};
 let seed=SEED>>>0;const rnd=()=>{seed=(seed+0x6D2B79F5)>>>0;let z=seed;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296},pick=a=>a[Math.floor(rnd()*a.length)],int=(a,b)=>a+Math.floor(rnd()*(b-a+1));
 const S0=M.settings(),km=(type,w,sh,dr,ex)=>Object.assign({type,w,shelves:sh||0,drawers:dr||3},ex||{});
 const Hk=M.__hooks,rub=Hk.rub,offerText=Hk.offerText,docText=Hk.docText,supplierLists=Hk.supplierLists,scene3dData=M.scene3dData;let R;
 const nb=s=>String(s).replace(/[  ]/g,' ');
 const rubT=n=>nb(rub(n));
 const sec=()=>({iron:rnd()>.9,shelves:int(0,5),rod:rnd()>.6,drawers:pick([0,0,1,2]),baskets:pick([0,0,1]),open:rnd()>.8,hooks:pick([0,0,0,3]),seat:rnd()>.85,shoes:int(0,2),trousers:rnd()>.9,shoeOut:pick([0,0,0,1]),led:rnd()>.85,panto:rnd()>.9});
 // своя таблица петель по производителям — независимо от программы
 const HT=(h,m)=>(h<=900?2:h<=1600?3:h<=2000?4:h<=2400?5:6)+(m&&h>900?1:0);
 const orders=[];
 M.builtinTemplates().forEach(t=>{for(let v=0;v<VAR;v++){const p=M.fromTemplate(t);p.mat.front=pick(['body','body','ldsp','mdfmat','agt']);p.mat.frontDecor=pick(['sage','anthr','kashmir']);p.decor=pick(['white','sonoma','casella','anthr']);p.hw.handle=pick(S0.cat.handles.map(x=>x.id));p.hw.slide=pick(S0.cat.slides.map(x=>x.id));
  if(p.kind==='wardrobe'){const f=1+(rnd()-.5)*.3;p.W=Math.round(p.W*f);p.H=Math.round(Math.min(2700,p.H*(1+(rnd()-.5)*.15)));p.D=pick([p.D,p.D,450,560,600]);p.mirrors=int(0,3);p.back=pick(['','','ldsp','none']);p.ceil=pick(['','','stand','filler']);p.ceilH=p.H+int(30,300);if(rnd()>.7){p.bbH=60;p.bbD=20;p.plinth=Math.max(p.plinth||0,80)}if(rnd()>.8)p.type=p.shape==='u'?'swing':pick(['swing','coupe']);if(p.shape==='straight'&&rnd()>.6){p.endL=pick(['','rect','round']);p.endR=pick(['','rect','round']);p.endW=pick([250,300,350])}else if(p.shape==='straight'&&rnd()>.7){p.slopeB=Math.round(p.H*pick([.6,.7,.8]));p.ceil='';p.mezz=rnd()>.5;p.sections.forEach(sc=>{sc.rod=false;sc.panto=false})}}
  if(p.kind==='kitchen'){p.k.wallF=pick(['','','kashmir','anthr','body','graphite']);p.k.cMech=pick(['','magic','carousel']);p.k.gola=rnd()>.7;p.k.wall2H=pick([0,0,360]);p.k.cornerSide=pick(['L','R']);p.k.base.forEach(m=>{if(m.type==='sink'&&rnd()>.5)m.bin='1'});if(rnd()>.6)p.k.wall.forEach(m=>{if(m.type==='doors'&&rnd()>.6)m.type='glass'})}
  if(p.kind==='chest'){const f=1+(rnd()-.5)*.3;p.c.W=Math.round(p.c.W*f);p.c.D=Math.round(p.c.D*(1+(rnd()-.5)*.2));p.back=pick(['','','ldsp','none']);p.c.cols.forEach(cl=>{if(cl.type==='drawers')cl.dlay=pick(['','top','bottom'])})}
  orders.push(M.norm(p))}});
 const T=new Map();let withFix=0,lossy=0;const ex=[];
 const content=p=>{if(p.kind!=='wardrobe')return null;const o={};['sections','sectionsB','sectionsV'].forEach(k=>(p[k]||[]).forEach(x=>['drawers','baskets','shelves','shoes','hooks','shoeOut'].forEach(f=>o[f]=(o[f]||0)+(+x[f]||0))));
   ['sections','sectionsB','sectionsV'].forEach(k=>(p[k]||[]).forEach(x=>['rod','seat','trousers','iron','panto','mirrorOut','led'].forEach(f=>o[f]=(o[f]||0)+(x[f]?1:0))));return o};
 for(const p of orders){if(p.kind!=='wardrobe')continue;const S=M.effSettings(p),c=M.calc(p,S),E=c.warn.filter(w=>w.lvl==='err');
  for(const e of E){let f;try{f=M.fixFor(e.t,p)}catch(x){fails.push('fixFor '+x.message);continue}if(!f)continue;withFix++;
   const q=JSON.parse(JSON.stringify(p));f.f(q);M.norm(q);const a=content(p),b=content(q),lost=Object.keys(a).filter(k=>k!=='shelves'&&(b[k]||0)<a[k]).map(k=>k+' '+a[k]+'→'+(b[k]||0));
   const key=f.label+' | '+e.t.replace(/^Сторона [АБВ]: /,'').replace(/\d+([.,]\d+)?/g,'#').slice(0,90);
   const r=T.get(key)||{n:0,lossy:0,ex:''};r.n++;if(lost.length){r.lossy++;lossy++;if(!r.ex)r.ex=lost.join(', ')}T.set(key,r)}}
 return{fails,withFix,lossy,T:[...T.entries()].sort((a,b)=>b[1].lossy-a[1].lossy||b[1].n-a[1].n)}},[N,SEED,VAR]);
console.log('ошибок с кнопкой «Исправить»',res.withFix,'из них с потерей содержимого',res.lossy);res.T.forEach(([k,v])=>console.log(v.lossy?'ПОТЕРЯ '+v.lossy+'/'+v.n:'ок '+v.n,'|',k,v.ex?'| '+v.ex:''));
console.log(res.lossy||res.fails.length||!res.withFix?'✗ потерь '+res.lossy+', сбоев '+res.fails.length:'✓ все '+res.withFix+' исправлений без потери наполнения','errs',errs);await b.close()})();
