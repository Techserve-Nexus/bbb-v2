import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { VisitorModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * POST /api/track-visitor
 * 
 * Track visitor activity
 * Public endpoint - no authentication required
 * 
 * @body page - Page visited
 * @body sessionId - Unique session identifier
 * @body referrer - Optional referrer URL
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { page, sessionId, referrer } = body

    // Get IP address
    const forwarded = req.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown"

    // Get user agent
    const userAgent = req.headers.get("user-agent") || "unknown"

    // Check if this session already visited this page (prevent duplicates within 5 minutes)
    const recentVisit = await VisitorModel.findOne({
      sessionId,
      page,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    })

    if (recentVisit) {
      // Don't track duplicate visit
      return NextResponse.json({ success: true, message: "Already tracked" })
    }

    // Create visitor log
    await VisitorModel.create({
      ipAddress,
      userAgent,
      page,
      sessionId,
      referrer: referrer || null,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error tracking visitor:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to track visitor" },
      { status: 500 }
    )
  }
}
