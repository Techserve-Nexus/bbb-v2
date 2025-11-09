"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Eye,
  X
} from "lucide-react"

interface Payment {
  id: string
  registrationId: string
  paymentMethod: "razorpay" | "manual"
  razorpayOrderId?: string
  razorpayPaymentId?: string | null
  paymentScreenshotUrl?: string | null
  upiId?: string
  transactionId?: string
  verifiedBy?: string
  verificationNotes?: string
  amount: number
  status: string
  createdAt: string
  updatedAt: string
  registration: {
    name: string
    email: string
    contactNo: string
    ticketType: string
    chapterName: string
    paymentScreenshotUrl: string | null
    paymentMethod?: "razorpay" | "manual"
  } | null
}

interface Stats {
  totalPayments: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  totalRevenue: number
  averagePayment: number
  byTicketType: {
    Platinum: number
    Gold: number
    Silver: number
  }
  revenueByTicketType: {
    Platinum: number
    Gold: number
    Silver: number
  }
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<Stats | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTicketType, setFilterTicketType] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Screenshot modal
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [page, filterStatus])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchPayments()
      } else {
        setPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch stats separately
  useEffect(() => {
    fetchStats()
  }, [filterStatus, filterTicketType, dateFrom, dateTo])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (searchTerm) params.append("search", searchTerm)
      if (filterStatus !== "all") params.append("status", filterStatus)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch payments")
      }

      setPayments(data.payments)
      setTotalPages(data.pagination.pages)
      setTotal(data.pagination.total)
    } catch (err: any) {
      console.error("❌ Error fetching payments:", err)
      setError(err.message || "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const params = new URLSearchParams()
      if (filterStatus !== "all") params.append("status", filterStatus)
      if (filterTicketType !== "all") params.append("ticketType", filterTicketType)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/admin/payments/reports?${params}`, {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (response.ok && data.stats) {
        setStats(data.stats)
      }
    } catch (err: any) {
      console.error("❌ Error fetching stats:", err)
    }
  }

  const handleExportReport = async () => {
    try {
      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const params = new URLSearchParams({ format: "csv" })
      if (filterStatus !== "all") params.append("status", filterStatus)
      if (filterTicketType !== "all") params.append("ticketType", filterTicketType)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/admin/payments/reports?${params}`, {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payment-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error("❌ Error exporting report:", err)
      alert("Failed to export report")
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <Button onClick={fetchPayments}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Total: {total} payments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { fetchPayments(); fetchStats(); }} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{(stats.totalRevenue / 100000).toFixed(2)}L
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Successful</p>
            <p className="text-2xl font-bold text-green-600">{stats.successfulPayments}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID, Order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
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
            <option value="all">All Tickets</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="From Date"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="To Date"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No payments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Registration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name/Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ticket</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">
                      {payment.registrationId}
                    </td>
                    <td className="px-4 py-3">
                      {payment.registration ? (
                        <>
                          <div className="text-sm font-medium">{payment.registration.name}</div>
                          <div className="text-xs text-muted-foreground">{payment.registration.email}</div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payment.registration?.ticketType || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (payment.registration?.paymentMethod || payment.paymentMethod) === "razorpay"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {((payment.registration?.paymentMethod || payment.paymentMethod) === "razorpay" ? "Razorpay" : "Manual")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {payment.registration?.paymentScreenshotUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedScreenshot(payment.registration!.paymentScreenshotUrl!)}
                            title="View Screenshot"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setSelectedScreenshot(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img 
              src={selectedScreenshot} 
              alt="Payment Screenshot" 
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}
