import { describe, expect, it } from "vitest";

import {
  canVerifyAttempt,
  checklistFor,
  checklistResults,
  completionProofProblem,
} from "./completion-proof";
import { TICKET_CATEGORIES } from "./ticket-status";

const allChecks = checklistFor("plumbing").map((item) => item.id);

function problem(
  overrides: Partial<Parameters<typeof completionProofProblem>[0]>,
) {
  return completionProofProblem({
    category: "plumbing",
    checkedIds: allChecks,
    photoCount: 1,
    exceptionReason: null,
    ...overrides,
  });
}

describe("checklistFor", () => {
  it("has a list for every category", () => {
    for (const category of TICKET_CATEGORIES) {
      expect(checklistFor(category).length).toBeGreaterThan(0);
    }
  });

  it("falls back to the general list for an unknown or missing category", () => {
    expect(checklistFor(null)).toEqual(checklistFor("other"));
    expect(checklistFor("carpentry")).toEqual(checklistFor("other"));
  });
});

describe("checklistResults", () => {
  it("records every item and ignores IDs that aren't on the list", () => {
    const results = checklistResults("plumbing", ["area_dry", "made_up"]);

    expect(results.map((item) => item.id)).toEqual(allChecks);
    expect(
      results.filter((item) => item.checked).map((item) => item.id),
    ).toEqual(["area_dry"]);
  });
});

describe("completionProofProblem", () => {
  it("accepts every check with a photo", () => {
    expect(problem({})).toBeNull();
  });

  it("refuses an unconfirmed check", () => {
    expect(problem({ checkedIds: allChecks.slice(1) })).toBe(
      "unconfirmed_checks",
    );
  });

  it("refuses a full checklist with no photo", () => {
    expect(problem({ photoCount: 0 })).toBe("missing_photo");
  });

  it("refuses a blank reason as an exception", () => {
    expect(problem({ photoCount: 0, exceptionReason: "   " })).toBe(
      "missing_photo",
    );
  });

  it("lets a reason carry the attempt to a supervisor", () => {
    expect(
      problem({
        checkedIds: [],
        photoCount: 0,
        exceptionReason: "Cameras aren't allowed in the electrical room.",
      }),
    ).toBeNull();
  });
});

describe("canVerifyAttempt", () => {
  it("needs a photo, whatever the reason given", () => {
    expect(canVerifyAttempt({ photoCount: 1 })).toBe(true);
    expect(canVerifyAttempt({ photoCount: 0 })).toBe(false);
  });
});
