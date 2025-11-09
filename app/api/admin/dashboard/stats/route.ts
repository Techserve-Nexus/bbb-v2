import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/dashboard/stats
 * 
 * Get comprehensive dashboard statistics
 * Requires admin authentication
 * 
 * @returns {
 *   totalParticipants: number,
 *   totalRevenue: number,
 *   ticketsSold: { platinum: number, gold: number, silver: number },
 *   pendingPayments: number,
 *   recentRegistrations: Registration[],
 *   trends: { daily: Array }
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

    // Get all registrations
    const allRegistrations = await RegistrationModel.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Calculate total participants
    const totalParticipants = allRegistrations.length

    // Calculate tickets sold by type
    const ticketsSold = {
      platinum: allRegistrations.filter((r) => r.ticketType === "Platinum").length,
      gold: allRegistrations.filter((r) => r.ticketType === "Gold").length,
      silver: allRegistrations.filter((r) => r.ticketType === "Silver").length,
    }

    // Calculate total revenue (only from successful payments)
    const ticketPrices: Record<string, number> = {
      Platinum: 3000,
      Gold: 2000,
      Silver: 1000,
    }

    const totalRevenue = allRegistrations
      .filter((r) => r.paymentStatus === "success")
      .reduce((sum, r) => {
        return sum + (ticketPrices[r.ticketType] || 0)
      }, 0)

    // Count pending payments
    const pendingPayments = allRegistrations.filter((r) => r.paymentStatus === "pending").length

    // Count successful payments
    const successfulPayments = allRegistrations.filter((r) => r.paymentStatus === "success").length

    // Count failed payments
    const failedPayments = allRegistrations.filter((r) => r.paymentStatus === "failed").length

    // Get recent registrations (last 10)
    const recentRegistrations = allRegistrations.slice(0, 10).map((r) => ({
      id: r._id,
      registrationId: r.registrationId,
      name: r.name,
      email: r.email,
      ticketType: r.ticketType,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt,
    }))

    // Calculate daily trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayRegistrations = allRegistrations.filter((r) => {
        const regDate = new Date(r.createdAt)
        return regDate >= date && regDate < nextDate
      })

      const dayRevenue = dayRegistrations
        .filter((r) => r.paymentStatus === "success")
        .reduce((sum, r) => sum + (ticketPrices[r.ticketType] || 0), 0)

      dailyTrends.push({
        date: date.toISOString().split("T")[0],
        registrations: dayRegistrations.length,
        revenue: dayRevenue,
      })
    }

    // Calculate growth percentage (compare last 7 days with previous 7 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const lastWeekCount = allRegistrations.filter((r) => {
      const regDate = new Date(r.createdAt)
      return regDate >= sevenDaysAgo
    }).length

    const previousWeekCount = allRegistrations.filter((r) => {
      const regDate = new Date(r.createdAt)
      return regDate >= fourteenDaysAgo && regDate < sevenDaysAgo
    }).length

    const growthPercentage =
      previousWeekCount > 0 ? ((lastWeekCount - previousWeekCount) / previousWeekCount) * 100 : 0

    // Return stats
    return NextResponse.json({
      success: true,
      stats: {
        totalParticipants,
        totalRevenue,
        ticketsSold,
        pendingPayments,
        successfulPayments,
        failedPayments,
        recentRegistrations,
        trends: {
          daily: dailyTrends,
          growthPercentage: Math.round(growthPercentage * 10) / 10,
        },
      },
    })
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}
