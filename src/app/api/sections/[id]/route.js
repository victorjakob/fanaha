import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  // For now, we'll skip auth check
  // Later you can add: await assertAdmin();

  const supabase = createServerSupabase();
  const { id } = await params;
  const patch = await req.json();

  const { data, error } = await supabase
    .from("fanaha_sections")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
