// обход всех разделов на ширине телефона: нет горизонтальной прокрутки, списки не обрезаны, ничего не вылезает за карточку
const {chromium}=require('playwright');const PORT=process.argv[2]||'8765',W=+(process.argv[3]||360);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:W,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+PORT+'/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const out=[];
const check=async tag=>{const r=await pg.evaluate(()=>{const o=[];const vw=document.documentElement.clientWidth;if(document.documentElement.scrollWidth>vw+1)o.push('прокрутка вбок: '+document.documentElement.scrollWidth+'>'+vw);
  const visible=e=>{let x=e;while(x){if(x.hidden||getComputedStyle(x).display==='none')return false;x=x.parentElement}return e.offsetWidth>0};
  document.querySelectorAll('select').forEach(sel=>{if(!visible(sel))return;const opt=sel.options[sel.selectedIndex];if(!opt)return;const c=document.createElement('canvas').getContext('2d'),cs=getComputedStyle(sel);c.font=`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
   const need=c.measureText(opt.text).width+parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);if(need>sel.clientWidth+1)o.push('список '+(sel.id||sel.dataset.ctype||'?')+': «'+opt.text+'»')});
  // элементы шире своей карточки (кроме прокручиваемых таблиц и рисунков)
  document.querySelectorAll('.card,.kp-sheet').forEach(card=>{if(!visible(card))return;const cr=card.getBoundingClientRect();card.querySelectorAll('button,input,select,label,span,b,p,h3,h4,li,.chip').forEach(e=>{if(!visible(e))return;
   let x=e,scr=false;while(x&&x!==card){const ov=getComputedStyle(x).overflowX;if(ov==='auto'||ov==='scroll'||ov==='hidden')scr=true;x=x.parentElement}if(scr)return;const r=e.getBoundingClientRect();if(r.right>cr.right+2||r.left<cr.left-2)o.push('вылезает: '+(e.id||e.tagName.toLowerCase())+' «'+(e.textContent||'').trim().slice(0,30)+'» '+Math.round(r.right-cr.right))})});
  return [...new Set(o)]});r.slice(0,8).forEach(x=>out.push(tag+': '+x))};
const tabs=['build','parts','cut','cost','set'];
for(const kind of ['wardrobe','kitchen','chest']){await pg.click(`[data-tab="build"]`);await pg.waitForTimeout(200);await pg.click(`[data-kind="${kind}"]`);await pg.waitForTimeout(400);
 for(const t of tabs){await pg.click(`[data-tab="${t}"]`);await pg.waitForTimeout(400);await pg.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await pg.waitForTimeout(300);await check(kind+'/'+t)}}
// заказы, документы, КП
await pg.click('[data-tab="build"]');await pg.click('#openProjects');await pg.waitForTimeout(400);await check('заказы');await pg.click('#closeProjects').catch(()=>{});await pg.waitForTimeout(300);
await pg.click('[data-tab="cost"]');await pg.waitForTimeout(300);await pg.click('#openKp');await pg.waitForTimeout(1500);await check('КП');await pg.click('#closeKp');await pg.waitForTimeout(300);
const docs=await pg.$$eval('[data-doc]',x=>[...new Set(x.map(e=>e.dataset.doc))]);for(const d of docs){const btn=await pg.$(`[data-doc="${d}"]`);if(!btn)continue;await btn.scrollIntoViewIfNeeded().catch(()=>{});await btn.click().catch(()=>{});await pg.waitForTimeout(500);await check('документ '+d);await pg.click('#closeDoc').catch(()=>{});await pg.waitForTimeout(200)}
console.log(out.length?out.join('\n'):'✓ замечаний нет','\nerrs',errs);await b.close()})();
