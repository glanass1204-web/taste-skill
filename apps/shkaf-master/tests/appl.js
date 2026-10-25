const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
await pg.click('#openProjects');const id=await pg.$$eval('[data-tpl]',x=>x.find(e=>/Кухня прямая/.test(e.closest('.proj').querySelector('b').textContent)).dataset.tpl);await pg.click(`[data-tpl="${id}"]`);await pg.waitForTimeout(600);
// верхний модуль В1 → под вытяжку
await pg.selectOption('#mt-wall-0','hood');await pg.waitForTimeout(300);
await pg.click('#mod-wall-0 details.acc summary');await pg.fill('#apapW-wall-0','580');await pg.press('#apapW-wall-0','Tab');await pg.waitForTimeout(300);
console.log('блок открыт после перерисовки:',await pg.$eval('#mod-wall-0 details.acc',e=>e.open));
console.log('ошибки:',await pg.$$eval('#buildAlerts .alert-go',x=>x.map(e=>e.textContent.slice(0,90))));
await (await pg.$('#mod-wall-0')).screenshot({path:'look/appl.png'});
await pg.fill('#apapW-wall-0','');await pg.press('#apapW-wall-0','Tab');await pg.waitForTimeout(300);console.log('после очистки поля:',JSON.stringify(await pg.evaluate(()=>JSON.parse(localStorage.getItem('shkaf.projects')).slice(-1)[0].k.wall[0])));
console.log('errs',errs);await b.close()})();
