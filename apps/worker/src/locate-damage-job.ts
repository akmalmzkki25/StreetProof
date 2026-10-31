import {
  decodeMaskToSVGPath,
  parseImageStream,
  recordsOfKind,
  type ResponsesEvent,
} from "@meta-sam/parser";
import {
  completeOutboxJob,
  failOutboxJob,
  loadDamageLocateInput,
  retryOutboxJob,
  saveDamageRegions,
  type DamageRegionInput,
  type Db,
  type OutboxJob,
} from "@streetproof/db";
import { createHash } from "node:crypto";
import { z } from "zod";

import {
  backoffMs,
  MAX_ATTEMPTS,
  safeJson,
  WORKER_ERROR,
  type JobOutcome,
} from "./draft-job";
import { ModelCallError, type CallModel, type CallSam } from "./meta-client";

export const LOCATE_DAMAGE_TOPIC = "report.locate_damage";

const MAX_REGIONS = 5;
// Enough for an outline. A far larger one is noise, and the box alone still helps.
const MAX_MASK_PATH_LENGTH = 200_000;
// Muse Spark reports boxes on this grid, whatever the image's size.
const GROUNDING_GRID = 1000;

type Deps = {
  db: Db;
  callModel: CallModel;
  callSam: CallSam;
  readPhoto: (objectKey: string) => Promise<Uint8Array>;
};

const groundingSchema = z.object({
  boxes: z.array(
    z.object({
      x_min: z.number(),
      y_min: z.number(),
      x_max: z.number(),
      y_max: z.number(),
    }),
  ),
});

async function* asEvents(outputText: string): AsyncIterable<ResponsesEvent> {
  const lane = { item_id: "message", output_index: 0, content_index: 0 };
  yield { type: "response.output_text.delta", ...lane, delta: outputText };
  yield { type: "response.output_text.done", ...lane, text: outputText };
  yield { type: "response.completed" };
}

// The non-streaming answer in the same grammar, so the official parser reads it.
export async function parseSamOutput(
  outputText: string,
  label: string,
): Promise<DamageRegionInput[]> {
  if (!outputText.trim()) return [];
  // The parser's records don't carry the frame size, so read it from the box token.
  const frame = /;w=(\d+);h=(\d+)/.exec(outputText);
  if (!frame) return [];
  const frameWidth = Number(frame[1]);
  const frameHeight = Number(frame[2]);

  const result = await parseImageStream(asEvents(outputText)).finalResult;
  const masks = recordsOfKind(result.records, "mask");

  return recordsOfKind(result.records, "box")
    .slice(0, MAX_REGIONS)
    .map(function toRegion(box) {
      const mask = masks.find((item) => item.objectId === box.objectId);
      const maskPath = mask ? decodeMaskToSVGPath(mask.mask) : "";
      return {
        source: "sam",
        label,
        frameWidth,
        frameHeight,
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        maskPath:
          maskPath && maskPath.length <= MAX_MASK_PATH_LENGTH ? maskPath : null,
      };
    });
}

function clampToGrid(value: number) {
  return Math.round(Math.min(GROUNDING_GRID, Math.max(0, value)));
}

// Muse Spark's boxes can run past the image's edge, and a bad box is dropped.
export function parseGroundingOutput(
  outputText: string,
  label: string,
): DamageRegionInput[] {
  const parsed = groundingSchema.safeParse(safeJson(outputText));
  if (!parsed.success) {
    throw new ModelCallError("retryable", "invalid_output");
  }
  return parsed.data.boxes.flatMap(function toRegion(box) {
    const left = clampToGrid(box.x_min);
    const top = clampToGrid(box.y_min);
    const right = clampToGrid(box.x_max);
    const bottom = clampToGrid(box.y_max);
    if (right <= left || bottom <= top) return [];
    return [
      {
        source: "grounding" as const,
        label,
        frameWidth: GROUNDING_GRID,
        frameHeight: GROUNDING_GRID,
        left,
        top,
        right,
        bottom,
        maskPath: null,
      },
    ];
  });
}

function groundingPrompt(label: string) {
  return `Provide the bounding box coordinates of the object in the image: "${label}". Ensure the object accurately matches the request and do not miss any. The coordinates should be in the 0-1000 range, with (0,0) at the top-left. If you cannot find it, return no boxes.`;
}

async function retryOrFail(db: Db, job: OutboxJob, errorClass: string) {
  if (job.attempts < MAX_ATTEMPTS) {
    await retryOutboxJob(
      db,
      job.id,
      new Date(Date.now() + backoffMs(job.attempts)),
      errorClass,
    );
    return "retrying" as const;
  }
  await failOutboxJob(db, job.id, errorClass);
  return "failed_terminal" as const;
}

// An outline is a nicety, so every failure here ends with the ticket untouched and
// the draft still usable. SAM goes first because it's exact and costs a set price.
export async function runLocateDamageJob(
  deps: Deps,
  job: OutboxJob,
): Promise<JobOutcome> {
  const { db, callModel, callSam, readPhoto } = deps;
  const reportId = String(job.payload.reportId);
  const label = String(job.payload.phrase);

  if (job.attempts > MAX_ATTEMPTS) {
    await failOutboxJob(db, job.id, WORKER_ERROR);
    return "failed_terminal";
  }

  const input = await loadDamageLocateInput(db, reportId);
  if (!input?.photo || input.status !== "submitted") {
    await completeOutboxJob(db, job.id);
    return "skipped_manual";
  }

  const bytes = await readPhoto(input.photo.objectKey);
  const image = {
    contentType: input.photo.contentType,
    base64: Buffer.from(bytes).toString("base64"),
  };

  try {
    const sam = await callSam({ phrase: label, image });
    let regions = await parseSamOutput(sam.outputText, label);

    if (regions.length === 0) {
      const grounding = await callModel({
        instructions: "You are an object grounding expert.",
        text: groundingPrompt(label),
        images: [image],
        jsonSchema: groundingJsonSchema(),
        schemaName: "damage_boxes",
        safetyIdentifier: createHash("sha256")
          .update(input.tenantId)
          .digest("hex")
          .slice(0, 64),
      });
      regions = parseGroundingOutput(grounding.outputText, label);
    }

    await saveDamageRegions(db, {
      tenantId: input.tenantId,
      reportId,
      uploadId: input.photo.id,
      regions: regions.slice(0, MAX_REGIONS),
    });
    await completeOutboxJob(db, job.id);
    return "succeeded";
  } catch (error) {
    if (!(error instanceof ModelCallError)) throw error;
    if (error.failureClass === "retryable") {
      return retryOrFail(db, job, error.errorClass);
    }
    await failOutboxJob(db, job.id, error.errorClass);
    return error.failureClass === "auth" ? "auth_failed" : "failed_terminal";
  }
}

export function handleUnexpectedLocateFailure(db: Db, job: OutboxJob) {
  return retryOrFail(db, job, WORKER_ERROR);
}

function groundingJsonSchema() {
  const { $schema: _unused, ...schema } = z.toJSONSchema(groundingSchema);
  return schema;
}
