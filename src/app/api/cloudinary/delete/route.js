import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// These should be in your .env.local file
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "dy8q4hf0k";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  // For now, we'll skip auth check (as requested by user to remove admin protection)
  // Later you can add: await assertAdmin();

  const { public_id } = await req.json();
  if (!public_id) {
    return NextResponse.json({ error: "public_id required" }, { status: 400 });
  }

  try {
    // Add fanaha/bg/ prefix if not already present
    const fullPublicId = public_id.startsWith("fanaha/bg/")
      ? public_id
      : `fanaha/bg/${public_id}`;
    const result = await cloudinary.api.delete_resources([fullPublicId]);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
