# AIHACKBins | Practical field reference

Official website: https://aihackbins.org

## Editorial standard

The practical catalogue contains eight reproducible **local** practical labs. Each entry provides the exact command, expected observation, source reference, tested environment and clear limitations. All eight local exercises use Python standard library fixtures; none establishes exploitation of a third party product or an actual LLM.

The prior 47 entries remain in `data/research_queue.json` for manual technical review. They are **not** shown as verified exploits. An entry only graduates to the public main catalogue when its exact reproducer, tested environment and observed evidence are available. Published research can also be linked without claiming independent reproduction.

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 and try a lab:

```bash
python3 labs/run.py document
python3 labs/run.py mcp
python3 labs/run.py rag
python3 labs/run.py agency
python3 labs/run.py jsroutes
python3 labs/run.py bola
python3 labs/run.py sinks
python3 labs/run.py report
python3 scripts/validate.py
```

## Contributions

Submit a small, specific technique with a tested target version, explicit prerequisites, the minimal reproducible input or command, expected and observed output, limitations and attribution. Test only on systems you are authorised to assess. Avoid publishing protected data or embargoed details.

Community: https://github.com/AIHACKBins/.github/discussions

## Published research cases

`data/case_studies.json` contains 10 historically documented findings. Case detail pages include the original author, published source, entry point, reported result, safe reproduction outline, defensive control, and MITRE ATLAS crosswalk. Every case is explicitly labelled as NOT independently reproduced against the named software. The offline concept lab is NOT the original exploit.

Mappings use the official MITRE ATLAS website (https://atlas.mitre.org/) rather than reproducing third party mapping articles. AML.T0051 is applied only when the documented behavior involves prompt injection. Cases with a conventional software weakness are left unmapped. Review mappings as ATLAS updates.
