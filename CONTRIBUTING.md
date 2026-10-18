# Contribute to AIHACKBins

AIHACKBins accepts new assessment techniques, source/mapping corrections, fixtures and documentation improvements. We use **GitHub Issue proposals → human triage → reviewed Pull Requests → release**. A submitted issue is **not automatically published**.

## For a first-time contributor

1. Open the [structured technique proposal form](https://github.com/AIHACKBins/AIHACKBins/issues/new?template=technique_submission.yml). GitHub sign-in is required. Fill in the mandatory fields and confirm you are permitted to perform any tests you describe.
2. A maintainer reviews originality, duplication, source accuracy, attack surface, clean controls, observable evidence, legal/ethical scope and (where relevant) framework mappings. Maintainers may request clarification, decline an entry, or invite a PR.
3. Fork the repository, create a feature branch and open a PR linked to the proposal. The [Pull Request template](.github/PULL_REQUEST_TEMPLATE.md) documents required checks.
4. The CI workflow checks catalogue integrity, source metadata, mapping policy, payloads, frontend and browser regression. Reviewers also assess research attribution manually. Passing CI alone does not constitute acceptance or independent reproduction.
5. Only an approved merge can enter the canonical GitHub catalogue. Site publication requires a separate Cloudflare deployment unless continuous deployment has explicitly been configured.

## Canonical data shape

**`data/cases.json` is canonical.** The full current record schema contains substantially more metadata than a short example can show. Copy an existing record of the same input type (text, file, generator, workflow) and consult `data/SCHEMA.md` and `scripts/validate_release.py`, `scripts/validate_assessment.py`. Do not use the legacy Markdown importer.

For each new technique, preserve the audit convention: `independent_verification` must be `Not independently reproduced by AIHACKBins` unless AIHACKBins has actually verified the claim; adapted source material must not be described as an original proof. An entry may require updates to `data/lab_outcomes.json`, `lab-outcomes.js`, audit metadata and any additional fixtures. **The interactive labs are illustrative, never live exploit execution.**

### Required contributor explanation

- Mechanism, prerequisite and attacker-controlled input surface
- Literal synthetic input, fixture or reproducible method
- Clean baseline and clear observable evidence
- Original research citation(s) and source-to-payload relationship
- OWASP/ATLAS mapping rationale or explicitly no mapping
- Redacted observations, model/environment versions and reproduction limits
- Defence and detection guidance

We do not accept stolen information, secrets, unauthorised testing, falsified results or misleading independent-verification claims. See [Responsible Use](RESPONSIBLE_USE.md).

## Maintainer end-to-end acceptance test

After publishing a version with `.github/ISSUE_TEMPLATE/technique_submission.yml`:

1. Visit `https://aihackbins.org/#/submit`, click **Propose a technique on GitHub**, and confirm GitHub opens the structured *New AI security technique proposal* form.
2. Leave a required field empty: GitHub should prevent submission. Verify mandatory authorisation checkboxes are present.
3. As a test contributor, submit an issue clearly titled `[TEST ONLY] Contribution flow check` with synthetic content and links to `example.com`. Verify the issue is created and visible to maintainers. **Do not place a fake RC in the catalogue.**
4. Comment on the test issue as a maintainer, and close it as **not planned / test completed**. Confirm no technique was automatically created.
5. In a disposable feature branch, open a PR with a harmless documentation-only change and confirm the PR template appears and all CI checks run. Close that test PR without merging.
6. Enforce branch protection/ruleset separately in GitHub repository settings: require passing `validate` status checks and a maintainer approval before merging to `main`. A public repository alone does not enforce this.

This procedure requires a real signed-in GitHub account and permissions. Static tests cannot prove GitHub accepted an issue or a protected review requirement is enforced.
