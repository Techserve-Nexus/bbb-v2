import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDB()
    
    const count = await RegistrationModel.countDocuments({ 
      paymentStatus: "success" 
    })

    return NextResponse.json({
      count,
    })
  } catch (error) {
    console.error("Error fetching count:", error)
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 })
  }
}
