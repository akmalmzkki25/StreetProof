"use client";

import {
  createContext,
  Suspense,
  use,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { translate, type Locale, type Params } from "./translate";

const LocaleContext = createContext<Promise<Locale>>(Promise.resolve("en"));

// The root layout hands over the locale as a promise it never awaits, so the
// layout stays static. A component that reads it must sit inside a <Suspense>.
export function LocaleProvider({
  localePromise,
  children,
}: {
  localePromise: Promise<Locale>;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={localePromise}>
      {children}
      <Suspense fallback={null}>
        <HtmlLang />
      </Suspense>
    </LocaleContext.Provider>
  );
}

// The inline script in the root layout sets <html lang> for the first paint;
// this keeps it right after someone switches language without a reload.
function HtmlLang() {
  const locale = use(useContext(LocaleContext));
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export function useI18n() {
  const locale = use(useContext(LocaleContext));
  return useMemo(
    () => ({
      locale,
      t: (text: string, params?: Params) => translate(locale, text, params),
    }),
    [locale],
  );
}
