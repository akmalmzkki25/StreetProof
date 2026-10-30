import { describe, expect, it } from "vitest";

import {
  canBeLinkedAsDuplicate,
  canManageDuplicates,
  duplicateLinkProblem,
} from "./duplicates";

const source = {
  id: "source",
  siteId: "site-a",
  status: "submitted" as const,
  currentAssigneeId: null,
  isDuplicate: false,
  hasDuplicates: false,
};
const target = { ...source, id: "target", status: "in_progress" as const };

describe("duplicateLinkProblem", () => {
  it("allows a new report to join open work on the same site", () => {
    expect(duplicateLinkProblem(source, target)).toBeNull();
  });

  it("rejects linking a ticket to itself", () => {
    expect(duplicateLinkProblem(source, source)).toBe("same_ticket");
  });

  it("rejects a target on another site", () => {
    expect(duplicateLinkProblem(source, { ...target, siteId: "site-b" })).toBe(
      "different_site",
    );
  });

  it("won't absorb a ticket someone is already working on", () => {
    expect(
      duplicateLinkProblem({ ...source, currentAssigneeId: "tech" }, target),
    ).toBe("source_has_work");
    expect(
      duplicateLinkProblem({ ...source, status: "in_progress" }, target),
    ).toBe("source_has_work");
  });

  it("prevents chains and cycles by keeping links one level deep", () => {
    expect(duplicateLinkProblem(source, { ...target, isDuplicate: true })).toBe(
      "target_is_duplicate",
    );
    expect(
      duplicateLinkProblem({ ...source, hasDuplicates: true }, target),
    ).toBe("source_has_duplicates");
    expect(duplicateLinkProblem({ ...source, isDuplicate: true }, target)).toBe(
      "source_already_linked",
    );
  });

  it("rejects closed or cancelled targets, since a reporter would see them as finished", () => {
    expect(
      duplicateLinkProblem(source, { ...target, status: "verified_closed" }),
    ).toBe("target_closed");
    expect(
      duplicateLinkProblem(source, { ...target, status: "cancelled" }),
    ).toBe("target_closed");
  });
});

describe("canManageDuplicates", () => {
  it("allows operators and supervisors only", () => {
    expect(canManageDuplicates(["operator"])).toBe(true);
    expect(canManageDuplicates(["supervisor"])).toBe(true);
    expect(canManageDuplicates(["technician"])).toBe(false);
    expect(canManageDuplicates(["tenant_admin"])).toBe(false);
  });
});

describe("canBeLinkedAsDuplicate", () => {
  it("is true only before work starts", () => {
    expect(canBeLinkedAsDuplicate(source)).toBe(true);
    expect(canBeLinkedAsDuplicate(target)).toBe(false);
  });
});
