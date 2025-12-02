import connectDB from "@/lib/db"
import { ShreeMemberModel } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Admin authentication helper
function authenticateAdmin(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  const adminPassword = req.headers.get("x-admin-password")

  const validEmail = process.env.ADMIN_EMAIL
  const validPassword = process.env.ADMIN_PASSWORD

  if (adminEmail !== validEmail || adminPassword !== validPassword) {
    return false
  }
  return true
}

/**
 * GET /api/admin/shree-members
 * 
 * Get all shree members (including inactive) for admin management
 */
export async function GET(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const membersData = await ShreeMemberModel.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    // Map _id to id for consistency
    const members = membersData.map((member: any) => ({
      ...member,
      id: member._id.toString(),
    }))
    
    return NextResponse.json({ members })
  } catch (error: any) {
    console.error("❌ Error fetching shree members:", error)
    return NextResponse.json(
      { error: "Failed to fetch shree members" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/shree-members
 * 
 * Add a new shree member
 */
export async function POST(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await req.json()
    const { name, photo, role, bio, youtubeUrl, order, isActive } = body

    // Validate required fields
    if (!name || !photo || !role || !bio) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate YouTube URL if provided
    if (youtubeUrl && !isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
        { status: 400 }
      )
    }

    const member = await ShreeMemberModel.create({
      name,
      photo,
      role,
      bio,
      youtubeUrl: youtubeUrl || "",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    })

    return NextResponse.json({ 
      success: true, 
      member,
      message: "Shree member added successfully" 
    })
  } catch (error: any) {
    console.error("❌ Error creating shree member:", error)
    return NextResponse.json(
      { error: "Failed to create shree member" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/shree-members
 * 
 * Update an existing shree member
 */
export async function PATCH(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await req.json()
    const { id, name, photo, role, bio, youtubeUrl, order, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      )
    }

    // Validate YouTube URL if provided
    if (youtubeUrl !== undefined && youtubeUrl && !isValidYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (photo !== undefined) updateData.photo = photo
    if (role !== undefined) updateData.role = role
    if (bio !== undefined) updateData.bio = bio
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const member = await ShreeMemberModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      member,
      message: "Shree member updated successfully" 
    })
  } catch (error: any) {
    console.error("❌ Error updating shree member:", error)
    return NextResponse.json(
      { error: "Failed to update shree member" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/shree-members
 * 
 * Delete a shree member
 */
export async function DELETE(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      )
    }

    const member = await ShreeMemberModel.findByIdAndDelete(id)

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Shree member deleted successfully" 
    })
  } catch (error: any) {
    console.error("❌ Error deleting shree member:", error)
    return NextResponse.json(
      { error: "Failed to delete shree member" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to validate YouTube URL
 * Accepts various YouTube URL formats and extracts video ID
 */
function isValidYouTubeUrl(url: string): boolean {
  if (!url) return true // Empty is valid
  
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ]
  
  return patterns.some(pattern => pattern.test(url))
}
