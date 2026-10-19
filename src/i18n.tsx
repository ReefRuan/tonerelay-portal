// SPDX-FileCopyrightText: 2026 Reef Ruan
// SPDX-License-Identifier: AGPL-3.0-only

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "zh" | "en";
type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (chinese: string, english: string) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "zh",
  setLanguage: () => {},
  t: (chinese) => chinese,
});

function languageFromUrl(): Language {
  return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "zh";
}

/** Chinese is always the default; English is an explicit, shareable URL choice. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(languageFromUrl);
  const setLanguage = useCallback((next: Language) => {
    const url = new URL(window.location.href);
    if (next === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState({}, "", url);
    updateLanguage(next);
  }, []);

  useEffect(() => {
    const update = () => updateLanguage(languageFromUrl());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", language === "en" ? "en_US" : "zh_CN");
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(canonical.href);
      if (language === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      canonical.href = url.href;
      document.querySelector('meta[property="og:url"]')?.setAttribute("content", url.href);
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (chinese, english) => language === "en" ? english : chinese,
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();
  return <div className={`language-switch ${className}`} role="group" aria-label={t("语言", "Language")}>
    <button type="button" lang="zh-CN" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
  </div>;
}
