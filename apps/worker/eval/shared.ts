import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const EVAL_ROOT = fileURLToPath(
  new URL("../../../py/ai-eval/", import.meta.url),
);
export const CASES_DIR = resolve(EVAL_ROOT, "cases");
export const FIXTURES_DIR = resolve(EVAL_ROOT, "fixtures");
export const RESULTS_DIR = resolve(EVAL_ROOT, "results");

export type Scene = {
  id: string;
  split: "tuning" | "heldout";
  category: string[];
  priority: string[];
  phrase_terms: string[];
  location: string;
  prompt: string;
  texts: string[];
};

export type AdversarialCase = {
  id: string;
  kind: string;
  photo: string | null;
  location: string;
  text: string;
  candidates?: { id: string; location: string; text: string }[];
  [label: string]: unknown;
};

export type AdversarialFile = {
  images: { id: string; prompt: string }[];
  cases: AdversarialCase[];
};

export type ProofCase = {
  id: string;
  before: string;
  after: string;
  text: string;
  note: string;
  [label: string]: unknown;
};

export type ProofFile = {
  after_images: { id: string; from: string; prompt: string }[];
  cases: ProofCase[];
};

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function metaConfig() {
  const apiKey = process.env.META_API_KEY;
  if (!apiKey) throw new Error("META_API_KEY is not set in the root .env.");
  return {
    apiKey,
    baseUrl: process.env.META_API_BASE_URL || "https://api.meta.ai/v1",
  };
}
