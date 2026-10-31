// Generates the synthetic evaluation photos with Muse Image. Costs $0.01 per image,
// and skips any that already exist. Run: pnpm --filter @streetproof/worker eval:images
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

import {
  CASES_DIR,
  FIXTURES_DIR,
  metaConfig,
  readJson,
  type AdversarialFile,
  type ProofFile,
  type Scene,
} from "./shared";

const MODEL = "muse-image-1.0";
const MAX_EDGE = 768;

const config = metaConfig();

async function saveImage(id: string, response: Response) {
  if (!response.ok) {
    throw new Error(`${id}: HTTP ${response.status}`);
  }
  const payload = (await response.json()) as {
    data?: { b64_json?: string }[];
  };
  const encoded = payload.data?.[0]?.b64_json;
  if (!encoded) throw new Error(`${id}: no image in the response`);
  // Small enough for the repo, with no metadata.
  const jpeg = await sharp(Buffer.from(encoded, "base64"))
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside" })
    .jpeg({ quality: 72 })
    .toBuffer();
  writeFileSync(resolve(FIXTURES_DIR, `${id}.jpg`), jpeg);
  console.info(`${id}: ${jpeg.length} bytes`);
}

function post(path: string, body: Record<string, unknown>) {
  return fetch(`${config.baseUrl}/images/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      n: 1,
      reasoning_strength: "low",
      response_format: "b64_json",
      ...body,
    }),
    signal: AbortSignal.timeout(180_000),
  });
}

async function generate(id: string, prompt: string) {
  if (existsSync(resolve(FIXTURES_DIR, `${id}.jpg`))) return;
  await saveImage(
    id,
    await post("generations", { prompt, output_format: "jpeg" }),
  );
}

async function edit(id: string, from: string, prompt: string) {
  if (existsSync(resolve(FIXTURES_DIR, `${id}.jpg`))) return;
  const source = readFileSync(resolve(FIXTURES_DIR, `${from}.jpg`));
  await saveImage(
    id,
    await post("edits", {
      prompt,
      images: [
        { image_url: `data:image/jpeg;base64,${source.toString("base64")}` },
      ],
    }),
  );
}

mkdirSync(FIXTURES_DIR, { recursive: true });
const scenes = readJson<Scene[]>(resolve(CASES_DIR, "scenes.json"));
const adversarial = readJson<AdversarialFile>(
  resolve(CASES_DIR, "adversarial.json"),
);
const proof = readJson<ProofFile>(resolve(CASES_DIR, "proof.json"));

const failures: string[] = [];
async function attempt(id: string, run: () => Promise<void>) {
  try {
    await run();
  } catch (error) {
    failures.push(`${id}: ${String(error)}`);
  }
}

for (const item of [...scenes, ...adversarial.images]) {
  await attempt(item.id, () => generate(item.id, item.prompt));
}
for (const item of proof.after_images) {
  await attempt(item.id, () => edit(item.id, item.from, item.prompt));
}
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
