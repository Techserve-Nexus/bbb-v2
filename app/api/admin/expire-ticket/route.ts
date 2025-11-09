import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get("x-admin-email")
    const adminPassword = req.headers.get("x-admin-password")

    if (
      !adminEmail ||
      !adminPassword ||
      adminEmail !== process.env.ADMIN_EMAIL ||
      adminPassword !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { ticketId, status } = await req.json()

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    if (!status || !["active", "expired", "used"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update ticket status
    const registration = await RegistrationModel.findOneAndUpdate(
      { registrationId: ticketId },
      { ticketStatus: status },
      { new: true }
    )

    if (!registration) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket: {
        registrationId: registration.registrationId,
        ticketStatus: registration.ticketStatus,
      },
    })
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return NextResponse.json({ error: "Failed to update ticket status" }, { status: 500 })
  }
}
