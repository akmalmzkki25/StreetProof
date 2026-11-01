import { ID_MESSAGES } from "./messages-id";

export const LOCALE_COOKIE = "streetproof_locale";
export const LOCALES = ["en", "id"] as const;

export type Locale = (typeof LOCALES)[number];
export type Params = Record<string, string | number>;
export type Translate = (text: string, params?: Params) => string;

// The English sentence is the key, so English needs no table and a missing entry
// shows readable English instead of a code. messages.test.ts catches missing ones.
export function translate(locale: Locale, text: string, params?: Params) {
  const template = locale === "id" ? (ID_MESSAGES[text] ?? text) : text;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : String(value);
  });
}

// English unless someone picked Indonesian. The browser's language is ignored.
export function chooseLocale(saved: string | undefined): Locale {
  return saved === "id" ? "id" : "en";
}
