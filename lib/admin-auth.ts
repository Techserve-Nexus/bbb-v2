/**
 * Admin Authentication Middleware
 * 
 * Verifies admin credentials from request headers against environment variables
 * Used by all admin API routes for authentication
 */

interface AuthResult {
  authorized: boolean
  error?: string
  adminEmail?: string
  email?: string // Alias for adminEmail
}

/**
 * Verify admin authentication from request headers
 * 
 * @param request - NextRequest or Request object
 * @returns AuthResult with authorization status
 * 
 * @example
 * ```typescript
 * const auth = verifyAdminAuth(req)
 * if (!auth.authorized) {
 *   return NextResponse.json({ error: auth.error }, { status: 401 })
 * }
 * ```
 */
export function verifyAdminAuth(request: Request): AuthResult {
  try {
    // Extract credentials from headers
    const email = request.headers.get("x-admin-email")
    const password = request.headers.get("x-admin-password")

    // Check if credentials are provided
    if (!email || !password) {
      return {
        authorized: false,
        error: "Missing authentication credentials. Please provide x-admin-email and x-admin-password headers.",
      }
    }

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    // Check if environment variables are set
    if (!adminEmail || !adminPassword) {
      console.error("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables")
      return {
        authorized: false,
        error: "Server configuration error. Admin credentials not configured.",
      }
    }

    // Verify credentials
    if (email !== adminEmail || password !== adminPassword) {
      console.warn(`🚨 Failed admin login attempt from: ${email}`)
      return {
        authorized: false,
        error: "Invalid admin credentials. Access denied.",
      }
    }

    // Success
    console.log(`✅ Admin authenticated: ${email}`)
    return {
      authorized: true,
      adminEmail: email,
      email: email, // Alias
    }
  } catch (error) {
    console.error("❌ Error in admin authentication:", error)
    return {
      authorized: false,
      error: "Authentication verification failed. Please try again.",
    }
  }
}

/**
 * Verify admin credentials (for login endpoint)
 * Similar to verifyAdminAuth but without request headers
 * 
 * @param email - Admin email
 * @param password - Admin password
 * @returns AuthResult with authorization status
 */
export function verifyAdminCredentials(email: string, password: string): AuthResult {
  try {
    // Check if credentials are provided
    if (!email || !password) {
      return {
        authorized: false,
        error: "Email and password are required.",
      }
    }

    // Get admin credentials from environment
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    // Check if environment variables are set
    if (!adminEmail || !adminPassword) {
      console.error("⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables")
      return {
        authorized: false,
        error: "Server configuration error.",
      }
    }

    // Verify credentials
    if (email !== adminEmail || password !== adminPassword) {
      console.warn(`🚨 Failed admin login attempt: ${email}`)
      return {
        authorized: false,
        error: "Invalid email or password.",
      }
    }

    // Success
    console.log(`✅ Admin login successful: ${email}`)
    return {
      authorized: true,
      adminEmail: email,
    }
  } catch (error) {
    console.error("❌ Error verifying admin credentials:", error)
    return {
      authorized: false,
      error: "Login verification failed. Please try again.",
    }
  }
}

/**
 * Generate a simple session token (for future use)
 * Note: For production, use proper JWT or session management
 */
export function generateAdminSessionToken(email: string): string {
  const timestamp = Date.now()
  const token = Buffer.from(`${email}:${timestamp}`).toString("base64")
  return token
}

/**
 * Verify session token (for future use)
 */
export function verifyAdminSessionToken(token: string): AuthResult {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [email, timestamp] = decoded.split(":")

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (tokenAge > maxAge) {
      return {
        authorized: false,
        error: "Session expired. Please login again.",
      }
    }

    // Verify email matches admin
    if (email !== process.env.ADMIN_EMAIL) {
      return {
        authorized: false,
        error: "Invalid session.",
      }
    }

    return {
      authorized: true,
      adminEmail: email,
    }
  } catch (error) {
    return {
      authorized: false,
      error: "Invalid session token.",
    }
  }
}
