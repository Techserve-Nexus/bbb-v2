// Client-side payment gateway utilities

/**
 * Create payment request and get payment parameters
 */
export async function createPaymentRequest(amount: number, registrationId: string) {
  const response = await fetch("/api/payments/create-payment-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, registrationId }),
  })

  if (!response.ok) {
    const error = await response.json()
    // Handle specific payment gateway errors
    if (error.code === 1033 || error.error?.includes("lower limit") || error.error?.includes("minimum")) {
      throw new Error("Payment amount is below the minimum transaction limit. Please use manual payment method for small amounts or contact support.")
    }
    throw new Error(error.error || "Failed to create payment request")
  }

  return response.json()
}

/**
 * Submit payment form to payment gateway
 * This creates a form and submits it to redirect to payment gateway
 * According to documentation: Content-Type should be application/x-www-form-urlencoded
 */
export function submitPaymentForm(paymentParams: Record<string, string>, paymentUrl: string) {
  // Create a form element
  const form = document.createElement("form")
  form.method = "POST"
  form.action = paymentUrl
  form.style.display = "none"
  form.enctype = "application/x-www-form-urlencoded" // Set content type as per documentation

  // Add all parameters as hidden inputs
  // Filter out undefined/null values and convert all to strings
  Object.entries(paymentParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = String(value).trim() // Ensure value is a string and trimmed
      form.appendChild(input)
    }
  })

  // Append form to body and submit
  document.body.appendChild(form)
  form.submit()
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(orderId?: string, transactionId?: string) {
  const response = await fetch("/api/payments/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, transaction_id: transactionId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to check payment status")
  }

  return response.json()
}

