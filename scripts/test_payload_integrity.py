#!/usr/bin/env python3
"""Offline catalogue regression checks inspired by Garak's payload tests.

No model is contacted; these are structural tests, not exploit verification.
"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
read = lambda path: json.loads((ROOT/path).read_text(encoding='utf-8'))
rows=read('data/cases.json'); outcomes=read('data/lab_outcomes.json')
lookup={r['id']:r for r in rows}; assert len(lookup)==len(rows), 'Duplicate technique IDs'
by_id={o['id']:o for o in outcomes}; assert len(by_id)==len(outcomes), 'Duplicate lab outcome IDs'
assert set(lookup)==set(by_id),'Missing lab outcome records'
assert {r['input_type'] for r in rows}<={'text','json','file','generator','workflow','dataset','url','audio'}
for rid,r in lookup.items():
 assert isinstance(r['payload'],str) and r['payload'].strip(),f'{rid}: empty payload'
 assert r.get('applies_to') and r.get('placement') and r.get('finding_criteria'),f'{rid}: incomplete scenario'
 assert isinstance(r.get('references'),list) and r['references'],f'{rid}: missing research citation'
 assert r.get('independent_verification')=='Not independently reproduced by AIHACKBins',f'{rid}: unsupported verification claim'
 for i,v in enumerate(r.get('variants') or []):
  assert isinstance(v,dict) and isinstance(v.get('payload'),str) and v['payload'].strip(),f'{rid}: variant {i} invalid'
 if r['input_type']=='file':
  asset=r.get('artifact_path');assert asset and (ROOT/asset).is_file(),f'{rid}: missing file download'
 if r['input_type']=='json':
  try: json.loads(r['payload'])
  except json.JSONDecodeError as exc: raise AssertionError(f'{rid}: invalid JSON primary input: {exc}') from exc
 assert by_id[rid].get('success') and by_id[rid].get('blocked'),f'{rid}: incomplete illustrative outcomes'
print(f'PASS: {len(rows)} payloads, fixtures, variants, provenance assertions and illustrative outcomes')
