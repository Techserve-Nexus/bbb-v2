import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { SettingsModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/settings
 * 
 * Get current settings
 * Requires admin authentication
 * 
 * @returns Settings object
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    // Get settings (create default if doesn't exist)
    let settings = await SettingsModel.findOne({"siteName": "BBB Event"})
    
    if (!settings) {
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
    }

    return NextResponse.json({
      success: true,
      settings: {
        registrationEnabled: settings.registrationEnabled,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        useRealStats: settings.useRealStats,
        dummyStats: settings.dummyStats,
        participantsCount: settings.participantsCount,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings
 * 
 * Update settings
 * Requires admin authentication
 * 
 * @body Partial settings data to update
 * @returns Updated settings
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    
    console.log("📥 Received body:", JSON.stringify(body, null, 2))

    // Get or create settings
    let settings = await SettingsModel.findOne({"siteName": "BBB Event"})
    
    console.log(" Existing settings found:", settings ? "YES" : "NO")
    
    if (!settings) {
      console.log("Creating new settings document...")
      settings = await SettingsModel.create({
        registrationEnabled: body.registrationEnabled ?? true,
        siteName: body.siteName || "BBB Event",
        siteDescription: body.siteDescription || "Event Registration System",
        useRealStats: body.useRealStats ?? true,
        dummyStats: body.dummyStats || {
          totalRegistrations: 0,
          approvedRegistrations: 0,
          totalVisitors: 0,
        },
        participantsCount: body.participantsCount ?? 82,
      })
      console.log("New settings created with participantsCount:", settings.participantsCount)
    } else {
      console.log("Updating existing settings...")
      console.log("Current participantsCount before update:", settings.participantsCount)
      
      // Update fields
      if (body.registrationEnabled !== undefined) {
        settings.registrationEnabled = body.registrationEnabled
      }
      if (body.siteName !== undefined) {
        settings.siteName = body.siteName
      }
      if (body.siteDescription !== undefined) {
        settings.siteDescription = body.siteDescription
      }
      if (body.useRealStats !== undefined) {
        settings.useRealStats = body.useRealStats
      }
      if (body.dummyStats !== undefined) {
        settings.dummyStats = body.dummyStats
      }
      if (body.participantsCount !== undefined) {
        console.log(`Updating participantsCount from ${settings.participantsCount} to ${body.participantsCount}`)
        settings.participantsCount = body.participantsCount
      }
      await settings.save()
      console.log(`Settings saved to database. New participantsCount: ${settings.participantsCount}`)
    }

    console.log(`✅ Settings updated by admin: ${auth.email}`)

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        registrationEnabled: settings.registrationEnabled,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        useRealStats: settings.useRealStats,
        dummyStats: settings.dummyStats,
        participantsCount: settings.participantsCount,
      },
    })
  } catch (error) {
    console.error("❌ Error updating settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
