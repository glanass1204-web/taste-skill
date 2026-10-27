// ящики разной высоты и число дверей в кухне — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)},eq=(a,b,m,tol=0.6)=>ok(Math.abs(a-b)<=tol,m+`: ${a} ≠ ${b}`);
 const kit=(base,wall)=>{const p=M.newProject();p.kind='kitchen';p.k.base=base;p.k.wall=wall||[];p.k.gola=false;return M.norm(p)};
 const run=p=>{const S=M.effSettings(p),c=M.calc(p,S);return{S,c}};
 // нижний модуль: высота корпуса 720, фасады 720−4 = 716, зазоры 3 мм между ящиками
 const H=716,g=3;
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3}]),{c}=run(p);const fr=c.mods[0].fronts.filter(f=>f.kind==='drawer').map(f=>f.h);
  [0,1,2].forEach(i=>eq(fr[i],(H-2*g)/3,'одинаковые: фасад '+(i+1)))}
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'top'}]),{c}=run(p);const fr=c.mods[0].fronts.filter(f=>f.kind==='drawer').map(f=>f.h);
  const u=(H-2*g)/5;eq(fr[0],u,'верхний низкий: верх 1/5');eq(fr[1],2*u,'верхний низкий: средний 2/5');eq(fr[2],2*u,'верхний низкий: низ 2/5');
  const ps=c.parts.filter(x=>x.name==='Фасад ящика').map(x=>x.Wd+'x'+x.qty).sort().join(',');ok(ps===[Math.floor(u)+'x1',Math.floor(2*u)+'x2'].sort().join(','),'верхний низкий: в распиле фасады '+ps);
  ok(fr[0]>fr[1]===false&&c.mods[0].fronts[0].y>c.mods[0].fronts[2].y,'верхний низкий: маленький сверху')}
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'bottom'}]),{c}=run(p);const fr=c.mods[0].fronts.filter(f=>f.kind==='drawer').map(f=>f.h),u=(H-2*g)/4;
  eq(fr[0],u,'нижний высокий: верх');eq(fr[1],u,'нижний высокий: средний');eq(fr[2],2*u,'нижний высокий: низ')}
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'cust',dh:'140 283 287'}]),{c}=run(p);const fr=c.mods[0].fronts.filter(f=>f.kind==='drawer').map(f=>f.h);
  eq(fr[0],140,'свои 140+283+287=710: верх точно');eq(fr[1],283,'свои: средний точно');eq(fr[2],287,'свои: низ точно')}
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'cust',dh:'1 1 1 2'}]),{c}=run(p);const fr=c.mods[0].fronts.filter(f=>f.kind==='drawer').map(f=>f.h),u=(H-3*g)/5;
  ok(fr.length===4,'свои доли: 4 ящика');eq(fr[3],2*u,'свои доли: нижний двойной');ok(c.hw.some(h=>/^Направляющие/.test(h[0])&&h[1]===4),'направляющих 4 пары')}
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'cust',dh:'60 300 350'}]),{c}=run(p);ok(c.warn.some(w=>w.lvl==='err'&&/ниже 100 мм/.test(w.t)),'фасад 60 мм — ошибка')}
 // короба ящиков разной высоты
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'top'}]),{c}=run(p);const sides=c.parts.filter(x=>/Ящик/.test(x.name)&&/бок/i.test(x.name));ok(new Set(sides.map(x=>Math.min(x.L,x.Wd))).size>=1,'боковины ящиков есть');}
 // двери
 {const p=kit([{type:'doors',w:600,shelves:1,drawers:3}],[{type:'doors',w:600,shelves:2,drawers:3}]),{c}=run(p);const d=m=>m.fronts.filter(f=>f.kind==='door').length;
  ok(d(c.mods[0])===1&&d(c.mods[1])===1,'авто 600: по одной двери')}
 {const p=kit([{type:'doors',w:600,shelves:1,drawers:3,nd:'2'}],[{type:'doors',w:600,shelves:2,drawers:3,nd:'2'}]),{c}=run(p);const d=m=>m.fronts.filter(f=>f.kind==='door');
  ok(d(c.mods[0]).length===2&&d(c.mods[1]).length===2,'выбор 2 двери: по две');eq(d(c.mods[1])[0].w,(596-3)/2,'ширина двери верхнего (596−3)/2');
  ok(!c.warn.some(w=>w.lvl==='err'),'600 на 2 двери — без ошибок')}
 {const p=kit([{type:'doors',w:800,shelves:1,drawers:3,nd:'1'}]),{c}=run(p);ok(c.warn.some(w=>w.lvl==='err'&&/провиснет/.test(w.t)),'800 одной дверью — ошибка «провиснет»')}
 {const p=kit([{type:'doors',w:400,shelves:1,drawers:3,nd:'2'}]),{c}=run(p);ok(c.warn.some(w=>w.lvl==='err'&&/уже 200/.test(w.t)),'400 на 2 двери — ошибка «уже 200»')}
 // петли: 2 двери × по 2 петли (фасад 716 ≤ 900)
 {const p=kit([{type:'doors',w:600,shelves:1,drawers:3,nd:'2'}]),{c}=run(p);const h=c.hw.filter(x=>/^Петл/.test(x[0])).reduce((a,x)=>a+x[1],0);ok(h===4,'петель 4 при двух дверях: '+h)}
 // Gola: профиль между ящиками по факту
 {const p=kit([{type:'drawers',w:600,shelves:0,drawers:3,dlay:'cust',dh:'1 2'}]);p.k.gola=true;const {c}=run(p);const gC=c.hw.find(h=>/Gola C/.test(h[0]));ok(!gC||Math.abs(gC[1]-0.6)<0.05,'Gola C: один промежуток 0,6 м: '+(gC&&gC[1]))}
 return{n,bad}});
r.bad.forEach(x=>console.log('✗',x));console.log('Проверок:',r.n,'Ошибок:',r.bad.length);console.log('errs',errs);await b.close()})();
