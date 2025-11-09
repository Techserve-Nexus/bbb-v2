import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"
import { sendEmail, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get("x-admin-email")
    const adminPassword = req.headers.get("x-admin-password")

    if (
      !adminEmail ||
      !adminPassword ||
      adminEmail !== process.env.ADMIN_EMAIL ||
      adminPassword !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { registrationId } = await req.json()

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Get registration
    const registration = await RegistrationModel.findOne({ registrationId })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Check if payment is verified
    if (registration.paymentStatus !== "success") {
      return NextResponse.json(
        { error: "Payment not verified yet" },
        { status: 400 }
      )
    }

    // Generate QR code with ticket verification URL
    let qrCodeUrl = registration.qrCode
    if (!qrCodeUrl) {
      try {
        console.log("Generating ticket QR code for:", registrationId)
        qrCodeUrl = await generateTicketQRCode(registrationId)
        // Save QR code to registration
        registration.qrCode = qrCodeUrl
        await registration.save()
        console.log("QR code generated and saved successfully")
      } catch (error) {
        console.error("Failed to generate QR code:", error)
        // Continue even if QR fails - email can still be sent
      }
    }

    // Send ticket email
    try {
      const emailHTML = getTicketEmailTemplate({
        name: registration.name,
        registrationId: registration.registrationId,
        ticketType: registration.ticketType,
        qrCodeUrl,
      })

      // Convert data URL to buffer for inline attachment
      const qrCodeBuffer = qrCodeUrl ? Buffer.from(qrCodeUrl.split(',')[1], 'base64') : null

      await sendEmail({
        to: registration.email,
        subject: `Your Event Ticket - ${registrationId}`,
        html: emailHTML,
        attachments: qrCodeBuffer ? [{
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode', // This matches the cid in the HTML template
          contentType: 'image/png'
        }] : []
      })

      console.log("Ticket email sent to:", registration.email)

      return NextResponse.json({
        success: true,
        message: "Ticket email sent successfully",
        sentTo: registration.email,
      })
    } catch (emailError) {
      console.error("Failed to send ticket email:", emailError)
      return NextResponse.json({ error: "Failed to send ticket email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending ticket:", error)
    return NextResponse.json({ error: "Failed to send ticket" }, { status: 500 })
  }
}
