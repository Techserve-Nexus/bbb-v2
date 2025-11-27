import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Success URL handler - redirects to return URL handler
 * This is a simple redirect to the return handler which processes the payment
 */
export async function GET(req: NextRequest) {
  // Redirect to return URL handler which will process the payment
  const returnUrl = new URL("/api/payments/return", req.url)
  req.nextUrl.searchParams.forEach((value, key) => {
    returnUrl.searchParams.set(key, value)
  })
  return NextResponse.redirect(returnUrl)
}

