const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:412,height:900},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
await pg.click('#openProjects');await pg.waitForTimeout(300);
const ok=await pg.evaluate(()=>{const b=[...document.querySelectorAll('[data-tpl]')].find(e=>/Гардеробная угловая/.test(e.closest('.proj').textContent));b&&b.click();return !!b});await pg.waitForTimeout(500);
await pg.click('[data-view="3d"]');await pg.waitForTimeout(3500);await (await pg.$('#view3d')).screenshot({path:'look/dims48.png'});console.log(ok,errs);await b.close()})();
