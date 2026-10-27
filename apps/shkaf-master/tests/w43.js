// v43: задняя стенка, шкаф до потолка, вырез под плинтус — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const W=f=>{const p=M.newProject();p.kind='wardrobe';p.type='swing';p.shape='straight';p.W=1800;p.H=2400;p.D=600;p.plinth=80;p.mirrors=0;f&&f(p);M.norm(p);const S=M.effSettings(p),c=M.calc(p,S);return{p,S,c}};
 const Ch=f=>{const p=M.newProject();p.kind='chest';Object.assign(p.c,{W:800,H:850,D:450,plinth:60,legs:0,cols:[{type:'drawers',drawers:3},{type:'door',shelves:2}]});f&&f(p);M.norm(p);const S=M.effSettings(p),c=M.calc(p,S);return{p,S,c}};
 const part=(c,re)=>c.parts.filter(x=>re.test(x.name));const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;const errs=c=>c.warn.filter(w=>w.lvl==='err').map(w=>w.t);
 // --- задняя стенка ЛДСП, шкаф 1800×2400×600, цоколь 80, ЛДСП 16
 const A=W(),B=W(p=>p.back='ldsp');ok(A.S.t===16,'ЛДСП 16');
 ok(part(A.c,/^Боковина/).every(x=>x.Wd===600)&&part(B.c,/^Боковина/).every(x=>x.Wd===584),'ЛДСП-стенка: боковины 600 → 584 (600−16)');
 ok(part(B.c,/^Крыша|^Дно/).every(x=>x.Wd===584),'крыша и дно 584');
 const bk=B.c.parts.filter(x=>x.group==='Задняя стенка');ok(bk.length===1&&bk[0].mat==='ldsp'&&bk[0].L===2320&&bk[0].Wd===1800&&bk[0].qty===1,'стенка ЛДСП 2320×1800 (2400−80, во всю ширину): '+JSON.stringify(bk));
 ok(!B.c.parts.some(x=>x.mat==='hdf'&&x.group==='Задняя стенка')&&!B.c.parts.some(x=>x.mat==='hdf'&&!/^Ящик/.test(x.name)),'нет ХДФ (кроме доньев ящиков)');
 const nPart=part(A.c,/^Перегородка$/).reduce((a,x)=>a+x.qty,0),pL=part(A.c,/^Перегородка$/)[0];
 ok(hw(B.c,/^Конфирмат/)-hw(A.c,/^Конфирмат/)===2*(10+8)+nPart*Math.ceil(pL.L/300),`конфирматов больше на ${2*(10+8)} по периметру + ${nPart}×${Math.ceil(pL.L/300)} в перегородки: ${hw(B.c,/^Конфирмат/)-hw(A.c,/^Конфирмат/)}`);
 ok(hw(B.c,/^Заглушка для конфирмата/)===hw(B.c,/^Конфирмат/),'заглушек столько же');
 ok(B.c.notes.some(t=>/Глубина корпуса — 584 мм, вместе со стенкой — 600 мм/.test(t)),'заметка про глубину');
 {const d=M.drillMap(B.p,B.S,B.c);ok(d.some(x=>/оковина/.test(x.name)&&x.size==='2400×584'),'карта сверления: боковина 2400×584');ok(d.some(x=>x.lines.some(l=>/Задняя стенка ЛДСП/.test(l))),'карта сверления: строка про стенку')}
 // без стенки
 {const N=W(p=>p.back='none');ok(!N.c.parts.some(x=>x.group==='Задняя стенка'),'без стенки: деталей нет');ok(hw(N.c,/^Гвоздь/)<hw(A.c,/^Гвоздь/),'гвоздей меньше (остались на дно ящиков)');ok(N.c.warn.some(w=>/Без задней стенки/.test(w.t||w)),'предупреждение');
  ok(part(N.c,/^Боковина/).every(x=>x.Wd===600),'без стенки: глубина как задана')}
 // угловой с ЛДСП: сторона Б считается от полной глубины 600
 {const a=W(p=>{p.shape='corner';p.W2=1400}),b2=W(p=>{p.shape='corner';p.W2=1400;p.back='ldsp'});ok(Math.abs(a.c.lenB-b2.c.lenB)<0.01,'угловой: длина стороны Б не меняется от стенки '+a.c.lenB+' '+b2.c.lenB)}
 // комод с ЛДСП-стенкой: 800×850×450, цоколь 60 → корпус 434, стенка (850−60)×800
 {const C=Ch(p=>p.back='ldsp'),C0=Ch();ok(part(C.c,/^Боковина/)[0].Wd===434&&part(C.c,/^Крышка/)[0].Wd===434,'комод: глубина корпуса 434');
  const k=C.c.parts.filter(x=>x.group==='Задняя стенка');ok(k.length===1&&k[0].mat==='ldsp'&&k[0].L===790&&k[0].Wd===800,'комод: стенка 790×800 '+JSON.stringify(k));
  ok(hw(C.c,/^Конфирмат/)-hw(C0.c,/^Конфирмат/)===2*(4+4)+1*Math.ceil((850-32-60)/300),'комод: конфирматы стенки 16 + 3 в перегородку');
  ok(errs(C.c).length===0,'комод без ошибок');const s3=M.__render(C.p);ok(s3.scene>0,'3D')}
 // --- до потолка: корпус + планка. Потолок 2700, глубина 600: √(2690²−600²)=2622,2 → 2622, планка 78
 {const F=W(p=>{p.ceil='filler';p.ceilH=2700;p.H=2622});const pl=part(F.c,/^Планка до потолка/);ok(pl.length===1&&pl[0].L===1800&&pl[0].Wd===78&&pl[0].qty===1&&pl[0].eL===1,'планка 1800×78, кромка по длинной: '+JSON.stringify(pl));
  ok(hw(F.c,/планки до потолка/)===4,'уголков 4 (1800/600+1)');ok(errs(F.c).length===0,'без ошибок: '+errs(F.c).join('|'));ok(F.c.notes.some(t=>/планка 78 мм/.test(t)),'заметка про планку');
  const s=M.__render(F.p);ok(s.svg>0,'чертёж');ok(document.querySelector('#front svg').innerHTML.includes('планка до потолка 78'),'на чертеже планка');
  ok(M.scene3dData().groups[0].items.some(x=>Math.abs((x.h||x[4]||0)-78)<0.5||JSON.stringify(x).includes('78')),'3D: есть деталь 78')}
 {const F=W(p=>{p.ceil='filler';p.ceilH=2700;p.H=2650});ok(errs(F.c).some(t=>/не поднять после сборки лёжа.*не выше 2622/.test(t)),'корпус 2650 — ошибка, подсказка 2622')}
 {const F=W(p=>{p.ceil='filler';p.ceilH=0;p.meas.h=['2700','2690','']});ok(part(F.c,/^Планка до потолка/)[0].Wd===290,'потолок из замера: меньший 2690 − 2400 = 290')}
 {const F=W(p=>{p.ceil='filler';p.W=3600;p.sections=p.sections.concat(p.sections.map(x=>JSON.parse(JSON.stringify(x))));p.ceilH=2700;p.H=2622});const pl=part(F.c,/^Планка до потолка/);
  const Lm=F.S.sheetL-2*F.S.trim;ok(pl.length===1&&pl[0].qty===2&&pl[0].L===1800,`широкий 3600: планка из 2 частей по 1800 (лист ${Lm}) `+JSON.stringify(pl))}
 // стоя
 {const S1=W(p=>{p.ceil='stand';p.ceilH=2600;p.H=2580});ok(errs(S1.c).length===0,'стоя 2580 при 2600 — без ошибок: '+errs(S1.c).join('|'));ok(S1.c.notes[0].includes('собирают стоя'),'заметка «стоя»');ok(!part(S1.c,/Планка до потолка/).length,'стоя — без планки')}
 {const S1=W(p=>{p.ceil='stand';p.ceilH=2600;p.H=2595});ok(errs(S1.c).some(t=>/не выше 2590/.test(t)),'2595 при 2600 — ошибка')}
 {const S1=W(p=>{p.ceil='stand';p.ceilH=0;p.H=2580;p.meas.h=['2590','','']});ok(!errs(S1.c).some(t=>/Не поднять/.test(t)),'стоя: нет ошибки «не поднять» по диагонали')}
 // --- вырез под плинтус
 {const V=W(p=>{p.bbH=60;p.bbD=20});ok(part(V.c,/^Боковина \(вырез под плинтус 60×20\)/).reduce((a,x)=>a+x.qty,0)===2,'боковины с вырезом 60×20');ok(errs(V.c).length===0,'без ошибок');
  const d=M.drillMap(V.p,V.S,V.c);ok(d.filter(x=>x.lines.some(l=>/Вырез под плинтус: снизу у заднего края 60 мм по высоте × 20 мм/.test(l))).length===2,'карта сверления: вырез на обеих боковинах');
  ok(d.some(x=>x.lines.some(l=>/X 28 и 572 \(задний цоколь — перед вырезом\)/.test(l))),'задний цоколь сдвинут: 600−20−8=572')}
 {const V=W(p=>{p.bbH=100;p.bbD=20});ok(errs(V.c).some(t=>/выше цоколя 80/.test(t)),'вырез 100 при цоколе 80 — ошибка')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
