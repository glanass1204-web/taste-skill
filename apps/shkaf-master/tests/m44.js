// v44: пожелания клиента, робот-пылесос, стена, удобство шкафа — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const run=(kind,f)=>{const p=M.newProject();p.kind=kind;f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const W=c=>c.warn.map(w=>w.t||w);const has=(c,re)=>W(c).some(t=>re.test(t));const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;
 const sec=(sh,rod)=>({shelves:sh,rod,drawers:0,baskets:0});
 const wr=f=>run('wardrobe',p=>{p.type='swing';p.shape='straight';p.W=1600;p.H=2400;p.D=600;p.plinth=80;p.mirrors=0;p.mezz=true;p.mezzH=450;p.sections=[sec(4,false),sec(0,true)];f&&f(p)});
 // пожелания
 {const a=wr(p=>p.wishes=[{t:'верх до потолка',done:false},{t:'  ',done:false}]);ok(W(a.c).filter(t=>/Пожелание клиента/.test(t)).length===1&&has(a.c,/«верх до потолка»/),'неучтённое пожелание — одно предупреждение (пустое не считается)');
  const b2=wr(p=>p.wishes=[{t:'верх до потолка',done:true}]);ok(!has(b2.c,/Пожелание клиента/),'учтённое — без предупреждения')}
 // робот-пылесос: ножки 100, робот 95 → нужно 105
 {const a=run('chest',p=>{p.c.legs=100;p.c.plinth=0;p.meas.robot='95'});ok(has(a.c,/Робот-пылесос 95 мм не проедет под ножками 100 мм — нужны ножки от 105 мм/),'робот 95 под ножками 100 — предупреждение');
  const b2=run('chest',p=>{p.c.legs=100;p.c.plinth=0;p.meas.robot='85'});ok(!has(b2.c,/Робот/),'робот 85 проезжает (100 ≥ 95)')}
 // стена: кухня с верхними шкафами
 const kit=f=>run('kitchen',p=>{p.k.wall=[{type:'doors',w:600,shelves:2,drawers:3},{type:'doors',w:400,shelves:2,drawers:3}];f&&f(p)});
 {const a=kit(p=>p.meas.wall='gkl');ok(has(a.c,/гипсокартона: навесные шкафы на него вешать нельзя/),'гипсокартон без закладной — предупреждение');
  const b2=kit(p=>{p.meas.wall='gkl';p.meas.checks.embed=true});ok(!has(b2.c,/гипсокартон/),'с закладной — без предупреждения');
  const g=kit(p=>p.meas.wall='gas'),hang=hw(g.c,/^Навес/),fix=g.c.hw.filter(h=>/^Крепление .*к стене/.test(h[0])).reduce((a,h)=>a+h[1],0);
  ok(hang===4,'навесов 4 (2 верхних модуля × 2): '+hang);ok(hw(g.c,/^Дюбель для газобетона/)===hang+2*fix,`дюбелей для газобетона ${hang}+2×${fix}`);
  const k0=kit(),k1=kit(p=>p.meas.wall='concrete');ok(k1.c.hw.length===k0.c.hw.length,'бетон — смета без изменений')}
 {const a=wr(p=>p.meas.wall='gas');ok(hw(a.c,/^Дюбель для газобетона/)===2*2,'шкаф на газобетоне: 2 уголка × 2 дюбеля = 4');ok(!has(a.c,/навесы и шину/),'шкаф: без текста про навесы')}
 // удобство: без антресоли штанга на 2400−(16+70)=2314 мм
 {const a=wr(p=>p.mezz=false);ok(W(a.c).filter(t=>/Секция 2: штанга на высоте 2314 мм/.test(t)).length===1,'штанга 2314 мм — одно предупреждение (без дублей): '+W(a.c).filter(t=>/штанга/.test(t)).join('|'));
  const b2=wr();ok(!has(b2.c,/штанга на высоте/),'с антресолью 450: штанга 2400−466−70=1864 — без предупреждения');
  const c2=wr(p=>{p.mezz=false;p.sections[1].panto=true});ok(!has(c2.c,/штанга на высоте/),'пантограф — без предупреждения')}
 {const a=wr(p=>p.sections=[sec(2,false),sec(0,true)]);ok(has(a.c,/Секция 1: между полками \d+ мм/),'2 полки в высокой секции — редко');const b2=wr(p=>p.sections=[sec(6,false),sec(0,true)]);ok(!has(b2.c,/между полками/),'6 полок — нормально')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
