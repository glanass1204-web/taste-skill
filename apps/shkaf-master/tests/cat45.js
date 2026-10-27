const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const log=(c,m)=>console.log(c?'✓':'✗',m);
const n=await pg.$$eval('#decors button',x=>x.length);log(n===14,'декоров 14: '+n);
await pg.evaluate(()=>document.querySelector('[data-decor="kashmir"]').scrollIntoView({inline:'center'}));await pg.click('[data-decor="kashmir"]');await pg.waitForTimeout(400);
const sup=await pg.evaluate(()=>window.ShkafMaster.__hooks.supplierLists?JSON.stringify(window.ShkafMaster.__hooks.supplierLists()).slice(0,4000):'');log(/Кашемир серый \(Egger U702\)/.test(sup),'в заказе поставщику — декор с кодом');
const scroll=await pg.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth);log(scroll,'страница не шире экрана');
await (await pg.$('.drawing .tools')).screenshot({path:'look/decors45.png'});
// материалы: Увадрев и компакт-плита
const r=await pg.evaluate(()=>{const M=window.ShkafMaster,S0=M.settings();const ids=S0.mat.bodies.map(x=>x.id).concat(S0.mat.tops.map(x=>x.id));
  const p=M.newProject();p.mat.body='uvadrev16';M.norm(p);let S=M.effSettings(p),c=M.calc(p,S),cl=M.pack(c.parts.filter(x=>x.mat==='ldsp'),S,!S.grain);
  const q=M.newProject();q.kind='kitchen';q.mat.top='hpl12';q.k.worktop=true;M.norm(q);const S2=M.effSettings(q),c2=M.calc(q,S2);
  return{ids,sheet:[S.sheetL,S.sheetW,S.t],sheets:cl.sheets.length,price:S.p.ldsp,top:c2.top&&c2.top.name,tT:c2.tT,err:c2.warn.filter(w=>w.lvl==='err').map(w=>w.t),planks:c2.hw.filter(h=>/Планка торцевая/.test(h[0])).length}});
log(r.ids.includes('uvadrev16')&&r.ids.includes('uvadrevW16')&&r.ids.includes('hpl12'),'новые позиции в каталоге');
log(r.sheet.join('×')==='2750×1830×16','Увадрев: лист 2750×1830, 16 мм → '+r.sheet.join('×'));
log(r.top&&/HPL/.test(r.top)&&r.tT===12&&r.planks===0,`компакт-плита: ${r.top}, толщина ${r.tT}, торцевых планок ${r.planks}`);log(!r.err.length,'кухня с HPL без ошибок '+r.err.join('|'));
console.log('errs',errs);await b.close()})();
