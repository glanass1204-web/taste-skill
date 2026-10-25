import json,subprocess,sys,collections
cases=json.load(open('opc/cases.json'));method=sys.argv[1] if len(sys.argv)>1 else 'forward_greedy_native'
res={}
for c in cases:
    n=c['ours']+2
    params={'cut_width':c['kerf'],'min_initial_usage':True,'panels':{f'p{i}':{'width':c['Ls'],'height':c['Ws']} for i in range(n)},
            'items':{f'i{k}':{'width':l,'height':w,'can_rotate':c['rot']} for k,(l,w) in enumerate(c['items'])}}
    p=subprocess.run(['opc/venv/bin/opcut','calculate','--method',method,'--input-format','json','--output-format','json','-'],input=json.dumps(params),capture_output=True,text=True,timeout=600)
    if p.returncode:res[c['id']]=None;print('ERR',c['id'],p.stderr[:200]);continue
    r=json.loads(p.stdout);res[c['id']]=len({u['panel'] for u in r['used']})
json.dump(res,open(f'opc/res_{method}.json','w'))
b=w=s=0;tot=0;tot2=0;bad=[]
for c in cases:
    o=res.get(c['id'])
    if o is None:continue
    tot+=c['ours'];tot2+=o
    if o<c['ours']:b+=1;bad.append((c['id'],c['ours'],o))
    elif o>c['ours']:w+=1
print(method,'случаев',len(cases),'opcut лучше',b,'хуже',w,'листов наших',tot,'opcut',tot2);print('где opcut лучше:',bad[:30])
