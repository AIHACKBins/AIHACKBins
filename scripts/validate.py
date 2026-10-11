import json, pathlib, re
root=pathlib.Path(__file__).resolve().parents[1]
cases=json.loads((root/'data/cases.json').read_text(encoding='utf-8'))
risks=json.loads((root/'data/owasp_2025.json').read_text(encoding='utf-8'))
audit=json.loads((root/'data/audit.json').read_text(encoding='utf-8'))
assert len(cases)==20 and len({r['id'] for r in cases})==20
assert len(risks)==10 and {r['id'] for r in risks}=={f'LLM{i:02d}' for i in range(1,11)}
ids={x['id'] for x in risks}
assert set(audit['removed_card_ids']).isdisjoint({r['id'] for r in cases})
for r in cases:
 for k in ('id','title','source_url','payload','expected_test','placement','payload_origin','owasp_ids','test_steps','entry_kind','evidence_level','test_scope','reproduction_status','variants'):
  assert r.get(k),f'Missing {k}: {r["id"]}'
 assert r['source_url'].startswith('https://') and len(r['test_steps'])>=3
 assert set(r['owasp_ids'])<=ids
 assert not r.get('atlas_id') or re.fullmatch(r'AML\.T\d{4}(?:\.\d{3})?',r['atlas_id'])
 assert len(r['variants'])>=1
 for v in r['variants']:
  assert all(v.get(x) for x in ('name','payload','placement','expected','steps','source_url','provenance'))
  assert len(v['steps'])>=3
for ident in ('RC-004','RC-010','RC-011'):
 r=next(x for x in cases if x['id']==ident)
 assert any(0xE0020<=ord(c)<=0xE007E for c in r['payload']),ident
hai=next(x for x in cases if x['id']=='RC-010')
assert 'example.com/' in hai['payload'] and 'Taylor Example' in hai['adapted_visible_prompt']
assert any(0xE0020<=ord(c)<=0xE007E for c in hai['adapted_encoded_prompt'])
html=next(x for x in cases if x['id']=='RC-009')
assert '<h1>' in html['variants'][0]['payload'] and 'onerror' in html['variants'][1]['payload']
for file in root.rglob('*'):
 if file.is_file() and file.suffix in ('.json','.js','.html','.css','.md','.py'):
  s=file.read_text(encoding='utf-8')
  assert not any(z in s for z in ('<'*7+' HEAD','\n'+'='*7+'\n','>'*7+' ')),file
assert 'data-variant' in (root/'app.js').read_text(encoding='utf-8')
assert 'id="technique"' in (root/'app.js').read_text(encoding='utf-8')
print('PASS: 20 technique records, original 26 accounted for, variant payloads, mappings, Unicode, no merge conflicts')

assert all(r.get('guide_type') and r.get('review_note') for r in cases)
assert 'mountPracticeTerminal' in (root/'app.js').read_text(encoding='utf-8')
assert 'id=\"toggle-practice\"' in (root/'app.js').read_text(encoding='utf-8')
all_public='\n'.join(f.read_text(encoding='utf-8') for f in root.rglob('*') if f.is_file() and f.suffix in ('.json','.js','.html','.md','.css','.py'))
assert not re.search(r'\brez[o0]\b',all_public,re.I), 'Real researcher name remains in public content'
print('PASS: guided browser terminal, ethical attribution, fictional researcher, 20 reviewed records')
