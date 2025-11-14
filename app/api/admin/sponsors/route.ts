import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { SponsorModel } from "@/lib/models"
import { uploadToCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/sponsors
 * 
 * Get all sponsors with optional filtering
 * Requires admin authentication
 * 
 * Query params:
 * - category: Platinum | Gold | Silver
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      console.error("❌ Sponsors GET: Unauthorized", auth.error)
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    console.log("✅ Sponsors GET: Auth verified")
    await connectDB()
    console.log("✅ Sponsors GET: DB connected")

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")

    // Build query
    const query: any = {}
    if (category && category !== "all") {
      query.sponsorCategory = category
    }

    console.log("🔍 Sponsors GET: Query", query)

    // Get sponsors
    const sponsors = await SponsorModel.find(query)
      .sort({ price: -1, createdAt: -1 })
      .lean()

    console.log(`✅ Sponsors GET: Found ${sponsors.length} sponsors`)

    const formattedSponsors = sponsors.map((sponsor: any) => ({
      id: sponsor._id.toString(),
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website,
      sponsorCategory: sponsor.sponsorCategory,
      price: sponsor.price,
      description: sponsor.description,
      socialLinks: sponsor.socialLinks && typeof sponsor.socialLinks === 'object' 
        ? (sponsor.socialLinks instanceof Map 
          ? Object.fromEntries(sponsor.socialLinks) 
          : sponsor.socialLinks)
        : {},
      createdAt: sponsor.createdAt,
      updatedAt: sponsor.updatedAt,
    }))

    console.log(`✅ Sponsors GET: Returning ${formattedSponsors.length} formatted sponsors`)

    return NextResponse.json({
      success: true,
      sponsors: formattedSponsors,
      total: formattedSponsors.length,
    })
  } catch (error: any) {
    console.error("❌ Error fetching sponsors:", error)
    console.error("❌ Error stack:", error.stack)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sponsors" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/sponsors
 * 
 * Create a new sponsor
 * Requires admin authentication
 * 
 * @body name - Sponsor name
 * @body logo - Base64 encoded logo image
 * @body website - Website URL
 * @body category - Platinum | Gold | Silver
 * @body description - Sponsor description
 * @body socialLinks - Optional social media links
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()
    console.log("✅ DB connected for sponsor creation")

    const body = await req.json()
    const { name, logo, website, sponsorCategory, price, description, socialLinks } = body

    console.log("📝 Creating sponsor with data:", { name, website, sponsorCategory, price })

    // Validate required fields
    if (!name || !logo || !website || !sponsorCategory || !price || !description) {
      console.error("❌ Missing required fields:", { name: !!name, logo: !!logo, website: !!website, sponsorCategory: !!sponsorCategory, price: !!price, description: !!description })
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate sponsor category
    if (!["Tamaram", "Tamaram+", "Rajatham", "Suvarnam", "Vajram", "Pradhan_Poshak"].includes(sponsorCategory)) {
      console.error("❌ Invalid sponsor category:", sponsorCategory)
      return NextResponse.json(
        { success: false, error: "Invalid sponsor category" },
        { status: 400 }
      )
    }

    // Upload logo to Cloudinary
    let logoUrl = logo
    try {
      console.log("📤 Uploading logo to Cloudinary...")
      const uploadResult = await uploadToCloudinary(logo, "sponsors")
      logoUrl = uploadResult.url
      console.log("✅ Logo uploaded successfully:", logoUrl)
    } catch (uploadError: any) {
      console.error("❌ Error uploading logo:", uploadError)
      console.error("❌ Error details:", uploadError.message)
      return NextResponse.json(
        { success: false, error: `Failed to upload logo: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Create sponsor
    try {
      console.log("💾 Creating sponsor in database...")
      const sponsor = await SponsorModel.create({
        name,
        logo: logoUrl,
        website,
        sponsorCategory,
        price,
        description,
        socialLinks: socialLinks || {},
      })

      console.log(`✅ Sponsor created successfully: ${name} (${sponsorCategory})`)

      return NextResponse.json({
        success: true,
        message: "Sponsor created successfully",
        sponsor: {
          id: sponsor._id.toString(),
          name: sponsor.name,
          logo: sponsor.logo,
          website: sponsor.website,
          sponsorCategory: sponsor.sponsorCategory,
          price: sponsor.price,
          description: sponsor.description,
          socialLinks: sponsor.socialLinks,
        },
      })
    } catch (dbError: any) {
      console.error("❌ Error creating sponsor in database:", dbError)
      console.error("❌ DB Error message:", dbError.message)
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("❌ Error creating sponsor:", error)
    console.error("❌ Error message:", error.message)
    console.error("❌ Error stack:", error.stack)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create sponsor" },
      { status: 500 }
    )
  }
}