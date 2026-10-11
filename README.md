# AIHACKBins | Practical AI Security Field Reference

Website: https://aihackbins.org/

Twelve curated research cases with directly accessible assessment probes, visible payload provenance, OWASP LLM Top 10 (2025) category mapping and justified MITRE ATLAS mappings. Dark and light mode supported.

## Research integrity

Historical exploit reports are linked to their original researchers. AIHACKBins has not independently reproduced historical product exploitation. Most test inputs are adapted for authorized assessment. An adapted canary payload is not the original exploit chain. Where original disclosed bytes are not accessible, no byte identical original claim is made.

RC-010 includes the readable historical prompt excerpt supplied from HackerOne report 2372363, together with a Unicode tag reconstruction clearly marked as such and a separate fictional researcher variant. example.com is used for the sample XSS URL.

## What is mapped

MITRE ATLAS mapping is shown wherever the specific technique justifies it. Conventional flaws are left unmapped instead of forcing a false match. OWASP GenAI LLM Top 10 (2025) links are classification references, not independent reproduction evidence. The OWASP reference gallery links to the official upstream project.

## Quality checks

```powershell
python scripts/validate.py
```

Open this static site via a local web server, for example `python -m http.server 8080`, or deploy the files to Cloudflare. The site requires no Python runtime for visitors.

## Community

https://github.com/AIHACKBins/.github/discussions

Original sources remain owned by their respective authors. No third party payload collection is bulk republished.
