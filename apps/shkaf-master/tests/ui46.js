const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const log=(c,m)=>console.log(c?'✓':'✗',m);const R=()=>pg.evaluate(()=>window.ShkafMaster.__hooks.R().c);
// кухня: карго и витрина через меню
await pg.click('[data-kind="kitchen"]');await pg.waitForTimeout(400);
await pg.selectOption('select[data-mtype="base:1"]','cargo');await pg.waitForTimeout(300);
await pg.fill('input[data-mw="base:1"]','200');await pg.press('input[data-mw="base:1"]','Tab');await pg.waitForTimeout(300);
log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.hw.some(h=>/Бутылочница \(карго\) под модуль 200/.test(h[0]))),'карго 200 из меню');
await pg.selectOption('select[data-mtype="wall:0"]','glass');await pg.waitForTimeout(300);log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.hw.some(h=>/Фасад-витрина/.test(h[0]))),'витрина из меню');
await (await pg.$('#front')).screenshot({path:'look/k46.png'});
const sk=await pg.$('select[data-mtype="base:0"]');
// угол
await pg.click('[data-kshape="corner"]');await pg.waitForTimeout(400);const mech=await pg.$('#kc-mech');log(!!mech,'у углового модуля — выбор «Внутри»');
if(mech){const opts=await mech.$$eval('option',o=>o.map(x=>x.value));await mech.selectOption(opts[1]);await pg.waitForTimeout(300);log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.hw.some(h=>/Волшебный уголок|Карусель/.test(h[0]))),'механизм в смете: '+opts[1])}
// комод: стол и тумба
await pg.click('[data-kind="chest"]');await pg.waitForTimeout(400);
await pg.click('[data-preset="desk"]');await pg.waitForTimeout(400);log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.parts.some(x=>/Стойка у ниши/.test(x.name))),'стол из кнопки');
await (await pg.$('#front')).screenshot({path:'look/desk46.png'});
await pg.click('[data-preset="vanity"]');await pg.waitForTimeout(400);log(await pg.isChecked('#cVanity'),'тумба под раковину: галочка стоит');
await pg.click('#cVanity');await pg.waitForTimeout(300);log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.parts.some(x=>x.name==='Крышка')),'сняли галочку — крышка вернулась');
await pg.click('[data-preset="rack"]');await pg.waitForTimeout(400);await (await pg.$('#front')).screenshot({path:'look/rack46.png'});
// шкаф: гладильная доска
await pg.click('[data-kind="wardrobe"]');await pg.waitForTimeout(400);await pg.evaluate(()=>document.querySelectorAll('details.acc').forEach(d=>d.open=true));
await pg.check('[data-sflag="A:0:iron"]');await pg.waitForTimeout(300);log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.hw.some(h=>/Гладильная доска/.test(h[0]))),'гладильная доска из меню');
console.log('errs',errs);await b.close()})();
