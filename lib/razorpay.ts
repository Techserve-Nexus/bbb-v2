// Razorpay utilities for payment processing

export async function createPaymentOrder(amount: number, registrationId: string) {
  const response = await fetch("/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, registrationId }),
  })

  if (!response.ok) {
    throw new Error("Failed to create payment order")
  }

  return response.json()
}

export async function verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
  const response = await fetch("/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }),
  })

  if (!response.ok) {
    throw new Error("Payment verification failed")
  }

  return response.json()
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
