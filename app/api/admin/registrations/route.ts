import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/registrations
 * 
 * Get all registrations with filtering, search, and pagination
 * Requires admin authentication
 * 
 * Query Parameters:
 * - status: pending|success|failed (filter by payment status)
 * - ticketType: Platinum|Gold|Silver (filter by ticket type)
 * - ticketStatus: active|expired|used (filter by ticket status)
 * - search: string (search in name, email, registrationId)
 * - page: number (page number, default 1)
 * - limit: number (items per page, default 50)
 * - sortBy: createdAt|name|ticketType (sort field)
 * - sortOrder: asc|desc (sort order, default desc)
 * 
 * @returns {
 *   registrations: Registration[],
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
    const status = searchParams.get("status") // payment status
    const ticketType = searchParams.get("ticketType")
    const ticketStatus = searchParams.get("ticketStatus")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build query filter
    const filter: any = {}

    if (status) {
      filter.paymentStatus = status
    }

    if (ticketType) {
      filter.ticketType = ticketType
    }

    if (ticketStatus) {
      filter.ticketStatus = ticketStatus
    }

    // Search in multiple fields
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { registrationId: { $regex: search, $options: "i" } },
        { contactNo: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await RegistrationModel.countDocuments(filter)

    // Calculate pagination
    const skip = (page - 1) * limit
    const pages = Math.ceil(total / limit)

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Fetch registrations with pagination
    const registrations = await RegistrationModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Format response
    const formattedRegistrations = registrations.map((reg: any) => ({
      id: reg._id.toString(),
      registrationId: reg.registrationId,
      name: reg.name,
      email: reg.email,
      contactNo: reg.contactNo,
      chapterName: reg.chapterName,
      category: reg.category,
      ticketType: reg.ticketType,
      paymentStatus: reg.paymentStatus,
      ticketStatus: reg.ticketStatus || "active",
      paymentReference: reg.paymentReference,
      paymentScreenshotUrl: reg.paymentScreenshotUrl,
      spouseName: reg.spouseName,
      children: reg.children,
      participations: reg.participations,
      conclavGroups: reg.conclavGroups,
      qrCode: reg.qrCode,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
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
    console.error("❌ Error fetching registrations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
}
