"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { LOCALE_COOKIE, LOCALES } from "./translate";

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export async function setLocaleAction(formData: FormData) {
  const locale = LOCALES.find((item) => item === formData.get("locale"));
  if (!locale) return;
  const cookieStore = await cookies();
  // Readable by the script in the root layout that sets <html lang>. A language
  // choice isn't a secret.
  cookieStore.set(LOCALE_COOKIE, locale, {
    sameSite: "lax",
    secure: process.env.APP_URL?.startsWith("https://") ?? false,
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  revalidatePath("/", "layout");
}
