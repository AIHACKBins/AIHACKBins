#!/usr/bin/env python3
"""AIHACKBins current static catalog and simulation structural validation."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
read=lambda s:json.loads((root/s).read_text(encoding='utf-8'))
rows=read('data/cases.json');guide=read('data/aitg_tests.json');out=read('data/lab_outcomes.json');audit=read('data/audit.json')
ids={x['id'] for x in rows};tests={x['id'] for x in guide}
assert len(rows)==len(ids)==65,'Expected 65 unique RC entries'
assert len(guide)==len(tests)==32,'Expected 32 OWASP AITG testing objectives'
assert len(out)==len({x['id'] for x in out})==len(rows),'One authored outcome pair per entry'
assert {x['id'] for x in out}==ids
for item in rows:
 assert item['id'].startswith('RC-') and item.get('payload','').strip() and item.get('lab'),item['id']
 assert item.get('status')=='Unverified',item['id']
 assert set(item.get('aitg_ids',[]))<=tests,item['id']
 assert item.get('finding_criteria') and item.get('applies_to'),item['id']
 assert all(re.fullmatch(r'LLM(?:0[1-9]|10)',s) for s in item.get('owasp_ids',[])),item['id']
for x in out:assert x.get('success') and x.get('blocked'),x['id']
for x in guide:assert set(x['related_rcs'])<=ids,x['id']
for c in read('data/chains.json'):assert set(c.get('steps',[]))<=ids
for c in read('data/changelog.json'):assert c['id'] in ids
assert audit['current_records']==len(rows) and audit['labs']==len(out)
assert 'window.AIHACKBinsIllustrations' in (root/'lab-outcomes.js').read_text()
assert 'Kerckhoffs' in (root/'app.js').read_text()
assert 'data/cases.json' in (root/'README.md').read_text()
print(f'PASS: {len(rows)} unique RC entries, {len(out)} authored illustration pairs, {len(guide)} AITG objectives, consistent audit and mappings')
