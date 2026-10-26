// гардеробные: прямая, угловая, П-образная — размеры посчитаны вручную (ЛДСП 16, фасад 16/18, планка 60)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster,S=M.settings(),t=S.t;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)},eq=(a,b,m)=>ok(Math.abs(a-b)<0.02,m+`: ${a} ≠ ${b}`);
 const T=nm=>M.fromTemplate(M.builtinTemplates().find(x=>x.name===nm));
 const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[0,0])[1],qty=(c,nm)=>c.parts.filter(x=>x.name===nm).reduce((a,x)=>a+x.qty,0);
 const info={t};
 // П-образная, всё открыто: стороны вплотную
 {const p=T('Гардеробная П-образная 2800 × 1800'),S1=M.effSettings(p),c=M.calc(p,S1),[A,B,V]=c.wings;info.fT=null;
  ok(p.walk&&p.shape==='u'&&c.u&&c.wings.length===3,'П: три стороны');
  ok(A.cis.join()==='0,2','П: угловые секции А с обоих краёв');
  eq(A.ws[0],560+450-t-t/2,'П: угловая секция А слева');eq(A.ws[2],560+450-t-t/2,'П: угловая секция А справа');eq(A.ws[1],2800-2*1010-t,'П: средняя секция А');
  eq(A.ws.reduce((a,b)=>a+b,0)+4*t,2800,'П: сумма секций А');
  eq(B.W,1800-560,'П: длина Б вплотную');eq(V.W,1800-560,'П: длина В вплотную');eq(B.off,0,'П: Б без отступа');
  eq(c.pass,2800-2*560,'П: проход');ok(c.doorsAll.length===0,'П: без дверей');ok(!c.hw.some(h=>/^Петл/.test(h[0])),'П: петель нет');
  eq(qty(c,'Доборная планка'),0,'П: планок нет');eq(hw(c,/^Стяжка межсекционная/),12,'П: стяжки 6+6');eq(hw(c,/^Уголок для доборной/),0,'П: уголков планки нет');
  eq(hw(c,/^Крепление к стене/),6,'П: крепление к стене 2 на сторону');eq(qty(c,'Боковина'),6,'П: боковины 2×3');
  ok(!c.warn.some(w=>w.lvl==='err'),'П: без ошибок '+JSON.stringify(c.warn));
  // ящики в средней секции А, брючница на В
  ok(c.hw.some(h=>/^Направляющие/.test(h[0])),'П: направляющие ящиков');ok(c.hw.some(h=>/^Брючница/.test(h[0])),'П: брючница');
  // дверь в секции Б у стыка — ставятся планки
  p.sectionsB[1].open=false;const c2=M.calc(p,S1),fT=M.calc(p,S1).wings[1].off-4;info.fT=fT;
  eq(c2.wings[1].W,1800-560-(fT+4),'П+дверь: Б короче на фасад+4');eq(c2.wings[1].off,fT+4,'П+дверь: отступ Б');eq(c2.wings[2].off,0,'П+дверь: В вплотную');
  eq(c2.wings[0].bs.L.w,560+60,'П+дверь: угол А слева с планкой');eq(c2.wings[0].bs.R.w,560,'П+дверь: угол А справа без планки');
  eq(qty(c2,'Доборная планка'),2,'П+дверь: две планки');eq(hw(c2,/^Уголок для доборной/),8,'П+дверь: 8 уголков');
  eq(c2.pass,2800-1120-(fT+4)-fT,'П+дверь: проход за вычетом двери');ok(c2.doorsAll.length>=1,'П+дверь: дверь есть');
  ok(c2.notes.some(x=>/двери обычно не ставят/.test(x)),'П+дверь: подсказка');
  const d=c2.wings[1].doors[0];ok(d&&d.x+d.w<=c2.wings[1].W-60-3+0.01,'П+дверь: дверь Б до планки');
  // узкая — ошибка прохода
  const q=M.norm(JSON.parse(JSON.stringify(p)));q.W=1600;q.sectionsB[1].open=true;const c3=M.calc(q,S1);ok(c3.warn.some(w=>w.lvl==='err'&&/не пройти/.test(w.t)),'П 1600: ошибка прохода');
  // купе в П нельзя
  const z=M.norm(Object.assign(JSON.parse(JSON.stringify(p)),{type:'coupe'}));ok(z.type==='swing','П: купе сбрасывается');
  // 3D
  // текст КП и размеры
  ok(/П-образная/.test(M.kpText?M.kpText(p):'П-образная'),'П: заголовок')}
 // угловая
 {const p=T('Гардеробная угловая 2400 × 1800'),S1=M.effSettings(p),c=M.calc(p,S1),[A,B]=c.wings;
  ok(c.corner&&!c.u&&c.wings.length===2,'Г: две стороны');eq(B.W,1800-560,'Г: Б вплотную');eq(A.bs.L.w,560,'Г: угол без планки');
  eq(A.ws.reduce((a,b)=>a+b,0)+5*t,2400,'Г: сумма секций');eq(hw(c,/^Стяжка межсекционная/),6,'Г: стяжки');ok(c.doorsAll.length===0,'Г: без дверей');
  ok(c.hw.some(h=>/^Полка для обуви выдвижная/.test(h[0])),'Г: выдвижные полки для обуви')}
 // линейная
 {const p=T('Гардеробная линейная 2400'),S1=M.effSettings(p),c=M.calc(p,S1);ok(c.wings.length===1&&c.doorsAll.length===0,'Л: одна сторона без дверей');eq(c.wings[0].ws.reduce((a,b)=>a+b,0)+5*t,2400,'Л: сумма секций');
  ok(!c.warn.some(w=>w.lvl==='err'),'Л: без ошибок '+JSON.stringify(c.warn))}
 // обычный угловой шкаф не изменился: планки и отступ
 {const p=M.newProject();p.shape='corner';const c=M.calc(p,M.effSettings(p));eq(qty(c,'Доборная планка'),2,'шкаф угловой: две планки');ok(c.wings[1].off>0,'шкаф угловой: отступ Б')}
 return{n,bad,info}});
console.log(r.info);r.bad.forEach(x=>console.log('✗',x));console.log('Проверок:',r.n,'Ошибок:',r.bad.length);console.log('js errors',errs);await b.close()})();
