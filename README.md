# AIHACKBins

**Open knowledge. Practical techniques. Verifiable evidence.**

[Website](https://aihackbins.org/) | [Browse Payloads](https://aihackbins.org/#/payloads) | [MITRE ATLAS Explorer](https://aihackbins.org/#/atlas) | [Contribute](https://github.com/AIHACKBins/AIHACKBins)

AIHACKBins is an open-source, community-driven knowledge base of practical techniques for attacking AI systems and using AI in authorised security testing.

Inspired by [GTFOBins](https://gtfobins.org/) and **Kerckhoffs's principle**, the project promotes openly documented security techniques to help researchers, penetration testers and defenders understand how AI systems can be attacked and how their security boundaries can be evaluated.

## What AIHACKBins covers

AIHACKBins focuses on two complementary areas.

### Hacking AI systems

Security assessment techniques targeting:

- Large language models and prompt injection
- Autonomous AI agents and MCP integrations
- Retrieval-augmented generation (RAG) and vector databases
- Model extraction, privacy and adversarial machine learning
- AI supply chains, datasets and infrastructure
- Sensitive information disclosure and unauthorised tool execution

### Hacking with AI

Practical applications of AI in authorised security assessments, including:

- Source-code and vulnerability analysis
- JavaScript endpoint discovery
- AI-assisted reconnaissance
- Security testing workflows and analysis

## Find a technique. Copy the payload. Test the boundary.

AIHACKBins follows a straightforward workflow:

1. **Search** the technique catalogue or Payloads page.
2. **Select** a technique relevant to the target environment.
3. **Copy or download** the provided assessment input.
4. **Test** it within an authorised environment.
5. **Evaluate** the observed result against the documented success criteria.

Technique entries may include prerequisites, payload variants, testing instructions, downloadable fixtures, research references and applicable defensive considerations.

The website also offers optional interactive labs with animated terminals. Their successful and blocked outcomes are **illustrative simulations**, not real model executions.

## Framework mappings

AIHACKBins links techniques to relevant security frameworks and testing methodologies:

| Framework | Purpose |
|---|---|
| [MITRE ATLAS](https://atlas.mitre.org/) | Adversarial tactics and techniques targeting AI systems |
| [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/) | Security risks affecting LLM applications |
| [OWASP AI Testing Guide](https://github.com/OWASP/www-project-ai-testing-guide) | Structured AI security testing objectives |

Mappings are included only where applicable. They do not imply endorsement by MITRE or OWASP.

## Project features

- 65 technique entries
- Searchable, GTFOBins-inspired payload browser
- Copyable payloads and downloadable assessment files
- Context-specific payload variants
- 65 optional illustrated lab scenarios
- MITRE ATLAS Explorer
- OWASP AI Testing Guide-based assessment baseline
- Research provenance and verification classifications
- Public static JSON catalogue
- Light and dark themes
- Community contribution support

## Evidence and verification

AIHACKBins distinguishes between published research, assessment candidates, reusable testing procedures and independently reproduced results.

**A technique appearing in the catalogue does not establish that a particular system is vulnerable.**

The effectiveness of an assessment input depends on the model, application architecture, available tools, permissions and security controls.

Published research is attributed to its original authors. Adapted payloads are not presented as independently verified unless supporting testing evidence is available.

The site's interactive terminals do not execute payloads against live AI systems.

## Open-source philosophy

AIHACKBins follows the spirit of **Kerckhoffs's principle**: security should remain effective even when the system's design and known attack techniques are public.

AIHACKBins encourages transparent security research, reproducible assessment techniques, responsible disclosure and community collaboration.

The goal is not security through obscurity, but improving defensive understanding through open knowledge.

## Contributing

Contributions are welcome from security professionals, researchers, developers and the wider open-source community.

Useful contributions include:

- New techniques supported by documented research or clear testing procedures
- Reproducible payloads and controlled assessment scenarios
- Improvements to existing techniques and their prerequisites
- Corrected MITRE ATLAS or OWASP mappings
- Verified evidence from authorised testing
- Documentation, accessibility and usability improvements

Visit the [GitHub repository](https://github.com/AIHACKBins/AIHACKBins) to contribute.

## Development

AIHACKBins is a static website built with HTML, CSS and vanilla JavaScript.

It requires no application backend or external LLM API to browse techniques and use the educational lab simulations.

```bash
python scripts/validate.py
node --check app.js
node --check lab.js
node --check lab-outcomes.js
```

The current JSON catalogue is the authoritative dataset. The legacy Markdown importer does not cover every current technique and should not be used to overwrite the catalogue without reconciling its records.

The static site can be deployed through Cloudflare Pages or another compatible hosting service.

## Responsible use

AIHACKBins is intended for education, security research and authorised assessments.

The project is **not a collection of guaranteed exploits**. Techniques may require specific models, configurations or security weaknesses, and some entries describe assessment workflows rather than standalone exploits.

Only perform testing against systems you own or have explicit permission to assess.

## Creator

**[Asif Nawaz Minhas](https://www.linkedin.com/in/asifminhasnl/)**

AIHACKBins is an open-source, community-driven project. Contributions from the wider security community are encouraged.

## License

Refer to the [LICENSE](https://github.com/AIHACKBins/AIHACKBins/blob/main/LICENSE) file for the repository's licensing terms.
