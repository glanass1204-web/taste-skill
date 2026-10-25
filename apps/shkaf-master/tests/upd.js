const {chromium}=require('playwright');const fs=require('fs');const U='http://localhost:8770/taste-skill/apps/shkaf-master/';const F='/home/user/taste-skill/apps/shkaf-master/index.html';
(async()=>{const orig=fs.readFileSync(F,'utf8');const b=await chromium.launch();const ctx=await b.newContext();const pg=await ctx.newPage();
await pg.goto(U);await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.reload();await pg.waitForTimeout(800);
fs.writeFileSync(F,orig.replace("const APP_VER='27 от 26.10.2026'","const APP_VER='НОВАЯ'"));
await pg.reload();await pg.waitForTimeout(800);await pg.click('nav [data-tab="set"]');console.log('после выхода новой версии на сервере:',await pg.$eval('#appVer',e=>e.textContent));
await ctx.setOffline(true);await pg.reload();await pg.waitForTimeout(800);await pg.click('nav [data-tab="set"]');console.log('и без сети после этого:',await pg.$eval('#appVer',e=>e.textContent));
fs.writeFileSync(F,orig);await b.close()})();
