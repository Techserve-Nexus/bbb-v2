import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { SponsorModel } from "@/lib/models"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * PATCH /api/admin/sponsors/[id]
 * 
 * Update sponsor details
 * Requires admin authentication
 * 
 * @param id - Sponsor ID (MongoDB _id)
 * @body Partial sponsor data to update
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const body = await req.json()

    // Find sponsor
    const sponsor = await SponsorModel.findById(id)

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      )
    }

    // Handle logo update if new logo provided
    if (body.logo && body.logo !== sponsor.logo) {
      try {
        // Upload new logo
        const uploadResult = await uploadToCloudinary(body.logo, "sponsors")
        body.logo = uploadResult.url

        // Delete old logo if it's a Cloudinary URL
        if (sponsor.logo.includes("cloudinary")) {
          try {
            const publicId = sponsor.logo.split("/").slice(-2).join("/").split(".")[0]
            await deleteFromCloudinary(publicId)
          } catch (deleteError) {
            console.warn("Failed to delete old logo:", deleteError)
            // Continue even if delete fails
          }
        }
      } catch (uploadError) {
        console.error("❌ Error uploading new logo:", uploadError)
        return NextResponse.json(
          { success: false, error: "Failed to upload new logo" },
          { status: 500 }
        )
      }
    }

    // Update fields
    const allowedFields = ["name", "logo", "website", "category", "description", "socialLinks"]
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        ;(sponsor as any)[field] = body[field]
      }
    })

    await sponsor.save()

    console.log(`✅ Sponsor updated: ${sponsor.name}`)

    return NextResponse.json({
      success: true,
      message: "Sponsor updated successfully",
      sponsor: {
        id: sponsor._id.toString(),
        name: sponsor.name,
        logo: sponsor.logo,
        website: sponsor.website,
        category: sponsor.category,
        description: sponsor.description,
        socialLinks: sponsor.socialLinks,
      },
    })
  } catch (error) {
    console.error("❌ Error updating sponsor:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update sponsor" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/sponsors/[id]
 * 
 * Delete sponsor
 * Requires admin authentication
 * 
 * @param id - Sponsor ID (MongoDB _id)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    // Find and delete sponsor
    const sponsor = await SponsorModel.findByIdAndDelete(id)

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      )
    }

    // Delete logo from Cloudinary if it's a Cloudinary URL
    if (sponsor.logo.includes("cloudinary")) {
      try {
        const publicId = sponsor.logo.split("/").slice(-2).join("/").split(".")[0]
        await deleteFromCloudinary(publicId)
      } catch (deleteError) {
        console.warn("Failed to delete logo from Cloudinary:", deleteError)
        // Continue even if delete fails
      }
    }

    console.log(`🗑️ Sponsor deleted: ${sponsor.name}`)

    return NextResponse.json({
      success: true,
      message: "Sponsor deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting sponsor:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete sponsor" },
      { status: 500 }
    )
  }
}
