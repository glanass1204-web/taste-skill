const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster,out=[];
 for(const [type,W,n] of [['coupe',3000,2],['coupe',3000,4],['swing',3000,4],['swing',3600,5],['swing',2400,3],['coupe',5000,6]]){const p=M.newProject();p.type=type;p.W=W;p.H=2400;p.D=450;p.coupeN=type==='coupe'?3:0;p.mirrors=0;p.sections=Array.from({length:n},(_,i)=>({shelves:3,rod:false,drawers:0,baskets:0}));
  const S=M.effSettings(p),c=M.calc(p,S),w=c.wings[0];const ps=c.parts.filter(x=>['Боковина','Крыша','Дно','Цоколь','Перегородка'].includes(x.name)).map(x=>`${x.name} ${x.L}×${x.Wd}×${x.qty}`);
  const big=c.parts.filter(x=>Math.max(x.L,x.Wd)>S.sheetL-2*S.trim).map(x=>x.name);
  out.push({type,W,n,J:w.J,corp:w.corp.map(c=>Math.round(c.x1-c.x0)),ws:w.ws.map(Math.round),ps,big,errs:c.warn.filter(x=>x.lvl==='err').map(x=>x.t.slice(0,70)),notes:c.notes.filter(x=>/корпус/.test(x)),hw:c.hw.filter(h=>/Стяжка|Крепление|Петля/.test(h[0])).map(h=>h[0].slice(0,30)+' '+h[1])})}
 return out});
r.forEach(x=>console.log(JSON.stringify(x)));console.log(errs);await b.close()})();
