const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));const R=(k,v)=>console.log((v?'✓ ':'✗ ')+k);
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
await pg.evaluate(()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true));
const price=()=>pg.$eval('#hdrPrice',e=>e.textContent);const p0=await price();
// свои петли из списка
await pg.selectOption('#hwHinge','__new');await pg.waitForTimeout(400);
const nm=await pg.$('#hwMine [data-mname]');R('появился редактор своей позиции под выбором',!!nm);R('курсор сразу в названии',await pg.evaluate(()=>document.activeElement&&document.activeElement.dataset.mname!==undefined));
await pg.keyboard.type('Петли Китай DTC');const id=(await nm.getAttribute('data-mname')).split(':')[2];
await pg.fill(`#hwMine [data-cat="hinges:${id}:over"]`,'95');await pg.waitForTimeout(300);
R('выбрана своя петля',await pg.$eval('#hwHinge',e=>e.selectedOptions[0].textContent)==='Петли Китай DTC');
R('поле не теряет фокус при вводе',await pg.evaluate(()=>document.activeElement&&document.activeElement.dataset.cat&&document.activeElement.dataset.cat.endsWith(':over')));
await (await pg.$('#hwPanel')).screenshot({path:'look/mine-hw.png'});
// своя ЛДСП
await pg.selectOption('#mBody','__new');await pg.waitForTimeout(400);const bn=await pg.$('#matMine [data-mname]');await pg.keyboard.type('ЛДСП Увадрев 16');const bid=(await bn.getAttribute('data-mname')).split(':')[2];
await pg.fill(`#matMine [data-matedit="bodies:${bid}:price"]`,'3200');await pg.waitForTimeout(300);
await pg.click('nav [data-tab="cost"]');await pg.waitForTimeout(300);
const t=(await pg.$eval('#costTable',e=>e.innerText)).replace(/[\u00a0\u202f]/g,' ');console.log(JSON.stringify(t.split('\n').filter(l=>/Увадрев|Китай/.test(l))));R('в смете своя ЛДСП по 3 200',/ЛДСП Увадрев 16[^\n]*\t3 200/.test(t));R('в смете свои петли по 95',/Петли Китай DTC[^\n]*\t95\t/.test(t));
// своя позиция в смету
await pg.click('#exAdd');await pg.keyboard.type('Подъёмник Aventos HK-XS Китай');await pg.fill('[data-ex="0:qty"]','2');await pg.fill('[data-ex="0:price"]','1850');await pg.waitForTimeout(300);
const t2=(await pg.$eval('#costTable',e=>e.innerText)).replace(/[\u00a0\u202f]/g,' ');console.log(JSON.stringify(t2.split('\n').filter(l=>/Подъ/.test(l))));R('своя позиция 2 × 1 850 = 3 700 в смете',/Подъёмник Aventos HK-XS Китай\t2 шт\t1 850\t3 700/.test(t2));
await (await pg.$('#exCard')).screenshot({path:'look/mine-ex.png'});
await pg.reload();await pg.waitForTimeout(800);await pg.click('nav [data-tab="cost"]');R('после перезапуска всё на месте',/Подъёмник Aventos/.test(await pg.$eval('#costTable',e=>e.innerText))&&/Увадрев/.test(await pg.$eval('#costTable',e=>e.innerText)));
// профиль купе своё
await pg.click('nav [data-tab="build"]');await pg.evaluate(()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true));await pg.click('[data-type="coupe"]');await pg.waitForTimeout(300);await pg.evaluate(()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true));
await pg.selectOption('#hwCoupe','__new');await pg.waitForTimeout(400);R('свой профиль купе: редактор',!!(await pg.$('#hwMine [data-cat^="coupe:u_"]')));
console.log('errs',errs);await b.close()})();
