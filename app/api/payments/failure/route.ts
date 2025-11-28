import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"
import { getBaseUrl } from "@/lib/utils"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Process payment failure - shared logic for both GET and POST
 */
async function processPaymentFailure(params: {
  orderId: string | null
  transactionId: string | null
  status: string | null
  baseUrl: string
  isPostRequest?: boolean
}) {
  const { orderId, transactionId, status, baseUrl, isPostRequest = false } = params

  if (orderId) {
    // Find and update payment record
    const payment = await PaymentModel.findOne({ pgOrderId: orderId })
    if (payment) {
      payment.status = "failed"
      if (transactionId) payment.pgTransactionId = transactionId
      payment.verificationNotes = `Payment failed: ${status || "Unknown error"}`
      await payment.save()

      // Update registration
      await RegistrationModel.findOneAndUpdate(
        { registrationId: payment.registrationId },
        { paymentStatus: "failed" }
      )

      console.log("❌ Payment marked as failed:", orderId)
    }
  }

  // For POST requests, check if it's a server callback (webhook) or user redirect
  // If it looks like a server callback, return JSON. Otherwise redirect.
  if (isPostRequest) {
    // Check if it's likely a server callback (no user-agent or specific headers)
    // For now, we'll redirect POST requests using 303 (See Other) which converts to GET
    const redirectUrl = new URL("/payment/failed", baseUrl)
    if (orderId) redirectUrl.searchParams.set("order_id", orderId)
    if (status) redirectUrl.searchParams.set("status", status)
    // Use 303 See Other for POST requests - converts to GET
    return NextResponse.redirect(redirectUrl, { status: 303 })
  }

  // For GET requests, use standard redirect
  const redirectUrl = new URL("/payment/failed", baseUrl)
  if (orderId) redirectUrl.searchParams.set("order_id", orderId)
  if (status) redirectUrl.searchParams.set("status", status)
  return NextResponse.redirect(redirectUrl)
}

/**
 * Failure URL handler - processes failed payments (GET request)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const orderId = searchParams.get("order_id")
    const transactionId = searchParams.get("transaction_id")
    const status = searchParams.get("status")

    const baseUrl = getBaseUrl(req)

    return await processPaymentFailure({
      orderId,
      transactionId,
      status,
      baseUrl,
    })
  } catch (error) {
    console.error("Error processing payment failure:", error)
    const baseUrl = getBaseUrl(req)
    return NextResponse.redirect(new URL("/payment/failed?error=processing_error", baseUrl))
  }
}

/**
 * Failure URL handler - processes failed payments (POST request)
 * Some payment gateways send POST requests instead of GET
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    // Get form data or JSON from payment gateway response
    let orderId: string | null = null
    let transactionId: string | null = null
    let status: string | null = null

    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      // Handle form data
      const formData = await req.formData()
      orderId = formData.get("order_id")?.toString() || null
      transactionId = formData.get("transaction_id")?.toString() || null
      status = formData.get("status")?.toString() || null
    } else {
      // Handle JSON
      const body = await req.json()
      orderId = body.order_id || null
      transactionId = body.transaction_id || null
      status = body.status || null
    }

    const baseUrl = getBaseUrl(req)

    return await processPaymentFailure({
      orderId,
      transactionId,
      status,
      baseUrl,
      isPostRequest: true,
    })
  } catch (error) {
    console.error("Error processing payment failure (POST):", error)
    const baseUrl = getBaseUrl(req)
    return NextResponse.redirect(new URL("/payment/failed?error=processing_error", baseUrl))
  }
}

