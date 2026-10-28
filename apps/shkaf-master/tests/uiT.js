// инструмент и оснастка в интерфейсе: отметки, итог, запоминание, кондуктор 32
const {chromium}=require('playwright');const PORT=process.argv[2]||'8765',SHOT=process.argv[3]==='shot';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+PORT+'/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const bad=[];let n=0;const ok=(c,m)=>{n++;if(!c)bad.push(m)};
await pg.click('[data-tab="parts"]');await pg.waitForTimeout(400);
const sum=()=>pg.$eval('#toolList .tool-sum b',e=>e.textContent);const rows=await pg.$$eval('#toolList .tool',x=>x.length);ok(rows>=10,'строк инструмента '+rows);
const s0=await sum();ok(/Не хватает нужного/.test(s0),'итог: '+s0);
await pg.evaluate(()=>document.getElementById('toolsCard').scrollIntoView());if(SHOT)await (await pg.$('#toolsCard')).screenshot({path:'look/tools.png'});
await pg.check('[data-tool="screw"]');await pg.waitForTimeout(300);const s1=await sum();
const num=t=>+t.replace(/[^\d]/g,'');ok(num(s0)-num(s1)===6000,'шуруповёрт отмечен: минус 6000 ('+s0+' → '+s1+')');
await pg.reload();await pg.waitForTimeout(800);await pg.click('[data-tab="parts"]');await pg.waitForTimeout(300);ok(await pg.isChecked('[data-tool="screw"]'),'отметка запомнилась после перезагрузки');
await pg.selectOption('#sJig','32');await pg.waitForTimeout(400);
ok(await pg.$$eval('#toolList [data-tool="jig32"]',x=>x.length)===1,'кондуктор 32 в списке');
const txt=await pg.$eval('#drillList',e=>e.textContent);ok(/Кондуктор 32: ряд через 32 мм/.test(txt),'в присадке ряд 32');
await pg.selectOption('#sJig','univ');await pg.waitForTimeout(300);ok(await pg.$$eval('#toolList [data-tool="jigU"]',x=>x.length)===1&&await pg.$$eval('#toolList [data-tool="jigH"]',x=>x.length)===0,'универсальный кондуктор вместо шаблона петель');
console.log(bad.length?'✗ '+bad.join('\n✗ '):`✓ все ${n} проверок`,'errs',errs);await b.close()})();
