import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { BannerModel } from "@/lib/models"

// GET - Fetch active banners (public endpoint)
export async function GET() {
  try {
    await connectDB()
    
    // Fetch only active banners, sorted by order
    const banners = await BannerModel.find({ isActive: true }).sort({ order: 1 })
    
    return NextResponse.json({
      success: true,
      banners: banners.map(b => ({
        id: b._id.toString(),
        desktop: {
          src: b.desktopImage,
          alt: b.title + " - Desktop"
        },
        tablet: {
          src: b.tabletImage,
          alt: b.title + " - Tablet"
        },
        mobile: {
          src: b.mobileImage,
          alt: b.title + " - Mobile"
        },
        priority: b.priority,
      }))
    })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch banners",
        banners: [] // Return empty array on error
      },
      { status: 500 }
    )
  }
}
