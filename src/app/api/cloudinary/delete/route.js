import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// These should be in your .env.local file
const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  // Configuration will fail if variables are missing
  // Individual routes will check and return errors
}

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

export async function POST(req) {
  // For now, we'll skip auth check (as requested by user to remove admin protection)
  // Later you can add: await assertAdmin();

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      {
        error:
          "Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
      },
      { status: 500 }
    );
  }

  // Verify API secret is not truncated or empty
  if (CLOUDINARY_API_SECRET.length < 20) {
    console.error("CLOUDINARY_API_SECRET appears to be invalid (too short)");
    return NextResponse.json(
      {
        error:
          "CLOUDINARY_API_SECRET appears to be invalid. Please check your environment variables.",
      },
      { status: 500 }
    );
  }

  const { public_id } = await req.json();
  if (!public_id) {
    return NextResponse.json({ error: "public_id required" }, { status: 400 });
  }

  try {
    // Ensure Cloudinary is configured before making API call
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    // Add fanaha/bg/ prefix if not already present
    const fullPublicId = public_id.startsWith("fanaha/bg/")
      ? public_id
      : `fanaha/bg/${public_id}`;
    const result = await cloudinary.api.delete_resources([fullPublicId]);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    
    // Provide more helpful error message
    if (error.error?.message === "api_secret mismatch") {
      return NextResponse.json(
        {
          error:
            "Cloudinary API secret mismatch. Please verify CLOUDINARY_API_SECRET matches your Cloudinary account settings.",
          details: "Check that your environment variable CLOUDINARY_API_SECRET is correct and matches the API secret in your Cloudinary dashboard.",
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to delete from Cloudinary" },
      { status: 500 }
    );
  }
}
