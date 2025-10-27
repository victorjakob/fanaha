"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, FileText, Image, Menu, X } from "lucide-react";
import { useState } from "react";

export default function ManageNav({ sections }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      href: "/manage/content",
      label: "Content",
      icon: FileText,
      isActive: pathname === "/manage/content",
      color: "blue",
    },
    {
      href: "/manage/homepage-slides",
      label: "Homepage Slides",
      icon: Image,
      isActive: pathname === "/manage/homepage-slides",
      color: "purple",
    },
    ...sections.map((section) => ({
      href: `/manage/${section.slug}`,
      label: section.name,
      icon: null,
      isActive: pathname === `/manage/${section.slug}`,
      color: "green",
    })),
  ];

  const getItemClasses = (item) => {
    const baseClasses =
      "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2";
    const colorClasses = {
      blue: item.isActive
        ? "bg-blue-600 text-white"
        : "text-zinc-600 hover:bg-zinc-100",
      purple: item.isActive
        ? "bg-purple-600 text-white"
        : "text-zinc-600 hover:bg-zinc-100",
      green: item.isActive
        ? "bg-green-600 text-white"
        : "text-zinc-600 hover:bg-zinc-100",
    };
    return `${baseClasses} ${colorClasses[item.color]}`;
  };

  return (
    <>
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getItemClasses(item)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[70] md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-[80] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">Navigation</h2>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={getItemClasses(item)}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
