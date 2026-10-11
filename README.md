# AIHACKBins | Open Knowledge. Stronger Security.

Official community site: https://aihackbins.org

This is the complete static v0.2 website. It has 12 unique **source-verified** field notes split evenly between Hacking AI and Hacking with AI. Source-verified means an established primary technical source documents the underlying technique or workflow. **No individual lab exercise in this release has been independently executed or peer-reviewed by AIHACKBins.** The UI discloses this clearly.

## Features

- New modular AIHACKBins SVG logo and favicon
- Responsive homepage, track navigation, search, categories and 12 field-note pages
- Individual reproducible synthetic fixtures, expected observations and references
- No external JavaScript, fonts, analytics, trackers, user accounts or build dependencies
- Dedicated community About and Contribute pages
- Standalone structured content in `data/entries.json`

## Preview

Run `python -m http.server 8080` in this folder and open http://localhost:8080. The JSON data is loaded with `fetch` and therefore a local HTTP server is needed.

## Deployment

Cloudflare Workers & Pages: production branch `main`, static assets from repository root, no build command. Publish the entire contents of this ZIP at repository root, **not** the ZIP itself.

## Editorial requirements

Content is source-backed and includes links to primary references. Lab reproductions, observed results, model versions, contributors and peer review need to be added before any specific technique can be marked lab verified.

## Community

Contributions: https://github.com/AIHACKBins/.github/blob/main/CONTRIBUTING.md
Discussions: https://github.com/AIHACKBins/.github/discussions
Charter: https://github.com/AIHACKBins/.github/blob/main/CHARTER.md
