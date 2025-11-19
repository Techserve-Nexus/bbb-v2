import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { SettingsModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * POST /api/admin/migrate-participants
 * 
 * Migration endpoint to ensure participantsCount field exists
 * Requires admin authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    console.log("🔍 Finding Settings document...")
    let settings = await SettingsModel.findOne({})

    if (!settings) {
      console.log("📝 No Settings document found, creating one...")
      settings = await SettingsModel.create({
        registrationEnabled: true,
        siteName: "BBB Event",
        siteDescription: "Event Registration System",
        useRealStats: true,
        dummyStats: {
          totalRegistrations: 0,
          approvedRegistrations: 0,
          totalVisitors: 0,
        },
        participantsCount: 82,
      })
      console.log("✅ Settings document created with participantsCount: 82")
      
      return NextResponse.json({
        success: true,
        message: "Settings document created",
        participantsCount: 82,
        action: "created",
      })
    }

    console.log("📊 Current participantsCount:", settings.participantsCount)

    if (settings.participantsCount === undefined || settings.participantsCount === null) {
      console.log("➕ Adding participantsCount field...")
      settings.participantsCount = 82
      await settings.save()
      console.log("✅ participantsCount field added successfully!")
      
      return NextResponse.json({
        success: true,
        message: "participantsCount field added",
        participantsCount: 82,
        action: "migrated",
      })
    }

    console.log(`ℹ️ participantsCount already exists: ${settings.participantsCount}`)
    
    return NextResponse.json({
      success: true,
      message: "participantsCount field already exists",
      participantsCount: settings.participantsCount,
      action: "already_exists",
    })
  } catch (error: any) {
    console.error("❌ Error during migration:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Migration failed" },
      { status: 500 }
    )
  }
}
