"use client"

import { use, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface TicketData {
  registrationId: string
  name: string
  email: string
  contactNo: string
  chapterName: string
  category: string
  ticketType: string
  paymentStatus: string
  paymentScreenshotUrl?: string
  spouseName?: string
  children?: number
  participations?: string[]
  conclavGroups?: string[]
  createdAt: string
  qrCode?: string
}

export default function TicketVerificationPage() {
  const params = useParams()
  const ticketId = params.ticketId as string
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (ticketId) {
      fetchTicketData()
    }
  }, [ticketId])

  const fetchTicketData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/verify/${ticketId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ticket not found")
      }

      const data = await response.json()
      setTicket(data.ticket)
    } catch (err: any) {
      setError(err.message || "Failed to load ticket")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-green-500" />
      case "failed":
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Verified"
      case "failed":
        return "Payment Failed"
      default:
        return "Pending Verification"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "failed":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading ticket information...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !ticket) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Ticket Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The ticket you're looking for doesn't exist or has been removed."}
            </p>
            <a 
              href="/" 
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Event Ticket Verification
            </h1>
            <p className="text-muted-foreground">Ticket ID: {ticket.registrationId}</p>
          </div>

          {/* Status Card */}
          <div className={`border-2 rounded-lg p-8 mb-8 text-center ${getStatusColor(ticket.paymentStatus)}`}>
            <div className="flex justify-center mb-4">
              {getStatusIcon(ticket.paymentStatus)}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {getStatusText(ticket.paymentStatus)}
            </h2>
            <p className="text-sm">
              {ticket.paymentStatus === "success" 
                ? "This ticket has been verified and is valid for entry"
                : ticket.paymentStatus === "failed"
                ? "Payment verification failed. Please contact support."
                : "Payment verification is pending. You will be notified once verified."}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
              <h3 className="text-2xl font-bold">Ticket Information</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Details */}
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Personal Details
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold text-foreground">{ticket.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{ticket.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <p className="font-semibold text-foreground">{ticket.contactNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chapter Name</p>
                    <p className="font-semibold text-foreground">{ticket.chapterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold text-foreground">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Type</p>
                    <p className="font-semibold text-foreground">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {ticket.ticketType}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(ticket.spouseName || ticket.children) && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Family Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {ticket.spouseName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Spouse Name</p>
                        <p className="font-semibold text-foreground">{ticket.spouseName}</p>
                      </div>
                    )}
                    {ticket.children !== undefined && ticket.children > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Number of Children</p>
                        <p className="font-semibold text-foreground">{ticket.children}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Participation Details */}
              {ticket.participations && ticket.participations.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Participations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.participations.map((participation, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {participation}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Date */}
              <div className="border-t pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-semibold text-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              {ticket.qrCode && (
                <div className="border-t pt-6 text-center">
                  <h4 className="text-lg font-semibold text-foreground mb-4">Ticket QR Code</h4>
                  <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                    <Image
                      src={ticket.qrCode}
                      alt="Ticket QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Show this QR code at the event entrance
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>For any queries, please contact event support</p>
            <p className="mt-2">Email: support@bbbevent.com</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
