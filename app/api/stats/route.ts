import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel, VisitorModel, SettingsModel } from "@/lib/models"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Get settings to check if admin wants real or dummy stats
    const settings = await SettingsModel.findOne()
    
    console.log("📊 Stats API - Settings found:", {
      exists: !!settings,
      useRealStats: settings?.useRealStats,
      hasDummyStats: !!settings?.dummyStats,
      dummyStats: settings?.dummyStats,
    })
    
    // If admin has configured dummy stats, return those
    if (settings && !settings.useRealStats && settings.dummyStats) {
      console.log("✅ Returning DUMMY stats:", settings.dummyStats)
      return NextResponse.json({
        success: true,
        data: {
          totalRegistrations: settings.dummyStats.totalRegistrations || 0,
          approvedRegistrations: settings.dummyStats.approvedRegistrations || 0,
          totalVisitors: settings.dummyStats.totalVisitors || 0,
        },
      })
    }

    console.log("✅ Returning REAL stats from database")
    
    // Otherwise, return real database stats
    const totalRegistrations = await RegistrationModel.countDocuments()

    // Get approved registrations count (paymentStatus = "success")
    const approvedRegistrations = await RegistrationModel.countDocuments({
      paymentStatus: "success",
    })

    // Get total unique visitors count (distinct sessionId)
    const totalVisitors = await VisitorModel.distinct("sessionId").then(
      (sessions) => sessions.length
    )

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations,
        approvedRegistrations,
        totalVisitors,
      },
    })
  } catch (error: any) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
