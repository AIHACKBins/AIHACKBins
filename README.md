# AIHACKBins

AI security field reference inspired by the clarity of GTFOBins.

Website: https://aihackbins.org

## What visitors get

* Ten historical research cases, each attributed to its original publication.
* Copyable, non destructive assessment probes and explicit expected observations.
* MITRE ATLAS mapping on cards and detailed pages, when justified.
* Search by researcher, product, technique or CVE; ATLAS filters.
* Dark and light modes, persistent where browser storage allows.
* No mandatory local lab runner or Python dependencies to use the website.

## Honest verification

Published exploits have not been independently reproduced by AIHACKBins. Payloads are clearly labelled as **adapted assessment probes**, not original working product exploits. Their effectiveness against current vendor versions is unknown. Avoid claiming that canary output equals arbitrary command execution or data exfiltration.

A reference case without a defensible MITRE ATLAS mapping remains unmapped.

## Use and publishing

Deploy the complete static site directory to your web server or Cloudflare Workers static assets. Website visitors can browse without a runtime installation. To preview locally, run `python -m http.server 8080` from the root and open `http://localhost:8080`.

Validate before release:

```bash
python scripts/validate.py
node --check app.js
```

Publish only research that permits public disclosure. Credit the original researcher and link the primary evidence. Test only against authorised systems.
