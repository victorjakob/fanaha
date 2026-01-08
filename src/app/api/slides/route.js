import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("fanaha_homepage_slides")
    .select("*")
    .order("sort", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req) {
  // For now, we'll skip auth check
  // Later you can add: await assertAdmin();
  
  const supabase = createServerSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("fanaha_homepage_slides")
    .insert(body)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

