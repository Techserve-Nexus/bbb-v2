import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"
import { sendEmail, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const webhookBody = await req.text()
    const razorpaySignature = req.headers.get("x-razorpay-signature")

    if (!razorpaySignature) {
      console.error("❌ No signature in webhook request")
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
    }

    // Use webhook secret if available, otherwise use key secret
    const secret = RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error("❌ No webhook secret configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Verify webhook signature
    const expectedSignature = createHmac("sha256", secret)
      .update(webhookBody)
      .digest("hex")

    if (expectedSignature !== razorpaySignature) {
      console.error("❌ Webhook signature mismatch")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(webhookBody)
    console.log("📨 Webhook received:", event.event, "- Entity:", event.payload?.payment?.entity?.id || event.payload?.order?.entity?.id)

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
      case "payment.authorized": {
        const paymentEntity = event.payload.payment.entity
        const { order_id: orderId, id: paymentId, status } = paymentEntity

        console.log("💰 Payment event:", event.event, "- Order:", orderId, "- Payment:", paymentId, "- Status:", status)

        // Find and update payment record
        const payment = await PaymentModel.findOne({ razorpayOrderId: orderId })

        if (!payment) {
          console.error("❌ Payment record not found for order:", orderId)
          return NextResponse.json({ received: true, warning: "Payment record not found" })
        }

        // Update payment with success status
        payment.status = "success"
        payment.razorpayPaymentId = paymentId
        await payment.save()

        console.log("✅ Payment record updated via webhook:", payment._id)

        const registrationId = payment.registrationId

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

        // Update registration
        registration.paymentStatus = "success"
        registration.paymentMethod = "razorpay" // Set payment method
        registration.paymentId = payment._id.toString()
        registration.paymentReference = orderId
        registration.ticketStatus = "active" // Activate ticket on payment success
        await registration.save()

        console.log("✅ Registration updated via webhook:", registrationId, "- Method: razorpay")

        // Send ticket email
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

          console.log("🎟️ Ticket email sent via webhook to:", registration.email)
        } catch (emailError) {
          console.error("Failed to send ticket email via webhook:", emailError)
        }

        break
      }

      case "payment.failed": {
        const paymentEntity = event.payload.payment.entity
        const { order_id: orderId, id: paymentId, error_code, error_description } = paymentEntity

        console.log("❌ Payment failed:", orderId, "- Reason:", error_description)

        // Find and update payment record
        const failedPayment = await PaymentModel.findOne({ razorpayOrderId: orderId })
        
        if (failedPayment) {
          failedPayment.status = "failed"
          failedPayment.razorpayPaymentId = paymentId
          failedPayment.verificationNotes = `Payment failed: ${error_description || error_code}`
          await failedPayment.save()
          
          console.log("✅ Payment marked as failed:", failedPayment._id)

          // Update registration status
          await RegistrationModel.findOneAndUpdate(
            { registrationId: failedPayment.registrationId },
            { paymentStatus: "failed" }
          )
        }

        break
      }

      case "order.paid": {
        const orderEntity = event.payload.order.entity
        console.log("✅ Order paid:", orderEntity.id)
        break
      }

      default:
        console.log("ℹ️ Unhandled webhook event:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ 
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
