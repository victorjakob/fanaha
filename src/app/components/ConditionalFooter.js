"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/util/supabase/supabaseClient";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [footerContent, setFooterContent] = useState(null);

  useEffect(() => {
    async function fetchFooterContent() {
      const { data } = await supabase
        .from("sections")
        .select("title, description")
        .eq("slug", "footer-cta")
        .eq("is_active", true)
        .single();

      if (data) {
        setFooterContent(data);
      }
    }

    fetchFooterContent();
  }, []);

  // Don't show footer on homepage or manage pages
  if (pathname === "/" || pathname.startsWith("/manage")) {
    return null;
  }

  return <Footer footerContent={footerContent} />;
}
