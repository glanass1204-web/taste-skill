const {chromium}=require('playwright');const fs=require('fs');
const load=async(b,file)=>{const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(file,'utf8')+'</body></html>');await pg.waitForTimeout(400);return {pg,errs}};
(async()=>{const b=await chromium.launch();const O=await load(b,'v39-backup.html'),N=await load(b,'shkaf-master.html');
 // одинаковые случайные кухни
 const cases=[];let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648};
 const pickA=a=>a[Math.floor(rnd()*a.length)];
 for(let n=0;n<600;n++){const base=[],wall=[];const nb=1+Math.floor(rnd()*6),nw=Math.floor(rnd()*6);
  for(let i=0;i<nb;i++){const type=pickA(['doors','drawers','sink','oven','tall','doors']);base.push({type,w:type==='oven'?600:pickA([300,400,450,500,600,700,800,900,1000]),shelves:Math.floor(rnd()*4),drawers:1+Math.floor(rnd()*5)})}
  for(let i=0;i<nw;i++)wall.push({type:pickA(['doors','open','drying']),w:pickA([300,400,450,500,600,800,900]),shelves:Math.floor(rnd()*4),drawers:3});
  cases.push({base,wall,baseH:pickA([720,720,600,800,500]),baseD:pickA([560,560,500,450,600]),legs:pickA([100,150,0]),wallH:pickA([720,900,600]),wallD:pickA([300,350]),wallY:pickA([1450,1300,1600]),tallH:pickA([2100,2300,2000]),worktop:rnd()>.2,
    walls:{L:rnd()>.5,R:rnd()>.5},body:pickA(['krono16','egger18','lamarty16']),front:pickA(['body','ldsp','mdfpvc']),hinge:pickA(['boyard','kdm','blum']),slide:pickA(['ball','roller','db8881'])})}
 const run=async(pg)=>pg.evaluate(cases=>{const M=window.ShkafMaster;return cases.map(cs=>{const p=M.newProject();p.kind='kitchen';Object.assign(p.k,{base:cs.base,wall:cs.wall,baseH:cs.baseH,baseD:cs.baseD,legs:cs.legs,wallH:cs.wallH,wallD:cs.wallD,wallY:cs.wallY,tallH:cs.tallH,worktop:cs.worktop});
   p.walls.L=cs.walls.L;p.walls.R=cs.walls.R;p.mat.body=cs.body;p.mat.front=cs.front;p.hw.hinge=cs.hinge;p.hw.slide=cs.slide;M.norm(p);
   const S=M.effSettings(p),r=M.calc(p,S);
   const parts=r.parts.map(x=>[x.name,x.L,x.Wd,x.qty,x.mat,x.eL,x.eW].join('|')).sort();
   const hw=r.hw.filter(h=>!/^Крепление пенала/.test(h[0])).map(h=>[h[0],h[1],h[3]].join('|')).sort();
   const warn=r.warn.map(w=>(w.lvl||'warn')+':'+(w.t||w)).sort();
   const dm=M.drillMap(p,S,r).map(g=>g.name+'|'+g.size+'|'+g.qty+'|'+g.lines.filter(l=>!/^Неподвижные полки/.test(l)).join(' / '));
   return {parts,hw,warn,dm,kh:JSON.stringify({base:r.kh.base,wall:r.kh.wall}),notes:r.notes,baseLen:r.baseLen,allBase:r.allBase,edge:+r.edgeM.toFixed(3)}})},cases);
 const a=await run(O.pg),z=await run(N.pg);let diff={parts:0,hw:0,warn:0,dm:0,kh:0,other:0},ex={};
 a.forEach((x,i)=>{const y=z[i];for(const k of ['parts','hw','warn','dm']){if(JSON.stringify(x[k])!==JSON.stringify(y[k])){diff[k]++;if(!ex[k])ex[k]={i,old:x[k].filter(v=>!y[k].includes(v)),neu:y[k].filter(v=>!x[k].includes(v)),c:cases[i]}}}
   if(x.kh!==y.kh){diff.kh++;if(!ex.kh)ex.kh={i,old:x.kh,neu:y.kh,c:cases[i]}}
   if(x.baseLen!==y.baseLen||x.allBase!==y.allBase||x.edge!==y.edge||JSON.stringify(x.notes)!==JSON.stringify(y.notes)){diff.other++;if(!ex.other)ex.other={i,x:[x.baseLen,x.allBase,x.edge,x.notes],y:[y.baseLen,y.allBase,y.edge,y.notes]}}});
 console.log('cases',cases.length,'diff',diff);const wt=new Map();a.forEach((x,i)=>{const y=z[i];y.warn.filter(v=>!x.warn.includes(v)).forEach(v=>{const k='+'+v.replace(/[ВНП]\d+/g,'X').replace(/\d+/g,'#');wt.set(k,(wt.get(k)||0)+1)});x.warn.filter(v=>!y.warn.includes(v)).forEach(v=>{const k='-'+v.replace(/[ВНП]\d+/g,'X').replace(/\d+/g,'#');wt.set(k,(wt.get(k)||0)+1)})});console.log([...wt]);for(const k in ex)console.log(k,JSON.stringify(ex[k]).slice(0,1500));
 console.log('errs',O.errs,N.errs);await b.close()})();
