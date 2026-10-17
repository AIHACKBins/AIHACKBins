# AIHACKBins v11.5 static data structure

- `data/cases.json` — canonical, manually reviewed public record list (68 entries). The `techniques/*.md` files are legacy working material and do not form a complete v10 database.
- `data/aitg_tests.json` — all 32 OWASP AI Testing Guide testing objectives, plus editorial RC cross-references. Test objectives and mappings are not proof of vulnerability or OWASP endorsement.
- `data/lab_outcomes.json` and `lab-outcomes.js` — one authored **illustrative** success/blocked pair per technique. Never present as observed evidence.
- `data/audit.json` — current record and coverage counts; records are Unverified unless independently supported.
- `scripts/validate.py` — validator for the canonical JSON model and cross-references. Older `scripts/import_md.py` is a legacy utility for an earlier subset and must not be run as part of the v10 build.

Mapping rules: use OWASP LLM Top 10 2025 and MITRE ATLAS only where directly applicable. Null ATLAS or an empty LLM mapping is legitimate for general ML / inference infrastructure techniques. Inferred AITG coverage should be independently editorially reviewed before declaring normative conformance.
