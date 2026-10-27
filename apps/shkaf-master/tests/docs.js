const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1.5,permissions:['clipboard-read','clipboard-write']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const log=(c,m)=>console.log(c?'✓':'✗',m);const clip=()=>pg.evaluate(()=>navigator.clipboard.readText());
// реквизиты
await pg.click('[data-tab="set"]');await pg.click('summary:has-text("Ваша мастерская")');for(const [id,v] of [['#coName','Мебель Сибирь'],['#coPhone','+7 900 000-00-00'],['#coPerson','ИП Петров П. П.'],['#coInn','540100000000'],['#coCity','Новосибирск']]){await pg.fill(id,v)}
log((await pg.inputValue('#coWarM'))==='24','гарантия по умолчанию 24 мес.');
// заказ: клиент
await pg.click('[data-tab="build"]');await pg.evaluate(()=>{const e=document.getElementById('pClient').closest('details');if(e)e.open=true});
await pg.fill('#pClient','Иванова Мария').catch(()=>{});await pg.fill('#pAddr','ул. Ленина, 1, кв. 5').catch(()=>{});await pg.fill('#pPay','20000').catch(()=>{});
await pg.click('[data-tab="cost"]');await pg.waitForTimeout(300);
log((await pg.textContent('#agreeBox')).includes('ещё не согласован'),'сначала «не согласован»');
await pg.click('#agreeBtn');await pg.waitForTimeout(300);log((await pg.textContent('#agreeBox')).includes('ничего не менялось'),'после согласования — изменений нет');
// меняем изделие
await pg.click('[data-tab="build"]');await pg.click('[data-mir="0"]');await pg.fill('#pW','2000');await pg.press('#pW','Tab');await pg.waitForTimeout(300);
await pg.click('[data-tab="cost"]');await pg.waitForTimeout(300);const ag=await pg.textContent('#agreeBox');
log(/изменено/.test(ag)&&/Размеры/.test(ag)&&/Зеркал на дверях/.test(ag)&&/Цена/.test(ag),'видно что изменилось: размеры, зеркала, цена');
console.log('   ',ag.replace(/\s+/g,' ').slice(0,400));
await pg.click('#agreeCopy');await pg.waitForTimeout(200);const c1=await clip();log(/было «1800 × 2400 × 560 мм», стало «2000 × 2400 × 560 мм»/.test(c1),'изменения для клиента скопированы');
await pg.click('#agreeBtn');await pg.waitForTimeout(200);log((await pg.textContent('#agreeBox')).includes('ничего не менялось'),'согласовано заново');
// договор
await pg.click('[data-docopen="contract"]');await pg.waitForTimeout(400);const ct=await pg.textContent('#docSheet');
for(const [re,m] of [[new RegExp('Договор бытового подряда № '+String(new Date().getDate()).padStart(2,'0')+String(new Date().getMonth()+1).padStart(2,'0')+'-1 '),'номер договора'],[/ИП Петров П\. П\./,'исполнитель'],[/Иванова Мария/,'заказчик'],[/ул\. Ленина, 1, кв\. 5/,'адрес'],[/Предоплата при подписании договора: 20\s000 ₽/,'предоплата'],[/21 рабочий день|21 рабочих дней|21 рабочего/,'срок из настроек'],[/24 месяца/,'гарантия 24 месяца'],[/Приложение 1/,'приложение'],[/ИНН 540100000000/,'ИНН']])log(re.test(ct.replace(/ | /g,' ')),'договор: '+m);
log(await pg.$$eval('#docSheet .doc-draw svg',x=>x.length>0),'договор: эскиз в приложении');
const price=await pg.evaluate(()=>document.querySelector('#costTotal b').textContent);log(ct.includes(price.trim()),'договор: цена как в смете '+price);
await pg.screenshot({path:'look/doc1.png',fullPage:false});
await pg.click('#docCopy');await pg.waitForTimeout(200);const t1=await clip();log(t1.startsWith('ДОГОВОР БЫТОВОГО ПОДРЯДА №')&&/ст. 32/.test(t1)&&!/Паспорт/.test(t1)&&t1.includes('Исполнитель'),'текст договора копируется');
// срок своим числом
await pg.fill('#ctDays','30');await pg.press('#ctDays','Tab');await pg.click('[data-docopen="contract"]');await pg.waitForTimeout(300);log((await pg.textContent('#docSheet')).includes('30 рабочих дней'),'срок 30 рабочих дней');await pg.click('#closeDoc');
// акт и памятка
await pg.click('[data-docopen="act"]');await pg.waitForTimeout(300);const act=await pg.textContent('#docSheet');log(/Акт приёма-передачи/.test(act)&&/замечаний нет/.test(act)&&/Как ухаживать/.test(act),'акт');await pg.screenshot({path:'look/doc2.png'});await pg.click('#closeDoc');
await pg.click('[data-docopen="memo"]');await pg.waitForTimeout(300);const memo=await pg.textContent('#docSheet');log(/Ремонтные работы/.test(memo)&&/скрытые провода/.test(memo),'памятка для шкафа');await pg.click('#closeDoc');
// кухня: памятка про розетки и воду
await pg.click('#openProjects');await pg.click('[data-tpl]:near(:text("Кухня угловая с техникой"))').catch(async()=>{});await pg.waitForTimeout(300);
await pg.evaluate(()=>{});
const kt=await pg.evaluate(()=>{const b=[...document.querySelectorAll('[data-tpl]')].find(e=>e.closest('.proj').textContent.includes('Кухня угловая'));b&&b.click();return !!b});await pg.waitForTimeout(500);
await pg.click('[data-tab="cost"]');await pg.waitForTimeout(300);await pg.click('[data-docopen="memo"]');await pg.waitForTimeout(300);const km=await pg.textContent('#docSheet');log(kt&&/Вода и слив|слив/.test(km)&&/не выше 10 см/.test(km),'памятка кухни: розетки и вода');await pg.click('#closeDoc');
await pg.click('[data-docopen="contract"]');await pg.waitForTimeout(300);log(/Модуль/.test(await pg.textContent('#docSheet')),'договор кухни: модули в спецификации');await pg.click('#closeDoc');
// перезапуск
await pg.reload();await pg.waitForTimeout(800);
console.log('errs',errs);await b.close()})();
