// насколько изменились цены после исправлений: петли по таблице производителей и кромкование по чистой длине
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const load=async f=>{const pg=await b.newPage();await pg.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(f,'utf8')+'</body></html>');await pg.waitForTimeout(400);return pg};
const O=await load(process.argv[2]),N=await load('shkaf-master.html');
const gen=`(()=>{const M=window.ShkafMaster;return M.builtinTemplates().map(t=>{const p=M.fromTemplate(t),S=M.effSettings(p),c=M.calc(p,S),pk=m=>c.parts.filter(z=>z.mat===m),cl=M.pack(pk('ldsp'),S,!S.grain),cf=pk('ldspF').length?M.pack(pk('ldspF'),S,!S.grain):null,ch=M.pack(pk('hdf'),S,true);const k=M.costs(p,S,c,cl,ch,cf);
 return [t.name,k.price,c.hw.filter(h=>/^Петля/.test(h[0])).reduce((a,h)=>a+h[1],0),+(k.rows.find(r=>r[0]==='Кромкование')||[0,0])[1]]})})()`;
const o=await O.evaluate(gen),n=await N.evaluate(gen);o.forEach((a,i)=>{const z=n[i];console.log(`${a[0].padEnd(42)} ${String(a[1]).padStart(7)} → ${String(z[1]).padStart(7)} (${z[1]-a[1]>=0?'+':''}${z[1]-a[1]})  петли ${a[2]}→${z[2]}  кромкование ${a[3]}→${z[3]} м`)});await b.close()})();
