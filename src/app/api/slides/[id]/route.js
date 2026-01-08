import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { v2 as cloudinary } from "cloudinary";

const supabase = createServerSupabase();

// Configure Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dy8q4hf0k";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function PATCH(req, { params }) {
  // For now, we'll skip auth check
  // Later you can add: await assertAdmin();

  const { id } = await params;
  const patch = await req.json();

  const { data, error } = await supabase
    .from("fanaha_homepage_slides")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req, { params }) {
  // For now, we'll skip auth check
  // Later you can add: await assertAdmin();

  const { id } = await params;

  // Optional: also delete from Cloudinary if you store public_id
  const { data: row } = await supabase
    .from("fanaha_homepage_slides")
    .select("public_id")
    .eq("id", id)
    .single();

  if (row?.public_id) {
    try {
      // Add fanaha/bg/ prefix if not already present
      const fullPublicId = row.public_id.startsWith("fanaha/bg/")
        ? row.public_id
        : `fanaha/bg/${row.public_id}`;
      await cloudinary.api.delete_resources([fullPublicId]);
    } catch (error) {
      console.error("Failed to delete from Cloudinary:", error);
      // Continue with Supabase deletion even if Cloudinary fails
    }
  }

  const { error } = await supabase
    .from("fanaha_homepage_slides")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
