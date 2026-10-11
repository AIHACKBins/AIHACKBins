# AIHACKBins

**Open Knowledge. Stronger Security.**

Official website: https://aihackbins.org

AIHACKBins is an open-source, community-driven knowledge base covering **Hacking AI** and **Hacking with AI**.

## Explore

The current field guide contains **36 distinct, source-backed entries** across two research tracks. Each entry includes an objective, prerequisites, synthetic examples, validation guidance, and relevant references.

**Source-backed does not mean independently lab-verified.** Individual exercises have not yet been independently reproduced or peer-reviewed by AIHACKBins. We welcome corrections and reproducibility reports.

## Community

- [Join Discussions](https://github.com/AIHACKBins/.github/discussions)
- [Contribute](https://github.com/AIHACKBins/.github/blob/main/CONTRIBUTING.md)
- [Community Charter](https://github.com/AIHACKBins/.github/blob/main/CHARTER.md)
- [Security Policy](https://github.com/AIHACKBins/.github/blob/main/SECURITY.md)

## Run locally

From the project root:

```sh
python -m http.server 8080
```

Open http://localhost:8080. The website fetches `data/entries.json` over HTTP.

## Deploy

Deploy the repository root as static assets on Cloudflare. No build command is required. Files and directories, including `data/entries.json`, must be present in the published output.

## Content quality

Run `python scripts/validate.py` before publishing. This validates the JSON schema, entries, references and absence of merge-conflict markers. Original research attribution and lab reproduction remain community editorial tasks.
