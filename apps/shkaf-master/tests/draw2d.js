const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
await (await pg.$('#front svg')).screenshot({path:'look/2d-w.png'});
const tpl=async re=>{await pg.click('#openProjects');const id=await pg.$$eval('[data-tpl]',(x,re)=>x.find(e=>new RegExp(re).test(e.closest('.proj').querySelector('b').textContent)).dataset.tpl,re);await pg.click(`[data-tpl="${id}"]`);await pg.waitForTimeout(600)};
await tpl('Кухня прямая');await (await pg.$$('#front svg'))[0].screenshot({path:'look/2d-k.png'});await tpl('^Комод');await (await pg.$('#front svg')).screenshot({path:'look/2d-c.png'});await b.close()})();
