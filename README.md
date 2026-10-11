# AIHACKBins | Practical AI Security Reference

https://aihackbins.org

An open, GTFOBins inspired index of practical research inputs, technical evidence, and source attribution for authorised AI security assessments.

## What is included

26 source linked technical records, including ten new OWASP 2025 test scenarios. Each record shows exact test input or a clearly labelled adaptation, placement, expected observation, original disclosure, MITRE ATLAS classification where justified, and OWASP LLM Top 10 2025 classification.

The OWASP categories are catalogue filters, not ten separate explanatory pages.

The original HackerOne Hai visible excerpt is included with a separately labelled Unicode encoded reconstruction and a fictional researcher adaptation. Historical publication does not establish vulnerability of current products.

Some records document original vendor lab inputs; others are research questions, inspection utilities, or assessment adaptations. They must not be represented as independently verified original product exploits.

## Validation

```bash
python scripts/validate.py
node --check app.js
```

## Contribution standard

Provide original source URL, license/provenance, affected configuration, exact test input, evidence observed, reproduction prerequisites, defensive controls, MITRE ATLAS mapping with rationale (or no justified mapping), and OWASP mapping. No fabricated exploit payloads or inflated reproduction claims.

## Licence and attribution

Original researchers retain credit and rights to their work. The source linked examples are not claimed as original AIHACKBins discoveries. Use only on owned or authorised systems.

## OWASP practical scenario coverage

The additions SC-001 through SC-010 provide one distinct assessment fixture for each OWASP LLM 2025 category. These are explicitly adapted tests, not verbatim exploit artifacts or independently verified vulnerabilities. Original research sources are linked individually. The MITRE ATLAS mapping is applied only where supported by the exact scenario; a blank mapping is deliberate.
