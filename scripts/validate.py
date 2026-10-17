#!/usr/bin/env python3
"""Validate the current AIHACKBins catalogue, labs, mapping and local assets."""
import json, re, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def fail(msg): raise ValueError(msg)
rows=read('data/cases.json'); guide=read('data/aitg_tests.json'); outcomes=read('data/lab_outcomes.json'); audit=read('data/audit.json')
ids=[x.get('id') for x in rows]; gid=[x.get('id') for x in guide]; oid=[x.get('id') for x in outcomes]
if len(ids)!=len(set(ids)) or not ids: fail('Duplicate or empty catalogue IDs')
if len(gid)!=len(set(gid)) or not gid: fail('Duplicate or empty AITG test IDs')
if len(oid)!=len(set(oid)) or set(oid)!=set(ids): fail('Every RC must have exactly one lab illustration pair')
if audit.get('current_records')!=len(rows) or audit.get('labs')!=len(outcomes) or audit.get('authored_illustration_pairs')!=len(outcomes): fail('Stale audit counts')
if audit.get('owasp_aitg_tests')!=len(guide): fail('Stale AITG audit count')
allowed={'text','json','file','generator','workflow','url','audio','dataset'}
allowed_severity={'','Low','Medium','High','Critical'}
for x in rows:
 rid=x['id']
 if not re.fullmatch(r'RC-\d{3,}',rid): fail(f'{rid}: invalid ID')
 if not isinstance(x.get('payload'),str) or not x['payload'].strip(): fail(f'{rid}: missing input')
 if not x.get('lab') or not x.get('applies_to') or not x.get('finding_criteria'): fail(f'{rid}: incomplete testing conditions')
 if x.get('severity') not in allowed_severity: fail(f'{rid}: invalid severity')
 if x.get('input_type') not in allowed: fail(f'{rid}: missing/unknown input type')
 if not x.get('source_url','').startswith(('https://','http://')): fail(f'{rid}: missing source URL')
 if x.get('independent_verification')!='Not independently reproduced by AIHACKBins': fail(f'{rid}: ungrounded verification claim')
 if not set(x.get('aitg_ids',[]))<=set(gid): fail(f'{rid}: unknown AITG IDs')
 if not all(re.fullmatch(r'LLM(?:0[1-9]|10)',y) for y in x.get('owasp_ids',[])):fail(f'{rid}: invalid OWASP LLM ID')
 if not set(x.get('related_ids',[]))<=set(ids):fail(f'{rid}: unknown related RC')
 artifact=x.get('artifact_path')
 if artifact:
  if not re.fullmatch(r'fixtures/[a-zA-Z0-9_.\-/]+',artifact) or '..' in Path(artifact).parts or not (ROOT/artifact).is_file():fail(f'{rid}: invalid/missing fixture {artifact}')
  if x['input_type'] not in ('file','generator','workflow'):fail(f'{rid}: file fixture and input type conflict')
 if x['input_type']=='file' and not artifact:fail(f'{rid}: file input missing downloadable fixture')
for x in outcomes:
 if not x.get('success') or not x.get('blocked'):fail(f"{x['id']}: incomplete illustrated outcomes")
for x in guide:
 if not set(x.get('related_rcs',[]))<=set(ids):fail(f"{x['id']}: unknown related RC")
for x in read('data/chains.json'):
 if not set(x.get('steps',[]))<=set(ids):fail('Unknown RC in chain')
for x in read('data/changelog.json'):
 if x['id'] not in ids:fail('Unknown RC in changelog')
if 'window.AIHACKBinsIllustrations' not in (ROOT/'lab-outcomes.js').read_text(encoding='utf-8'):fail('Missing browser lab mirror')
# Validate actual lab mirror count, not just data file.
text=(ROOT/'lab-outcomes.js').read_text(encoding='utf-8')
if len(re.findall(r'RC-\d{3,}(?=["\'])',text))<len(outcomes):fail('Lab mirror appears incomplete')
source_audit=read('data/v10_8_evidence_audit.json')
if len(source_audit)!=len(rows) or {x['id'] for x in source_audit}!=set(ids):fail('Outdated source-audit inventory')
for x in source_audit:
 if not x.get('source_to_payload_review') or not x.get('mapping_review'):fail(f"{x['id']}: missing source/mapping review status")
if not (ROOT/'scripts/browser_smoke.py').exists():fail('Missing browser regression suite')
print(f'PASS: {len(rows)} techniques, {len(outcomes)} illustrated labs, {len(guide)} AITG objectives; assets and metadata valid')
