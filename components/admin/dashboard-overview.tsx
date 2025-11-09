"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, Users, CreditCard, TrendingUp, DollarSign, RefreshCw } from "lucide-react"

interface DashboardStats {
  totalParticipants: number
  totalRevenue: number
  ticketsSold: {
    platinum: number
    gold: number
    silver: number
  }
  pendingPayments: number
  successfulPayments: number
  failedPayments: number
  recentRegistrations: Array<{
    id: string
    registrationId: string
    name: string
    email: string
    ticketType: string
    paymentStatus: string
    createdAt: string
  }>
  trends: {
    daily: Array<{
      date: string
      registrations: number
      revenue: number
    }>
    growthPercentage: number
  }
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError("")

      const adminEmail = localStorage.getItem("adminEmail")
      const adminPassword = localStorage.getItem("adminPassword")

      const response = await fetch("/api/admin/dashboard/stats", {
        headers: {
          "x-admin-email": adminEmail || "",
          "x-admin-password": adminPassword || "",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats")
      }

      setStats(data.stats)
    } catch (err: any) {
      console.error("❌ Error fetching dashboard stats:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground font-semibold">{label}</p>
        <Icon size={20} className={color || "text-primary"} />
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs flex items-center gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          <ArrowUpRight size={14} /> {change >= 0 ? "+" : ""}{change}% this week
        </p>
      )}
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Participants"
          value={stats.totalParticipants.toLocaleString()}
          change={stats.trends.growthPercentage}
          color="text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
          color="text-green-600"
        />
        <StatCard
          icon={CreditCard}
          label="Successful Payments"
          value={stats.successfulPayments}
          color="text-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Pending Payments"
          value={stats.pendingPayments}
          color="text-orange-600"
        />
      </div>

      {/* Ticket Distribution */}
      <Card className="p-6 border border-border mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Ticket Distribution</h2>
        <div className="space-y-4">
          {[
            { tier: "Platinum", count: stats.ticketsSold.platinum, color: "bg-purple-600" },
            { tier: "Gold", count: stats.ticketsSold.gold, color: "bg-yellow-600" },
            { tier: "Silver", count: stats.ticketsSold.silver, color: "bg-gray-400" },
          ].map((ticket) => (
            <div key={ticket.tier} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{ticket.tier}</span>
                <span className="text-muted-foreground">
                  {ticket.count} ({stats.totalParticipants > 0 ? ((ticket.count / stats.totalParticipants) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`${ticket.color} h-2 rounded-full transition-all`}
                  style={{
                    width: stats.totalParticipants > 0 ? `${(ticket.count / stats.totalParticipants) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Registrations */}
      <Card className="p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Registrations</h2>
        <div className="space-y-3">
          {stats.recentRegistrations.length > 0 ? (
            stats.recentRegistrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{reg.name}</p>
                  <p className="text-sm text-muted-foreground">{reg.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{reg.ticketType}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No registrations yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
