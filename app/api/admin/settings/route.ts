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
    let settings = await SettingsModel.findOne({})
    
    if (!settings) {
      settings = await SettingsModel.create({
        registrationEnabled: true,
        siteName: "BBB Event",
        siteDescription: "Event Registration System",
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        registrationEnabled: settings.registrationEnabled,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
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

    // Get or create settings
    let settings = await SettingsModel.findOne({})
    
    if (!settings) {
      settings = await SettingsModel.create({
        registrationEnabled: body.registrationEnabled ?? true,
        siteName: body.siteName || "BBB Event",
        siteDescription: body.siteDescription || "Event Registration System",
      })
    } else {
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
      await settings.save()
    }

    console.log(`✅ Settings updated by admin: ${auth.email}`)

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        registrationEnabled: settings.registrationEnabled,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
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
