const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(()=>{
 const M=window.ShkafMaster,S=M.settings(),t=S.t,S_cat=(k,id)=>S.cat[k].find(x=>x.id===id),S_mat=(k,id)=>S.mat[k].find(x=>x.id===id),fails=[];let checks=0;
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
   const ADD=cd.sys.addN&&cd.sys.addN[cd.n]!==undefined?cd.sys.addN[cd.n]:cd.sys.ov*({2:1,3:2,4:2,5:4}[cd.n]);ok(cd.add===ADD,tag+' сумма перехлёстов '+cd.add+' ≠ '+ADD);const last=cd.items[cd.n-1];ok(last.x+last.w<=cd.ow+cd.items[0].x+0.01&&cd.ow+cd.items[0].x-(last.x+last.w)<cd.n,tag+' последняя дверь доходит до края проёма');
   ok(cd.n*cd.w-ADD<=cd.ow&&cd.ow-(cd.n*cd.w-ADD)<cd.n,tag+` двери закрывают проём: ${cd.n}×${cd.w}−перехлёст vs ${cd.ow}`);
   eq(cd.h,p.H-p.plinth-2*t-40,tag+' высота двери купе',0.5);
   eq(w.ws.reduce((a,b)=>a+b,0)+t*(w.ws.length+1),W,tag+' сумма секций');sanity(r,tag)}
 // ---- угловые распашные
 for(const side of ['L','R'])for(const [W,W2,nA,nB] of [[1800,1400,3,2],[2400,1600,3,2],[2000,1200,2,1],[1600,1600,2,2]]){
   const p=base();p.shape='corner';p.cornerSide=side;p.W=W;p.W2=W2;p.mirrors=0;
   p.sections=Array.from({length:nA},()=>({shelves:3,rod:false,drawers:0,baskets:0}));p.sectionsB=Array.from({length:nB},()=>({shelves:3,rod:false,drawers:0,baskets:0}));
   const r=M.calc(p,S),[A,B]=r.wings,tag=`угол ${side} ${W}×${W2}`;
   eq(B.W,W2-p.D-(t+4),tag+' длина стороны Б');
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

 // ---- у каждой двери петли на боковине или перегородке (шкафы прямые, угловые, комоды)
 {const sup=(list,x)=>list.some(s=>Math.abs(s-x)<=3.1);
  for(const W of [600,900,1200,1500,1800,2100,2400,3000])for(const n of [1,2,3,4,5,6]){const p=base();p.W=W;p.mirrors=0;p.sections=Array.from({length:n},()=>({shelves:2,rod:false,drawers:0,baskets:0}));
    const w=M.calc(p,S).wings[0];if(w.ws.some(x=>x<150))continue;const S0=[0,W,...w.xs.slice(1).map(x=>x-t/2)];
    w.doors.forEach(d=>ok(sup(S0,d.hinge==='L'?d.x:d.x+d.w),`шкаф ${W} ${n}с: петли двери без стенки`))}
  for(const side of ['L','R'])for(const W of [1200,1800,2400,3000])for(const W2 of [1000,1400,2000])for(const nA of [1,2,3,4])for(const nB of [1,2,3])for(const co of [300,450,600]){
    const p=base();p.shape='corner';p.cornerSide=side;p.W=W;p.W2=W2;p.cornerOpen=co;p.mirrors=0;
    p.sections=Array.from({length:nA},()=>({shelves:2,rod:false,drawers:0,baskets:0}));p.sectionsB=Array.from({length:nB},()=>({shelves:2,rod:false,drawers:0,baskets:0}));
    M.calc(p,S).wings.forEach(w=>{const S0=[0,w.W,...w.xs.slice(1).map(x=>x-t/2)];const ci=w.blk.w?(w.blk.side==='L'?0:w.sections.length-1):-1;
      w.doors.forEach(d=>ok(sup(S0,d.hinge==='L'?d.x:d.x+d.w),`угол ${side} ${W}×${W2} А${nA}Б${nB}: петли без стенки`));
      if(ci>=0)ok(w.doors.filter(d=>d.sec===ci).length<=1,`угол ${side} ${W}×${W2}: у угловой секции одна дверь`)})}
  for(const W of [450,800,1200,1600,2000])for(const n of [1,2,3,4]){const p=base();p.kind='chest';p.c={W,H:850,D:450,plinth:60,legs:0,cols:Array.from({length:n},()=>({type:'door',drawers:0,shelves:2}))};
    const r=M.calc(p,S);const S0=[0,W,...r.xs.slice(1).map(x=>x-t/2)];
    r.fr.forEach((f,i)=>{const nd=f.w>600?2:1,dw=(f.w-3*(nd-1))/nd;for(let j=0;j<nd;j++){const dx=f.x+j*(dw+3),left=nd===2?j===0:i<n/2;ok(sup(S0,left?dx:dx+dw),`комод ${W} ${n}к: петли дверцы без стенки`)}})}}
 // ---- петли на зеркальных и высоких дверях
 {const p=base();p.mirrors=3;const r=M.calc(p,S);const tot=r.hw.filter(h=>h[0].startsWith('Петля')).reduce((a,h)=>a+h[1],0);eq(tot,3*6,'петли: 3 зеркальные двери 2316 мм по 6');
  const p2=base();p2.H=2700;p2.mirrors=0;const r2=M.calc(p2,S);eq(r2.hw.filter(h=>h[0].startsWith('Петля')).reduce((a,h)=>a+h[1],0),3*6,'петли: дверь 2616 мм — по 6')}

 // ---- каталог: системы купе
 {const ow0=(p)=>p.W-2*t;
  for(const id of ['std','aristo','absolut'])for(const W of [1600,2400,3000])for(const n of [2,3]){const p=base();p.type='coupe';p.W=W;p.D=600;p.coupeN=n;p.hw.coupe=id;p.sections=[{shelves:2,rod:false,drawers:0,baskets:0},{shelves:2,rod:false,drawers:0,baskets:0}];
    const r=M.calc(p,S),cd=r.wings[0].coupeD,sys=S_cat('coupe',id),innerH=p.H-p.plinth-2*t;
    eq(cd.w,Math.floor((ow0(p)+(sys.addN&&sys.addN[n]!==undefined?sys.addN[n]:sys.ov*({2:1,3:2,4:2,5:4}[n])))/n),`купе ${id} ${W} ${n}дв ширина двери`,0);eq(cd.h,Math.floor(innerH-sys.dh),`купе ${id} высота двери`,0)}
  {const p=base();p.type='coupe';p.W=1532;p.D=600;p.coupeN=2;p.hw.coupe='absolut';const cd=M.calc(p,S).wings[0].coupeD;eq(cd.w,Math.floor((1500+21)/2),'ABSOLUT по инструкции: (проём+21)/2',0)}}
 // ---- каталог: Blum скрытого монтажа (LW−42, NL−10)
 {const p=base();p.hw.slide='blum';p.sections=[{shelves:1,rod:false,drawers:2,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];const r=M.calc(p,S),w=r.wings[0],op=w.ws[0]-2*t;
  ok(r.parts.some(x=>x.name==='Ящик: перед и зад'&&Math.abs(x.L-(op-42))<=0.5),'Blum: перед/зад = проём − 42');
  ok(r.parts.some(x=>x.name==='Ящик: боковина'&&x.L===500-10),'Blum: боковина = направляющая − 10');
  ok(r.parts.some(x=>x.name.startsWith('Ящик: дно (ЛДСП')&&x.L===490&&Math.abs(x.Wd-(op-42))<=0.5),'Blum: дно ЛДСП (NL−10)×(проём−42)');
  ok(!r.warn.some(x=>x.lvl==='err'),'Blum 16 мм: без ошибок');
  const S18=JSON.parse(JSON.stringify(S));S18.t=18;S18.cat=S.cat;const r18=M.calc(p,S18);ok(r18.warn.some(x=>x.lvl==='err'&&/до 16 мм/.test(x.t)),'Blum при ЛДСП 18: ошибка')}
 {const p=base();p.kind='chest';p.hw.slide='blum';p.c={W:800,H:850,D:450,plinth:60,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}]};const r=M.calc(p,S);
  ok(r.parts.some(x=>x.name==='Ящик: перед и зад'&&Math.abs(x.L-(r.colWs[0]-42))<=0.5),'Blum комод: перед/зад = проём − 42')}
 // ---- стены
 {const p=base();p.mirrors=0;p.walls.L=true;p.sections=[{shelves:3,rod:false,drawers:0,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];
  const w=M.calc(p,S).wings[0];ok(w.doors.find(d=>d.sec===0).hinge==='R','стена слева: дверь крайней секции висит справа');
  p.walls.R=true;const w2=M.calc(p,S).wings[0];ok(w2.doors.find(d=>d.sec===2).hinge==='L','стена справа: дверь крайней секции висит слева')}
 {const p=base();p.W=2400;p.mirrors=0;p.walls.L=true;p.sections=[{shelves:1,rod:false,drawers:2,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];
  const r=M.calc(p,S);ok(r.wings[0].doors.filter(d=>d.sec===0).length===2,'секция 800: две двери');ok(r.warn.some(x=>x.lvl==='err'&&/у стены/.test(x.t)),'две двери у стены + ящики: ошибка')}
 // ---- ручки
 {const p=base();p.shape='corner';p.mirrors=0;S_cat('handles','r128').proj=50;const r=M.calc(p,S);ok(r.warn.some(x=>x.lvl==='err'&&/заденут ручки/.test(x.t)),'угол: ручка 50 мм — ошибка');S_cat('handles','r128').proj=35;
  const r2=M.calc(p,S);ok(!r2.warn.some(x=>/заденут ручки/.test(x.t)),'угол: ручка 35 мм — без ошибки')}
 {const mk=(D,hid)=>{const p=base();p.D=D;p.hw.handleIn=hid;p.sections=[{shelves:1,rod:false,drawers:2,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];return M.calc(p,S)};
  ok(!mk(560,'r96').warn.some(x=>/дверь упрётся в ручку/.test(x.t)),'глубина 560, скоба 35: ручка помещается');
  ok(mk(530,'r96').warn.some(x=>x.lvl==='err'&&/дверь упрётся в ручку/.test(x.t)),'глубина 530, скоба 35: ошибка');
  ok(!mk(530,'flush').warn.some(x=>/дверь упрётся в ручку/.test(x.t)),'глубина 530, врезная: без ошибки')}
 {const p=base();p.kind='chest';p.hw.handle='r320';p.c={W:380,H:850,D:450,plinth:60,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}]};
  ok(M.calc(p,S).warn.some(x=>x.lvl==='err'&&/не помещается на фасад/.test(x.t)),'ручка 360 мм на фасад 376: ошибка')}
 {const p=base();p.kind='chest';p.hw.handle='r320';p.c={W:450,H:850,D:450,plinth:60,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}]};ok(!M.calc(p,S).warn.some(x=>/не помещается на фасад/.test(x.t)),'ручка 360 мм на фасад 446: помещается')}
 {const p=base();p.D=480;p.sections=[{shelves:1,rod:true,drawers:0,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];ok(M.calc(p,S).warn.some(x=>/плечики/.test(x.t)),'штанга при глубине 480: предупреждение')}

 // ---- КДМ: зазор между дверями на перегородке 4 мм
 {const p=base();p.mirrors=0;p.hw.hinge='kdm';const w=M.calc(p,S).wings[0],ds=[...w.doors].sort((a,b)=>a.x-b.x);
  for(let i=1;i<ds.length;i++){const g=ds[i].x-(ds[i-1].x+ds[i-1].w),onPart=ds[i].sec!==ds[i-1].sec;eq(g,onPart?4:3,`КДМ: зазор ${onPart?'на перегородке 4':'в секции 3'} мм`)}
  for(let i=1;i<3;i++){const c=w.xs[i]-t/2,l=ds.filter(d=>d.sec===i-1).at(-1),f=ds.find(d=>d.sec===i);eq((l.x+l.w+f.x)/2,c,`КДМ: стык на центре перегородки ${i}`)}
  eq(ds[0].x,2,'КДМ: край 2 мм');eq(ds.at(-1).x+ds.at(-1).w,p.W-2,'КДМ: край справа 2 мм');
  const r=M.calc(p,S);ok(r.hw.some(h=>/КДМ/.test(h[0])&&/полунакладная/.test(h[0])),'КДМ в смете')}
 {const p=base();p.kind='chest';p.hw.hinge='kdm';p.c={W:1200,H:850,D:450,plinth:60,legs:0,cols:[{type:'door',drawers:0,shelves:2},{type:'door',drawers:0,shelves:2},{type:'door',drawers:0,shelves:2}]};const r=M.calc(p,S);
  for(let i=1;i<3;i++){eq(r.fr[i].x-(r.fr[i-1].x+r.fr[i-1].w),4,'КДМ комод: зазор 4');eq((r.fr[i-1].x+r.fr[i-1].w+r.fr[i].x)/2,r.xs[i]-t/2,'КДМ комод: стык на перегородке')}}

 // ---- все направляющие скрытого монтажа: формулы по инструкциям
 for(const [id,dW,dL,maxT] of [['boyard',42,10,16],['samet',45,10,18],['quadroyou',42,10,16],['quadro',40,0,16],['blum',42,10,16]]){
   const sys=S_cat('slides',id);eq(sys.dW,dW,`${id}: вычет по ширине`,0);eq(sys.dL,dL,`${id}: вычет по длине`,0);eq(sys.maxT,maxT,`${id}: боковины до`,0);
   for(const kind of ['wardrobe','chest','kitchen']){const p=base();p.kind=kind;p.hw.slide=id;
     if(kind==='wardrobe')p.sections=[{shelves:1,rod:false,drawers:2,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];
     if(kind==='chest')p.c={W:800,H:850,D:450,plinth:60,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}]};
     const r=M.calc(p,S),fb=r.parts.filter(x=>x.name==='Ящик: перед и зад'),sd=r.parts.filter(x=>x.name==='Ящик: боковина');
     const op=kind==='wardrobe'?r.wings[0].ws[0]-2*t:kind==='chest'?r.colWs[0]:400-2*t;
     ok(fb.some(x=>Math.abs(x.L-(op-dW))<=0.5),`${id} ${kind}: перед/зад = проём − ${dW}`);
     const sl=kind==='wardrobe'?r.wings[0].slide:null;if(sl){ok(sd.some(x=>x.L===sl-dL),`${id}: боковина = направляющая − ${dL}`);ok(sl+(sys.minD||0)<=p.D,`${id}: глубина корпуса ≥ длина + ${sys.minD}`)}
     ok(!r.warn.some(x=>x.lvl==='err'&&/рассчитаны на боковины/.test(x.t)),`${id} ${kind}: при ЛДСП 16 нет ошибки`)}}
 {const S18=JSON.parse(JSON.stringify(S));S18.t=18;const mk=id=>{const p=base();p.hw.slide=id;p.sections=[{shelves:1,rod:false,drawers:2,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];return M.calc(p,S18)};
  ok(!mk('samet').warn.some(x=>/рассчитаны на боковины/.test(x.t)),'Samet при ЛДСП 18: допустимо');
  ok(mk('boyard').warn.some(x=>x.lvl==='err'&&/до 16 мм/.test(x.t)),'Boyard при ЛДСП 18: ошибка')}
 // ---- у каждой петли из каталога стыки на перегородках, петли на стенках
 for(const h of S.cat.hinges){const p=base();p.mirrors=0;p.hw.hinge=h.id;const w=M.calc(p,S).wings[0],ds=[...w.doors].sort((a,b)=>a.x-b.x);
   for(let i=1;i<3;i++){const c=w.xs[i]-t/2,l=ds.filter(d=>d.sec===i-1).at(-1),f=ds.find(d=>d.sec===i);eq((l.x+l.w+f.x)/2,c,`${h.id}: стык на перегородке`);eq(f.x-(l.x+l.w),h.gap,`${h.id}: зазор на перегородке ${h.gap}`)}
   ok(M.calc(p,S).hw.some(x=>x[0].includes(h.name)),`${h.id}: в смете`)}

 // ---- материалы фасадов
 {const p=base();p.mirrors=0;p.mat.front='mdfmat';const r=M.calc(p,S),fr=r.parts.filter(x=>x.group==='Фасады');
  ok(fr.length&&fr.every(x=>x.mat==='order'&&x.eL===0&&x.eW===0),'МДФ: фасады идут в заказ, без кромки');
  ok(!r.parts.some(x=>x.mat==='ldsp'&&x.group==='Фасады'),'МДФ: фасадов нет в раскрое ЛДСП');
  const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true),k=M.costs(p,S,r,cl,ch,null);
  const area=fr.reduce((a,x)=>a+x.qty*x.L*x.Wd/1e6,0);ok(k.rows.some(x=>/Фасады на заказ/.test(x[0])&&Math.abs(x[1]-+area.toFixed(2))<0.011&&x[3]===S_mat('fronts','mdfmat').price),'МДФ: площадь и цена в смете');
  const p0=base();p0.mirrors=0;const r0=M.calc(p0,S);ok(r.edgeM<r0.edgeM,'МДФ: кромки меньше, чем с фасадами ЛДСП');
  ok(r.wings[0].doors.every(d=>Math.abs(d.h-(p.H-p.plinth-4))<0.01),'МДФ: размеры дверей те же')}
 {const p=base();p.mirrors=0;p.mat.front='ldsp';p.mat.frontDecor='white';const r=M.calc(p,S);
  ok(r.parts.filter(x=>x.group==='Фасады').every(x=>x.mat==='ldspF'&&x.eL===2),'ЛДСП другого декора: отдельная пачка, кромка 2 мм');
  const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),cf=M.pack(r.parts.filter(x=>x.mat==='ldspF'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true);
  ok(M.costs(p,S,r,cl,ch,cf).rows.some(x=>/ЛДСП фасадов/.test(x[0])&&x[1]===cf.sheets.length),'ЛДСП другого декора: листы в смете')}
 // ---- угол с толстыми фасадами: сторона Б сдвигается на фасад + 4
 {const p=base();p.shape='corner';p.mirrors=0;p.mat.front='mdfmat';const r=M.calc(p,S);eq(r.wings[1].W,p.W2-p.D-(19+4),'угол, фасад 19: сторона Б короче на 23')}
 // ---- столешницы
 {const mk=(top,len,front)=>{const p=base();p.kind='kitchen';p.mat.top=top;if(front)p.mat.front=front;p.k.base=[{type:'doors',w:len-600,shelves:1,drawers:3},{type:'drawers',w:600,shelves:0,drawers:3}];return M.calc(p,S)};
  const a=mk('pf38',3200);ok(a.hw.some(h=>/Столешница/.test(h[0])&&Math.abs(h[1]-3.2)<.001&&h[3]===S_mat('tops','pf38').price),'столешница 3,2 м по цене постформинга 38');
  ok(a.hw.some(h=>/соединительная/.test(h[0])&&h[1]===1),'3200 > 3050: одна соединительная планка');ok(a.warn.some(x=>/стык/.test((x.t||x))),'3200: предупреждение о стыке');
  ok(!mk('pf38l',3200).hw.some(h=>/соединительная/.test(h[0])),'4200: без стыка');ok(!mk('stone',3200).hw.some(h=>/Планка/.test(h[0])),'камень: без планок');
  eq(mk('pf26',2400).tT,26,'толщина столешницы 26');
  const p=base();p.kind='kitchen';p.k.baseD=580;p.mat.front='mdf22';ok(M.calc(p,S).warn.some(x=>x.lvl==='err'&&/не закроет фасады/.test(x.t)),'корпус 580 + фасад 22: столешница 600 не закроет')}
 // ---- толщина фасада под петли
 {const p=base();p.mirrors=0;p.mat.front='custom';S_mat('fronts','custom').t=26;p.hw.hinge='gtv';ok(M.calc(p,S).warn.some(x=>x.lvl==='err'&&/рассчитаны на фасады/.test(x.t)),'фасад 26 мм и петли до 24: ошибка');
  p.hw.hinge='kdm';ok(M.calc(p,S).warn.some(x=>x.lvl==='err'&&/14–25/.test(x.t)),'фасад 26 мм и КДМ 14–25: ошибка');S_mat('fronts','custom').t=19;
  p.mat.front='mdf22';p.hw.hinge='gtv';ok(!M.calc(p,S).warn.some(x=>/рассчитаны на фасады/.test(x.t)),'фасад 22 мм и петли до 24: нормально')}
 // ---- корпус Lamarty 2750×1830
 {const p=base();p.mat.body='lamarty16';const E=M.effSettings(p);eq(E.sheetL,2750,'Lamarty: длина листа');eq(E.sheetW,1830,'Lamarty: ширина листа');
  const r=M.calc(p,E),cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),E,false);ok(cl.sheets.every(sh=>sh.parts.every(a=>a.x+a.l<=2750-2*E.trim+.01&&a.y+a.w<=1830-2*E.trim+.01)),'Lamarty: раскрой в лист 2750×1830');
  const p2=base();p2.mat.body='egger18';eq(M.effSettings(p2).t,18,'Egger 18: толщина 18')}
 // ---- кромка: толщины 0,4 / 0,8 / 1 / 2 мм, отдельно фасады и корпус
 {const p=base();eq(+p.mat.edgeF,1,'новый заказ: кромка фасадов 1 мм');eq(+p.mat.edgeB,0.8,'новый заказ: кромка корпуса 0,8 мм');p.mirrors=0;
  const r=M.calc(p,S),ids=r.edges.map(e=>e.id).join(',');ok(ids==='0.8,1','по умолчанию две кромки: '+ids);
  eq(r.edges.reduce((a,e)=>a+e.m,0),r.edgeM,'кромка: сумма толщин = общая длина',0.001);
  r.parts.forEach(x=>{const fr=x.group==='Фасады'||/фасад|Крышка/i.test(x.name);ok((x.eL||x.eW)?x.eT===(fr?'1':'0.8'):x.eT==='',`кромка детали ${x.name}: ${x.eT}`)});
  const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true),k=M.costs(p,S,r,cl,ch);
  const r08=k.rows.find(x=>x[0]==='Кромка ПВХ 0,8 мм'),r1=k.rows.find(x=>x[0]==='Кромка ПВХ 1 мм');
  ok(r08&&r08[3]===S.p.edge08&&Math.abs(r08[1]-r.edges[0].m)<0.06,'смета: строка кромки 0,8 мм по своей цене');ok(r1&&r1[3]===S.p.edge1,'смета: строка кромки 1 мм по своей цене');
  ok(!k.rows.some(x=>x[0]==='Кромка ПВХ 2 мм'),'смета: нет лишней кромки 2 мм');
  const p2=base();p2.mirrors=0;p2.mat.edgeF='2';p2.mat.edgeB='2';const r2=M.calc(p2,S);ok(r2.edges.length===1&&r2.edges[0].id==='2','2 мм везде: одна кромка');eq(r2.edgeM,r.edgeM,'толщина не меняет длину кромки',0.001);
  const p3=base();p3.mirrors=0;p3.mat.edgeF='0.8';const r3=M.calc(p3,S);ok(r3.edges.length===1&&r3.edges[0].id==='0.8','0,8 мм везде: одна кромка');
  const p4=base();p4.mirrors=0;p4.mat.front='mdfpvc';const r4=M.calc(p4,S);ok(r4.edges.every(e=>e.id==='0.8'),'фасады МДФ: только кромка корпуса');
  const pc=base();pc.kind='chest';pc.mat.front='mdfpvc';M.norm(pc);const rc=M.calc(pc,M.effSettings(pc));const top=rc.parts.find(x=>x.name==='Крышка');ok(top&&top.eT==='0.8','комод с МДФ: крышка с кромкой корпуса');
  const m1=M.norm({...base(),mat:{edge:'mix'}}).mat,m2=M.norm({...base(),mat:{edge:'all2'}}).mat;ok(m1.edgeF==='2'&&m1.edgeB==='0.4'&&m1.edge===undefined,'старый заказ «2 + 0,4» сохранён');ok(m2.edgeF==='2'&&m2.edgeB==='2','старый заказ «2 мм везде» сохранён');
  ok(M.norm({...base(),mat:{edgeF:1,edgeB:'5'}}).mat.edgeF==='1','кромка числом читается');ok(M.norm({...base(),mat:{edgeF:'1',edgeB:'5'}}).mat.edgeB==='1','неизвестная толщина → 1 мм');const pn={...base()};delete pn.mat;const mn=M.norm(pn).mat;ok(mn.edgeF==='2'&&mn.edgeB==='2','заказ без материалов (ранняя версия): кромка 2 мм как было');ok(M.norm({...base(),mat:{body:'krono16'}}).mat.edgeF==='2','материалы без кромки: 2 мм')}

 // ---- присадка: планки на стенке на той же высоте, что чашки на двери
 const nums=s=>(s.match(/-?\d+(?:[.,]\d+)?/g)||[]).map(x=>+x.replace(',','.'));
 for(const [W,n,wl] of [[1800,3,false],[1800,3,true],[2400,3,false],[1200,2,false],[2400,4,true]]){const p=base();p.W=W;p.mirrors=0;p.walls.L=wl;p.sections=Array.from({length:n},()=>({shelves:3,rod:false,drawers:0,baskets:0}));
   const r=M.calc(p,S),w=r.wings[0],dm=M.drillMap(p,S,r),tag=`присадка ${W} ${n}с${wl?' стена':''}`,pl=p.plinth;
   w.doors.forEach((d,k)=>{const g=dm.find(x=>x.name===`Дверь ${k+1}`);ok(!!g,tag+` дверь ${k+1} в списке`);if(!g)return;
     const cupLine=g.lines.find(l=>l.startsWith('Чашки'));const ys=nums(cupLine.split('Y от низа:')[1]);eq(ys.length,(d.h<=2000?4:d.h<=2400?5:6),tag+` дверь ${k+1}: число петель`,0);
     const bx=d.hinge==='L'?d.x:d.x+d.w,side=bx<5||bx>W-5,pi=bx<5?0:bx>W-5?n:w.xs.slice(1).findIndex(x=>Math.abs(x-t/2-bx)<3)+1;
     const pan=dm.find(x=>side?x.name===(pi===0?'Боковина левая':'Боковина правая'):x.name===`Перегородка ${pi}`);
     const exp=ys.map(y=>y+(side?pl+2:2-t));ok(pan&&pan.lines.some(l=>/Планки петель/.test(l)&&exp.every(v=>nums(l.split('Y')[1]).some(z=>Math.abs(z-v)<=0.5))),tag+` дверь ${k+1}: планки на стенке совпадают с чашками`)});
   // на одной перегородке с двух сторон — у второй двери сдвиг 32 мм, винты не встречаются
   for(let i=1;i<n;i++){const pan=dm.find(x=>x.name===`Перегородка ${i}`);if(!pan)continue;const L=pan.lines.filter(l=>/Левая сторона\. Планки/.test(l)),Rr=pan.lines.filter(l=>/Правая сторона\. Планки/.test(l));
     if(L.length&&Rr.length){const a=nums(L[0].split('Y')[1]),b=nums(Rr[0].split('Y')[1]);ok(a.every(v=>b.every(z=>Math.abs(z-v)>=32-0.5)),tag+` перегородка ${i}: планки с двух сторон разнесены ≥ 32 мм`)}}
   // полкодержатели на высоте полок из чертежа
   const sh=dm.find(x=>x.name==='Боковина левая').lines.find(l=>/Полкодержатели/.test(l));ok(!!sh,tag+': полкодержатели на левой боковине')}
 {const p=base();p.W=1800;p.mirrors=0;p.walls.L=true;p.sections=Array.from({length:3},()=>({shelves:3,rod:false,drawers:0,baskets:0}));const r=M.calc(p,S),dm=M.drillMap(p,S,r);
  ok(dm.some(g=>g.lines.some(l=>/сдвинуты на 32/.test(l))),'стена слева: две двери на перегородке 1 — сдвиг 32 мм')}
 {const p=base();const r=M.calc(p,S),dm=M.drillMap(p,S,r),bl=dm.find(x=>x.name==='Боковина левая');ok(bl.lines[0].includes('X 50, 203.5, 356.5, 510'),'конфирматы по глубине 560: 50 / 203,5 / 356,5 / 510')}
 for(const kind of ['kitchen','chest']){const p=base();p.kind=kind;if(kind==='chest')p.c={W:1200,H:850,D:450,plinth:60,legs:0,cols:[{type:'door',drawers:0,shelves:2},{type:'door',drawers:0,shelves:2},{type:'drawers',drawers:3,shelves:0}]};
   const r=M.calc(p,S),dm=M.drillMap(p,S,r);ok(dm.length>3,kind+': присадка есть');ok(dm.some(g=>g.lines.some(l=>/Чашки петель/.test(l))),kind+': чашки петель');ok(dm.some(g=>g.lines.some(l=>/Планки петель/.test(l))),kind+': планки петель');
   dm.forEach(g=>g.lines.forEach(l=>ok(!/NaN|undefined|Infinity/.test(l),kind+': нет пустых чисел: '+g.name)))}
 // ---- шаблоны: встроенные открываются без ошибок
 M.builtinTemplates().forEach(tp=>{const np=M.fromTemplate(tp);const r=M.calc(np,S);ok(!r.warn.some(x=>x.lvl==='err'),`шаблон «${tp.name}»: без ошибок`+(r.warn.filter(x=>x.lvl==='err').map(x=>' — '+x.t).join('')));
   ok(np.client===''&&np.meas.photos.length===0,`шаблон «${tp.name}»: без данных клиента`)});
 // ---- замер
 {const p=base();p.meas.w=['1805','1800','1798'];p.meas.h=['2450','2455',''];const r=M.calc(p,S);
  ok(r.warn.some(x=>x.lvl==='err'&&/Не войдёт по ширине/.test(x.t)&&/1788/.test(x.t)),'замер 1798: шкаф 1800 не войдёт, максимум 1788');
  ok(r.warn.some(x=>x.lvl==='err'&&/Не поднять/.test(x.t)&&/2374/.test(x.t)),'потолок 2450: шкаф 2400 не поднять, максимум 2374');
  p.W=1788;p.H=2374;const r2=M.calc(p,S);ok(!r2.warn.some(x=>/Не войдёт|Не поднять/.test(x.t||x)),'после подгонки 1788×2374: ошибок нет');
  p.meas.w=['1830','1800',''];ok(M.calc(p,S).warn.some(x=>/гуляет на 30/.test(x.t||x)),'завал стен 30 мм: предупреждение')}
 {const p=base();p.kind='kitchen';p.meas.w=['2390','',''];ok(M.calc(p,S).warn.some(x=>x.lvl==='err'&&/нижний ряд/.test(x.t)),'кухня 2400 на стену 2390: ошибка');
  p.meas.w=['2450','',''];p.meas.h=['2000','',''];ok(M.calc(p,S).warn.some(x=>x.lvl==='err'&&/упрутся в потолок/.test(x.t)),'верхние до 2170 при потолке 2000: ошибка')}
 return{checks,fails};
});
console.log('Проверок:',res.checks,'Ошибок:',res.fails.length);[...new Set(res.fails)].slice(0,40).forEach(f=>console.log(' -',f));console.log('js errors',errs);await b.close();})();
