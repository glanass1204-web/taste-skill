// выгрузка деталей для opcut: те же случайные заказы, что в packcmp.js, плюс встроенные шаблоны
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(process.argv[2]||'shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(400);
const out=await pg.evaluate(()=>{const M=window.ShkafMaster;let x=7;const r=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648};const ps=[];
 for(let i=0;i<400;i++){const p=M.newProject();const kind=r()<.5?'wardrobe':r()<.6?'kitchen':'chest';p.kind=kind;
  if(kind==='wardrobe'){p.W=Math.round(800+r()*2800);p.H=Math.round(1800+r()*900);p.D=Math.round(350+r()*300);p.type=r()<.4?'coupe':'swing';const n=Math.max(1,Math.round(p.W/(450+r()*400)));p.sections=Array.from({length:Math.min(6,n)},()=>({shelves:Math.floor(r()*6),rod:r()<.4,drawers:Math.floor(r()*3),baskets:0}));p.mezz=r()<.6}
  if(kind==='chest'){p.c.W=Math.round(400+r()*1600);p.c.H=Math.round(400+r()*900);p.c.D=Math.round(300+r()*300)}ps.push(p)}
 M.builtinTemplates().forEach(t=>ps.push(M.fromTemplate(t)));
 const res=[];ps.forEach((p,i)=>{const S=M.effSettings(p),c=M.calc(p,S);[['ldsp',!S.grain],['hdf',true]].forEach(([m,rot])=>{const parts=c.parts.filter(z=>z.mat===m);if(!parts.length)return;const pk=M.pack(parts,S,rot);
   const Ls=S.sheetL-2*S.trim,Ws=S.sheetW-2*S.trim,items=[];pk.sheets.forEach(sh=>sh.parts.forEach(q=>items.push([q.l,q.w])));
   res.push({id:i+':'+m,Ls,Ws,kerf:S.kerf,rot,items,ours:pk.sheets.length})})});return res});
fs.writeFileSync('opc/cases.json',JSON.stringify(out));console.log('случаев',out.length);await b.close()})();
