import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { SponsorRequestModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * POST /api/sponsor-requests
 * 
 * Submit a new sponsor request (public endpoint)
 * 
 * @body {
 *   companyName: string,
 *   contactPerson: string,
 *   email: string,
 *   phone: string,
 *   website: string,
 *   description: string,
 *   requestedAmount: number
 * }
 * @returns Success message with request ID
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const {
      companyName,
      contactPerson,
      email,
      phone,
      website,
      description,
      requestedAmount,
    } = body

    // Validate required fields
    if (!companyName || !contactPerson || !email || !phone || !website || !description || !requestedAmount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number. Please enter 10 digits." },
        { status: 400 }
      )
    }

    // Validate requested amount
    if (requestedAmount < 25000) {
      return NextResponse.json(
        { error: "Minimum sponsorship amount is ₹25,000" },
        { status: 400 }
      )
    }

    // Create sponsor request
    const sponsorRequest = await SponsorRequestModel.create({
      companyName,
      contactPerson,
      email,
      phone,
      website,
      description,
      requestedAmount,
      status: "pending",
    })

    console.log(`✅ New sponsor request created: ${companyName}`)

    return NextResponse.json({
      success: true,
      message: "Sponsor request submitted successfully. We will review your request and contact you soon.",
      requestId: sponsorRequest._id.toString(),
    })
  } catch (error: any) {
    console.error("❌ Error creating sponsor request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit sponsor request" },
      { status: 500 }
    )
  }
}
