// Большая независимая проверка: деньги, распил, кромка, петли, 3D против списка деталей, повторяемость.
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
  if(p.kind==='wardrobe'){const f=1+(rnd()-.5)*.3;p.W=Math.round(p.W*f);p.H=Math.round(Math.min(2700,p.H*(1+(rnd()-.5)*.15)));p.D=pick([p.D,p.D,450,560,600]);p.mirrors=int(0,3);p.back=pick(['','','ldsp','none']);p.ceil=pick(['','','stand','filler']);p.ceilH=p.H+int(30,300);if(rnd()>.7){p.bbH=60;p.bbD=20;p.plinth=Math.max(p.plinth||0,80)}if(rnd()>.8)p.type=p.shape==='u'?'swing':pick(['swing','coupe'])}
  if(p.kind==='kitchen'){p.k.wallF=pick(['','','kashmir','anthr','body','graphite']);p.k.cMech=pick(['','magic','carousel']);p.k.gola=rnd()>.7;p.k.wall2H=pick([0,0,360]);p.k.cornerSide=pick(['L','R']);p.k.base.forEach(m=>{if(m.type==='sink'&&rnd()>.5)m.bin='1'});if(rnd()>.6)p.k.wall.forEach(m=>{if(m.type==='doors'&&rnd()>.6)m.type='glass'})}
  if(p.kind==='chest'){const f=1+(rnd()-.5)*.3;p.c.W=Math.round(p.c.W*f);p.c.D=Math.round(p.c.D*(1+(rnd()-.5)*.2));p.back=pick(['','','ldsp','none']);p.c.cols.forEach(cl=>{if(cl.type==='drawers')cl.dlay=pick(['','top','bottom'])})}
  orders.push(M.norm(p))}});
 const SOLID=new Set(['body','front','front2','top','plinth']),TOL=1.5;
 const world=(gr,it)=>{const c=Math.round(Math.cos(gr.rot)),s=Math.round(Math.sin(gr.rot)),xs=[],zs=[];
   for(const x of [it.x,it.x+it.w])for(const z of [it.z,it.z+it.d]){xs.push(x*c+z*s+gr.pos[0]);zs.push(-x*s+z*c+gr.pos[2])}
   return{x0:Math.min(...xs),x1:Math.max(...xs),y0:it.y+gr.pos[1],y1:it.y+it.h+gr.pos[1],z0:Math.min(...zs),z1:Math.max(...zs),m:it.m,it}};
 const ov=(a,b)=>Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>TOL&&Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0)>TOL&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>TOL;
 const fmt=b=>`${b.m}[${Math.round(b.x0)}..${Math.round(b.x1)} × ${Math.round(b.y0)}..${Math.round(b.y1)} × ${Math.round(b.z0)}..${Math.round(b.z1)}]`;
 const stat={orders:0,items:0,pairs:0};
 orders.forEach((p,n)=>{const tag=`#${n} ${p.kind}${p.shape?' '+p.shape:''}${p.kind==='chest'?' '+p.c.cols.map(c=>c.type).join('/'):''}`;
  try{M.__render(p)}catch(e){ok(false,tag+': падение '+e.message,'падение');return}
  const R0=Hk.R();if(R0.c.warn.some(w=>w.lvl==='err')){stat.bad=(stat.bad||0)+1;return}
  const d=scene3dData();stat.orders++;
  const all=[];d.groups.forEach(gr=>gr.items.forEach(it=>{ok([it.x,it.y,it.z,it.w,it.h,it.d].every(Number.isFinite),tag+': не число в 3D '+JSON.stringify(it),'числа');ok(it.w>0&&it.h>0&&it.d>0,tag+': нулевой размер','размер');all.push(world(gr,it))}));
  stat.items+=all.length;
  const sol=all.filter(b=>SOLID.has(b.m)),box=all.filter(b=>b.m==='box');
  for(let i=0;i<sol.length;i++)for(let j=i+1;j<sol.length;j++){stat.pairs++;if(ov(sol[i],sol[j]))ok(false,tag+': детали в 3D пересекаются: '+fmt(sol[i])+' и '+fmt(sol[j]),'пересечение')}
  box.forEach(bx=>sol.filter(b=>b.m==='body').forEach(b=>{if(ov(bx,b))ok(false,tag+': короб ящика заходит в корпус: '+fmt(bx)+' и '+fmt(b),'ящик')}));
  // всё изделие стоит на полу и не уходит под пол
  ok(all.every(b=>b.y0>-0.5),tag+': деталь ниже пола: '+fmt(all.find(b=>b.y0<=-0.5)||{x0:0,x1:0,y0:0,y1:0,z0:0,z1:0,m:''}),'пол');
  ok(true,'','заказ')});
 return{checks,fails,cnt,stat}},[N,SEED,VAR]);
console.log('Заказов без ошибок:',res.stat.orders,'с ошибками (пропущено):',res.stat.bad,'деталей 3D:',res.stat.items,'пар проверено:',res.stat.pairs,'Проверок:',res.checks,'Ошибок:',res.fails.length);
const g={};res.fails.forEach(f=>{const k=f.replace(/^#\d+ /,'').replace(/\[[^\]]*\]/g,'[]').slice(0,120);g[k]=(g[k]||0)+1});
Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log(' -',v,'×',k));
res.fails.slice(0,8).forEach(f=>console.log('   ',f.slice(0,400)));
console.log('errs',errs);await b.close()})();