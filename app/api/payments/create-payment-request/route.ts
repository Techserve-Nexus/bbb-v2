import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"
import {
  calculatePaymentHash,
  validatePaymentGatewayConfig,
  getPaymentGatewayUrl,
  PG_API_URL,
  PG_API_KEY,
  PG_SALT,
} from "@/lib/payment-gateway"
import { getBaseUrl } from "@/lib/utils"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { amount, registrationId } = await req.json()

    if (!amount || !registrationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate minimum amount (payment gateway requires minimum ₹1)
    const MINIMUM_AMOUNT = 1
    const amountNum = parseFloat(amount.toString())
    if (isNaN(amountNum) || amountNum < MINIMUM_AMOUNT) {
      return NextResponse.json(
        { 
          error: `Amount must be at least ₹${MINIMUM_AMOUNT}. Current amount: ₹${amountNum}`,
          code: "MINIMUM_AMOUNT_ERROR"
        },
        { status: 400 }
      )
    }

    // Validate payment gateway configuration
    const configValidation = validatePaymentGatewayConfig()
    if (!configValidation.valid) {
      return NextResponse.json(
        {
          error: "Payment gateway not configured",
          missing: configValidation.missing,
        },
        { status: 500 }
      )
    }

    // Check if registration exists
    const registration = await RegistrationModel.findOne({ registrationId })
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Generate unique order ID (using registrationId as base)
    // Order ID must be max 30 characters according to documentation (varchar(30))
    // Format: registrationId_timestamp (truncated if needed)
    const timestamp = Date.now().toString()
    let orderId = `${registrationId}_${timestamp}`
    if (orderId.length > 30) {
      // Truncate registrationId if needed to keep total under 30 chars
      const maxRegIdLength = 30 - timestamp.length - 1 // -1 for underscore
      const truncatedRegId = registrationId.substring(0, Math.max(1, maxRegIdLength))
      orderId = `${truncatedRegId}_${timestamp}`
    }

    // Calculate hash for payment request
    // Hash format according to payment gateway: SHA512(salt|amount|api_key|city|country|currency|description|email|name|order_id|phone|return_url|return_url_failure|return_url_cancel|zip_code)
    const currency = "INR"
    // Format amount to 2 decimal places as required by payment gateway
    const amountStr = parseFloat(amount.toString()).toFixed(2)
    
    // Get base URL for frontend redirect (needed for hash calculation)
    // Use the request object to extract headers/URL if available
    const baseUrl = getBaseUrl(req)
    const returnUrl = `${baseUrl}/api/payments/return`
    const returnUrlFailure = `${baseUrl}/api/payments/failure`
    const returnUrlCancel = `${baseUrl}/api/payments/failure`
    
    // Default address values (mandatory fields - using event location as default)
    const defaultCity = "Bengaluru"
    const defaultCountry = "India"
    const defaultZipCode = "560001"
    const description = `Event Registration - ${registration.name} (${registrationId})`
    
    let cleanPhone = (registration.contactNo || "").replace(/[\s\-\(\)]/g, "")
    if (cleanPhone.startsWith("+91")) {
      cleanPhone = cleanPhone.substring(3)
    } else if (cleanPhone.startsWith("91") && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2)
    }
    
    // Validate salt is set
    if (!PG_SALT || PG_SALT.trim() === "") {
      console.error("❌ PG_SALT is not set or empty!")
      return NextResponse.json(
        { error: "Payment gateway salt not configured" },
        { status: 500 }
      )
    }
    
    // Calculate hash with all parameters in the correct order
    const hashParams = {
      salt: PG_SALT.trim(), // Ensure salt is trimmed
      amount: amountStr,
      api_key: PG_API_KEY,
      city: defaultCity,
      country: defaultCountry,
      currency: currency,
      description: description,
      email: registration.email.toLowerCase().trim(), // Ensure email is lowercase
      name: registration.name.trim() || "Customer",
      order_id: orderId,
      phone: cleanPhone,
      return_url: returnUrl,
      return_url_failure: returnUrlFailure,
      return_url_cancel: returnUrlCancel,
      zip_code: defaultZipCode,
    }
    
    // Debug: Verify salt length and format (don't log actual value)
    console.log("  - Salt validation:")
    console.log("  - Salt is set:", !!hashParams.salt)
    console.log("  - Salt length:", hashParams.salt.length)
    console.log("  - Salt has whitespace:", hashParams.salt !== hashParams.salt.trim())
    
    const hash = calculatePaymentHash(hashParams)
    
    // Debug: Log the hash string components to verify format
    console.log("🔍 Hash String Components (verify against expected format):")
    console.log("  1. salt:", hashParams.salt ? "***SET***" : "❌ MISSING")
    console.log("  2. amount:", hashParams.amount, "| Expected: 1000.00")
    console.log("  3. api_key:", hashParams.api_key ? hashParams.api_key.substring(0, 8) + "..." : "❌ MISSING")
    console.log("  4. city:", hashParams.city, "| Expected: Bengaluru")
    console.log("  5. country:", hashParams.country, "| Expected: India")
    console.log("  6. currency:", hashParams.currency, "| Expected: INR")
    console.log("  7. description:", hashParams.description.substring(0, 50) + "...")
    console.log("  8. email:", hashParams.email)
    console.log("  9. name:", hashParams.name)
    console.log("  10. order_id:", hashParams.order_id)
    console.log("  11. phone:", hashParams.phone, "| (cleaned, no spaces/dashes)")
    console.log("  12. return_url:", hashParams.return_url)
    console.log("  13. return_url_failure:", hashParams.return_url_failure)
    console.log("  14. return_url_cancel:", hashParams.return_url_cancel)
    console.log("  15. zip_code:", hashParams.zip_code, "| Expected: 560001")

    // Store payment record in database
    const paymentRecord = await PaymentModel.findOneAndUpdate(
      { registrationId },
      {
        registrationId,
        paymentMethod: "payment_gateway",
        pgOrderId: orderId,
        amount,
        status: "pending",
      },
      { upsert: true, new: true }
    )

    console.log("💾 Payment record created:", paymentRecord._id.toString(), "- Order:", orderId)

    // Update registration with payment method
    await RegistrationModel.findOneAndUpdate(
      { registrationId },
      { paymentMethod: "payment_gateway" }
    )

    // Build payment parameters with ALL mandatory fields
    const paymentParams: Record<string, string> = {
      // Mandatory fields according to documentation
      api_key: PG_API_KEY,
      order_id: orderId,
      amount: amountStr,
      currency: currency,
      hash: hash,
      description: description,
      name: registration.name || "Customer", // Mandatory: Customer name
      email: registration.email, // Mandatory: Customer email
      phone: registration.contactNo || "", // Mandatory: Customer phone
      city: defaultCity, // Mandatory: Customer city
      country: defaultCountry, // Mandatory: Customer country
      zip_code: defaultZipCode, // Mandatory: Customer zip code
      return_url: returnUrl, // Mandatory: Return URL for success
    }
    
    // Optional return URLs
    paymentParams.return_url_failure = returnUrlFailure
    paymentParams.return_url_cancel = returnUrlCancel
    
    // Optional address fields (if we have them in future)
    // address_line_1, address_line_2, state are optional
    
    // Optional: Payment mode (TEST or LIVE)
    // Uncomment to use test mode:
    // paymentParams.mode = "TEST"

    console.log("📦 Payment request created:", orderId, "for registration:", registrationId)
    console.log("💰 Payment amount:", amountStr, currency)
    console.log("🔐 Hash calculated:", hash.substring(0, 20) + "...")
    console.log("🔐 Hash length:", hash.length, "(should be 128 for SHA512)")
    console.log("📋 Payment params keys:", Object.keys(paymentParams).join(", "))
    console.log("⚠️  IMPORTANT: If you're getting hash mismatch error, verify your PG_SALT value matches exactly what the payment gateway provided")

    // Construct payment URL - handle both cases:
    // 1. PG_API_URL is just base URL: https://pgbiz.tapay.in
    // 2. PG_API_URL already includes endpoint: https://pgbiz.tapay.in/v2/paymentrequest
    let paymentUrl = PG_API_URL
    if (!paymentUrl.includes("/v2/paymentrequest")) {
      paymentUrl = getPaymentGatewayUrl("/v2/paymentrequest")
    } else {
      // Remove trailing slash if present
      paymentUrl = paymentUrl.replace(/\/$/, "")
    }

    console.log("🔗 Payment URL:", paymentUrl)

    return NextResponse.json({
      success: true,
      orderId,
      paymentParams,
      paymentUrl,
      message: "Payment request created successfully",
    })
  } catch (error) {
    console.error("Error creating payment request:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

