import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/payments/reports
 * 
 * Generate payment reports with filtering
 * Requires admin authentication
 * 
 * Query params:
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - ticketType: Platinum | Gold | Silver
 * - status: success | pending | failed
 * - format: json | csv (default: json)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const auth = verifyAdminAuth(req)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const ticketType = searchParams.get("ticketType")
    const status = searchParams.get("status")
    const format = searchParams.get("format") || "json"

    // Build payment query
    const paymentQuery: any = {}
    
    if (status && status !== "all") {
      paymentQuery.status = status
    }

    if (dateFrom || dateTo) {
      paymentQuery.createdAt = {}
      if (dateFrom) paymentQuery.createdAt.$gte = new Date(dateFrom)
      if (dateTo) paymentQuery.createdAt.$lte = new Date(dateTo)
    }

    // Get all payments matching criteria
    const payments = await PaymentModel.find(paymentQuery).lean()

    // Get registrations for additional filtering
    const registrationIds = payments.map((p) => p.registrationId)
    const registrations = await RegistrationModel.find({
      registrationId: { $in: registrationIds },
    }).lean()

    // Create registration map
    const registrationMap = new Map()
    registrations.forEach((reg) => {
      registrationMap.set(reg.registrationId, reg)
    })

    // Filter by ticket type if specified
    let filteredPayments = payments.map((payment: any) => {
      const registration = registrationMap.get(payment.registrationId)
      return {
        payment,
        registration,
      }
    })

    if (ticketType && ticketType !== "all") {
      filteredPayments = filteredPayments.filter(
        (item) => item.registration?.ticketType === ticketType
      )
    }

    // Calculate statistics
    const stats = {
      totalPayments: filteredPayments.length,
      successfulPayments: filteredPayments.filter(
        (item) => item.payment.status === "success"
      ).length,
      pendingPayments: filteredPayments.filter(
        (item) => item.payment.status === "pending"
      ).length,
      failedPayments: filteredPayments.filter(
        (item) => item.payment.status === "failed"
      ).length,
      totalRevenue: filteredPayments
        .filter((item) => item.payment.status === "success")
        .reduce((sum, item) => sum + item.payment.amount, 0),
      averagePayment:
        filteredPayments.length > 0
          ? filteredPayments.reduce((sum, item) => sum + item.payment.amount, 0) /
            filteredPayments.length
          : 0,
      byTicketType: {
        Platinum: 0,
        Gold: 0,
        Silver: 0,
      },
      revenueByTicketType: {
        Platinum: 0,
        Gold: 0,
        Silver: 0,
      },
    }

    // Calculate by ticket type
    filteredPayments.forEach((item) => {
      if (item.registration && item.payment.status === "success") {
        const type = item.registration.ticketType as "Platinum" | "Gold" | "Silver"
        if (stats.byTicketType[type] !== undefined) {
          stats.byTicketType[type]++
          stats.revenueByTicketType[type] += item.payment.amount
        }
      }
    })

    // Format as CSV if requested
    if (format === "csv") {
      const csvRows = [
        [
          "Payment ID",
          "Registration ID",
          "Name",
          "Email",
          "Ticket Type",
          "Amount",
          "Status",
          "Razorpay Order ID",
          "Razorpay Payment ID",
          "Payment Date",
        ].join(","),
      ]

      filteredPayments.forEach((item) => {
        const { payment, registration } = item
        csvRows.push(
          [
            (payment as any)._id.toString(),
            payment.registrationId,
            registration?.name || "N/A",
            registration?.email || "N/A",
            registration?.ticketType || "N/A",
            payment.amount,
            payment.status,
            payment.razorpayOrderId,
            payment.razorpayPaymentId || "N/A",
            new Date(payment.createdAt).toISOString(),
          ]
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(",")
        )
      })

      return new NextResponse(csvRows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payment-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Return JSON format
    const detailedPayments = filteredPayments.map((item) => ({
      id: (item.payment as any)._id.toString(),
      registrationId: item.payment.registrationId,
      razorpayOrderId: item.payment.razorpayOrderId,
      razorpayPaymentId: item.payment.razorpayPaymentId || null,
      amount: item.payment.amount,
      status: item.payment.status,
      createdAt: item.payment.createdAt,
      updatedAt: item.payment.updatedAt,
      registration: item.registration
        ? {
            name: item.registration.name,
            email: item.registration.email,
            contactNo: item.registration.contactNo,
            ticketType: item.registration.ticketType,
            chapterName: item.registration.chapterName,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      stats,
      payments: detailedPayments,
      filters: {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        ticketType: ticketType || "all",
        status: status || "all",
      },
    })
  } catch (error) {
    console.error("❌ Error generating payment report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
