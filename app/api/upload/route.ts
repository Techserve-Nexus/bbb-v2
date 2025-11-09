import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const maxDuration = 20 // Max 20 seconds for upload

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(image, "payment-screenshots")

    return NextResponse.json({
      success: true,
      url,
      publicId,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
