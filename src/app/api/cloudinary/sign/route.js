import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  // For now, we'll skip auth check (as requested by user to remove admin protection)
  // TODO: Add rate limiting in production
  // Later you can add: await assertAdmin();

  // These should be in your .env.local file
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: "CLOUDINARY_CLOUD_NAME is not configured. Please set it in your environment variables." },
      { status: 500 }
    );
  }
  if (!CLOUDINARY_API_KEY) {
    return NextResponse.json(
      { error: "CLOUDINARY_API_KEY is not configured. Please set it in your environment variables." },
      { status: 500 }
    );
  }
  if (!CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { error: "CLOUDINARY_API_SECRET is not configured. Please set it in your environment variables." },
      { status: 500 }
    );
  }

  // Get folder from request body
  const { folder: requestedFolder } = await req.json();

  // Whitelist folder - only allow fanaha/bg
  const allowedFolder = "fanaha/bg";
  if (requestedFolder && requestedFolder !== allowedFolder) {
    return NextResponse.json(
      { error: "Invalid folder. Only 'fanaha/bg' is allowed." },
      { status: 400 }
    );
  }

  const folder = allowedFolder;

  const timestamp = Math.floor(Date.now() / 1000);

  // Build the parameter string manually to ensure correct format for Cloudinary
  const params = {
    folder,
    timestamp: String(timestamp),
  };

  // Cloudinary expects the signature to match what will be sent in the form
  // We need to build the string the same way it will be sent
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + CLOUDINARY_API_SECRET)
    .digest("hex");

  return NextResponse.json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  });
}
