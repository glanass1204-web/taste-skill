// 3D: текстура дерева только у древесных декоров, волокна вдоль длинной стороны детали, мягкая тень
const {chromium}=require('playwright');const PORT=process.argv[2]||'8765';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://localhost:'+PORT+'/');await pg.evaluate(()=>localStorage.clear());await pg.reload();await pg.waitForTimeout(800);
const bad=[];let n=0;const ok=(c,m)=>{n++;if(!c)bad.push(m)};
const look=async dec=>{await pg.click(`[data-decor="${dec}"]`);await pg.waitForTimeout(300);await pg.evaluate(()=>document.querySelector('[data-view="3d"]').scrollIntoView());await pg.click('[data-view="3d"]');await pg.waitForTimeout(2500);
 const r=await pg.evaluate(()=>{const S3=window.ShkafMaster.__hooks.T3().S3;let tex=0,plain=0,sh=0,grainOk=0,grainBad=0;
  S3.scene.traverse(o=>{if(o.userData&&o.userData.shadow)sh++;if(!o.isMesh||!o.geometry||o.geometry.type!=='BoxGeometry')return;const m=o.material;if(m.map)tex++;else plain++;
   if(m.map){const p=o.geometry.parameters,dims=[p.width,p.height,p.depth],L=dims.indexOf(Math.max(...dims)),uv=o.geometry.attributes.uv,pos=o.geometry.attributes.position,nr=o.geometry.attributes.normal;
    // на гранях, в плоскости которых лежит длинная сторона, V меняется вдоль неё: размах V = длина / 0.5 м
    for(let f=0;f<6;f++){const i=f*4,n=[Math.abs(nr.getX(i)),Math.abs(nr.getY(i)),Math.abs(nr.getZ(i))],a=n.indexOf(Math.max(...n));if(a===L)continue;
     let vmin=1e9,vmax=-1e9;for(let k=i;k<i+4;k++){vmin=Math.min(vmin,uv.getY(k));vmax=Math.max(vmax,uv.getY(k))}Math.abs((vmax-vmin)-dims[L]/.5)<1e-4?grainOk++:grainBad++}}});
  return{tex,plain,sh,grainOk,grainBad}});await pg.click('[data-view="2d"]');await pg.waitForTimeout(300);return r};
const a=await look('sonoma');ok(a.tex>10&&a.sh===1,'дуб: деталей с текстурой '+a.tex+', тень '+a.sh);ok(a.grainOk>0&&a.grainBad===0,'волокна вдоль длинной стороны: '+a.grainOk+' граней, неверно '+a.grainBad);
const w=await look('white');ok(w.tex===0&&w.sh===1,'белый: без текстуры ('+w.tex+')');
const an=await look('anthr');ok(an.tex===0,'антрацит: без текстуры');
console.log(bad.length?'✗ '+bad.join('\n✗ '):`✓ все ${n} проверок`,'errs',errs);await b.close()})();
