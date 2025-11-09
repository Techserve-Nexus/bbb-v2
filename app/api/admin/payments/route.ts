import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/payments
 * 
 * Get all payments with filtering and pagination
 * Requires admin authentication
 * 
 * Query params:
 * - status: success | pending | failed
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 * - search: search in registrationId, razorpayOrderId
 * - page: page number (default: 1)
 * - limit: items per page (default: 20)
 * - sortBy: field to sort by (default: createdAt)
 * - sortOrder: asc | desc (default: desc)
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
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    
    // Filters
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1

    // Build query
    const query: any = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }

    if (search) {
      query.$or = [
        { registrationId: { $regex: search, $options: "i" } },
        { razorpayOrderId: { $regex: search, $options: "i" } },
        { razorpayPaymentId: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await PaymentModel.countDocuments(query)

    // Get payments with pagination
    const payments = await PaymentModel.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get associated registration details
    const paymentsWithRegistrations = await Promise.all(
      payments.map(async (payment: any) => {
        const registration = await RegistrationModel.findOne({
          registrationId: payment.registrationId,
        }).lean()

        return {
          id: payment._id.toString(),
          registrationId: payment.registrationId,
          paymentMethod: payment.paymentMethod || "razorpay", // Add payment method
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId || null,
          razorpaySignature: payment.razorpaySignature || null,
          // Manual payment fields
          upiId: payment.upiId || null,
          transactionId: payment.transactionId || null,
          verifiedBy: payment.verifiedBy || null,
          verificationNotes: payment.verificationNotes || null,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          // Registration details
          registration: registration
            ? {
                name: registration.name,
                email: registration.email,
                contactNo: registration.contactNo,
                ticketType: registration.ticketType,
                chapterName: registration.chapterName,
                paymentScreenshotUrl: (registration as any).paymentScreenshotUrl || null,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      payments: paymentsWithRegistrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching payments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}
