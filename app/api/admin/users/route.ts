import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 20

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function GET(req: NextRequest) {
  try {
    // Check for admin email and password in custom headers
    const email = req.headers.get("x-admin-email")
    const password = req.headers.get("x-admin-password")
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🔐 Admin Authentication Check")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("Received Email:", JSON.stringify(email))
    console.log("Received Password:", JSON.stringify(password))
    console.log("Expected Email:", JSON.stringify(ADMIN_EMAIL))
    console.log("Expected Password:", JSON.stringify(ADMIN_PASSWORD))
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("Email Match:", email === ADMIN_EMAIL)
    console.log("Password Match:", password === ADMIN_PASSWORD)
    console.log("Both Present:", !!(email && password))
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    if (!email || !password || email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.log("❌ Authentication Failed - Reasons:")
      if (!email) console.log("  - Email is missing")
      if (!password) console.log("  - Password is missing")
      if (email && email !== ADMIN_EMAIL) console.log("  - Email mismatch")
      if (password && password !== ADMIN_PASSWORD) console.log("  - Password mismatch")
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      return NextResponse.json(
        { error: "Unauthorized - Invalid credentials" },
        { status: 401 }
      )
    }

    console.log("✅ Authentication Successful")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


    // Connect to database
    await connectDB()

    // Get all registrations
    const users = await RegistrationModel
      .find({})
      .sort({ createdAt: -1 })
      .lean()

    // Get statistics
    const totalUsers = users.length
    const successfulPayments = users.filter(u => u.paymentStatus === "success").length
    const pendingPayments = users.filter(u => u.paymentStatus === "pending").length
    const failedPayments = users.filter(u => u.paymentStatus === "failed").length

    // Group by ticket type
    const ticketStats = {
      Platinum: users.filter(u => u.ticketType === "Platinum").length,
      Gold: users.filter(u => u.ticketType === "Gold").length,
      Silver: users.filter(u => u.ticketType === "Silver").length,
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: totalUsers,
        payments: {
          success: successfulPayments,
          pending: pendingPayments,
          failed: failedPayments,
        },
        tickets: ticketStats,
      },
      users: users.map(user => ({
        id: user._id,
        registrationId: user.registrationId,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        chapterName: user.chapterName,
        category: user.category,
        ticketType: user.ticketType,
        paymentStatus: user.paymentStatus,
        paymentScreenshotUrl: (user as any).paymentScreenshotUrl || null,
        paymentId: user.paymentId,
        paymentReference: user.paymentReference,
        spouseName: user.spouseName,
        children: user.children,
        participations: user.participations,
        conclavGroups: user.conclavGroups,
        qrCode: user.qrCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// Optional: Get single user by registration ID
export async function POST(req: NextRequest) {
  try {
    // Check for admin email and password in custom headers
    const adminEmail = req.headers.get("x-admin-email")
    const adminPassword = req.headers.get("x-admin-password")
    
    if (!adminEmail || !adminPassword || adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid credentials" },
        { status: 401 }
      )
    }

    const { registrationId, email } = await req.json()

    if (!registrationId && !email) {
      return NextResponse.json(
        { error: "Provide registrationId or email" },
        { status: 400 }
      )
    }

    await connectDB()

    const query = registrationId 
      ? { registrationId } 
      : { email }

    const user = await RegistrationModel.findOne(query).lean()

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        registrationId: user.registrationId,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        chapterName: user.chapterName,
        category: user.category,
        ticketType: user.ticketType,
        paymentStatus: user.paymentStatus,
        paymentId: user.paymentId,
        paymentReference: user.paymentReference,
        spouseName: user.spouseName,
        children: user.children,
        participations: user.participations,
        conclavGroups: user.conclavGroups,
        qrCode: user.qrCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
