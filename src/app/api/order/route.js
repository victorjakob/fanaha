import { NextResponse } from "next/server";

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

    // Email content
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

    // For now, we'll use a simple console log
    // In production, you'd integrate with an email service like:
    // - Resend (resend.com)
    // - SendGrid
    // - Nodemailer with your SMTP
    // - Vercel's built-in email service

    console.log("=== NEW ORDER REQUEST ===");
    console.log(emailContent);
    console.log("========================");

    // TODO: Replace with actual email sending
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'your@domain.com',
    //   to: 'your-email@domain.com',
    //   subject: `New Order Request: ${artPieceName}`,
    //   text: emailContent,
    // });

    return NextResponse.json(
      { success: true, message: "Order request sent successfully" },
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
