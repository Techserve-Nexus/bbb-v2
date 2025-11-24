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
      "Referred By",
      "Ticket Type(s)",
      "Payment Status",
      "Ticket Status",
      "Payment Reference",
      "Guest Status",
      "Spouse Name",
      "Children Count",
      "Family Tickets",
      "Participations",
      "Conclav Groups",
      "Created At",
      "Updated At",
    ]

    // Convert to CSV rows
    const rows = registrations.map((reg) => {
      // Format personTickets for CSV
      let familyTickets = ""
      if (reg.personTickets && reg.personTickets.length > 0) {
        familyTickets = reg.personTickets
          .map((person: any) => {
            const tickets = person.tickets?.join(", ") || "None"
            const age = person.age ? ` (${person.age})` : ""
            return `${person.personType}: ${person.name}${age} - ${tickets}`
          })
          .join(" | ")
      }

      return [
        reg.registrationId || "",
        reg.name || "",
        reg.email || "",
        reg.contactNo || "",
        reg.chapterName || "",
        reg.category || "",
        reg.referredBy || "",
        // Prefer the flattened list of ticket types (all selected tickets). Fallback to legacy `ticketType`.
        (reg.ticketTypes && reg.ticketTypes.length > 0)
          ? reg.ticketTypes.join(", ")
          : reg.ticketType || "",
        reg.paymentStatus || "",
        reg.ticketStatus || "active",
        reg.paymentReference || "",
        reg.isGuest ? "Guest" : "Member",
        reg.spouseName || "",
        reg.children?.length || 0,
        familyTickets,
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
