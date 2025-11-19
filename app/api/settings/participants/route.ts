import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { SettingsModel } from "@/lib/models"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const settings = await SettingsModel.findOne()
    
    console.log("🔍 Settings document found:", settings ? "YES" : "NO")
    console.log("📊 Full settings object:", JSON.stringify(settings, null, 2))
    
    const participantsCount = settings?.participantsCount || 82

    console.log("Returning participants count:", participantsCount)

    return NextResponse.json({
      success: true,
      participantsCount,
    })
  } catch (error: any) {
    console.error("Error fetching participants count:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch participants count" },
      { status: 500 }
    )
  }
}
