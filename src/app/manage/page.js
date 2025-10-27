import { createServerSupabase } from "@/util/supabase/server";
import Link from "next/link";
import { FileText, Image, Settings } from "lucide-react";

export default async function ManagePage() {
  const supabase = createServerSupabase();
  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .order("display_order", { ascending: true });

  const dashboardItems = [
    {
      href: "/manage/content",
      label: "Content",
      icon: FileText,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
    {
      href: "/manage/homepage-slides",
      label: "Homepage Slides",
      icon: Image,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
    },
    ...(sections?.map((section) => ({
      href: `/manage/${section.slug}`,
      label: section.name,
      icon: null,
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
    })) || []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-8 sm:mb-12 text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Settings className="w-6 h-6 sm:w-10 sm:h-10 text-zinc-600" />
          <h1
            className="text-2xl sm:text-4xl font-bold text-zinc-900"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Manage Dashboard
          </h1>
        </div>
        <p
          className="text-sm sm:text-lg text-zinc-600"
          style={{ fontFamily: "Nunito, sans-serif", fontWeight: 100 }}
        >
          Select a section to manage content
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {dashboardItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
          >
            <div className={`${item.color} h-2`} />
            <div className="p-4 sm:p-6 md:p-8">
              {item.icon && (
                <div className="mb-3 sm:mb-4 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 transition-colors">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                </div>
              )}
              {!item.icon && (
                <div className="mb-3 sm:mb-4 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-zinc-100 text-zinc-200 group-hover:bg-zinc-200 transition-colors">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-zinc-400" />
                </div>
              )}
              <h3
                className="text-lg sm:text-xl font-bold text-zinc-900 mb-1 sm:mb-2"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {item.label}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
                Manage & edit →
              </p>
            </div>
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
