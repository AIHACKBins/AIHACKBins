#!/usr/bin/env python3
import json,re,pathlib
from datetime import date
root=pathlib.Path(__file__).resolve().parents[1]
read=lambda name:json.loads((root/'data'/name).read_text(encoding='utf-8'))
rows=read('cases.json'); ids={r['id'] for r in rows}
expected={f'RC-{i}' for i in range(201,221)}
assert len(rows)==20 and ids==expected, 'Exactly RC-201 through RC-220 are required'
assert len({r['id'] for r in rows})==20
assert all(r['owasp_ids'] and set(r['owasp_ids'])<= {f'LLM{i:02d}' for i in range(1,11)} for r in rows)
assert all(not r['atlas_id'] or re.fullmatch(r'AML\.T\d{4}(?:\.\d{3})?',r['atlas_id']) for r in rows)
assert all(r['status']=='Unverified' and not r['model_tested'] and not r['last_verified'] for r in rows)
assert all(r.get('lab') for r in rows)
assert all(set(r.get('related_ids',[]))<=ids for r in rows)
assert all(r.get('payload') and r.get('placement') and r.get('expected_test') for r in rows)
for ch in read('chains.json'):assert set(ch['steps'])<=ids and ch['steps']
for entry in read('changelog.json'):
 assert entry['id'] in ids
 date.fromisoformat(entry['date'])
s=(root/'lab.js').read_text()
assert 'renderWorkspace(mainEl.querySelector' in s and "if (targetId)" in s
app=(root/'app.js').read_text()
assert 'renderDetail(sub)' in app and "encodeURIComponent(r.id)" in app
assert 'lab-inline-host' not in app
print('PASS: 20 selected records, 20 standalone labs, mapped classifications, chain references and UI links')
