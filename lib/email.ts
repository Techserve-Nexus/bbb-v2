import nodemailer from "nodemailer"
import emailConfig from "./email-config.json"

// Helper function to replace placeholders in strings
const replacePlaceholders = (text: string, data: Record<string, string>) => {
  return text.replace(/\{(\w+)\}/g, (match, key) => data[key] || match)
}

// Helper function to generate email header
const getEmailHeader = (title: string) => {
  const colors = emailConfig.branding.colors
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); padding: ${emailConfig.emailTemplates.header.padding}; text-align: center;">
      <tr>
        <td>
          <h1 style="margin: 0 0 10px; font-size: 32px; font-weight: 700; color: ${emailConfig.emailTemplates.header.textColor}; letter-spacing: -0.5px;">
            ${title}
          </h1>
          <p style="margin: 0; font-size: 18px; color: rgba(255,255,255,0.95); font-weight: 500;">
            ${emailConfig.organization.name}
          </p>
        </td>
      </tr>
    </table>
  `
}

// Helper function to generate email footer
const getEmailFooter = () => {
  const footer = emailConfig.emailTemplates.footer
  const socialLinks = footer.socialLinks
    .map(link => `<a href="${link.url}" style="color: ${emailConfig.branding.colors.primary}; text-decoration: none; margin: 0 8px; font-size: 20px;">${link.icon}</a>`)
    .join('')
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${footer.backgroundColor}; padding: ${footer.padding};">
      <tr>
        <td style="text-align: center;">
          ${footer.showSocialLinks ? `
            <div style="margin-bottom: 20px;">
              ${socialLinks}
            </div>
          ` : ''}
          <p style="margin: 0 0 10px; font-size: 14px; color: ${footer.textColor}; line-height: 1.6;">
            ${footer.addressLine1}<br/>
            ${footer.addressLine2}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: ${footer.textColor};">
            ${emailConfig.event.contactNumber} | ${emailConfig.organization.supportEmail}
          </p>
          <p style="margin: 0; font-size: 12px; color: ${footer.textColor};">
            ${footer.copyrightText}
          </p>
        </td>
      </tr>
    </table>
  `
}

// Email configuration for serverless environment
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Important for serverless
  pool: false, // Disable connection pooling
  maxConnections: 1,
  maxMessages: 1,
}

// Create transporter with timeout handling
export const createTransporter = () => {
  try {
    return nodemailer.createTransport(SMTP_CONFIG)
  } catch (error) {
    console.error("Failed to create email transporter:", error)
    throw new Error("Email service configuration error")
  }
}

// Send email with timeout and error handling (serverless-friendly)
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  attachments,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: any[]
  replyTo?: string
}) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: {
      name: emailConfig.smtp.from.name,
      address: process.env.SMTP_FROM || emailConfig.smtp.from.email,
    },
    replyTo: replyTo || emailConfig.smtp.replyTo.email,
    to,
    subject,
    html,
    text: text || "",
    attachments: attachments || [],
  }

  try {
    // Set timeout for serverless (max 10 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email send timeout")), 10000)
    )

    const sendPromise = transporter.sendMail(mailOptions)

    const info = await Promise.race([sendPromise, timeoutPromise])

    console.log("Email sent successfully:", { to, subject, messageId: (info as any).messageId })
    
    // Close connection (important for serverless)
    transporter.close()
    
    return { success: true, messageId: (info as any).messageId }
  } catch (error) {
    console.error("Email send error:", error)
    transporter.close()
    throw error
  }
}

// Registration confirmation email template
export const getRegistrationEmailTemplate = ({
  name,
  registrationId,
  ticketType,
  email,
  contactNo,
  chapterName,
}: {
  name: string
  registrationId: string
  ticketType: string
  email: string
  contactNo: string
  chapterName: string
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .ticket-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .ticket-id {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      text-align: center;
      margin: 10px 0;
    }
    .details {
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
    }
    .note {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Registration Successful!</h1>
      <p style="margin: 10px 0 0;">Chess Event 2025</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${name}</strong>,</p>
      
      <p>Thank you for registering for Chess Event 2025! Your registration has been received successfully.</p>
      
      <div class="ticket-box">
        <p style="margin: 0; text-align: center; color: #666;">Your Registration ID</p>
        <div class="ticket-id">${registrationId}</div>
        <p style="margin: 0; text-align: center; font-size: 12px; color: #999;">Please save this ID for future reference</p>
      </div>
      
      <div class="details">
        <h3>Registration Details:</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact:</span>
          <span class="detail-value">${contactNo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Chapter:</span>
          <span class="detail-value">${chapterName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ticket Type:</span>
          <span class="detail-value"><strong>${ticketType}</strong></span>
        </div>
      </div>
      
      <div class="note">
        <strong>⏳ Payment Pending</strong>
        <p style="margin: 10px 0 0;">Your payment is currently under review. You will receive another email once your payment is verified and your ticket is confirmed.</p>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br><strong>Chess Event 2025 Team</strong></p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
      <p>&copy; 2025 Chess Event. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Payment verification email template
export const getPaymentVerifiedEmailTemplate = ({
  name,
  registrationId,
  ticketType,
  status,
  reason,
}: {
  name: string
  registrationId: string
  ticketType?: string
  status: "approved" | "rejected"
  reason?: string
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const ticketUrl = `${baseUrl}/ticket/${registrationId}`
  
  if (status === "rejected") {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verification - Action Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 50px 40px; text-align: center;">
              <h1 style="margin: 0 0 10px; font-size: 32px; font-weight: 700; color: #ffffff;">
                ❌ Payment Not Verified
              </h1>
              <p style="margin: 0; font-size: 18px; color: rgba(255,255,255,0.95);">
                Action Required
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #27272a;">
                Dear <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #52525b; line-height: 1.6;">
                Unfortunately, we were unable to verify your payment for registration <strong>${registrationId}</strong>.
              </p>
              
              <!-- Error Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fee; border-left: 4px solid #ef4444; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #991b1b;">
                      Reason for Rejection:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6;">
                      ${reason || "Payment details could not be verified. Please check your payment screenshot and ensure the transaction ID and amount are clearly visible."}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #18181b;">
                What You Can Do:
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top; width: 30px;">
                    <span style="display: inline-block; width: 24px; height: 24px; background: #fef3f0; border-radius: 6px; text-align: center; line-height: 24px;">1️⃣</span>
                  </td>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; font-size: 14px; color: #3f3f46;">Verify your payment screenshot is clear and contains all transaction details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="display: inline-block; width: 24px; height: 24px; background: #fef3f0; border-radius: 6px; text-align: center; line-height: 24px;">2️⃣</span>
                  </td>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; font-size: 14px; color: #3f3f46;">Ensure the transaction amount matches your ticket type</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="display: inline-block; width: 24px; height: 24px; background: #fef3f0; border-radius: 6px; text-align: center; line-height: 24px;">3️⃣</span>
                  </td>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; font-size: 14px; color: #3f3f46;">Contact our support team if you believe this is an error</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="display: inline-block; width: 24px; height: 24px; background: #fef3f0; border-radius: 6px; text-align: center; line-height: 24px;">4️⃣</span>
                  </td>
                  <td style="padding: 12px 0;">
                    <p style="margin: 0; font-size: 14px; color: #3f3f46;">You can register again with correct payment details</p>
                  </td>
                </tr>
              </table>
              
              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                <tr>
                  <td style="border-radius: 10px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); text-align: center;">
                    <a href="${baseUrl}/register" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Register Again
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #71717a; font-weight: 600;">
                Need Help?
              </p>
              <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                Email: <a href="mailto:techserve.developer@gmail.com" style="color: #FF6B35; text-decoration: none;">techserve.developer@gmail.com</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 13px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 15px;">
                &copy; 2025 BBB Chess Championship. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
    `
  }
  
  // Approved status
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified Successfully</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 40px; text-align: center;">
              <h1 style="margin: 0 0 10px; font-size: 32px; font-weight: 700; color: #ffffff;">
                ✅ Payment Verified
              </h1>
              <p style="margin: 0; font-size: 18px; color: rgba(255,255,255,0.95);">
                Your registration is confirmed!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #27272a;">
                Dear <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #52525b; line-height: 1.6;">
                Great news! Your payment has been successfully verified. Your registration for the BBB Chess Championship 2025 is now <strong style="color: #10b981;">confirmed</strong>.
              </p>
              
              <!-- Success Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="width: 50%;">
                          <p style="margin: 0 0 4px; font-size: 13px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Registration ID</p>
                          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #15803d; font-family: 'Courier New', monospace;">${registrationId}</p>
                        </td>
                        <td style="width: 50%; text-align: right;">
                          <p style="margin: 0 0 4px; font-size: 13px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Type</p>
                          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #15803d;">${ticketType || 'Standard'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #52525b; line-height: 1.6;">
                Your official event ticket will be sent to you in a separate email shortly. Please check your inbox (and spam folder) for an email with your ticket and QR code.
              </p>
              
              <!-- View Ticket Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
                <tr>
                  <td style="border-radius: 10px; background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); text-align: center; box-shadow: 0 4px 14px rgba(255, 107, 53, 0.3);">
                    <a href="${ticketUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      🎟️ View Your Ticket
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #1e40af;">
                      📱 Access Your Ticket Online
                    </p>
                    <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">
                      You can view and download your ticket anytime:
                    </p>
                    <p style="margin: 0; font-size: 13px; word-break: break-all;">
                      <a href="${ticketUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">${ticketUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; font-size: 16px; font-weight: 600; color: #18181b;">
                What's Next?
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="display: inline-block; width: 6px; height: 6px; background: #FF6B35; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>
                    <span style="font-size: 14px; color: #3f3f46;">Watch for your ticket email with QR code</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="display: inline-block; width: 6px; height: 6px; background: #FF6B35; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>
                    <span style="font-size: 14px; color: #3f3f46;">Save your ticket or take a screenshot</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="display: inline-block; width: 6px; height: 6px; background: #FF6B35; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>
                    <span style="font-size: 14px; color: #3f3f46;">Arrive at the venue 30 minutes early</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="display: inline-block; width: 6px; height: 6px; background: #FF6B35; border-radius: 50%; margin-right: 12px; vertical-align: middle;"></span>
                    <span style="font-size: 14px; color: #3f3f46;">Bring a valid ID for verification</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 8px; font-size: 15px; color: #27272a;">
                Thank you for registering!
              </p>
              <p style="margin: 0; font-size: 15px; color: #FF6B35; font-weight: 700;">
                BBB Chess Championship Team
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #71717a; font-weight: 600;">
                Questions or Concerns?
              </p>
              <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                Contact us: <a href="mailto:techserve.developer@gmail.com" style="color: #FF6B35; text-decoration: none;">techserve.developer@gmail.com</a>
              </p>
              <p style="margin: 15px 0 0; font-size: 13px; color: #a1a1aa; border-top: 1px solid #e4e4e7; padding-top: 15px;">
                &copy; 2025 BBB Chess Championship. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `
}

// Ticket email template
export const getTicketEmailTemplate = ({
  name,
  registrationId,
  ticketType,
  qrCodeUrl,
}: {
  name: string
  registrationId: string
  ticketType: string
  qrCodeUrl?: string
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || emailConfig.event.websiteUrl
  const ticketUrl = `${baseUrl}/ticket/${registrationId}`
  const config = emailConfig.ticketEmail
  const colors = emailConfig.branding.colors
  
  // Replace placeholders in CTA URL
  const ctaUrl = config.ctaButton.url
    .replace('{appUrl}', baseUrl)
    .replace('{registrationId}', registrationId)
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replacePlaceholders(config.subject, { registrationId })}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Wrapper Table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);" class="container">
          
          <!-- Header -->
          <tr>
            <td>
              ${getEmailHeader(config.heading)}
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #27272a; line-height: 1.6;">
                Dear <strong style="color: #18181b;">${name}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #52525b; line-height: 1.6;">
                ${config.subheading}
              </p>
            </td>
          </tr>
          
          <!-- Ticket Card -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 3px solid ${colors.primary}; border-radius: 16px; overflow: hidden; background: linear-gradient(to bottom, #ffffff 0%, #fef3f0 100%);">
                
                <!-- Ticket Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); padding: 25px 30px; text-align: center; border-bottom: 2px dashed rgba(255,255,255,0.3);">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="text-align: left;">
                          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Entry Pass</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700;">${ticketType}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- QR Code Section -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <div style="background: #ffffff; border: 2px solid #e4e4e7; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                      ${qrCodeUrl ? `
                        <img src="cid:qrcode" alt="Entry QR Code" style="display: block; width: 220px; height: 220px; border-radius: 8px;" width="220" height="220" />
                      ` : `
                        <div style="width: 220px; height: 220px; background: #f4f4f5; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          <p style="margin: 0; color: #a1a1aa; font-size: 14px;">QR Code</p>
                        </div>
                      `}
                    </div>
                    
                    <p style="margin: 0 0 8px; font-size: 14px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Registration ID</p>
                    <p style="margin: 0; font-size: 28px; color: #18181b; font-weight: 700; letter-spacing: -0.5px; font-family: 'Courier New', monospace;">${registrationId}</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
          
          <!-- Instructions -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; font-size: 20px; color: #18181b; font-weight: 600;">
                ${config.qrCodeLabel}
              </h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${config.instructions.map(instruction => `
                  <tr>
                    <td style="padding: 12px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding-right: 15px; vertical-align: top; font-size: 24px;">
                            ${instruction.icon}
                          </td>
                          <td style="vertical-align: top;">
                            <p style="margin: 0; font-size: 15px; color: #52525b; line-height: 1.6;">
                              ${instruction.text}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${ctaUrl}" style="display: inline-block; padding: 16px 40px; background-color: ${config.ctaButton.color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3); transition: all 0.3s ease;">
                ${config.ctaButton.text}
              </a>
            </td>
          </tr>
          
          <!-- Help Text -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                  ${config.helpText}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td>
              ${getEmailFooter()}
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `
}
