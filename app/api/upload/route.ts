import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const maxDuration = 20 // Max 20 seconds for upload

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""
    
    // Handle multipart/form-data (File uploads from banner management)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File
      const folder = (formData.get("folder") as string) || "uploads"

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 })
      }

      // Convert File to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`

      // Upload to Cloudinary with specific folder
      const { url, publicId } = await uploadToCloudinary(base64Image, folder)

      return NextResponse.json({
        success: true,
        url,
        publicId,
      })
    }
    
    // Handle JSON (base64 images from payment screenshots)
    const { image, folder } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(image, folder || "payment-screenshots")

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
