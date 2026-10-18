## Contribution type

- [ ] New technique (linked to reviewed proposal)
- [ ] Correction to an existing technique
- [ ] Documentation / code / tests

**Proposal issue:** Closes # (only if applicable)

## Mechanism and provenance

Explain the exact trust boundary and how your input or procedure is related to its cited primary source. Label adaptations, background references and hypotheses accurately. Do not claim independent reproduction without evidence.

## Testing and observable evidence

Describe the authorised test environment, clean control, injected test, expected outcome and evidence collected. No real secrets, client information or unauthorised testing.

## Release consistency checklist

- [ ] `data/cases.json` contains the canonical entry, with a unique ID assigned/reviewed by a maintainer
- [ ] `data/lab_outcomes.json` and `lab-outcomes.js` are consistent if a new entry is added (outcomes are **simulations**, not real results)
- [ ] Input fixtures exist and referenced paths are correct (where needed)
- [ ] Only mechanism-supported MITRE ATLAS / OWASP mappings are included
- [ ] `data/audit.json` and related counts are updated when catalogue size changes
- [ ] No secrets, private client data or unsupported reproduction claims
- [ ] `python scripts/validate.py`, `python scripts/validate_release.py`, `python scripts/validate_mapping_policy.py`, `python scripts/test_payload_integrity.py`, `python scripts/validate_assessment.py`, and `python scripts/validate_contributions.py` pass

**Publication happens only after maintainer review, PR checks and merge.** Merging the PR does not automatically prove that Cloudflare has been deployed.
