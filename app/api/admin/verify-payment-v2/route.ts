import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel, PaymentModel } from "@/lib/models"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { sendEmail, getPaymentVerifiedEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Unified Payment Verification API
 * Handles both Manual and Razorpay payments
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(req)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const {
      registrationId,
      action, // "approve" | "reject"
      
      // For manual payments - admin fills these during verification
      upiId,
      transactionId,
      verificationNotes,
    } = body

    if (!registrationId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: registrationId, action" },
        { status: 400 }
      )
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    // Find registration
    const registration = await RegistrationModel.findOne({ registrationId })
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    // Check payment method
    const paymentMethod = registration.paymentMethod || "manual"

    if (action === "approve") {
      // Calculate amount based on ticket type
      const ticketPrices = {
        Platinum: 3999,
        Gold: 2999,
        Silver: 1999,
      }
      const amount = ticketPrices[registration.ticketType as keyof typeof ticketPrices] || 1999

      // Create or update payment record
      const paymentData: any = {
        registrationId,
        paymentMethod,
        amount,
        status: "success",
      }

      if (paymentMethod === "manual") {
        // For manual payment, admin provides verification details
        paymentData.paymentScreenshotUrl = registration.paymentScreenshotUrl
        paymentData.upiId = upiId || ""
        paymentData.transactionId = transactionId || ""
        paymentData.verifiedBy = authResult.email
        paymentData.verificationNotes = verificationNotes || ""
      } else if (paymentMethod === "razorpay") {
        // For Razorpay, details already exist from payment webhook
        // Just update status if needed
        const existingPayment = await PaymentModel.findOne({ registrationId })
        if (existingPayment) {
          existingPayment.status = "success"
          existingPayment.verifiedBy = authResult.email
          if (verificationNotes) {
            existingPayment.verificationNotes = verificationNotes
          }
          await existingPayment.save()
          
          // Update registration
          registration.paymentStatus = "success"
          registration.ticketStatus = "active" // Activate ticket on payment approval
          await registration.save()

          // Send confirmation email
          await sendVerificationEmail(registration, "approved")

          return NextResponse.json({
            success: true,
            message: "Payment approved successfully",
            registrationId,
          })
        }
      }

      // Create new payment record (for manual payments)
      const payment = await PaymentModel.create(paymentData)

      // Update registration
      registration.paymentStatus = "success"
      registration.paymentId = payment._id.toString()
      registration.paymentReference = payment._id.toString()
      registration.ticketStatus = "active" // Activate ticket on payment approval

      // Generate QR code if not exists
      if (!registration.qrCode) {
        const qrDataUrl = await generateTicketQRCode(registration.registrationId)
        registration.qrCode = qrDataUrl
      }

      await registration.save()

      // Send confirmation email
      await sendVerificationEmail(registration, "approved")

      return NextResponse.json({
        success: true,
        message: "Payment approved successfully",
        registrationId,
        paymentId: payment._id.toString(),
      })
    } else {
      // Reject payment
      registration.paymentStatus = "failed"
      await registration.save()

      // Update payment record if exists
      const existingPayment = await PaymentModel.findOne({ registrationId })
      if (existingPayment) {
        existingPayment.status = "failed"
        existingPayment.verifiedBy = authResult.email
        existingPayment.verificationNotes = verificationNotes || "Payment rejected by admin"
        await existingPayment.save()
      }

      // Send rejection email
      await sendVerificationEmail(registration, "rejected")

      return NextResponse.json({
        success: true,
        message: "Payment rejected",
        registrationId,
      })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}

/**
 * Send verification email to user
 */
async function sendVerificationEmail(
  registration: any,
  status: "approved" | "rejected"
) {
  try {
    const emailHTML = getPaymentVerifiedEmailTemplate({
      name: registration.name,
      registrationId: registration.registrationId,
      status,
      ticketType: registration.ticketType,
    })

    await sendEmail({
      to: registration.email,
      subject:
        status === "approved"
          ? `Payment Verified - ${registration.registrationId}`
          : `Payment Rejected - ${registration.registrationId}`,
      html: emailHTML,
    })

    console.log(`Verification email sent to: ${registration.email}`)
  } catch (error) {
    console.error("Failed to send verification email:", error)
    // Don't fail the verification if email fails
  }
}
