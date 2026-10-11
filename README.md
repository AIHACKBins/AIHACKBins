# AIHACKBins | Practical AI security techniques

Official site: https://aihackbins.org/

This release audits the original 26 catalogue records and presents **20 distinct entries**. Six duplicate catalogue cards were merged into context variants, with the source references retained. The catalogue is not a list of twenty verified exploits.

## Using an entry

1. Select a technique from search or the complete dropdown.
2. Where available, choose an execution context. The payload, placement, expected output and steps change with the selected context.
3. Copy the exact shown test input and use it only on an authorised target or disposable lab environment.
4. Compare the observed result against the entry's success criterion and the original research.

## Content accuracy

The catalogue explicitly distinguishes practical assessment inputs, original published probes, and research or inspection references. A canary response is **not** proof of code execution, account deletion, or exfiltration. Model archive inspection is not exploitation. HTML injection and browser XSS are separate contexts within the output rendering entry. OWASP and MITRE ATLAS mappings describe matching observed mechanisms, not automatic associations with every risk category. Unmapped cases remain unmapped.

Original public research remains linked. Historical case studies may describe patched software. None of the entries have been independently reproduced against named product versions by this project.

## Validate

Run `python scripts/validate.py`. Static code may be previewed locally with `python -m http.server 8080`. No lab runner is required to read or copy reference inputs.

## Contribute

https://github.com/AIHACKBins/.github/discussions

Contributions should provide an accurate payload, prerequisites, tested context, reproducible observed evidence, original source attribution and precise version information. No invented exploit results.
