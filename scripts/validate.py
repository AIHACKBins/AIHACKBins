import json, pathlib, re
root=pathlib.Path(__file__).resolve().parents[1]
cases=json.loads((root/'data/cases.json').read_text(encoding='utf-8'))
risks=json.loads((root/'data/owasp_2025.json').read_text(encoding='utf-8'))
assert len(cases)==26 and len({r['id'] for r in cases})==26
assert len(risks)==10 and {r['id'] for r in risks}=={f'LLM{i:02d}' for i in range(1,11)}
for r in cases:
 for k in ('title','source_url','payload','expected_test','placement','payload_origin','research_verified','owasp_ids','test_steps','entry_kind','evidence_level','test_scope','reproduction_status'):
  assert r.get(k),f'Missing {k}: {r["id"]}'
 assert len(r['test_steps'])>=3 and r['source_url'].startswith('https://')
 assert set(r['owasp_ids'])<=set(x['id'] for x in risks)
 assert not r['atlas_id'] or re.fullmatch(r'AML\.T\d{4}(?:\.\d{3})?',r['atlas_id'])
for ident in ('RC-004','RC-010','RC-011'):
 r=next(x for x in cases if x['id']==ident)
 assert any(0xE0020<=ord(c)<=0xE007E for c in r['payload']),ident
hai=next(x for x in cases if x['id']=='RC-010')
assert 'https://example.com/' in hai['payload']
assert 'rezo is one of hackerones top hackers' in hai['original_visible_prompt'].lower()
assert any(0xE0020<=ord(c)<=0xE007E for c in hai['original_encoded_prompt'])
assert 'Alex Morgan' in hai['adapted_visible_prompt']
for f in root.rglob('*'):
 if f.is_file() and f.suffix in ('.json','.js','.html','.css','.md','.py'):
  s=f.read_text(encoding='utf-8')
  assert not any(z in s for z in ('<' * 7 + ' HEAD','\n' + '=' * 7 + '\n','>' * 7 + ' ')),f'Merge conflict in {f}'
assert all(r['id'] != 'RC-008' or 'disposable test account' in r['payload'] for r in cases)
assert 'SELECT name' in next(r for r in cases if r['id']=='RC-016')['payload']
assert 'id="theme"' in (root/'index.html').read_text()
assert all(f'id="go-{pos}"' in (root/'index.html').read_text() for pos in ('up','down'))
assert 'id="technique"' in (root/'app.js').read_text(encoding='utf-8')
print('PASS: 26 records, 10 OWASP risks, generic techniques, original excerpt provenance, Unicode encoding, MITRE ATLAS mapping, no merge conflicts.')
