import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { checklistFor, TICKET_CATEGORIES } from "@streetproof/domain";
import { describe, expect, it } from "vitest";

import { AGE_LABELS, STAGE_LABELS } from "@/features/dashboard/labels";
import { ROLE_LABELS } from "@/features/members/labels";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/features/tickets/labels";

import { ID_MESSAGES } from "./messages-id";
import { chooseLocale, localePath, splitLocale, translate } from "./translate";

const SOURCE_ROOT = join(import.meta.dirname, "..", "..");
// The design system page and the home illustration stay in English, and the
// root layout only holds the description search engines read.
const UNTRANSLATED = [
  "design-system",
  "lib/i18n",
  "case-stack",
  "[lang]/layout",
];

function sourceFiles() {
  return readdirSync(SOURCE_ROOT, { recursive: true, encoding: "utf8" })
    .map((file) => file.replaceAll("\\", "/"))
    .filter((file) => /\.tsx?$/.test(file))
    .filter((file) => !/\.(test|spec)\./.test(file))
    .filter((file) => !UNTRANSLATED.some((part) => file.includes(part)));
}

function unescape(text: string) {
  return text.replaceAll('\\"', '"').replaceAll("\\'", "'");
}

function stringsIn(expression: string) {
  const strings = expression.matchAll(/(?<![=!]==?\s*)"((?:\\.|[^"\\\n])*)"/g);
  return [...strings].map((match) => unescape(match[1] ?? "")).filter(Boolean);
}

// The first argument of each t(...) call, so a conditional's two sentences are
// both found and the params object is left out.
function firstArguments(source: string) {
  const found: string[] = [];
  for (const match of source.matchAll(/\bt\(/g)) {
    let depth = 1;
    let inString: string | null = null;
    let index = match.index + match[0].length;
    const start = index;
    for (; index < source.length && depth > 0; index++) {
      const char = source[index];
      if (inString) {
        if (char === "\\") index++;
        else if (char === inString) inString = null;
      } else if (char === '"' || char === "'" || char === "`") {
        inString = char;
      } else if (char === "(" || char === "{" || char === "[") {
        depth++;
      } else if (char === ")" || char === "}" || char === "]") {
        depth--;
      } else if (char === "," && depth === 1) {
        break;
      }
    }
    found.push(source.slice(start, index));
  }
  return found;
}

// Text that reaches t() through a prop or a constant instead of a literal.
const PROP_TEXT =
  /(?:title|note|emptyTitle|emptyMessage|label|placeholder|description|detail)\s*[=:]\s*\{?\s*"((?:\\.|[^"\\\n])+)"/g;
// A sentence an action returns as its error.
const ERROR_TEXT = /"([A-Z](?:\\.|[^"\\\n])*[.?!])"/g;
const ACTION_FILE = /(actions|-action|photo-upload|photos)\.ts$/;

function textKeys() {
  const keys = new Map<string, string>();
  for (const file of sourceFiles()) {
    const source = readFileSync(join(SOURCE_ROOT, file), "utf8");
    for (const argument of firstArguments(source)) {
      for (const text of stringsIn(argument)) keys.set(text, file);
    }
    for (const match of source.matchAll(PROP_TEXT)) {
      keys.set(unescape(match[1] ?? ""), file);
    }
    if (ACTION_FILE.test(file)) {
      for (const match of source.matchAll(ERROR_TEXT)) {
        keys.set(unescape(match[1] ?? ""), file);
      }
    }
  }
  return keys;
}

const CONSTANT_KEYS = [
  ...Object.values(STATUS_LABELS),
  ...Object.values(CATEGORY_LABELS),
  ...Object.values(PRIORITY_LABELS),
  ...Object.values(ROLE_LABELS),
  ...Object.values(AGE_LABELS),
  ...Object.values(STAGE_LABELS).flatMap(({ title, owner, state }) => [
    title,
    owner,
    state,
  ]),
  ...TICKET_CATEGORIES.flatMap((category) =>
    checklistFor(category).map((item) => item.label),
  ),
  "low uncertainty",
  "medium uncertainty",
  "high uncertainty",
];

describe("Indonesian messages", () => {
  it("cover every sentence the interface shows", () => {
    const missing = [...textKeys()]
      .filter(([text]) => !(text in ID_MESSAGES))
      .map(([text, file]) => `${file}: ${text}`);
    const missingConstants = CONSTANT_KEYS.filter(
      (text) => !(text in ID_MESSAGES),
    );

    expect(missing).toEqual([]);
    expect(missingConstants).toEqual([]);
  });

  it("keep the placeholders of their English sentence", () => {
    const placeholders = (text: string) =>
      [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

    for (const [english, indonesian] of Object.entries(ID_MESSAGES)) {
      expect(placeholders(indonesian), english).toEqual(placeholders(english));
    }
  });

  it("have no em dashes and no empty entries", () => {
    for (const [english, indonesian] of Object.entries(ID_MESSAGES)) {
      expect(indonesian.trim(), english).not.toBe("");
      expect(indonesian, english).not.toContain("—");
    }
  });
});

describe("translate", () => {
  it("returns the English sentence with its params for English", () => {
    expect(translate("en", "Hello, {name}", { name: "Sari" })).toBe(
      "Hello, Sari",
    );
  });

  it("returns the Indonesian sentence with its params for Indonesian", () => {
    expect(translate("id", "Hello, {name}", { name: "Sari" })).toBe(
      "Halo, Sari",
    );
  });

  it("falls back to English when a sentence has no translation", () => {
    expect(translate("id", "Sentence without a translation")).toBe(
      "Sentence without a translation",
    );
  });
});

describe("chooseLocale", () => {
  it("uses the saved choice", () => {
    expect(chooseLocale("id")).toBe("id");
    expect(chooseLocale("en")).toBe("en");
  });

  it("uses English when nothing, or something unknown, is saved", () => {
    expect(chooseLocale(undefined)).toBe("en");
    expect(chooseLocale("fr")).toBe("en");
  });
});

describe("locale paths", () => {
  it("puts the language in front of a path", () => {
    expect(localePath("id", "/app/queue")).toBe("/id/app/queue");
    expect(localePath("en", "/")).toBe("/en");
  });

  it("splits the language off an address", () => {
    expect(splitLocale("/id/app/queue")).toEqual({
      locale: "id",
      path: "/app/queue",
    });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/login")).toEqual({ locale: null, path: "/login" });
    expect(splitLocale("/english/login")).toEqual({
      locale: null,
      path: "/english/login",
    });
  });
});
