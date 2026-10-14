# RC-220 — GCG adversarial suffix generation (research workflow)

Source project: https://github.com/llm-attacks/llm-attacks
Research paper: https://arxiv.org/abs/2307.15043

The source code is external. Use an isolated environment and follow the exact pinned revision, model/tokeniser and published usage instructions. Do **not** treat arbitrary gibberish as an optimised GCG suffix. A suffix is an optimisation output, not a hand-authored universal payload.

Run `git clone https://github.com/llm-attacks/llm-attacks.git`, save the resulting `git rev-parse HEAD`, then follow the README for your locally hosted, permitted model. Record model identifier, tokenizer revision, attack objective, optimisation parameters, generated suffix, refusal/compliance outcomes, trials and exact commit.

Do not claim cross-model transfer without a separate measured trial. AIHACKBins does not bundle any unaudited adversarial suffix as a "verified" exploit.
