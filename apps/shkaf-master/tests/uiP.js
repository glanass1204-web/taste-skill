// свои цены инструмента в настройках и ряд 32 на картинке — в интерфейсе
const {chromium}=require('playwright');const PORT=process.argv[2]||'8765',SHOT=process.argv[3]==='shot';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+PORT+'/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const bad=[];let n=0;const ok=(c,m)=>{n++;if(!c)bad.push(m)};const num=t=>+t.replace(/[^\d]/g,'');
await pg.click('[data-tab="parts"]');await pg.waitForTimeout(300);const s0=num(await pg.$eval('#toolList .tool-sum b',e=>e.textContent));
await pg.click('[data-tab="set"]');await pg.waitForTimeout(300);const cnt=await pg.$$eval('#setTools [data-tp]',x=>x.length);ok(cnt>=25,'в настройках цен инструмента: '+cnt);
await pg.evaluate(()=>document.getElementById('setTools').closest('details').open=true);await pg.waitForTimeout(200);await pg.fill('#tp_screw','4500');await pg.dispatchEvent('#tp_screw','input');await pg.waitForTimeout(300);
await pg.click('[data-tab="parts"]');await pg.waitForTimeout(300);const s1=num(await pg.$eval('#toolList .tool-sum b',e=>e.textContent));ok(s0-s1===1500,`итог ${s0} → ${s1} (минус 1500)`);
ok(/4\s?500/.test(await pg.$eval('[data-tool="screw"]',e=>e.closest('.tool').textContent)),'в списке 4 500');
await pg.reload();await pg.waitForTimeout(800);await pg.click('[data-tab="set"]');await pg.waitForTimeout(300);ok(await pg.inputValue('#tp_screw')==='4500','цена запомнилась');
await pg.evaluate(()=>document.getElementById('setTools').closest('details').open=true);await pg.fill('#tp_screw','');await pg.dispatchEvent('#tp_screw','input');await pg.waitForTimeout(300);await pg.click('[data-tab="parts"]');await pg.waitForTimeout(300);
ok(num(await pg.$eval('#toolList .tool-sum b',e=>e.textContent))===s0,'пустое поле — снова по умолчанию');
await pg.selectOption('#sJig','32');await pg.waitForTimeout(400);
const si=await pg.$$eval('#drillList details.drill',x=>x.findIndex(d=>/Боковина левая/.test(d.querySelector('summary').textContent)));
await pg.evaluate(i=>{const d=document.querySelectorAll('#drillList details.drill')[i];d.open=true;d.scrollIntoView()},si);await pg.waitForTimeout(400);
const info=await pg.evaluate(i=>{const d=document.querySelectorAll('#drillList details.drill')[i];return{white:[...d.querySelectorAll('.dpic circle')].filter(c=>c.getAttribute('fill')==='#FFFFFF').length,leg:d.querySelector('.dleg').textContent}},si);
ok(info.white>50&&/ряд через 32/.test(info.leg),'ряд на картинке: пустых кружков '+info.white);
if(SHOT){const el=await pg.$(`#drillList details.drill:nth-child(${si+1})`);await el.screenshot({path:'look/drill-row.png'})}
console.log(bad.length?'✗ '+bad.join('\n✗ '):`✓ все ${n} проверок`,'errs',errs);await b.close()})();
