// сравнение числа листов: новый раскрой против прежнего на случайных заказах
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const load=async f=>{const pg=await b.newPage();await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(f,'utf8')+'</body></html>');await pg.waitForTimeout(400);return pg};
const O=await load('v22-backup.html'),N=await load('shkaf-master.html');
const gen=`(seed)=>{const M=window.ShkafMaster;let x=seed;const r=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648};const res=[];
 for(let i=0;i<400;i++){const p=M.newProject();const kind=r()<.5?'wardrobe':r()<.6?'kitchen':'chest';p.kind=kind;
  if(kind==='wardrobe'){p.W=Math.round(800+r()*2800);p.H=Math.round(1800+r()*900);p.D=Math.round(350+r()*300);p.type=r()<.4?'coupe':'swing';const n=Math.max(1,Math.round(p.W/(450+r()*400)));p.sections=Array.from({length:Math.min(6,n)},()=>({shelves:Math.floor(r()*6),rod:r()<.4,drawers:Math.floor(r()*3),baskets:0}));p.mezz=r()<.6}
  if(kind==='chest'){p.c.W=Math.round(400+r()*1600);p.c.H=Math.round(400+r()*900);p.c.D=Math.round(300+r()*300)}
  const S=M.effSettings(p),c=M.calc(p,S);const q=(m)=>c.parts.filter(z=>z.mat===m);const g=!S.grain;
  const a=M.pack(q('ldsp'),S,g),h=M.pack(q('hdf'),S,true);res.push([a.sheets.length,h.sheets.length,a.over.length])}return res}`;
const o=await O.evaluate(`(${gen})(7)`),n=await N.evaluate(`(${gen})(7)`);
let worse=0,better=0,saved=0,tot=0;o.forEach((x,i)=>{const d=x[0]+x[1]-(n[i][0]+n[i][1]);tot+=x[0]+x[1];if(d<0)worse++;if(d>0){better++;saved+=d}});
console.log('заказов',o.length,'лучше',better,'хуже',worse,'листов было',tot,'сэкономлено листов',saved);await b.close()})();
