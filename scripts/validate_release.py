#!/usr/bin/env python3
"""Offline v10.3 release gates. Does not verify real-world exploit success."""
import json,re,sys,zipfile
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[1]
def load(path):return json.loads((root/path).read_text(encoding="utf-8"))
rows=load("data/cases.json"); outcomes=load("data/lab_outcomes.json");guide=load("data/aitg_tests.json");audit=load("data/audit.json")
ids=[r["id"] for r in rows];labids=[o["id"] for o in outcomes]; testids=[t["id"] for t in guide]
assert len(ids)==len(set(ids))==len(labids)==len(set(labids)),"Duplicate/missing catalogue/lab records"
assert set(ids)==set(labids),"Every record needs an authored lab outcome"
assert len(testids)==len(set(testids))==32
assert audit["current_records"]==len(ids) and audit["labs"]==len(labids)
allowed={"file","generator","dataset","workflow","url","audio","json","text"}
guidance=load('data/aitg_testing_guidance.json')
assert len(guidance)==32 and {x['id'] for x in guidance}==set(testids),'OWASP testing method coverage mismatch'
for item in guidance:
 assert all(item.get(k) for k in ('access','execute','interpret','remediate','source','url')),item['id']
for r in rows:
 assert all(r.get(k) for k in ('testing_access','aitg_objective','aitg_execution','aitg_interpretation','aitg_remediation','aitg_methodology_source')),r['id']+': incomplete OWASP methodology'
for r in rows:
 rid=r["id"]
 assert r.get("payload","").strip(),rid+": no input"
 assert r.get("input_type") in allowed,rid+": input type unrecognised"
 assert r.get("applies_to") and r.get("finding_criteria"),rid+": missing test guidance"
 assert isinstance(r.get("references",[]),list) and r["references"],rid+": missing source"
 assert r.get("source_support") and r.get("independent_verification"),rid+": provenance absent"
 assert set(r.get("aitg_ids",[])).issubset(testids),rid+": invalid AITG IDs"
 assert r.get("independent_verification")=="Not independently reproduced by AIHACKBins",rid+": unsupported independent verification claim"
 artifact=r.get("artifact_path")
 if artifact:
  assert re.fullmatch(r"fixtures/[A-Za-z0-9_.\-/]+",artifact),rid+": unsafe path"
  assert (root/artifact).is_file(),rid+": missing asset " +artifact
 for v in r.get("variants") or []:
  assert isinstance(v,dict) and v.get("payload"),rid+": broken payload variant"
for c in load("data/chains.json"):
 assert set(c.get("steps",[])).issubset(ids),"Broken chain"
for t in guide:
 assert set(t.get("related_rcs",[])).issubset(ids),"Broken AITG related case"
for x in outcomes:assert x.get("success") and x.get("blocked"),x["id"]
app=(root/"app.js").read_text()
for token in ("renderPayloadBrowser", "payload-capability-buttons", "syncHash(id)", "ArrowDown", "payload-copy"):
 assert token in app,token+": missing payload browser feature"
for fname in ("index.html","app.js","styles.css","lab.js","lab-outcomes.js"):
 assert (root/fname).stat().st_size>100
print(f"PASS: {len(ids)} entries, {len(labids)} paired lab illustrations, {len(testids)} AITG objectives, assets, provenance and UI features")
