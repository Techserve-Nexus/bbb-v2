import connectDB from "@/lib/db"
import { SpeakerModel } from "@/lib/models"
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
 * GET /api/admin/speakers
 * 
 * Get all speakers (including inactive) for admin management
 */
export async function GET(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const speakersData = await SpeakerModel.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    // Map _id to id for consistency
    const speakers = speakersData.map((speaker: any) => ({
      ...speaker,
      id: speaker._id.toString(),
    }))
    
    return NextResponse.json({ speakers })
  } catch (error: any) {
    console.error("❌ Error fetching speakers:", error)
    return NextResponse.json(
      { error: "Failed to fetch speakers" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/speakers
 * 
 * Add a new speaker
 */
export async function POST(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await req.json()
    const { name, photo, designation, bio, socialLink, order, isActive } = body

    // Validate required fields
    if (!name || !photo || !designation || !bio || !socialLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const speaker = await SpeakerModel.create({
      name,
      photo,
      designation,
      bio,
      socialLink,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    })

    return NextResponse.json({ 
      success: true, 
      speaker,
      message: "Speaker added successfully" 
    })
  } catch (error: any) {
    console.error("❌ Error creating speaker:", error)
    return NextResponse.json(
      { error: "Failed to create speaker" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/speakers
 * 
 * Update an existing speaker
 */
export async function PATCH(req: NextRequest) {
  try {
    if (!authenticateAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await req.json()
    const { id, name, photo, designation, bio, socialLink, order, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: "Speaker ID is required" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (photo !== undefined) updateData.photo = photo
    if (designation !== undefined) updateData.designation = designation
    if (bio !== undefined) updateData.bio = bio
    if (socialLink !== undefined) updateData.socialLink = socialLink
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const speaker = await SpeakerModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!speaker) {
      return NextResponse.json(
        { error: "Speaker not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      speaker,
      message: "Speaker updated successfully" 
    })
  } catch (error: any) {
    console.error("❌ Error updating speaker:", error)
    return NextResponse.json(
      { error: "Failed to update speaker" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/speakers
 * 
 * Delete a speaker
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
        { error: "Speaker ID is required" },
        { status: 400 }
      )
    }

    const speaker = await SpeakerModel.findByIdAndDelete(id)

    if (!speaker) {
      return NextResponse.json(
        { error: "Speaker not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Speaker deleted successfully" 
    })
  } catch (error: any) {
    console.error("❌ Error deleting speaker:", error)
    return NextResponse.json(
      { error: "Failed to delete speaker" },
      { status: 500 }
    )
  }
}
