// v52: кровать с подъёмным механизмом и кровать с ящиками — ответы посчитаны вручную (ЛДСП 16 мм)
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const E=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);const W=c=>c.warn.map(w=>w.t||w);const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[]);
 const part=(c,nm)=>c.parts.filter(x=>x.name===nm);const has=(c,nm,L,Wd,q)=>part(c,nm).some(x=>((x.L===L&&x.Wd===Wd)||(x.L===Wd&&x.Wd===L))&&x.qty===q);
 const bed=bd=>{const p=M.newProject();p.kind='chest';p.c={W:1000,H:1000,D:2000,plinth:0,legs:0,cols:[{type:'drawers',drawers:3,shelves:0}],bed:bd};M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const L0={type:'lift',mW:1600,mL:2000,mH:200,boxH:350,head:1000,mKg:26,dN:3,dSide:'both'};
 {const {p,S,c}=bed({...L0});ok(S.t===16,'ЛДСП 16');
  ok(p.c.W===1642&&p.c.D===2042&&p.c.H===1000,'габарит 1642×2042, высота 1000: '+[p.c.W,p.c.D,p.c.H]);
  ok(has(c,'Изголовье',1642,1000,1),'изголовье 1642×1000');ok(has(c,'Изножье',1610,350,1),'изножье 1610×350');
  ok(has(c,'Боковина кровати',2026,350,2),'боковины 2026×350 ×2 (2042−16)');ok(has(c,'Царга продольная (средняя)',2010,250,1),'средняя царга 2010×250');
  ok(has(c,'Дно ниши для хранения',2010,797,2),'дно 2×797×2010 ((1610−16)/2)');
  ok(hw(c,/^Газлифт для кровати/)[0]==='Газлифт для кровати 1400 Н'&&hw(c,/^Газлифт для кровати/)[1]===2,'газлифты 1400 Н ×2 (960+312=1272→1400)');
  ok(hw(c,/^Механизм подъёма/)[1]===1,'механизм — 1 пара');ok(hw(c,/^Основание ортопедическое/)[1]===3.2,'основание 3,2 м²');
  ok(hw(c,/^Конфирмат/)[1]===22,'конфирматы 16+6 = 22: '+hw(c,/^Конфирмат/)[1]);ok(hw(c,/^Брусок опорный/)[1]===11.26,'бруски 2×(2010+1610)+2×2010 = 11,26 м: '+hw(c,/^Брусок опорный/)[1]);
  ok(hw(c,/^Подпятник/)[1]===8,'подпятники 8');ok(!hw(c,/^Ручка/).length&&!hw(c,/^Направляющие/).length,'без ручек и направляющих');
  ok(!c.warn.length,'без замечаний: '+W(c).join('|'));ok(c.notes.some(t=>/Верх матраса — 500 мм/.test(t)),'верх матраса 350−80+30+200 = 500');
  ok(!c.parts.some(x=>/Задняя стенка|ХДФ/i.test(x.name)),'без задней стенки');
  ok(hw(c,/^Основание ортопедическое/)[3]===S.p.bedBase&&S.p.bedBase===2500,'цена основания из настроек');
  const sc=M.scene3dData?null:null;}
 {const {c}=bed({...L0,type:'drawers',boxH:380});
  ok(!part(c,'Боковина кровати').length,'с двух сторон ящики — боковин нет');
  ok(has(c,'Царга над ящиками',2026,100,2)&&has(c,'Цоколь под ящиками',2026,60,2),'царги 2026×100 и цоколи 2026×60 по 2');
  ok(has(c,'Стенка ящичного отсека (средняя)',2010,300,1),'средняя стенка 2010×300 (380−80)');ok(has(c,'Перегородка ящиков',280,797,4),'перегородки 280×797 ×4');
  ok(has(c,'Фасад ящика',667,214,6),'фасады 667×214 ×6 (2010/3−3; 380−166)');
  ok(hw(c,/^Направляющие 550/)[1]===6,'направляющие 550 ×6 (глубина 813)');ok(hw(c,/^Ручка/)[1]===6,'ручки 6');
  ok(hw(c,/^Конфирмат/)[1]===80,'конфирматы 12+8+12+48 = 80: '+hw(c,/^Конфирмат/)[1]);ok(hw(c,/^Уголок мебельный/)[1]===8,'уголки 8');
  ok(hw(c,/^Брусок опорный/)[1]===7.24,'бруски 7,24 м');ok(!hw(c,/^Газлифт/).length&&!hw(c,/^Механизм/).length,'без механизма');
  const sides=c.parts.filter(x=>x.name==='Ящик: боковина'||x.name==='Ящик: перед и зад'||/^Ящик/.test(x.name));ok(sides.length>0,'короба ящиков есть');
  ok(!E(c).length,'без ошибок: '+E(c).join('|'));ok(c.notes.some(t=>/не меньше 700 мм/.test(t)),'свободно сбоку 550+150');}
 {const {c}=bed({...L0,type:'drawers',boxH:380,mW:900,dSide:'R'});
  ok(has(c,'Боковина кровати',2026,380,1),'одна боковина слева');ok(has(c,'Стенка ящичного отсека',2010,300,1),'стенка отсека');ok(has(c,'Изголовье',942,1000,1),'изголовье 942');
  ok(has(c,'Перегородка ящиков',280,584,2),'перегородки 280×584 ×2 (600−16)');ok(hw(c,/^Направляющие 550/)[1]===3,'3 пары 550');
  ok(hw(c,/^Конфирмат/)[1]===8+6+8+6+24,'конфирматы 8+6+8+6+24 = 52: '+hw(c,/^Конфирмат/)[1]);}
 {const {c}=bed({...L0,type:'drawers',boxH:250});ok(E(c).some(t=>/Фасад ящика кровати 84 мм/.test(t)),'низкий короб — ошибка: '+E(c).join('|'));}
 {const {c}=bed({...L0,boxH:250});ok(W(c).some(t=>/Высота короба 250 мм/.test(t)),'механизму мало высоты');}
 {const {c}=bed({...L0,head:600});ok(W(c).some(t=>/Изголовье 600 мм выше матраса всего на 100/.test(t)),'низкое изголовье');}
 {const {c}=bed({...L0,mL:2300});ok(W(c).some(t=>/нестандартный размер/.test(t)),'нестандартный матрас');}
 {const {c}=bed({...L0,mW:900,mKg:15});ok(hw(c,/^Газлифт для кровати/)[0]==='Газлифт для кровати 800 Н','90×200, 15 кг → 800 Н');ok(!part(c,'Царга продольная (средняя)').length&&has(c,'Дно ниши для хранения',2010,910,1),'узкая — дно целое 910');}
 {const {c}=bed({...L0,head:0});ok(has(c,'Царга изголовья',1642,350,1),'без изголовья — царга 350');}
 // документы, присадка, 3D
 const out={};
 for(const t of ['lift','drawers']){const {p,S,c}=bed({...L0,type:t});const r=M.__render(p);ok(r.svg===2,t+': два чертежа');ok(r.scene>8,t+': 3D деталей '+r.scene);
  const dm=M.drillMap(p,S,c);ok(dm.length>=3&&!JSON.stringify(dm).match(/NaN|undefined/),t+': присадка');
  const html=document.getElementById('front').innerHTML;ok(!/NaN|undefined/.test(html),t+': чертёж без NaN');ok(/Вид сверху/.test(html),t+': вид сверху');
  const sd=M.scene3dData();ok(!JSON.stringify(sd).match(/NaN|null/),t+': 3D без NaN');out[t]=sd.groups.length;
  const kp=M.__hooks.offerText();ok(/Кровать/.test(kp),t+': в КП — кровать');}
 ok(out.lift===1&&out.drawers===3,'группы 3D: подъёмная 1, с ящиками 3 (два отсека повёрнуты)');
 {const {p}=bed({...L0});M.__render(p);const sd=M.scene3dData();const lifts=sd.groups[0].items.filter(x=>x.lift);ok(lifts.length===2&&lifts.every(x=>x.lift.bed&&x.lift.hy===500&&x.lift.z===21),'подъём: ось у изголовья на верху матраса (500)');}
 return{n,bad}});
console.log(r.bad.length?'✗ '+r.bad.join('\n✗ '):`✓ все ${r.n} проверок`,'errs',errs);await b.close()})();
