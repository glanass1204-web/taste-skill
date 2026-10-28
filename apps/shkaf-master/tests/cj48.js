// v48: купе из двух корпусов — боковины в стыке мельче под двери; угловая кухня — столешница Б за столешницей А
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8')+'</body></html>');await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const wr=f=>{const p=M.newProject();p.shape='straight';p.W=3000;p.H=2400;p.D=450;p.plinth=80;p.mirrors=0;p.sections=[1,2,3,4].map(()=>({shelves:3,rod:false,drawers:0,baskets:0}));f(p);M.norm(p);const S=M.effSettings(p);return{p,S,c:M.calc(p,S)}};
 const P=(c,re)=>c.parts.filter(x=>re.test(x.name)).map(x=>x.L+'x'+x.Wd+'x'+x.qty).sort().join(',');
 {const {p,S,c}=wr(p=>p.type='coupe');ok(c.wings[0].J.length===1,'купе 3000: два корпуса');
  ok(P(c,/^Боковина$/)==='2400x450x2','внешние боковины 2400×450 ×2: '+P(c,/^Боковина$/));ok(P(c,/^Боковина в стыке/)==='2400x350x2','в стыке 2400×350 ×2 (450−100): '+P(c,/^Боковина в стыке/));
  const d=M.drillMap(p,S,c);ok(d.filter(x=>/оковина/.test(x.name)&&x.size==='2400×350').length===2,'сверловка: 2 боковины 2400×350');
  M.__render(p);const it=M.scene3dData().groups[0].items.filter(x=>x.m==='body'&&x.h===2400);ok(it.filter(x=>x.d===350).length===2&&it.filter(x=>x.d===450).length===2,'3D: две боковины по 350, две по 450')}
 {const {c}=wr(p=>p.type='swing');ok(P(c,/^Боковина$/)==='2400x450x4'&&!P(c,/стыке/),'распашной 3000: все 4 боковины 450')}
 // угловая кухня, угол справа: столешница стороны Б в 3D начинается от глубины столешницы
 for(const cs of ['L','R']){const p=M.newProject();p.kind='kitchen';p.k.shape='corner';p.k.cornerSide=cs;M.norm(p);M.__render(p);const d=M.scene3dData(),c=M.calc(p,M.effSettings(p));
  const B=d.groups[1],tops=B.items.filter(x=>x.m==='top'),D=c.top.D;const lo=Math.min(...tops.map(x=>x.x)),hi=Math.max(...tops.map(x=>x.x+x.w));
  const sd=c.L.sides[1];ok(cs==='L'?hi<=sd.cx-D+0.01:lo>=D-0.01,`угол ${cs}: столешница Б не заходит под столешницу А (${Math.round(lo)}..${Math.round(hi)})`);
  const len=tops.reduce((a,x)=>a+x.w,0);ok(Math.abs(len-c.topB)<1,`угол ${cs}: длина столешницы Б в 3D ${Math.round(len)} = в смете ${Math.round(c.topB)}`)}
 return{n,bad}});
console.log(r.bad.length?r.bad.map(x=>'✗ '+x).join('\n'):'✓ все '+r.n+' проверок');console.log('errs',errs);await b.close()})();
