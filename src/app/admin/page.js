"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import { Settings, FileImage } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  if (status === "loading") {
    return <div className="text-zinc-400">Loading...</div>;
  }

  if (status === "authenticated") {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <div className="bg-zinc-900 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Admin Dashboard
          </h1>
          <p className="mb-6 text-zinc-300 text-center">
            Welcome, <span className="font-semibold">{session.user.email}</span>
            !
          </p>

          <div className="space-y-3 mb-6">
            <Link
              href="/manage"
              className="flex items-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded transition"
            >
              <Settings className="w-5 h-5" />
              <span>Manage Alchemy Pieces</span>
            </Link>

            <Link
              href="/alchemy"
              className="flex items-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition"
            >
              <FileImage className="w-5 h-5" />
              <span>View Gallery</span>
            </Link>
          </div>

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded transition"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  // While redirecting
  return null;
}
