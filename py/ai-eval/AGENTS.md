# streetproof-ai-eval

Scores AI drafts and proof checks against labelled synthetic cases, for the evaluation in `plan/en/04-technical/ai-pipeline-and-evaluation.md`.

The real prompts and schemas live in TypeScript, so `apps/worker/eval/` runs the models and writes `results/latest.json`. This package only reads that file and calls no model.

## Run

```bash
pnpm --filter @streetproof/worker eval:images  # about $0.01 per missing photo
pnpm --filter @streetproof/worker eval:run     # calls the model for all 92 cases
uv run ai-eval-score                           # writes results/report.md, free
uv run pytest py/ai-eval
```

## Rules for this unit

- `fixtures/` holds generated photos only. Never add a real photo: `eval:run` uses Meta's Contributor model by default, whose inputs Meta may train on.
- Don't tune a prompt against the `heldout` scenes. Look only at `tuning` and `adversarial` when changing one, and bump its version.
- Report what the set is: generated photos, one reviewer. Never quote a figure as production accuracy.
