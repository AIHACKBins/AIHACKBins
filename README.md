# AIHACKBins | Practical AI Security Reference

Official site: https://aihackbins.org

An open reference for authorised AI security assessments. Twelve concise research linked entries with usable assessment payloads, placement guidance, observable evidence, MITRE ATLAS mappings, and original researcher attribution.

## Evidence matters

An AIHACKBins assessment payload is a functional input, not automatically the same as the original disclosed exploit. No entry claims that an original product vulnerability remains exploitable or that the historical exploit has been independently reproduced by AIHACKBins.

The main catalogue has no required Python lab runner. Read an entry, copy its payload, and apply it in a system you own or are authorised to test. Some entries require a supporting application feature or test account.

## Run locally

```sh
python -m http.server 8080
```

Open http://localhost:8080. The site is static and also runs on Cloudflare Workers static hosting.

## Validate

```sh
python scripts/validate.py
node --check app.js
```

## Attribution

Original technical research is linked from each case. The sample payloads were authored or adapted for assessment use and should not be presented as the researchers' original bytes unless independently verified. The catalogue provides both dark and light themes.

## Contribute

https://github.com/AIHACKBins/AIHACKBins/issues

The project welcomes reproducible evidence, corrections, version specific observations, and negative results.
