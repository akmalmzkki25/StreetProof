// Runs the frozen evaluation cases through the real prompts and writes raw results
// for py/ai-eval to score. Synthetic photos only, so the discounted Contributor model
// is fine here, and it must never see real reports.
// Run: pnpm --filter @streetproof/worker eval:run
import {
  intakeDraftJsonSchema,
  parseIntakeDraft,
  parseProofCheck,
  proofCheckJsonSchema,
} from "@streetproof/contracts";
import type { DraftInput, ProofCheckInput } from "@streetproof/db";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  applyDraftPolicy,
  buildPromptText,
  INTAKE_INSTRUCTIONS,
  PROMPT_VERSION,
} from "../src/intake-prompt";
import { createMetaClient, ModelCallError } from "../src/meta-client";
import {
  applyProofCheckPolicy,
  buildProofCheckText,
  PROOF_CHECK_INSTRUCTIONS,
  PROOF_CHECK_PROMPT_VERSION,
} from "../src/proof-check-prompt";
import {
  CASES_DIR,
  FIXTURES_DIR,
  metaConfig,
  readJson,
  RESULTS_DIR,
  type AdversarialFile,
  type ProofFile,
  type Scene,
} from "./shared";

const MODEL = process.env.EVAL_MODEL || "muse-spark-1.3-contributor";
const CONCURRENCY = 4;
const SAFETY_ID = "streetproof-evaluation";

const callModel = createMetaClient({ ...metaConfig(), model: MODEL });

function photo(id: string) {
  return {
    contentType: "image/jpeg",
    base64: readFileSync(resolve(FIXTURES_DIR, `${id}.jpg`)).toString("base64"),
  };
}

type IntakeCase = {
  id: string;
  group: string;
  split: string;
  photo: string | null;
  location: string;
  text: string;
  candidates: { id: string; location: string; text: string }[];
};

function intakeInput(item: IntakeCase) {
  return {
    revision: 0,
    location: item.location,
    description: item.text,
    photos: item.photo ? [{ objectKey: item.photo }] : [],
    clarifications: [],
    duplicateCandidates: item.candidates.map((candidate) => ({
      ticketId: candidate.id,
      location: candidate.location,
      text: candidate.text,
    })),
  } as unknown as DraftInput;
}

async function runIntake(item: IntakeCase) {
  const input = intakeInput(item);
  const { text, maps } = buildPromptText(input);
  const startedAt = Date.now();
  try {
    const response = await callModel({
      instructions: INTAKE_INSTRUCTIONS,
      text,
      images: item.photo ? [photo(item.photo)] : [],
      jsonSchema: intakeDraftJsonSchema(),
      schemaName: "intake_draft",
      safetyIdentifier: SAFETY_ID,
    });
    const parsed = parseIntakeDraft(JSON.parse(response.outputText));
    return {
      id: item.id,
      type: "intake",
      split: item.split,
      schema_valid: parsed.success,
      output: parsed.success ? applyDraftPolicy(parsed.data, maps, 0) : null,
      latency_ms: response.latencyMs,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    return failed(item.id, "intake", item.split, startedAt, error);
  }
}

async function runProof(item: ProofFile["cases"][number]) {
  const input = {
    category: null,
    reports: [{ description: item.text, location: "" }],
    beforePhotos: [{ objectKey: item.before, contentType: "image/jpeg" }],
    afterPhotos: [{ objectKey: item.after, contentType: "image/jpeg" }],
    note: item.note,
    checklist: [],
    exceptionReason: null,
  } as unknown as ProofCheckInput;
  const startedAt = Date.now();
  try {
    const response = await callModel({
      instructions: PROOF_CHECK_INSTRUCTIONS,
      text: buildProofCheckText(input),
      images: [photo(item.before), photo(item.after)],
      jsonSchema: proofCheckJsonSchema(),
      schemaName: "proof_check",
      safetyIdentifier: SAFETY_ID,
    });
    const parsed = parseProofCheck(JSON.parse(response.outputText));
    return {
      id: item.id,
      type: "proof",
      split: "proof",
      schema_valid: parsed.success,
      output: parsed.success ? applyProofCheckPolicy(parsed.data) : null,
      latency_ms: response.latencyMs,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    return failed(item.id, "proof", "proof", startedAt, error);
  }
}

function failed(
  id: string,
  type: string,
  split: string,
  startedAt: number,
  error: unknown,
) {
  return {
    id,
    type,
    split,
    schema_valid: false,
    output: null,
    latency_ms: Date.now() - startedAt,
    usage: {},
    error: error instanceof ModelCallError ? error.errorClass : String(error),
  };
}

async function inBatches<T, R>(items: T[], run: (item: T) => Promise<R>) {
  const results: R[] = [];
  let next = 0;
  async function worker() {
    for (;;) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item === undefined) return;
      results[index] = await run(item);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

const scenes = readJson<Scene[]>(resolve(CASES_DIR, "scenes.json"));
const adversarial = readJson<AdversarialFile>(
  resolve(CASES_DIR, "adversarial.json"),
);
const proof = readJson<ProofFile>(resolve(CASES_DIR, "proof.json"));

const intakeCases: IntakeCase[] = [
  ...scenes.flatMap((scene) =>
    scene.texts.map((text, index) => ({
      id: `${scene.id}_${index + 1}`,
      group: scene.id,
      split: scene.split,
      photo: scene.id,
      location: scene.location,
      text,
      candidates: [],
    })),
  ),
  ...adversarial.cases.map((item) => ({
    id: item.id,
    group: item.id,
    split: "adversarial",
    photo: item.photo,
    location: item.location,
    text: item.text,
    candidates: item.candidates ?? [],
  })),
];

const intakeResults = await inBatches(intakeCases, runIntake);
const proofResults = await inBatches(proof.cases, runProof);

mkdirSync(RESULTS_DIR, { recursive: true });
const outPath = resolve(RESULTS_DIR, "latest.json");
writeFileSync(
  outPath,
  JSON.stringify(
    {
      model: MODEL,
      intake_prompt: PROMPT_VERSION,
      proof_prompt: PROOF_CHECK_PROMPT_VERSION,
      results: [...intakeResults, ...proofResults],
    },
    null,
    1,
  ),
);
console.info(`Wrote ${outPath}`);
