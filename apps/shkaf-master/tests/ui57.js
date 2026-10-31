// v57: поля на телефоне не обрезаются и без дыр; у цены — число ошибок, нажатие ведёт к ним
const {chromium}=require('playwright');const PORT=process.argv[2]||'8765',SHOT=process.argv[3]==='shot';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:385,height:820},deviceScaleFactor:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+PORT+'/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const bad=[];let n=0;const ok=(c,m)=>{n++;if(!c)bad.push(m)};
// все видимые выпадающие списки: текст выбранного пункта помещается
const clipped=()=>pg.evaluate(()=>{const o=[];document.querySelectorAll('select').forEach(sel=>{let e=sel,vis=true;while(e){if(e.hidden||getComputedStyle(e).display==='none')vis=false;e=e.parentElement}if(!vis||!sel.offsetWidth)return;
  const opt=sel.options[sel.selectedIndex];if(!opt)return;const c=document.createElement('canvas').getContext('2d'),cs=getComputedStyle(sel);c.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const need=c.measureText(opt.text).width+parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);if(need>sel.clientWidth+1)o.push((sel.id||'?')+': «'+opt.text+'» '+Math.round(need)+'>'+sel.clientWidth)});return o});
// пустые клетки в сетках из трёх: видимое поле не должно стоять в 3-й колонке, если 2-я в этой строке пустая
const holes=()=>pg.evaluate(()=>{const o=[];document.querySelectorAll('.grid3').forEach(g=>{if(!g.offsetWidth)return;const it=[...g.children].filter(x=>x.offsetWidth&&getComputedStyle(x).visibility!=='hidden');
  const rows={};it.forEach(x=>{const r=x.getBoundingClientRect(),k=Math.round(r.top);(rows[k]=rows[k]||[]).push(r)});Object.values(rows).forEach(rs=>{rs.sort((a,b)=>a.left-b.left);const gl=g.getBoundingClientRect().left;
   let x=gl;rs.forEach(r=>{if(r.left-x>40)o.push((g.parentElement.id||g.id||'grid')+': дыра '+Math.round(r.left-x)+' px');x=r.right})})});return o});
// поля не прячутся «невидимостью» — иначе остаются пустые места
const ghosts=()=>pg.evaluate(()=>[...document.querySelectorAll('.field')].filter(f=>f.offsetHeight&&getComputedStyle(f).visibility==='hidden').map(f=>f.id||f.textContent.slice(0,20)));
const kinds=[['wardrobe',null],['hall','set'],['walk',null],['kitchen',null],['chest',null]];
for(const [k,hp] of kinds){await pg.click(`[data-kind="${k}"]`);await pg.waitForTimeout(300);if(hp){await pg.click(`[data-hallp="${hp}"]`);await pg.waitForTimeout(300)}
 if(k==='hall'){await pg.click('[data-shape="corner"]');await pg.waitForTimeout(300)}
 const c=await clipped(),h=await holes();ok(!c.length,k+': обрезанные списки '+c.join('; '));ok(!h.length,k+': дыры '+h.join('; '));const gh=await ghosts();ok(!gh.length,k+': невидимые поля занимают место: '+gh.join(', '))}
for(const pr of ['bedlift','beddr','bedloft']){await pg.click(`[data-preset="${pr}"]`);await pg.waitForTimeout(300);const c=await clipped();ok(!c.length,pr+': обрезанные списки '+c.join('; '))}
// потолок: «Да» — поле «Потолок» видно, «Нет» — пропадает без дыры
await pg.click('[data-kind="wardrobe"]');await pg.waitForTimeout(300);await pg.selectOption('#pCeil','stand');await pg.waitForTimeout(300);ok(await pg.isVisible('#pCeilH'),'потолок: поле видно');ok(!(await holes()).length,'с потолком без дыр');
if(SHOT){await pg.evaluate(()=>document.getElementById('pCeil').scrollIntoView({block:'center'}));await pg.screenshot({path:'look/v57-ceil.png'})}
await pg.selectOption('#pCeil','');await pg.waitForTimeout(300);ok(!(await pg.isVisible('#pCeilH')),'без потолка поля нет');
// ошибки: делаем шкаф выше потолка по замеру — у цены красный кружок с числом, нажатие ведёт к списку ошибок
await pg.fill('#pD','250');await pg.dispatchEvent('#pD','input');await pg.waitForTimeout(400);
let st=await pg.evaluate(()=>{const b=document.getElementById('hdrPrice'),e=window.ShkafMaster.__hooks.R().c.warn.filter(w=>w.lvl==='err').length;return{bad:b.classList.contains('bad'),n:b.dataset.err,e,after:getComputedStyle(b,'::after').content}});
ok(st.bad&&st.e>0&&st.n===String(st.e)&&st.after.includes(String(st.e)),'кружок с числом ошибок: '+JSON.stringify(st));
await pg.click('[data-tab="cost"]');await pg.waitForTimeout(300);await pg.click('#hdrPrice');await pg.waitForTimeout(900);
ok(await pg.evaluate(()=>{const v=document.getElementById('view-build');const a=document.getElementById('buildAlerts').getBoundingClientRect();return !v.hidden&&a.top<innerHeight&&a.bottom>0}),'нажатие на цену — список ошибок на экране');
if(SHOT)await pg.screenshot({path:'look/v57-err.png'});
await pg.click('[data-tab="build"]');await pg.waitForTimeout(300);await pg.fill('#pD','560');await pg.dispatchEvent('#pD','input');await pg.waitForTimeout(400);
st=await pg.evaluate(()=>({bad:document.getElementById('hdrPrice').classList.contains('bad')}));ok(!st.bad,'ошибок нет — кружка нет');
await pg.click('#hdrPrice');await pg.waitForTimeout(400);ok(await pg.evaluate(()=>!document.getElementById('view-cost').hidden),'без ошибок нажатие — смета');
console.log(bad.length?'✗ '+bad.join('\n✗ '):`✓ все ${n} проверок`,'errs',errs);await b.close()})();
