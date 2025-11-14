import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { SponsorRequestModel, SponsorModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * PATCH /api/admin/sponsor-requests/[id]
 * 
 * Approve or reject sponsor request
 * On approval, creates actual sponsor entry
 * Requires admin authentication
 * 
 * @param id - Sponsor request ID
 * @body {
 *   action: "approve" | "reject",
 *   category?: "Tamaram" | "Tamaram+" | "Rajatham" | "Suvarnam" | "Vajram" | "Pradhan_Poshak",
 *   logo?: string,
 *   rejectionReason?: string
 * }
 * @returns Updated request or created sponsor
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const body = await req.json()
    const { action, category, logo, rejectionReason } = body

    // Find sponsor request
    const request = await SponsorRequestModel.findById(id)

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Sponsor request not found" },
        { status: 404 }
      )
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "This request has already been processed" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      // Validate required fields for approval
      if (!category || !logo) {
        return NextResponse.json(
          { error: "Category and logo are required for approval" },
          { status: 400 }
        )
      }

      // Get price based on category
      const categoryPrices: Record<string, number> = {
        "Tamaram": 25000,
        "Tamaram+": 50000,
        "Rajatham": 100000,
        "Suvarnam": 200000,
        "Vajram": 300000,
        "Pradhan_Poshak": 500000,
      }

      const price = categoryPrices[category]

      // Create actual sponsor entry
      const sponsor = await SponsorModel.create({
        name: request.companyName,
        logo: logo,
        website: request.website,
        sponsorCategory: category,
        price: price,
        description: request.description,
        socialLinks: {},
      })

      // Update request status
      request.status = "approved"
      request.approvedCategory = category
      await request.save()

      console.log(`✅ Sponsor request approved and sponsor created: ${request.companyName}`)

      return NextResponse.json({
        success: true,
        message: "Sponsor request approved and sponsor created successfully",
        request: {
          id: request._id.toString(),
          status: request.status,
          approvedCategory: request.approvedCategory,
        },
        sponsor: {
          id: sponsor._id.toString(),
          name: sponsor.name,
          sponsorCategory: sponsor.sponsorCategory,
        },
      })
    } else if (action === "reject") {
      // Reject the request
      request.status = "rejected"
      request.rejectionReason = rejectionReason || "Not specified"
      await request.save()

      console.log(`❌ Sponsor request rejected: ${request.companyName}`)

      return NextResponse.json({
        success: true,
        message: "Sponsor request rejected",
        request: {
          id: request._id.toString(),
          status: request.status,
          rejectionReason: request.rejectionReason,
        },
      })
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("❌ Error processing sponsor request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process sponsor request" },
      { status: 500 }
    )
  }
}
