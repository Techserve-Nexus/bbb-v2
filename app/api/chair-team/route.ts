import connectDB from "@/lib/db"
import { ChairTeamModel } from "@/lib/models"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/chair-team
 * Public API to get all active chair team members sorted by order
 */
export async function GET() {
  try {
    await connectDB()
    const membersData = await ChairTeamModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    const members = membersData.map((member: any) => ({
      ...member,
      id: member._id.toString(),
    }))
    return NextResponse.json({ members })
  } catch (error: any) {
    console.error("Error fetching chair team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch chair team members" },
      { status: 500 }
    )
  }
}
