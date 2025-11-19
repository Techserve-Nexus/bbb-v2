import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { VisitorModel } from "@/lib/models"
import { verifyAdminAuth } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const verifyResult = await verifyAdminAuth(req)
    if (!verifyResult.isValid) {
      return NextResponse.json(
        { success: false, error: verifyResult.error },
        { status: 401 }
      )
    }

    await connectDB()

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url)
    const page = searchParams.get("page") || "all"
    const limit = parseInt(searchParams.get("limit") || "100")

    // Total visitors count
    const totalVisitors = await VisitorModel.countDocuments()

    // Unique sessions count
    const uniqueSessions = await VisitorModel.distinct("sessionId").then(
      (sessions) => sessions.length
    )

    // Page views breakdown
    const pageBreakdown = await VisitorModel.aggregate([
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$sessionId" },
        },
      },
      {
        $project: {
          page: "$_id",
          views: "$count",
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
      { $sort: { views: -1 } },
    ])

    // Recent activity (last 100 visitors)
    const recentActivityQuery =
      page === "all" ? {} : { page: page }

    const recentActivity = await VisitorModel.find(recentActivityQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("ipAddress userAgent page referrer country city createdAt")
      .lean()

    // Today's visitors count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayVisitors = await VisitorModel.countDocuments({
      createdAt: { $gte: today },
    })

    // Referrer breakdown (top 10)
    const referrerBreakdown = await VisitorModel.aggregate([
      { $match: { referrer: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$referrer",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          referrer: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalVisitors,
        uniqueSessions,
        todayVisitors,
        pageBreakdown,
        referrerBreakdown,
        recentActivity,
      },
    })
  } catch (error: any) {
    console.error("Error fetching visitor analytics:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch visitor analytics" },
      { status: 500 }
    )
  }
}
