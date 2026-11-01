import { LOCALES, type Locale } from "@/lib/i18n/translate";

// One cookie per language, each scoped to that language's status address, so
// the status page stays readable after a language switch and no other page
// ever receives it. A request to /en/status only carries the English one.
export function receiptCookieName(locale: Locale) {
  return `streetproof_receipt_${locale}`;
}

export function readReceipt(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  for (const locale of LOCALES) {
    const token = cookieStore.get(receiptCookieName(locale))?.value;
    if (token) return token;
  }
  return undefined;
}
