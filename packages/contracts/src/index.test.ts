import { describe, expect, it } from "vitest";

import {
  intakeDraftJsonSchema,
  parseIntakeDraft,
  proofCheckJsonSchema,
} from "./index";

type JsonObject = {
  type?: string;
  properties?: Record<string, JsonObject>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JsonObject;
};

function assertStrict(node: JsonObject) {
  if (node.type === "object") {
    expect(node.additionalProperties).toBe(false);
    expect([...(node.required ?? [])].sort()).toEqual(
      Object.keys(node.properties ?? {}).sort(),
    );
    Object.values(node.properties ?? {}).forEach(assertStrict);
  }
  if (node.items) assertStrict(node.items);
}

const validDraft = {
  summary: "Leak under the sink",
  visibleFacts: [{ text: "Water on the floor", evidenceRefs: ["photo-1"] }],
  userContext: [{ text: "Dripping since morning", reportRevision: 0 }],
  inferences: [],
  missing_fields: [],
  categoryCandidate: "plumbing",
  priorityCandidate: "unknown",
  priorityRationale: "Not enough evidence",
  duplicateCandidates: [],
  limitations: [],
};

describe("intakeDraftJsonSchema", () => {
  it("meets Meta's strict subset at every level", () => {
    assertStrict(intakeDraftJsonSchema() as JsonObject);
  });

  it("has no location field for the model to invent", () => {
    const schema = intakeDraftJsonSchema() as JsonObject;

    expect(Object.keys(schema.properties ?? {})).not.toContain("location");
  });
});

describe("proofCheckJsonSchema", () => {
  it("meets Meta's strict subset at every level", () => {
    assertStrict(proofCheckJsonSchema() as JsonObject);
  });

  it("offers the model no way to give a verdict on the repair", () => {
    const schema = proofCheckJsonSchema() as {
      properties: Record<string, { enum?: string[] }>;
    };

    expect(Object.keys(schema.properties).sort()).toEqual([
      "limitations",
      "missingProof",
      "observations",
      "reportedProblem",
      "sameLocation",
    ]);
    expect(schema.properties.reportedProblem?.enum).toEqual([
      "not_visible",
      "still_visible",
      "unclear",
    ]);
  });
});

describe("parseIntakeDraft", () => {
  it("accepts a valid draft, including unknown candidates", () => {
    expect(parseIntakeDraft(validDraft).success).toBe(true);
  });

  it("rejects a category outside the list", () => {
    const result = parseIntakeDraft({
      ...validDraft,
      categoryCandidate: "structural_failure",
    });

    expect(result.success).toBe(false);
  });
});
