#!/usr/bin/env python3
"""Offline contribution-flow regression gates; external GitHub acceptance requires a manual signed-in test."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
issue=ROOT/'.github/ISSUE_TEMPLATE/technique_submission.yml'
config=ROOT/'.github/ISSUE_TEMPLATE/config.yml'
pr=ROOT/'.github/PULL_REQUEST_TEMPLATE.md'
contrib=ROOT/'CONTRIBUTING.md'
app=(ROOT/'app.js').read_text(encoding='utf-8')
smoke=(ROOT/'scripts/browser_smoke.py').read_text(encoding='utf-8')
wf=(ROOT/'.github/workflows/validate.yml').read_text(encoding='utf-8')
for f in (issue,config,pr,contrib):
 assert f.is_file() and f.stat().st_size>100,f'Missing required contribution file: {f}'
proposal_url='https://github.com/AIHACKBins/AIHACKBins/issues/new?template=technique_submission.yml'
assert proposal_url in app,'Submit page does not link to a real issue form'
assert '#submit-proposal' in smoke,'Browser tests do not cover Submit link'
assert 'validate_contributions.py' in wf,'Contribution checks missing from CI'
source=issue.read_text(encoding='utf-8')
for term in ('name: New AI security technique proposal','required: true','id: input','id: comparison','id: provenance','id: attestation'):
 assert term in source,f'Missing issue form requirement: {term}'
assert source.count('required: true')>=9,'Insufficient mandatory issue form fields'
assert 'PR' in pr.read_text() or 'pull' in pr.read_text().lower()
ids=[r['id'] for r in json.loads((ROOT/'data/cases.json').read_text(encoding='utf-8'))]
assert len(ids)==len(set(ids)), 'duplicate technique ID'
assert 'No code or JSON editing is needed' in app, 'Proposal-first workflow missing'
print(f'PASS: contribution form, PR template, public Submit links, CI gate, and {len(ids)} unique catalogue IDs')
