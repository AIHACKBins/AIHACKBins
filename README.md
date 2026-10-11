# AIHACKBins website prototype

**Open Knowledge. Stronger Security.**

A static, zero-dependency proof of concept for the future AIHACKBins community website.

## Included

- Responsive dark interface, AIHACKBins SVG icon and favicon
- Two separate tracks: Hacking AI and Hacking with AI
- Eight **illustrative** starter entries (four per track)
- Working keyword search, category/track filters, detail views, copyable lab examples
- About and Contribute pages with links to the community organisation
- No backend, analytics, third-party JavaScript, account requirement, or external assets

## Run locally

Open `index.html` in your browser. For an HTTP server:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy

Upload the contents of this directory to Cloudflare Pages as a static site, or deploy using a repository with `index.html` at its root and no build command. Do **not** publish this inside `AIHACKBins/.github`, which is reserved for the GitHub organisation profile and community documents.

## Status and limitations

**Prototype only.** The eight sample records illustrate the proposed editorial layout. They are not tested or peer-reviewed security findings. Before launch, community review, attribution, licensing policy and a contributor content schema should be finalized. This demo stores entries in `app.js`; production should use separately versioned content files.
