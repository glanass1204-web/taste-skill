const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const shot=async n=>{const c=await pg.$('#v3canvas');await c.scrollIntoViewIfNeeded();await c.screenshot({path:`look/d-${n}.png`})};
await pg.click('[data-view="3d"]');await pg.waitForTimeout(6000);await shot('w');
const tpl=async re=>{await pg.click('#openProjects');const id=await pg.$$eval('[data-tpl]',(x,re)=>x.find(e=>new RegExp(re).test(e.closest('.proj').querySelector('b').textContent)).dataset.tpl,re);await pg.click(`[data-tpl="${id}"]`);await pg.waitForTimeout(1200);await pg.click('#v3reset');await pg.waitForTimeout(800)};
await tpl('Угловой шкаф');await shot('wc');await tpl('Кухня угловая');await shot('kc');await tpl('Кухня прямая');await shot('k');await tpl('^Комод');await shot('c');
await pg.click('#v3dims');await pg.waitForTimeout(500);await shot('off');
console.log('errs',errs);await b.close()})();
