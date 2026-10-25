// цены прежних заказов не должны измениться: старая версия против новой на одинаковых заказах
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const load=async f=>{const pg=await b.newPage();await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(f,'utf8')+'</body></html>');await pg.waitForTimeout(400);return pg};
const O=await load(process.argv[2]||'v27-backup.html'),N=await load('shkaf-master.html');
const gen=`(()=>{const M=window.ShkafMaster;let x=11;const r=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648};const ps=[];
 for(let i=0;i<500;i++){const p=M.newProject();const kind=r()<.5?'wardrobe':r()<.6?'kitchen':'chest';p.kind=kind;p.discount=r()<.3?Math.floor(r()*20):0;
  if(kind==='wardrobe'){p.W=Math.round(800+r()*2800);p.H=Math.round(1800+r()*900);p.D=Math.round(350+r()*300);p.type=r()<.4?'coupe':'swing';const n=Math.max(1,Math.round(p.W/(450+r()*400)));p.sections=Array.from({length:Math.min(6,n)},()=>({shelves:Math.floor(r()*6),rod:r()<.4,drawers:Math.floor(r()*3),baskets:0}));p.mezz=r()<.6}
  if(kind==='chest'){p.c.W=Math.round(400+r()*1600);p.c.H=Math.round(400+r()*900);p.c.D=Math.round(300+r()*300)}ps.push(p)}
 M.builtinTemplates().forEach(t=>ps.push(M.fromTemplate(t)));
 return ps.map(p=>{const S=M.effSettings(p),c=M.calc(p,S),pk=m=>c.parts.filter(z=>z.mat===m),cl=M.pack(pk('ldsp'),S,!S.grain),cf=pk('ldspF').length?M.pack(pk('ldspF'),S,!S.grain):null,ch=M.pack(pk('hdf'),S,true);const k=M.costs(p,S,c,cl,ch,cf);return [k.price,k.priceFull,k.self,k.profit]})})()`;
const o=await O.evaluate(gen),n=await N.evaluate(gen);let diff=0;o.forEach((a,i)=>{if(JSON.stringify(a)!==JSON.stringify(n[i])){diff++;if(diff<5)console.log(i,a,n[i])}});
console.log('заказов',o.length,'с другой ценой',diff);await b.close()})();
