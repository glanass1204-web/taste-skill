// v46: стол, тумба под раковину, стеллаж, гладильная доска — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const col=(type,drawers,shelves)=>({type,drawers,shelves});
 const ch=c0=>{const p=M.newProject();p.kind='chest';p.c=c0;M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const W=c=>c.warn.map(w=>w.t||w);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;
 const P=(c,re)=>c.parts.filter(x=>re.test(x.name)).map(x=>x.L+'x'+x.Wd+'x'+x.qty+(x.mat==='hdf'?'h':'')).sort().join(',');
 // стол 1200×750×600: колонки по 576, тумба справа
 {const {p,S,c}=ch({W:1200,H:750,D:600,plinth:0,legs:0,cols:[col('knee',0,0),col('drawers',3,0)]});ok(S.t===16,'t16');
  ok(P(c,/^Дно$/)==='576x600x1','дно только под тумбой 576×600: '+P(c,/^Дно$/));ok(P(c,/^Стойка у ниши/)==='734x600x1','стойка у ниши до пола 734: '+P(c,/^Стойка/));
  ok(!P(c,/^Перегородка$/),'обычных перегородок нет');ok(P(c,/^Боковина$/)==='734x600x2','боковины 734');ok(P(c,/Царга задняя \(ниша/)==='576x300x1','царга ниши 576×300');
  ok(P(c,/^Крышка$/)==='1200x600x1','крышка во всю ширину');ok(P(c,/^Задняя стенка$/)==='730x604x1h','задняя стенка только у тумбы: 730×604 (1200−592−4): '+P(c,/^Задняя стенка$/));
  ok(P(c,/^Фасад ящика$/)==='576x241x3'||P(c,/^Фасад ящика$/).startsWith('5')&&/x241x3/.test(P(c,/^Фасад ящика$/)),'3 ящика по (731−6)/3 → 241: '+P(c,/^Фасад ящика$/));
  ok(!E(c).length,'без ошибок: '+E(c).join('|'));ok(W(c).some(t=>/ниша для ног 576 мм — тесно/.test(t)),'ниша 576 — подсказка');
  const s=M.__render(p);ok(s.svg>0&&s.scene>0&&s.drill>0,'чертёж, 3D, сверловка');const d=M.drillMap(p,S,c);ok(d.some(x=>/Стойка у ниши/.test(x.name)&&x.size==='734×600'),'сверловка: стойка 734×600')}
 {const {c}=ch({W:900,H:750,D:600,plinth:0,legs:0,cols:[col('knee',0,0),col('drawers',3,0)]});ok(E(c).some(t=>/ниша для ног 426 мм — уже 500/.test(t)),'стол 900 на 2 колонки: ниша 426 — ошибка')}
 {const {c}=ch({W:1200,H:750,D:600,plinth:0,legs:0,cols:[col('knee',0,0),col('knee',0,0)]});ok(E(c).some(t=>/колонки — ниши/i.test(t)),'одни ниши — ошибка')}
 // стол с цоколем 60: цоколь только под тумбой
 {const {c}=ch({W:1400,H:750,D:600,plinth:60,legs:0,cols:[col('drawers',3,0),col('knee',0,0),col('door',0,2)]});ok(P(c,/^Цоколь$/)==='443x60x2','цоколь — два куска по 443 (1400/3−16−8) под тумбами: '+P(c,/^Цоколь$/));ok(P(c,/^Стойка у ниши/).endsWith('x2'),'две стойки у ниши')}
 // тумба под раковину 600×700×470 на ножках 100: корпус 600, боковины 600, царги 568×100, крышки нет
 {const {p,S,c}=ch({W:600,H:700,D:470,plinth:0,legs:100,vanity:true,cols:[col('drawers',2,0)]});
  ok(P(c,/^Боковина$/)==='600x470x2','боковины во всю высоту 600: '+P(c,/^Боковина$/));ok(P(c,/^Царга под раковину$/)==='568x100x2','царги 568×100');ok(!P(c,/^Крышка$/),'крышки нет');
  const sl=c.hw.filter(h=>/^Направляющие/.test(h[0])).map(h=>[+h[0].match(/(\d+) мм/)[1],h[1]]);ok(sl.length===2&&sl.every(x=>x[1]===1)&&sl[0][0]-sl[1][0]>=150,'направляющие разной длины (нижний полный, верхний короче): '+JSON.stringify(sl));
  ok(W(c).some(t=>/влагостойкая/.test(t)),'подсказка про влагостойкую');ok(c.notes.some(t=>/сифон/.test(t)),'заметка про сифон');ok(!hw(c,/Эксцентриковая/),'без стяжек крышки');
  const s=M.__render(p);ok(s.scene>0,'3D тумбы');const d=M.drillMap(p,S,c);ok(d.some(x=>/Царга под раковину/.test(x.name)),'сверловка: царги')}
 {const {c}=ch({W:600,H:550,D:470,plinth:0,legs:0,vanity:true,cols:[col('drawers',2,0)]});ok(hw(c,/Навес регулируемый \(подвесная/)===2&&!hw(c,/Подпятник/),'подвесная: 2 навеса, без подпятников')}
 {const {c}=ch({W:600,H:700,D:470,plinth:0,legs:100,vanity:true,cols:[col('drawers',2,0)]});const p2=M.newProject();p2.kind='chest';p2.mat.body='uvadrevW16';p2.c={W:600,H:700,D:470,plinth:0,legs:100,vanity:true,cols:[col('drawers',2,0)]};M.norm(p2);const c2=M.calc(p2,M.effSettings(p2));ok(!W(c2).some(t=>/влагостойкая/.test(t)),'влагостойкая ЛДСП — без подсказки')}
 // стеллаж 800×2000×300: 10 полок, крепление к стене
 {const {c}=ch({W:800,H:2000,D:300,plinth:60,legs:0,cols:[col('open',0,5),col('open',0,5)]});ok(P(c,/^Полка$/)==='374x280x10','10 полок 374×280 (колонка 800/2−16−8=376, минус 2; 300−20): '+P(c,/^Полка$/));ok(hw(c,/Крепление к стене от опрокидывания/)===2,'высокий — 2 крепления к стене');ok(!E(c).length,'без ошибок')}
 {const {c}=ch({W:800,H:850,D:450,plinth:60,legs:0,cols:[col('drawers',4,0)]});ok(!hw(c,/Крепление к стене/),'обычный комод — без крепления')}
 // гладильная доска: секция 600, глубина 600
 const wr=f=>{const p=M.newProject();p.type='swing';p.shape='straight';p.W=1200;p.H=2400;p.D=600;p.sections=[{shelves:3,rod:false,drawers:0,baskets:0},{shelves:0,rod:true,drawers:0,baskets:0}];f(p);M.norm(p);const S=M.effSettings(p);return M.calc(p,S)};
 {const c=wr(p=>p.sections[0].iron=true);ok(hw(c,/Гладильная доска встроенная/)===1,'доска в смете');ok(c.parts.some(x=>/Полка под гладильную доску/.test(x.name)),'неподвижная полка под доску');ok(!E(c).length,'без ошибок')}
 {const c=wr(p=>{p.type='coupe';p.D=560;p.sections[0].iron=true});ok(E(c).some(t=>/глубина ниши от 510 мм, а здесь 460 мм/.test(t)),'купе 560: ниша 460 — ошибка')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
