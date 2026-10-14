# AIHACKBins assessment quality standard

The 33 RC entries use one lab UI and distinguish **a usable input** from **proof that the input worked**. Only real observations from an authorised target support a finding.

- Assessment ready means a complete payload/fixture, placement, baseline and observable success condition—not independent verification.
- Research workflow means an upstream optimiser or model-specific tool must be run before an exploitable artefact exists.
- A successful illustrative terminal response is **fictional educational output**, not a measured exploit.
- Distinguish instruction-following markers from data disclosure, privileged tool execution, persistence and tool-authorisation failures.
- Record test date, model/version, app, trust boundary, settings, full payload, baseline, response, tool log and repeated trials.
- Technique names and OWASP/ATLAS mappings are hypotheses until the described mechanism is actually observed on a supported environment.

Fixtures in `fixtures/` include an actual PNG, a full model card, a bounded context generator, a seeded multi-tenant data-leak plan and a provenance-first GCG research workflow.


## v9.1 assessment integrity

- 33 RCs remain unverified; scripted terminal responses are educational and never evidence.
- RC-201/205: failure conditions use system-only synthetic markers and matched controls, not marker-format games.
- RC-208: disposable messages and a tester-controlled audit mailbox only. Confirm tool calls, not promises.
- RC-217: runnable baseline/prefill request fixture for provider-supported models. Unsupported prefill is not a test failure.
- RC-220: upstream optimiser workflow only; a valid suffix requires model-specific generation and recorded evidence.
- RC-213/216/218/229: fixture download and the actual ingestion path are mandatory for an applicable test.
- Variant-specific authored examples in labs are tied to the selected context; modified text is never evaluated.
