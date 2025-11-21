import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel, PaymentModel } from "@/lib/models"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { sendEmail, getPaymentVerifiedEmailTemplate, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Legacy payment verification API - redirects to new unified API
 * Kept for backward compatibility
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = verifyAdminAuth(req)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    await connectDB()

    const { registrationId, status, upiId, transactionId, verificationNotes } = await req.json()

    if (!registrationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["success", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Find registration
    const registration = await RegistrationModel.findOne({ registrationId })
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const action = status === "success" ? "approve" : "reject"

    // Use amount from registration (already calculated with guest/member logic)
    let amount = (registration as any).amount || 0
    
    // Fallback: Calculate if amount is 0 (for old registrations without amount field)
    if (amount === 0 && registration.personTickets && registration.personTickets.length > 0) {
      const TICKET_PRICES: Record<string, number> = {
        Business_Conclave: 1000,
        Chess: 500,
      }
      
      console.log("⚠️ Registration has no amount, calculating from personTickets...")
      registration.personTickets.forEach((person: any) => {
        const { personType, age, tickets } = person
        tickets?.forEach((ticket: string) => {
          const isFreeChild = !registration.isGuest && personType === "child" && age === "<12"
          if (!isFreeChild) {
            amount += TICKET_PRICES[ticket] || 0
          }
        })
      })
      
      // Update registration with calculated amount
      ;(registration as any).amount = amount
      await registration.save()
      console.log("✅ Calculated and saved amount:", amount)
    }
    
    console.log("💰 Payment verification - Amount:", amount, "| Action:", action)

    if (action === "approve") {
      // Create payment record
      const paymentMethod = registration.paymentMethod || "manual"
      
      const paymentData: any = {
        registrationId,
        paymentMethod,
        amount,
        status: "success",
      }

      if (paymentMethod === "manual") {
        paymentData.paymentScreenshotUrl = registration.paymentScreenshotUrl
        paymentData.upiId = upiId || ""
        paymentData.transactionId = transactionId || ""
        paymentData.verifiedBy = authResult.adminEmail || ""
        paymentData.verificationNotes = verificationNotes || ""
      }

      // Check if payment record exists
      let payment = await PaymentModel.findOne({ registrationId })
      if (payment) {
        // Update existing
        Object.assign(payment, paymentData)
        await payment.save()
      } else {
        // Create new
        payment = await PaymentModel.create(paymentData)
      }

      // Update registration
      registration.paymentStatus = "success"
      registration.paymentId = payment._id.toString()
      registration.ticketStatus = "active" // Activate ticket on payment approval

      // Generate QR code if not exists
      if (!registration.qrCode) {
        const qrDataUrl = await generateTicketQRCode(registration.registrationId)
        registration.qrCode = qrDataUrl
      }

      await registration.save()

      // Send payment verification email first
      try {
        const verificationEmailHTML = getPaymentVerifiedEmailTemplate({
          name: registration.name,
          registrationId: registration.registrationId,
          status: "approved",
          ticketType: registration.ticketType,
        })

        await sendEmail({
          to: registration.email,
          subject: `✅ Payment Verified - ${registration.registrationId}`,
          html: verificationEmailHTML,
        })

        console.log("✅ Payment verification email sent to:", registration.email)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
      }

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
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        registration: {
          registrationId: registration.registrationId,
          name: registration.name,
          email: registration.email,
          paymentStatus: registration.paymentStatus,
        },
      })
    } else {
      // Reject payment
      registration.paymentStatus = "failed"
      await registration.save()

      // Update payment record if exists
      const existingPayment = await PaymentModel.findOne({ registrationId })
      if (existingPayment) {
        existingPayment.status = "failed"
        existingPayment.verifiedBy = authResult.adminEmail || ""
        existingPayment.verificationNotes = verificationNotes || "Payment rejected by admin"
        await existingPayment.save()
      }

      // Send rejection email
      try {
        const rejectionEmailHTML = getPaymentVerifiedEmailTemplate({
          name: registration.name,
          registrationId: registration.registrationId,
          status: "rejected",
          reason: verificationNotes || "Payment could not be verified. Please contact support.",
        })

        await sendEmail({
          to: registration.email,
          subject: `❌ Payment Rejected - ${registration.registrationId}`,
          html: rejectionEmailHTML,
        })

        console.log("❌ Rejection email sent to:", registration.email)
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError)
      }

      return NextResponse.json({
        success: true,
        message: "Payment rejected",
        registration: {
          registrationId: registration.registrationId,
          name: registration.name,
          email: registration.email,
          paymentStatus: registration.paymentStatus,
        },
      })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ 
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
