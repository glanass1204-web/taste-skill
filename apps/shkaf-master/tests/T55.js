// v55: инструмент и оснастка на заказ, кондуктор 32 — проверки по составу заказа
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const run=(p,jig)=>{M.norm(p);const S={...M.effSettings(p),jig:jig||'none'},c=M.calc(p,S),dm=M.drillMap(p,S,c);return{p,S,c,dm,T:M.toolsFor(p,S,c,dm)}};
 const ids=T=>T.list.map(t=>t.id);
 // шкаф распашной по умолчанию
 {const p=M.newProject();p.hw=p.hw||{};p.hw.handle='r128';const {T,c}=run(p);const I=ids(T);
  ok(['screw','tape','clamp','level','awl','f35','stop35','confd','hex','d5'].every(x=>I.includes(x)),'основное и свёрла: '+I);
  ok(I.includes('tplS')&&I.includes('jigC')&&I.includes('jigH')&&I.includes('jigR'),'без кондуктора — шаблоны отдельно');
  ok(!I.includes('d8')&&!I.includes('jigsaw')&&!I.includes('miter'),'лишнего нет (Ø8, лобзик, торцовка)');
  ok(I.includes('perf')===c.hw.some(h=>/Крепление к стене|Навес|Шина|Дюбель/.test(h[0])),'перфоратор — только если крепим к стене');
  const need=T.list.filter(t=>t.need).reduce((a,t)=>a+t.price,0);ok(need>0&&T.list.filter(t=>!t.need).every(t=>/Оснастка|Сверлить|Установка/.test(t.grp)),'желательное — оснастка, подложка, станки');
  ok(T.notes.some(x=>/шаблон 1:1/.test(x)),'подсказка про шаблон 1:1')}
 // кондуктор 32: ряд и ближайшие отверстия — пересчёт здесь
 {const p=M.newProject();const {T,dm}=run(p,'32');const I=ids(T);ok(I.includes('jig32')&&!I.includes('tplS')&&!I.includes('jigC')&&!I.includes('jigS'),'кондуктор 32 заменяет шаблоны');
  let cnt=0;dm.forEach(g=>g.lines.forEach((l,i)=>{const m=/^((?:Левая|Правая) сторона\. )?(?:Полки для обуви: полкодержатели|Полкодержатели)[^:]*:? .*Y \(низ полки\) (.+)$/.exec(l);if(!m)return;
   const ys=(m[2].match(/-?\d+(\.\d+)?/g)||[]).map(Number),y0=Math.min(...ys),k=Math.round((Math.max(...ys)-y0)/32),snap=ys.map(y=>y0+32*Math.round((y-y0)/32));
   const want=`${m[1]||''}Кондуктор 32: ряд через 32 мм от Y ${Math.round(y0*2)/2} до Y ${Math.round((y0+32*k)*2)/2} (${k+1} отв. в ряду`;const has=g.lines.find(x=>x.startsWith(want));
   ok(!!has,g.name+': строка ряда '+want);if(has){cnt++;const sn=(has.split('полки ставьте на Y ')[1].match(/-?\d+(\.\d+)?/g)||[]).map(Number);ok(sn.length===ys.length&&sn.every((v,j)=>Math.abs(v-snap[j])<0.6&&Math.abs(v-ys[j])<=16.01),'ближайшие отверстия ряда не дальше 16 мм: '+sn)}}));
  ok(cnt>=2,'строк кондуктора: '+cnt);
  const P_=M.drillParse(dm.find(g=>g.lines.some(l=>/Кондуктор 32/.test(l))));ok(P_&&!P_.bad&&!P_.skip.some(l=>/Кондуктор 32/.test(l)),'на картинке строка кондуктора — пояснение')}
 {const p=M.newProject();const {dm}=run(p,'none');ok(!dm.some(g=>g.lines.some(l=>/Кондуктор 32/.test(l))),'без кондуктора 32 — строк ряда нет')}
 // кнопка-ручка без межосевого — нет Ø5 под ручки и шаблона ручек
 {const p=M.newProject();p.hw=p.hw||{};p.hw.handle='knob';const {T}=run(p);const I=ids(T);ok(!I.includes('jigR')&&!I.includes('board'),'кнопка — без шаблона ручек')}
 // кухня: перфоратор, лобзик под мойку
 {const p=M.newProject();p.kind='kitchen';const {T}=run(p);const I=ids(T);ok(I.includes('perf')&&I.includes('dconc')&&I.includes('jigsaw'),'кухня: перфоратор, свёрла по бетону, лобзик: '+I)}
 // купе — торцовка (желательно), кромка 0,4 — утюг
 {const p=M.newProject();p.type='coupe';p.mat.edgeF='0.4';p.mat.edgeB='0.4';const {T}=run(p);const I=ids(T);ok(I.includes('miter')&&!T.list.find(t=>t.id==='miter').need,'купе: торцовка — желательно');ok(I.includes('iron'),'кромка 0,4 — утюг');ok(!T.notes.some(x=>/дешевле заказать в цехе/.test(x)),'для 0,4 подсказки про цех нет')}
 {const p=M.newProject();const {T}=run(p);ok(T.notes.some(x=>/дешевле заказать в цехе/.test(x))&&!ids(T).includes('iron'),'кромка ПВХ — подсказка про цех, без утюга')}
 // кровать: Ø8
 {const p=M.newProject();p.kind='chest';p.c={W:1000,H:1000,D:600,plinth:0,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}],bed:{type:'lift',mW:1600,mL:2000,mH:200,boxH:350,head:1000,mKg:26}};const {T}=run(p);ok(ids(T).includes('d8'),'кровать: сверло Ø8')}
 return{n,bad}});
console.log(r.bad.length?'✗ '+r.bad.join('\n✗ '):`✓ все ${r.n} проверок`,'errs',errs);await b.close()})();
