// Проверка: кухня без ручек (Gola), подъёмные фасады, антресоли, фартук/плинтус/подсветка, push-to-open, прихожая
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','index.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8').replace(/^[\s\S]*<body>/,'').replace(/<\/body>[\s\S]*$/,'')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(()=>{
 const M=window.ShkafMaster,fails=[];let checks=0;
 const ok=(c,msg)=>{checks++;if(!c)fails.push(msg)};
 const eq=(a,b,msg,tol=0.6)=>{checks++;if(!(Math.abs(a-b)<=tol))fails.push(`${msg}: ${a} ≠ ${b}`)};
 const errsOf=r=>r.warn.filter(w=>w.lvl==='err').map(w=>w.t);
 const has=(r,re)=>r.warn.some(w=>re.test(w.t||w));
 const km=(type,w,shelves,drawers,extra)=>Object.assign({type,w,shelves:shelves||0,drawers:drawers||3},extra||{});
 const mk=(f,kind)=>{const p=M.newProject();p.kind=kind||'kitchen';f(p);M.norm(p);const S=M.effSettings(p);return{p,S,r:M.calc(p,S)}};
 const hw=(r,re)=>r.hw.find(h=>re.test(h[0]));
 const tpl=n=>{const t=M.builtinTemplates().find(x=>x.name.includes(n));const p=M.fromTemplate(t),S=M.effSettings(p);return{p,S,r:M.calc(p,S)}};
 const sane=(o,tag)=>{const {p,S,r}=o;r.parts.forEach(x=>ok(x.L>0&&x.Wd>0&&x.qty>0,`${tag}: деталь ${x.name}`));
   const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true),k=M.costs(p,S,r,cl,ch);eq(k.rows.reduce((a,x)=>a+x[1]*x[3],0),k.mat,`${tag}: смета`,0.5);ok(M.drillMap(p,S,r).length>0,`${tag}: присадка`)};
 // ---- Gola
 {const o=mk(p=>{p.k.gola=true;p.k.wall=[km('doors',600,2)];p.k.base=[km('doors',600,1),km('drawers',600,0,3),km('dw',600),km('sink',800,0)]}),r=o.r;
  ok(!errsOf(r).length,'Gola: без ошибок '+errsOf(r).join('|'));sane(o,'Gola');
  const d=r.mods.find(m=>m.type==='doors'&&m.zone==='base').fronts[0];eq(d.h,680,'Gola: дверь нижнего 680 (корпус 720)');eq(d.y+d.h,682,'Gola: верх фасада на 682');
  const dr=r.mods.find(m=>m.type==='drawers').fronts.filter(f=>f.kind==='drawer');eq(dr[0].h,(680-60)/3,'Gola: ящики (680−2×30)/3');eq(dr[0].y-(dr[1].y+dr[1].h),30,'Gola: зазор между ящиками 30');
  eq(r.mods.find(m=>m.type==='dw').fronts[0].h,680,'Gola: фасад ПММ 680');
  const wd=r.mods.find(m=>m.zone==='wall').fronts[0];eq(wd.h,736,'Gola: верхний фасад 736');eq(wd.y,-18,'Gola: верхний фасад ниже дна на 20');
  ok(!hw(r,/^Ручка/),'Gola: ручек нет');eq(hw(r,/Gola L/)[1],2.6,'Gola L: 2,6 м');eq(hw(r,/Gola C/)[1],1.2,'Gola C: 600×2 = 1,2 м');
  const dm=M.drillMap(o.p,o.S,r);ok(!dm.some(g=>g.lines.some(l=>/Ручка/.test(l))),'Gola: в присадке нет отверстий под ручки');
  const o2=mk(p=>{p.k.gola=true;p.k.base=[km('tall',600,4),km('doors',600,1)]});ok(hw(o2.r,/^Ручка/)&&hw(o2.r,/^Ручка/)[1]===2,'Gola: у пенала ручки остаются')}
 // ---- газлифт
 {const L=(wallH,w,front)=>mk(p=>{p.k.wallH=wallH;p.mat.front=front||'body';p.k.wall=[km('doors',w,2,3,{open:'lift'})];p.k.base=[km('doors',Math.max(w,300),1)]}).r;
  const kg=(h,w,kgm)=>w*h/1e6*kgm;
  const a=L(360,600),f=a.mods.find(m=>m.zone==='wall').fronts[0];ok(f.kind==='lift','подъёмный фасад');eq(f.kg,kg(356,596,11.2),'вес фасада 356×596 ЛДСП16',0.01);ok(f.N===60,'газлифт 60N для 356 мм и 2,4 кг: '+f.N);
  ok(hw(a,/Газлифт 60N/)[1]===2,'2 газлифта в смете');
  const b2=L(600,900),f2=b2.mods.find(m=>m.zone==='wall').fronts[0];ok(f2.N===(f2.kg<=6?120:150),`596×896, ${f2.kg.toFixed(2)} кг → ${f2.kg<=6?120:150}N: `+f2.N);ok(f2.nh===2,'петель 2 при ширине до 900');
  ok(has(L(720,600),/газлифт не подобрать/),'фасад 716 мм — газлифт не подобрать (ошибка)');
  const c=L(450,600,'mdfmat'),f3=c.mods.find(m=>m.zone==='wall').fronts[0];eq(f3.kg,kg(446,596,16),'МДФ 16 кг/м²',0.01);ok(f3.N===(f3.kg<=4?80:100),'МДФ 446 мм: '+f3.N)}
 // ---- антресоли
 {const o=mk(p=>{p.k.wall2H=400;p.k.wall=[km('doors',600,2),km('doors',800,2),km('gap',600)]});const t2=o.r.mods.filter(m=>m.zone==='wall2');ok(t2.length===2,'антресоли над 2 шкафами (не над проёмом)');
  ok(t2.every(m=>m.y0===1450+720&&m.fronts[0].kind==='lift'&&m.fronts[0].h===396),'антресоль: низ 2170, фасад 396 вверх');sane(o,'антресоли');
  const o2=mk(p=>{p.k.wall2H=400;p.meas.h=['2500','',''];});ok(has(o2.r,/упрутся в потолок: верх на 2570/),'антресоли и потолок 2500 — ошибка');
  const o3=mk(p=>{p.k.wall2H=400;p.k.wall2Open='swing'});ok(o3.r.mods.filter(m=>m.zone==='wall2').every(m=>m.fronts.every(f=>f.kind==='door')),'антресоли распашные')}
 // ---- фартук, плинтус, подсветка
 {const o=mk(p=>{p.k.apron=true;p.k.topPlinth=true;p.k.led=true;p.walls.L=true;p.walls.R=false});const r=o.r,ap=1450-(100+720+38);
  eq(hw(r,/фартук/)[1],+(2400*ap/1e6).toFixed(2),'фартук м²',0.006);eq(hw(r,/Плинтус для столешницы/)[1],(2400+600)/1000,'плинтус: длина + торец у стены',0.006);eq(hw(r,/Подсветка/)[1],2.4,'подсветка 2,4 м',0.006);ok(!!hw(r,/Блок питания/),'блок питания')}
 // ---- push-to-open
 {const o=mk(p=>{p.hw.handle='push'});ok(!!hw(o.r,/Толкатель push-to-open/),'толкатели в смете');ok(o.r.notes.some(n=>/без доводчика/.test(n)),'подсказка про петли без доводчика');
  ok(!M.drillMap(o.p,o.S,o.r).some(g=>g.lines.some(l=>/Ручка/.test(l))),'push: без отверстий под ручки')}
 // ---- шаблоны
 ['Кухня без ручек','Прихожая','Шкаф до потолка','Кухня угловая'].forEach(n=>{const o=tpl(n);ok(!errsOf(o.r).length,`шаблон «${n}» без ошибок: `+errsOf(o.r).join(' | '));sane(o,n)});
 ['Кухня без ручек','Кухня угловая'].forEach(n=>{const o=tpl(n);ok(o.r.mods.some(m=>m.hob)&&!has(o.r,/нет варочной панели|висит обычный шкаф/),`шаблон «${n}»: панель под вытяжкой`)});
 // ---- прихожая
 {const o=tpl('Прихожая'),r=o.r,w=r.wings[0];ok(!w.doors.some(d=>d.sec===1),'открытая секция без двери');ok(w.doors.length>0&&w.doors.every(d=>d.sec!==1),'двери только на закрытых секциях');
  ok(!!r.parts.find(x=>/Сиденье/.test(x.name))&&!!r.parts.find(x=>/Планка для крючков/.test(x.name)),'сиденье и планка в деталях');eq(hw(r,/Крючок/)[1],5,'5 крючков');
  const dm=M.drillMap(o.p,o.S,r),tx=dm.map(g=>g.name+': '+g.lines.join(' | ')).join('\n');
  ok(/Планка для крючков/.test(tx),'присадка планки');
  const t=16,pl=o.p.plinth;ok(new RegExp(`Сиденье \\(неподвижно\\): конфирмат Ø7 сквозное — Y ${442-pl-t}`).test(tx),'сиденье на перегородке: Y от низа перегородки');
  {const o1=mk(p=>{p.sections=[Object.assign({shelves:1,rod:false,drawers:0,baskets:0},{seat:true,shoes:1,open:true})];p.W=900},'wardrobe');const tx1=M.drillMap(o1.p,o1.S,o1.r).map(g=>g.lines.join('|')).join('\n');ok(/Сиденье \(неподвижно\): конфирмат Ø7 сквозное — Y 442/.test(tx1),'сиденье у боковины: Y 442 (450 − 8)')}
  const e1=mk(p=>{p.sections=[Object.assign(sec(1,true,0,0),{hooks:3})]},'wardrobe');ok(has(e1.r,/и штанга, и крючки/),'штанга+крючки — ошибка');
  const e2=mk(p=>{p.sections=[Object.assign(sec(0,false,2,0),{seat:true,shoes:1})]},'wardrobe');ok(has(e2.r,/сиденье и ящики/),'сиденье+ящики — ошибка');
  const e3=mk(p=>{p.H=1600;p.mezz=false;p.sections=[Object.assign(sec(0,false,0,0),{hooks:3,open:true})]},'wardrobe');ok(has(e3.r,/крючки вешаются на 1600–1700/),'крючки в низком шкафу — ошибка');
  const e4=mk(p=>{p.sections=[Object.assign(sec(0,false,0,0),{hooks:3})]},'wardrobe');ok(has(e4.r,/отметьте «Без двери»/),'крючки за дверью — подсказка')}
 function sec(shelves,rod,drawers,baskets){return{shelves,rod,drawers,baskets}}
 return{checks,fails,errs:[]}});
console.log('Проверок:',res.checks,'Ошибок:',res.fails.length);res.fails.forEach(f=>console.log(' -',f));console.log('js errors',errs);await b.close()})();
