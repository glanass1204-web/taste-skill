// своя фурнитура: ящик считается по вычетам из инструкции своих направляющих — ответы вручную
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const S0=M.settings();S0.cat.slides.push({id:'u_t1',seg:'мои',mine:true,name:'Мои шариковые',kind:'side',dW:30,dL:0,price:777});
 S0.cat.slides.push({id:'u_t2',seg:'мои',mine:true,name:'Мои скрытые',kind:'hidden',dW:42,dL:10,price:1500});S0.cat.hinges.push({id:'u_h',seg:'мои',mine:true,name:'Мои петли',over:333,half:444,gap:3,tmin:14,tmax:24});
 const p=M.newProject();p.kind='chest';p.c.W=800;p.c.cols=[{type:'drawers',drawers:3,shelves:0}];
 const run=id=>{p.hw.slide=id;const S=M.effSettings(p);return M.calc(p,S)};const t=M.effSettings(p).t,open=800-2*t;
 let c=run('u_t1');const fb=c.parts.find(x=>x.name==='Ящик: перед и зад');ok(fb&&Math.min(fb.L,fb.Wd)!==undefined&&(fb.L===open-30-2*t||fb.Wd===open-30-2*t),`свои боковые (−30): перед ящика = ${open} − 30 − 2×${t} = ${open-30-2*t}`);
 ok(c.hw.some(h=>/мои шариковые/.test(h[0])&&h[3]===777),'в смете свои направляющие по 777 ₽');
 c=run('u_t2');const fh=c.parts.find(x=>x.name==='Ящик: перед и зад'),dn=c.parts.find(x=>/дно \(ЛДСП/.test(x.name));ok(fh&&(fh.L===open-42||fh.Wd===open-42),`свои скрытые (−42): перед ящика = ${open} − 42 = ${open-42}`);ok(!!dn,'скрытые: дно ящика из ЛДСП между боковинами');
 const q=M.newProject();q.hw.hinge='u_h';const ch=M.calc(q,M.effSettings(q));ok(ch.hw.some(h=>/Мои петли/.test(h[0])&&h[3]===333),'свои петли: накладная 333 ₽');
 S0.mat.bodies.push({id:'u_b18',mine:true,name:'Своя ЛДСП 18',t:18,L:2800,W:2070,price:3000});{const a=M.newProject(),b2=M.newProject();a.mat.body='krono18';b2.mat.body='u_b18';const pa=JSON.stringify(M.calc(a,M.effSettings(a)).parts),pb=JSON.stringify(M.calc(b2,M.effSettings(b2)).parts);ok(pa===pb,'своя ЛДСП 18 мм 2800×2070 — детали те же, что у Kronospan 18');S0.mat.bodies=S0.mat.bodies.filter(x=>x.id!=='u_b18')}
 S0.cat.slides=S0.cat.slides.filter(x=>!x.id.startsWith('u_'));S0.cat.hinges=S0.cat.hinges.filter(x=>!x.id.startsWith('u_'));
 return{n,bad}});
console.log('Проверок:',r.n,'Ошибок:',r.bad.length);r.bad.forEach(x=>console.log(' -',x));console.log('js errors',errs);await b.close()})();
