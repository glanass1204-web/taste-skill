// «Торопливый человек»: случайный ввод во все поля, случайные нажатия, переключение вкладок и видов изделия.
// После каждого действия: нет ошибок страницы, нет NaN/undefined/Infinity в тексте, цена — конечное число, данные не теряются.
const {chromium}=require('playwright');
const SEED=+(process.argv[2]||1),STEPS=+(process.argv[3]||300),URL=process.argv[4]||'http://localhost:8765/';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
pg.on('dialog',d=>d.dismiss().catch(()=>{}));
await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
let s=SEED>>>0;const rnd=()=>{s=(s+0x6D2B79F5)>>>0;let z=s;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296},pick=a=>a[Math.floor(rnd()*a.length)];
const junk=()=>pick(['0','-5','1','99999','abc','','  ','1e9','12.7','3,5','600','2400','450','NaN','-0','007','<b>x</b>','Иванов','2000',String(Math.floor(rnd()*5000))]);
// кнопки, которые уводят из программы или стирают всё, не нажимаем
const SKIP=/delProject|importBtn|exportBtn|resetSet|installBtn|shareLink|tryShare|kpPrint|docPrint|kpShare|docShare|mountShare|tryFile|doneFile|restore/i;
let bad=[],steps=0;
const check=async(what)=>{const r=await pg.evaluate(()=>{const vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
  const txt=[...document.querySelectorAll('main, header, .kp-wrap:not([hidden])')].map(e=>e.innerText).join(' ');
  const m=txt.match(/.{0,40}(NaN|undefined|Infinity|\[object Object\]|null ₽).{0,40}/);
  const price=(document.querySelector('header .num, header [class*=price], #topPrice')||{}).textContent||'';return{m:m&&m[0],price}});
  if(r.m)bad.push(`${what}: в тексте «${r.m}»`);if(/NaN|undefined|Infinity/.test(r.price))bad.push(`${what}: цена «${r.price}»`)};
for(;steps<STEPS;steps++){const act=rnd();let what='';
  try{
    if(act<0.12){const t=pick(['build','parts','cut','cost','set']);what='вкладка '+t;await pg.click(`[data-tab="${t}"]`,{timeout:1500})}
    else if(act<0.2){const k=pick(['wardrobe','kitchen','hall','walk','chest']);what='вид '+k;await pg.click(`[data-tab="build"]`,{timeout:1500});await pg.click(`[data-kind="${k}"]`,{timeout:1500})}
    else if(act<0.6){const ins=await pg.$$('main input:not([type=checkbox]):not([type=file]):not([type=color]), main textarea:not([readonly])');const vis=[];for(const e of ins)if(await e.isVisible())vis.push(e);
      if(vis.length){const e=pick(vis),id=await e.evaluate(x=>x.id||x.dataset.k||x.name||x.className);const v=junk();what=`ввод «${v}» в ${id}`;await e.fill(v,{timeout:1500});if(rnd()<.7)await e.press('Tab',{timeout:1500});else await e.dispatchEvent('change')}}
    else if(act<0.7){const sels=await pg.$$('main select');const vis=[];for(const e of sels)if(await e.isVisible())vis.push(e);
      if(vis.length){const e=pick(vis);const opts=await e.$$eval('option',o=>o.map(x=>x.value).filter(v=>v!=='__new'));if(opts.length){const v=pick(opts);what='выбор '+v;await e.selectOption(v,{timeout:1500})}}}
    else if(act<0.8){const cbs=await pg.$$('main input[type=checkbox]');const vis=[];for(const e of cbs)if(await e.isVisible())vis.push(e);if(vis.length){const e=pick(vis);what='галочка';await e.click({timeout:1500})}}
    else{const bs=await pg.$$('main button, header button');const vis=[];for(const e of bs){if(!(await e.isVisible()))continue;const id=await e.evaluate(x=>(x.id||'')+' '+Object.keys(x.dataset).join(' '));if(!SKIP.test(id))vis.push([e,id])}
      if(vis.length){const [e,id]=pick(vis);what='кнопка '+id;await e.click({timeout:1500})}}
  }catch(e){/* элемент исчез или перекрыт — это не ошибка программы */}
  await pg.waitForTimeout(40);
  // закрыть всплывшие окна
  for(const id of ['#closeKp','#closeDoc','#closeProjects'])if(await pg.isVisible(id).catch(()=>false))await pg.click(id).catch(()=>{});
  if(steps%5===0||/вкладка|вид/.test(what))await check(what);
  if(errs.length){bad.push(`${what}: ошибка страницы ${errs.join(' | ')}`);errs.length=0}
  if(bad.length>8)break}
// данные переживают перезапуск
const before=await pg.evaluate(()=>localStorage.getItem('shkaf.projects'));await pg.waitForTimeout(500);await pg.reload();await pg.waitForTimeout(800);
const after=await pg.evaluate(()=>localStorage.getItem('shkaf.projects'));
const n1=JSON.parse(before||'[]').length,n2=JSON.parse(after||'[]').length;if(n2<n1)bad.push(`после перезапуска заказов меньше: ${n1} → ${n2}`);
await check('после перезапуска');if(errs.length)bad.push('ошибка после перезапуска: '+errs.join(' | '));
console.log(`seed ${SEED}: действий ${steps}, проблем ${bad.length}`);bad.slice(0,10).forEach(x=>console.log(' -',x.slice(0,250)));await b.close()})();
