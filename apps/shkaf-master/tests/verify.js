const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8').replace(/^[\s\S]*<body>/,'').replace(/<\/body>[\s\S]*$/,'')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(()=>{
 const M=window.ShkafMaster,S=M.DEFAULT_SETTINGS,t=S.t,fails=[];let checks=0;
 const eq=(a,b,msg,tol=0.02)=>{checks++;if(!(Math.abs(a-b)<=tol))fails.push(`${msg}: ${(+a).toFixed(2)} ≠ ${(+b).toFixed(2)}`)};
 const ok=(c,msg)=>{checks++;if(!c)fails.push(msg)};
 const base=()=>M.newProject();
 const sanity=(r,tag)=>{r.parts.forEach(x=>{ok(x.L>0&&x.Wd>0&&Number.isFinite(x.L)&&Number.isFinite(x.Wd)&&x.qty>0,`${tag}: плохая деталь ${x.name} ${x.L}×${x.Wd}×${x.qty}`)});
   r.hw.forEach(h=>ok(Number.isFinite(h[1])&&h[1]>=0,`${tag}: фурнитура ${h[0]}=${h[1]}`));
   const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true);
   // раскрой: детали не пересекаются и не вылезают за лист
   [cl,ch].forEach(res=>res.sheets.forEach((sh,si)=>{sh.parts.forEach((a,i)=>{ok(a.x>=0&&a.y>=0&&a.x+a.l<=S.sheetL-2*S.trim+.01&&a.y+a.w<=S.sheetW-2*S.trim+.01,`${tag}: деталь ${a.name} за краем листа ${si+1}`);
     sh.parts.slice(i+1).forEach(c=>{const ov=a.x<c.x+c.l+S.kerf-.01&&c.x<a.x+a.l+S.kerf-.01&&a.y<c.y+c.w+S.kerf-.01&&c.y<a.y+a.w+S.kerf-.01;ok(!ov,`${tag}: пересечение ${a.name} и ${c.name} на листе ${si+1}`)})})}));
   const placed=[cl,ch].reduce((a,res)=>a+res.sheets.reduce((q,sh)=>q+sh.parts.length,0)+res.over.length,0),need=r.parts.reduce((a,x)=>a+x.qty,0);
   eq(placed,need,`${tag}: все детали в раскрое`,0);
   const k=M.costs(base(),S,r,cl,ch);ok(k.price>=k.self&&k.self>=k.mat&&k.mat>0,`${tag}: смета`);
   eq(k.rows.reduce((a,x)=>a+x[1]*x[3],0),k.mat,`${tag}: сумма строк сметы`,0.5)};

 // ---- шкафы распашные прямые
 for(const W of [800,1200,1500,1800,2100,2400,3000])for(const n of [1,2,3,4,5])for(const pl of [0,80]){
   const p=base();p.W=W;p.plinth=pl;p.sections=Array.from({length:n},()=>({shelves:3,rod:false,drawers:1,baskets:1}));p.mirrors=0;
   const r=M.calc(p,S),w=r.wings[0],tag=`шкаф ${W} ${n}с цок${pl}`;
   if(w.ws.some(x=>x<150))continue;
   eq(w.ws.reduce((a,b)=>a+b,0)+(n-1)*t+2*t,W,tag+' сумма секций');
   const ds=[...w.doors].sort((a,b)=>a.x-b.x);
   eq(ds[0].x,2,tag+' зазор слева');eq(ds.at(-1).x+ds.at(-1).w,W-2,tag+' зазор справа');
   for(let i=1;i<ds.length;i++)eq(ds[i].x-(ds[i-1].x+ds[i-1].w),3,tag+' зазор между дверями');
   for(let i=1;i<n;i++){const c=w.xs[i]-t/2,last=ds.filter(d=>d.sec===i-1).at(-1),first=ds.find(d=>d.sec===i);eq((last.x+last.w+first.x)/2,c,tag+` стык дверей на перегородке ${i}`)}
   ds.forEach(d=>eq(d.h,p.H-pl-4,tag+' высота двери'));
   const part=r.parts.find(x=>x.name==='Перегородка');if(n>1)eq(part.L+2*t+pl,p.H,tag+' высота перегородки');
   const fac=r.parts.filter(x=>x.name==='Ящик: фасад');fac.forEach(f=>ok(w.ws.some(sw=>Math.abs(f.L-(sw-2*t-4))<1),tag+' фасад ящика между проставками'));
   sanity(r,tag)}
 // ---- купе
 for(const W of [1200,1600,2000,2400,3000])for(const cn of [0,2,3,4]){const p=base();p.type='coupe';p.W=W;p.coupeN=cn;p.D=600;p.sections=[{shelves:3,rod:false,drawers:0,baskets:0},{shelves:0,rod:true,drawers:0,baskets:0}];
   const r=M.calc(p,S),w=r.wings[0],cd=w.coupeD,tag=`купе ${W} дв${cn}`;
   ok(Math.abs(cd.n*cd.w-(cd.n-1)*25-cd.ow)<=cd.n,tag+` двери закрывают проём: ${cd.n}×${cd.w}−перехлёст vs ${cd.ow}`);
   eq(cd.h,p.H-p.plinth-2*t-40,tag+' высота двери купе',0.5);
   eq(w.ws.reduce((a,b)=>a+b,0)+t*(w.ws.length+1),W,tag+' сумма секций');sanity(r,tag)}
 // ---- угловые распашные
 for(const side of ['L','R'])for(const [W,W2,nA,nB] of [[1800,1400,3,2],[2400,1600,3,2],[2000,1200,2,1],[1600,1600,2,2]]){
   const p=base();p.shape='corner';p.cornerSide=side;p.W=W;p.W2=W2;p.mirrors=0;
   p.sections=Array.from({length:nA},()=>({shelves:3,rod:false,drawers:0,baskets:0}));p.sectionsB=Array.from({length:nB},()=>({shelves:3,rod:false,drawers:0,baskets:0}));
   const r=M.calc(p,S),[A,B]=r.wings,tag=`угол ${side} ${W}×${W2}`;
   eq(B.W,W2-p.D-20,tag+' длина стороны Б');
   eq(A.ws.reduce((a,b)=>a+b,0)+t*(nA+1),W,tag+' сумма секций А');eq(B.ws.reduce((a,b)=>a+b,0)+t*(nB+1),B.W,tag+' сумма секций Б');
   const ds=[...A.doors].sort((a,b)=>a.x-b.x),blk=p.D+60;
   if(side==='L'){eq(ds[0].x,blk+3,tag+' первая дверь А после планки');eq(ds.at(-1).x+ds.at(-1).w,W-2,tag+' край А')}
   else{eq(ds.at(-1).x+ds.at(-1).w,W-blk-3,tag+' последняя дверь А до планки');eq(ds[0].x,2,tag+' край А')}
   const cornerDoors=A.doors.filter(d=>d.sec===(side==='L'?0:nA-1));
   if(cornerDoors.length===1)ok(cornerDoors[0].hinge===(side==='L'?'R':'L'),tag+' петли угловой двери от угла');
   eq(cornerDoors.reduce((a,d)=>a+d.w,0)+3*(cornerDoors.length-1),450-4.5,tag+' проём угловой двери');
   for(let i=1;i<nA;i++){const c=A.xs[i]-t/2,last=ds.filter(d=>d.sec===i-1).at(-1),first=ds.find(d=>d.sec===i);if(last&&first)eq((last.x+last.w+first.x)/2,c,tag+` стык А на перегородке ${i}`)}
   const dB=[...B.doors].sort((a,b)=>a.x-b.x);for(let i=1;i<nB;i++){const c=B.xs[i]-t/2,last=dB.filter(d=>d.sec===i-1).at(-1),first=dB.find(d=>d.sec===i);eq((last.x+last.w+first.x)/2,c,tag+` стык Б на перегородке ${i}`)}
   ok(r.parts.filter(x=>x.name==='Доборная планка').reduce((a,x)=>a+x.qty,0)===2,tag+' две доборные планки');
   sanity(r,tag)}
 // ---- угловой купе
 {const p=base();p.shape='corner';p.type='coupe';p.W=2400;p.W2=1600;const r=M.calc(p,S);eq(r.wings[1].W,1600-p.D,'угол купе длина Б');ok(r.parts.some(x=>x.name==='Стойка проёма купе'),'угол купе стойка');sanity(r,'угол купе')}
 // ---- кухня
 for(const baseH of [720,760,820])for(const n of [1,2,3,4,5]){const p=base();p.kind='kitchen';p.k.baseH=baseH;p.k.base=[{type:'drawers',w:600,shelves:0,drawers:n},{type:'oven',w:600,shelves:0,drawers:3},{type:'doors',w:450,shelves:1,drawers:3},{type:'tall',w:600,shelves:4,drawers:3}];
   const r=M.calc(p,S),tag=`кухня ${baseH} ящ${n}`,h=baseH;
   const fh=r.parts.filter(x=>x.name==='Фасад ящика'&&x.L===596);eq(fh.reduce((a,x)=>a+x.qty*x.Wd,0)+3*(n-1),h-4,tag+' фасады ящиков по высоте',n*1);
   const ov=r.parts.find(x=>x.name==='Фальш-фасад под духовкой');const shelfTop=2+ov.Wd+2;eq((h-t)-shelfTop,600,tag+' ниша духовки в свету',0.6);ok((h-t)-shelfTop>=595,tag+' ниша ≥ 595');
   const box=r.parts.filter(x=>x.name==='Ящик: перед и зад'&&x.L===600-2*t-26-2*t);ok(box.length>0,tag+' ширина ящика под направляющие 12,5 мм');
   const tallF=r.parts.filter(x=>x.name==='Фасад'&&x.Wd===596);ok(tallF.length>0,tag+' фасад пенала');
   sanity(r,tag)}
 {const p=base();p.kind='kitchen';const r=M.calc(p,S);sanity(r,'кухня по умолчанию');
   ok(r.hw.some(h=>h[0].startsWith('Столешница')&&Math.abs(h[1]-2.4)<.01),'столешница 2,4 м');
   ok(r.hw.some(h=>h[0].startsWith('Цоколь кухонный')&&Math.abs(h[1]-2.4)<.01),'цоколь 2,4 м')}
 // ---- комоды
 for(const W of [450,800,1200,1600])for(const n of [1,2,3,4])for(const H of [500,850,1000]){const p=base();p.kind='chest';p.c={W,H,D:450,plinth:60,cols:Array.from({length:n},(_,i)=>({type:['drawers','door','open'][i%3],drawers:3,shelves:2}))};
   const r=M.calc(p,S),tag=`комод ${W}×${H} ${n}к`;if(r.colWs.some(x=>x<150))continue;
   eq(r.colWs.reduce((a,b)=>a+b,0)+t*(n+1),W,tag+' сумма колонок');
   eq(r.fz+p.c.plinth+t+3,H,tag+' высота фасада');
   eq(r.fr[0].x,2,tag+' зазор слева');eq(r.fr.at(-1).x+r.fr.at(-1).w,W-2,tag+' зазор справа');
   for(let i=1;i<n;i++)eq((r.fr[i-1].x+r.fr[i-1].w+r.fr[i].x)/2,r.xs[i]-t/2,tag+` стык фасадов на перегородке ${i}`);
   eq(r.parts.find(x=>x.name==='Боковина').L+t,H,tag+' боковина под крышкой');
   sanity(r,tag)}

 // ---- задняя стенка: стыки только на перегородках
 for(const W of [1800,2100,2400,2700,3000,3600])for(const n of [1,2,3,4,5]){const p=base();p.W=W;p.mirrors=0;p.sections=Array.from({length:n},()=>({shelves:2,rod:false,drawers:0,baskets:0}));
   for(const type of ['swing','coupe']){p.type=type;const r=M.calc(p,S),w=r.wings[0],tag=`задняя ${type} ${W} ${n}с`;if(w.ws.some(x=>x<150))continue;
     const backs=[];r.parts.filter(x=>x.name==='Задняя стенка').forEach(x=>{for(let i=0;i<x.qty;i++)backs.push(x.Wd)});
     const plank=r.parts.some(x=>x.name==='Планка под стык ХДФ');
     ok(backs.every(b=>b<=S.sheetL-2*S.trim),tag+' кусок влезает в лист');
     if(!plank&&backs.length>1){const raw=r.wings[0];let acc=0;const centers=raw.xs.slice(1).map(x=>x-t/2-2);
       // восстановим реальные (не округлённые) стыки по порядку
       ok(Math.abs(backs.reduce((a,b)=>a+b,0)+2*(backs.length-1)-(W-4))<=backs.length,tag+' стенка закрывает всю ширину');
       let pos=0;const order=r.parts.filter(x=>x.name==='Задняя стенка');
       ok(backs.length-1<=centers.length,tag+' стыков не больше, чем перегородок')
       const pcs=w.bk.cutsAt;let q=0;for(let i=0;i<pcs.length-1;i++){q+=pcs[i];const jc=q+1;ok(centers.some(c=>Math.abs(c-jc)<.01),tag+` стык ХДФ №${i+1} на перегородке (${jc.toFixed(1)})`);q+=2}
       eq(pcs.reduce((a,b)=>a+b,0)+2*(pcs.length-1),W-4,tag+' куски + зазоры = ширина')}
     if(backs.length===1)eq(backs[0],W-4,tag+' стенка целиком',0.5)}}
 // ---- петли: накладные на боковинах, полунакладные на перегородках
 for(const n of [1,2,3,4]){const p=base();p.W=600*n;p.mirrors=0;p.sections=Array.from({length:n},()=>({shelves:2,rod:false,drawers:0,baskets:0}));
   const r=M.calc(p,S),ds=r.wings[0].doors,hc=h=>h<=1000?2:h<=1500?3:h<=2000?4:5;
   const over=r.hw.find(h=>h[0].startsWith('Петля накладная'))?.[1]||0,half=r.hw.find(h=>h[0].startsWith('Петля полунакладная'))?.[1]||0;
   eq(over+half,ds.length*hc(ds[0].h),`петли ${n}с всего`,0);
   const expOuter=ds.filter(d=>{const bx=d.hinge==='L'?d.x:d.x+d.w;return bx<5||bx>p.W-5}).length*hc(ds[0].h);eq(over,expOuter,`петли ${n}с накладные`,0);
   if(n>=3)ok(half>0,`петли ${n}с: есть полунакладные`)}
 // ---- проставки глубиной с направляющую
 {const p=base();p.sections=[{shelves:1,rod:false,drawers:2,baskets:1},{shelves:3,rod:false,drawers:0,baskets:0}];const r=M.calc(p,S),spc=r.parts.find(x=>x.name.startsWith('Проставка'));
   eq(spc.L,600,'проставка высота = 3×200');eq(spc.Wd,500,'проставка глубина = направляющая 500')}
 // ---- верхние кухонные: кромка на нижнем торце боковины
 {const p=base();p.kind='kitchen';const r=M.calc(p,S);ok(r.parts.some(x=>x.name==='Боковина'&&x.L===720&&x.Wd===300&&x.eW===1),'боковина верхнего модуля с кромкой снизу')}
 // ---- комод на ножках: общая высота сохраняется
 for(const legs of [0,100,150])for(const pl of [0,60]){const p=base();p.kind='chest';p.c={W:800,H:850,D:450,plinth:pl,legs,cols:[{type:'drawers',drawers:4,shelves:0},{type:'door',drawers:0,shelves:2}]};
   const r=M.calc(p,S),tag=`комод ножки${legs} цоколь${pl}`,side=r.parts.find(x=>x.name==='Боковина');
   eq(side.L+t+legs,850,tag+' высота с ножками');eq(r.fz+(legs?0:pl)+t+3+legs,850,tag+' фасады по высоте');
   ok(r.hw.some(h=>h[0].startsWith('Эксцентриковая')),tag+' крышка на эксцентриках');
   if(legs)ok(r.hw.some(h=>h[0].startsWith('Ножка')),tag+' ножки в смете');sanity(r,tag)}
 return{checks,fails};
});
console.log('Проверок:',res.checks,'Ошибок:',res.fails.length);[...new Set(res.fails)].slice(0,40).forEach(f=>console.log(' -',f));console.log('js errors',errs);await b.close();})();
