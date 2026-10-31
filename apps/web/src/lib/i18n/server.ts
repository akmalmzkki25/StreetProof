import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  chooseLocale,
  LOCALE_COOKIE,
  translate,
  type Params,
} from "./translate";

export const getLocale = cache(async function getLocale() {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);
  return chooseLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    requestHeaders.get("accept-language"),
  );
});

export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: (text: string, params?: Params) => translate(locale, text, params),
  };
}
