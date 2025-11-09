import QRCode from "qrcode"

/**
 * Generate QR code with ticket verification URL
 * @param ticketId - Registration ID for ticket verification
 * @returns Data URL of QR code image
 */
export async function generateTicketQRCode(ticketId: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/ticket/${ticketId}`
    
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction for better scanning
    })
    return qrCode
  } catch (error) {
    console.error("Error generating ticket QR code:", error)
    throw error
  }
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 200,
      margin: 1,
      color: {
        dark: "#FF6A00",
        light: "#FFFFFF",
      },
    })
    return qrCode
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw error
  }
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const qrCode = await QRCode.toBuffer(data, {
      width: 200,
      margin: 1,
      color: {
        dark: "#FF6A00",
        light: "#FFFFFF",
      },
    })
    return qrCode
  } catch (error) {
    console.error("Error generating QR code buffer:", error)
    throw error
  }
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#FF6A00",
        light: "#FFFFFF",
      },
    })
    return qrCode
  } catch (error) {
    console.error("Error generating QR code data URL:", error)
    throw error
  }
}
