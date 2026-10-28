// v51: кухонный остров и барная стойка — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const W=c=>c.warn.map(w=>w.t||w);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[]);
 const kit=f=>{const p=M.newProject();p.kind='kitchen';p.k.gola=false;f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const A=kit(()=>{}),isl=[{type:'drawers',w:600,shelves:0,drawers:3},{type:'sink',w:800,shelves:0,drawers:3},{type:'doors',w:600,shelves:1,drawers:3}];
 {const {p,S,c}=kit(p=>{p.k.islandOn=true;p.k.islandOv='300';p.k.island=JSON.parse(JSON.stringify(isl))});
  ok(c.mods.filter(m=>m.zone==='island').map(m=>m.lab).join()==='О1,О2,О3','модули острова О1–О3');ok(!E(c).length,'без ошибок: '+E(c).join('|'));
  ok(hw(c,/^Столешница острова/)[1]===2&&hw(c,/^Столешница острова/)[3]===Math.round(A.c.top.price*900/600),'столешница острова 2,0 м, цена за метр ×900/600');
  ok(hw(c,/^Цоколь кухонный/)[1]===+((hw(A.c,/^Цоколь кухонный/)[1]*1000+2*2000+2*500)/1000).toFixed(2),'цоколь: + 2×2000 + 2×(560−60)');
  ok(c.parts.some(x=>x.name==='Задняя панель острова (декор)'&&x.L===2000&&x.Wd===820),'панель на спину 2000×820 (100+720)');
  ok(hw(c,/^Врезка мойки/)[1]===hw(A.c,/^Врезка мойки/)[1]+1,'врезка мойки острова');
  // корпуса острова — те же правила, что у нижних модулей
  const sides=x=>x.parts.filter(q=>q.name==='Боковина').reduce((a,q)=>a+q.qty,0);ok(sides(c)===sides(A.c)+6,'+6 боковин (3 модуля)');
  ok(W(c).some(t=>/Барная стойка/.test(t))||c.notes.some(t=>/Барная стойка: столешница острова глубиной 900/.test(t)),'заметка про барную столешницу');
  M.__render(p);const d=M.scene3dData();const g=d.groups.find(x=>Math.abs(x.rot-Math.PI)<1e-6);ok(g&&g.pos[0]===(A.c.L.sides[0].len-2000)/2+2000&&g.pos[2]===560+1200+560,'3D: остров по центру, проход 1200');
  ok(g.items.some(i=>i.m==='top'&&i.d===A.c.top.D+300+S.t),'3D: столешница со свесом 300');ok(document.querySelector('#front').innerHTML.includes('Остров'),'чертёж: вид острова')}
 {const {c}=kit(p=>{p.k.islandOn=true;p.k.islandGap=850;p.k.island=[{type:'doors',w:600,shelves:1,drawers:3}]});ok(E(c).some(t=>/проход между кухней и островом 850 мм/.test(t)),'проход 850 — ошибка')}
 {const {c}=kit(p=>{p.k.islandOn=true;p.k.island=[{type:'tall',w:600,shelves:4,drawers:3}]});ok(E(c).some(t=>/пенал в острове не ставят/.test(t)),'пенал в острове — ошибка')}
 {const {c}=kit(p=>{p.k.islandOn=false;p.k.island=JSON.parse(JSON.stringify(isl))});ok(!c.mods.some(m=>m.zone==='island')&&JSON.stringify(c.hw)===JSON.stringify(A.c.hw),'выключенный остров не влияет на смету')}
 {const {c}=kit(p=>{p.k.shape='corner';p.k.islandOn=true;p.k.island=JSON.parse(JSON.stringify(isl))});ok(c.mods.filter(m=>m.zone==='island').length===3&&!E(c).some(t=>/Остров/.test(t)),'угловая кухня с островом')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
