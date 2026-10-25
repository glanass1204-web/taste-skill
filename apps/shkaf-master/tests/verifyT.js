// размеры техники по инструкции — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const K=f=>{const p=M.newProject();p.kind='kitchen';f(p.k);return p},calc=p=>M.calc(p,M.effSettings(p)),err=(c,re)=>c.warn.some(x=>x&&x.lvl==='err'&&re.test(x.t));
 const part=(c,re)=>c.parts.find(x=>re.test(x.name));
 // духовка под варочной: корпус 720, ЛДСП 16: фальш-фасад = 720 − (ниша + 4) − 16
 {const p=K(k=>{k.base=[{type:'oven',w:600,shelves:0,drawers:0,hob:'i60'},{type:'doors',w:600,shelves:1,drawers:0}]});let c=calc(p),f=part(c,/Фальш-фасад/);ok(f&&Math.min(f.L,f.Wd)===720-604-16,'ниша 600 (типовая): фальш-фасад 100 мм');
  p.k.base[0].apN=595;c=calc(p);f=part(c,/Фальш-фасад/);ok(f&&Math.min(f.L,f.Wd)===720-599-16,'ниша 595 по инструкции: фальш-фасад 105 мм');
  p.k.base[0].apN=660;ok(err(calc(p),/под духовку \(ниша 660 мм\)/),'ниша 660: места нет — ошибка');delete p.k.base[0].apN;
  p.k.base[0].apW=570;ok(err(calc(p),/ниша под духовку между боковинами 568 мм, а по инструкции нужна 570–578/),'ширина ниши от 570, а есть 568 — ошибка');delete p.k.base[0].apW;
  p.k.base[0].apD=600;ok(err(calc(p),/глубина ниши от 600 мм, а корпус 560/),'глубина 600 при корпусе 560 — ошибка')}
 // посудомойка: ниша = ножки 100 + корпус 720 = 820
 {const p=K(k=>{k.base=[{type:'dw',w:600,shelves:0,drawers:0},{type:'doors',w:600,shelves:1,drawers:0}]});ok(!err(calc(p),/посудомойку по высоте/),'820 в типовых 815–875');
  p.k.base[0].dwMin=820;p.k.base[0].dwMax=870;ok(!err(calc(p),/посудомойку по высоте/),'820 в диапазоне машины 820–870');
  p.k.base[0].dwMin=830;ok(err(calc(p),/посудомойку по высоте 820 мм.*830–870/),'машине нужно от 830 — ошибка')}
 // духовка в пенале: полки на корпус+t и корпус+t+ниша
 {const p=K(k=>{k.base=[{type:'tallOven',w:600,shelves:1,drawers:0,top2:'cust',top2N:400},{type:'doors',w:600,shelves:1,drawers:0}]});
  const m=c=>c.mods.find(x=>x.type==='tallOven');let c=calc(p),So=720+16;ok(JSON.stringify(m(c).fixed.slice(0,3))===JSON.stringify([So-16,So+590,So+590+16+400]),'пенал: полки 720 / 1326 / 1742 (ниша 590, своя СВЧ 400)');
  p.k.base[0].apN=600;c=calc(p);ok(m(c).fixed[1]===So+600,'ниша духовки 600 по инструкции: полка на 1336')}
 // холодильник
 {const p=K(k=>{k.base=[{type:'fridge',w:600,shelves:1,drawers:0},{type:'doors',w:600,shelves:1,drawers:0}]});ok(!err(calc(p),/холодильнику/),'без размеров — без ошибок');
  p.k.base[0].apW=570;ok(err(calc(p),/шириной от 570 мм, а между боковинами 568/),'холодильнику 570, а ниша 568 — ошибка')}
 // встраиваемая вытяжка в верхнем модуле 600 (между боковинами 568), глубина 300, высота 720
 {const p=K(k=>{k.wall=[{type:'hood',w:600,shelves:0,drawers:0},{type:'doors',w:600,shelves:1,drawers:0}]});const h=()=>calc(p);
  p.k.wall[0].apW=560;p.k.wall[0].apH=200;p.k.wall[0].apD=280;ok(!err(h(),/вытяжк/i),'вытяжка 560×200×280 входит');
  p.k.wall[0].apW=580;ok(err(h(),/вытяжка шириной 580 мм не входит между боковинами \(568/),'580 > 568 — ошибка');p.k.wall[0].apW=560;
  p.k.wall[0].apD=300;ok(err(h(),/глубиной 300 мм не входит в шкаф глубиной 300 мм \(с задней стенкой — 296/),'глубина 300 > 296 — ошибка');p.k.wall[0].apD=280;
  p.k.wall[0].apH=800;ok(err(h(),/высотой 800 мм выше шкафа/),'высота 800 — ошибка');p.k.wall[0].apH=200;
  p.k.wall[0].w=500;p.k.wall[0].apW=440;ok(!err(h(),/бывают 60 и 90 см/),'своя вытяжка 440 в модуле 500 — без ошибки про 60/90')}
 return{n,bad}});
console.log('Проверок:',r.n,'Ошибок:',r.bad.length);r.bad.forEach(x=>console.log(' -',x));console.log('js errors',errs);await b.close()})();
