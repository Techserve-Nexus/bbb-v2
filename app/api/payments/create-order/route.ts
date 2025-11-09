import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { amount, registrationId } = await req.json()

    if (!amount || !registrationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 })
    }

    // Check if registration exists
    const registration = await RegistrationModel.findOne({ registrationId })
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Make request to Razorpay API
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        receipt: registrationId,
        notes: {
          registration_id: registrationId,
          name: registration.name,
          email: registration.email,
          ticket_type: registration.ticketType,
        },
      }),
    })

    const orderData = await response.json()

    if (!response.ok) {
      console.error("Razorpay order creation error:", orderData)
      return NextResponse.json({ 
        error: orderData.error?.description || "Failed to create payment order" 
      }, { status: 500 })
    }

    console.log("📦 Razorpay order created:", orderData.id)

    // Store/update payment record in database
    try {
      const paymentRecord = await PaymentModel.findOneAndUpdate(
        { registrationId },
        {
          registrationId,
          paymentMethod: "razorpay",
          razorpayOrderId: orderData.id,
          amount,
          status: "pending",
        },
        { upsert: true, new: true }
      )

      console.log("💾 Payment record saved:", paymentRecord._id.toString(), "- Order:", orderData.id)
    } catch (dbError) {
      console.error("Database error saving payment:", dbError)
      // Continue anyway, payment can be updated later via webhook
    }

    // Update registration with payment method
    await RegistrationModel.findOneAndUpdate(
      { registrationId },
      { paymentMethod: "razorpay" }
    )

    console.log("✅ Razorpay order created:", orderData.id, "for registration:", registrationId)

    return NextResponse.json({
      orderId: orderData.id,
      amount: amount,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    return NextResponse.json({ 
      error: "Failed to create payment order",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
