#!/usr/bin/env python3
"""Offline assessment-readiness contract. Does NOT verify external scientific claims."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/cases.json').read_text())
tests=json.loads((root/'data/aitg_tests.json').read_text())
assert len(rows)==len(set(r['id'] for r in rows))==68
known={r['id'] for r in rows}
for r in rows:
 for key in ('assessment_targets','assessment_scope','evidence_type','evidence_capture','input_placement','primary_action','test_steps','source_review_status'):
  assert r.get(key),r['id']+': missing '+key
 assert isinstance(r['test_steps'],list) and len(r['test_steps'])>=2,r['id']
 assert all(isinstance(s,str) and s.strip() for s in r['test_steps']),r['id']
 assert r['independent_verification']=='Not independently reproduced by AIHACKBins',r['id']
 if r['input_type']=='file' and r.get('artifact_path'):
  assert (root/r['artifact_path']).is_file(),r['id']
for t in tests:
 assert set(t['related_rcs'])<=known,t['id']
assert len(tests)==32
print('PASS: 68 consistent assessment workflows, evidence types, conservative reproduction labels and 32 baseline objectives')
