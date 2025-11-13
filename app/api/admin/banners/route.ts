import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { BannerModel } from "@/lib/models"
import { verifyAdminAuth } from "@/lib/admin-auth"

// GET - List all banners (admin only)
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = verifyAdminAuth(req)
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: adminAuth.error || "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    // Fetch all banners sorted by order
    const banners = await BannerModel.find().sort({ order: 1 })
    
    return NextResponse.json({ 
      success: true, 
      banners: banners.map(b => ({
        id: b._id.toString(),
        title: b.title,
        desktopImage: b.desktopImage,
        tabletImage: b.tabletImage,
        mobileImage: b.mobileImage,
        priority: b.priority,
        isActive: b.isActive,
        order: b.order,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }))
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    )
  }
}

// POST - Create new banner (admin only)
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = verifyAdminAuth(req)
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: adminAuth.error || "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    
    const body = await req.json()
    const { title, desktopImage, tabletImage, mobileImage, priority, isActive, order } = body

    // Validate required fields
    if (!title || !desktopImage || !tabletImage || !mobileImage) {
      return NextResponse.json(
        { error: "Missing required fields: title, desktopImage, tabletImage, mobileImage" },
        { status: 400 }
      )
    }

    // Get highest order number and increment
    const maxOrderBanner = await BannerModel.findOne().sort({ order: -1 })
    const nextOrder = maxOrderBanner ? maxOrderBanner.order + 1 : 0

    // Create new banner
    const newBanner = await BannerModel.create({
      title,
      desktopImage,
      tabletImage,
      mobileImage,
      priority: priority || false,
      isActive: isActive !== undefined ? isActive : true,
      order: order !== undefined ? order : nextOrder,
    })

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      banner: {
        id: newBanner._id.toString(),
        title: newBanner.title,
        desktopImage: newBanner.desktopImage,
        tabletImage: newBanner.tabletImage,
        mobileImage: newBanner.mobileImage,
        priority: newBanner.priority,
        isActive: newBanner.isActive,
        order: newBanner.order,
        createdAt: newBanner.createdAt,
        updatedAt: newBanner.updatedAt,
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    )
  }
}
