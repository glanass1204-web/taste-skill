// Случайные заказы всех видов со всеми опциями: программа не должна падать, выдавать NaN/undefined или пустые разделы
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','index.html'),N=+(process.argv[3]||400);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8').replace(/^[\s\S]*<body>/,'').replace(/<\/body>[\s\S]*$/,'')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(N=>{const M=window.ShkafMaster,fails=[];let checks=0;const ok=(c,m)=>{checks++;if(!c)fails.push(m)};
 let seed=3;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648},pick=a=>a[Math.floor(rnd()*a.length)],int=(a,b)=>a+Math.floor(rnd()*(b-a+1));
 const S=M.settings(),km=(type,w,sh,dr,ex)=>Object.assign({type,w,shelves:sh||0,drawers:dr||3},ex||{});
 const sec=()=>({shelves:int(0,5),rod:rnd()>.6,drawers:pick([0,0,1,2]),baskets:pick([0,0,1]),open:rnd()>.8,hooks:pick([0,0,0,3]),seat:rnd()>.85,shoes:int(0,2)});
 for(let n=0;n<N;n++){const p=M.newProject();const kind=pick(['wardrobe','kitchen','chest']);p.kind=kind;
  p.mat.body=pick(S.mat.bodies.map(x=>x.id));p.mat.front=pick(S.mat.fronts.map(x=>x.id));p.mat.top=pick(S.mat.tops.map(x=>x.id));p.mat.edgeF=pick(['0.4','0.8','1','2']);p.mat.edgeB=pick(['0.4','0.8','1','2']);
  p.hw.hinge=pick(S.cat.hinges.map(x=>x.id));p.hw.slide=pick(S.cat.slides.map(x=>x.id));p.hw.handle=pick(S.cat.handles.map(x=>x.id));p.hw.coupe=pick(S.cat.coupe.map(x=>x.id));
  p.discount=pick([0,0,5,15]);p.coupeSplit=pick([1,2,3]);p.coupeMat=pick(['mirror','tint','sand','photo']);p.walls={L:rnd()>.5,R:rnd()>.5,A:rnd()>.5,B:rnd()>.5};
  if(rnd()>.6)p.meas.w=[String(int(1200,5000)),'',''];if(rnd()>.6)p.meas.h=[String(int(2300,3000)),'',''];if(rnd()>.8)p.meas.wB=[String(int(1500,3500)),'',''];
  if(kind==='wardrobe'){p.shape=pick(['straight','straight','corner']);p.type=pick(['swing','swing','coupe']);p.W=int(800,4000);p.H=int(1600,2800);p.D=pick([350,450,560,600,650]);p.W2=int(900,2500);p.plinth=pick([0,60,80,100]);p.mezz=rnd()>.4;p.mezzH=int(300,600);
    p.sections=Array.from({length:int(1,5)},sec);p.sectionsB=Array.from({length:int(1,3)},sec);p.mirrors=int(0,3)}
  if(kind==='kitchen'){const k=p.k;k.shape=pick(['straight','straight','corner']);k.cornerSide=pick(['L','R']);k.cBase=pick(['blind','L']);k.cWall=pick(['blind','L','none']);k.gola=rnd()>.7;k.wall2H=pick([0,0,360,450]);k.apron=rnd()>.5;k.led=rnd()>.5;k.topPlinth=rnd()>.5;k.worktop=rnd()>.15;
    k.baseH=pick([720,720,800,600]);k.legs=pick([100,100,150,0]);k.wallH=pick([720,360,600,900]);k.wallY=pick([1450,1400,1550]);k.tallH=pick([2100,2200,2300]);
    const bt=['doors','drawers','sink','oven','dw','tall','tallOven','fridge','doors','drawers'],wt=['doors','open','drying','hood','gap','doors'];
    const row=(n,ts,wall)=>Array.from({length:n},()=>{const t=pick(ts);return km(t,pick([300,400,450,500,600,600,800]),int(0,3),int(1,4),{hob:rnd()>.7?pick(M.K_HOBS.map(h=>h.id)):undefined,open:wall&&rnd()>.6?'lift':undefined,top2:t==='tallOven'?pick(['','mw','c45']):undefined,low:pick(['doors','drawers']),split:t==='fridge'&&rnd()>.5?700:0})});
    k.base=row(int(1,6),bt);k.wall=row(int(0,5),wt,true);k.baseB=row(int(1,4),bt);k.wallB=row(int(0,3),wt,true);
    if(rnd()>.7){const r=M.kAuto(p,{LA:int(1800,4500),LB:int(1800,3000),cls:pick(['econ','mid','prem','']),dw:pick(['','450','600']),oven:pick(['','under','tall']),hob:rnd()>.3,fridge:rnd()>.5});if(r.p)Object.assign(p,{k:r.p.k,hw:r.p.hw,mat:r.p.mat})}}
  if(kind==='chest'){p.c.W=int(400,2000);p.c.H=int(400,1400);p.c.D=pick([300,400,450,500]);p.c.plinth=pick([0,60]);p.c.legs=pick([0,100]);p.c.cols=Array.from({length:int(1,4)},()=>({type:pick(['drawers','door','open']),drawers:int(1,5),shelves:int(0,3)}))}
  M.norm(p);const tag=`#${n} ${kind}`;
  let o;try{o=M.__render(p)}catch(e){fails.push(tag+': падение '+e.message);continue}
  const txt=[...document.querySelectorAll('.view'),document.getElementById('kpSheet'),document.querySelector('header')].map(e=>e?e.textContent+' '+[...e.querySelectorAll('input,textarea')].map(i=>i.value).join(' '):'').join(' ');ok(!/NaN|undefined|Infinity|\[object/.test(txt),tag+': в тексте NaN/undefined: '+(txt.match(/.{0,40}(NaN|undefined|Infinity|\[object).{0,40}/)||[''])[0]);
  ok(o.svg>0,tag+': нет чертежа');ok(o.kp>200,tag+': пустое предложение');ok(o.drill>20,tag+': пустая присадка');ok(o.offer>20,tag+': пустой текст');ok(o.scene>0,tag+': пустое 3D');
  const Sx=M.effSettings(p),r=M.calc(p,Sx);ok(r.weight>3&&r.weight<3000,tag+': вес '+r.weight);ok(r.parts.every(x=>x.L>0&&x.Wd>0&&Number.isFinite(x.L)),tag+': размеры деталей');
  const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),Sx,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),Sx,true),k=M.costs(p,Sx,r,cl,ch);
  ok(Number.isFinite(k.price)&&k.price>0&&Math.abs(k.rows.reduce((a,x)=>a+x[1]*x[3],0)-k.mat)<1,tag+': смета '+k.price);ok(k.rows.every(x=>Number.isFinite(x[1])&&Number.isFinite(x[3])),tag+': строки сметы');
 }
 return{checks,fails:fails.slice(0,30),nf:fails.length}},N);
console.log('Случайных заказов:',N,'Проверок:',res.checks,'Ошибок:',res.nf);res.fails.forEach(f=>console.log(' -',f.slice(0,300)));console.log('js errors',errs.slice(0,5));await b.close()})();
