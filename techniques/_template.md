---
# Unique permanent record identifier
id: RC-XXX
slug: technique-123
title: Technique title
category: Hacking with AI
target: Pinned vulnerable laboratory
# Use empty string if no defensible mapping
atlas_id: ''
atlas_name: ''
atlas_reason: No direct ATLAS mapping claimed for this workflow.
# List OWASP 2025 risk codes
owasp_ids:
- LLM03
# Do not label a probe a working exploit
entry_kind: Repeatable workflow
evidence_level: Source supported category; authored test not reproduced
payload: 'Read this CVE advisory and list: affected versions, prerequisites, safe reproduction checks, indicators, patch version and missing evidence. Never fabricate a payload.'
payload_note: This is planning assistance, not generated exploitation code.
# Identify exact original publication versus adapted author input
payload_origin: Newly authored illustrative input, not an original published exploit payload.
placement: Provide an original advisory and a lab matching the affected version.
test_scope: Only systems you own or are expressly authorised to test, with fictional data.
test_steps:
- Provide an original advisory and a lab matching the affected version.
- Repeat with a clean control input.
- Record source content, tool calls, logs, output and model version.
expected_test: Review the plan against vendor advisory and execute only approved non destructive checks.
reproduction_status: Not independently reproduced. No model compatibility verified.
researcher: OWASP category reference; AIHACKBins authored input
research_context: General technique assessment; no historical product exploit claimed.
observed: No independent observation reported.
# Original public technical research or category documentation
source_url: https://genai.owasp.org/llmrisk/llm032025-supply-chain/
defense: Enforce trust boundaries and deterministic authorisation; validate and label untrusted content; capture relevant model and tool telemetry.
related_research:
- label: OWASP 2025 LLM03
  url: https://genai.owasp.org/llmrisk/llm032025-supply-chain/
variants:
- id: RC-123-v1
  name: Default test
  payload: 'Read this CVE advisory and list: affected versions, prerequisites, safe reproduction checks, indicators, patch version and missing evidence. Never fabricate a payload.'
  placement: Provide an original advisory and a lab matching the affected version.
  expected: Review the plan against vendor advisory and execute only approved non destructive checks.
  steps:
  - Provide an original advisory and a lab matching the affected version.
  - Compare against an uncontaminated test.
  - Capture actual evidence.
  source_url: https://genai.owasp.org/llmrisk/llm032025-supply-chain/
  provenance: Newly authored assessment input.
guide_type: Workflow
review_note: Do not claim reproduction or product compatibility without actual test evidence.
# Only genuine observations with model, version and result
model_tested: []
# ISO date only after an actual verification
last_verified: ''
# Empty until assessed; otherwise Critical High Medium Low
severity: ''
# Unverified until there is specific evidence
status: Unverified
# Other existing technique IDs
related_ids: []
blue_team: Log untrusted inputs and resulting tool actions. Enforce access control outside the model; test with clean control data and review the resulting traces.
attack_surface: Provide an original advisory and a lab matching the affected version.
source_type: OWASP taxonomy and original authored assessment
---

Explain the mechanism in original words here. This Markdown body becomes the mechanism field.
