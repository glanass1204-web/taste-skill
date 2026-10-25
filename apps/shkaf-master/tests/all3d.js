const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
await pg.click('[data-view="3d"]');await pg.waitForTimeout(5000);
const names=await pg.$$eval('#tplList b',x=>x.map(e=>e.textContent)).catch(()=>[]);
await pg.click('#openProjects');const tpls=await pg.$$eval('[data-tpl]',x=>x.map(e=>[e.dataset.tpl,e.closest('.proj').querySelector('b').textContent]));await pg.click('#closeProjects');
let i=0;for(const [id,nm] of tpls){await pg.click('#openProjects');await pg.click(`[data-tpl="${id}"]`);await pg.waitForTimeout(900);await pg.click('#v3reset');await pg.waitForTimeout(500);
 const c=await pg.$('#v3canvas');await c.scrollIntoViewIfNeeded();await c.screenshot({path:`look/m${i}a.png`});
 await pg.click('#v3open');await pg.waitForTimeout(2500);await c.screenshot({path:`look/m${i}b.png`});await pg.click('#v3open');await pg.waitForTimeout(300);
 console.log(i,nm);i++}
console.log('errs',errs);await b.close()})();
