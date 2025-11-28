import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"
import {
  verifyResponseHash,
  PG_SALT,
} from "@/lib/payment-gateway"
import { sendEmail, getTicketEmailTemplate } from "@/lib/email"
import { generateTicketQRCode } from "@/lib/qr-generator"
import { getBaseUrl } from "@/lib/utils"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Process payment return - shared logic for both GET and POST
 * According to payment gateway documentation section 2.3:
 * - response_code: 0 = success, non-zero = error
 * - response_message: "Transaction Successful", "Transaction Failed", "Transaction Cancelled"
 */
async function processPaymentReturn(responseData: Record<string, any>, req: NextRequest) {
  const baseUrl = getBaseUrl(req)
  // Extract required parameters according to documentation section 2.3
  const transactionId = responseData.transaction_id?.toString() || null
  const orderId = responseData.order_id?.toString() || null
  const responseCode = responseData.response_code?.toString() || responseData.responseCode?.toString() || null
  const responseMessage = responseData.response_message?.toString() || responseData.responseMessage?.toString() || null
  const amount = responseData.amount?.toString() || null
  const currency = responseData.currency?.toString() || null
  const hash = responseData.hash?.toString() || null
  
  // Support legacy 'status' field for backward compatibility
  const legacyStatus = responseData.status?.toString() || null

  // Check for required parameters
  if (!transactionId || !orderId || !amount || !currency) {
    console.error("  - Missing required parameters in payment return")
    console.error("  - transaction_id:", transactionId ? "✓" : "✗")
    console.error("  - order_id:", orderId ? "✓" : "✗")
    console.error("  - amount:", amount ? "✓" : "✗")
    console.error("  - currency:", currency ? "✓" : "✗")
    console.error("  - response_code:", responseCode ? "✓" : "✗")
    console.error("  - hash:", hash ? "✓" : "✗")
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=missing_params`, baseUrl), { status: 303 })
  }

  // Verify hash using all response fields (excluding hash itself)
  const hashValid = verifyResponseHash(responseData, PG_SALT, hash || "")

  if (!hashValid) {
    console.error("❌ Hash verification failed for order:", orderId)
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=hash_mismatch&order_id=` + orderId, baseUrl), { status: 303 })
  }

  console.log("✅ Payment return hash verified for order:", orderId)

  // Find payment record
  const payment = await PaymentModel.findOne({ pgOrderId: orderId })
  if (!payment) {
    console.error("❌ Payment record not found for order:", orderId)
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=payment_not_found&order_id=` + orderId, baseUrl), { status: 303 })
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

  if (isSuccess) {
    // Check if payment is already processed to avoid duplicate processing
    const isAlreadyProcessed = payment.status === "success"
    
    if (isAlreadyProcessed) {
      console.log("ℹ️ Payment already processed, skipping duplicate processing for order:", orderId)
      // Still redirect to success page even if already processed
      // Use 303 See Other to convert POST to GET and avoid Server Actions validation
      return NextResponse.redirect(new URL(`${baseUrl}/register?registration_id=${registrationId}&order_id=${orderId}`, baseUrl), { status: 303 })
    }

    // Update payment record
    payment.status = "success"
    payment.pgTransactionId = transactionId
    payment.pgPaymentId = responseData.payment_id?.toString() || transactionId
    payment.pgHash = hash
    // Store additional response data for reference
    if (responseCode) payment.verificationNotes = `Response Code: ${responseCode}, Message: ${responseMessage || "Success"}`
    await payment.save()

    console.log("✅ Payment record updated:", payment._id, "- Status: success")

    // Update registration
    const registration = await RegistrationModel.findOne({ registrationId })
    if (!registration) {
      console.error("❌ Registration not found:", registrationId)
      // Use 303 See Other to convert POST to GET and avoid Server Actions validation
      return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=registration_not_found`, baseUrl), { status: 303 })
    }

    // Generate QR code if not exists
    if (!registration.qrCode) {
      const qrDataUrl = await generateTicketQRCode(registrationId)
      registration.qrCode = qrDataUrl
      console.log("✅ QR code generated for:", registrationId)
    }

    // Update registration with payment success details
    registration.paymentStatus = "success"
    registration.paymentMethod = "payment_gateway"
    registration.paymentId = payment._id.toString()
    registration.paymentReference = orderId
    registration.ticketStatus = "active"
    await registration.save()

    console.log("✅ Registration updated:", registrationId, "- Payment status: success, Ticket status: active")

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

      // Prepare QR code attachment if available
      let qrCodeAttachment: any[] = []
      if (registration.qrCode) {
        try {
          // Handle both data URL format (data:image/png;base64,...) and plain base64
          let base64Content = registration.qrCode
          if (registration.qrCode.includes(",")) {
            base64Content = registration.qrCode.split(",")[1]
          } else if (registration.qrCode.startsWith("data:")) {
            // Extract base64 from data URL
            const base64Match = registration.qrCode.match(/base64,(.+)$/)
            if (base64Match) {
              base64Content = base64Match[1]
            }
          }

          qrCodeAttachment = [
            {
              filename: "ticket-qr-code.png",
              content: base64Content,
              encoding: "base64",
              cid: "qrcode",
            },
          ]
        } catch (qrError) {
          console.error("❌ Failed to process QR code for email attachment:", qrError)
          // Continue without QR code attachment
        }
      }

      await sendEmail({
        to: registration.email,
        subject: `Your Event Ticket - ${registration.registrationId}`,
        html: ticketEmailHTML,
        attachments: qrCodeAttachment,
      })

      console.log("✅ Ticket email sent successfully to:", registration.email, "- Registration ID:", registrationId)
    } catch (emailError) {
      console.error("❌ Failed to send ticket email:", emailError)
      console.error("❌ Email error details:", {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined,
        registrationId,
        email: registration.email,
      })
      // Log error but don't fail the payment - payment is already successful
      // Admin can resend email manually if needed
    }

    // Redirect to success page
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    // return NextResponse.redirect(new URL(`${baseUrl}/payment/success?registration_id=${registrationId}&order_id=${orderId}`, baseUrl), { status: 303 })
    return NextResponse.redirect(new URL(`${baseUrl}/register?registration_id=${registrationId}&order_id=${orderId}`, baseUrl), { status: 303 })
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

    console.log("❌ Payment failed for order:", orderId, "- Response Code:", responseCode, "- Message:", responseMessage || errorDesc)
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?order_id=${orderId}&response_code=${responseCode || ""}&error=${encodeURIComponent(errorDesc)}`, baseUrl), { status: 303 })
  }
}

/**
 * Handle payment return URL (GET request from payment gateway)
 * This is called when the user is redirected back from the payment gateway
 * According to documentation section 2.3, all response parameters are sent as query params
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.shreeparashurama.com"
  try {
    await connectDB()

    // Extract all query parameters from payment gateway response
    const searchParams = req.nextUrl.searchParams
    const responseData: Record<string, any> = {}
    
    // Get all parameters (including all response fields from documentation section 2.3)
    for (const [key, value] of searchParams.entries()) {
      responseData[key] = value
    }

    // Log received parameters for debugging
    console.log("📥 Payment return (GET) received for order:", responseData.order_id)
    console.log("  - Response Code:", responseData.response_code || responseData.responseCode || "N/A")
    console.log("  - Response Message:", responseData.response_message || responseData.responseMessage || "N/A")

    return await processPaymentReturn(responseData, req)

  } catch (error) {
    console.error("Error processing payment return:", error)
    const baseUrl = getBaseUrl(req)
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    return NextResponse.redirect(new URL("/payment/failed?error=processing_error", baseUrl), { status: 303 })
  }
}

/**
 * Handle payment return URL (POST request from payment gateway)
 * According to documentation section 2.3, payment gateway makes a POST request to return_url
 * with all response parameters as form data (application/x-www-form-urlencoded)
 */
export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.shreeparashurama.com"
  try {
    await connectDB()

    const responseData: Record<string, any> = {}
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      // Handle form data (standard payment gateway format)
      const formData = await req.formData()
      
      // Extract all form fields
      for (const [key, value] of formData.entries()) {
        responseData[key] = value.toString()
      }
    } else if (contentType.includes("application/json")) {
      // Handle JSON (if gateway supports it)
      const body = await req.json()
      Object.assign(responseData, body)
    } else {
      // Try to parse as form data anyway
      try {
        const formData = await req.formData()
        for (const [key, value] of formData.entries()) {
          responseData[key] = value.toString()
        }
      } catch (e) {
        console.error("Failed to parse request body:", e)
        const baseUrl = getBaseUrl(req)
        // Use 303 See Other to convert POST to GET and avoid Server Actions validation
        return NextResponse.redirect(new URL("/payment/failed?error=invalid_request_format", baseUrl), { status: 303 })
      }
    }

    // Log received parameters for debugging
    console.log("  - Payment return (POST) received for order:", responseData.order_id)
    console.log("  - Response Code:", responseData.response_code || responseData.responseCode || "N/A")
    console.log("  - Response Message:", responseData.response_message || responseData.responseMessage || "N/A")
    console.log("  - Content-Type:", contentType)

    return await processPaymentReturn(responseData, req)
  } catch (error) {
    console.error("Error processing payment return (POST):", error)
    const baseUrl = getBaseUrl(req)
    // Use 303 See Other to convert POST to GET and avoid Server Actions validation
    return NextResponse.redirect(new URL("/payment/failed?error=processing_error", baseUrl), { status: 303 })
  }
}

