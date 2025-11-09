import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/registrations/export
 * 
 * Export all registrations as CSV file
 * Requires admin authentication
 * 
 * @returns CSV file download
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    // Get all registrations
    const registrations = await RegistrationModel.find({})
      .sort({ createdAt: -1 })
      .lean()

    // CSV headers
    const headers = [
      "Registration ID",
      "Name",
      "Email",
      "Contact",
      "Chapter Name",
      "Category",
      "Ticket Type",
      "Payment Status",
      "Ticket Status",
      "Payment Reference",
      "Spouse Name",
      "Children Count",
      "Participations",
      "Conclav Groups",
      "Created At",
      "Updated At",
    ]

    // Convert to CSV rows
    const rows = registrations.map((reg) => {
      return [
        reg.registrationId || "",
        reg.name || "",
        reg.email || "",
        reg.contactNo || "",
        reg.chapterName || "",
        reg.category || "",
        reg.ticketType || "",
        reg.paymentStatus || "",
        reg.ticketStatus || "active",
        reg.paymentReference || "",
        reg.spouseName || "",
        reg.children?.length || 0,
        reg.participations?.join("; ") || "",
        reg.conclavGroups?.join("; ") || "",
        new Date(reg.createdAt).toLocaleString(),
        new Date(reg.updatedAt).toLocaleString(),
      ]
    })

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("❌ Error exporting registrations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to export registrations" },
      { status: 500 }
    )
  }
}
