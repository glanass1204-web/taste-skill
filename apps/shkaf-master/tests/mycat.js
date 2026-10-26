const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));const R=(k,v)=>console.log((v?'✓ ':'✗ ')+k);
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const vis=sel=>pg.$eval(sel,e=>!e.closest('.field').hidden);
await pg.click('[data-kind="chest"]');await pg.waitForTimeout(300);
R('комод только с ящиками: петель нет',!(await vis('#hwHinge')));R('комод: направляющие есть',await vis('#hwSlide'));
await pg.evaluate(()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true));console.log('  подсказка:',await pg.$eval('#hwInfo',e=>e.textContent.slice(0,80)));
await pg.click('[data-preset="shoe"]');await pg.waitForTimeout(300);R('обувница с дверцами: петли есть',await vis('#hwHinge'));R('обувница без ящиков: направляющих нет',!(await vis('#hwSlide')));
// своя петля
await pg.click('nav [data-tab="set"]');await pg.evaluate(()=>document.querySelectorAll('#view-set details.fold').forEach(d=>d.open=true));
await pg.click('[data-catadd="hinges"]');await pg.waitForTimeout(300);
const nm=await pg.$('[data-catname^="hinges:u_"]');await nm.fill('Петли Hettich Veosys');await nm.press('Tab');
const id=(await nm.getAttribute('data-catname')).split(':')[1];await pg.fill(`[data-cat="hinges:${id}:over"]`,'310');await pg.press(`[data-cat="hinges:${id}:over"]`,'Tab');await pg.waitForTimeout(200);
await (await pg.$('.cat-row.mine')).screenshot({path:'look/mycat.png'});
await pg.click('nav [data-tab="build"]');await pg.evaluate(()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true));
const opts=await pg.$$eval('#hwHinge optgroup',x=>x.map(g=>g.label+': '+[...g.children].map(o=>o.textContent).join(', ')));R('своя петля в группе «Мои»',opts[0].startsWith('Мои: Петли Hettich Veosys'));
await pg.selectOption('#hwHinge',id);await pg.waitForTimeout(300);await pg.click('nav [data-tab="cost"]');
const rows=await pg.$eval('#costTable',e=>e.innerText.split('\n').filter(l=>/Петля/.test(l)));console.log('  смета:',rows);R('в смете своя петля по 310 ₽',rows.some(l=>/Hettich Veosys/.test(l)&&/310/.test(l)));
await pg.reload();await pg.waitForTimeout(800);await pg.evaluate(()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true));R('после перезапуска своя петля на месте и выбрана',await pg.$eval('#hwHinge',e=>e.selectedOptions[0].textContent)==='Петли Hettich Veosys');
await pg.click('nav [data-tab="set"]');await pg.evaluate(()=>document.querySelectorAll('#view-set details.fold').forEach(d=>d.open=true));await pg.click(`[data-catdel="hinges:${id}"]`);await pg.click(`[data-catdel="hinges:${id}"]`);await pg.waitForTimeout(300);
console.log('  ',await pg.$eval('#toast',e=>e.textContent));R('после удаления заказ на типовых петлях',await pg.evaluate(()=>JSON.parse(localStorage.getItem('shkaf.projects'))[0].hw.hinge)==='kdm');
// свои направляющие скрытые
await pg.click('[data-catadd="slides"]');await pg.waitForTimeout(300);const sid=(await pg.$eval('[data-catname^="slides:u_"]',e=>e.dataset.catname)).split(':')[1];await pg.selectOption(`[data-catkind="slides:${sid}"]`,'hidden');await pg.waitForTimeout(200);
R('скрытые: вычеты поставлены 42/10',await pg.$eval(`[data-cat="slides:${sid}:dW"]`,e=>e.value)==='42'&&await pg.$eval(`[data-cat="slides:${sid}:dL"]`,e=>e.value)==='10');
console.log('errs',errs);await b.close()})();
