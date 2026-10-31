import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@streetproof/domain";
import { z } from "zod";

export const DRAFT_SCHEMA_VERSION = "intake-draft-v2";

// The AI draft wire schema from plan/en/04-technical/api-and-event-contracts.md.
// Every field is required because Meta's strict mode demands it; "unknown" and
// empty arrays express missing information. Location is deliberately absent:
// it only ever comes from the reporter.
export const intakeDraftSchema = z.object({
  summary: z.string(),
  visibleFacts: z.array(
    z.object({ text: z.string(), evidenceRefs: z.array(z.string()) }),
  ),
  userContext: z.array(
    z.object({ text: z.string(), reportRevision: z.number().int() }),
  ),
  inferences: z.array(
    z.object({
      text: z.string(),
      evidenceRefs: z.array(z.string()),
      uncertainty: z.enum(["low", "medium", "high"]),
    }),
  ),
  missing_fields: z.array(z.string()),
  categoryCandidate: z.enum([...TICKET_CATEGORIES, "unknown"]),
  priorityCandidate: z.enum([...TICKET_PRIORITIES, "unknown"]),
  priorityRationale: z.string(),
  duplicateCandidates: z.array(
    z.object({ ticketId: z.string(), reason: z.string() }),
  ),
  limitations: z.array(z.string()),
  // What a segmentation model should outline. Empty when no damage is visible.
  damagePhrase: z.string(),
});

export type IntakeDraft = z.infer<typeof intakeDraftSchema>;

export function intakeDraftJsonSchema() {
  const { $schema: _unused, ...schema } = z.toJSONSchema(intakeDraftSchema);
  return schema;
}

export function parseIntakeDraft(value: unknown) {
  return intakeDraftSchema.safeParse(value);
}

// A hint for the supervisor comparing before and after photos. There is deliberately
// no field for "repaired" or "accept": the model reports what it sees, not a verdict.
export const proofCheckSchema = z.object({
  sameLocation: z.enum(["same", "different", "unclear"]),
  reportedProblem: z.enum(["not_visible", "still_visible", "unclear"]),
  observations: z.array(z.string()),
  missingProof: z.array(z.string()),
  limitations: z.array(z.string()),
});

export type ProofCheck = z.infer<typeof proofCheckSchema>;

export function proofCheckJsonSchema() {
  const { $schema: _unused, ...schema } = z.toJSONSchema(proofCheckSchema);
  return schema;
}

export function parseProofCheck(value: unknown) {
  return proofCheckSchema.safeParse(value);
}
