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

export function hasLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

// Where an unprefixed address goes: the last language someone used, otherwise
// English. The browser's own language is ignored.
export function chooseLocale(saved: string | undefined): Locale {
  return saved !== undefined && hasLocale(saved) ? saved : "en";
}

export function localePath(locale: Locale, path: string) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// "/id/app/queue" is Indonesian and "/app/queue"; "/login" has no language yet.
export function splitLocale(pathname: string) {
  const [, first = "", ...rest] = pathname.split("/");
  if (!hasLocale(first)) return { locale: null, path: pathname };
  return { locale: first, path: `/${rest.join("/")}` };
}
