import { checklistFor, TICKET_CATEGORIES } from "@streetproof/domain";
import { describe, expect, it } from "vitest";

import { allMessages, hasChecklistTranslation, t } from "./messages";

function placeholders(text: string) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

describe("bot messages", () => {
  it("has the same placeholders in both languages, and no em dashes", () => {
    for (const message of allMessages()) {
      expect(placeholders(message.id)).toEqual(placeholders(message.en));
      expect(message.en).not.toContain("—");
      expect(message.id).not.toContain("—");
    }
  });

  it("translates every checklist label", () => {
    for (const category of TICKET_CATEGORIES) {
      for (const item of checklistFor(category)) {
        expect(hasChecklistTranslation(item.label), item.label).toBe(true);
      }
    }
  });

  it("fills in values and speaks the asked language", () => {
    expect(t("id", "photoSaved", { count: 1, max: 3 })).toBe(
      "Foto 1 dari 3 tersimpan.",
    );
    expect(t("en", "photoSaved", { count: 1, max: 3 })).toBe(
      "Photo 1 of 3 saved.",
    );
  });
});
