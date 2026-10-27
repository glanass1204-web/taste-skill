const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:8765/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const log=(c,m)=>console.log(c?'✓':'✗',m);const R=()=>pg.evaluate(()=>{const r=window.ShkafMaster.__hooks.R();return{H:JSON.parse(localStorage.getItem('shkaf.projects')||'[]'),c:r.c}});
const st=()=>pg.evaluate(()=>window.ShkafMaster.__hooks.R().c);
// шкаф до потолка
log(await pg.isHidden('#ceilBox'),'по умолчанию блок «до потолка» скрыт');
await pg.selectOption('#pCeil','filler');await pg.waitForTimeout(300);
log(/Впишите потолок/.test(await pg.textContent('#ceilHint')),'просит потолок');
await pg.fill('#pCeilH','2700');await pg.press('#pCeilH','Tab');await pg.waitForTimeout(300);
const D=await pg.inputValue('#pD');const hint=await pg.textContent('#ceilHint');log(/Потолок 2700 мм/.test(hint),'подсказка: '+hint);
await pg.click('#ceilFit');await pg.waitForTimeout(400);const H=+await pg.inputValue('#pH');const exp=Math.floor(Math.sqrt(2690**2-(+D)**2));log(H===exp,`высота подогнана ${H} = √(2690²−${D}²) → ${exp}`);
const c1=await pg.evaluate(()=>{const c=window.ShkafMaster.__hooks.R().c;return{f:c.fillH,p:c.parts.filter(x=>/Планка до потолка/.test(x.name)).map(x=>x.L+'x'+x.Wd+'x'+x.qty)}});log(c1.f===2700-H&&c1.p.length===1,'планка '+JSON.stringify(c1));
await (await pg.$('#wPanel')).screenshot({path:'look/ceil1.png'});await (await pg.$('#front')).screenshot({path:'look/ceil2.png'});
// задняя стенка
await pg.selectOption('#pBack','ldsp');await pg.waitForTimeout(300);const bk=await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.parts.filter(x=>x.group==='Задняя стенка').map(x=>x.mat));log(bk.length&&bk.every(m=>m==='ldsp'),'стенка ЛДСП');
// вырез
await pg.fill('#pBbH','60');await pg.press('#pBbH','Tab');await pg.fill('#pBbD','20');await pg.press('#pBbD','Tab');await pg.waitForTimeout(300);
log(await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.parts.some(x=>/вырез под плинтус 60×20/.test(x.name))),'боковины с вырезом');
// документ: строки в спецификации
await pg.click('[data-tab="cost"]');await pg.waitForTimeout(300);await pg.click('[data-docopen="contract"]');await pg.waitForTimeout(400);const ct=await pg.textContent('#docSheet');
log(/ЛДСП корпуса, накладная/.test(ct)&&/планка/.test(ct)&&/Вырез под плинтус/.test(ct),'договор: стенка, до потолка, вырез');await pg.click('#closeDoc');
// монтаж
const ms=await pg.evaluate(()=>{const e=document.body.innerText;return e});
await pg.click('[data-tab="build"]');
await pg.reload();await pg.waitForTimeout(800);const keep=await pg.evaluate(()=>{const P=JSON.parse(localStorage.getItem('shkaf.projects'))[0];return [P.ceil,P.ceilH,P.back,P.bbH,P.bbD].join('|')});log(keep==='filler|2700|ldsp|60|20','после перезапуска: '+keep);
// кухня до потолка
await pg.click('[data-kind="kitchen"]');await pg.waitForTimeout(400);
await pg.fill('#kCeil','2700');await pg.press('#kCeil','Tab');await pg.waitForTimeout(200);
await pg.click('#kCeilWall');await pg.waitForTimeout(300);const k=await pg.evaluate(()=>{const P=JSON.parse(localStorage.getItem('shkaf.projects')).find(p=>p.kind==='kitchen')||window.ShkafMaster.__hooks.R();return null});
const kk=await pg.evaluate(()=>{const v=id=>+document.getElementById(id).value;return{wy:v('kWY'),wh:v('kWH'),w2:v('kW2'),th:v('kTH'),lg:v('kLg'),bd:v('kBD')}});
log(kk.w2===2700-20-kk.wy-kk.wh,`антресоли ${kk.w2} = 2700−20−${kk.wy}−${kk.wh}`);
await pg.click('#kCeilTall');await pg.waitForTimeout(300);const th=+await pg.inputValue('#kTH');const te=Math.min(2700,2680,Math.floor(kk.lg+Math.sqrt((2690-kk.lg)**2-kk.bd**2)));log(th===te,`пенал ${th} = ${te}`);
const ke=await pg.evaluate(()=>window.ShkafMaster.__hooks.R().c.warn.filter(w=>w.lvl==='err'&&/потол/.test(w.t)).length);log(ke===0,'кухня: нет ошибок про потолок');
// комод: выбор высот
await pg.click('[data-kind="chest"]');await pg.waitForTimeout(400);
const sel=await pg.$('select[data-copt="0:dlay"]');log(!!sel,'у колонки комода есть «Ящики по высоте»');
await sel.selectOption('top');await pg.waitForTimeout(300);const t1=await pg.textContent('#col-0');log(/Фасады ящиков сверху вниз: [\d ·]+ мм/.test(t1),'показаны высоты: '+(t1.match(/сверху вниз: ([\d ·]+)/)||[])[1]);
await pg.selectOption('select[data-copt="0:dlay"]','cust');await pg.waitForTimeout(300);await pg.fill('input[data-copt="0:dh"]','150 150 200 262');await pg.press('input[data-copt="0:dh"]','Tab');await pg.waitForTimeout(300);
const c2=await pg.evaluate(()=>{const c=window.ShkafMaster.__hooks.R();return c.c.fz});const t2=await pg.textContent('#col-0');log(/сверху вниз: [\d ·]+/.test(t2),'свои высоты: '+(t2.match(/сверху вниз: ([\d ·]+)/)||[])[1]+' (зона '+c2+')');
await (await pg.$('#col-0')).screenshot({path:'look/cdr1.png'});
await pg.selectOption('#cBack','none');await pg.waitForTimeout(300);log(await pg.evaluate(()=>!window.ShkafMaster.__hooks.R().c.parts.some(x=>x.group==='Задняя стенка')),'комод без стенки');
await pg.click('[data-tab="mount"]').catch(()=>{});
console.log('errs',errs);await b.close()})();
