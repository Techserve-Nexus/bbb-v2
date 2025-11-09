import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * PATCH /api/admin/registrations/[id]
 * 
 * Update registration details
 * Requires admin authentication
 * 
 * @param id - Registration ID (registrationId, not MongoDB _id)
 * @body Partial registration data to update
 * @returns Updated registration
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

    // Find registration
    const registration = await RegistrationModel.findOne({ registrationId: id })

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      )
    }

    // Update fields
    const allowedFields = [
      "name",
      "email",
      "contactNo",
      "chapterName",
      "category",
      "ticketType",
      "paymentStatus",
      "ticketStatus",
      "spouseName",
      "children",
      "participations",
      "conclavGroups",
    ]

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        ;(registration as any)[field] = body[field]
      }
    })

    await registration.save()

    console.log(`✅ Registration ${id} updated by admin`)

    return NextResponse.json({
      success: true,
      message: "Registration updated successfully",
      registration: {
        id: registration._id.toString(),
        registrationId: registration.registrationId,
        name: registration.name,
        email: registration.email,
        ticketType: registration.ticketType,
        paymentStatus: registration.paymentStatus,
        ticketStatus: registration.ticketStatus,
      },
    })
  } catch (error) {
    console.error("❌ Error updating registration:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update registration" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/registrations/[id]
 * 
 * Soft delete registration (mark as cancelled)
 * Requires admin authentication
 * 
 * @param id - Registration ID (registrationId, not MongoDB _id)
 * @returns Success message
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

    // Find and update registration
    const registration = await RegistrationModel.findOneAndUpdate(
      { registrationId: id },
      {
        paymentStatus: "failed",
        ticketStatus: "expired",
      },
      { new: true }
    )

    if (!registration) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      )
    }

    console.log(`🗑️ Registration ${id} soft deleted by admin`)

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting registration:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete registration" },
      { status: 500 }
    )
  }
}
