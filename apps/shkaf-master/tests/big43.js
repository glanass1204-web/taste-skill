// Большая независимая проверка: деньги, распил, кромка, петли, 3D против списка деталей, повторяемость.
// Каждое число пересчитывается здесь заново своим способом и сравнивается с тем, что показывает программа.
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html',N=+(process.argv[3]||300),SEED=+(process.argv[4]||7);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(([N,SEED])=>{const M=window.ShkafMaster,fails=[],cnt={};let checks=0;
 const ok=(c,m,g)=>{checks++;cnt[g]=(cnt[g]||0)+1;if(!c)fails.push(m)};
 let seed=SEED>>>0;const rnd=()=>{seed=(seed+0x6D2B79F5)>>>0;let z=seed;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296},pick=a=>a[Math.floor(rnd()*a.length)],int=(a,b)=>a+Math.floor(rnd()*(b-a+1));
 const S0=M.settings(),km=(type,w,sh,dr,ex)=>Object.assign({type,w,shelves:sh||0,drawers:dr||3},ex||{});
 const Hk=M.__hooks,rub=Hk.rub,offerText=Hk.offerText,docText=Hk.docText,supplierLists=Hk.supplierLists,scene3dData=M.scene3dData;let R;
 const nb=s=>String(s).replace(/[  ]/g,' ');
 const rubT=n=>nb(rub(n));
 const sec=()=>({shelves:int(0,5),rod:rnd()>.6,drawers:pick([0,0,1,2]),baskets:pick([0,0,1]),open:rnd()>.8,hooks:pick([0,0,0,3]),seat:rnd()>.85,shoes:int(0,2),trousers:rnd()>.9,shoeOut:pick([0,0,0,1]),led:rnd()>.85,panto:rnd()>.9});
 // своя таблица петель по производителям — независимо от программы
 const HT=(h,m)=>(h<=900?2:h<=1600?3:h<=2000?4:h<=2400?5:6)+(m&&h>900?1:0);
 const orders=[];
 for(let n=0;n<N;n++){const p=M.newProject();const kind=pick(['wardrobe','wardrobe','kitchen','chest']);p.kind=kind;
  p.mat.body=pick(S0.mat.bodies.map(x=>x.id));p.mat.front=pick(S0.mat.fronts.map(x=>x.id));p.mat.top=pick(S0.mat.tops.map(x=>x.id));p.mat.edgeF=pick(['0.4','0.8','1','2']);p.mat.edgeB=pick(['0.4','0.8','1','2']);
  p.hw.hinge=pick(S0.cat.hinges.map(x=>x.id));p.hw.slide=pick(S0.cat.slides.map(x=>x.id));p.hw.handle=pick(S0.cat.handles.map(x=>x.id));p.hw.coupe=pick(S0.cat.coupe.map(x=>x.id));
  p.discount=pick([0,0,5,15,30]);p.prepay=pick([0,0,10000,25000]);p.svc={floor:int(1,12),lift:pick(['pass','cargo','none']),km:pick([0,0,15]),dism:rnd()>.7,trash:rnd()>.7};
  if(rnd()>.8)p.extra=[{name:'Подъёмник',qty:int(1,3),unit:'шт',price:int(500,9000)}];
  if(kind==='wardrobe'){p.shape=pick(['straight','straight','corner','u']);p.type=p.shape==='u'?'swing':pick(['swing','swing','coupe']);p.walk=rnd()>.7;p.hall=!p.walk&&rnd()>.8;
    p.W=int(900,4000);p.H=int(1500,2800);p.D=pick([350,450,560,600]);p.W2=int(1200,2500);p.W3=int(1200,2500);p.plinth=pick([0,60,80,100]);p.mezz=rnd()>.4;p.mezzH=int(300,600);
    p.sections=Array.from({length:int(1,5)},sec);p.sectionsB=Array.from({length:int(1,3)},sec);p.sectionsV=Array.from({length:int(1,3)},sec);p.mirrors=int(0,3);p.cornerOpen=pick([300,350,450,600])}
  if(kind==='kitchen'){const k=p.k;k.shape=pick(['straight','straight','corner']);k.cornerSide=pick(['L','R']);k.cBase=pick(['blind','L']);k.cWall=pick(['blind','L','none']);k.gola=rnd()>.7;k.wall2H=pick([0,0,360]);k.apron=rnd()>.5;k.worktop=rnd()>.15;
    const bt=['doors','drawers','sink','oven','dw','tall','fridge','doors','drawers'],wt=['doors','open','drying','hood','doors'];
    const row=(n,ts)=>Array.from({length:n},()=>km(pick(ts),pick([300,400,450,500,600,600,800]),int(0,3),int(1,4)));
    k.base=row(int(1,6),bt);k.wall=row(int(0,5),wt);k.baseB=row(int(1,4),bt);k.wallB=row(int(0,3),wt)}
  if(kind==='chest'){p.c.W=int(400,2000);p.c.H=int(400,1400);p.c.D=pick([300,400,450,500]);p.c.plinth=pick([0,60]);p.c.legs=pick([0,100]);p.c.cols=Array.from({length:int(1,4)},()=>({type:pick(['drawers','door','open']),drawers:int(1,5),shelves:int(0,3)}))}
  if(kind==='wardrobe'){p.back=pick(['','','ldsp','none']);p.ceil=pick(['','','stand','filler']);p.ceilH=pick([0,2500,2700,3000]);if(rnd()>.7){p.bbH=pick([40,60,80]);p.bbD=pick([15,20])}}
  if(kind==='chest'){p.back=pick(['','','ldsp','none']);p.c.cols.forEach(cl=>{cl.dlay=pick(['','top','bottom','cust']);if(cl.dlay==='cust')cl.dh=Array.from({length:int(1,5)},()=>int(1,4)*50).join(' ')})}
  orders.push(M.norm(p))}
 M.builtinTemplates().forEach(t=>orders.push(M.fromTemplate(t)));
 // двери на границах таблицы петель: высота двери = H − цоколь − 4
 [880,900,901,950,1000,1001,1450,1500,1501,1550,1600,1601,1999,2000,2001,2399,2400,2401,2500].forEach(h=>[0,1].forEach(m=>{const p=M.newProject();p.plinth=80;p.H=h+84;p.mezz=p.H>1700;p.mezzH=400;p.mirrors=m;p.W=1200;
   p.sections=[{shelves:2,rod:false,drawers:0,baskets:0},{shelves:2,rod:false,drawers:0,baskets:0}];orders.push(M.norm(p))}));
 orders.forEach((p,n)=>{const tag=`#${n} ${p.kind}${p.shape?' '+p.shape:''}`;
  try{M.__render(p)}catch(e){ok(false,tag+': падение '+e.message,'падение');return}
  R=Hk.R();const S=R.S,c=R.c,k=R.cost;
  // ---- 1. деньги: пересчёт сметы с нуля
  const mat=k.rows.reduce((a,r)=>a+r[1]*r[3],0);ok(Math.abs(mat-k.mat)<0.01,tag+': материалы ≠ сумме строк','деньги');
  const self=mat*(1+S.work/100);ok(Math.abs(self-k.self)<0.01,tag+': себестоимость','деньги');
  const full=Math.ceil(self*(1+S.markup/100)/100)*100,d=Math.min(50,Math.max(0,+p.discount||0)),furn=d?Math.ceil(full*(1-d/100)/100)*100:full;
  const svc=k.svcRows.reduce((a,r)=>a+r[1]*r[3],0);ok(k.price===furn+svc,tag+`: цена ${k.price} ≠ ${furn}+${svc}`,'деньги');ok(k.priceFull===full+svc,tag+': цена без скидки','деньги');
  ok(Math.abs(k.profit-(furn-self))<0.01,tag+': прибыль','деньги');ok(k.price%100===svc%100,tag+': цена не округлена до 100 ₽','деньги');
  ok(k.rows.every(r=>Number.isFinite(r[1])&&r[1]>=0&&Number.isFinite(r[3])&&r[3]>=0),tag+': отрицательная или пустая строка сметы','деньги');
  // одна и та же цена везде, где её видит клиент
  const P$=rubT(k.price);
  ok(nb(document.querySelector('#costTotal b').textContent).trim()===P$,tag+': цена в смете на экране '+document.querySelector('#costTotal b').textContent,'цена везде');
  ok(nb(offerText()).includes(P$),tag+': цены нет в тексте для мессенджера','цена везде');
  ok(nb(document.getElementById('kpSheet').textContent).includes(P$),tag+': цены нет в КП','цена везде');
  const ct=nb(docText('contract'));ok(ct.includes(P$),tag+': цены нет в договоре','цена везде');
  if(p.prepay&&p.prepay<=k.price){ok(ct.includes(rubT(p.prepay))&&ct.includes(rubT(k.price-p.prepay)),tag+': предоплата/остаток в договоре','цена везде');
    const act=nb(docText('act'));ok(act.includes(rubT(k.price-p.prepay)),tag+': остаток в акте','цена везде')}
  // в закупке фурнитуры — те же позиции, что в смете
  const supAll=nb(supplierLists().map(x=>x.text).join('\n'));const sl=supplierLists(),has=k=>sl.some(x=>x.k===k);c.hw.filter(h=>h[1]>0).forEach(h=>{const g=/^Зеркало 4 мм/.test(h[0])?'glass':/купе|^Рельсы|^Вставка|разделительный/.test(h[0])?'coupe':null;ok(g?has(g):supAll.includes(h[0].slice(0,25)),tag+': ни в одном списке закупки нет «'+h[0]+'»','закупка')})
  // ---- 2. распил: площадь, листы, каждая деталь на листе
  const usable=(S.sheetL-2*S.trim)*(S.sheetW-2*S.trim);
  [['ldsp',R.cl],['hdf',R.ch]].forEach(([m,pk])=>{if(!pk)return;const ps=c.parts.filter(x=>x.mat===m),area=ps.reduce((a,x)=>a+x.qty*x.L*x.Wd,0),placed=pk.sheets.reduce((a,sh)=>a+sh.parts.length,0)+pk.over.length,need=ps.reduce((a,x)=>a+x.qty,0);
    ok(placed===need,tag+`: ${m} в раскрое ${placed} деталей, нужно ${need}`,'распил');
    if(!pk.over.length){ok(pk.sheets.length>=Math.ceil(area/usable-1e-9),tag+`: ${m} листов меньше, чем площадь деталей`,'распил');
      const used=pk.sheets.reduce((a,sh)=>a+sh.parts.reduce((q,x)=>q+x.l*x.w,0),0);ok(Math.abs(used-area)<1,tag+`: ${m} площадь на листах ≠ площади деталей`,'распил')}
    // каждая деталь списка встречается на листах ровно qty раз своего размера
    const key=(a,b)=>Math.max(a,b)+'x'+Math.min(a,b),want=new Map(),got=new Map();ps.forEach(x=>want.set(key(x.L,x.Wd),(want.get(key(x.L,x.Wd))||0)+x.qty));
    pk.sheets.forEach(sh=>sh.parts.forEach(x=>got.set(key(x.l,x.w),(got.get(key(x.l,x.w))||0)+1)));pk.over.forEach(x=>got.set(key(x.L||x.l,x.Wd||x.w),(got.get(key(x.L||x.l,x.Wd||x.w))||0)+1));
    want.forEach((q,k2)=>ok(got.get(k2)===q,tag+`: ${m} деталь ${k2}: в списке ${q}, на листах ${got.get(k2)||0}`,'распил'));
    pk.sheets.forEach((sh,si)=>sh.parts.forEach((a,i)=>{ok(a.x>=-0.01&&a.y>=-0.01&&a.x+a.l<=S.sheetL-2*S.trim+0.01&&a.y+a.w<=S.sheetW-2*S.trim+0.01,tag+`: деталь за краем листа ${si+1}`,'распил');
      sh.parts.slice(i+1).forEach(q=>ok(!(a.x<q.x+q.l+S.kerf-0.01&&q.x<a.x+a.l+S.kerf-0.01&&a.y<q.y+q.w+S.kerf-0.01&&q.y<a.y+a.w+S.kerf-0.01),tag+`: детали пересекаются на листе ${si+1}`,'распил'))}))});
  // в смете столько листов, сколько в раскрое
  const shRow=k.rows.find(r=>r[2]==='лист'&&!/ХДФ|фасадов/.test(r[0]));if(shRow)ok(shRow[1]===R.cl.sheets.length,tag+': листов в смете ≠ в раскрое','распил');
  // ---- 3. кромка: своя сумма по деталям
  const net=c.parts.filter(x=>x.eL||x.eW||x.eX).reduce((a,x)=>a+x.qty*(x.eL*x.L+x.eW*x.Wd+(x.eX||0))/1000,0);
  ok(Math.abs(c.edgeM-net*(1+S.edgeReserve/100))<0.01,tag+': кромка с запасом','кромка');
  const ew=k.rows.find(r=>r[0]==='Кромкование');if(net>0)ok(ew&&Math.abs(ew[1]-+net.toFixed(1))<0.051,tag+': кромкование не по чистой длине','кромка');
  ok(c.parts.every(x=>x.eL<=2&&x.eW<=2&&x.eL>=0&&x.eW>=0),tag+': кромка больше двух сторон','кромка');
  // какие стороны обязаны быть с кромкой — по смыслу детали, а не по флагам программы
  const fe=R.c&&p.kind?true:true,frontEdge=c.parts.some(x=>x.group==='Фасады'&&x.mat!=='order');
  c.parts.filter(x=>x.mat==='ldsp'||x.mat==='ldspF').forEach(x=>{
    if(/^(Боковина|Крыша|Дно|Перегородка|Полка|Сиденье|Царга|Цоколь$|Планка для крючков|Стойка проёма)/.test(x.name))ok(x.eL>=1||x.eX>0,tag+`: у «${x.name}» нет кромки по видимому краю`,'кромка');
    if(/(фасад|^Дверь|^Дверца|^Доборная планка)/i.test(x.name)&&!/Фальш/.test(x.name))ok(x.eL===2&&x.eW===2,tag+`: у «${x.name}» кромка не по кругу (${x.eL}/${x.eW})`,'кромка')});
  // ---- 4. петли по таблице производителей (шкафы)
  if(p.kind==='wardrobe'&&!c.coupe){const want2=c.doorsAll.reduce((a,dd)=>a+HT(dd.h,dd.mirror),0),got2=c.hw.filter(h=>/^Петля/.test(h[0])).reduce((a,h)=>a+h[1],0);ok(got2===want2,tag+`: петель ${got2}, по таблице ${want2}`,'петли')}
  // ---- 5. 3D собран из тех же деталей (шкафы)
  if(p.kind==='wardrobe'){const sc=scene3dData(),bx=[];sc.groups.forEach(g=>g.items.forEach(it=>{if(it.m==='body'&&!it.drawer&&!it.door)bx.push([it.w,it.h,it.d].map(v=>Math.round(v)).sort((a,b)=>b-a).join('x'))}));
    const pool=new Map();bx.forEach(k3=>pool.set(k3,(pool.get(k3)||0)+1));
    c.parts.filter(x=>/^(Боковина|Крыша$|Дно$|Перегородка$)/.test(x.name)).forEach(x=>{const k3=[x.L,x.Wd,S.t].map(Math.round).sort((a,b)=>b-a).join('x');ok((pool.get(k3)||0)>=x.qty,tag+`: в 3D нет детали «${x.name}» ${k3} ×${x.qty} (есть ${pool.get(k3)||0})`,'3D=детали')});
    if(!c.coupe){const fr=[];sc.groups.forEach(g=>g.items.forEach(it=>{if(it.m==='front'&&it.door)fr.push(Math.round(it.w)+'x'+Math.round(it.h))}));c.doorsAll.forEach(dd=>ok(fr.includes(Math.round(dd.w)+'x'+Math.round(dd.h)),tag+': двери нет в 3D','3D=детали'))}}
  // ---- 6. повторяемость: тот же заказ после сохранения и загрузки считается так же
  const q=M.norm(JSON.parse(JSON.stringify(p))),S2=M.effSettings(q),c2=M.calc(q,S2);
  ok(JSON.stringify(c2.parts.map(x=>[x.name,x.L,x.Wd,x.qty]))===JSON.stringify(c.parts.map(x=>[x.name,x.L,x.Wd,x.qty])),tag+': после загрузки другие детали','повтор');
  ok(JSON.stringify(c2.hw)===JSON.stringify(c.hw),tag+': после загрузки другая фурнитура','повтор');
 });
 return{checks,cnt,fails:fails.slice(0,40),nf:fails.length,orders:orders.length}},[N,SEED]);
console.log('Заказов:',res.orders,'Проверок:',res.checks,'Ошибок:',res.nf);console.log(JSON.stringify(res.cnt));res.fails.forEach(f=>console.log(' -',f.slice(0,300)));console.log('js errors',errs.slice(0,5));await b.close()})();
