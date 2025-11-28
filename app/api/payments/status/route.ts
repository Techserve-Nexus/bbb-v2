import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel } from "@/lib/models"
import {
  generateHash,
  PG_API_KEY,
  PG_SALT,
  getPaymentGatewayUrl,
} from "@/lib/payment-gateway"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * Payment Status API
 * According to documentation section 6: PAYMENT STATUS API
 * This endpoint checks the status of a payment transaction
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { order_id, transaction_id } = await req.json()

    if (!order_id && !transaction_id) {
      return NextResponse.json(
        { error: "Either order_id or transaction_id is required" },
        { status: 400 }
      )
    }

    // Calculate hash for status request
    // According to documentation, hash format may vary - check documentation for exact format
    // For now, using: SHA512(api_key|order_id|salt) or SHA512(api_key|transaction_id|salt)
    const identifier = order_id || transaction_id
    const hashParams = [PG_API_KEY, identifier]
    const hash = generateHash(hashParams, PG_SALT)

    // Prepare request to payment gateway
    const statusUrl = getPaymentGatewayUrl("/v2/paymentstatus")

    const formData = new URLSearchParams()
    formData.append("api_key", PG_API_KEY)
    if (order_id) formData.append("order_id", order_id)
    if (transaction_id) formData.append("transaction_id", transaction_id)
    formData.append("hash", hash)

    // Make request to payment gateway
    const response = await fetch(statusUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    const responseText = await response.text()
    let statusData: any = {}

    // Try to parse response (could be JSON or form-encoded)
    try {
      statusData = JSON.parse(responseText)
    } catch {
      // If not JSON, parse as form-encoded
      const params = new URLSearchParams(responseText)
      params.forEach((value, key) => {
        statusData[key] = value
      })
    }

    if (!response.ok) {
      console.error("Payment status API error:", statusData)
      return NextResponse.json(
        {
          error: statusData.error || "Failed to check payment status",
          details: statusData,
        },
        { status: 500 }
      )
    }

    // Verify response hash if present
    if (statusData.hash) {
      const responseHashParams = [
        statusData.transaction_id || "",
        statusData.order_id || "",
        statusData.status || "",
        statusData.amount || "",
        statusData.currency || "",
      ]
      const calculatedHash = generateHash(responseHashParams, PG_SALT)
      if (calculatedHash !== statusData.hash) {
        console.error("❌ Response hash mismatch for status check")
        return NextResponse.json(
          { error: "Response hash verification failed" },
          { status: 400 }
        )
      }
    }

    // Update local payment record if found
    if (order_id) {
      const payment = await PaymentModel.findOne({ pgOrderId: order_id })
      if (payment && statusData.status) {
        payment.status = statusData.status.toLowerCase() === "success" ? "success" : "failed"
        if (statusData.transaction_id) payment.pgTransactionId = statusData.transaction_id
        if (statusData.payment_id) payment.pgPaymentId = statusData.payment_id
        await payment.save()
      }
    }

    return NextResponse.json({
      success: true,
      status: statusData.status,
      order_id: statusData.order_id,
      transaction_id: statusData.transaction_id,
      amount: statusData.amount,
      currency: statusData.currency,
      payment_id: statusData.payment_id,
      data: statusData,
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}


