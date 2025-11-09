"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface TicketDetails {
  registrationId: string
  name: string
  email: string
  contactNo: string
  chapterName: string
  category: string
  ticketType: string
  paymentStatus: string
  ticketStatus: string
  spouseName?: string
  children?: Array<{ name: string; age: string }>
  participations?: string[]
  conclavGroups?: string[]
  createdAt: string
  updatedAt: string
}

export default function AdminScanTicketPage() {
  const [ticketId, setTicketId] = useState("")
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    if (adminEmail && adminPassword) {
      setIsAuthenticated(true)
      localStorage.setItem("adminEmail", adminEmail)
      localStorage.setItem("adminPassword", adminPassword)
    }
  }

  const scanTicket = async () => {
    if (!ticketId.trim()) {
      setError("Please enter a ticket ID")
      return
    }

    setLoading(true)
    setError("")
    setTicketDetails(null)

    try {
      const response = await fetch("/api/admin/scan-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || localStorage.getItem("adminEmail") || "",
          "x-admin-password": adminPassword || localStorage.getItem("adminPassword") || "",
        },
        body: JSON.stringify({ ticketId: ticketId.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan ticket")
      }

      setTicketDetails(data.ticket)
    } catch (err: any) {
      setError(err.message || "Failed to scan ticket")
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (status: "active" | "expired" | "used") => {
    if (!ticketDetails) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/expire-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || localStorage.getItem("adminEmail") || "",
          "x-admin-password": adminPassword || localStorage.getItem("adminPassword") || "",
        },
        body: JSON.stringify({ ticketId: ticketDetails.registrationId, status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update ticket status")
      }

      // Update local state
      setTicketDetails({ ...ticketDetails, ticketStatus: status })
      alert(`Ticket status updated to ${status}`)
    } catch (err: any) {
      setError(err.message || "Failed to update ticket status")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "expired":
        return "bg-red-100 text-red-800 border-red-300"
      case "used":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎫 Ticket Scanner
            </h1>
            <p className="text-center text-gray-600 mb-6">Scan QR code or enter Ticket ID manually</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="Enter Ticket ID (e.g., REG-123456)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                onKeyPress={(e) => e.key === "Enter" && scanTicket()}
              />
              <button
                onClick={scanTicket}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Scanning..." : "Scan"}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
          </div>

          {ticketDetails && (
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Ticket Details</h2>
                  <p className="text-gray-500">Registration ID: {ticketDetails.registrationId}</p>
                </div>
                <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${getStatusColor(ticketDetails.ticketStatus)}`}>
                  {ticketDetails.ticketStatus.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.email}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.contactNo}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Chapter</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.chapterName}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.category}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Ticket Type</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.ticketType}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <p className={`font-semibold ${ticketDetails.paymentStatus === "success" ? "text-green-600" : "text-yellow-600"}`}>
                    {ticketDetails.paymentStatus.toUpperCase()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Registration Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(ticketDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {ticketDetails.spouseName && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">Spouse Name</p>
                  <p className="font-semibold text-gray-800">{ticketDetails.spouseName}</p>
                </div>
              )}

              {ticketDetails.children && ticketDetails.children.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">Children</p>
                  {ticketDetails.children.map((child, idx) => (
                    <p key={idx} className="font-semibold text-gray-800">
                      {child.name} ({child.age})
                    </p>
                  ))}
                </div>
              )}

              {ticketDetails.participations && ticketDetails.participations.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">Participations</p>
                  <div className="flex flex-wrap gap-2">
                    {ticketDetails.participations.map((participation, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                        {participation}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Update Ticket Status</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateTicketStatus("active")}
                    disabled={loading || ticketDetails.ticketStatus === "active"}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Active
                  </button>
                  <button
                    onClick={() => updateTicketStatus("used")}
                    disabled={loading || ticketDetails.ticketStatus === "used"}
                    className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Used
                  </button>
                  <button
                    onClick={() => updateTicketStatus("expired")}
                    disabled={loading || ticketDetails.ticketStatus === "expired"}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Expired
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
