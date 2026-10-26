const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const log=(c,m)=>console.log(c?'✓':'✗',m);const glass=async()=>{await pg.click('[data-tab="cost"]');await pg.waitForTimeout(250);const t=await pg.evaluate(()=>document.querySelector('main').innerText);await pg.click('[data-tab="build"]');await pg.waitForTimeout(200);return /Зеркало 4 мм|Вставка зеркало/.test(t)};
log(await pg.isVisible('[data-mir="0"]'),'кнопка «Без зеркал» видна сразу под типом дверей');
const box=await pg.$('#mirBox');await box.scrollIntoViewIfNeeded();await pg.screenshot({path:'look/mir1.png'});
log(await glass(),'по умолчанию зеркало в смете');
await pg.click('[data-mir="0"]');await pg.waitForTimeout(300);log(!(await glass()),'«Без зеркал» — зеркал в смете нет');log(!(await pg.isVisible('#mirRow')),'счётчик скрыт');
await pg.click('[data-mir="1"]');await pg.waitForTimeout(300);log(await glass(),'«С зеркалами» — зеркало вернулось');log((await pg.textContent('#mirCount'))==='1','одно зеркало');
// купе
await pg.click('[data-type="coupe"]');await pg.waitForTimeout(300);log(await pg.isVisible('#pCm'),'купе с зеркалом: выбор вставки виден');
await pg.click('[data-mir="0"]');await pg.waitForTimeout(300);log(!(await pg.isVisible('#pCm')),'купе без зеркал: выбор вставки скрыт');log(!(await glass()),'купе без зеркал: в смете нет зеркальных вставок');
log((await pg.$eval('#pCs2o3',e=>e.textContent))==='Из 3 частей','вариант «Из 3 частей» без слова зеркало');
await box.scrollIntoViewIfNeeded();await pg.screenshot({path:'look/mir2.png'});
// гардеробная без дверей — блок скрыт
await pg.click('[data-kind="walk"]');await pg.waitForTimeout(400);log(!(await pg.isVisible('#mirBox')),'гардеробная без дверей: блок зеркал скрыт');
await pg.reload();await pg.waitForTimeout(800);
console.log('errs',errs);await b.close()})();
