import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { RegistrationModel } from "@/lib/models"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    
    const { registrationId } = await req.json()

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Fetch registration data
    const registration = await RegistrationModel.findOne({ registrationId }).lean()

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Generate QR code
    const { generateQRCodeBuffer } = await import("@/lib/qr-generator")
    const qrBuffer = await generateQRCodeBuffer(registrationId)

    // Create PDF (using simple HTML-based approach)
    const pdfHTML = generateTicketPDF(
      registration.name,
      registrationId,
      registration.ticketType,
      registration.paymentReference || "N/A",
      qrBuffer.toString("base64"),
    )

    // Return PDF as response
    return NextResponse.json({
      success: true,
      pdf: pdfHTML,
      registrationId,
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

function generateTicketPDF(
  name: string,
  registrationId: string,
  ticketType: string,
  paymentRef: string,
  qrCodeBase64: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          .ticket { width: 800px; height: 400px; background: white; margin: 20px auto; border: 2px solid #FF6A00; border-radius: 12px; display: flex; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .ticket-left { flex: 1; background: linear-gradient(135deg, #FF6A00, #FF8C42); color: white; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
          .ticket-right { flex: 1; padding: 40px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
          .ticket-header { font-size: 14px; font-weight: 600; letter-spacing: 2px; margin-bottom: 20px; opacity: 0.9; }
          .ticket-title { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
          .ticket-subtitle { font-size: 18px; opacity: 0.95; margin-bottom: 24px; }
          .ticket-details { font-size: 13px; line-height: 1.8; opacity: 0.95; }
          .detail-line { margin-bottom: 12px; }
          .qr-code { width: 200px; height: 200px; margin-bottom: 20px; }
          .registration-id { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-align: center; color: #FF6A00; }
          .venue-info { position: absolute; bottom: 20px; left: 20px; font-size: 10px; color: #666; }
          @media print {
            body { margin: 0; }
            .ticket { margin: 0; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-left">
            <div class="ticket-header">CHESS EVENT 2025</div>
            <div class="ticket-title">Admit One</div>
            <div class="ticket-subtitle">${ticketType} Ticket</div>
            <div class="ticket-details">
              <div class="detail-line"><strong>Name:</strong> ${name}</div>
              <div class="detail-line"><strong>Registration:</strong> ${registrationId}</div>
              <div class="detail-line"><strong>Payment Ref:</strong> ${paymentRef}</div>
            </div>
          </div>
          <div class="ticket-right">
            <img src="data:image/png;base64,${qrCodeBase64}" alt="QR Code" class="qr-code">
            <div class="registration-id">${registrationId}</div>
          </div>
        </div>
        <div class="venue-info">
          The Grand Convention Center, New Delhi | 2025
        </div>
      </body>
    </html>
  `
}
