// комод: ящики разной высоты — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)},eq=(a,b,m,tol=0.01)=>ok(Math.abs(a-b)<=tol,m+`: ${a} ≠ ${b}`);
 const mk=cols=>{const p=M.newProject();p.kind='chest';Object.assign(p.c,{W:800,H:850,D:450,plinth:60,legs:0,cols});M.norm(p);const S=M.effSettings(p),c=M.calc(p,S);return{p,S,c}};
 const fr=c=>c.parts.filter(x=>x.name==='Фасад ящика').map(x=>Math.round(x.Wd*10)/10+'x'+x.qty).sort().join(',');
 const hw=(c,re)=>(c.hw.find(h=>re.test(h[0]))||[])[1]||0;
 // t=16: зона фасадов 850−60−16−3 = 771; ширина фасада 800−2−2 = 796
 {const {S,c}=mk([{type:'drawers',drawers:4}]);ok(S.t===16,'ЛДСП 16');eq(c.fz,771,'зона фасадов');
  ok(fr(c)==='190x4','одинаковые: 4 фасада по (771−9)/4=190,5 → 190 (вниз до мм) — '+fr(c));ok(hw(c,/^Направляющие/)===4,'4 пары направляющих')}
 {const {p,S,c}=mk([{type:'drawers',drawers:3,dlay:'top'}]);// 771−6=765, доля 153
  ok(fr(c)==='153x1,306x2','верхний низкий: 153 + 2×306 — '+fr(c));ok(hw(c,/^Направляющие/)===3&&hw(c,/^Ручка/)===3,'3 направляющих, 3 ручки');
  const d=M.drillMap(p,S,c),ln=d.flatMap(x=>x.lines).find(l=>/Ящики: низ короба/.test(l))||'';const ys=(ln.match(/Y (.*)$/)||['',''])[1].match(/\d+/g)||[];
  // низ короба = цоколь 60 + верх фасада − высота + 25: 60+771−153+25=703; 60+615−306+25=394; 60+306−306+25=85
  ok(ys.join(' ')==='703 394 85','сверление боковины: '+ln);
  const fl=d.filter(x=>/фасад ящика/.test(x.name)).map(x=>x.size+'x'+x.qty).sort().join(',');ok(fl==='153×796x1,306×796x2','карта сверления фасадов: '+fl);
  const sc=M.scene3dData?null:null;
  const boxes=c.parts.filter(x=>/^Ящик/.test(x.name));ok(boxes.length>=2,'короба ящиков двух высот')}
 {const {c}=mk([{type:'drawers',drawers:3,dlay:'bottom'}]);// 765/4=191,25; низ 382,5
  ok(fr(c)==='191x2,382x1','нижний высокий: 2×191,25 + 382,5 — '+fr(c))}
 {const {c}=mk([{type:'drawers',drawers:3,dlay:'cust',dh:'150 150 200 262'}]);// 150+150+200+262 = 762 = 771−9 — точно
  ok(fr(c)==='150x2,200x1,262x1','свои высоты точно — '+fr(c));ok(hw(c,/^Направляющие/)===4,'свои: 4 ящика по числу высот');ok(!c.warn.some(w=>w.lvl==='err'),'без ошибок')}
 {const {c}=mk([{type:'drawers',drawers:3,dlay:'cust',dh:'1 1 2'}]);// 765/4
  ok(fr(c)==='191x2,382x1','свои доли 1 1 2 — '+fr(c))}
 {const {c}=mk([{type:'drawers',drawers:3,dlay:'cust',dh:'80 300 385'}]);ok(c.warn.some(w=>w.lvl==='err'&&/самый низкий фасад ящика 80 мм/.test(w.t)),'фасад 80 мм — ошибка')}
 {const {c}=mk([{type:'drawers',drawers:3,dlay:'cust',dh:''}]);ok(fr(c)==='255x3','пустые свои высоты — как одинаковые 3: '+fr(c))}
 // площадь фасадов = вся зона минус зазоры, при любой раскладке
 for(const dl of ['','top','bottom'])for(const k of [2,3,4,5]){const {c}=mk([{type:'drawers',drawers:k,dlay:dl}]);const sum=c.parts.filter(x=>x.name==='Фасад ящика').reduce((a,x)=>a+x.Wd*x.qty,0);ok(sum<=771-3*(k-1)&&sum>771-3*(k-1)-k,`сумма высот ${dl||'одинак'} ${k}: ${sum}`)}
 // 3D: фасады те же
 {const {p}=mk([{type:'drawers',drawers:3,dlay:'top'},{type:'door',shelves:2}]);const keep=M.__render(p);const g=M.scene3dData().groups[0].items.filter(x=>x.kind==='front'||x.role==='front'||x[6]==='front');ok(keep.scene>0,'3D собирается')}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
