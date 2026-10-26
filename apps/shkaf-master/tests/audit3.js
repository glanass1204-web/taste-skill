// Независимая проверка: у каждой двери петли должны стоять на боковине или перегородке
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate((HG)=>{const M=window.ShkafMaster,S=M.DEFAULT_SETTINGS,t=S.t,bad=[];let n=0;
 for(const side of ['L','R'])for(const W of [1200,1600,1800,2400,3000])for(const W2 of [1000,1400,2000])for(const nA of [1,2,3,4])for(const nB of [1,2,3])for(const co of [300,450,600]){
  const p=M.newProject();p.shape='corner';p.cornerSide=side;p.W=W;p.W2=W2;p.cornerOpen=co;p.mirrors=0;p.hw.hinge=HG;
  p.sections=Array.from({length:nA},()=>({shelves:2,rod:false,drawers:0,baskets:0}));p.sectionsB=Array.from({length:nB},()=>({shelves:2,rod:false,drawers:0,baskets:0}));
  const c=M.calc(p,S);c.wings.forEach(w=>{const sup=[0,w.W,...w.xs.slice(1).map(x=>x-t/2),...(w.jc||[])];w.doors.forEach(d=>{n++;const bx=d.hinge==='L'?d.x:d.x+d.w;
    if(!sup.some(s=>Math.abs(s-bx)<=3.1))bad.push(`угол ${side} ${W}×${W2} А${nA}Б${nB} проём${co} сторона ${w.key}: петли на ${bx.toFixed(0)} мм — там нет стенки`)})})}
 return{n,bad:[...new Set(bad)]}},process.argv[2]||'boyard');
console.log('дверей проверено',r.n,'без опоры:',r.bad.length);r.bad.slice(0,12).forEach(x=>console.log(' -',x));await b.close()})();
