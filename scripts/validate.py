#!/usr/bin/env python3
"""Content and reference validation for the practical RC-201..RC-233 release."""
from pathlib import Path
import json,re,datetime
root=Path(__file__).resolve().parents[1]
load=lambda name:json.loads((root/'data'/name).read_text(encoding='utf-8'))
rows=load('cases.json');ids={r['id'] for r in rows};expected={f'RC-{i}' for i in range(201,234)}
assert len(rows)==33 and ids==expected, 'Expected 33 unique RC-201 through RC-233 entries'
for r in rows:
 assert r['owasp_ids'] and all(x in {f'LLM{i:02d}' for i in range(1,11)} for x in r['owasp_ids']),r['id']
 assert not r['atlas_id'] or re.fullmatch(r'AML\.T\d{4}(?:\.\d{3})?',r['atlas_id']),r['id']
 assert r['status']=='Unverified' and r['model_tested']==[] and not r['last_verified'],r['id']
 assert r['payload'].strip() and r['placement'].strip() and r['expected_test'].strip(),r['id']
 assert r.get('test_steps') and r.get('source_url') and r.get('defense') and r.get('lab'),r['id']
 assert set(r.get('related_ids',[]))<=ids,r['id']
 assert 'vuln_responses' not in r['lab'] and 'safe_response' not in r['lab'],r['id']
for c in load('chains.json'):assert set(c['steps'])<=ids
for c in load('changelog.json'):assert c['id'] in ids;datetime.date.fromisoformat(c['date'])
rc221=next(r for r in rows if r['id']=='RC-221')
assert sum(0xe0000<=ord(c)<=0xe007f for c in rc221['payload'])>=800
js=(root/'lab.js').read_text(encoding='utf8')
assert 'vuln_responses' not in js and 'Copy payload' in js and 'Record actual observations' in js
assert 'renderWorkspace' not in js and 'workspace(r,' in js
illustrations=load('lab_outcomes.json')
assert len(illustrations)==33 and {x['id'] for x in illustrations}==ids, 'Every RC needs its own illustrations'
assert all(x['success'].strip() and x['blocked'].strip() for x in illustrations)
assert 'ILLUSTRATIVE SUCCESS' in js and 'ILLUSTRATIVE BLOCKED' in js
assert 'lab-outcomes.js' in (root/'index.html').read_text(encoding='utf8')
assert 'window.AIHACKBinsIllustrations' in (root/'lab-outcomes.js').read_text(encoding='utf8')
print('PASS: 33 RCs, real copyable payloads, 33 technique-specific outcome pairs, illustrative labels, standalone labs')
