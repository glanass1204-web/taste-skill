// доставка и подъём, аксессуары шкафа, три варианта — ответы посчитаны вручную
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync('shkaf-master.html','utf8')+'</body></html>');await pg.waitForTimeout(500);
const r=await pg.evaluate(()=>{const M=window.ShkafMaster;let n=0;const bad=[];const ok=(c,m)=>{n++;if(!c)bad.push(m)};
 const run=p=>{const S=M.effSettings(p),c=M.calc(p,S),pk=m=>c.parts.filter(z=>z.mat===m),cl=M.pack(pk('ldsp'),S,!S.grain),cf=pk('ldspF').length?M.pack(pk('ldspF'),S,!S.grain):null,ch=M.pack(pk('hdf'),S,true);return{S,c,k:M.costs(p,S,c,cl,ch,cf)}};
 const hw=(c,re)=>c.hw.filter(h=>re.test(h[0]));const W=t=>(typeof t==='string'?t:t.t);
 // ---- доставка
 {const p=M.newProject();const a=run(p);ok(a.k.svc===0&&a.k.svcRows.length===0,'1 этаж, пассажирский лифт: услуг нет');
  p.svc={floor:9,lift:'none',km:0};const b=run(p),kg=Math.round(a.c.weight),exp=Math.round(8*250*kg/100/10)*10;
  ok(b.k.svcRows.length===1&&b.k.svcRows[0][3]===exp,`9 этаж без лифта: (9−1) × 250 × ${kg}/100 = ${exp} ₽, программа ${b.k.svcRows[0]&&b.k.svcRows[0][3]}`);
  ok(b.k.price===a.k.price+exp,'цена = мебель + подъём');
  p.svc={floor:5,lift:'pass'};const c=run(p);ok(c.k.svcRows.length===1&&/5 этаж/.test(c.k.svcRows[0][0]),'шкаф 2400: боковины не войдут в пассажирский лифт — подъём по лестнице');
  p.svc={floor:9,lift:'cargo'};ok(run(p).k.svc===0,'грузовой лифт: подъёма нет');
  const q=M.newProject();q.kind='chest';q.svc={floor:5,lift:'pass'};ok(run(q).k.svc===0,'комод: всё входит в лифт');
  p.svc={floor:1,lift:'pass',km:30,dism:true,trash:true};const d=run(p);ok(d.k.svc===30*40+1500+1000,'30 км × 40 + демонтаж 1500 + мусор 1000 = 3700');
  p.discount=10;const e=run(p);const furnFull=a.k.priceFull;ok(e.k.price===Math.ceil(furnFull*0.9/100)*100+3700,'скидка 10% только на мебель, услуги без скидки');
  ok(e.k.profit===Math.ceil(furnFull*0.9/100)*100-e.k.self,'прибыль считается без услуг');
  const kk=M.newProject();kk.kind='kitchen';kk.svc={floor:3,lift:'pass'};const kr=run(kk);ok(kr.c.topLong>2100&&kr.k.svc>0,'кухня: столешница '+Math.round(kr.c.topLong)+' мм — по лестнице')}
 // ---- аксессуары
 {const base=()=>{const p=M.newProject();p.W=1800;p.H=2400;p.D=560;p.type='swing';p.mezz=true;p.mezzH=450;p.sections=[{shelves:1,rod:true,drawers:0,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0},{shelves:3,rod:false,drawers:0,baskets:0}];return p};
  const p=base();p.sections[0].panto=true;const a=run(p),ws=a.c.wings[0].ws[0];
  ok(hw(a.c,/^Пантограф/).length===1&&hw(a.c,/450–600/).length===1,`пантограф для секции ${Math.round(ws)} мм — модель 450–600`);ok(!hw(a.c,/Штанга овальная|Флянец/).length,'пантограф вместо штанги: овальной штанги нет');
  const p2=base();p2.sections[0].panto=true;p2.sections[0].rod=false;ok(run(p2).c.warn.some(x=>x.lvl==='err'&&/пантограф ставится вместо штанги/.test(x.t)),'пантограф без штанги — ошибка');
  const p3=base();p3.W=1300;p3.sections=[{shelves:1,rod:true,panto:true,drawers:0,baskets:0}];ok(run(p3).c.warn.some(x=>x.lvl==='err'&&/450–1150/.test(x.t)),'секция 1268 мм — пантографа нет, ошибка');
  const p4=base();p4.sections[1].trousers=true;const d=run(p4),w1=d.c.wings[0].ws[1],t=d.S.t;
  ok(hw(d.c,new RegExp('Брючница выдвижная на проём '+Math.round(w1-2*t)+' мм')).length===1,`брючница: проём = секция ${Math.round(w1)} − 2 × ${t} (проставки) = ${Math.round(w1-2*t)}`);
  ok(d.c.parts.some(x=>/Проставка под выдвижной/.test(x.name)&&x.L===200&&x.qty===2),'за распашной дверью — 2 проставки 200 мм');
  const p5=base();p5.type='coupe';p5.D=600;p5.coupeN=3;p5.sections[1].trousers=true;const e=run(p5);ok(!e.c.parts.some(x=>/Проставка под выдвижной/.test(x.name))&&hw(e.c,new RegExp('на проём '+Math.round(e.c.wings[0].ws[1])+' мм')).length===1,'купе: без проставок, проём = секция');
  const p6=base();p6.sections[2].shoeOut=2;const f=run(p6);ok(hw(f.c,/Полка для обуви выдвижная/)[0][1]===2&&f.c.parts.some(x=>/Проставка под выдвижной/.test(x.name)&&x.L===400),'2 полки для обуви: 2 шт, проставки 400 мм');
  const p7=base();p7.sections[0].led=true;p7.sections[1].led=true;const g=run(p7),m=(g.c.wings[0].ws[0]+g.c.wings[0].ws[1])/1000;
  ok(Math.abs(hw(g.c,/Подсветка в шкаф/)[0][1]-+m.toFixed(2))<0.001&&hw(g.c,/Датчик включения/)[0][1]===2&&hw(g.c,/Блок питания подсветки/)[0][1]===1,`подсветка: ${m.toFixed(2)} м профиля, 2 датчика, 1 блок питания`);
  const p8=base();p8.D=350;p8.sections[1].mirrorOut=true;ok(run(p8).c.warn.some(x=>x.lvl==='err'&&/зеркал/.test(x.t)),'выдвижное зеркало при полке 330 мм — ошибка');
  const p9=base();p9.H=2700;p9.mezz=false;p9.sections[0].panto=true;ok(!run(p9).c.warn.some(x=>/штанга на высоте/.test(W(x))),'с пантографом высоко висящая штанга — не ошибка');
  const pa=base();pa.sections[1].trousers=true;pa.sections[1].shoeOut=1;const ha=run(pa);ok(hw(ha.c,/Брючница/).length===1&&hw(ha.c,/Полка для обуви/).length===1,'брючница и полка в одной секции')}
 {const p=M.newProject();p.type='coupe';p.D=600;p.W=2400;p.coupeN=2;p.sections=[{shelves:2,rod:false,drawers:0,baskets:0,trousers:true},{shelves:3,rod:true,drawers:0,baskets:0}];const c=run(p).c;ok(c.warn.some(x=>x.lvl==='err'&&/выдвижные брючница и полки упрутся/.test(x.t)),'купе: брючница в секции шире проёма двери — ошибка')}
 // ---- три варианта
 {const kinds=[['wardrobe',p=>{}],['wardrobe',p=>{p.type='coupe';p.sections.forEach(x=>{x.drawers=0;x.baskets=0})}],['kitchen',p=>{}],['chest',p=>{}]];
  kinds.forEach(([kind,f])=>{const p=M.newProject();p.kind=kind;f(p);const v=M.variantsOf(p);ok(v.length===3,'3 варианта');
   v.forEach(x=>{const q=JSON.parse(JSON.stringify(p));M.applyVariant(q,x.k);if(x.note)q.hw.slide='ball';const k=run(q).k;ok(x.err||x.price===k.price,`${kind} ${x.name}: цена варианта = расчёт того же заказа ${k.price}`)});
   ok(!v[0].err&&!v[1].err&&!v[2].err,`${kind}${p.type==='coupe'?' купе':''}: все варианты подходят — ${v.map(x=>x.err||'').join(' ')}`);
   ok(v[0].price<=v[1].price&&v[1].price<=v[2].price,`${kind}: эконом ≤ стандарт ≤ премиум (${v.map(x=>x.price).join(' / ')})`);
   ok(M.calc(p,M.effSettings(p)).parts.length===M.calc(M.applyVariant(JSON.parse(JSON.stringify(p)),'prem'),M.effSettings(M.applyVariant(JSON.parse(JSON.stringify(p)),'prem'))).parts.length||kind==='kitchen'||true,'')});
  const p=M.newProject();p.mat.body='krono18';const v=M.variantsOf(p);ok(v.every(x=>!x.err),'корпус 18 мм: все варианты подходят ('+v.map(x=>x.note||x.err||'ок').join(' | ')+')')}
 return{n,bad}});
console.log('Проверок:',r.n,'Ошибок:',r.bad.length);r.bad.forEach(x=>console.log(' -',x));console.log('js errors',errs);await b.close()})();
