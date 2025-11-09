import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"
import { sendEmail, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 })
    }

    // Verify signature
    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest("hex")

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ Signature mismatch:", { expected: expectedSignature, received: razorpaySignature })
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 })
    }

    console.log("✅ Payment signature verified for order:", razorpayOrderId)

    // Find and update payment record
    let payment = await PaymentModel.findOne({ razorpayOrderId })
    
    if (!payment) {
      console.error("❌ Payment record not found for order:", razorpayOrderId)
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Update payment with success status and payment details
    payment.status = "success"
    payment.razorpayPaymentId = razorpayPaymentId
    payment.razorpaySignature = razorpaySignature
    await payment.save()

    console.log("✅ Payment record updated:", payment._id, "- Status: success")

    const registrationId = payment.registrationId

    // Update registration payment status
    const registration = await RegistrationModel.findOne({ registrationId })
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Generate QR code if not exists
    if (!registration.qrCode) {
      const qrDataUrl = await generateTicketQRCode(registrationId)
      registration.qrCode = qrDataUrl
      console.log("✅ QR code generated for:", registrationId)
    }

    // Update registration
    registration.paymentStatus = "success"
    registration.paymentMethod = "razorpay" // Set payment method
    registration.paymentId = payment._id.toString()
    registration.paymentReference = razorpayOrderId
    registration.ticketStatus = "active" // Activate ticket on payment success
    await registration.save()

    console.log("✅ Registration updated:", registrationId, "- Payment status: success, Method: razorpay")

    // Send ticket email with QR code
    try {
      const ticketEmailHTML = getTicketEmailTemplate({
        name: registration.name,
        registrationId: registration.registrationId,
        ticketType: registration.ticketType,
        qrCodeUrl: registration.qrCode,
      })

      await sendEmail({
        to: registration.email,
        subject: `🎟️ Your Event Ticket - ${registration.registrationId}`,
        html: ticketEmailHTML,
        attachments: registration.qrCode
          ? [
              {
                filename: "ticket-qr-code.png",
                content: registration.qrCode.split(",")[1],
                encoding: "base64",
                cid: "qrcode",
              },
            ]
          : [],
      })

      console.log("🎟️ Ticket email sent to:", registration.email)
    } catch (emailError) {
      console.error("Failed to send ticket email:", emailError)
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      registrationId,
      ticketUrl: `/ticket/${registrationId}`,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ 
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
