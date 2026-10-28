// v54: картинки присадки, шаблон 1:1, ручки на фасадах целиком, петли на низких фасадах — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const run=p=>{M.norm(p);const S=M.effSettings(p),c=M.calc(p,S);return{p,S,c,dm:M.drillMap(p,S,c)}};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);
 const holesD=(P_,d)=>P_.holes.filter(h=>h.d===d);
 // 1. шкаф по умолчанию: дверь — чашки в 22 мм от края петель, ручка в 50 мм от края открывания
 {const p=M.newProject();p.hw=p.hw||{};p.hw.handle='r128';const {dm}=run(p);const g=dm.find(x=>/^Дверь 1$/.test(x.name));const P_=M.drillParse(g);
  ok(P_&&!P_.bad,'дверь: картинка есть');const cups=holesD(P_,35);ok(cups.length>=4&&cups.every(h=>h.x===22||h.x===P_.W-22),'чашки Ø35 в 22 мм от края: '+cups.map(h=>h.x+'/'+h.y).join(' '));
  ok(cups.some(h=>h.y===100)&&cups.some(h=>h.y===P_.H-100),'крайние петли в 100 мм от низа и верха');
  const hd=holesD(P_,5);ok(hd.length===2&&hd[0].x===hd[1].x&&Math.abs(Math.abs(hd[0].y-hd[1].y)-128)<0.01,'ручка 128: два отверстия на расстоянии 128');
  const side=dm.find(x=>/^Боковина левая$/.test(x.name)),PS=M.drillParse(side);ok(PS&&!PS.bad&&PS.W===p.D&&PS.H===p.H,'боковина '+p.H+'×'+p.D);
  ok(PS.holes.filter(h=>h.d===7).length>=6,'конфирматы крыши и дна на картинке');
  const html=M.drillPicHTML(g);ok(/<svg/.test(html)&&/Шаблон 1:1/.test(html)&&!/NaN|undefined/.test(html),'картинка двери без NaN');
  const t=M.drillTemplate(side);ok((t.match(/class="tpl-page"/g)||[]).length>=1&&(t.match(/контроль: ровно 100 мм/g)||[]).length===1&&/width="180mm"/.test(t)&&!/NaN|undefined/.test(t),'шаблон 1:1: листы A4, одна контрольная линейка');
  const pages=(t.match(/class="tpl-page"/g)||[]).length,cols=Math.ceil((p.D-10)/170),rows=Math.ceil((p.H-10)/252);ok(pages<=cols*rows,'пустые листы не печатаются: '+pages+' из '+cols*rows)}
 // 2. кухня, ручка 320 (длина 360): низ — сверху, верх — снизу, обе целиком на фасаде с запасом 40 мм
 {const p=M.newProject();p.kind='kitchen';p.k.gola=false;p.hw=p.hw||{};p.hw.handle='r320';const {c,dm}=run(p);
  const lo=dm.find(x=>/^Н1: фасад/.test(x.name)),up=dm.find(x=>/^В1: фасад/.test(x.name));const PL=M.drillParse(lo),PU=M.drillParse(up);
  ok(PL&&!PL.bad&&PU&&!PU.bad,'кухонные фасады с картинкой');const hl=holesD(PL,5).map(h=>h.y).sort((a,b)=>a-b),hu=holesD(PU,5).map(h=>h.y).sort((a,b)=>a-b);
  const H1=PL.H,cyL=H1-Math.max(H1*.08+Math.min(160,H1*.25)/2,220);ok(Math.abs(hl[0]-(cyL-160))<0.6&&Math.abs(hl[1]-(cyL+160))<0.6&&hl[1]<=H1-40,`низ ${H1}: ручка ${hl} (центр ${cyL})`);
  ok(Math.abs(hu[0]-60)<0.6&&Math.abs(hu[1]-380)<0.6,'верх: центр 220 → 60 и 380: '+hu);ok(!E(c).some(t=>/на дверцу/.test(t))&&E(c).some(t=>/Н2: ручка 360 мм не помещается на фасад ящика 396/.test(t)),'двери без ошибок; ящик 400 с ручкой 360 — ошибка (верно): '+E(c).join('|'))}
 // 3. низкий фасад 190 мм: петли 51 и 139, ручка 160 (длина 200) — поперёк, посередине высоты
 {const cy=[];M.builtinTemplates().forEach(t=>{const p=M.fromTemplate(t);if(p.kind!=='kitchen')return;p.hw=p.hw||{};p.hw.handle='r160';const {dm,c}=run(p);dm.filter(g=>/^\d+×/.test(g.size)&&+g.size.split('×')[0]<260&&/фасад/.test(g.name)&&g.lines.some(l=>/Чашки/.test(l))).forEach(g=>cy.push([g,M.drillParse(g),c]))});
  ok(cy.length>0,'нашлись низкие фасады в шаблонах кухни: '+cy.length);
  cy.forEach(([g,P_,c])=>{const e=Math.max(38,Math.round(P_.H*.27)),ys=holesD(P_,35).map(h=>h.y).sort((a,b)=>a-b);ok(ys[0]===e&&Math.abs(ys[ys.length-1]-(P_.H-e))<0.01,`${g.name} ${g.size}: петли ${ys} (ждём ${e} и ${P_.H-e})`);
   const hd=holesD(P_,5);ok(hd.length===2&&hd[0].y===P_.H/2&&hd[1].y===P_.H/2&&Math.abs(Math.abs(hd[0].x-hd[1].x)-160)<0.01&&Math.min(hd[0].x,hd[1].x)>=40,`${g.name}: ручка поперёк на ${P_.H/2}: `+hd.map(h=>h.x+'/'+h.y))})}
 // 4. дверца над стиральной машиной: ручка снизу (как на чертеже и в 3D)
 {const p=M.newProject();p.kind='chest';p.c=JSON.parse(JSON.stringify({W:1300,H:2000,D:600,plinth:60,legs:0,cols:[{type:'washer',drawers:0,shelves:2},{type:'door',drawers:0,shelves:4}]}));p.hw=p.hw||{};p.hw.handle='r128';
  const {dm,S}=run(p);const g=dm.find(x=>/дверца над машиной/.test(x.name)),P_=M.drillParse(g);const hd=holesD(P_,5).map(h=>h.y).sort((a,b)=>a-b);
  const dh=2000-900-2*S.t-4;ok(+g.size.split('×')[0]===dh,'дверца над машиной '+dh);const a=Math.min(140,dh*.3)/2;ok(Math.abs((hd[0]+hd[1])/2-Math.max(40+a,40+84))<0.01&&hd[0]<dh/2,'ручка внизу дверцы: '+hd);
  const g2=dm.find(x=>/^Колонка 2: дверца/.test(x.name)),P2=M.drillParse(g2),h2=holesD(P2,5).map(h=>h.y);ok(Math.min(...h2)>P2.H/2,'обычная дверца — ручка сверху')}
 // 5. ручка не помещается ни вдоль, ни поперёк — ошибка
 {const p=M.newProject();p.kind='chest';p.c={W:300,H:300,D:300,plinth:0,legs:0,cols:[{type:'door',drawers:0,shelves:0}]};p.hw=p.hw||{};p.hw.handle='r320';const {c,dm}=run(p);
  ok(E(c).some(t=>/не помещается на дверцу/.test(t)),'маленькая дверца, ручка 320 — ошибка');ok(dm.some(g=>g.lines.some(l=>/Ручка не помещается на этот фасад/.test(l))),'в присадке — предупреждение вместо отверстий')}
 // 6. кровать и чердак — картинки строятся, точки на деталях
 for(const bd of [{type:'drawers',mW:1600,mL:2000,mH:200,boxH:380,head:1000,dN:3,dSide:'both'},{type:'loft',mW:900,mL:2000,mH:120,loftH:1500,rail:350,under:'desk',ladder:'R'}]){
  const p=M.newProject();p.kind='chest';p.c={W:1000,H:1000,D:600,plinth:0,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}],bed:bd};const {dm}=run(p);
  const ps=dm.map(g=>M.drillParse(g));ok(ps.every(x=>x&&!x.bad),bd.type+': все картинки на детали');ok(ps.filter(x=>x.holes.length+x.edges.length).length>=3,bd.type+': картинок '+ps.filter(x=>x.holes.length).length)}
 {const p=M.newProject();p.kind='chest';p.c={W:1000,H:1000,D:600,plinth:0,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}],bed:{type:'loft',mW:900,mL:2000,mH:120,loftH:1500,rail:350,under:'desk',ladder:'R'}};const {dm}=run(p);
  const st=M.drillParse(dm.find(g=>g.name==='Тетива лестницы'));ok(st.holes.length===10&&st.holes.every(h=>h.x===50||h.x===100),'тетива: 5 ступенек × 2 отверстия, X 50 и 100');
  const y1=Math.min(...st.holes.map(h=>h.y));ok(Math.abs(y1-(1550/6-8))<0.6,'первая ступенька: центр отверстия на 258,3 − 8 = '+y1)}
 return{n,bad}});
console.log(r.bad.length?'✗ '+r.bad.join('\n✗ '):`✓ все ${r.n} проверок`,'errs',errs);await b.close()})();
