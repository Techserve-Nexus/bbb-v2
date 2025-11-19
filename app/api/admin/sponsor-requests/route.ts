import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { SponsorRequestModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/sponsor-requests
 * 
 * Get all sponsor requests with filtering
 * Requires admin authentication
 * 
 * Query Parameters:
 * - status: pending|approved|rejected (filter by status)
 * - page: number (page number, default 1)
 * - limit: number (items per page, default 50)
 * 
 * @returns {
 *   requests: SponsorRequest[],
 *   pagination: { total, page, limit, pages }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Build query filter
    const filter: any = {}

    if (status && status !== "all") {
      filter.status = status
    }

    // Get total count for pagination
    const total = await SponsorRequestModel.countDocuments(filter)

    // Calculate pagination
    const skip = (page - 1) * limit
    const pages = Math.ceil(total / limit)

    // Fetch sponsor requests with pagination
    const requests = await SponsorRequestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Format response
    const formattedRequests = requests.map((req: any) => ({
      id: req._id.toString(),
      companyName: req.companyName,
      contactPerson: req.contactPerson,
      email: req.email,
      phone: req.phone,
      website: req.website,
      description: req.description,
      requestedAmount: req.requestedAmount,
      status: req.status,
      approvedCategory: req.approvedCategory,
      rejectionReason: req.rejectionReason,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching sponsor requests:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch sponsor requests" },
      { status: 500 }
    )
  }
}
