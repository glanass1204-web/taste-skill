// картинка присадки и шаблон 1:1 в интерфейсе
const {chromium}=require('playwright');const PORT=process.argv[2]||'8765',SHOT=process.argv[3]==='shot';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+PORT+'/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const bad=[];let n=0;const ok=(c,m)=>{n++;if(!c)bad.push(m)};
await pg.click('[data-tab="parts"]');await pg.waitForTimeout(400);
const cnt=await pg.$$eval('#drillList details.drill',x=>x.length);ok(cnt>5,'деталей в присадке '+cnt);
// дверь
const idx=await pg.$$eval('#drillList details.drill',x=>x.findIndex(d=>/Дверь 1/.test(d.querySelector('summary').textContent)));ok(idx>=0,'есть Дверь 1');
await pg.evaluate(i=>{const d=document.querySelectorAll('#drillList details.drill')[i];d.open=true;d.scrollIntoView()},idx);await pg.waitForTimeout(400);
const info=await pg.evaluate(i=>{const d=document.querySelectorAll('#drillList details.drill')[i];return{svg:!!d.querySelector('.dpic svg'),circ:d.querySelectorAll('.dpic circle').length,leg:d.querySelector('.dleg')?.textContent||'',btn:!!d.querySelector('[data-dtpl]')}},idx);
ok(info.svg&&info.circ>=6,'у двери картинка, кружков '+info.circ);ok(/Ø35 чашка петли/.test(info.leg),'легенда: '+info.leg);
if(SHOT){const el=await pg.$(`#drillList details.drill:nth-child(${idx+1})`);await el.screenshot({path:'look/drill-door.png'})}
// боковина
const si=await pg.$$eval('#drillList details.drill',x=>x.findIndex(d=>/Боковина левая/.test(d.querySelector('summary').textContent)));
await pg.evaluate(i=>{const d=document.querySelectorAll('#drillList details.drill')[i];d.open=true;d.scrollIntoView()},si);await pg.waitForTimeout(400);
if(SHOT){const el=await pg.$(`#drillList details.drill:nth-child(${si+1})`);await el.screenshot({path:'look/drill-side.png'})}
await pg.click(`#drillList details.drill:nth-child(${si+1}) [data-dtpl]`);await pg.waitForTimeout(500);
const tp=await pg.evaluate(()=>({vis:!document.getElementById('docWrap').hidden,pages:document.querySelectorAll('#docSheet .tpl-page').length,w:document.querySelector('#docSheet .tpl-page svg')?.getAttribute('width')}));
ok(tp.vis&&tp.pages>0&&tp.w==='180mm','шаблон открылся: листов '+tp.pages);
if(SHOT){await pg.screenshot({path:'look/drill-tpl.png'});await pg.emulateMedia({media:'print'});await pg.pdf({path:'look/drill-tpl.pdf',format:'A4'});await pg.emulateMedia({media:'screen'})}
await pg.click('#closeDoc');await pg.waitForTimeout(300);ok(await pg.evaluate(()=>document.getElementById('docWrap').hidden),'закрылся');
console.log(bad.length?'✗ '+bad.join('\n✗ '):`✓ все ${n} проверок`,'errs',errs);await b.close()})();
