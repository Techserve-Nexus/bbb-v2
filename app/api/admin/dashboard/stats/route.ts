import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { RegistrationModel, VisitorModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/dashboard/stats
 * 
 * Get comprehensive dashboard statistics
 * Requires admin authentication
 * 
 * @returns {
 *   totalParticipants: number (total people count from personTickets),
 *   totalRegistrations: number (total registration count),
 *   totalRevenue: number,
 *   ticketsSold: { businessConclave: number, chess: number },
 *   pendingPayments: number,
 *   guestStats: { guest: number, member: number },
 *   familyBreakdown: { self: number, spouse: number, children: number },
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

    // Calculate total registrations
    const totalRegistrations = allRegistrations.length

    // Calculate total participants (people count from personTickets)
    let totalParticipants = 0
    let totalBusinessConclave = 0
    let totalChess = 0
    let totalSelf = 0
    let totalSpouse = 0
    let totalChildren = 0

    allRegistrations.forEach((reg: any) => {
      if (reg.personTickets && reg.personTickets.length > 0) {
        reg.personTickets.forEach((person: any) => {
          totalParticipants++
          
          // Count person types
          if (person.personType === "self") totalSelf++
          else if (person.personType === "spouse") totalSpouse++
          else if (person.personType === "child") totalChildren++

          // Count ticket types
          if (person.tickets && person.tickets.length > 0) {
            person.tickets.forEach((ticket: string) => {
              if (ticket === "Business_Conclave") totalBusinessConclave++
              else if (ticket === "Chess") totalChess++
            })
          }
        })
      }
    })

    // Calculate tickets sold by type
    const ticketsSold = {
      businessConclave: totalBusinessConclave,
      chess: totalChess,
    }

    // Guest vs Member statistics
    const guestCount = allRegistrations.filter((r: any) => r.isGuest === true).length
    const memberCount = allRegistrations.filter((r: any) => r.isGuest !== true).length

    // Family breakdown
    const familyBreakdown = {
      self: totalSelf,
      spouse: totalSpouse,
      children: totalChildren,
    }

    // Calculate total revenue (only from successful payments)
    const ticketPrices: Record<string, number> = {
      Business_Conclave: 2000,
      Chess: 1000,
    }

    let totalRevenue = 0
    allRegistrations
      .filter((r: any) => r.paymentStatus === "success")
      .forEach((reg: any) => {
        if (reg.personTickets && reg.personTickets.length > 0) {
          reg.personTickets.forEach((person: any) => {
            if (person.tickets && person.tickets.length > 0) {
              person.tickets.forEach((ticket: string) => {
                totalRevenue += ticketPrices[ticket] || 0
              })
            }
          })
        }
      })

    // Count pending payments
    const pendingPayments = allRegistrations.filter((r: any) => r.paymentStatus === "pending").length

    // Count successful payments
    const successfulPayments = allRegistrations.filter((r: any) => r.paymentStatus === "success").length

    // Count failed payments
    const failedPayments = allRegistrations.filter((r: any) => r.paymentStatus === "failed").length

    // Get recent registrations (last 10)
    const recentRegistrations = allRegistrations.slice(0, 10).map((r: any) => ({
      id: r._id,
      registrationId: r.registrationId,
      name: r.name,
      email: r.email,
      ticketType: r.personTickets && r.personTickets.length > 0 
        ? r.personTickets[0].tickets?.join(", ") || "N/A"
        : r.ticketType || "N/A",
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

      const dayRegistrations = allRegistrations.filter((r: any) => {
        const regDate = new Date(r.createdAt)
        return regDate >= date && regDate < nextDate
      })

      let dayRevenue = 0
      dayRegistrations
        .filter((r: any) => r.paymentStatus === "success")
        .forEach((reg: any) => {
          if (reg.personTickets && reg.personTickets.length > 0) {
            reg.personTickets.forEach((person: any) => {
              if (person.tickets && person.tickets.length > 0) {
                person.tickets.forEach((ticket: string) => {
                  dayRevenue += ticketPrices[ticket] || 0
                })
              }
            })
          }
        })

      dailyTrends.push({
        date: date.toISOString().split("T")[0],
        registrations: dayRegistrations.length,
        revenue: dayRevenue,
      })
    }

    // Calculate growth percentage (compare last 7 days with previous 7 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const lastWeekCount = allRegistrations.filter((r: any) => {
      const regDate = new Date(r.createdAt)
      return regDate >= sevenDaysAgo
    }).length

    const previousWeekCount = allRegistrations.filter((r: any) => {
      const regDate = new Date(r.createdAt)
      return regDate >= fourteenDaysAgo && regDate < sevenDaysAgo
    }).length

    const growthPercentage =
      previousWeekCount > 0 ? ((lastWeekCount - previousWeekCount) / previousWeekCount) * 100 : 0

    // Get visitor statistics
    const totalVisitors = await VisitorModel.countDocuments()
    const uniqueVisitors = await VisitorModel.distinct("sessionId").then(
      (sessions) => sessions.length
    )
    
    // Today's visitors
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayVisitors = await VisitorModel.countDocuments({
      createdAt: { $gte: today },
    })

    // Return stats
    return NextResponse.json({
      success: true,
      stats: {
        totalParticipants, // Total people count
        totalRegistrations, // Total registration count
        totalRevenue,
        ticketsSold,
        pendingPayments,
        successfulPayments,
        failedPayments,
        guestStats: {
          guest: guestCount,
          member: memberCount,
        },
        familyBreakdown,
        recentRegistrations,
        trends: {
          daily: dailyTrends,
          growthPercentage: Math.round(growthPercentage * 10) / 10,
        },
        visitors: {
          total: totalVisitors,
          unique: uniqueVisitors,
          today: todayVisitors,
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
