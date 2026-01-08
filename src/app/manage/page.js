"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Image, Loader2 } from "lucide-react";
import { supabase } from "@/util/supabase/supabaseClient";

export default function ManagePage() {
  const [sections, setSections] = useState([]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clickedLink, setClickedLink] = useState(null);

  useEffect(() => {
    async function fetchSections() {
      const { data } = await supabase
        .from("fanaha_sections")
        .select("*")
        .order("display_order", { ascending: true });
      setSections(data || []);
    }
    fetchSections();
  }, []);

  const mainItems = [
    {
      href: "/manage/content",
      label: "Content",
      icon: FileText,
    },
    {
      href: "/manage/homepage-slides",
      label: "Homepage Slides",
      icon: Image,
    },
  ];

  const sectionItems =
    sections
      ?.filter((section) => section.slug !== "footer-cta")
      .map((section) => ({
        href: `/manage/${section.slug}`,
        label: section.name,
      })) || [];

  const handleClick = (href, e) => {
    e.preventDefault();
    setClickedLink(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-32">
      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-zinc-600" />
            <p
              className="text-lg font-light text-zinc-700"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Loading...
            </p>
          </div>
        </div>
      )}

      {/* Main items side by side */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleClick(item.href, e)}
            className="group block bg-white/50 backdrop-blur-sm border border-zinc-200 rounded-xl p-6 transition-all duration-300 hover:bg-white hover:border-zinc-300 hover:shadow-sm relative overflow-hidden"
          >
            {clickedLink === item.href && isPending && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              </div>
              <h3
                className="text-lg font-light text-zinc-900 group-hover:text-zinc-950 transition-colors"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {item.label}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Section items - compact list */}
      {sectionItems.length > 0 && (
        <div className="space-y-1">
          {sectionItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(item.href, e)}
              className="group block bg-white/30 backdrop-blur-sm border border-zinc-150 rounded-xl px-4 py-2.5 transition-all duration-300 hover:bg-white/50 hover:border-zinc-200 relative overflow-hidden"
            >
              {clickedLink === item.href && isPending && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3
                  className="text-sm font-light text-zinc-700 group-hover:text-zinc-900 transition-colors"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  {item.label}
                </h3>
                <div className="text-zinc-300 group-hover:text-zinc-400 transition-colors">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
