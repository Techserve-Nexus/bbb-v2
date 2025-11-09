import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    const registrationId = req.nextUrl.searchParams.get("registrationId")

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Fetch registration
    const registration = await RegistrationModel.findOne({ registrationId }).lean()

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Generate QR code
    const { generateQRCodeBuffer } = await import("@/lib/qr-generator")
    const qrBuffer = await generateQRCodeBuffer(registrationId)

    // Generate HTML ticket (would be converted to PDF in production)
    const htmlTicket = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Ticket - ${registrationId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #F5F5F5; }
            .ticket { width: 800px; height: 400px; background: white; margin: 0 auto; border: 2px solid #FF6A00; border-radius: 12px; display: flex; overflow: hidden; }
            .ticket-left { flex: 1; background: linear-gradient(135deg, #FF6A00, #FF8C42); color: white; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
            .ticket-right { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .ticket-header { font-size: 14px; font-weight: 600; letter-spacing: 2px; margin-bottom: 20px; opacity: 0.9; }
            .ticket-title { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
            .ticket-subtitle { font-size: 18px; opacity: 0.95; margin-bottom: 24px; }
            .ticket-details { font-size: 13px; line-height: 1.8; opacity: 0.95; }
            .detail-line { margin-bottom: 12px; }
            .qr-code { width: 200px; height: 200px; margin-bottom: 20px; }
            .registration-id { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-align: center; color: #FF6A00; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-left">
              <div class="ticket-header">CHESS EVENT 2025</div>
              <div class="ticket-title">Admit One</div>
              <div class="ticket-subtitle">${registration.ticketType} Ticket</div>
              <div class="ticket-details">
                <div class="detail-line"><strong>Name:</strong> ${registration.name}</div>
                <div class="detail-line"><strong>Registration:</strong> ${registrationId}</div>
                <div class="detail-line"><strong>Payment Ref:</strong> ${registration.paymentReference}</div>
              </div>
            </div>
            <div class="ticket-right">
              <img src="data:image/png;base64,${qrBuffer.toString("base64")}" alt="QR Code" class="qr-code">
              <div class="registration-id">${registrationId}</div>
            </div>
          </div>
        </body>
      </html>
    `

    return new NextResponse(htmlTicket, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="ticket-${registrationId}.html"`,
      },
    })
  } catch (error) {
    console.error("Error downloading ticket:", error)
    return NextResponse.json({ error: "Failed to download ticket" }, { status: 500 })
  }
}
