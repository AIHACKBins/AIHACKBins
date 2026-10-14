# AIHACKBins assessment quality standard

The 33 RC entries use one lab UI and distinguish **a usable input** from **proof that the input worked**. Only real observations from an authorised target support a finding.

- Assessment ready means a complete payload/fixture, placement, baseline and observable success condition—not independent verification.
- Research workflow means an upstream optimiser or model-specific tool must be run before an exploitable artefact exists.
- A successful illustrative terminal response is **fictional educational output**, not a measured exploit.
- Distinguish instruction-following markers from data disclosure, privileged tool execution, persistence and tool-authorisation failures.
- Record test date, model/version, app, trust boundary, settings, full payload, baseline, response, tool log and repeated trials.
- Technique names and OWASP/ATLAS mappings are hypotheses until the described mechanism is actually observed on a supported environment.

Fixtures in `fixtures/` include an actual PNG, a full model card, a bounded context generator, a seeded multi-tenant data-leak plan and a provenance-first GCG research workflow.
