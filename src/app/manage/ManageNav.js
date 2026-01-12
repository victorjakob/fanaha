"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, FileText, Image, Menu, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ManageNav({ sections }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingItem, setLoadingItem] = useState(null);
  const [targetPath, setTargetPath] = useState(null);

  // Clear loading state when we reach the target path
  useEffect(() => {
    if (loadingItem && targetPath && pathname === targetPath) {
      const timer = setTimeout(() => {
        setLoadingItem(null);
        setTargetPath(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, loadingItem, targetPath]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = async (href, itemLabel) => {
    if (loadingItem) return; // Prevent multiple clicks

    setLoadingItem(itemLabel);
    setTargetPath(href);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation

    try {
      await router.push(href);
      // Loading state will be cleared by useEffect when pathname matches targetPath
    } catch (error) {
      console.error("Navigation error:", error);
      setLoadingItem(null); // Clear on error
      setTargetPath(null);
    }
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
    ...sections
      .filter((section) => section.slug !== "footer-cta")
      .map((section) => ({
        href: `/manage/${section.slug}`,
        label: section.name,
        icon: null,
        isActive: pathname === `/manage/${section.slug}`,
        color: "green",
      })),
  ];

  const getItemClasses = (item) => {
    const baseClasses =
      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 relative overflow-hidden";
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
    const loadingClasses =
      loadingItem === item.label ? "opacity-70 cursor-wait" : "";
    return `${baseClasses} ${colorClasses[item.color]} ${loadingClasses}`;
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 bg-transparent md:bg-white md:shadow-sm z-[60]"
        style={{ fontFamily: "Nunito, sans-serif", fontWeight: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="hidden md:flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-600" />
              <h1 className="text-lg font-bold text-zinc-900">Manage</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href, item.label)}
                  className={getItemClasses(item)}
                  disabled={loadingItem === item.label}
                >
                  {/* Shimmer effect for loading */}
                  {loadingItem === item.label && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  )}

                  {/* Content */}
                  <div className="flex items-center gap-2 relative z-10">
                    {loadingItem === item.label ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      item.icon && <item.icon className="w-4 h-4" />
                    )}
                    {item.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile Menu Button - Always on the right */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors mt-2 mr-2 shadow-md ml-auto"
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
        style={{ fontFamily: "Nunito, sans-serif", fontWeight: 100 }}
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

        <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href, item.label)}
              className={getItemClasses(item)}
              disabled={loadingItem === item.label}
            >
              {/* Shimmer effect for loading */}
              {loadingItem === item.label && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}

              {/* Content */}
              <div className="flex items-center gap-2 relative z-10">
                {loadingItem === item.label ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  item.icon && <item.icon className="w-4 h-4" />
                )}
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
