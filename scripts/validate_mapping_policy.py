#!/usr/bin/env python3
"""Conservative framework mapping rules (not an independent semantic audit)."""
import json, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/cases.json').read_text(encoding='utf-8'))
assert rows and len(rows)==len({r['id'] for r in rows}), "duplicate or empty record set"
for r in rows:
    atlas=r.get('atlas_id') or ''
    if atlas: assert re.fullmatch(r'AML\.T\d{4}(?:\.\d{3})?',atlas),r['id']
    assert all(re.fullmatch(r'LLM(?:0[1-9]|10)',x) for x in r.get('owasp_ids',[])),r['id']
    assert r.get('independent_verification')=='Not independently reproduced by AIHACKBins',r['id']
byid={r['id']:r for r in rows}
for rc in ('RC-259','RC-252','RC-254','RC-255','RC-258'):
    assert not byid[rc].get('atlas_id'),rc+' has an unsupported ATLAS mapping'
assert byid['RC-259']['owasp_ids']==['LLM03']
for rc in ('RC-260','RC-261','RC-263','RC-264','RC-265'):
    assert not byid[rc].get('atlas_id') and not byid[rc].get('owasp_ids'),rc
print(f'PASS: conservative mapping policy; {len(rows)} records')
