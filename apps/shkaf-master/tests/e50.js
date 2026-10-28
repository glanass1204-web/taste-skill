// v50: проход у двери, навесные изделия, торцевые полки, шкаф под скос — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;
 const P=(c,re)=>c.parts.filter(x=>re.test(x.name)).map(x=>x.L+'x'+x.Wd+'x'+x.qty).sort().join(',');
 const ch=c0=>{const p=M.newProject();p.kind='chest';p.c=c0;M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 // шкаф вокруг двери 2700×2600×400, цоколь 60: колонки 876 / 884 / 876; проход 2100, дверца над ним 2600−2100−32−4=464
 {const {p,S,c}=ch({W:2700,H:2600,D:400,plinth:60,legs:0,cols:[{type:'door',drawers:0,shelves:5},{type:'pass',drawers:0,shelves:1,nicheH:2100},{type:'door',drawers:0,shelves:5}]});
  ok(P(c,/^Стойка у ниши/)==='2584x400x2','стойки у прохода до пола 2600−16: '+P(c,/^Стойка/));ok(P(c,/^Дно$/)==='876x400x2','дно только у шкафов: '+P(c,/^Дно$/));
  ok(P(c,/Полка над проходом/)==='884x400x1','полка над проходом 884×400');ok(c.parts.some(x=>x.name==='Дверца'&&x.L===464),'дверца над проходом 464');
  ok(!E(c).length,'без ошибок: '+E(c).join('|'));ok(hw(c,/Крепление к стене/)===2,'высокий — крепление к стене');const s=M.__render(p);ok(s.svg&&s.scene&&s.drill,'чертёж, 3D, сверловка')}
 {const {c}=ch({W:1800,H:2600,D:400,plinth:60,legs:0,cols:[{type:'door',drawers:0,shelves:5},{type:'pass',drawers:0,shelves:1,nicheH:1900},{type:'door',drawers:0,shelves:5}]});
  ok(E(c).some(t=>/проход 584 мм — уже 700/.test(t))&&E(c).some(t=>/проход по высоте 1900/.test(t)),'узкий и низкий проход — две ошибки')}
 // навесные: 2 навеса, без подпятников
 for(const [nm,c0] of [['полка',{W:800,H:300,D:250,plinth:0,legs:0,hang:true,cols:[{type:'open',drawers:0,shelves:1}]}],['антресоль',{W:1000,H:450,D:350,plinth:0,legs:0,hang:true,cols:[{type:'door',drawers:0,shelves:1},{type:'door',drawers:0,shelves:1}]}]]){
  const {c}=ch(c0);ok(hw(c,/^Навес регулируемый \(подвесная/)===2&&!hw(c,/Подпятник/)&&!E(c).length,nm+': 2 навеса, без подпятников, без ошибок')}
 // торцевые полки к шкафу 1800×2400×600, цоколь 80: прямые слева 300 (полки 300−16=284), радиусные справа R 300×600 (дуга 727)
 const wr=f=>{const p=M.newProject();p.shape='straight';p.type='swing';p.W=1800;p.H=2400;p.D=600;p.plinth=80;p.mirrors=0;f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 {const A=wr(()=>{}),B=wr(p=>{p.endL='rect';p.endR='round';p.endW=300;p.endN=4});
  ok(P(B.c,/^Полка торцевая$/)==='284x600x4','прямые: 4 полки 284×600');ok(P(B.c,/^Боковина торцевых полок/)==='2400x600x1','своя боковина 2400×600');
  const rr=B.c.parts.filter(x=>/радиусн/.test(x.name));ok(rr.length===3&&rr.every(x=>x.L===300&&x.Wd===600&&x.eX===727),'радиусные: полки, крыша, дно 300×600, дуга 727 мм');
  ok(hw(B.c,/Радиусный рез/)===6,'радиусный рез — 6 деталей');ok(hw(B.c,/^Конфирмат/)-hw(A.c,/^Конфирмат/)===(4+2)*4+2+(4+2)*2+2,'конфирматов больше на 26+14');
  ok(B.c.notes.some(t=>/Общая ширина с полками — 2400 мм/.test(t)),'общая ширина 2400');ok(!E(B.c).length,'без ошибок');
  const s=M.__render(B.p);ok(M.scene3dData().groups[0].items.filter(i=>i.qr==='R').length===6,'3D: 6 радиусных деталей');ok(document.querySelector('#front svg').getAttribute('viewBox').split(' ')[2]>2400,'чертёж расширен под полки')}
 {const {c}=wr(p=>{p.endL='rect';p.endW=300;p.meas.w=['2050','','']});ok(E(c).some(t=>/шкаф с торцевыми полками 2100 мм/.test(t)),'замер 2050: шкаф с полками 2100 не войдёт')}
 // скос: спереди 2200, сзади 1400, глубина 600 → крыша √(600²+800²)=1000, уклон 53°
 {const {p,S,c}=wr(p=>{p.H=2200;p.mezz=false;p.slopeB=1400;p.sections=[{shelves:5,rod:false,drawers:0,baskets:0},{shelves:4,rod:false,drawers:0,baskets:0}]});
  ok(P(c,/^Крыша скошенная \(уклон 53°\)$/)==='1768x1000x1','крыша 1768×1000 (уклон 53°)');ok(P(c,/^Перегородка со скосом/)==='2088x600x1','перегородка: спереди 2088 (2200−32−80)');
  ok(c.parts.some(x=>x.name==='Перегородка со скосом (спереди 2088, сзади 1288)'),'перегородка сзади 1288');ok(P(c,/^Задняя стенка$/)==='1316x1796x1','задняя стенка 1400−80−4 = 1316');
  ok(c.parts.filter(x=>x.name==='Полка под скосом').map(x=>x.Wd).sort((a,b)=>a-b).join(',')==='231,283,492',`полки под скосом: 231 (на 1844, секция 1), 492 (на 1496, секция 1), 283 (на 1774, секция 2): `+c.parts.filter(x=>/скосом/.test(x.name)&&/Полка/.test(x.name)).map(x=>x.Wd+'×'+x.qty).join(','));
  ok(!E(c).length,'без ошибок: '+E(c).join('|'));
  // 3D: каждая полка под линией крыши
  M.__render(p);const it=M.scene3dData().groups[0].items.filter(i=>i.m==='body'&&i.h===S.t&&i.d<600&&!i.poly&&i.y>200);
  const roof=z=>1400+800*z/600;ok(it.length>0&&it.every(i=>i.y+i.h<=roof(i.z)-S.t+0.5),'3D: полки под скосом не заходят в крышу');
  const d=M.drillMap(p,S,c);ok(d.some(x=>x.lines.some(l=>/крыша скошенная — X/.test(l))),'сверловка: отверстия по скосу')}
 {const {c}=wr(p=>{p.H=2200;p.mezz=false;p.slopeB=1400;p.sections=[{shelves:0,rod:true,drawers:0,baskets:0}]});ok(E(c).some(t=>/штанга на высоте 2114 мм упирается в скос/.test(t)),'штанга под скосом — ошибка')}
 {const {c}=wr(p=>{p.slopeB=1600;p.endL='rect'});ok(E(c).some(t=>/Скос и торцевые полки/.test(t)),'скос + торцевые — ошибка')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
