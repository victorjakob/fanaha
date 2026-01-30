import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = createServerSupabase();
    const { error: dbError } = await supabase
      .from("fanaha_contact_submissions")
      .insert([
        {
          name,
          email,
          subject,
          message,
        },
      ]);

    if (dbError) {
      // Continue with email even if DB save fails
    }

    // Send email
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: "Fanaha Contact Form <onboarding@resend.dev>",
          to: "fanahacrea@gmail.com",
          replyTo: email,
          subject: `Contact Form: ${subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              <div style="margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This email was sent from the Fanaha contact form.
              </p>
            </div>
          `,
        });

        if (error) {
          // Continue even if email fails - submission is saved in DB
        }
      } catch (emailError) {
        // Continue even if email fails - submission is saved in DB
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
