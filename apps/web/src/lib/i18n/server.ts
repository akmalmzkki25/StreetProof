import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import {
  chooseLocale,
  LOCALE_COOKIE,
  translate,
  type Params,
} from "./translate";

export const getLocale = cache(async function getLocale() {
  const cookieStore = await cookies();
  return chooseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
});

export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: (text: string, params?: Params) => translate(locale, text, params),
  };
}
