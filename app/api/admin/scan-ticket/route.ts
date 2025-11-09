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

    const { ticketId } = await req.json()

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    // Get registration by ticket ID (registrationId)
    const registration = await RegistrationModel.findOne({ registrationId: ticketId })

    if (!registration) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Return ticket details
    return NextResponse.json({
      success: true,
      ticket: {
        registrationId: registration.registrationId,
        name: registration.name,
        email: registration.email,
        contactNo: registration.contactNo,
        chapterName: registration.chapterName,
        category: registration.category,
        ticketType: registration.ticketType,
        paymentStatus: registration.paymentStatus,
        ticketStatus: registration.ticketStatus || "active",
        spouseName: registration.spouseName,
        children: registration.children,
        participations: registration.participations,
        conclavGroups: registration.conclavGroups,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error scanning ticket:", error)
    return NextResponse.json({ error: "Failed to scan ticket" }, { status: 500 })
  }
}
