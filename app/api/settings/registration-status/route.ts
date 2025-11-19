import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { SettingsModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 10

/**
 * GET /api/settings/registration-status
 * 
 * Get registration status (public endpoint)
 * 
 * @returns { registrationEnabled: boolean }
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Get settings
    let settings = await SettingsModel.findOne({})
    
    if (!settings) {
      // Default to enabled if no settings exist
      return NextResponse.json({
        success: true,
        registrationEnabled: true,
      })
    }

    return NextResponse.json({
      success: true,
      registrationEnabled: settings.registrationEnabled,
    })
  } catch (error) {
    console.error("❌ Error fetching registration status:", error)
    // Return enabled on error to not block registrations
    return NextResponse.json({
      success: true,
      registrationEnabled: true,
    })
  }
}
