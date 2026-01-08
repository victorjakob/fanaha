"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PASSWORD = "love";
const COOKIE_NAME = "manage_auth";
const COOKIE_VALUE = "authenticated";

export default function PasswordProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if cookie exists
    const checkAuth = () => {
      const cookies = document.cookie.split(";");
      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${COOKIE_NAME}=`)
      );
      
      if (authCookie && authCookie.includes(COOKIE_VALUE)) {
        setIsAuthenticated(true);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password === PASSWORD) {
      // Set cookie (expires in 10 years - effectively unlimited)
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 10);
      document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; expires=${expires.toUTCString()}; path=/`;
      setIsAuthenticated(true);
      setPassword("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2 text-center">
            Manage Access
          </h1>
          <p className="text-zinc-600 mb-6 text-center">
            Enter password to access manage pages
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-900 text-white py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
