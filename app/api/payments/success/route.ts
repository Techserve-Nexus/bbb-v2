import { type NextRequest, NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/utils"

export const runtime = "nodejs"

/**
 * Success URL handler - redirects to return URL handler
 * This is a simple redirect to the return handler which processes the payment
 */
export async function GET(req: NextRequest) {
  // Get the proper base URL (prioritizes NEXT_PUBLIC_BASE_URL)
  const baseUrl = getBaseUrl(req)
  
  // Redirect to return URL handler which will process the payment
  const returnUrl = new URL("/api/payments/return", baseUrl)
  req.nextUrl.searchParams.forEach((value, key) => {
    returnUrl.searchParams.set(key, value)
  })
  return NextResponse.redirect(returnUrl)
}

