import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { clean, escapeHtml, isBot, isEmail } from "@/lib/form-guard";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    // Spam bots fill the hidden field: pretend it worked, store nothing.
    if (isBot(body)) {
      return NextResponse.json({ success: true, message: "Order request submitted successfully" }, { status: 200 });
    }

    const name = clean(body.name, 200);
    const email = clean(body.email, 320);
    const artPieceName = clean(body.artPieceName, 500);
    const message = clean(body.message, 10000);

    // Validate required fields
    if (!name || !email || !artPieceName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Save to Supabase
    let saved = false;
    try {
      const supabase = createServerSupabase();
      const { error: dbError } = await supabase
        .from("fanaha_orders")
        .insert([{ name, email, art_piece_name: artPieceName, message: message || null, status: "pending" }]);
      saved = !dbError;
      if (dbError) console.error("[order] could not save order:", dbError.message);
    } catch (e) {
      console.error("[order] could not save order:", e?.message);
    }

    // Send email notification
    let emailed = false;
    if (resend) {
      try {
        const { error } = await resend.emails.send({
          from: "Fanaha Order Form <orders@fanaha.art>",
          to: "fanahacrea@gmail.com",
          replyTo: email,
          subject: `New Order Request: ${artPieceName}`,
          text: `New Art Piece Order Request

Art Piece: ${artPieceName}
Customer Name: ${name}
Customer Email: ${email}

Message:
${message || "No additional message provided."}

---
This order request was submitted from your website.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">
                New Commission Request
              </h2>
              <div style="margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Art Piece:</strong> ${escapeHtml(artPieceName)}</p>
                <p style="margin: 10px 0;"><strong>Customer Name:</strong> ${escapeHtml(name)}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message || "No additional message provided.")}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This order request was submitted from the Fanaha website.
              </p>
            </div>
          `,
        });
        emailed = !error;
        if (error) console.error("[order] email failed:", error.message);
      } catch (e) {
        console.error("[order] email failed:", e?.message);
      }
    }

    // Only claim success if the request reached Fanaha one way or another.
    if (!saved && !emailed) {
      return NextResponse.json(
        { error: "Sorry, your request could not be sent. Please email fanahacrea@gmail.com directly." },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: "Order request submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[order] unexpected error:", error?.message);
    return NextResponse.json(
      { error: "Sorry, your request could not be sent. Please email fanahacrea@gmail.com directly." },
      { status: 500 }
    );
  }
}
