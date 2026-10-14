# AIHACKBins — Practical Assessment Catalogue

Open-source, static, vanilla JavaScript reference to **33 techniques (RC-201 through RC-233)**. The main catalogue and every standalone lab use the same evidence-first structure: copyable actual payload, placement, clean baseline, reproducible steps, expected evidence, OWASP LLM Top 10 2025 mapping, applicable MITRE ATLAS mapping, research source, defence and an area to record real observations.

No external LLM is called by the static site. No successful exploit or verified model result is invented. **All entries remain unverified by AIHACKBins** until actual, documented tests are performed. These are practical *assessment inputs*; efficacy depends on application architecture, model and privileges.

## Routes

- `#/` — technique catalogue
- `#/technique/RC-221` — detailed proof of concept
- `#/lab` — all practical lab exercises
- `#/lab/RC-221` — standalone exercise with genuine Unicode Tag payload
- `#/glossary` — security terminology
- `#/chains` — conceptual technique chains
- `#/api` — public static JSON files
- `#/about` — mission and project principles

## Rebuild and validate

```sh
python -m pip install -r scripts/requirements.txt
python scripts/import_md.py --check
python scripts/gen_feed.py
python scripts/validate.py
node --check app.js
node --check lab.js
```

Each technique's canonical source is `techniques/RC-###.md`. Run `python scripts/import_md.py` to regenerate `data/cases.json` after editing. Deploy static files as-is, without a JS build step.

## Unicode Tag payload (RC-221)

`python scripts/unicode_tag_lab.py --write` generates `unicode-clean.txt` and `unicode-injected.txt` with real invisible Unicode Tag characters repeated three times. `python scripts/unicode_tag_lab.py --inspect unicode-injected.txt` decodes them. The full injected report is also embedded in the RC-221 catalogue payload and lab. This is an adaptation of HackerOne report https://hackerone.com/reports/2372363; the fictional reporter is Taylor Example. The test XSS in the report is not a verified finding.

## Sources and scope

Additional RC-222–RC-233 inputs are adapted from publicly documented patterns in PayloadsAllTheThings and the explain-openclaw prompt injection guide. Source links are maintained per record. They are not claimed verbatim published exploits or tested model vulnerabilities. Use only on owned or authorised environments.

## v8.5: technique-specific simulated terminal outcomes

Every one of the 33 RC labs now offers **Successful attack** and **Blocked attack** illustrative terminal responses. Both are explicitly labelled simulated and are **not** observations or evidence of exploitation. The actual assessment payload remains copyable, and the separate evidence notes area is for genuine observations only. The scenarios are reviewed per RC and are not generic canned `VULNERABLE` responses.

The outcomes' editable data lives in `data/lab_outcomes.json`, and the static browser mirror is `lab-outcomes.js`. Both must remain consistent when making updates. No API, backend or live target execution is used.
