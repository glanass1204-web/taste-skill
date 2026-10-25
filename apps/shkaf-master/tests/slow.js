const {chromium}=require('playwright');const fs=require('fs');const U='http://localhost:8770/taste-skill/apps/shkaf-master/';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const pg=await ctx.newPage();
await pg.goto(U);await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.reload();await pg.waitForTimeout(1000);
fs.writeFileSync('slow.flag','1');const t0=Date.now();
await pg.reload({timeout:60000});await pg.waitForSelector('#hdrPrice');const dt=(Date.now()-t0)/1000;
console.log('плохая связь: программа открылась за',dt.toFixed(1),'с, цена',await pg.$eval('#hdrPrice',e=>e.textContent));
fs.unlinkSync('slow.flag');await b.close()})();
