# AIHACKBins — Focused 20 Technique Edition

Static vanilla JS reference for 20 selected AI and LLM assessment mechanisms (RC-201 to RC-220). Each entry has OWASP LLM Top 10 (2025) and, where applicable, MITRE ATLAS metadata. The techniques are not claimed to work against every model.

## Routes

- `#/` — twenty technique catalogue
- `#/technique/RC-216` — independent technique detail view
- `#/lab` — lab index
- `#/lab/RC-216` — **standalone lab scenario**; no expanded exercise below the lab index
- `#/chains` — illustrative assessment paths
- `#/api` — JSON endpoints

The lab responses are **scripted simulations**, not evidence of vulnerabilities. All techniques are labelled `Unverified` until supported by actual independent model observations.

## Contributing

Edit one `techniques/RC-###.md` file, then regenerate:

```sh
python -m pip install -r scripts/requirements.txt
python scripts/import_md.py
python scripts/gen_feed.py
python scripts/validate.py
```

The Markdown importer produces `data/cases.json`. No JavaScript framework or build step is required. Run locally using `python -m http.server 8000`.
