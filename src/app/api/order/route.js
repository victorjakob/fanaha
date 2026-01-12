import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, message, artPieceName } = await request.json();

    // Validate required fields
    if (!name || !email || !artPieceName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = createServerSupabase();
    const { data: order, error: dbError } = await supabase
      .from("fanaha_orders")
      .insert([
        {
          name,
          email,
          art_piece_name: artPieceName,
          message: message || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Error saving order to Supabase:", dbError);
      // Continue with email even if DB save fails
    }

    // Send email notification
    if (resend) {
      try {
        const emailContent = `
New Art Piece Order Request

Art Piece: ${artPieceName}
Customer Name: ${name}
Customer Email: ${email}

Message:
${message || "No additional message provided."}

---
This order request was submitted from your website.
        `;

        await resend.emails.send({
          from: "Fanaha Order Form <onboarding@resend.dev>",
          to: "fanahacrea@gmail.com",
          replyTo: email,
          subject: `New Order Request: ${artPieceName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #9333ea; padding-bottom: 10px;">
                New Commission Request
              </h2>
              <div style="margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Art Piece:</strong> ${artPieceName}</p>
                <p style="margin: 10px 0;"><strong>Customer Name:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; white-space: pre-wrap;">${message || "No additional message provided."}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This order request was submitted from the Fanaha website.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Continue even if email fails - order is saved in DB
      }
    }

    return NextResponse.json(
      { success: true, message: "Order request submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Failed to process order request" },
      { status: 500 }
    );
  }
}
