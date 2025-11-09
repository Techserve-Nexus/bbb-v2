"use server"

export async function getRazorpayKeyAction() {
  // This server action safely retrieves the Razorpay key
  // Environment variables are only accessed on the server
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
}
