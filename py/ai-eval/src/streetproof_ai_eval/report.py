"""Writes results/report.md from results/latest.json. Calls no model."""

import json
from pathlib import Path

from streetproof_ai_eval import scoring

ROOT = Path(__file__).resolve().parents[2]


def load(name: str) -> dict | list:
    return json.loads((ROOT / "cases" / name).read_text(encoding="utf-8"))


def row(name: str, rate: scoring.Rate) -> str:
    if rate.value is None:
        return f"| {name} | not measured | |"
    misses = ", ".join(rate.misses) or ""
    return f"| {name} | {rate.passed}/{rate.total} ({rate.value:.0%}) | {misses} |"


def table(title: str, rates: dict[str, scoring.Rate]) -> list[str]:
    rows = [row(name.replace("_", " "), rate) for name, rate in rates.items()]
    return [f"## {title}", "", "| Measure | Result | Misses |", "| --- | --- | --- |", *rows, ""]


def build_report(run: dict, scenes: list, adversarial: dict, proof: dict) -> str:
    results = run["results"]
    intake = [result for result in results if result["type"] == "intake"]
    proof_results = [result for result in results if result["type"] == "proof"]
    claims = scoring.unsupported_claims(results)
    timing = {
        "drafts": scoring.latency_and_cost(intake, run["model"]),
        "proof checks": scoring.latency_and_cost(proof_results, run["model"]),
    }

    lines = [
        "# AI evaluation",
        "",
        f"Model `{run['model']}`, prompts `{run['intake_prompt']}` and `{run['proof_prompt']}`.",
        "",
        "Generated photos, labelled by one reviewer with no second adjudicator. These figures",
        "describe this synthetic set and say little about real reports. Three proof labels",
        "were corrected after a run, when looking at the generated photos showed the edit",
        "hadn't produced the intended repair (see `label_note` in `cases/proof.json`). No",
        "scene label or prompt was changed after seeing results.",
        "",
        *table("All results", {"schema valid": scoring.schema_validity(results)}),
        "## Unsupported claims",
        "",
        f"{len(claims)} of {len(results)} results matched the pattern for a closure or "
        f"safety claim: {', '.join(claims) or 'none'}. A pattern finds wording, so a person",
        "still has to read any match.",
        "",
        *table("Tuning scenes", scoring.score_scenes(results, scenes, "tuning")),
        *table("Held-out scenes", scoring.score_scenes(results, scenes, "heldout")),
        *table("Adversarial cases", scoring.score_adversarial(results, adversarial["cases"])),
        *table("Proof comparison", scoring.score_proof(results, proof["cases"])),
        "## Latency and cost",
        "",
        "| Job | p50 | p95 | This run | Per call at Standard prices |",
        "| --- | --- | --- | --- | --- |",
    ]
    for name, item in timing.items():
        lines.append(
            f"| {name} | {item['p50_ms'] / 1000:.1f} s | {item['p95_ms'] / 1000:.1f} s | "
            f"${item['cost_this_run']:.4f} | ${item['cost_at_standard_per_call']:.4f} |"
        )
    failures = [f"{item['id']}: {item['error']}" for item in results if item["error"]]
    lines += ["", "## Failed calls", "", *(failures or ["None."]), ""]
    return "\n".join(lines)


def main() -> None:
    run = json.loads((ROOT / "results" / "latest.json").read_text(encoding="utf-8"))
    report = build_report(run, load("scenes.json"), load("adversarial.json"), load("proof.json"))
    (ROOT / "results" / "report.md").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
