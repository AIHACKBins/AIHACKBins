#!/usr/bin/env python3
"""Validate field reference and execute every bundled local demonstration."""
import json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
for path in ROOT.rglob('*'):
    if path.is_file() and '.git' not in path.parts and path.suffix in {'.html','.js','.css','.json','.md','.yml','.svg'}:
        content=path.read_text(encoding='utf-8')
        for marker in ('<'+'<'+'<'+'<'+'<'+'<'+'<', '>'+'>'+'>'+'>'+'>'+'>'+'>' ):
            assert marker not in content, f'Merge conflict in {path}'
entries=json.loads((ROOT/'data/entries.json').read_text())
assert len(entries)==8, 'Expected eight curated local labs'
ids=set();slugs=set()
for e in entries:
    for key in ('id','slug','track','category','title','summary','scenario','scope','procedure','expected','defense','verification','independent_product_verification','command','tested_environment','source_title','source_url'):
        assert isinstance(e.get(key),str) and e[key].strip(),f'Missing {key}'
    assert e['id'] not in ids and e['slug'] not in slugs
    assert e['source_url'].startswith('https://')
    assert e['command']==f"python3 labs/run.py {e['scenario']}"
    ids.add(e['id']);slugs.add(e['slug'])
    out=subprocess.run([sys.executable,str(ROOT/'labs/run.py'),e['scenario']],capture_output=True,text=True,check=True)
    assert 'PASS:' in out.stdout,(e['id'],out.stdout)
queue=json.loads((ROOT/'data/research_queue.json').read_text())
assert len(queue)==47,'Prior research queue must be preserved'
cases=json.loads((ROOT/'data/case_studies.json').read_text())
assert len(cases)==10
assert len({x['slug'] for x in cases})==10
for case in cases:
    for key in ('target','title','researcher','source_url','mechanism','attack_surface','observed','procedure','defense','independent_verification'):
        assert case.get(key), (case['id'],key)
    assert case['source_url'].startswith('https://')
    assert not case['atlas_id'] or case['atlas_id']=='AML.T0051'
print(f'PASS: {len(cases)} documented cases with source attribution and ATLAS crosswalk')
print(f'PASS: {len(entries)} local labs executed; {len(queue)} research leads retained separately; no merge markers')
