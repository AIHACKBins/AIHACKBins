#!/usr/bin/env python3
"""LEGACY ONLY: Build older 33 Markdown records; DO NOT RUN for v10.0 canonical JSON.
Usage: python scripts/import_md.py [--check]
Requires: PyYAML (pip install -r scripts/requirements.txt)
"""
import argparse, json, re, sys
from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[1]
REQUIRED=['id','title','category','target','atlas_id','atlas_name','atlas_reason','owasp_ids','entry_kind','evidence_level','payload','payload_note','payload_origin','placement','test_scope','test_steps','expected_test','reproduction_status','researcher','research_context','observed','source_url','defense','related_research','variants','guide_type','review_note','model_tested','last_verified','severity','status','related_ids','blue_team']
VALID_SEVERITY={'','Critical','High','Medium','Low'}
VALID_STATUS={'Unverified','Active','Partially-patched','Model-dependent','Historic'}
def load(path):
 text=path.read_text(encoding='utf-8')
 m=re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)\Z',text,re.S)
 if not m: raise ValueError(f'{path.name}: missing YAML frontmatter')
 obj=yaml.safe_load(m.group(1))
 if not isinstance(obj,dict):raise ValueError(f'{path.name}: frontmatter must be an object')
 missing=[k for k in REQUIRED if k not in obj]
 if missing:raise ValueError(f'{path.name}: missing {missing}')
 obj['mechanism']=m.group(2).strip()
 if not obj['mechanism']:raise ValueError(f'{path.name}: mechanism body empty')
 if obj['severity'] not in VALID_SEVERITY:raise ValueError(f'{path.name}: invalid severity')
 if obj['status'] not in VALID_STATUS:raise ValueError(f'{path.name}: invalid status')
 if obj['last_verified'] and not re.fullmatch(r'\d{4}-\d{2}-\d{2}',str(obj['last_verified'])):raise ValueError(f'{path.name}: invalid verification date')
 if not isinstance(obj['model_tested'],list) or not isinstance(obj['related_ids'],list):raise ValueError(f'{path.name}: model_tested and related_ids must be arrays')
 for row in obj['model_tested']:
  if not isinstance(row,dict) or not {'model','version','result'}<=set(row):raise ValueError(f'{path.name}: model_tested rows need model, version and result')
 if not obj['model_tested'] and obj['last_verified']:raise ValueError(f'{path.name}: last_verified without model verification')
 if obj['status'] in {'Active','Partially-patched','Model-dependent'} and not obj['model_tested']:
  raise ValueError(f'{path.name}: status implies testing but no model_tested records supplied')
 return obj

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
 rows=[];seen=set()
 for p in sorted((ROOT/'techniques').glob('*.md')):
  if p.name.startswith('_'):continue
  row=load(p)
  if row['id'] in seen:raise ValueError(f'duplicate {row["id"]}')
  seen.add(row['id']);rows.append(row)
 for row in rows:
  missing=set(row['related_ids'])-seen
  if missing:raise ValueError(f'{row["id"]}: unknown related IDs {sorted(missing)}')
 dest=ROOT/'data/cases.json';raw=json.dumps(rows,ensure_ascii=False,indent=2)+'\n'
 if args.check:
  if not dest.exists() or dest.read_text(encoding='utf-8')!=raw:raise ValueError('data/cases.json is not synchronized. Run python scripts/import_md.py')
  print(f'PASS: {len(rows)} Markdown records match JSON')
 else:dest.write_text(raw,encoding='utf-8');print(f'Wrote {len(rows)} records to {dest}')
if __name__=='__main__':
 try:main()
 except (ValueError,yaml.YAMLError) as e:print('ERROR:',e,file=sys.stderr);sys.exit(1)
