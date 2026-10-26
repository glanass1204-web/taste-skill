const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const log=(c,m)=>console.log(c?'✓':'✗',m);
// случай пользователя: прихожая-купе 3000, 2 секции, ящики в первой
await pg.click('[data-kind="hall"]');await pg.click('[data-hallp="coupe"]');await pg.waitForTimeout(300);
await pg.fill('#pW','3000');await pg.press('#pW','Tab');await pg.waitForTimeout(300);
await pg.click('[data-step="A:0:drawers:1"]');await pg.click('[data-step="A:0:drawers:1"]');await pg.waitForTimeout(400);
const al=await pg.textContent('#buildAlerts');console.log('   ',al.replace(/\s+/g,' ').slice(0,500));
log(!/Не помещаются на лист/.test(al),'шкаф 3000 — больше нет ошибки «не помещается на лист» (2 корпуса)');
log((await pg.textContent('#view-build')).includes('из 2 корпусов'),'подсказка про 2 корпуса');
const fx=await pg.$$eval('.alert-fix',x=>x.map(e=>e.textContent));console.log('    кнопки:',fx);
log(fx.length>0,'есть кнопка «Исправить»');
const al0=await pg.locator('#buildAlerts').screenshot({path:'look/fix1.png'});
await pg.click(await pg.$('.alert-fix.all')?'.alert-fix.all':'.alert-fix');await pg.waitForTimeout(500);
const al2=await pg.textContent('#buildAlerts');log(!/Так делать нельзя/.test(al2),'после нажатия ошибок нет');console.log('   ',al2.replace(/\s+/g,' ').slice(0,300));
await pg.locator('#buildAlerts').screenshot({path:'look/fix2.png'}).catch(()=>{});
// 3D и присадка при двух корпусах
await pg.click('[data-tab="parts"]');await pg.waitForTimeout(300);const drill=await pg.textContent('#view-parts');log(/Корпус 2: боковина левая/.test(drill)&&/Стык корпусов/.test(drill),'присадка: боковины корпусов и стяжки');
await pg.click('[data-tab="build"]');await pg.click('[data-view="3d"]');await pg.waitForTimeout(4000);await (await pg.$('#v3canvas')).screenshot({path:'look/fix3d.png'});
console.log('errs',errs);await b.close()})();
