// исправление для ошибок по глубине — глубина, а не удаление секции с ящиками
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2]||'shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[],ok=(c,m)=>{n++;if(!c)bad.push(m)};
 if(!M.fixFor)return{n:0,bad:['fixFor не выставлен']};
 const p=M.newProject();p.D=250;M.norm(p);const c=M.calc(p,M.effSettings(p)),E=c.warn.filter(w=>w.lvl==='err');ok(E.length>0,'есть ошибки при глубине 250');
 E.forEach(e=>{const f=M.fixFor(e.t,p);if(!f)return;ok(/^глубина \d+ мм$/.test(f.label),'«'+e.t.slice(0,60)+'» → '+f.label);
  const q=JSON.parse(JSON.stringify(p));f.f(q);M.norm(q);ok(q.sections.length===p.sections.length&&q.sections.reduce((a,x)=>a+x.drawers,0)===p.sections.reduce((a,x)=>a+x.drawers,0),'секции и ящики на месте после «'+f.label+'»');
  const c2=M.calc(q,M.effSettings(q));ok(!c2.warn.some(w=>w.lvl==='err'&&w.t.replace(/\d+/g,'#')===e.t.replace(/\d+/g,'#')),'ошибка ушла')});
 const f=M.fixFor(E[0].t,p);ok(f&&f.label==='глубина 450 мм'||f&&/глубина/.test(f.label),'наименьшая подходящая глубина: '+(f&&f.label));
 return{n,bad}});console.log(r.bad.length?'✗ '+r.bad.join('\n✗ '):`✓ все ${r.n} проверок`,'errs',errs);await b.close()})();
