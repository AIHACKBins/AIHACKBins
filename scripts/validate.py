
#!/usr/bin/env python3
"""AIHACKBins static catalogue and simulation structural validation."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    """Read a JSON file relative to the repository root."""
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


rows = read("data/cases.json")
guide = read("data/aitg_tests.json")
outcomes = read("data/lab_outcomes.json")
audit = read("data/audit.json")

ids = {item["id"] for item in rows}
tests = {item["id"] for item in guide}

# Validate catalogue and guide counts
assert len(rows) == len(ids) == 65, "Expected 65 unique RC entries"
assert len(guide) == len(tests) == 32, "Expected 32 OWASP AITG testing objectives"

# Ensure every technique has one authored lab outcome pair
assert len(outcomes) == len({item["id"] for item in outcomes}) == len(rows), (
    "One authored outcome pair required per entry"
)
assert {item["id"] for item in outcomes} == ids, (
    "Lab outcome IDs must match catalogue IDs"
)

# Validate technique records
for item in rows:
    rc_id = item["id"]

    assert (
        rc_id.startswith("RC-")
        and item.get("payload", "").strip()
        and item.get("lab")
    ), f"{rc_id}: missing required fields"

    assert item.get("status") == "Unverified", (
        f"{rc_id}: unexpected verification status"
    )

    assert set(item.get("aitg_ids", [])) <= tests, (
        f"{rc_id}: unknown AITG reference"
    )

    assert item.get("finding_criteria") and item.get("applies_to"), (
        f"{rc_id}: missing finding criteria or prerequisites"
    )

    assert all(
        re.fullmatch(r"LLM(?:0[1-9]|10)", value)
        for value in item.get("owasp_ids", [])
    ), f"{rc_id}: invalid OWASP LLM identifier"

# Validate authored success/blocked lab illustrations
for item in outcomes:
    assert item.get("success") and item.get("blocked"), (
        f"{item['id']}: missing illustrative outcomes"
    )

# Validate AITG references
for item in guide:
    assert set(item["related_rcs"]) <= ids, (
        f"{item['id']}: references unknown techniques"
    )

# Validate attack chains
for chain in read("data/chains.json"):
    assert set(chain.get("steps", [])) <= ids, (
        "Attack chain references unknown techniques"
    )

# Validate changelog references
for item in read("data/changelog.json"):
    assert item["id"] in ids, (
        f"Changelog references unknown technique: {item['id']}"
    )

# Validate audit metadata
assert (
    audit["current_records"] == len(rows)
    and audit["labs"] == len(outcomes)
), "Audit counts do not match the catalogue"

# Validate required application features
assert "window.AIHACKBinsIllustrations" in (
    ROOT / "lab-outcomes.js"
).read_text(encoding="utf-8"), "Missing lab illustration data"

assert "Kerckhoffs" in (
    ROOT / "app.js"
).read_text(encoding="utf-8"), "Missing Kerckhoffs project reference"

print(
    f"PASS: {len(rows)} unique RC entries, "
    f"{len(outcomes)} authored illustration pairs, "
    f"{len(guide)} AITG objectives, "
    "consistent audit and mappings"
)
