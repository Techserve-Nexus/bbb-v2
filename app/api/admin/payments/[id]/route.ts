import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import connectDB from "@/lib/db"
import { PaymentModel, RegistrationModel } from "@/lib/models"

export const runtime = "nodejs"
export const maxDuration = 30

/**
 * GET /api/admin/payments/[id]
 * 
 * Get full payment details by payment ID
 * Requires admin authentication
 * 
 * @param id - Payment ID (MongoDB _id)
 */
export async function GET(
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

    // Find payment
    const payment = await PaymentModel.findById(id).lean()

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      )
    }

    // Get associated registration
    const registration = await RegistrationModel.findOne({
      registrationId: (payment as any).registrationId,
    }).lean()

    return NextResponse.json({
      success: true,
      payment: {
        id: (payment as any)._id.toString(),
        registrationId: (payment as any).registrationId,
        razorpayOrderId: (payment as any).razorpayOrderId,
        razorpayPaymentId: (payment as any).razorpayPaymentId || null,
        razorpaySignature: (payment as any).razorpaySignature || null,
        amount: (payment as any).amount,
        status: (payment as any).status,
        createdAt: (payment as any).createdAt,
        updatedAt: (payment as any).updatedAt,
        registration: registration
          ? {
              id: (registration as any)._id.toString(),
              registrationId: registration.registrationId,
              name: registration.name,
              email: registration.email,
              contactNo: registration.contactNo,
              chapterName: registration.chapterName,
              category: registration.category,
              ticketType: registration.ticketType,
              paymentStatus: registration.paymentStatus,
              ticketStatus: registration.ticketStatus,
              paymentScreenshotUrl: (registration as any).paymentScreenshotUrl || null,
              spouseName: registration.spouseName,
              children: registration.children,
              participations: registration.participations,
              conclavGroups: registration.conclavGroups,
              createdAt: registration.createdAt,
              updatedAt: registration.updatedAt,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching payment details:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment details" },
      { status: 500 }
    )
  }
}
