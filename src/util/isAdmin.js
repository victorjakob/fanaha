// isAdmin.js
// Utility to check if the user is logged in as admin

import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * React hook to check if the current user is the admin (logged in)
 * Usage: const isAdmin = useIsAdmin();
 */
export function useIsAdmin() {
  const { data: session, status } = useSession();
  // You can add more checks here if you want to restrict to a specific email
  return (
    status === "authenticated" &&
    session?.user?.email === "viggijakob@gmail.com"
  );
}

/**
 * Server-side helper to check if the current user is the admin (logged in)
 * Usage: const isAdmin = await isAdminServer();
 * Pass req, res if in API route, or nothing in server components (Next 13+)
 */
export async function isAdminServer(...args) {
  const session = await getServerSession(...args, authOptions);
  return session?.user?.email === "viggijakob@gmail.com";
}
