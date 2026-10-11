import json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
records=json.loads((root/'data/cases.json').read_text(encoding='utf8'))
assert len(records)==10, 'Expected ten cases'
assert len({r['id'] for r in records})==len(records),'Duplicate IDs'
for r in records:
 for key in ('title','target','source_url','payload','expected_test','placement','researcher','atlas_reason'):
  assert r.get(key), f"Missing {key} in {r['id']}"
 assert r['source_url'].startswith('https://'),r['id']
 assert (not r['atlas_id'] or r['atlas_id'].startswith('AML.T')),r['id']
for f in root.rglob('*'):
 if f.is_file() and f.suffix in ('.json','.js','.html','.css','.md'):
  txt=f.read_text(encoding='utf8')
  assert not any(x in txt for x in ('<<<<<<< HEAD','=======\n>>>>>>>','>>>>>>> ')),f'Merge conflict in {f}'
print(f'PASS: {len(records)} unique published cases, URLs, payloads, ATLAS metadata and merge marker checks')
