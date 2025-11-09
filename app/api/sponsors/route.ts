import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { SponsorModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30
export const dynamic = "force-dynamic"

/**
 * GET /api/sponsors
 * 
 * Public API to get all active sponsors
 * No authentication required
 */
export async function GET() {
  try {
    await connectDB()
    console.log('✅ Connected to DB for sponsors API')

    // Get all sponsors sorted by category (Platinum > Gold > Silver)
    const categoryOrder = { Platinum: 1, Gold: 2, Silver: 3 }
    
    const sponsors = await SponsorModel.find()
      .sort({ createdAt: -1 })
      .lean()

    console.log(`📊 Found ${sponsors.length} sponsors in database`)
    sponsors.forEach((s: any) => console.log(`  - ${s.name} (${s.category})`))

    // Sort by category priority
    const sortedSponsors = sponsors.sort((a: any, b: any) => {
      return categoryOrder[a.category as keyof typeof categoryOrder] - categoryOrder[b.category as keyof typeof categoryOrder]
    })

    const formattedSponsors = sortedSponsors.map((sponsor: any) => ({
      id: sponsor._id.toString(),
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website,
      category: sponsor.category,
      description: sponsor.description,
      socialLinks: sponsor.socialLinks && typeof sponsor.socialLinks === 'object' 
        ? (sponsor.socialLinks instanceof Map 
          ? Object.fromEntries(sponsor.socialLinks) 
          : sponsor.socialLinks)
        : {},
    }))

    return NextResponse.json({
      success: true,
      sponsors: formattedSponsors,
      total: formattedSponsors.length,
    })
  } catch (error: any) {
    console.error("Error fetching sponsors:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch sponsors" },
      { status: 500 }
    )
  }
}
