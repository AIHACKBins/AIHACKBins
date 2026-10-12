"""Check catalogue metadata, source consistency, route data and release integrity."""
import json,re,pathlib
from datetime import date
root=pathlib.Path(__file__).resolve().parents[1]
load=lambda name:json.loads((root/'data'/name).read_text(encoding='utf-8'))
cases=load('cases.json');risks=load('owasp_2025.json');chains=load('chains.json');changes=load('changelog.json');audit=load('audit.json')
assert len(cases)>=20 and len({r['id'] for r in cases})==len(cases)
assert len(risks)==10 and {r['id'] for r in risks}=={f'LLM{i:02d}' for i in range(1,11)}
ids={r['id'] for r in cases};owasp={r['id'] for r in risks}
for r in cases:
 for k in ('id','title','category','target','mechanism','source_url','payload','expected_test','placement','payload_origin','owasp_ids','test_steps','entry_kind','evidence_level','test_scope','reproduction_status','variants','blue_team','status','related_ids','model_tested'):
  assert k in r, f'{r.get("id")}: Missing {k}'
 assert r['source_url'].startswith('https://'),r['id']
 assert isinstance(r['test_steps'],list) and len(r['test_steps'])>=3,r['id']
 assert set(r['owasp_ids'])<=owasp,r['id']
 assert not r.get('atlas_id') or re.fullmatch(r'AML\.T\d{4}(?:\.\d{3})?',r['atlas_id']),r['id']
 assert isinstance(r['variants'],list) and r['variants'],r['id']
 assert r['status'] in ('Unverified','Active','Partially-patched','Model-dependent','Historic'),r['id']
 assert r.get('severity','') in ('','Critical','High','Medium','Low'),r['id']
 assert set(r['related_ids'])<=ids,r['id']
 assert not r['last_verified'] or r['model_tested'],r['id']
 for v in r['variants']:
  assert all(v.get(k) for k in ('name','payload','placement','expected','steps','source_url','provenance')),r['id']
  assert len(v['steps'])>=3,r['id']
for ch in chains:
 assert ch['steps'] and set(ch['steps'])<=ids,ch['id']
for c in changes:
 assert c['id'] in ids and c['type'] in ('new','update','fix'),c
 date.fromisoformat(c['date'])
assert set(audit['removed_card_ids']).isdisjoint(ids)
for ident in ('RC-004','RC-010','RC-011'):
 r=next(x for x in cases if x['id']==ident)
 assert any(0xe0020<=ord(c)<=0xe007e for c in r['payload']),ident
hai=next(x for x in cases if x['id']=='RC-010')
assert 'example.com/' in hai['payload'] and 'Taylor Example' in hai['adapted_visible_prompt']
assert '<h1>' in next(x for x in cases if x['id']=='RC-009')['variants'][0]['payload']
for f in root.rglob('*'):
 if f.is_file() and f.suffix in ('.json','.js','.html','.css','.md','.py'):
  s=f.read_text(encoding='utf-8')
  assert not any(z in s for z in ('<'*7+' HEAD','\n'+'='*7+'\n','>'*7+' ')),f
  assert not re.search(r'\brez[o0]\b',s,re.I),f
script=(root/'app.js').read_text(encoding='utf-8')
for required in ('mountPracticeTerminal','renderChains','renderApi','model_tested','related_ids','data/changelog.json','data/chains.json','id="severity"','id="status"','copy-link'):
 assert required in script,required
print('PASS:',len(cases),'unique cases;',len(chains),'chains;',len(changes),'changes; sources, metadata, Unicode and UI hooks checked')
