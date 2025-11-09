import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"
import { sendEmail, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * POST /api/admin/registrations/[id]/resend
 * 
 * Resend ticket email with QR code
 * Requires admin authentication
 * 
 * @param id - Registration ID (registrationId, not MongoDB _id)
 * @returns Success message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    // Find registration
    const registration = await RegistrationModel.findOne({ registrationId: id })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      )
    }

    // Check if payment is successful
    if (registration.paymentStatus !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot resend email for unpaid registration",
        },
        { status: 400 }
      )
    }

    // Generate QR code if not exists
    let qrCodeUrl = (registration as any).qrCode
    if (!qrCodeUrl) {
      try {
        console.log("Generating ticket QR code for:", id)
        qrCodeUrl = await generateTicketQRCode(registration.registrationId)
        // Save QR code to registration
        ;(registration as any).qrCode = qrCodeUrl
        await registration.save()
        console.log("QR code generated and saved successfully")
      } catch (error) {
        console.error("Failed to generate QR code:", error)
        // Continue even if QR fails - email can still be sent
      }
    }

    // Resend ticket email with QR code
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
        subject: `Your Event Ticket - ${registration.registrationId}`,
        html: emailHTML,
        attachments: qrCodeBuffer ? [{
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode', // This matches the cid in the HTML template
          contentType: 'image/png'
        }] : []
      })

      console.log(`📧 Ticket email resent for registration ${id} by admin`)

      return NextResponse.json({
        success: true,
        message: "Ticket email resent successfully",
      })
    } catch (emailError) {
      console.error("❌ Error sending ticket email:", emailError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send ticket email. Please try again.",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Error resending email:", error)
    return NextResponse.json(
      { success: false, error: "Failed to resend email" },
      { status: 500 }
    )
  }
}
