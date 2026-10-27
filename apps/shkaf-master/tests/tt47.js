// v47: двухцветная кухня, подвесная тумба, откидная обувница, ниша под стиральную машину (ответы посчитаны вручную)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const W=c=>c.warn.map(w=>w.t||w);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;
 const area=(c,mat,re)=>c.parts.filter(x=>x.mat===mat&&(!re||re.test(x.name))).reduce((a,x)=>a+x.qty*x.L*x.Wd,0);
 const kit=f=>{const p=M.newProject();p.kind='kitchen';p.k.gola=false;p.k.base=[{type:'doors',w:600,shelves:1,drawers:3},{type:'drawers',w:600,shelves:0,drawers:3}];p.k.wall=[{type:'doors',w:600,shelves:2,drawers:3},{type:'doors',w:600,shelves:2,drawers:3}];f&&f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 // фасады ЛДСП как корпус, верх — Кашемир: верхние фасады уходят на отдельные листы
 {const A=kit(),B=kit(p=>p.k.wallF='kashmir');
  const upA=area(A.c,'ldsp',/^Фасад$/),fB=area(B.c,'ldspF'),bodyB=area(B.c,'ldsp',/^Фасад$/);
  ok(fB>0&&B.c.parts.filter(x=>x.mat==='ldspF').every(x=>/\(верх\)$/.test(x.name)),'верхние фасады — на листы фасадов, с пометкой «(верх)»');
  // верхний модуль 600: одна дверь 716×596 на модуль; два модуля → 2 × 716 × 596
  ok(fB===2*716*596,`площадь верхних фасадов 2×716×596 = ${2*716*596}: ${fB}`);ok(bodyB+fB===upA,'всего фасадов столько же, сколько в одноцветной');
  ok(M.calc(B.p,B.S).parts.length>0&&E(B.c).length===E(A.c).length,'ошибок не прибавилось');
  const s=M.__render(B.p);ok(s.svg>0&&s.scene>0,'чертёж и 3D');ok(document.querySelector('#front svg').innerHTML.includes('#C9C1B4'),'на чертеже цвет кашемира');
  const sl=M.__hooks.supplierLists?JSON.stringify(M.__hooks.supplierLists()):'';ok(!sl||/Кашемир серый/.test(sl),'в заказе распила — декор кашемир')}
 {const B=kit(p=>{p.mat.front='ldsp';p.mat.frontDecor='sage';p.k.wallF='body'});ok(area(B.c,'ldsp',/^Фасад \(верх\)$/)===2*716*596,'фасады другого декора, верх — в цвет корпуса на листах корпуса')}
 {const B=kit(p=>{p.mat.front='mdfmat';p.mat.frontColor='white';p.k.wallF='graphite'});ok(B.c.parts.some(x=>x.mat==='order'&&x.name==='Фасад (верх)'),'заказные: верх отдельной строкой (другой цвет)');
  const rows=M.__render(B.p);ok(document.body.innerText.length>0,'рендер заказных')}
 {const B=kit(p=>{p.decor='white';p.k.wallF='white'});ok(!B.c.parts.some(x=>/\(верх\)/.test(x.name)),'тот же декор, что корпус — без разделения')}
 // подвесная ТВ-тумба 1600: навесов 2+ (ceil(1600/800)−2)=2, шина 1,6 м, без подпятников
 const ch=c0=>{const p=M.newProject();p.kind='chest';p.c=c0;M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 {const {c}=ch({W:1600,H:400,D:400,plinth:0,legs:0,hang:true,cols:[{type:'door',drawers:0,shelves:1},{type:'drawers',drawers:1,shelves:0},{type:'drawers',drawers:1,shelves:0},{type:'door',drawers:0,shelves:1}]});
  ok(hw(c,/^Навес регулируемый \(подвесная/)===2&&hw(c,/^Шина монтажная/)===1.6&&!hw(c,/Подпятник/),'подвесная 1600: 2 навеса, шина 1,6 м, без подпятников');ok(!E(c).length,'без ошибок')}
 {const {c}=ch({W:2400,H:400,D:400,plinth:0,legs:0,hang:true,cols:[{type:'door',drawers:0,shelves:1},{type:'door',drawers:0,shelves:1},{type:'door',drawers:0,shelves:1}]});ok(hw(c,/^Навес регулируемый/)===3,'2400: навесов 2+(3−2)=3')}
 // откидная обувница 800×1100×240, без цоколя: зона фасадов 1100−0−16−3=1081, 3 ящика (1081−6)/3=358,3 → 358
 {const {p,S,c}=ch({W:800,H:1100,D:240,plinth:0,legs:0,cols:[{type:'flip',drawers:3,shelves:0},{type:'flip',drawers:3,shelves:0}]});
  const f=c.parts.filter(x=>x.name==='Фасад откидной обувницы');ok(f.length===1&&f[0].qty===6&&f[0].Wd===358,'6 фасадов по 358: '+JSON.stringify(f.map(x=>[x.L,x.Wd,x.qty])));
  ok(hw(c,/Механизм откидной обувницы/)===6,'6 пар механизмов');ok(!hw(c,/^Направляющие/),'направляющих нет');ok(c.parts.filter(x=>x.name==='Полка откидной обувницы').reduce((a,x)=>a+x.qty,0)===6,'6 полок-лотков');
  ok(!E(c).length,'без ошибок: '+E(c).join('|'));const s=M.__render(p);ok(s.scene>0&&s.drill>0,'3D и сверловка')}
 {const {c}=ch({W:800,H:700,D:240,plinth:0,legs:0,cols:[{type:'flip',drawers:4,shelves:0}]});ok(E(c).some(t=>/откидной ящик \d+ мм — ниже 170/.test(t)),'4 откидника в 700 мм — ошибка')}
 // шкаф над стиральной машиной 1300×2000×600, цоколь 60: колонки по 650 → 650−16−8=626
 {const {p,S,c}=ch({W:1300,H:2000,D:600,plinth:60,legs:0,cols:[{type:'washer',drawers:0,shelves:2,nicheH:900},{type:'door',drawers:0,shelves:4}]});
  const P=re=>c.parts.filter(x=>re.test(x.name)).map(x=>x.L+'x'+x.Wd+'x'+x.qty+(x.mat==='hdf'?'h':'')).sort().join(',');
  ok(P(/^Дно$/)==='626x600x1','дно только у шкафа: '+P(/^Дно$/));ok(P(/^Стойка у ниши/)==='1984x600x1','стойка у ниши до пола 2000−16: '+P(/^Стойка/));
  ok(P(/Полка над стиральной машиной/)==='626x600x1','неподвижная полка над машиной 626×600');
  // дверца над нишей: 2000 − 900 − 32 − 4 = 1064, фасад 650−2−1,5=646,5 → одна дверь
  ok(c.parts.some(x=>x.name==='Дверца'&&x.L===1064),'дверца над машиной 1064: '+JSON.stringify(c.parts.filter(x=>x.name==='Дверца').map(x=>[x.L,x.Wd,x.qty])));
  ok(!E(c).length,'без ошибок: '+E(c).join('|'));ok(c.notes.some(t=>/стиральную машину/.test(t)),'заметка');const s=M.__render(p);ok(s.scene>0&&s.drill>0&&s.svg>0,'чертёж, 3D, сверловка');
  const d=M.drillMap(p,S,c);ok(d.some(x=>/дверца над машиной/.test(x.name)),'сверловка: дверца над машиной')}
 {const {c}=ch({W:1100,H:2000,D:600,plinth:60,legs:0,cols:[{type:'washer',drawers:0,shelves:2,nicheH:850},{type:'door',drawers:0,shelves:4}]});ok(E(c).some(t=>/ниша под стиральную машину 526 мм — нужно от 620/.test(t))&&E(c).some(t=>/ниша по высоте 850 мм/.test(t)),'узкая и низкая ниша — две ошибки')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
