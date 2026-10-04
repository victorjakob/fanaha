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
    if (isBot(body)) return NextResponse.json({ success: true }, { status: 200 });

    const name = clean(body.name, 200);
    const email = clean(body.email, 320);
    const subject = clean(body.subject, 300);
    const message = clean(body.message, 10000);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Save to Supabase
    let saved = false;
    try {
      const supabase = createServerSupabase();
      const { error: dbError } = await supabase
        .from("fanaha_contact_submissions")
        .insert([{ name, email, subject, message }]);
      saved = !dbError;
      if (dbError) console.error("[contact] could not save submission:", dbError.message);
    } catch (e) {
      console.error("[contact] could not save submission:", e?.message);
    }

    // Send email
    let emailed = false;
    if (resend) {
      try {
        const { error } = await resend.emails.send({
          from: "Fanaha Contact Form <contact@fanaha.art>",
          to: "fanahacrea@gmail.com",
          replyTo: email,
          subject: `Contact Form: ${subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              <div style="margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>From:</strong> ${escapeHtml(name)}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p style="margin: 10px 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This email was sent from the Fanaha contact form.
              </p>
            </div>
          `,
        });
        emailed = !error;
        if (error) console.error("[contact] email failed:", error.message);
      } catch (e) {
        console.error("[contact] email failed:", e?.message);
      }
    }

    // Only claim success if the message reached Fanaha one way or another.
    if (!saved && !emailed) {
      return NextResponse.json(
        { error: "Sorry, your message could not be sent. Please email fanahacrea@gmail.com directly." },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[contact] unexpected error:", error?.message);
    return NextResponse.json(
      { error: "Sorry, your message could not be sent. Please email fanahacrea@gmail.com directly." },
      { status: 500 }
    );
  }
}
