import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"
import {
  verifyResponseHash,
  PG_SALT,
} from "@/lib/payment-gateway"
import { sendEmail, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Webhook handler for Payment Gateway
 * According to documentation section 12: Server to Server Call Back (WEB HOOKS)
 * This endpoint receives server-to-server callbacks from the payment gateway
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Get form data from payment gateway webhook
    const formData = await req.formData()

    // Extract all response parameters (according to documentation section 12.1)
    const responseData: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      responseData[key] = value.toString()
    }

    // Extract key parameters for validation
    const transactionId = responseData.transaction_id?.toString()
    const orderId = responseData.order_id?.toString()
    const responseCode = responseData.response_code?.toString() || responseData.responseCode?.toString()
    const responseMessage = responseData.response_message?.toString() || responseData.responseMessage?.toString()
    const amount = responseData.amount?.toString()
    const currency = responseData.currency?.toString()
    const hash = responseData.hash?.toString()
    
    // Support legacy 'status' field
    const legacyStatus = responseData.status?.toString()

    if (!transactionId || !orderId || !amount || !currency) {
      console.error("❌ Missing required parameters in webhook")
      console.error("  - transaction_id:", transactionId ? "✓" : "✗")
      console.error("  - order_id:", orderId ? "✓" : "✗")
      console.error("  - amount:", amount ? "✓" : "✗")
      console.error("  - currency:", currency ? "✓" : "✗")
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify hash using all response fields
    const hashValid = verifyResponseHash(responseData, PG_SALT, hash || "")

    if (!hashValid) {
      console.error("❌ Webhook hash verification failed for order:", orderId)
      return NextResponse.json({ error: "Hash verification failed" }, { status: 400 })
    }

    console.log("✅ Webhook hash verified for order:", orderId)

    // Find payment record
    const payment = await PaymentModel.findOne({ pgOrderId: orderId })
    if (!payment) {
      console.error("❌ Payment record not found for order:", orderId)
      return NextResponse.json({ received: true, warning: "Payment record not found" })
    }

    const registrationId = payment.registrationId

    // Determine payment status:
    // - response_code === "0" or 0 means success (as per documentation)
    // - Also support legacy status field for backward compatibility
    const isSuccess = 
      responseCode === "0" || 
      responseCode === 0 || 
      responseMessage?.toLowerCase().includes("success") ||
      legacyStatus?.toUpperCase() === "SUCCESS" ||
      legacyStatus?.toLowerCase() === "success"

    // Handle payment status
    if (isSuccess) {
      // Check if already processed
      if (payment.status === "success") {
        console.log("ℹ️ Payment already processed:", orderId)
        return NextResponse.json({ received: true, message: "Already processed" })
      }

      // Update payment record
      payment.status = "success"
      payment.pgTransactionId = transactionId
      payment.pgPaymentId = responseData.payment_id?.toString() || transactionId
      payment.pgHash = hash
      // Store additional response data for reference
      if (responseCode) payment.verificationNotes = `Response Code: ${responseCode}, Message: ${responseMessage || "Success"}`
      await payment.save()

      console.log("✅ Payment record updated via webhook:", payment._id, "- Status: success")

      // Update registration
      const registration = await RegistrationModel.findOne({ registrationId })
      if (!registration) {
        console.error("❌ Registration not found:", registrationId)
        return NextResponse.json({ received: true, warning: "Registration not found" })
      }

      // Generate QR code if not exists
      if (!registration.qrCode) {
        const qrDataUrl = await generateTicketQRCode(registrationId)
        registration.qrCode = qrDataUrl
        console.log("✅ QR code generated via webhook for:", registrationId)
      }

      // Update registration with payment success details
      registration.paymentStatus = "success"
      registration.paymentMethod = "payment_gateway" as any
      registration.paymentId = payment._id.toString()
      registration.paymentReference = orderId
      registration.ticketStatus = "active"
      await registration.save()

      console.log("✅ Registration updated via webhook:", registrationId, "- Payment status: success, Ticket status: active")

      // Send ticket email only when payment is fully successful and DB is updated
      try {
        // Get ticket type summary for email
        const ticketTypeSummary = registration.personTickets && registration.personTickets.length > 0
          ? registration.personTickets.map((p: any) => `${p.name}: ${p.tickets?.join(", ") || ""}`).join(" | ")
          : registration.ticketType || registration.ticketTypes?.join(", ") || "Event Ticket"

        const ticketEmailHTML = getTicketEmailTemplate({
          name: registration.name,
          registrationId: registration.registrationId,
          ticketType: ticketTypeSummary,
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

        console.log("✅ Ticket email sent successfully via webhook to:", registration.email, "- Registration ID:", registrationId)
      } catch (emailError) {
        console.error("❌ Failed to send ticket email via webhook:", emailError)
        // Log error but don't fail the payment - payment is already successful
        // Admin can resend email manually if needed
      }
    } else {
      // Payment failed
      payment.status = "failed"
      payment.pgTransactionId = transactionId
      payment.pgHash = hash
      const errorDesc = responseData.error_desc?.toString() || responseData.errorDesc?.toString() || responseMessage || legacyStatus || "Unknown error"
      payment.verificationNotes = `Payment failed: Response Code ${responseCode || "N/A"}, Message: ${errorDesc}`
      await payment.save()

      // Update registration
      await RegistrationModel.findOneAndUpdate(
        { registrationId },
        { paymentStatus: "failed" }
      )

      console.log("❌ Payment marked as failed via webhook:", orderId, "- Response Code:", responseCode, "- Message:", responseMessage || errorDesc)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

