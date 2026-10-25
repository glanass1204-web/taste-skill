// Проверка угловой кухни и встраиваемой техники: геометрия в мировых координатах, столкновения, формулы
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||require('path').join(__dirname,'..','index.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8').replace(/^[\s\S]*<body>/,'').replace(/<\/body>[\s\S]*$/,'')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(()=>{
 const M=window.ShkafMaster,fails=[];let checks=0;
 const ok=(c,msg)=>{checks++;if(!c)fails.push(msg)};
 const eq=(a,b,msg,tol=0.6)=>{checks++;if(!(Math.abs(a-b)<=tol))fails.push(`${msg}: ${a} ≠ ${b}`)};
 const errsOf=r=>r.warn.filter(w=>w.lvl==='err').map(w=>w.t);
 const has=(r,re)=>r.warn.some(w=>re.test(w.t||w));
 const km=(type,w,shelves,drawers,extra)=>Object.assign({type,w,shelves:shelves||0,drawers:drawers||3},extra||{});
 const mk=f=>{const p=M.newProject();p.kind='kitchen';f(p);M.norm(p);const S=M.effSettings(p);return{p,S,r:M.calc(p,S)}};
 // ---------- мировые координаты
 const world=(it,g)=>{const c=Math.cos(g.rot),s=Math.sin(g.rot),pts=[];
   for(const x of [it.x,it.x+it.w])for(const z of [it.z,it.z+it.d]){pts.push([x*c+z*s+g.pos[0],-x*s+z*c+g.pos[2]])}
   const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]);return{x0:Math.min(...xs),x1:Math.max(...xs),y0:it.y,y1:it.y+it.h,z0:Math.min(...zs),z1:Math.max(...zs),m:it.m,door:it.door,drawer:it.drawer}};
 const hit=(a,b,tol=0.5)=>a.x0<b.x1-tol&&b.x0<a.x1-tol&&a.y0<b.y1-tol&&b.y0<a.y1-tol&&a.z0<b.z1-tol&&b.z0<a.z1-tol;
 // ручки и ход дверей/ящиков — в координатах стороны, потом в мир
 const extras=(p,S,r,sdKey,g)=>{const H=S.cat.handles.find(h=>h.id===p.hw.handle)||S.cat.handles[0],fT=r.L.fT,proj=H.proj,len=H.len,hs=[],sw=[];
   r.mods.filter(m=>m.side===sdKey).forEach(mod=>{const d=mod.d,y0=mod.y0;
     mod.fronts.forEach(f=>{const fx=mod.x+f.x,z=d+1+fT;
       if(f.kind==='door'){const cx=f.hinge==='L'?fx+f.w-40:fx+40;if(proj)hs.push({x:cx-6,y:y0+f.y+f.h*.3,z,w:12,h:Math.min(len,f.h*.4),d:proj,m:'handle'});
         sw.push({x:fx,y:y0+f.y,z:d+1,w:f.w,h:f.h,d:f.w,m:'sweep',of:mod.lab})}
       if(f.kind==='drawer'||f.kind==='dw'||f.kind==='fridge'){if(proj)hs.push({x:fx+f.w/2-len/2,y:y0+f.y+f.h*.6,z,w:len,h:12,d:proj,m:'handle'});
         if(f.kind==='drawer')sw.push({x:fx,y:y0+f.y,z:d+1,w:f.w,h:f.h,d:fT+560+proj,m:'sweep',of:mod.lab});
         if(f.kind==='dw')sw.push({x:fx,y:y0+f.y,z:d+1,w:f.w,h:f.h,d:f.h,m:'sweep',of:mod.lab})}})});
   return{hs:hs.map(it=>world(it,g)),sw:sw.map(it=>Object.assign(world(it,g),{of:it.of}))}};
 const collide=(p,S,r,tag,shift)=>{const sc=M.scene3dKitchen(p,S,r);if(sc.groups.length<2)return;if(shift){const g=sc.groups[1];if(r.L.AL)g.pos[2]-=shift;else g.pos[2]-=shift}
   const W=sc.groups.map((g,gi)=>({g,items:g.items.filter(it=>!['top','plinth','back'].includes(it.m)).map(it=>world(it,g)),ex:extras(p,S,r,gi?'B':'A',g)}));
   const A=W[0],B=W[1],sA=[...A.items,...A.ex.hs],sB=[...B.items,...B.ex.hs];
   let n=0;for(const a of sA)for(const q of sB)if(hit(a,q)){n++;if(n<3)fails.push(`${tag}: стороны А и Б пересекаются: ${a.m} [${a.x0|0}..${a.x1|0}]×[${a.z0|0}..${a.z1|0}] и ${q.m} [${q.x0|0}..${q.x1|0}]×[${q.z0|0}..${q.z1|0}] y ${q.y0|0}..${q.y1|0}`)}
   checks++;if(shift)return n;
   let ns=0;[[A.ex.sw,sB],[B.ex.sw,sA]].forEach(([sw,st])=>sw.forEach(s=>st.forEach(q=>{if(q.door||q.drawer)return;if(hit(s,q)){ns++;if(ns<3)fails.push(`${tag}: открывание ${s.of} задевает ${q.m} стороны напротив`)}})));
   checks++};
 const inModule=(r,tag,gw=0)=>r.mods.forEach(mod=>{if(!mod.carcass&&mod.type!=='dw')return;const lo=mod.zone.startsWith('wall')||mod.zone==='cWall'?-gw:0;
   mod.fronts.forEach(f=>ok(f.x>=-0.01&&f.x+f.w<=mod.w+0.01&&f.y>=lo-0.01&&f.y+f.h<=mod.h+0.01&&f.w>0&&f.h>0,`${tag} ${mod.lab}: фасад ${f.kind} вне модуля ${f.x}..${f.x+f.w} / ${mod.w}`));
   const fr=mod.fronts;for(let i=0;i<fr.length;i++)for(let j=i+1;j<fr.length;j++){const a=fr[i],c=fr[j];ok(!(a.x<c.x+c.w-0.01&&c.x<a.x+a.w-0.01&&a.y<c.y+c.h-0.01&&c.y<a.y+a.h-0.01),`${tag} ${mod.lab}: фасады перекрываются`)}
   // петли — только на краю модуля, где есть боковина
   fr.filter(f=>f.kind==='door').forEach(f=>ok(f.hinge==='L'?Math.abs(f.x-2)<1:Math.abs(f.x+f.w-(mod.w-2))<1,`${tag} ${mod.lab}: петли не у боковины (x ${f.x}, ${f.hinge})`))});
 const sideFronts=(r,tag)=>{['A','B'].forEach(sd=>{const fr=r.mods.filter(m=>m.side===sd&&!m.corner).flatMap(m=>m.fronts.map(f=>({x0:m.x+f.x,x1:m.x+f.x+f.w,y0:m.y0+f.y,y1:m.y0+f.y+f.h,lab:m.lab})));
   for(let i=0;i<fr.length;i++)for(let j=i+1;j<fr.length;j++){const a=fr[i],c=fr[j];if(a.x0<c.x1-0.01&&c.x0<a.x1-0.01&&a.y0<c.y1-0.01&&c.y0<a.y1-0.01)fails.push(`${tag}: фасады ${a.lab} и ${c.lab} перекрываются`)}checks++})};
 const sanity=(p,S,r,tag)=>{r.parts.forEach(x=>ok(x.L>0&&x.Wd>0&&Number.isFinite(x.L)&&x.qty>0,`${tag}: плохая деталь ${x.name} ${x.L}×${x.Wd}`));
   r.hw.forEach(h=>ok(Number.isFinite(h[1])&&h[1]>=0,`${tag}: фурнитура ${h[0]}=${h[1]}`));
   const cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true);
   const placed=[cl,ch].reduce((a,res)=>a+res.sheets.reduce((q,sh)=>q+sh.parts.length,0)+res.over.length,0),need=r.parts.filter(x=>x.mat==='ldsp'||x.mat==='hdf').reduce((a,x)=>a+x.qty,0);
   eq(placed,need,`${tag}: все детали в раскрое`,0);
   const k=M.costs(p,S,r,cl,ch);eq(k.rows.reduce((a,x)=>a+x[1]*x[3],0),k.mat,`${tag}: сумма строк сметы`,0.5);
   const em=r.parts.reduce((a,x)=>a+x.qty*(x.eL*x.L+x.eW*x.Wd+(x.eX||0))/1000*(1+S.edgeReserve/100),0);eq(r.edgeM,em,`${tag}: кромка`,0.01);
   ok(M.drillMap(p,S,r).length>0,`${tag}: присадка`)};

 // ---------- 1. шаблон угловой кухни с техникой — без ошибок
 const tpl=M.builtinTemplates().find(t=>/угловая/.test(t.name));ok(!!tpl,'шаблон угловой кухни есть');
 if(tpl){const p=M.fromTemplate(tpl),S=M.effSettings(p),r=M.calc(p,S);ok(!errsOf(r).length,'шаблон угловой кухни без ошибок: '+errsOf(r).join(' | '));sanity(p,S,r,'шаблон');inModule(r,'шаблон');sideFronts(r,'шаблон');collide(p,S,r,'шаблон');
   ok(r.mods.some(m=>m.type==='dw')&&r.mods.some(m=>m.type==='fridge')&&r.mods.some(m=>m.type==='tallOven')&&r.mods.some(m=>m.type==='hood')&&r.mods.some(m=>m.hob),'шаблон: вся техника')}

 // ---------- 2. случайные угловые кухни
 let seed=11;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648},pick=a=>a[Math.floor(rnd()*a.length)];
 let valid=0,total=0;
 for(let n=0;n<900;n++){total++;
   const AL=rnd()>.5,cb=pick(['blind','L']),cw=pick(['blind','L','none']),front=pick(['body','mdfpvc','mdf22','ldsp']),handle=pick(['r128','r96','knob','flush','r160']),body=pick(['krono16','egger18']);
   const bTypes=['doors','drawers','sink','doors','dw','oven'],wTypes=['doors','open','drying','doors'];
   const mkRow=(n,types,wall)=>Array.from({length:n},()=>{const type=pick(types);return km(type,type==='dw'?pick([450,600]):type==='oven'?600:pick([300,400,450,500,600,800]),wall?2:1,3)});
   const gola=rnd()>.6,w2=pick([0,0,360]),base=mkRow(1+Math.floor(rnd()*4),bTypes),wall=mkRow(Math.floor(rnd()*4),wTypes,true),baseB=mkRow(1+Math.floor(rnd()*3),bTypes),wallB=cw==='none'?[]:mkRow(Math.floor(rnd()*3),wTypes,true);
   // у глухого угла модуль стороны Б — с дверцами (в половине случаев проверяем и неправильный)
   const adjB=AL?baseB.length-1:0,good=rnd()>.25;if(cb==='blind'&&good)baseB[adjB]=km(pick(['doors','sink']),pick([450,600,800]),1);
   const adjW=AL?wallB.length-1:0;if(wallB.length&&cw!=='L'&&good)wallB[adjW]=km('doors',pick([400,600,800]),2);
   const {p,S,r}=mk(p=>{const k=p.k;Object.assign(k,{shape:'corner',cornerSide:AL?'L':'R',cBase:cb,cWall:cw,cBaseW:cb==='L'?pick([850,900,1000]):pick([1000,1050,1100,1200]),cBaseW2:pick([850,900,1000]),cWallW:cw==='L'?pick([550,600,700]):pick([700,800,900]),cWallW2:pick([550,600,700]),base,wall,baseB,wallB});
     k.gola=gola;k.wall2H=w2;[...k.wall,...k.wallB].forEach(m=>{if(m.type==='doors'&&rnd()>.6)m.open='lift'});k.wallH=pick([720,720,360,600]);
     p.mat.front=front;p.mat.body=body;p.hw.handle=handle;p.walls.A=rnd()>.5;p.walls.B=rnd()>.5});
   const tag=`угол ${AL?'L':'R'} ${cb}/${cw} ${front} ${handle}`,E=errsOf(r),fT=r.L.fT,F=M.FILLER,D=p.k.baseD;
   sanity(p,S,r,tag);inModule(r,tag,gola?p.k.golaW:0);sideFronts(r,tag);
   const H=S.cat.handles.find(h=>h.id===handle);
   // ошибки там, где должны быть
   if(cb==='blind'&&!['doors','sink'].includes(baseB[adjB].type))ok(E.some(t=>/глухого угла/.test(t)),`${tag}: нет ошибки про модуль у глухого угла`);
   if(!gola&&(cb==='blind'||cw==='blind')&&H.proj>F-15)ok(E.some(t=>/Ручки выступают/.test(t)),`${tag}: нет ошибки про ручки в углу`);
   if(!E.length){valid++;collide(p,S,r,tag)}
   // формулы угла
   const cB=r.mods.find(m=>m.zone==='cBase');ok(!!cB,tag+': угловой нижний есть');
   if(cB&&cb==='blind'){const door=cB.fronts.find(f=>f.kind==='door'),fl=cB.fronts.find(f=>f.kind==='filler');eq(door.w,p.k.cBaseW-D-fT-F-6,tag+': дверь глухого угла');eq(door.h,p.k.baseH-4-(gola?p.k.golaL:0),tag+': высота двери угла');eq(fl.w,fT+F,tag+': планка угла А');ok(door.hinge===(AL?'R':'L'),tag+': петли углового модуля на дальней стороне')}
   if(cB&&cb==='L'){eq(cB.fronts[0].w,p.k.cBaseW-D-3,tag+': створка А');eq(cB.leafB.w,p.k.cBaseW2-D-fT-4,tag+': створка Б')}
   if(cb==='blind'){const b1=r.mods.find(m=>m.zone==='baseB'&&m.i===adjB);if(b1&&['doors','sink'].includes(b1.type)){const fl=b1.fronts.find(f=>f.kind==='filler'),dr=b1.fronts.filter(f=>f.kind==='door');eq(fl.w,F,tag+': планка Б');
     ok(Math.abs(AL?fl.x+fl.w-b1.w:fl.x)<0.01,tag+': планка Б со стороны угла');if(dr.length===1){eq(dr[0].w,b1.w-F-5,tag+': дверь у планки Б');ok(dr[0].hinge===(AL?'L':'R'),tag+': дверь у угла на дальних петлях')}}}
   // столешница и цоколь
   const non=a=>a.filter(m=>!['tall','tallOven','fridge'].includes(m.type)).reduce((s,m)=>s+m.w,0),blkB=cb==='L'?p.k.cBaseW2:D+2+fT;
   eq(r.topA,non(base)+p.k.cBaseW,tag+': столешница А');eq(r.topB,non(baseB)+blkB-r.top.D,tag+': столешница Б');
   const tp=r.hw.find(h=>/^Столешница/.test(h[0]));ok(tp&&Math.abs(tp[1]-(r.topA+Math.max(0,r.topB))/1000)<0.006,tag+': метры столешницы');
   const pl=r.hw.find(h=>/^Цоколь/.test(h[0]));eq(pl[1],+(((p.k.cBaseW+base.reduce((s,m)=>s+m.w,0))-(D-60)+(blkB+baseB.reduce((s,m)=>s+m.w,0))-(D-60))/1000).toFixed(2),tag+': цоколь',0.006);
   if(cw==='none'&&wallB.length)ok(E.some(t=>/нет углового модуля/.test(t)),tag+': нет ошибки про пустой угол вверху');
 }
 ok(valid>150,`мало правильных угловых кухонь для проверки столкновений: ${valid} из ${total}`);

 // проверка самой проверки: сдвинем сторону Б к стороне А — столкновения должны найтись
 {const t=tpl&&M.fromTemplate(tpl);if(t){const S=M.effSettings(t),r=M.calc(t,S),before=fails.length;const n1=collide(t,S,r,'сдвиг',30);fails.length=before;ok(n1>0,'проверка столкновений ловит сдвиг стороны Б на 30 мм: '+n1);t.k.cornerSide='R';const r2=M.calc(t,S);const n2=collide(t,S,r2,'сдвиг R',30);fails.length=before;ok(n2>0,'и для угла справа: '+n2)}}
 // ---------- 3. посудомойка
 {const t1=mk(p=>{p.k.base=[km('doors',600,1),km('dw',450),km('doors',600,1)]});ok(!errsOf(t1.r).length,'ПММ 450 между модулями: без ошибок '+errsOf(t1.r).join('|'));
  ok(t1.r.parts.some(x=>x.name==='Фасад посудомойки'&&x.L===716&&x.Wd===446),'ПММ: фасад 716×446');ok(!t1.r.parts.some(x=>/Боковая панель/.test(x.name)),'ПММ между модулями: без панели');
  const legs=v=>mk(p=>{p.k.legs=v;p.k.base=[km('doors',600,1),km('dw',600),km('doors',600,1)]}).r;
  ok(!has(legs(150),/ниша под посудомойку/),'ПММ: ниша 870 — можно');ok(has(legs(160),/ниша под посудомойку по высоте 880/),'ПММ: ниша 880 — ошибка');ok(has(legs(90),/815–875/),'ПММ: ниша 810 — ошибка');
  ok(has(mk(p=>{p.k.base=[km('doors',600,1),km('dw',500)]}).r,/450 и 600/),'ПММ 500 — ошибка');
  const t2=mk(p=>{p.walls.L=false;p.walls.R=false;p.k.base=[km('doors',600,1),km('dw',600)]});ok(t2.r.parts.some(x=>/Боковая панель у посудомойки/.test(x.name)&&x.L===820),'ПММ с краю: добавлена панель 820');
  const t3=mk(p=>{p.walls.R=true;p.k.wall=[];p.k.base=[km('doors',600,1),km('dw',600)]});ok(!t3.r.parts.some(x=>/Боковая панель/.test(x.name)),'ПММ у стены: без панели');
  ok(has(mk(p=>{p.k.baseD=520;p.k.base=[km('doors',600,1),km('dw',600),km('doors',600,1)]}).r,/от 550 мм/),'ПММ: мелкая ниша — ошибка')}
 // ---------- 4. пенал под духовку
 {const T=(f,extra)=>mk(p=>{p.k.base=[km('doors',600,1),km('tallOven',600,1,3,extra)];if(f)f(p)});
  const a=T(),m=a.r.mods.find(x=>x.type==='tallOven'),t=16;ok(!errsOf(a.r).length,'пенал под духовку: без ошибок '+errsOf(a.r).join('|'));
  eq(m.fixed[1]-(m.fixed[0]+t),590,'духовка: ниша 590');const low=m.fronts.find(f=>f.label===' нижний'),up=m.fronts.find(f=>f.label===' верхний');
  eq(low.h,716,'духовка: нижняя дверь в линию с нижними (716)');ok(low.y+low.h<m.fixed[0],'нижняя дверь ниже полки под духовкой');ok(up.y>m.fixed[1]+t,'верхняя дверь выше полки над духовкой');eq(up.h,2000-4-(m.fixed[1]+t),'духовка: верхняя дверь');
  const bk=m.backs;ok(bk.every(b=>b.y+b.h<=m.fixed[0]+t+0.01||b.y>=m.fixed[1]-0.01),'духовка: задней стенки нет в нише');
  const b=T(null,{top2:'mw'}),m2=b.r.mods.find(x=>x.type==='tallOven');eq(m2.fixed[2]-(m2.fixed[1]+t),380,'СВЧ: ниша 380');ok(!errsOf(b.r).length,'духовка+СВЧ в 2100: без ошибок');
  const c=T(null,{top2:'c45'}),m3=c.r.mods.find(x=>x.type==='tallOven');eq(m3.fixed[2]-(m3.fixed[1]+t),452,'компакт 45: ниша 452');
  const d=T(p=>p.k.tallH=1900,{top2:'mw'});ok(has(d.r,/Нужна высота пенала от 1992 мм/),'духовка+СВЧ в 1900: ошибка с нужной высотой');
  ok(has(mk(p=>{p.k.base=[km('tallOven',450,1)]}).r,/560–568/),'пенал под духовку 450 — ошибка');
  const e=T(null,{low:'drawers',drawers:2});ok(e.r.mods.find(x=>x.type==='tallOven').fronts.filter(f=>f.kind==='drawer').length===2,'под духовкой 2 ящика');ok(!errsOf(e.r).length,'ящики под духовкой: без ошибок')}
 // ---------- 5. холодильник
 {const T=(f,extra)=>mk(p=>{p.k.base=[km('doors',600,1),km('fridge',600,1,3,extra)];if(f)f(p)});
  const a=T(),m=a.r.mods.find(x=>x.type==='fridge'),t=16;ok(!errsOf(a.r).length,'холодильник: без ошибок '+errsOf(a.r).join('|'));
  eq(m.fixed[0]-t,1775,'холодильник: ниша 1775');const fr=m.fronts.filter(f=>f.kind==='fridge');eq(fr[0].h,2*t+1775-4,'холодильник: один фасад 1803');
  const up=m.fronts.find(f=>f.kind==='door');eq(up.h,2000-3-(2*t+1775),'холодильник: антресоль 190');ok(up.y>=fr[0].y+fr[0].h+2.9,'зазор над фасадом холодильника');
  ok(!m.backs.some(b=>b.y<m.fixed[0]),'холодильник: без задней стенки в нише');
  const b=T(null,{split:700}),fb=b.r.mods.find(x=>x.type==='fridge').fronts.filter(f=>f.kind==='fridge');eq(fb[0].h,700,'нижний фасад 700');eq(fb[1].h,1803-703,'верхний фасад 1100');
  ok(has(T(p=>p.k.tallH=2000).r,/от 2060 мм/),'холодильник в 2000: ошибка с нужной высотой');
  ok(a.r.hw.some(h=>/Решётка/.test(h[0])),'холодильник: решётки в смете')}
 // ---------- 6. варочная панель и вытяжка
 {const T=f=>mk(p=>{f(p)});
  ok(has(T(p=>{p.k.base=[km('drawers',450,0,3,{hob:'i60'}),km('doors',600,1)]}).r,/шире модуля внутри/),'панель 60 на модуль 450 — ошибка');
  ok(!errsOf(T(p=>{p.k.base=[km('doors',600,1),km('drawers',600,0,3,{hob:'i60'}),km('doors',600,1)]}).r).length,'панель 60 на модуль 600 — можно');ok(!errsOf(T(p=>{p.mat.body='egger18';p.k.base=[km('doors',600,1),km('drawers',600,0,3,{hob:'i60'}),km('doors',600,1)]}).r).length,'панель 60 на модуль 600 из ЛДСП 18 — можно');
  ok(has(T(p=>{p.k.base=[km('drawers',600,0,3,{hob:'i80'})]}).r,/шире модуля/),'панель 80 на 600 — ошибка');
  ok(has(T(p=>{p.k.base=[km('doors',600,1),km('drawers',600,0,3,{hob:'i60'}),km('tall',600,4)]}).r,/до пенала 20 мм/),'панель вплотную к пеналу — ошибка');
  ok(!has(T(p=>{p.k.base=[km('doors',600,1),km('drawers',800,0,3,{hob:'i60'}),km('tall',600,4)]}).r,/до пенала/),'панель в модуле 800 у пенала — можно');
  ok(has(T(p=>{p.walls.L=true;p.k.base=[km('drawers',600,0,3,{hob:'i60'}),km('doors',600,1)]}).r,/до стены 20 мм/),'панель у стены — ошибка');
  const H=(hob,wallY)=>T(p=>{p.k.wallY=wallY;p.k.base=[km('doors',600,1),km('drawers',600,0,3,{hob}),km('doors',600,1)];p.k.wall=[km('doors',600,2),km('hood',600),km('doors',600,2)]}).r;
  ok(!has(H('i60',1450),/вытяжка над/),'электрическая, вытяжка 592 мм — можно');ok(has(H('g60',1450),/не меньше 650/),'газовая, вытяжка 592 мм — ошибка');ok(!has(H('g60',1550),/вытяжка над/),'газовая, вытяжка 692 — можно');
  ok(has(T(p=>{p.k.base=[km('doors',600,1),km('drawers',600,0,3,{hob:'i60'}),km('doors',600,1)];p.k.wall=[km('doors',600,2),km('doors',600,2),km('doors',600,2)]}).r,/висит обычный шкаф/),'шкаф над панелью — предупреждение');
  ok(has(T(p=>{p.k.wall=[km('hood',600)]}).r,/нет варочной панели/),'вытяжка без панели — предупреждение');
  ok(T(p=>{p.k.base=[km('drawers',600,0,3,{hob:'i60'}),km('doors',600,1)]}).r.hw.some(h=>/Вырез под варочную/.test(h[0])),'вырез под панель в смете')}
 // ---------- 7. Г-образный угол: кромка по вырезу
 {const a=mk(p=>{p.k.shape='corner';p.k.cBase='L';p.k.cBaseW=900;p.k.cBaseW2=900;p.k.cWall='L'});const g=a.r.parts.find(x=>/Дно Г-образное/.test(x.name));
  ok(g&&g.eX===2*(900-16-560),'Г-образное дно: кромка по вырезу '+(g&&g.eX));ok(a.r.hw.some(h=>/165–170/.test(h[0]))&&a.r.hw.some(h=>/складного/.test(h[0])),'Г-образный: петли в смете')}
 return{checks,all:fails,fails:fails.slice(0,25),nf:fails.length,valid,total}});
const ty=new Map();res.all.forEach(f=>{const k=f.replace(/^[^:]*?(Б-|УН|УВ|[НВП])\d*[^:]*?: /,'').replace(/\d+/g,'#').slice(0,90);ty.set(k,(ty.get(k)||0)+1)});console.log([...ty].slice(0,25));console.log('Проверок:',res.checks,'Ошибок:',res.nf,'| правильных угловых для столкновений:',res.valid,'из',res.total);res.fails.forEach(f=>console.log(' -',f));console.log('js errors',errs);await b.close()})();
