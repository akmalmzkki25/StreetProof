"use client";

import { createContext, useContext, useMemo } from "react";

import { translate, type Locale, type Params } from "./translate";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return useMemo(
    () => ({
      locale,
      t: (text: string, params?: Params) => translate(locale, text, params),
    }),
    [locale],
  );
}
