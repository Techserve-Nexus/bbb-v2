import connectDB from "@/lib/db"
import { ShreeMemberModel } from "@/lib/models"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/shree-members
 * 
 * Public API to get all active shree members sorted by order
 */
export async function GET() {
  try {
    await connectDB()
    
    const membersData = await ShreeMemberModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    // Map _id to id for consistency
    const members = membersData.map((member: any) => ({
      ...member,
      id: member._id.toString(),
    }))
    
    return NextResponse.json({ members })
  } catch (error: any) {
    console.error("Error fetching shree members:", error)
    return NextResponse.json(
      { error: "Failed to fetch shree members" },
      { status: 500 }
    )
  }
}
