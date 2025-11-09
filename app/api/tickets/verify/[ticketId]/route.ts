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

    // Find ticket by registration ID
    const ticket = await RegistrationModel.findOne({
      registrationId: ticketId,
    }).lean()

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
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
