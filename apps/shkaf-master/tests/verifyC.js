// Двери купе: комбинированные вставки по инструкции ABSOLUT
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8').replace(/^[\s\S]*<body>/,'').replace(/<\/body>[\s\S]*$/,'')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(()=>{const M=window.ShkafMaster,fails=[];let checks=0;const ok=(c,m)=>{checks++;if(!c)fails.push(m)};const eq=(a,b,m,t=0.01)=>ok(Math.abs(a-b)<=t,`${m}: ${a} ≠ ${b}`);
 const mk=f=>{const p=M.newProject();p.type='coupe';f(p);M.norm(p);const S=M.effSettings(p),r=M.calc(p,S),cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true);return{p,S,r,k:M.costs(p,S,r,cl,ch)}};
 const hw=(r,re)=>r.hw.find(h=>re.test(h[0]));
 for(const W of [1600,2000,2400,3000])for(const split of [1,2,3])for(const mirrors of [0,1,2])for(const mat of ['mirror','tint','sand','photo']){
  const {p,r,k}=mk(p=>{p.W=W;p.hw.coupe='absolut';p.coupeSplit=split;p.coupeMat=mat;p.mirrors=mirrors});const tag=`ABSOLUT ${W} ${split}ч з${mirrors} ${mat}`,cd=r.wings[0].coupeD;
  eq(cd.h,Math.floor(r.wings[0].innerH-40),tag+': высота двери');
  let areaL=0,areaG=0,div=0;
  cd.items.forEach(d=>{ok(d.secs&&d.secs.length===split,tag+': частей');const hs=d.h/split;
   d.secs.forEach((sc,j)=>{const g=sc.mat!=='ldsp';eq(sc.iw,Math.floor(d.w-(g?41:39)),tag+': ширина вставки');
     const exp=split===1?d.h-(g?61:59):j===0?hs-(g?18:16):j===split-1?hs-(g?53:51):hs-(g?11:9);eq(sc.ih,Math.floor(exp),tag+`: высота вставки ${j}`);
     ok(g===(d.mirror&&(split===1||(split===2&&j===0)||(split===3&&j===1))),tag+': где зеркало');if(g){areaG+=sc.ih*sc.iw;ok(sc.mat===mat,tag+': материал')}else areaL+=sc.ih*sc.iw});
   div+=(split-1)*(d.w-54)});
  ok(cd.items.filter(d=>d.mirror).length===Math.min(mirrors,cd.items.length),tag+': зеркальных дверей');
  const rl=hw(r,/Вставка ЛДСП/);if(areaL)eq(rl[1],+(areaL/1e6).toFixed(2),tag+': площадь ЛДСП');
  const rg=hw(r,mat==='mirror'?/Вставка зеркало/:/Вставка: /);if(areaG)eq(rg[1],+(areaG/1e6).toFixed(2),tag+': площадь зеркала');else ok(!rg,tag+': лишняя строка зеркала');
  const rd=hw(r,/разделительный/);if(div)eq(rd[1],+(div/1000).toFixed(2),tag+': разделители');else ok(!rd,tag+': лишний разделитель');
  eq(k.rows.reduce((a,x)=>a+x[1]*x[3],0),k.mat,tag+': смета',0.5);
  ok(M.drillMap(p,M.effSettings(p),r)!==null,tag)}
 // ширина дверей — числа из инструкций, вручную (ЛДСП 16: проём = ширина − 32)
 {const W=(id,Wd,n)=>mk(p=>{p.W=Wd;p.hw.coupe=id;p.coupeN=n}).r.wings[0].coupeD;
  ok(W('absolut',2400,2).w===Math.floor((2368+21)/2),'ABSOLUT 2 двери: (проём + 21)/2');ok(W('absolut',2400,3).w===805,'ABSOLUT 3 двери: (2368 + 49)/3 = 805');
  ok(W('absolut',3000,4).w===752,'ABSOLUT 4 двери: (2968 + 42)/4 = 752');ok(W('absolut',3500,5).w===Math.floor((3468+105)/5),'ABSOLUT 5 дверей: (проём + 105)/5');
  const s4=W('std',3000,4);ok(s4.w===755,'типовой 4 двери: (2968 + 2×26)/4 = 755');ok(Math.abs(s4.items[2].x-(s4.items[1].x+s4.w))<0.01,'4 двери: средние двери встык (передняя — задняя — задняя — передняя)');
  ok(Math.abs(s4.items[1].x-(s4.items[0].x+s4.w-26))<0.01,'4 двери: крайние перехлёстывают на 26')}
 // типовой профиль: вставки не считаются, площадь — по двери (как раньше)
 {const {r}=mk(p=>{p.W=2400;p.hw.coupe='std';p.coupeSplit=1;p.mirrors=1});const cd=r.wings[0].coupeD,a=cd.items.filter(d=>!d.mirror).reduce((s,d)=>s+d.w*d.h,0)/1e6;
  eq(hw(r,/Вставка ЛДСП/)[1],+a.toFixed(2),'типовой профиль: площадь ЛДСП по двери');ok(cd.items.every(d=>d.secs.every(sc=>sc.ih===null)),'типовой профиль: размеров вставок нет')}
 // свой профиль: вычеты из настроек
 {const S=M.settings(),c=S.cat.coupe.find(x=>x.id==='custom');const keep=c.iwL;c.iwL=30;const {r}=mk(p=>{p.W=2000;p.hw.coupe='custom';p.coupeSplit=1;p.mirrors=0});eq(r.wings[0].coupeD.items[0].secs[0].iw,Math.floor(r.wings[0].coupeD.items[0].w-30),'свой профиль: вычет из настроек');c.iwL=keep}
 return{checks,fails}});
console.log('Проверок:',res.checks,'Ошибок:',res.fails.length);res.fails.slice(0,15).forEach(f=>console.log(' -',f));console.log('js errors',errs);await b.close()})();
