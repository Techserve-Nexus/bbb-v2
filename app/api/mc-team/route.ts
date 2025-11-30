import connectDB from "@/lib/db"
import { MCTeamModel } from "@/lib/models"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/mc-team
 * Public API to get all active MC team members sorted by order
 */
export async function GET() {
  try {
    await connectDB()
    const membersData = await MCTeamModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    const members = membersData.map((member: any) => ({
      ...member,
      id: member._id.toString(),
    }))
    return NextResponse.json({ members })
  } catch (error: any) {
    console.error("Error fetching MC team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch MC team members" },
      { status: 500 }
    )
  }
}
