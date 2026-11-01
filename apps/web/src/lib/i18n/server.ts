import { lang } from "next/root-params";
import { notFound } from "next/navigation";

import { hasLocale, translate, type Params } from "./translate";

// The language is part of the address, so it is known before the request and a
// page can be built ahead of time for each one. Server Components only: actions
// and route handlers can't read it.
export async function getLocale() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: (text: string, params?: Params) => translate(locale, text, params),
  };
}
