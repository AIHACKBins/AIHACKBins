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


## Guided practice terminal

Each entry provides an optional **Try in terminal** panel. It is a browser only guided reference console: `help`, `context`, `payload`, `steps`, `evidence`, `mappings`, `source`, `status`, `record <observation>`, and `clear`. It shows the selected context's **actual catalogue payload** and required evidence, not fake agent output. `record` retains notes only in the current panel while it is open. It cannot execute shell commands, talk to a model, perform tool calls or demonstrate success. Live testing happens separately, in a system you have permission to assess.

The HackerOne Hai entry preserves the original public report URL, but uses a fictional researcher in all displayed payloads and explanations. The invisible Unicode tag text is a new adaptation, not a byte accurate historical exploit.

## Entry audit

All 20 distinct records from the previous consolidation were reviewed for payload classification. Source linked research references and inspection tools remain explicitly distinct from demonstrated exploitation. See `data/audit.json` for the merge ledger. No additional exploit verification is claimed in this release.
