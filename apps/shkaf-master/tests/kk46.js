// v46: кухня — бутылочница, витрина, ведро, волшебный уголок, карусель (ответы посчитаны вручную)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const kit=f=>{const p=M.newProject();p.kind='kitchen';p.k.gola=false;f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;const P=(c,re)=>c.parts.filter(x=>re.test(x.name));
 // бутылочница 150: корпус 720, фасад 720−4 = 716 × (150−4) = 146
 {const {c}=kit(p=>{p.k.base=[{type:'doors',w:600,shelves:1,drawers:3},{type:'cargo',w:150,shelves:0,drawers:3}];p.k.wall=[]});
  ok(hw(c,/Бутылочница \(карго\) под модуль 150 мм/)===1,'карго 150 в смете');const f=P(c,/Фасад бутылочницы/);ok(f.length===1&&f[0].L===716&&f[0].Wd===146,'фасад 716×146: '+JSON.stringify(f));
  ok(P(c,/^Боковина$/).reduce((a,x)=>a+x.qty,0)===4,'боковин 4 (2 модуля)');ok(!E(c).some(t=>/Н2/.test(t)),'без ошибок у карго: '+E(c).join('|'));
  const m=c.mods.find(x=>x.type==='cargo');ok(m.fronts.length===1&&m.fronts[0].cargo,'один фасад')}
 {const {c}=kit(p=>{p.k.base=[{type:'cargo',w:180,shelves:0,drawers:3}];p.k.wall=[]});ok(E(c).some(t=>/бутылочницы делают под модуль 150, 200, 300 или 400/.test(t)),'карго 180 — ошибка')}
 // витрина 600: дверь одна? авто: 600−4=596 → 1 дверь 596×716 (верх 720−4), стекло 0,43 м²
 {const {c}=kit(p=>{p.k.base=[];p.k.wall=[{type:'glass',w:800,shelves:2,drawers:3}]});const m=c.mods.find(x=>x.type==='glass');
  ok(m.fronts.length===2&&m.fronts.every(f=>f.glass),'витрина 800: две стеклянные двери');const dw=(796-3)/2,ar=2*716*dw/1e6;ok(Math.abs(hw(c,/Фасад-витрина/)-+ar.toFixed(2))<0.005,`стекло ${ar.toFixed(2)} м² = 2×716×${dw}`);
  ok(!P(c,/^Фасад$/).length,'ЛДСП-фасадов нет');ok(P(c,/^Полка$/).reduce((a,x)=>a+x.qty,0)===2,'2 полки')}
 // ведро
 {const {c}=kit(p=>{p.k.base=[{type:'sink',w:600,shelves:0,drawers:3,bin:'1'}];p.k.wall=[]});ok(hw(c,/Ведро выдвижное/)===1,'ведро в смете');
  const {c:c2}=kit(p=>{p.k.base=[{type:'sink',w:600,shelves:0,drawers:3}];p.k.wall=[]});ok(!hw(c2,/Ведро/),'без ведра — нет')}
 // волшебный уголок: глухой угол, дверь = WA − 560 − 16 − 60 − 6
 const cornerK=(cb,mech,WA,WB)=>kit(p=>{p.k.shape='corner';p.k.cBase=cb;p.k.cMech=mech;p.k.cBaseW=WA;if(WB)p.k.cBaseW2=WB;p.k.base=[{type:'doors',w:600,shelves:1,drawers:3}];p.k.baseB=[{type:'doors',w:600,shelves:1,drawers:3}];p.k.wall=[];p.k.wallB=[];p.k.cWall='none'});
 {const {c,S}=cornerK('blind','magic',1150);const dwc=1150-560-S.t-60-6;ok(dwc>=450&&dwc<=550,'дверь '+dwc);ok(hw(c,/Волшебный уголок/)===1&&!E(c).some(t=>/волшебн/i.test(t)),'волшебный уголок 1150: в смете, без ошибок');
  const m=c.mods.find(x=>x.key==='cBase');ok(m.shelves.length===0,'полок в углу нет')}
 {const {c}=cornerK('blind','magic',1000);ok(E(c).some(t=>/волшебному уголку нужна дверь 450–550 мм, а выходит 358 мм/.test(t)),'1000 — дверь 358, ошибка с подсказкой: '+E(c).filter(t=>/уголку/.test(t)).join('|'))}
 {const {c}=cornerK('L','carousel',900,900);ok(hw(c,/Карусель угловая/)===1&&!P(c,/Полка Г-образная/).length,'карусель 900×900: в смете, Г-полки нет');ok(!E(c).some(t=>/карусел/i.test(t)),'без ошибок')}
 {const {c}=cornerK('L','carousel',750,900);ok(E(c).some(t=>/карусели 3\/4 нужен модуль от 800×800/.test(t)),'750 — ошибка')}
 {const {c}=cornerK('L','magic',900,900);ok(E(c).some(t=>/Волшебный уголок ставят в глухой/.test(t)),'уголок в Г-модуле — ошибка')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
