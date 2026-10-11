import json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
records=json.loads((root/'data/cases.json').read_text(encoding='utf8'))
assert len(records)==12, 'Expected twelve cases'
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

# Reject fake code block placeholders in direct Unicode payloads.
for ident in ('RC-004','RC-010','RC-011'):
 rec=next(r for r in records if r['id']==ident)
 assert any(0xE0020 <= ord(ch) <= 0xE007E for ch in rec['payload']), f'Missing real Unicode tag payload in {ident}'
 assert '[UNICODE TAG PAYLOAD' not in rec['payload'],f'Placeholder in {ident}'
assert 'https://example.com/' in next(r for r in records if r['id']=='RC-010')['payload']
assert all('rez0' not in r['payload'].lower() for r in records)
print('PASS: three encoded Unicode payloads, safe sample URL and no fake Unicode placeholders')

assert all(len(r.get('test_steps',[]))>=3 for r in records), 'Every case needs practical steps'
assert all(r['payload'].strip() and len(r['payload'])>40 for r in records), 'Unexpected empty probe'
assert 'id="go-up"' in (root/'index.html').read_text() and 'id="go-down"' in (root/'index.html').read_text()
print('PASS: steps for twelve cases, navigation controls, ready to copy inputs')

assert all('placeholder' not in r['payload'].lower() for r in records)
assert all(r.get('source_type') for r in records)
print('PASS: concrete payloads, source labels, and complete research links')
