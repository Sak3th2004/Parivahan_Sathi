"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "en" | "hi";
type FontScale = "sm" | "md" | "lg";

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;
  t: (en: string, hi: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const SCALE_CLASS: Record<FontScale, string> = {
  sm: "text-[14px]",
  md: "text-[16px]",
  lg: "text-[18px]",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [fontScale, setFontScale] = useState<FontScale>("md");

  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang((p) => (p === "en" ? "hi" : "en")),
      fontScale,
      setFontScale,
      t: (en, hi) => (lang === "hi" ? hi : en),
    }),
    [lang, fontScale]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div className={SCALE_CLASS[fontScale]}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
