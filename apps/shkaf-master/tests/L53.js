// v53: детская кровать-чердак — ответы посчитаны вручную (ЛДСП 16 мм), проверки безопасности по ГОСТ EN 747
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const W=c=>c.warn.map(w=>w.t||w);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[]);
 const part=(c,nm)=>c.parts.filter(x=>x.name===nm);const has=(c,nm,L,Wd,q)=>part(c,nm).some(x=>((x.L===L&&x.Wd===Wd)||(x.L===Wd&&x.Wd===L))&&x.qty===q);
 const bed=(bd,f)=>{const p=M.newProject();p.kind='chest';p.c={W:1000,H:1000,D:600,plinth:0,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}],bed:bd};if(f)f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const L0={type:'loft',mW:900,mL:2000,mH:120,loftH:1500,rail:350,under:'desk',ladder:'R'};
 {const {p,c}=bed({...L0});
  ok(p.c.W===2042&&p.c.D===942&&p.c.H===1880,'габарит 2042×942×1880: '+[p.c.W,p.c.D,p.c.H]);
  ok(has(c,'Торец кровати-чердака',1880,942,2),'торцы 1880×942 ×2');ok(has(c,'Бортик у стены',2010,480,1),'бортик у стены 2010×480 (1880−1500+100)');
  ok(has(c,'Царга передняя',2010,150,1),'царга 2010×150');ok(has(c,'Бортик передний',1610,330,1),'передний бортик 1610×330 (2010−400; 1880−1550)');
  ok(has(c,'Тетива лестницы',1550,150,2),'тетивы 1550×150 ×2');ok(has(c,'Ступенька лестницы',360,150,5),'5 ступенек 360×150 (1550/6 = 258)');
  ok(has(c,'Столешница стола',2010,600,1)&&has(c,'Царга стола (задняя)',2010,100,1),'стол 2010×600 и царга');
  ok(hw(c,/^Конфирмат/)[1]===45,'конфирматы 8+4+3+20+10 = 45: '+hw(c,/^Конфирмат/)[1]);ok(hw(c,/^Уголок мебельный/)[1]===9,'уголки 4+5 = 9');
  ok(hw(c,/^Брусок опорный/)[1]===4.02,'бруски 2×2010');ok(hw(c,/^Основание ортопедическое/)[1]===1.8,'основание 1,8 м²');ok(hw(c,/^Крепление к стене/)[1]===4,'4 крепления к стене');
  ok(!c.warn.length,'без замечаний: '+W(c).join('|'));
  ok(c.notes.some(t=>/верх матраса 1650 мм от пола, бортик выше матраса на 230 мм/.test(t))&&c.notes.some(t=>/толщина матраса — 190 мм/.test(t)),'верх матраса 1650, бортик 230, матрас до 190');
  ok(c.notes.some(t=>/5 ступенек, шаг 258 мм/.test(t)),'лестница 5 ступенек, шаг 258');ok(c.notes.some(t=>/от 6 лет/.test(t)),'от 6 лет');}
 {const {c}=bed({...L0,mH:200});ok(E(c).some(t=>/Бортик выше матраса всего на 150 мм — нужно не меньше 160 мм/.test(t)&&/до 190 мм/.test(t)),'толстый матрас — ошибка: '+E(c).join('|'));}
 {const {c}=bed({...L0,loftH:1200});ok(W(c).some(t=>/Над столом до царги 350 мм/.test(t)),'низко над столом');}
 {const {c}=bed({...L0,under:'open'});ok(has(c,'Царга нижняя (у стены)',2010,100,1)&&!part(c,'Столешница стола').length,'без стола — нижняя царга');ok(hw(c,/^Конфирмат/)[1]===39,'конфирматы 39');}
 {const {c}=bed({...L0,loftH:900,under:'open'});ok(has(c,'Ступенька лестницы',360,150,3),'низкий чердак: 950/4 = 237,5 → 3 ступеньки');ok(W(c).some(t=>/Под кроватью 800 мм/.test(t)),'под кроватью низко');}
 {const {c}=bed({...L0},p=>{p.meas={w:[2600],h:[2350]}});ok(W(c).some(t=>/До потолка над матрасом 700 мм/.test(t)),'потолок 2350: над матрасом 700');}
 {const {c}=bed({...L0},p=>{p.meas={w:[2600],h:[2600]}});ok(!W(c).some(t=>/До потолка/.test(t)),'потолок 2600 — ок');}
 // чертёж, присадка, 3D, КП
 for(const lad of ['R','L']){const {p,S,c}=bed({...L0,ladder:lad});const r=M.__render(p);ok(r.svg===2,lad+': два чертежа');
  const html=document.getElementById('front').innerHTML;ok(!/NaN|undefined/.test(html)&&/бортик над матрасом 230/.test(html),lad+': чертёж');
  const dm=M.drillMap(p,S,c);ok(dm.length===6&&!JSON.stringify(dm).match(/NaN|undefined/),lad+': присадка '+dm.length);
  const sd=M.scene3dData();ok(sd.groups.length===1&&!JSON.stringify(sd).match(/NaN|null/),lad+': 3D');
  const strings=sd.groups[0].items.filter(x=>x.h===1550&&x.d===150);ok(strings.length===2&&(lad==='R'?strings[0].x>1500:strings[0].x<200),lad+': лестница у своего торца');
  const steps=sd.groups[0].items.filter(x=>x.w===360&&x.h===16);ok(steps.length===5&&Math.abs(steps[0].y+16-258.33)<0.1,lad+': ступеньки с шагом 258');
  ok(/Кровать-чердак/.test(M.__hooks.offerText()),lad+': КП');}
 return{n,bad}});
console.log(r.bad.length?'✗ '+r.bad.join('\n✗ '):`✓ все ${r.n} проверок`,'errs',errs);await b.close()})();
