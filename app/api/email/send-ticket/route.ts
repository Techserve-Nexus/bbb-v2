import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { sendViasendGrid } from "@/lib/email-service" // used for SendGrid path
import { sendEmail } from "@/lib/email" // SMTP sending (nodemailer)
import mongoose from "mongoose"

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "sendgrid" // or 'ses'
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const SES_REGION = process.env.AWS_SES_REGION || "us-east-1"

// Email Log Schema
const EmailLogSchema = new mongoose.Schema({
  registrationId: { type: String, required: true },
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
})

const EmailLogModel = mongoose.models.EmailLog || mongoose.model("EmailLog", EmailLogSchema)

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { to, registrationId, name, ticketType, paymentRef, qrCodeUrl } = await req.json()

    if (!to || !registrationId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate HTML email
    const { generateTicketEmailHTML } = await import("@/lib/email-service")
    const htmlContent = generateTicketEmailHTML({
      to,
      registrationId,
      name,
      ticketType,
      paymentRef,
      qrCodeUrl,
    })

    // Send via configured email service
    if (EMAIL_SERVICE === "sendgrid") {
      if (!SENDGRID_API_KEY) {
        console.error("SendGrid selected but SENDGRID_API_KEY is not set")
        return NextResponse.json({ error: "SendGrid not configured on server" }, { status: 500 })
      }

      await sendViasendGrid(to, registrationId, name, htmlContent)
    } else if (EMAIL_SERVICE === "smtp") {
      // Send using the server-side SMTP transporter implemented in lib/email
      try {
        await sendEmail({
          to,
          subject: `Your Chaturanga Manthana Ticket - ${registrationId}`,
          html: htmlContent,
        })
      } catch (err) {
        console.error("SMTP send failed:", err)

        // Fallback to SendGrid if configured (helps on hosts that block outbound SMTP)
        if (process.env.SENDGRID_API_KEY) {
          console.log("Attempting fallback to SendGrid since SMTP failed and SENDGRID_API_KEY is present")
          try {
            await sendViasendGrid(to, registrationId, name, htmlContent)
          } catch (sgErr) {
            console.error("Fallback SendGrid send failed:", sgErr)
            return NextResponse.json({ error: "SMTP and SendGrid both failed" }, { status: 500 })
          }
        } else {
          return NextResponse.json({ error: "SMTP send failed and no SendGrid key configured" }, { status: 500 })
        }
      }
    } else {
      // Fallback to console log for development
      console.log("Email would be sent to:", to)
      console.log("Content:", htmlContent)
    }

    // Log email in database
    await EmailLogModel.create({
      registrationId,
      recipient: to,
      subject: "Your Chaturanga Manthana Ticket",
      status: "sent",
      sentAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Ticket email sent successfully",
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

// async function sendViasendGrid(
//   to: string,
//   registrationId: string,
//   name: string,
//   htmlContent: string
// ) {
//   const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       personalizations: [
//         {
//           to: [{ email: to }],
//           subject: `Your Chaturanga Manthana Ticket - ${registrationId}`,
//         },
//       ],
//       from: {
//         email: process.env.SENDGRID_FROM_EMAIL || 'noreply@chessevent.com',
//         name: 'Chaturanga Manthana 2025',
//       },
//       content: [
//         {
//           type: 'text/html',
//           value: htmlContent,
//         },
//       ],
//     }),
//   });

//   if (!response.ok) {
//     throw new Error('SendGrid API error');
//   }
// }
