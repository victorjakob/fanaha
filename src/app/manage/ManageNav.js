"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, FileText } from "lucide-react";

export default function ManageNav({ sections }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 shadow-sm z-[60]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-600" />
            <h1 className="text-lg font-bold text-zinc-900">Manage</h1>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {/* Content Tab */}
            <Link
              href="/manage/content"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === "/manage/content"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Content
            </Link>

            {/* Section Tabs */}
            {sections.map((section) => (
              <Link
                key={section.slug}
                href={`/manage/${section.slug}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === `/manage/${section.slug}`
                    ? "bg-green-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {section.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
