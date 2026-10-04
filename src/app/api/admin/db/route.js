import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// The query-builder steps the manage pages use. Anything else is refused.
const ALLOWED = new Set([
  "select", "insert", "update", "upsert", "delete",
  "eq", "neq", "in", "is", "gt", "gte", "lt", "lte", "like", "ilike", "match", "not", "or", "filter",
  "order", "limit", "range", "single", "maybeSingle",
]);
const FIRST = new Set(["select", "insert", "update", "upsert", "delete"]);

/**
 * Runs a database query for the signed-in admin with the server key.
 * Body: { table: "fanaha_…", steps: [[method, ...args], …] } — recorded by util/supabase/adminClient.js.
 */
export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { table, steps } = await request.json().catch(() => ({}));
  if (typeof table !== "string" || !/^fanaha_[a-z_]+$/.test(table)) {
    return NextResponse.json({ data: null, error: { message: "Unknown table" } }, { status: 400 });
  }
  if (!Array.isArray(steps) || !steps.length || !FIRST.has(steps[0]?.[0]) || steps.some((s) => !Array.isArray(s) || !ALLOWED.has(s[0]))) {
    return NextResponse.json({ data: null, error: { message: "Unsupported query" } }, { status: 400 });
  }

  let query = createServerSupabase().from(table);
  for (const [method, ...args] of steps) query = query[method](...args);
  const { data, error, count, status } = await query;
  return NextResponse.json({
    data: data ?? null,
    error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null,
    count: count ?? null,
    status,
  });
}
