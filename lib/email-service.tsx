// Email service configuration and templates

interface EmailData {
  to: string
  registrationId: string
  name: string
  ticketType: string
  paymentRef: string
  qrCodeUrl: string
}

export async function sendTicketEmail(data: EmailData) {
  const htmlContent = generateTicketEmailHTML(data)

  // Using SendGrid or AWS SES via environment variables
  if (process.env.SENDGRID_API_KEY) {
    await sendViasendGrid(data.to, data.registrationId, data.name, htmlContent)
  } else {
    const response = await fetch("/api/email/send-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to send email")
    }
  }

  return { success: true }
}

export function generateTicketEmailHTML(data: EmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #222; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #FF6A00, #FF8C42); color: #FFFFFF; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 32px 24px; }
          .section { margin-bottom: 24px; }
          .section h2 { font-size: 18px; font-weight: 600; color: #222; margin-bottom: 12px; border-bottom: 2px solid #FF6A00; padding-bottom: 8px; }
          .ticket-details { background: #F5F5F5; border-left: 4px solid #FF6A00; padding: 16px; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .detail-label { font-weight: 600; color: #666; }
          .detail-value { color: #222; }
          .qr-section { text-align: center; padding: 24px 0; }
          .qr-code { width: 200px; height: 200px; display: inline-block; }
          .footer { background: #F9F9F9; padding: 24px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #E8E8E8; }
          .cta-button { display: inline-block; background: #FF6A00; color: #FFFFFF; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          @media (max-width: 600px) {
            .container { width: 100%; }
            .content { padding: 20px 16px; }
            .detail-row { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chess Event 2025</h1>
            <p>Your Ticket Confirmation</p>
          </div>

          <div class="content">
            <div class="section">
              <p>Hi <strong>${data.name}</strong>,</p>
              <p>Thank you for registering for Chess Event 2025! We're thrilled to have you join us. Below is your ticket information and QR code.</p>
            </div>

            <div class="section">
              <h2>Ticket Details</h2>
              <div class="ticket-details">
                <div class="detail-row">
                  <span class="detail-label">Registration ID:</span>
                  <span class="detail-value"><strong>${data.registrationId}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Ticket Type:</span>
                  <span class="detail-value"><strong>${data.ticketType}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment Reference:</span>
                  <span class="detail-value"><strong>${data.paymentRef}</strong></span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Your QR Code</h2>
              <div class="qr-section">
                <p>Please show this QR code at the venue for check-in:</p>
                <img src="${data.qrCodeUrl}" alt="QR Code" class="qr-code">
                <p style="font-size: 12px; color: #666;">Registration ID: ${data.registrationId}</p>
              </div>
            </div>

            <div class="section">
              <h2>Important Information</h2>
              <ul style="margin: 12px 0; padding-left: 20px;">
                <li>Please arrive 30 minutes before the event starts</li>
                <li>Bring a valid ID for verification</li>
                <li>Keep your QR code accessible on your phone or print it</li>
                <li>For any queries, contact: info@chessevent.com</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="https://chessevent.com" class="cta-button">View Event Details</a>
            </div>
          </div>

          <div class="footer">
            <p>&copy; 2025 Chess Event. All rights reserved.</p>
            <p>The Grand Convention Center, New Delhi | info@chessevent.com | +91 98765 43210</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function sendViasendGrid(to: string, registrationId: string, name: string, htmlContent: string) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: `Your Chess Event Ticket - ${registrationId}`,
        },
      ],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@chessevent.com",
        name: "Chess Event 2025",
      },
      content: [
        {
          type: "text/html",
          value: htmlContent,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error("SendGrid API error")
  }
}
