"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight, Mail, Trash2, CheckCircle, XCircle, Eye, Info } from "lucide-react"

interface Registration {
  id: string
  registrationId: string
  name: string
  email: string
  contactNo: string
  chapterName: string
  category: string
  ticketType: string
  paymentMethod?: "razorpay" | "manual"
  paymentStatus: string
  ticketStatus: string
  paymentScreenshotUrl?: string
  paymentId?: string
  paymentReference?: string
  spouseName?: string
  children?: Array<{ name: string; age: string }>
  participations?: string[]
  conclavGroups?: string[]
  qrCode?: string
  createdAt: string
  updatedAt: string
}

export default function RegistrationsList() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all")
  const [filterTicketType, setFilterTicketType] = useState("all")
  const [filterTicketStatus, setFilterTicketStatus] = useState("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)

  // Verification Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationData, setVerificationData] = useState({
    upiId: "",
    transactionId: "",
    verificationNotes: "",
  })
  
  // Screenshot Modal
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState("")

  // View Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsRegistration, setDetailsRegistration] = useState<Registration | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [page, limit, filterPaymentStatus, filterTicketType, filterTicketStatus])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchRegistrations()
      } else {
        setPage(1) // Reset to page 1 when searching
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (searchTerm) params.append("search", searchTerm)
      if (filterPaymentStatus !== "all") params.append("status", filterPaymentStatus)
      if (filterTicketType !== "all") params.append("ticketType", filterTicketType)
      if (filterTicketStatus !== "all") params.append("ticketStatus", filterTicketStatus)

      const response = await fetch(`/api/admin/registrations?${params}`, {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch registrations")
      }

      setRegistrations(data.registrations)
      setTotalPages(data.pagination.pages)
      setTotal(data.pagination.total)
    } catch (err: any) {
      console.error("❌ Error fetching registrations:", err)
      setError(err.message || "Failed to load registrations")
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/registrations/export", {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error("❌ Error exporting CSV:", err)
      alert("Failed to export CSV")
    }
  }

  const handleResendEmail = async (registrationId: string) => {
    if (!confirm("Are you sure you want to resend the ticket email with QR code?")) {
      return
    }

    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/registrations/${registrationId}/resend`, {
        method: "POST",
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend email")
      }

      alert("Ticket email with QR code resent successfully!")
    } catch (err: any) {
      console.error("❌ Error resending email:", err)
      alert(err.message || "Failed to resend email")
    }
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm("Are you sure you want to cancel this registration? This will mark it as expired.")) {
      return
    }

    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete registration")
      }

      alert("Registration cancelled successfully!")
      fetchRegistrations() // Refresh the list
    } catch (err: any) {
      console.error("❌ Error deleting registration:", err)
      alert(err.message || "Failed to delete registration")
    }
  }

  const handleVerifyPayment = async (action: "approve" | "reject") => {
    if (!selectedRegistration) return

    setVerifying(true)
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({
          registrationId: selectedRegistration.registrationId,
          status: action === "approve" ? "success" : "failed",
          upiId: verificationData.upiId,
          transactionId: verificationData.transactionId,
          verificationNotes: verificationData.verificationNotes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment")
      }

      alert(action === "approve" ? "Payment approved successfully!" : "Payment rejected!")
      setShowVerifyModal(false)
      setSelectedRegistration(null)
      setVerificationData({ upiId: "", transactionId: "", verificationNotes: "" })
      fetchRegistrations() // Refresh the list
    } catch (err: any) {
      console.error("❌ Error verifying payment:", err)
      alert(err.message || "Failed to verify payment")
    } finally {
      setVerifying(false)
    }
  }

  const openVerifyModal = (registration: Registration) => {
    setSelectedRegistration(registration)
    setShowVerifyModal(true)
  }

  const openScreenshot = (url: string) => {
    setScreenshotUrl(url)
    setShowScreenshot(true)
  }

  const openDetailsModal = (registration: Registration) => {
    setDetailsRegistration(registration)
    setShowDetailsModal(true)
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      active: "bg-blue-100 text-blue-800",
      expired: "bg-gray-100 text-gray-800",
      used: "bg-purple-100 text-purple-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <Button onClick={fetchRegistrations}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registrations</h1>
          <p className="text-muted-foreground">Total: {total} registrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRegistrations} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Payment Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Ticket Type Filter */}
          <select
            value={filterTicketType}
            onChange={(e) => setFilterTicketType(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Ticket Types</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
          </select>

          {/* Ticket Status Filter */}
          <select
            value={filterTicketStatus}
            onChange={(e) => setFilterTicketStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Ticket Status</option>
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
          </select>

          {/* Per Page Selector */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value))
              setPage(1) // Reset to first page
            }}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No registrations found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Chapter</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ticket</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ticket Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">
                      {reg.registrationId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{reg.name}</div>
                      <div className="text-xs text-muted-foreground">{reg.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{reg.contactNo}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{reg.chapterName}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{reg.ticketType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(reg.paymentStatus)}`}>
                        {reg.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(reg.ticketStatus)}`}>
                        {reg.ticketStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {/* View Details Button - Always visible */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(reg)}
                          title="View Full Details"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Info className="w-4 h-4" />
                        </Button>

                        {/* Show cross icon for failed/canceled payments */}
                        {reg.paymentStatus === "failed" && (
                          <div className="flex items-center gap-2 text-red-600" title="Payment Canceled/Failed">
                            <XCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Canceled</span>
                          </div>
                        )}
                        
                        {/* Verify Button - Only for pending manual payments */}
                        {reg.paymentStatus === "pending" && (reg.paymentMethod === "manual" || !reg.paymentMethod) && (
                          <>
                            {reg.paymentScreenshotUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openScreenshot(reg.paymentScreenshotUrl!)}
                                title="View Payment Screenshot"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openVerifyModal(reg)}
                              title="Verify Payment"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {/* Resend Email - Only for successful payments */}
                        {reg.paymentStatus === "success" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendEmail(reg.registrationId)}
                            title="Resend Ticket Email with QR Code"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Delete Button - Only for pending or successful registrations */}
                        {reg.paymentStatus !== "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRegistration(reg.registrationId)}
                            title="Cancel Registration"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages} (Total: {total})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Verification Modal */}
      {showVerifyModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Verify Payment</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Registration ID</p>
                <p className="font-semibold font-mono">{selectedRegistration.registrationId}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{selectedRegistration.name}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{selectedRegistration.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-semibold">{selectedRegistration.ticketType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Chapter</p>
                  <p className="font-semibold">{selectedRegistration.chapterName}</p>
                </div>
              </div>

              {selectedRegistration.paymentScreenshotUrl && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Payment Screenshot</p>
                  <img 
                    src={selectedRegistration.paymentScreenshotUrl} 
                    alt="Payment Screenshot" 
                    className="w-full h-auto rounded border cursor-pointer hover:opacity-90"
                    onClick={() => openScreenshot(selectedRegistration.paymentScreenshotUrl!)}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={verificationData.upiId}
                  onChange={(e) => setVerificationData({ ...verificationData, upiId: e.target.value })}
                  placeholder="e.g., user@upi"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={verificationData.transactionId}
                  onChange={(e) => setVerificationData({ ...verificationData, transactionId: e.target.value })}
                  placeholder="e.g., TXN123456789"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Verification Notes (Optional)</label>
                <textarea
                  value={verificationData.verificationNotes}
                  onChange={(e) => setVerificationData({ ...verificationData, verificationNotes: e.target.value })}
                  placeholder="Add any notes about this verification..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => handleVerifyPayment("approve")}
                disabled={verifying}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {verifying ? "Approving..." : "Approve Payment"}
              </Button>
              <Button
                onClick={() => handleVerifyPayment("reject")}
                disabled={verifying}
                variant="outline"
                className="flex-1 text-red-600 hover:bg-red-50 border-red-600"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {verifying ? "Rejecting..." : "Reject Payment"}
              </Button>
              <Button
                onClick={() => {
                  setShowVerifyModal(false)
                  setSelectedRegistration(null)
                  setVerificationData({ upiId: "", transactionId: "", verificationNotes: "" })
                }}
                disabled={verifying}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {showScreenshot && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setShowScreenshot(false)}
            >
              <XCircle className="w-6 h-6" />
            </Button>
            <img 
              src={screenshotUrl} 
              alt="Payment Screenshot" 
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsRegistration && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{detailsRegistration.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">Registration ID: {detailsRegistration.registrationId}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded"></div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{detailsRegistration.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{detailsRegistration.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium text-gray-900">{detailsRegistration.contactNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chapter Name</p>
                    <p className="font-medium text-gray-900">{detailsRegistration.chapterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{detailsRegistration.category}</p>
                  </div>
                  {detailsRegistration.spouseName && (
                    <div>
                      <p className="text-sm text-gray-500">Spouse Name</p>
                      <p className="font-medium text-gray-900">{detailsRegistration.spouseName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Children Information */}
              {detailsRegistration.children && detailsRegistration.children.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded"></div>
                    Children Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {detailsRegistration.children.map((child, index) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                        <span className="font-medium text-gray-900">{child.name}</span>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">Age: {child.age}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-600 rounded"></div>
                  Ticket Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Ticket Type</p>
                    <p className="font-medium text-gray-900">{detailsRegistration.ticketType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ticket Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailsRegistration.ticketStatus)}`}>
                      {detailsRegistration.ticketStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-600 rounded"></div>
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900 capitalize">{detailsRegistration.paymentMethod || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailsRegistration.paymentStatus)}`}>
                      {detailsRegistration.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  {detailsRegistration.paymentReference && (
                    <div>
                      <p className="text-sm text-gray-500">Payment Reference</p>
                      <p className="font-medium text-gray-900 text-xs break-all">{detailsRegistration.paymentReference}</p>
                    </div>
                  )}
                  {detailsRegistration.paymentScreenshotUrl && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-2">Payment Screenshot</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openScreenshot(detailsRegistration.paymentScreenshotUrl!)}
                        className="text-blue-600"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Screenshot
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Participations */}
              {detailsRegistration.participations && detailsRegistration.participations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-600 rounded"></div>
                    Participations
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {detailsRegistration.participations.map((participation, index) => (
                        <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                          {participation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conclav Groups */}
              {detailsRegistration.conclavGroups && detailsRegistration.conclavGroups.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded"></div>
                    Conclav Groups
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {detailsRegistration.conclavGroups.map((group, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              {detailsRegistration.qrCode && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-teal-600 rounded"></div>
                    QR Code
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                    <img 
                      src={detailsRegistration.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-600 rounded"></div>
                  Timestamps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium text-gray-900">{new Date(detailsRegistration.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="font-medium text-gray-900">{new Date(detailsRegistration.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg border-t flex justify-end">
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
