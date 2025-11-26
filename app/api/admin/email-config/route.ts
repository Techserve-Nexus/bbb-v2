import { NextRequest, NextResponse } from "next/server"

function maskEmail(email?: string | null) {
  if (!email) return null
  const parts = email.split('@')
  if (parts.length !== 2) return '****'
  const local = parts[0]
  const domain = parts[1]
  const visible = local.length > 0 ? local[0] : '*'
  return `${visible}${'*'.repeat(Math.max(0, Math.min(6, local.length - 1)))}@${domain}`
}

export async function GET(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email')
  const adminPassword = req.headers.get('x-admin-password')

  if (
    !adminEmail ||
    !adminPassword ||
    adminEmail !== process.env.ADMIN_EMAIL ||
    adminPassword !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const port = parseInt(process.env.SMTP_PORT || '587')
  const hasAuth = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD)

  return NextResponse.json({
    host: process.env.SMTP_HOST || null,
    port,
    secure: port === 465,
    hasAuth,
    smtpUserMasked: maskEmail(process.env.SMTP_USER || null),
    emailService: process.env.EMAIL_SERVICE || null,
  })
}
