"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/util/supabase/supabaseClient";
import Footer from "./Footer";
import { useLocale } from "next-intl";
import { pickLocalizedText } from "@/lib/db-i18n";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [footerContent, setFooterContent] = useState(null);
  const locale = useLocale();

  useEffect(() => {
    async function fetchFooterContent() {
      const { data } = await supabase
        .from("fanaha_sections")
        .select("*")
        .eq("slug", "footer-cta")
        .eq("is_active", true)
        .single();

      if (data) {
        setFooterContent({
          ...data,
          title: pickLocalizedText(data, "title", locale),
          description: pickLocalizedText(data, "description", locale),
        });
      }
    }

    fetchFooterContent();
  }, [locale]);

  // Don't show footer on homepage or manage pages
  if (
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/fr" ||
    pathname.startsWith("/manage")
  ) {
    return null;
  }

  return <Footer footerContent={footerContent} />;
}
