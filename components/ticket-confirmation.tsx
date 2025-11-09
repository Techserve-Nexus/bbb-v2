"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Mail, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"

interface TicketConfirmationProps {
  registrationId: string
  name: string
  email: string
  ticketType: string
  paymentRef: string
  qrCodeUrl: string
}

export default function TicketConfirmation({
  registrationId,
  name,
  email,
  ticketType,
  paymentRef,
  qrCodeUrl,
}: TicketConfirmationProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTicket = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(`/api/tickets/download?registrationId=${registrationId}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ticket-${registrationId}.html`
      a.click()
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const resendEmail = async () => {
    try {
      await fetch("/api/email/send-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          registrationId,
          name,
          ticketType,
          paymentRef,
          qrCodeUrl,
        }),
      })
      alert("Ticket email resent successfully!")
    } catch (error) {
      alert("Failed to resend email")
    }
  }

  return (
    <div className="bg-background rounded-lg border-2 border-primary p-8 max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle size={32} className="text-green-600" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registration Confirmed!</h2>
          <p className="text-muted-foreground">Your ticket has been generated</p>
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-muted/50 rounded-lg p-6 mb-6 border border-border">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1">Registration ID</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-mono font-bold text-foreground">{registrationId}</p>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-background rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={18} className="text-primary" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1">Ticket Type</p>
            <p className="text-lg font-bold text-foreground">{ticketType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1">Registrant Name</p>
            <p className="text-lg font-bold text-foreground">{name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1">Email</p>
            <p className="text-lg font-bold text-foreground">{email}</p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {qrCodeUrl && (
        <div className="bg-primary/5 rounded-lg p-6 mb-6 border border-primary/20 text-center">
          <p className="text-sm text-muted-foreground mb-4 font-semibold">Your QR Code for Check-in</p>
          <img src={qrCodeUrl || "/placeholder.svg"} alt="Ticket QR Code" className="w-48 h-48 mx-auto" />
          <p className="text-xs text-muted-foreground mt-4">Save or print this QR code to show at the venue</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 mb-6">
        <Button
          onClick={downloadTicket}
          disabled={isDownloading}
          className="w-full bg-primary hover:bg-secondary text-primary-foreground"
        >
          <Download size={18} className="mr-2" />
          {isDownloading ? "Downloading..." : "Download Ticket"}
        </Button>
        <Button onClick={resendEmail} className="w-full bg-secondary hover:bg-primary text-primary-foreground">
          <Mail size={18} className="mr-2" />
          Resend Ticket Email
        </Button>
      </div>

      {/* Important Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-yellow-900 mb-2">Important:</p>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Arrive 30 minutes before the event starts</li>
          <li>• Bring a valid ID for verification</li>
          <li>• Keep your QR code accessible</li>
          <li>• Contact us at info@chessevent.com for any queries</li>
        </ul>
      </div>

      {/* Back to Home */}
      <Link href="/" className="block">
        <Button className="w-full bg-muted text-foreground hover:bg-border">Back to Home</Button>
      </Link>

      {/* Confirmation Message */}
      {copied && (
        <p className="text-sm text-green-600 mt-4 text-center font-semibold">Registration ID copied to clipboard!</p>
      )}
    </div>
  )
}
