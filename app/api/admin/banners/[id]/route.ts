import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { BannerModel } from "@/lib/models"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET - Get single banner by ID (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = verifyAdminAuth(req)
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: adminAuth.error || "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { id } = await params
    const banner = await BannerModel.findById(id)
    
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      banner: {
        id: banner._id.toString(),
        title: banner.title,
        desktopImage: banner.desktopImage,
        tabletImage: banner.tabletImage,
        mobileImage: banner.mobileImage,
        priority: banner.priority,
        isActive: banner.isActive,
        order: banner.order,
        createdAt: banner.createdAt,
        updatedAt: banner.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    )
  }
}

// PUT - Update banner by ID (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = verifyAdminAuth(req)
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: adminAuth.error || "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await req.json()
    const { title, desktopImage, tabletImage, mobileImage, priority, isActive, order } = body

    // Find and update banner
    const { id } = await params
    const banner = await BannerModel.findById(id)
    
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    // Update fields
    if (title !== undefined) banner.title = title
    if (desktopImage !== undefined) banner.desktopImage = desktopImage
    if (tabletImage !== undefined) banner.tabletImage = tabletImage
    if (mobileImage !== undefined) banner.mobileImage = mobileImage
    if (priority !== undefined) banner.priority = priority
    if (isActive !== undefined) banner.isActive = isActive
    if (order !== undefined) banner.order = order

    await banner.save()

    return NextResponse.json({
      success: true,
      message: "Banner updated successfully",
      banner: {
        id: banner._id.toString(),
        title: banner.title,
        desktopImage: banner.desktopImage,
        tabletImage: banner.tabletImage,
        mobileImage: banner.mobileImage,
        priority: banner.priority,
        isActive: banner.isActive,
        order: banner.order,
        createdAt: banner.createdAt,
        updatedAt: banner.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    )
  }
}

// DELETE - Delete banner by ID (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminAuth = verifyAdminAuth(req)
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: adminAuth.error || "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const { id } = await params
    const banner = await BannerModel.findById(id)
    
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    await BannerModel.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    )
  }
}
