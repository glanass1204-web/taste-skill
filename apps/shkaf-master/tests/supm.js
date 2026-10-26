const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1.5});await ctx.grantPermissions(['clipboard-read','clipboard-write']);const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));const R=(k,v)=>console.log((v?'✓ ':'✗ ')+k);
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const tpl=async re=>{await pg.click('#openProjects');const id=await pg.$$eval('[data-tpl]',(x,re)=>x.find(e=>new RegExp(re).test(e.closest('.proj').querySelector('b').textContent)).dataset.tpl,re);await pg.click(`[data-tpl="${id}"]`);await pg.waitForTimeout(600)};
for(const t of ['Шкаф 3-дверный','Шкаф-купе','Кухня угловая','Кухня без ручек','^Комод']){await tpl(t);await pg.click('nav [data-tab="parts"]');await pg.waitForTimeout(300);
 const rows=await pg.$$eval('#supList .sup-row',x=>x.map(e=>e.querySelector('b').textContent+' ('+e.querySelector('.hint').textContent+')'));console.log(t,'→',rows.join(' | '));
 await pg.click('[data-supcopy="0"]');await pg.waitForTimeout(200)}
// текст фурнитуры кухни
await tpl('Кухня угловая');await pg.click('nav [data-tab="parts"]');await pg.waitForTimeout(300);
const n=await pg.$$eval('#supList .sup-row',x=>x.length);await pg.click(`[data-supcopy="${n-1}"]`);await pg.waitForTimeout(200);const hwt=await pg.evaluate(()=>navigator.clipboard.readText());console.log('--- ФУРНИТУРА ---\n'+hwt.slice(0,700));
R('столешница не в фурнитуре',!/Столешница/.test(hwt));
await pg.click('#mountCopy');await pg.waitForTimeout(200);const mt=await pg.evaluate(()=>navigator.clipboard.readText());console.log('--- МОНТАЖ (конец) ---\n'+mt.slice(-500));
// чек-лист
const nb=await pg.$$eval('[data-mchk]',x=>x.length);for(let i=0;i<nb;i++){await pg.locator('[data-mchk]').nth(i).evaluate(e=>e.click())}await pg.waitForTimeout(200);console.log('  ',await pg.$eval('#toast',e=>e.textContent));
await pg.setInputFiles('#doneFile','room.jpg');await pg.waitForTimeout(1200);R('фото готовой работы добавлено',(await pg.$$('#donePhotos img')).length===1);
await (await pg.$('#mountCard')).screenshot({path:'look/mount.png'});await (await pg.$('#supCard')).screenshot({path:'look/sup.png'});
await tpl('Шкаф 3-дверный');await pg.click('nav [data-tab="cost"]');await pg.click('#openKp');await pg.waitForTimeout(1200);R('в КП другого заказа — «Наши работы»',(await pg.$$('.kp-works img')).length===1);
await pg.reload();await pg.waitForTimeout(800);R('после перезапуска отметки и фото сохранились',await pg.evaluate(()=>{return JSON.parse(localStorage.getItem('shkaf.projects')).some(p=>/Кухня угловая/.test(p.name)&&p.mount.photos.length===1&&Object.keys(p.mount.checks).length>5)}));
console.log('errs',errs);await b.close()})();
