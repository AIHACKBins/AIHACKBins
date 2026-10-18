> **v11.6 research corrections:** All 68 records have undergone a documentary mechanism/mapping review. Incorrect sources and unsupported mappings were corrected or explicitly downgraded. **No AIHACKBins payload has been independently reproduced or certified as successful.** See [V11.6_RESEARCH_CORRECTIONS.md](V11.6_RESEARCH_CORRECTIONS.md) and [audit/CONSOLIDATED_AUDIT_LEDGER.csv](audit/CONSOLIDATED_AUDIT_LEDGER.csv).

# AIHACKBins

**Find a technique. Copy the payload. Test the boundary.**

[Website](https://aihackbins.org/) · [Payloads](https://aihackbins.org/#/payloads) · [ATLAS Explorer](https://aihackbins.org/#/atlas) · [Testing baseline](https://aihackbins.org/#/baseline) · [Contribute](https://github.com/AIHACKBins/AIHACKBins)

AIHACKBins is an open-source, community-driven catalogue of practical techniques for assessing AI systems and using AI in **authorised** security testing. Inspired by [GTFOBins](https://gtfobins.github.io/) and Kerckhoffs's principle, it makes payloads, prerequisites, assessment procedures and security evidence expectations available to defenders and researchers.

The project has two tracks: **Hacking AI systems** (LLMs, agents, MCP, RAG, model and data security, supply chains and AI infrastructure) and **Hacking with AI** (AI-assisted authorised security testing).

## Use it

1. Search the [Payloads browser](https://aihackbins.org/#/payloads) by technique, target or capability.
2. Open an entry and copy the **actual text/JSON**, download its **fixture**, or follow a **generator/workflow** where applicable.
3. Read its prerequisites and finding criteria, then test only within an authorised environment.
4. Optionally use the illustrated Lab to learn what success or blocking could look like. **The Lab is simulated** and does not execute inputs or contact live models.

## Scope and evidence

- 68 documented technique records and 68 *illustrative* lab outcome pairs.
- 32 OWASP AI Testing Guide (AITG) test objectives in the Baseline; this does **not** mean all objectives have corresponding practical payloads.
- Applicable MITRE ATLAS and OWASP LLM Top 10 (2025) mappings, not MITRE/OWASP endorsements.
- Research provenance is separate from independent reproduction. The adapted inputs have **not** been independently reproduced by AIHACKBins.
- Severity denotes *potential impact*, not severity of a confirmed finding. A printed marker does not prove an unauthorised action or leak.

## Source of truth and validation

`data/cases.json` is the current **canonical catalogue**. Historical Markdown records under `techniques/` describe an older subset. **Do not run `scripts/import_md.py` to rebuild the v10 catalogue:** it is a legacy importer and would overwrite newer records.

```sh
python scripts/validate.py
node --check app.js
node --check lab.js
node --check lab-outcomes.js
```

If Playwright and Chromium are installed, browser checks can be run with `python scripts/browser_smoke.py`; see `V10.7_RELEASE_NOTES.md`. The site is static HTML/CSS/JavaScript and deploys without a build step (Cloudflare Pages or equivalent).

## Contributing

Help improve technique correctness, source attribution, payload variants, framework mappings, accessibility and reproducible evidence. Provide exact placement, preconditions and observable consequences. Read [GitHub issues](https://github.com/AIHACKBins/AIHACKBins/issues) or open a pull request. Original disclosures and researchers should be attributed; adaptations must not claim verified exploitation without evidence.

## Responsible use

AIHACKBins is for education, research and **owned or expressly authorised** security assessments. It is not a list of guaranteed exploits. Outcomes vary with model, configuration, permissions and the application's trust boundaries. The educational terminal never validates real-world exploit success.

Created by [Asif Nawaz Minhas](https://www.linkedin.com/in/asifminhasnl/). Licence terms: [LICENSE](LICENSE).

## OWASP AI Testing Guide methodology (v10.9)

The Baseline and technique pages adapt the OWASP AI Testing Guide v1.0 (November 2025) into concise, attributed test guidance. Access levels are editorial, target-dependent recommendations. The 32 method records are in `data/aitg_testing_guidance.json`. Source: https://github.com/OWASP/www-project-ai-testing-guide (the guide identifies CC BY-SA 4.0). Mapping is not proof of independent reproduction or OWASP endorsement.


## v11.4 assessment readiness

Each of the 68 techniques provides `assessment_targets`, `input_placement`, `test_steps`, `evidence_type`, `evidence_capture` and a format-specific primary action. These fields describe **what to verify**, not a guaranteed exploit. See `V11.4_RECORD_QUALITY_AUDIT.csv` and `V11.4_AITG_COVERAGE.md` for transparent research and baseline coverage.

Offline verification: `python scripts/validate_assessment.py` plus the existing release, content, mapping and payload integrity validators. Live browser verification remains separately required.

## Responsible use

The site provides an authorisation-first disclaimer in About and the footer; see [RESPONSIBLE_USE.md](RESPONSIBLE_USE.md). This notice does not guarantee protection against liability or excuse unapproved testing.

## Assessment notes

The Baseline offers target-focused editorial checklists and locally generated Markdown notes; technique pages offer downloadable evidence-note templates. These contain placeholders, not observed exploit results, and require a human tester to insert separately collected authorised evidence.

## v11.7 community contributions

Start at [Submit a technique](https://aihackbins.org/#/submit) or the [structured GitHub proposal form](https://github.com/AIHACKBins/AIHACKBins/issues/new?template=technique_submission.yml). New ideas are reviewed as issues before code PRs. See [CONTRIBUTING.md](CONTRIBUTING.md) and the accompanying templates in `.github/`. The issue-form and PR links are checked offline; actual GitHub issue creation and branch protection require a signed-in acceptance test.
