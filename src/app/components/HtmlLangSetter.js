"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

export default function HtmlLangSetter() {
  const locale = useLocale();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!locale) return;
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
