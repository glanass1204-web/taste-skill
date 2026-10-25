// Проверка «Собрать кухню под размер», скидки, цены за метр, новых фасадов
const {chromium}=require('playwright');const fs=require('fs');
const FILE=process.argv[2]||'shkaf-master.html';
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(FILE,'utf8').replace(/^[\s\S]*<body>/,'').replace(/<\/body>[\s\S]*$/,'')+'</body></html>');
await pg.waitForTimeout(500);
const res=await pg.evaluate(()=>{
 const M=window.ShkafMaster,fails=[];let checks=0,okN=0,errN=0,tooShort=0;const bad=[];
 const ok=(c,msg)=>{checks++;if(!c)fails.push(msg)};
 const run=(corner,o,side)=>{const p=M.newProject();p.kind='kitchen';if(corner){p.k.shape='corner';p.k.cornerSide=side||'L'}M.norm(p);const r=M.kAuto(p,o);return{p,r}};
 for(const corner of [false,true])for(const side of corner?['L','R']:['L'])for(let LA=corner?2000:1500;LA<=5000;LA+=corner?137:61)for(const LB of corner?[1800,2300,2900]:[0])
  for(const opt of [{dw:'600',oven:'under',hob:true,fridge:false},{dw:'450',oven:'tall',hob:true,fridge:true},{dw:'',oven:'',hob:true,fridge:false},{dw:'600',oven:'tall',hob:false,fridge:true}])for(const cls of ['econ','mid','prem']){
   const o={LA,LB,cls,...opt},{p,r}=run(corner,o,side),tag=`${corner?'угол '+side:'прямая'} ${LA}${corner?'×'+LB:''} ${cls} ${JSON.stringify(opt)}`;
   if(r.err){tooShort++;continue}
   const q=r.p,S=M.effSettings(q),c=M.calc(q,S),E=c.warn.filter(w=>w.lvl==='err').map(w=>w.t);
   if(E.length){errN++;const kk=E.map(x=>x.replace(/[НВП]\d+/g,'X').replace(/\d+/g,'#')).join('|');window.__t=window.__t||{};window.__t[kk]=(window.__t[kk]||0)+1;if(bad.length<3)bad.push(tag+' → '+E.join(' | '))}else okN++;
   // размер ровно под заказ
   ok(Math.abs(c.L.sides[0].span-LA)<0.01,`${tag}: сторона А ${c.L.sides[0].span} ≠ ${LA}`);
   if(corner)ok(Math.abs(c.L.sides[1].span-LB)<0.01,`${tag}: сторона Б ${c.L.sides[1].span} ≠ ${LB}`);
   ok(c.lenA<=LA+0.01,`${tag}: верхний ряд длиннее низа ${c.lenA}`);
   [...q.k.base,...(corner?q.k.baseB:[])].forEach(m=>ok(m.w>=150&&(m.type==='sink'?m.w<=750:m.w<=665),`${tag}: модуль ${m.type} ${m.w}`));
   ok(q.hw.hinge===M.K_CLASS[cls].hinge&&q.mat.front===M.K_CLASS[cls].front,`${tag}: класс не применён`);
   if(opt.hob)ok(c.mods.some(m=>m.hob)&&c.mods.some(m=>m.type==='hood'&&m.hasHob),`${tag}: панель и вытяжка над ней`);
   if(opt.fridge)ok(c.mods.some(m=>m.type==='fridge'),`${tag}: холодильник`);if(opt.dw)ok(c.mods.some(m=>m.type==='dw'&&m.w===+opt.dw),`${tag}: посудомойка ${opt.dw}`);
   if(opt.oven==='tall')ok(c.mods.some(m=>m.type==='tallOven'),`${tag}: пенал под духовку`);if(opt.oven==='under')ok(c.mods.some(m=>m.type==='oven'),`${tag}: духовка под панелью`);
   const sk=c.mods.find(m=>m.type==='sink'),dw=c.mods.find(m=>m.type==='dw');if(sk&&dw&&sk.side===dw.side&&c.mods.filter(m=>m.side===sk.side&&m.zone.startsWith('base')&&!['tall','tallOven','fridge'].includes(m.type)).length>3)ok(Math.abs(sk.x+sk.w-dw.x)<1||Math.abs(dw.x+dw.w-sk.x)<1,`${tag}: посудомойка не рядом с мойкой`);
 }
 ok(errN===0,`собрано с ошибками: ${errN} (без ошибок ${okN}, не помещается ${tooShort}). Примеры: `+bad.join(' || '));
 ok(okN>200,'мало вариантов собрано: '+okN);
 // скидка и погонный метр
 {const p=M.newProject();p.kind='kitchen';M.norm(p);const S=M.effSettings(p),r=M.calc(p,S),cl=M.pack(r.parts.filter(x=>x.mat==='ldsp'),S,false),ch=M.pack(r.parts.filter(x=>x.mat==='hdf'),S,true);
  const k0=M.costs(p,S,r,cl,ch);p.discount=10;const k1=M.costs(p,S,r,cl,ch);
  ok(k1.priceFull===k0.price,'цена без скидки = прежняя');ok(k1.price===Math.ceil(k0.price*0.9/100)*100,'скидка 10%: '+k1.price);ok(k1.profit===k1.price-k1.self,'прибыль со скидкой');
  ok(k0.perM===Math.round(k0.price/2.4),'погонный метр: цена / 2,4 м: '+k0.perM);
  p.discount=50;const k2=M.costs(p,S,r,cl,ch);ok(k2.profit<0===(k2.price<k2.self),'скидка больше прибыли — убыток виден');
  const pw=M.newProject();M.norm(pw);const Sw=M.effSettings(pw),rw=M.calc(pw,Sw);ok(M.costs(pw,Sw,rw,M.pack(rw.parts.filter(x=>x.mat==='ldsp'),Sw,false),M.pack(rw.parts.filter(x=>x.mat==='hdf'),Sw,true)).perM===0,'у шкафа нет цены за метр')}
 // фасады
 {const S=M.settings();['agt','fenix','arpa','veneer'].forEach(id=>{const f=S.mat.fronts.find(x=>x.id===id);ok(f&&f.kind==='order'&&f.price>0&&f.t>0&&f.kg>0,'фасад '+id);
   const p=M.newProject();p.mat.front=id;M.norm(p);const r=M.calc(p,M.effSettings(p));ok(r.parts.some(x=>x.mat==='order'),id+': фасады идут в заказ')})}
 return{checks,fails,okN,errN,tooShort,types:window.__t}});
console.log('Проверок:',res.checks,'Ошибок:',res.fails.length,'| собрано без ошибок',res.okN,', с ошибками',res.errN,', не помещается',res.tooShort);res.fails.slice(0,20).forEach(f=>console.log(' -',f.slice(0,600)));console.log(res.types);console.log('js errors',errs);await b.close()})();
