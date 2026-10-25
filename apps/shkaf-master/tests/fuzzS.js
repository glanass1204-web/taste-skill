const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let x=5;const rnd=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648};const bad=[];
 for(let i=0;i<200;i++){const p=M.newProject();p.kind=rnd()<.6?'wardrobe':rnd()<.5?'kitchen':'chest';p.hall=rnd()<.3;p.type=rnd()<.4?'coupe':'swing';p.D=Math.round(350+rnd()*300);p.W=Math.round(900+rnd()*2500);
  const n=Math.max(1,Math.min(6,Math.round(p.W/(450+rnd()*400))));p.sections=Array.from({length:n},()=>({shelves:Math.floor(rnd()*4),rod:rnd()<.5,drawers:Math.floor(rnd()*2),baskets:0,panto:rnd()<.2,trousers:rnd()<.2,shoeOut:Math.floor(rnd()*3),mirrorOut:rnd()<.15,led:rnd()<.3,open:rnd()<.15,hooks:rnd()<.2?3:0,seat:rnd()<.1}));
  p.svc={floor:1+Math.floor(rnd()*15),lift:['pass','cargo','none'][Math.floor(rnd()*3)],km:rnd()<.3?Math.floor(rnd()*80):0,dism:rnd()<.3,trash:rnd()<.3};p.discount=rnd()<.3?10:0;p.prepay=rnd()<.3?10000:0;
  M.norm(p);const o=M.__render(p);const txt=document.body.innerText+document.getElementById('kpSheet').innerText;
  if(/NaN|undefined|\[object/.test(txt))bad.push(i+': '+(txt.match(/.{0,40}(NaN|undefined|\[object).{0,40}/)||[''])[0]);if(!o.kp)bad.push(i+': пустое КП')}
 return bad});
console.log('случайных заказов 200, проблем:',r.length,r.slice(0,5));console.log('js errors',errs.slice(0,3));await b.close()})();
