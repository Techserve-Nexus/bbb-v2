import connectDB from "@/lib/db"
import { SpeakerModel } from "@/lib/models"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/speakers
 * 
 * Public API to get all active speakers sorted by order
 */
export async function GET() {
  try {
    await connectDB()
    
    const speakersData = await SpeakerModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    // Map _id to id for consistency
    const speakers = speakersData.map((speaker: any) => ({
      ...speaker,
      id: speaker._id.toString(),
    }))
    
    return NextResponse.json({ speakers })
  } catch (error: any) {
    console.error("Error fetching speakers:", error)
    return NextResponse.json(
      { error: "Failed to fetch speakers" },
      { status: 500 }
    )
  }
}
