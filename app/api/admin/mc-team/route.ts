import connectDB from "@/lib/db"
import { MCTeamModel } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function authenticateAdmin(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  const adminPassword = req.headers.get("x-admin-password")
  const validEmail = process.env.ADMIN_EMAIL
  const validPassword = process.env.ADMIN_PASSWORD
  return adminEmail === validEmail && adminPassword === validPassword
}

export async function GET(req: NextRequest) {
  try {
    // Public GET: no authentication required
    await connectDB()
    const membersData = await MCTeamModel.find({})
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

export async function POST(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await connectDB()
    const body = await req.json()
    const { name, photo, designation, firm, description, phone, email, order, isActive } = body
    if (!name || !photo || !designation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    const member = await MCTeamModel.create({
      name,
      photo,
      designation,
      firm,
      description,
      phone,
      email,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    })
    return NextResponse.json({ success: true, member, message: "MC team member added successfully" })
  } catch (error: any) {
    console.error("Error creating MC team member:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create MC team member", details: error },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await connectDB()
    const body = await req.json()
    const { id, name, photo, designation, firm, description, phone, email, order, isActive } = body
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      )
    }
    const member = await MCTeamModel.findByIdAndUpdate(id, {
      name,
      photo,
      designation,
      firm,
      description,
      phone,
      email,
      order,
      isActive,
    }, { new: true })
    if (!member) {
      return NextResponse.json(
        { error: "MC team member not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, member, message: "MC team member updated successfully" })
  } catch (error: any) {
    console.error("Error updating MC team member:", error)
    return NextResponse.json(
      { error: "Failed to update MC team member" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await connectDB()
    const body = await req.json()
    const { id } = body
    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      )
    }
    const member = await MCTeamModel.findByIdAndDelete(id)
    if (!member) {
      return NextResponse.json(
        { error: "MC team member not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, message: "MC team member deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting MC team member:", error)
    return NextResponse.json(
      { error: "Failed to delete MC team member" },
      { status: 500 }
    )
  }
}
