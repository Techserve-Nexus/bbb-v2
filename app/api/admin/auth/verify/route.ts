import { NextRequest, NextResponse } from "next/server"
import { verifyAdminCredentials, generateAdminSessionToken } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const maxDuration = 10

/**
 * POST /api/admin/auth/verify
 * 
 * Verify admin login credentials
 * Used by login page to authenticate admin
 * 
 * @body { email: string, password: string }
 * @returns { success: boolean, message: string, token?: string, email?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Verify credentials
    const auth = verifyAdminCredentials(email, password)

    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || "Invalid credentials" },
        { status: 401 }
      )
    }

    // Generate session token
    const token = generateAdminSessionToken(email)

    // Success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      email: auth.adminEmail,
    })
  } catch (error) {
    console.error("❌ Error in admin auth verification:", error)
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/auth/verify
 * 
 * Verify if current session is valid
 * Used to check if user is still authenticated
 * 
 * @headers { x-admin-email, x-admin-password }
 * @returns { success: boolean, authenticated: boolean }
 */
export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get("x-admin-email")
    const password = req.headers.get("x-admin-password")

    if (!email || !password) {
      return NextResponse.json(
        { success: true, authenticated: false },
        { status: 200 }
      )
    }

    const auth = verifyAdminCredentials(email, password)

    return NextResponse.json({
      success: true,
      authenticated: auth.authorized,
      email: auth.authorized ? auth.adminEmail : undefined,
    })
  } catch (error) {
    console.error("❌ Error checking auth status:", error)
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    )
  }
}
