"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, Clock, Upload } from "lucide-react"

interface SponsorRequest {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  website: string
  description: string
  requestedAmount: number
  status: "pending" | "approved" | "rejected"
  approvedCategory?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export default function SponsorRequestsList() {
  const [requests, setRequests] = useState<SponsorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<SponsorRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Form state for approval
  const [approvalData, setApprovalData] = useState({
    category: "",
    logo: "",
    rejectionReason: "",
  })

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const params = new URLSearchParams()
      if (filterStatus !== "all") params.append("status", filterStatus)

      const response = await fetch(`/api/admin/sponsor-requests?${params}`, {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch requests")
      }

      setRequests(data.requests)
    } catch (err: any) {
      console.error("❌ Error fetching requests:", err)
      setError(err.message || "Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    if (!approvalData.category || !approvalData.logo) {
      alert("Please fill all required fields")
      return
    }

    try {
      setProcessing(true)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/sponsor-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({
          action: "approve",
          category: approvalData.category,
          logo: approvalData.logo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve request")
      }

      alert("✅ Sponsor request approved and sponsor created successfully!")
      setShowModal(false)
      setSelectedRequest(null)
      setApprovalData({ category: "", logo: "", rejectionReason: "" })
      fetchRequests()
    } catch (err: any) {
      console.error("❌ Error approving request:", err)
      alert(err.message || "Failed to approve request")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    if (!approvalData.rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    if (!confirm("Are you sure you want to reject this sponsor request?")) {
      return
    }

    try {
      setProcessing(true)

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch(`/api/admin/sponsor-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: approvalData.rejectionReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject request")
      }

      alert("❌ Sponsor request rejected")
      setShowModal(false)
      setSelectedRequest(null)
      setApprovalData({ category: "", logo: "", rejectionReason: "" })
      fetchRequests()
    } catch (err: any) {
      console.error("❌ Error rejecting request:", err)
      alert(err.message || "Failed to reject request")
    } finally {
      setProcessing(false)
    }
  }

  const openModal = (request: SponsorRequest) => {
    setSelectedRequest(request)
    setShowModal(true)
    setApprovalData({ category: "", logo: "", rejectionReason: "" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Sponsor Requests</h1>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">
                {requests.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {requests.filter((r) => r.status === "approved").length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <XCircle className="w-10 h-10 text-red-500" />
            <div>
              <p className="text-2xl font-bold">
                {requests.filter((r) => r.status === "rejected").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No sponsor requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{request.companyName}</p>
                        <p className="text-sm text-muted-foreground">{request.website}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-foreground">{request.contactPerson}</p>
                        <p className="text-xs text-muted-foreground">{request.email}</p>
                        <p className="text-xs text-muted-foreground">{request.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">
                        ₹{request.requestedAmount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                      {request.approvedCategory && (
                        <p className="text-xs text-muted-foreground mt-1">{request.approvedCategory}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => openModal(request)}
                        size="sm"
                        className="bg-primary hover:bg-secondary text-primary-foreground"
                      >
                        {request.status === "pending" ? "Review" : "View"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-primary text-primary-foreground p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold">Sponsor Request Details</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-bold mb-3">Company Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-semibold">{selectedRequest.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a
                      href={selectedRequest.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedRequest.website}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-semibold">{selectedRequest.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested Amount</p>
                    <p className="font-bold text-lg">₹{selectedRequest.requestedAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              {/* Status Info */}
              {selectedRequest.status !== "pending" && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Status: {selectedRequest.status.toUpperCase()}</p>
                  {selectedRequest.approvedCategory && (
                    <p className="text-sm">Category: {selectedRequest.approvedCategory}</p>
                  )}
                  {selectedRequest.rejectionReason && (
                    <p className="text-sm text-red-600">Reason: {selectedRequest.rejectionReason}</p>
                  )}
                </div>
              )}

              {/* Approval Form */}
              {selectedRequest.status === "pending" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-bold">Process Request</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Sponsor Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={approvalData.category}
                        onChange={(e) => setApprovalData({ ...approvalData, category: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      >
                        <option value="">Select Category</option>
                        <option value="Tamaram">Tamaram (₹25,000)</option>
                        <option value="Tamaram+">Tamaram+ (₹50,000)</option>
                        <option value="Rajatham">Rajatham (₹1,00,000)</option>
                        <option value="Suvarnam">Suvarnam (₹2,00,000)</option>
                        <option value="Vajram">Vajram (₹3,00,000)</option>
                        <option value="Pradhan_Poshak">Pradhan Poshak (₹5,00,000)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Logo URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={approvalData.logo}
                      onChange={(e) => setApprovalData({ ...approvalData, logo: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Rejection Reason (if rejecting)</label>
                    <textarea
                      value={approvalData.rejectionReason}
                      onChange={(e) => setApprovalData({ ...approvalData, rejectionReason: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg resize-none"
                      rows={3}
                      placeholder="Reason for rejection..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleApprove}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processing ? "Processing..." : "Approve & Create Sponsor"}
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={processing}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {processing ? "Processing..." : "Reject Request"}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setShowModal(false)
                  setSelectedRequest(null)
                }}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
