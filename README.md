# AIHACKBins | Open Knowledge. Stronger Security.

Public site: https://aihackbins.org

AIHACKBins is a practical AI security technique reference inspired by GTFOBins. Entries are organised by reusable attack mechanisms rather than by product, author, or laboratory. Every record has an assessment input or command, test placement, expected evidence, original sources, and relevant OWASP and MITRE ATLAS mappings.

## Evidence policy

**Do not conflate a test probe with an exploit.** An instruction canary establishes an instruction boundary weakness, not necessarily code execution, credential theft, or tool abuse. Model archive inspection is not deserialization exploitation. A test question is not a model poisoning procedure. Published historical behaviour does not establish that today's product version is vulnerable.

Entries are labelled with their provenance. Some are generic adaptations, some are historical disclosed instructions, and some are research or inspection references. No independent product exploit reproduction is claimed.

## Contribute

Propose improvements at https://github.com/AIHACKBins/AIHACKBins/issues. Supply an authoritative source, tested versions, reproducible steps, exact placement, expected and actual observations, remediation, and appropriate ATLAS and OWASP classifications. Do not include real personal data or credentials.

## Validate

Run `python scripts/validate.py` from the repository root. Open `index.html` through a static server, or deploy through the existing Cloudflare workflow.

Only test systems you own or are authorised to assess.
