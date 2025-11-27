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
 * Process payment return - shared logic for both GET and POST
 * According to payment gateway documentation section 2.3:
 * - response_code: 0 = success, non-zero = error
 * - response_message: "Transaction Successful", "Transaction Failed", "Transaction Cancelled"
 */
async function processPaymentReturn(responseData: Record<string, any>, baseUrl: string) {
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
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=missing_params`, baseUrl))
  }

  // Verify hash using all response fields (excluding hash itself)
  const hashValid = verifyResponseHash(responseData, PG_SALT, hash || "")

  if (!hashValid) {
    console.error("❌ Hash verification failed for order:", orderId)
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=hash_mismatch&order_id=` + orderId, baseUrl))
  }

  console.log("✅ Payment return hash verified for order:", orderId)

  // Find payment record
  const payment = await PaymentModel.findOne({ pgOrderId: orderId })
  if (!payment) {
    console.error("❌ Payment record not found for order:", orderId)
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=payment_not_found&order_id=` + orderId, baseUrl))
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
      console.error(" Registration not found:", registrationId)
      return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=registration_not_found`))
    }

    // Generate QR code if not exists
    if (!registration.qrCode) {
      const qrDataUrl = await generateTicketQRCode(registrationId)
      registration.qrCode = qrDataUrl
      console.log("✅ QR code generated for:", registrationId)
    }

    // Update registration
    registration.paymentStatus = "success"
    registration.paymentMethod = "payment_gateway"
    registration.paymentId = payment._id.toString()
    registration.paymentReference = orderId
    registration.ticketStatus = "active"
    await registration.save()

    console.log("✅ Registration updated:", registrationId, "- Payment status: success")

    // Send ticket email
    try {
      const ticketEmailHTML = getTicketEmailTemplate({
        name: registration.name,
        registrationId: registration.registrationId,
        ticketType: registration.ticketType || "Event Ticket",
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

    // Redirect to success page
    // return NextResponse.redirect(new URL(`${baseUrl}/payment/success?registration_id=${registrationId}&order_id=${orderId}`, baseUrl))
    return NextResponse.redirect(new URL(`${baseUrl}/register?registration_id=${registrationId}&order_id=${orderId}`, baseUrl))
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
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?order_id=${orderId}&response_code=${responseCode || ""}&error=${encodeURIComponent(errorDesc)}`, baseUrl))
  }
}

/**
 * Handle payment return URL (GET request from payment gateway)
 * This is called when the user is redirected back from the payment gateway
 * According to documentation section 2.3, all response parameters are sent as query params
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
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

    return await processPaymentReturn(responseData, req.url)

  } catch (error) {
    console.error("Error processing payment return:", error)
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=processing_error`, req.url))
  }
}

/**
 * Handle payment return URL (POST request from payment gateway)
 * According to documentation section 2.3, payment gateway makes a POST request to return_url
 * with all response parameters as form data (application/x-www-form-urlencoded)
 */
export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
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
        return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=invalid_request_format`, req.url))
      }
    }

    // Log received parameters for debugging
    console.log("📥 Payment return (POST) received for order:", responseData.order_id)
    console.log("  - Response Code:", responseData.response_code || responseData.responseCode || "N/A")
    console.log("  - Response Message:", responseData.response_message || responseData.responseMessage || "N/A")
    console.log("  - Content-Type:", contentType)

    return await processPaymentReturn(responseData, req.url)
  } catch (error) {
    console.error("Error processing payment return (POST):", error)
    return NextResponse.redirect(new URL(`${baseUrl}/payment/failed?error=processing_error`, req.url))
  }
}

