import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 10

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Find ticket by registrationId first
    let ticket = await RegistrationModel.findOne({ registrationId: ticketId }).lean()

    // If not found, be tolerant and try matching by Mongo _id (24 hex chars)
    // Some older QR images or exports may have encoded an objectId instead
    if (!ticket) {
      const objectIdPattern = /^[0-9a-fA-F]{24}$/
      if (objectIdPattern.test(ticketId)) {
        try {
          ticket = await RegistrationModel.findById(ticketId).lean()
        } catch (err) {
          // ignore and fall through to not found
          console.warn('Failed to lookup ticket by _id:', err)
        }
      }
    }

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Return ticket information
    return NextResponse.json({
      success: true,
      ticket: {
        registrationId: ticket.registrationId,
        name: ticket.name,
        email: ticket.email,
        contactNo: ticket.contactNo,
        chapterName: ticket.chapterName,
        category: ticket.category,
        ticketType: ticket.ticketType,
        paymentStatus: ticket.paymentStatus,
        paymentScreenshotUrl: (ticket as any).paymentScreenshotUrl || null,
        spouseName: ticket.spouseName,
        children: ticket.children,
        participations: ticket.participations,
        conclavGroups: ticket.conclavGroups,
        qrCode: ticket.qrCode,
        createdAt: ticket.createdAt,
        personTickets: ticket.personTickets || [],
      },
    })
  } catch (error: any) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json(
      { error: "Failed to fetch ticket information" },
      { status: 500 }
    )
  }
}
